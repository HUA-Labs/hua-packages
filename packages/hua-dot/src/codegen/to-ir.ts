/**
 * StyleObject → DotIR conversion.
 *
 * Takes a finalized web StyleObject (output of dot(target: 'web'))
 * and converts it into the platform-neutral IR for code generation.
 */

import type { StyleObject } from '../types';
import type {
  DotIR,
  IREdgeInsets,
  IRColors,
  IRTypography,
  IRBorder,
  IRBorderSide,
  IRBorderRadius,
  IRShadow,
  IRLayout,
  IRSizing,
  IRPositioning,
  IRTransform,
  IRGradient,
  IRFlexChild,
} from './ir';
import { toAbsoluteNumber, parseShadowLayers, splitShadowLayers } from '../adapters/shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip !important suffix from a CSS value */
function stripImportant(val: string | number): string {
  if (typeof val === 'number') return String(val);
  return val.replace(/\s*!important\s*$/, '');
}

/** Parse a value to absolute number (px-equivalent), returning undefined for relative units */
function toNum(value: string | number, remBase = 16): number | undefined {
  return toAbsoluteNumber(stripImportant(value), remBase);
}

// ---------------------------------------------------------------------------
// Main conversion
// ---------------------------------------------------------------------------

export interface ToIROptions {
  remBase?: number;
}

/**
 * Convert a finalized StyleObject into a DotIR.
 *
 * @param name - The name for the generated style (e.g., "cardBase")
 * @param input - The original utility string
 * @param style - Finalized StyleObject from dot(target: 'web')
 */
