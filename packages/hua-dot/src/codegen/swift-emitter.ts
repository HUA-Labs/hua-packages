/**
 * Swift Emitter — generates SwiftUI ViewModifier code from DotIR.
 *
 * Output structure:
 *   1. Color hex extension (init(hex:))
 *   2. Collected color palette (Color.dotPrimary500, etc.)
 *   3. Style modifiers as View extensions (func dotCardBase() -> some View)
 */

import type { DotIR, IREdgeInsets, IRShadow, IRBorderRadius } from './ir';
import type { DotEmitter, CodegenTarget } from './emitter';

// ---------------------------------------------------------------------------
// Color utilities
// ---------------------------------------------------------------------------

/** Convert hex color + optional opacity to Swift Color expression */
function swiftColor(hex: string, opacity?: number): string {
  // Handle rgb/rgba strings
  const rgbMatch = hex.match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+))?\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    const h = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    const effectiveOpacity = opacity !== undefined ? opacity : a;
    if (effectiveOpacity < 1) {
      return `Color(hex: "${h}").opacity(${fmtNum(effectiveOpacity)})`;
    }
    return `Color(hex: "${h}")`;
  }

  // Hex string
  if (opacity !== undefined && opacity < 1) {
    return `Color(hex: "${hex}").opacity(${fmtNum(opacity)})`;
  }
  return `Color(hex: "${hex}")`;
}

