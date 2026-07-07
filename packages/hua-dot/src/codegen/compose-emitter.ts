/**
 * Compose Emitter — generates Jetpack Compose Modifier code from DotIR.
 *
 * Output structure:
 *   1. Package declaration + imports
 *   2. Color palette object (DotColors)
 *   3. Style modifier extension functions (Modifier.dotCardBase())
 */

import type { DotIR, IREdgeInsets, IRShadow, IRBorderRadius } from './ir';
import type { DotEmitter, CodegenTarget } from './emitter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format number: strip trailing zeros */
function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

/** Format as Compose dp literal */
function dp(n: number): string {
  return `${fmtNum(n)}.dp`;
}

/** Convert hex color to Compose Color() expression */
function composeColor(hex: string, opacity?: number): string {
  // Handle rgb/rgba strings
  const rgbMatch = hex.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    const h = `0xFF${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const effectiveOpacity = opacity !== undefined ? opacity : a;
    if (effectiveOpacity < 1) {
      return `Color(${h}).copy(alpha = ${fmtNum(effectiveOpacity)}f)`;
    }
    return `Color(${h})`;
  }

  // Hex string — convert to 0xAARRGGBB format
  const clean = hex.replace('#', '');
  const argb = `0xFF${clean}`;

  if (opacity !== undefined && opacity < 1) {
    return `Color(${argb}).copy(alpha = ${fmtNum(opacity)}f)`;
  }
  return `Color(${argb})`;
}

/** Sanitize a style name for Kotlin function naming (camelCase) */
function kotlinFuncName(name: string): string {
  return `dot${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Modifier generation helpers
// ---------------------------------------------------------------------------

function emitPadding(p: IREdgeInsets, indent: string): string {
  const { top, right, bottom, left } = p;
  // Uniform
  if (top === right && right === bottom && bottom === left && top !== undefined) {
    return `${indent}.padding(${dp(top)})`;
  }
  // Per-edge
  const parts: string[] = [];
  if (top !== undefined) parts.push(`top = ${dp(top)}`);
  if (bottom !== undefined) parts.push(`bottom = ${dp(bottom)}`);
  if (left !== undefined) parts.push(`start = ${dp(left)}`);
  if (right !== undefined) parts.push(`end = ${dp(right)}`);
  return `${indent}.padding(${parts.join(', ')})`;
}

function emitSize(ir: DotIR, indent: string): string[] {
  const lines: string[] = [];
  const s = ir.sizing;
  if (!s) return lines;

  // Fixed dimensions
  if (s.width !== undefined || s.height !== undefined) {
    const parts: string[] = [];
    if (s.width !== undefined) parts.push(`width = ${dp(s.width)}`);
    if (s.height !== undefined) parts.push(`height = ${dp(s.height)}`);
    lines.push(`${indent}.size(${parts.join(', ')})`);
  }

  // Expand width/height
  if (s.expandWidth) {
    lines.push(`${indent}.fillMaxWidth()`);
  }
  if (s.expandHeight) {
    lines.push(`${indent}.fillMaxHeight()`);
  }

  // Constraints
  if (s.minWidth !== undefined) lines.push(`${indent}.widthIn(min = ${dp(s.minWidth)})`);
  if (s.maxWidth !== undefined && !s.expandWidth) lines.push(`${indent}.widthIn(max = ${dp(s.maxWidth)})`);
  if (s.minHeight !== undefined) lines.push(`${indent}.heightIn(min = ${dp(s.minHeight)})`);
  if (s.maxHeight !== undefined && !s.expandHeight) lines.push(`${indent}.heightIn(max = ${dp(s.maxHeight)})`);

  return lines;
}

function emitBorderRadius(radius: IRBorderRadius): string | undefined {
  const { topLeft, topRight, bottomLeft, bottomRight } = radius;
  // Uniform
  if (topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight && topLeft !== undefined) {
    if (topLeft >= 9999) return 'CircleShape';
    return `RoundedCornerShape(${dp(topLeft)})`;
  }
  // Per-corner
  const parts: string[] = [];
  if (topLeft !== undefined) parts.push(`topStart = ${dp(topLeft)}`);
  if (topRight !== undefined) parts.push(`topEnd = ${dp(topRight)}`);
  if (bottomLeft !== undefined) parts.push(`bottomStart = ${dp(bottomLeft)}`);
  if (bottomRight !== undefined) parts.push(`bottomEnd = ${dp(bottomRight)}`);
  return `RoundedCornerShape(${parts.join(', ')})`;
}

function emitShadow(shadow: IRShadow, indent: string): string {
  const color = composeColor(shadow.color, shadow.opacity);
  const elevation = Math.max(1, Math.round(shadow.blur / 2));
  return `${indent}.shadow(elevation = ${dp(elevation)}, shape = RoundedCornerShape(0.dp), ambientColor = ${color}, spotColor = ${color})`;
}

// ---------------------------------------------------------------------------
// ComposeEmitter
// ---------------------------------------------------------------------------

export class ComposeEmitter implements DotEmitter {
  readonly target: CodegenTarget = 'compose';
  private fragments: string[] = [];
  private collectedColors: Map<string, string> = new Map(); // hex → name

  emit(ir: DotIR): string {
    const funcName = kotlinFuncName(ir.name);
    const lines: string[] = [];
    const indent = '        ';

    // Collect colors
    this.collectColors(ir);

    // Build modifier chain
    lines.push(`    /** dot: "${ir.input}" */`);
    lines.push(`    fun Modifier.${funcName}(): Modifier = this`);

    // Padding
    if (ir.padding) {
      lines.push(emitPadding(ir.padding, indent));
    }

    // Size
    lines.push(...emitSize(ir, indent));

    // Background + border radius
    const hasRadius = ir.border?.radius;
    const radiusStr = hasRadius ? emitBorderRadius(hasRadius) : undefined;

    if (ir.colors?.background) {
      const bgColor = composeColor(ir.colors.background);
      if (radiusStr) {
        lines.push(`${indent}.background(${bgColor}, ${radiusStr})`);
      } else {
        lines.push(`${indent}.background(${bgColor})`);
      }
    }

    // Border
    if (ir.border?.side?.width) {
      const borderColor = ir.border.side.color
        ? composeColor(ir.border.side.color)
        : 'Color.Gray';
      const shape = radiusStr ?? 'RectangleShape';
      lines.push(`${indent}.border(${dp(ir.border.side.width)}, ${borderColor}, ${shape})`);
    }

    // Clip shape (without border, just radius)
    if (radiusStr && !ir.colors?.background && !ir.border?.side?.width) {
      lines.push(`${indent}.clip(${radiusStr})`);
    }

    // Shadow
    if (ir.shadows && ir.shadows.length > 0) {
      // Use the first shadow for Compose (primary shadow)
      lines.push(emitShadow(ir.shadows[0], indent));
    }

    // Opacity
    if (ir.opacity !== undefined) {
      lines.push(`${indent}.alpha(${fmtNum(ir.opacity)}f)`);
    }

    // Aspect ratio
    if (ir.aspectRatio !== undefined) {
      lines.push(`${indent}.aspectRatio(${fmtNum(ir.aspectRatio)}f)`);
    }

    // Z-index
    if (ir.zIndex !== undefined) {
      lines.push(`${indent}.zIndex(${fmtNum(ir.zIndex)}f)`);
    }

    // Transform: rotation
    if (ir.transform?.rotate !== undefined) {
      lines.push(`${indent}.rotate(${fmtNum(ir.transform.rotate)}f)`);
    }

    // Transform: scale
    if (ir.transform?.scaleX !== undefined || ir.transform?.scaleY !== undefined) {
      const sx = ir.transform?.scaleX ?? 1;
      const sy = ir.transform?.scaleY ?? 1;
      if (sx === sy) {
        lines.push(`${indent}.scale(${fmtNum(sx)}f)`);
      } else {
        lines.push(`${indent}.scale(scaleX = ${fmtNum(sx)}f, scaleY = ${fmtNum(sy)}f)`);
      }
    }

    // Transform: offset (translate)
    if (ir.transform?.translateX !== undefined || ir.transform?.translateY !== undefined) {
      const tx = ir.transform?.translateX ?? 0;
      const ty = ir.transform?.translateY ?? 0;
      lines.push(`${indent}.offset(x = ${dp(tx)}, y = ${dp(ty)})`);
    }

    const fragment = lines.join('\n');
    this.fragments.push(fragment);
    return fragment;
  }

  finalize(moduleName: string): string {
    const sections: string[] = [];

    // Header
    sections.push(`// ${moduleName}.kt — Generated by dot codegen`);
    sections.push('// Do not edit manually. Regenerate with: dot-codegen --target compose');
    sections.push('');
    sections.push('package com.hualabs.dot.generated');
    sections.push('');

    // Imports
    sections.push('import androidx.compose.foundation.background');
    sections.push('import androidx.compose.foundation.border');
    sections.push('import androidx.compose.foundation.layout.*');
    sections.push('import androidx.compose.foundation.shape.CircleShape');
    sections.push('import androidx.compose.foundation.shape.RoundedCornerShape');
    sections.push('import androidx.compose.runtime.Composable');
    sections.push('import androidx.compose.ui.Modifier');
    sections.push('import androidx.compose.ui.draw.alpha');
    sections.push('import androidx.compose.ui.draw.clip');
    sections.push('import androidx.compose.ui.draw.rotate');
    sections.push('import androidx.compose.ui.draw.scale');
    sections.push('import androidx.compose.ui.draw.shadow');
    sections.push('import androidx.compose.ui.graphics.Color');
    sections.push('import androidx.compose.ui.graphics.RectangleShape');
    sections.push('import androidx.compose.ui.unit.dp');
    sections.push('import androidx.compose.ui.unit.sp');
    sections.push('import androidx.compose.ui.zIndex');
    sections.push('');

    // Color palette
    if (this.collectedColors.size > 0) {
      sections.push('/** Color palette generated from dot utility styles */');
      sections.push('object DotColors {');
      for (const [hex, name] of this.collectedColors) {
        const clean = hex.replace('#', '');
        sections.push(`    val ${name} = Color(0xFF${clean})`);
      }
      sections.push('}');
      sections.push('');
    }

    // Style modifiers
    sections.push('/** Style modifiers generated from dot utility strings */');
    sections.push(`object ${moduleName} {`);
    sections.push(this.fragments.join('\n\n'));
    sections.push('}');
    sections.push('');

    return sections.join('\n');
  }

  // ── Internal ──

  private collectColors(ir: DotIR): void {
    if (ir.colors?.background) this.addColor(ir.colors.background);
    if (ir.colors?.text) this.addColor(ir.colors.text);
    if (ir.colors?.border) this.addColor(ir.colors.border);
    if (ir.border?.side?.color) this.addColor(ir.border.side.color);
    if (ir.shadows) {
      for (const s of ir.shadows) this.addColor(s.color);
    }
  }

  private addColor(hex: string): void {
    if (!hex.startsWith('#') || this.collectedColors.has(hex)) return;
    const cleanHex = hex.replace('#', '');
    this.collectedColors.set(hex, `dot${cleanHex}`);
  }
}