export function toIR(name: string, input: string, style: StyleObject, options?: ToIROptions): DotIR {
  const remBase = options?.remBase ?? 16;
  const ir: DotIR = { name, input };

  // Lazy initializers
  let padding: IREdgeInsets | undefined;
  let margin: IREdgeInsets | undefined;
  let colors: IRColors | undefined;
  let typography: IRTypography | undefined;
  let borderSide: IRBorderSide | undefined;
  let borderRadius: IRBorderRadius | undefined;
  let shadows: IRShadow[] | undefined;
  let layout: IRLayout | undefined;
  let sizing: IRSizing | undefined;
  let positioning: IRPositioning | undefined;
  let transform: IRTransform | undefined;
  let gradient: IRGradient | undefined;
  let flexChild: IRFlexChild | undefined;

  for (const [key, rawValue] of Object.entries(style)) {
    const sv = stripImportant(rawValue);

    // ── Padding ──
    if (key === 'padding') {
      const n = toNum(rawValue, remBase);
      if (n !== undefined) {
        padding = { top: n, right: n, bottom: n, left: n };
      }
      continue;
    }
    if (key === 'paddingTop') { const n = toNum(rawValue, remBase); if (n !== undefined) (padding ??= {}).top = n; continue; }
    if (key === 'paddingRight') { const n = toNum(rawValue, remBase); if (n !== undefined) (padding ??= {}).right = n; continue; }
    if (key === 'paddingBottom') { const n = toNum(rawValue, remBase); if (n !== undefined) (padding ??= {}).bottom = n; continue; }
    if (key === 'paddingLeft') { const n = toNum(rawValue, remBase); if (n !== undefined) (padding ??= {}).left = n; continue; }

    // ── Margin ──
    if (key === 'margin') {
      const n = toNum(rawValue, remBase);
      if (n !== undefined) {
        margin = { top: n, right: n, bottom: n, left: n };
      }
      continue;
    }
    if (key === 'marginTop') { const n = toNum(rawValue, remBase); if (n !== undefined) (margin ??= {}).top = n; continue; }
    if (key === 'marginRight') { const n = toNum(rawValue, remBase); if (n !== undefined) (margin ??= {}).right = n; continue; }
    if (key === 'marginBottom') { const n = toNum(rawValue, remBase); if (n !== undefined) (margin ??= {}).bottom = n; continue; }
    if (key === 'marginLeft') { const n = toNum(rawValue, remBase); if (n !== undefined) (margin ??= {}).left = n; continue; }

    // ── Background color ──
    if (key === 'backgroundColor') {
      (colors ??= {}).background = sv;
      continue;
    }

    // ── Text color ──
    if (key === 'color') {
      (colors ??= {}).text = sv;
      continue;
    }

    // ── Border color ──
    if (key === 'borderColor') {
      (colors ??= {}).border = sv;
      (borderSide ??= {}).color = sv;
      continue;
    }

    // ── Typography ──
    if (key === 'fontSize') { const n = toNum(rawValue, remBase); if (n !== undefined) (typography ??= {}).fontSize = n; continue; }
    if (key === 'fontWeight') { (typography ??= {}).fontWeight = sv; continue; }
    if (key === 'fontFamily') { (typography ??= {}).fontFamily = sv; continue; }
    if (key === 'letterSpacing') { const n = toNum(rawValue, remBase); if (n !== undefined) (typography ??= {}).letterSpacing = n; continue; }
    if (key === 'lineHeight') {
      const n = parseFloat(sv);
      if (!isNaN(n)) (typography ??= {}).lineHeight = n;
      continue;
    }
    if (key === 'textAlign') { (typography ??= {}).textAlign = sv; continue; }
    if (key === 'textDecorationLine') { (typography ??= {}).textDecoration = sv; continue; }
    if (key === 'fontStyle') { (typography ??= {}).fontStyle = sv; continue; }

    // ── Border width ──
    if (key === 'borderWidth' || key === 'borderTopWidth' || key === 'borderRightWidth'
      || key === 'borderBottomWidth' || key === 'borderLeftWidth') {
      const n = toNum(rawValue, remBase);
      if (n !== undefined) (borderSide ??= {}).width = n;
      continue;
    }
    if (key === 'borderStyle') {
      (borderSide ??= {}).style = sv;
      continue;
    }

    // ── Border radius ──
    if (key === 'borderRadius') {
      const n = toNum(rawValue, remBase);
      if (n !== undefined) {
        borderRadius = { topLeft: n, topRight: n, bottomLeft: n, bottomRight: n };
      }
      continue;
    }
    if (key === 'borderTopLeftRadius') { const n = toNum(rawValue, remBase); if (n !== undefined) (borderRadius ??= {}).topLeft = n; continue; }
    if (key === 'borderTopRightRadius') { const n = toNum(rawValue, remBase); if (n !== undefined) (borderRadius ??= {}).topRight = n; continue; }
    if (key === 'borderBottomLeftRadius') { const n = toNum(rawValue, remBase); if (n !== undefined) (borderRadius ??= {}).bottomLeft = n; continue; }
    if (key === 'borderBottomRightRadius') { const n = toNum(rawValue, remBase); if (n !== undefined) (borderRadius ??= {}).bottomRight = n; continue; }

    // ── Box shadow ──
    if (key === 'boxShadow' && typeof rawValue === 'string') {
      const layers = parseShadowLayers(stripImportant(rawValue));
      if (layers.length > 0) {
        shadows = layers
          .filter(l => !l.inset) // Native platforms don't support inset
          .map(l => ({
            color: l.color,
            opacity: l.opacity,
            offsetX: l.offsetX,
            offsetY: l.offsetY,
            blur: l.blur,
            spread: l.spread,
          }));
      }
      continue;
    }

    // ── Layout ──
    if (key === 'display') {
      if (sv === 'flex' || sv === 'inline-flex') {
        (layout ??= {}).display = 'flex';
      } else if (sv === 'grid') {
        (layout ??= {}).display = 'grid';
      } else if (sv === 'none') {
        (layout ??= {}).display = 'none';
      }
      continue;
    }
    if (key === 'flexDirection') {
      (layout ??= {}).direction = sv === 'row' || sv === 'row-reverse' ? 'row' : 'column';
      continue;
    }
    if (key === 'justifyContent') { (layout ??= {}).justifyContent = sv; continue; }
    if (key === 'alignItems') { (layout ??= {}).alignItems = sv; continue; }
    if (key === 'flexWrap') {
      if (sv === 'wrap' || sv === 'wrap-reverse') (layout ??= {}).wrap = true;
      continue;
    }
    if (key === 'gap') { const n = toNum(rawValue, remBase); if (n !== undefined) (layout ??= {}).gap = n; continue; }
    if (key === 'rowGap') { const n = toNum(rawValue, remBase); if (n !== undefined) (layout ??= {}).rowGap = n; continue; }
    if (key === 'columnGap') { const n = toNum(rawValue, remBase); if (n !== undefined) (layout ??= {}).columnGap = n; continue; }

    // ── Flex child ──
    if (key === 'flex') {
      const n = parseFloat(sv);
      if (!isNaN(n)) (flexChild ??= {}).flex = n;
      continue;
    }
    if (key === 'flexGrow') {
      const n = parseFloat(sv);
      if (!isNaN(n)) (flexChild ??= {}).flexGrow = n;
      continue;
    }
    if (key === 'flexShrink') {
      const n = parseFloat(sv);
      if (!isNaN(n)) (flexChild ??= {}).flexShrink = n;
      continue;
    }
    if (key === 'order') {
      const n = parseInt(sv, 10);
      if (!isNaN(n)) (flexChild ??= {}).order = n;
      continue;
    }

    // ── Sizing ──
    if (key === 'width') {
      if (sv === '100%') { (sizing ??= {}).expandWidth = true; }
      else { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).width = n; }
      continue;
    }
    if (key === 'height') {
      if (sv === '100%') { (sizing ??= {}).expandHeight = true; }
      else { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).height = n; }
      continue;
    }
    if (key === 'minWidth') { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).minWidth = n; continue; }
    if (key === 'maxWidth') { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).maxWidth = n; continue; }
    if (key === 'minHeight') { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).minHeight = n; continue; }
    if (key === 'maxHeight') { const n = toNum(rawValue, remBase); if (n !== undefined) (sizing ??= {}).maxHeight = n; continue; }

    // ── Positioning ──
    if (key === 'position') {
      (positioning ??= {}).type = sv === 'absolute' || sv === 'fixed' ? 'absolute' : 'relative';
      continue;
    }
    if (key === 'top') { const n = toNum(rawValue, remBase); if (n !== undefined) (positioning ??= {}).top = n; continue; }
    if (key === 'right') { const n = toNum(rawValue, remBase); if (n !== undefined) (positioning ??= {}).right = n; continue; }
    if (key === 'bottom') { const n = toNum(rawValue, remBase); if (n !== undefined) (positioning ??= {}).bottom = n; continue; }
    if (key === 'left') { const n = toNum(rawValue, remBase); if (n !== undefined) (positioning ??= {}).left = n; continue; }

    // ── Transform ──
    if (key === 'transform' && typeof rawValue === 'string') {
      const t: IRTransform = {};
      const re = /(\w+)\(([^)]+)\)/g;
      let match;
      while ((match = re.exec(sv)) !== null) {
        const fn = match[1];
        const raw = match[2].trim();
        const val = parseFloat(raw);
        if (isNaN(val)) continue;
        switch (fn) {
          case 'rotate': t.rotate = val; break;
          case 'scaleX': t.scaleX = val; break;
          case 'scaleY': t.scaleY = val; break;
          case 'scale': t.scaleX = val; t.scaleY = val; break;
          case 'translateX': t.translateX = toNum(raw, remBase) ?? val; break;
          case 'translateY': t.translateY = toNum(raw, remBase) ?? val; break;
        }
      }
      if (Object.keys(t).length > 0) transform = t;
      continue;
    }

    // ── Opacity ──
    if (key === 'opacity') {
      const n = typeof rawValue === 'number' ? rawValue : parseFloat(sv);
      if (!isNaN(n)) ir.opacity = n;
      continue;
    }

    // ── Visibility ──
    if (key === 'visibility') {
      ir.visible = sv !== 'hidden';
      continue;
    }

    // ── Aspect ratio ──
    if (key === 'aspectRatio') {
      if (sv.includes('/')) {
        const [w, h] = sv.split('/').map(p => parseFloat(p.trim()));
        if (w && h && isFinite(w / h)) ir.aspectRatio = w / h;
      } else {
        const n = parseFloat(sv);
        if (!isNaN(n)) ir.aspectRatio = n;
      }
      continue;
    }

    // ── Z-index ──
    if (key === 'zIndex') {
      const n = typeof rawValue === 'number' ? rawValue : parseInt(sv, 10);
      if (!isNaN(n)) ir.zIndex = n;
      continue;
    }

    // ── Background gradient ──
    if (key === 'backgroundImage' && sv.startsWith('linear-gradient(')) {
      const inner = sv.slice('linear-gradient('.length, -1);
      const parts = splitShadowLayers(inner);
      if (parts.length >= 2) {
        const direction = parts[0];
        const stops: Array<{ color: string; position?: number }> = [];
        for (const cp of parts.slice(1)) {
          const spaceIdx = cp.lastIndexOf(' ');
          if (spaceIdx !== -1 && cp.slice(spaceIdx + 1).endsWith('%')) {
            stops.push({
              color: cp.slice(0, spaceIdx),
              position: parseFloat(cp.slice(spaceIdx + 1)) / 100,
            });
          } else {
            stops.push({ color: cp });
          }
        }
        if (stops.length > 0) {
          gradient = { type: 'linear', direction, stops };
        }
      }
      continue;
    }
  }

  // Assign structured properties
  if (padding) ir.padding = padding;
  if (margin) ir.margin = margin;
  if (colors) ir.colors = colors;
  if (typography) ir.typography = typography;
  if (borderSide || borderRadius) {
    const border: IRBorder = {};
    if (borderSide) border.side = borderSide;
    if (borderRadius) border.radius = borderRadius;
    ir.border = border;
  }
  if (shadows && shadows.length > 0) ir.shadows = shadows;
  if (layout) ir.layout = layout;
  if (sizing) ir.sizing = sizing;
  if (positioning) ir.positioning = positioning;
  if (transform) ir.transform = transform;
  if (gradient) ir.gradient = gradient;
  if (flexChild) ir.flexChild = flexChild;

  return ir;
}