/** Sanitize a style name for Swift function naming (camelCase) */
function swiftFuncName(name: string): string {
  return `dot${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

/** Format number: strip trailing zeros, keep reasonable precision */
function fmtNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return parseFloat(n.toFixed(4)).toString();
}

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------

const SWIFT_FONT_WEIGHT: Record<string, string> = {
  '100': '.ultraLight',
  '200': '.thin',
  '300': '.light',
  '400': '.regular',
  '500': '.medium',
  '600': '.semibold',
  '700': '.bold',
  '800': '.heavy',
  '900': '.black',
  'normal': '.regular',
  'bold': '.bold',
};

const SWIFT_TEXT_ALIGN: Record<string, string> = {
  'left': '.leading',
  'center': '.center',
  'right': '.trailing',
  'justify': '.leading', // no direct SwiftUI equivalent
};

// ---------------------------------------------------------------------------
// Modifier generation helpers
// ---------------------------------------------------------------------------

function emitPadding(p: IREdgeInsets, indent: string): string {
  const { top, right, bottom, left } = p;
  // Uniform
  if (top === right && right === bottom && bottom === left && top !== undefined) {
    return `${indent}.padding(${fmtNum(top)})`;
  }
  // Symmetric
  const isHSymmetric = left === right;
  const isVSymmetric = top === bottom;
  if (isHSymmetric && isVSymmetric && top !== undefined && left !== undefined) {
    return `${indent}.padding(.horizontal, ${fmtNum(left)})\n${indent}.padding(.vertical, ${fmtNum(top)})`;
  }
  // Per-edge
  const parts: string[] = [];
  if (top !== undefined) parts.push(`top: ${fmtNum(top)}`);
  if (left !== undefined) parts.push(`leading: ${fmtNum(left)}`);
  if (bottom !== undefined) parts.push(`bottom: ${fmtNum(bottom)}`);
  if (right !== undefined) parts.push(`trailing: ${fmtNum(right)}`);
  return `${indent}.padding(EdgeInsets(${parts.join(', ')}))`;
}

function emitFrame(ir: DotIR, indent: string): string[] {
  const lines: string[] = [];
  const s = ir.sizing;
  if (!s) return lines;

  const frameParts: string[] = [];

  if (s.expandWidth) {
    frameParts.push('maxWidth: .infinity');
  } else if (s.width !== undefined) {
    frameParts.push(`width: ${fmtNum(s.width)}`);
  }

  if (s.expandHeight) {
    frameParts.push('maxHeight: .infinity');
  } else if (s.height !== undefined) {
    frameParts.push(`height: ${fmtNum(s.height)}`);
  }

  if (s.minWidth !== undefined) frameParts.push(`minWidth: ${fmtNum(s.minWidth)}`);
  if (s.maxWidth !== undefined && !s.expandWidth) frameParts.push(`maxWidth: ${fmtNum(s.maxWidth)}`);
  if (s.minHeight !== undefined) frameParts.push(`minHeight: ${fmtNum(s.minHeight)}`);
  if (s.maxHeight !== undefined && !s.expandHeight) frameParts.push(`maxHeight: ${fmtNum(s.maxHeight)}`);

  if (frameParts.length > 0) {
    lines.push(`${indent}.frame(${frameParts.join(', ')})`);
  }

  return lines;
}

function emitTypography(ir: DotIR, indent: string): string[] {
  const lines: string[] = [];
  const t = ir.typography;
  if (!t) return lines;

  // Font
  if (t.fontSize !== undefined || t.fontWeight !== undefined) {
    const parts: string[] = [];
    if (t.fontSize !== undefined) parts.push(`size: ${fmtNum(t.fontSize)}`);
    if (t.fontWeight !== undefined) {
      const w = SWIFT_FONT_WEIGHT[t.fontWeight] ?? '.regular';
      parts.push(`weight: ${w}`);
    }
    lines.push(`${indent}.font(.system(${parts.join(', ')}))`);
  }

  // Font style (italic)
  if (t.fontStyle === 'italic') {
    lines.push(`${indent}.italic()`);
  }

  // Text alignment
  if (t.textAlign) {
    const align = SWIFT_TEXT_ALIGN[t.textAlign] ?? '.leading';
    lines.push(`${indent}.multilineTextAlignment(${align})`);
  }

  // Letter spacing
  if (t.letterSpacing !== undefined) {
    lines.push(`${indent}.tracking(${fmtNum(t.letterSpacing)})`);
  }

  // Line height (as lineSpacing — approximate)
  if (t.lineHeight !== undefined && t.lineHeight > 1) {
    // SwiftUI lineSpacing is additional spacing, not multiplier
    // Approximate: (multiplier - 1) * fontSize
    const fontSize = t.fontSize ?? 16;
    const spacing = (t.lineHeight - 1) * fontSize;
    if (spacing > 0) {
      lines.push(`${indent}.lineSpacing(${fmtNum(spacing)})`);
    }
  }

  // Text decoration
  if (t.textDecoration === 'underline') {
    lines.push(`${indent}.underline()`);
  } else if (t.textDecoration === 'line-through') {
    lines.push(`${indent}.strikethrough()`);
  }

  return lines;
}

function emitShadow(shadow: IRShadow, indent: string): string {
  const color = swiftColor(shadow.color, shadow.opacity);
  return `${indent}.shadow(color: ${color}, radius: ${fmtNum(shadow.blur / 2)}, x: ${fmtNum(shadow.offsetX)}, y: ${fmtNum(shadow.offsetY)})`;
}

function emitBorderRadius(radius: IRBorderRadius): string | undefined {
  const { topLeft, topRight, bottomLeft, bottomRight } = radius;
  // Uniform
  if (topLeft === topRight && topRight === bottomLeft && bottomLeft === bottomRight && topLeft !== undefined) {
    return fmtNum(topLeft);
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// SwiftEmitter
// ---------------------------------------------------------------------------

export class SwiftEmitter implements DotEmitter {
  readonly target: CodegenTarget = 'swift';
  private fragments: string[] = [];
  private collectedColors: Map<string, string> = new Map(); // hex → name

  emit(ir: DotIR): string {
    const funcName = swiftFuncName(ir.name);
    const lines: string[] = [];
    const indent = '            ';

    // Collect colors for palette
    this.collectColors(ir);

    // Build modifier chain
    lines.push(`    /// dot: "${ir.input}"`);
    lines.push(`    func ${funcName}() -> some View {`);
    lines.push('        self');

    // Padding
    if (ir.padding) {
      lines.push(emitPadding(ir.padding, indent));
    }

    // Frame (sizing)
    lines.push(...emitFrame(ir, indent));

    // Background color
    if (ir.colors?.background) {
      lines.push(`${indent}.background(${swiftColor(ir.colors.background)})`);
    }

    // Text color
    if (ir.colors?.text) {
      lines.push(`${indent}.foregroundColor(${swiftColor(ir.colors.text)})`);
    }

    // Typography
    lines.push(...emitTypography(ir, indent));

    // Border + radius
    if (ir.border) {
      const radius = ir.border.radius;
      const side = ir.border.side;
      const radiusStr = radius ? emitBorderRadius(radius) : undefined;

      if (radiusStr && side?.width) {
        // Border with radius: use overlay with RoundedRectangle
        const borderColor = side.color ? swiftColor(side.color) : 'Color.gray';
        lines.push(`${indent}.clipShape(RoundedRectangle(cornerRadius: ${radiusStr}))`);
        lines.push(`${indent}.overlay(RoundedRectangle(cornerRadius: ${radiusStr}).stroke(${borderColor}, lineWidth: ${fmtNum(side.width)}))`);
      } else if (radiusStr) {
        // Radius only
        lines.push(`${indent}.clipShape(RoundedRectangle(cornerRadius: ${radiusStr}))`);
      } else if (side?.width) {
        // Border only (no radius)
        const borderColor = side.color ? swiftColor(side.color) : 'Color.gray';
        lines.push(`${indent}.overlay(Rectangle().stroke(${borderColor}, lineWidth: ${fmtNum(side.width)}))`);
      }
    }

    // Shadow
    if (ir.shadows && ir.shadows.length > 0) {
      for (const shadow of ir.shadows) {
        lines.push(emitShadow(shadow, indent));
      }
    }

    // Opacity
    if (ir.opacity !== undefined) {
      lines.push(`${indent}.opacity(${fmtNum(ir.opacity)})`);
    }

    // Aspect ratio
    if (ir.aspectRatio !== undefined) {
      lines.push(`${indent}.aspectRatio(${fmtNum(ir.aspectRatio)}, contentMode: .fit)`);
    }

    // Z-index
    if (ir.zIndex !== undefined) {
      lines.push(`${indent}.zIndex(${fmtNum(ir.zIndex)})`);
    }

    // Transform: rotation
    if (ir.transform?.rotate !== undefined) {
      lines.push(`${indent}.rotationEffect(.degrees(${fmtNum(ir.transform.rotate)}))`);
    }

    // Transform: scale
    if (ir.transform?.scaleX !== undefined || ir.transform?.scaleY !== undefined) {
      const sx = ir.transform?.scaleX ?? 1;
      const sy = ir.transform?.scaleY ?? 1;
      if (sx === sy) {
        lines.push(`${indent}.scaleEffect(${fmtNum(sx)})`);
      } else {
        lines.push(`${indent}.scaleEffect(x: ${fmtNum(sx)}, y: ${fmtNum(sy)})`);
      }
    }

    // Transform: offset (translate)
    if (ir.transform?.translateX !== undefined || ir.transform?.translateY !== undefined) {
      const tx = ir.transform?.translateX ?? 0;
      const ty = ir.transform?.translateY ?? 0;
      lines.push(`${indent}.offset(x: ${fmtNum(tx)}, y: ${fmtNum(ty)})`);
    }

    lines.push('    }');

    const fragment = lines.join('\n');
    this.fragments.push(fragment);
    return fragment;
  }

  finalize(moduleName: string): string {
    const sections: string[] = [];

    // Header
    sections.push(`// ${moduleName}.swift — Generated by dot codegen`);
    sections.push('// Do not edit manually. Regenerate with: dot-codegen --target swift');
    sections.push('');
    sections.push('import SwiftUI');
    sections.push('');

    // Color hex extension
    sections.push(COLOR_HEX_EXTENSION);
    sections.push('');

    // Color palette (if any colors collected)
    if (this.collectedColors.size > 0) {
      sections.push('// MARK: - Color Palette');
      sections.push('');
      sections.push('extension Color {');
      for (const [hex, name] of this.collectedColors) {
        sections.push(`    static let ${name} = Color(hex: "${hex}")`);
      }
      sections.push('}');
      sections.push('');
    }

    // Style modifiers
    sections.push('// MARK: - Style Modifiers');
    sections.push('');
    sections.push('extension View {');
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
    // Skip non-hex colors and already known
    if (!hex.startsWith('#') || this.collectedColors.has(hex)) return;
    // Generate a name from hex: #2b6cd6 → dot2b6cd6
    const cleanHex = hex.replace('#', '');
    this.collectedColors.set(hex, `dot${cleanHex}`);
  }
}

// ---------------------------------------------------------------------------
// Color(hex:) extension — included in every generated file
// ---------------------------------------------------------------------------

const COLOR_HEX_EXTENSION = `// MARK: - Color Hex Extension

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}`;
