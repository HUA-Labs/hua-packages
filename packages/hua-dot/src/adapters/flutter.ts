import type { StyleObject } from '../types';
import type {
  FlutterRecipe,
  FlutterDecoration,
  FlutterEdgeInsets,
  FlutterConstraints,
  FlutterLayout,
  FlutterFlexChild,
  FlutterPositioning,
  FlutterTextStyle,
  FlutterTransform,
  FlutterBoxShadow,
} from './flutter-types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Units that represent relative/viewport values — cannot be converted to a static pixel number */
const RELATIVE_UNIT_RE = /(%|vh|vw|vmin|vmax|svh|dvh|lvh|svw|dvw|lvw)$/;

/** Parse a CSS value to a number (strip px, rem, em). Returns undefined if not numeric or relative. */
function toNumber(value: string | number, remBase = 16): number | undefined {
  if (typeof value === 'number') return value;
  const s = String(value).trim();
  // Reject relative/viewport units — they can't map to static Flutter pixels
  if (RELATIVE_UNIT_RE.test(s)) return undefined;
  if (s.endsWith('px')) return parseFloat(s);
  if (s.endsWith('rem') || s.endsWith('em')) return parseFloat(s) * remBase;
  const num = parseFloat(s);
  return isNaN(num) ? undefined : num;
}

/** Check if a CSS value is a percentage fill value (e.g. 100%) */
function isFullPercent(value: string | number): boolean {
  if (typeof value === 'number') return false;
  const s = String(value).trim();
  return s === '100%';
}

/** Check if a CSS value is a viewport unit (e.g. 100vh, 100vw) */
function isViewportUnit(value: string | number): boolean {
  if (typeof value === 'number') return false;
  return /^\d+(\.\d+)?(vh|vw|vmin|vmax|svh|dvh|lvh|svw|dvw|lvw)$/.test(String(value).trim());
}

/** Parse deg to radians */
function degToRad(value: string): number {
  const deg = parseFloat(value);
  return (deg * Math.PI) / 180;
}

/** Parse a CSS box-shadow string into FlutterBoxShadow entries */
function parseBoxShadowForFlutter(str: string): FlutterBoxShadow[] {
  if (!str || str === 'none') return [];

  const results: FlutterBoxShadow[] = [];

  // Split on comma respecting parentheses
  const layers: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    else if (str[i] === ',' && depth === 0) {
      layers.push(str.slice(start, i).trim());
      start = i + 1;
    }
  }
  layers.push(str.slice(start).trim());

  for (const layer of layers) {
    const trimmed = layer.replace(/ !important$/, '').trim();
    if (trimmed.startsWith('inset') || !trimmed) continue;

    // Extract color (rgb/rgba/hex at end)
    let color = '#000000';
    let rest = trimmed;

    const rgbMatch = rest.match(/rgba?\([^)]+\)\s*$/);
    if (rgbMatch) {
      color = rgbMatch[0].trim();
      rest = rest.slice(0, rgbMatch.index).trim();
    } else {
      const hexMatch = rest.match(/#[0-9a-fA-F]{3,8}\s*$/);
      if (hexMatch) {
        color = hexMatch[0].trim();
        rest = rest.slice(0, hexMatch.index).trim();
      }
    }

    const parts = rest.split(/\s+/).map((p) => parseFloat(p));
    results.push({
      color,
      offset: { dx: parts[0] || 0, dy: parts[1] || 0 },
      blurRadius: parts[2] || 0,
      spreadRadius: parts[3] || 0,
    });
  }

  return results;
}

/** Flutter web font weight mapping */
const FONT_WEIGHT_MAP: Record<string, string> = {
  '100': 'w100', '200': 'w200', '300': 'w300', '400': 'w400',
  '500': 'w500', '600': 'w600', '700': 'w700', '800': 'w800', '900': 'w900',
  'normal': 'w400', 'bold': 'w700',
};

/** CSS text-decoration-line → Flutter TextDecoration */
const TEXT_DECORATION_MAP: Record<string, string> = {
  'underline': 'underline',
  'overline': 'overline',
  'line-through': 'lineThrough',
  'none': 'none',
};

/** CSS justify-content → Flutter MainAxisAlignment */
const MAIN_AXIS_MAP: Record<string, string> = {
  'flex-start': 'start', 'start': 'start',
  'flex-end': 'end', 'end': 'end',
  'center': 'center',
  'space-between': 'spaceBetween',
  'space-around': 'spaceAround',
  'space-evenly': 'spaceEvenly',
};

/** CSS align-items → Flutter CrossAxisAlignment */
const CROSS_AXIS_MAP: Record<string, string> = {
  'flex-start': 'start', 'start': 'start',
  'flex-end': 'end', 'end': 'end',
  'center': 'center',
  'stretch': 'stretch',
  'baseline': 'baseline',
};

// ---------------------------------------------------------------------------
// Properties to skip (unsupported on Flutter via flat style)
// ---------------------------------------------------------------------------
const FLUTTER_SKIP = new Set([
  'transition', 'transitionProperty', 'transitionDuration',
  'transitionTimingFunction', 'transitionDelay',
  'animation', 'animationName', 'animationDuration',
  'animationTimingFunction', 'animationDelay',
  'animationIterationCount', 'animationFillMode',
  'cursor', 'userSelect', 'resize', 'pointerEvents',
  'whiteSpace', 'textOverflow', 'WebkitBoxOrient',
  'filter', 'backdropFilter', 'mixBlendMode',
  'gridTemplateColumns', 'gridTemplateRows',
  'gridColumn', 'gridRow', 'gridColumnStart', 'gridColumnEnd',
  'gridRowStart', 'gridRowEnd', 'gridAutoColumns', 'gridAutoRows',
  'clip', 'outlineOffset',
  'touchAction',
]);

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
export interface AdaptFlutterOptions {
  remBase?: number;
}

// ---------------------------------------------------------------------------
// Main adapter
// ---------------------------------------------------------------------------

/**
 * Convert a web CSS style object into a FlutterRecipe.
 *
 * The recipe is a structured object that maps to Flutter widget composition.
 * It is NOT a flat style object — each section maps to a specific Flutter widget.
 */
export function adaptFlutter(webStyle: StyleObject, options?: AdaptFlutterOptions): FlutterRecipe {
  const remBase = options?.remBase ?? 16;
  const recipe: FlutterRecipe = {};
  const dropped: string[] = [];

  // Lazy-init helpers
  const ensureDecoration = (): FlutterDecoration => recipe.decoration ??= {};
  const ensurePadding = (): FlutterEdgeInsets => recipe.padding ??= {};
  const ensureMargin = (): FlutterEdgeInsets => recipe.margin ??= {};
  const ensureConstraints = (): FlutterConstraints => recipe.constraints ??= {};
  const ensureLayout = (): FlutterLayout => recipe.layout ??= {};
  const ensureFlexChild = (): FlutterFlexChild => recipe.flexChild ??= {};
  const ensurePositioning = (): FlutterPositioning => recipe.positioning ??= {};
  const ensureTextStyle = (): FlutterTextStyle => recipe.textStyle ??= {};
  const ensureTransform = (): FlutterTransform => recipe.transform ??= {};

  for (const [key, value] of Object.entries(webStyle)) {
    const sv = String(value);

    // Skip unsupported
    if (FLUTTER_SKIP.has(key)) {
      dropped.push(key);
      continue;
    }

    // ── Padding ──
    if (key === 'padding') {
      const n = toNumber(value, remBase);
      if (n !== undefined) {
        const p = ensurePadding();
        p.top = n; p.right = n; p.bottom = n; p.left = n;
      }
      continue;
    }
    if (key === 'paddingTop') { const n = toNumber(value, remBase); if (n !== undefined) ensurePadding().top = n; continue; }
    if (key === 'paddingRight') { const n = toNumber(value, remBase); if (n !== undefined) ensurePadding().right = n; continue; }
    if (key === 'paddingBottom') { const n = toNumber(value, remBase); if (n !== undefined) ensurePadding().bottom = n; continue; }
    if (key === 'paddingLeft') { const n = toNumber(value, remBase); if (n !== undefined) ensurePadding().left = n; continue; }

    // ── Margin ──
    if (key === 'margin') {
      const n = toNumber(value, remBase);
      if (n !== undefined) {
        const m = ensureMargin();
        m.top = n; m.right = n; m.bottom = n; m.left = n;
      }
      continue;
    }
    if (key === 'marginTop') { const n = toNumber(value, remBase); if (n !== undefined) ensureMargin().top = n; continue; }
    if (key === 'marginRight') { const n = toNumber(value, remBase); if (n !== undefined) ensureMargin().right = n; continue; }
    if (key === 'marginBottom') { const n = toNumber(value, remBase); if (n !== undefined) ensureMargin().bottom = n; continue; }
    if (key === 'marginLeft') { const n = toNumber(value, remBase); if (n !== undefined) ensureMargin().left = n; continue; }

    // ── Gap (maps to layout spacing hint) ──
    if (key === 'gap' || key === 'rowGap' || key === 'columnGap') {
      // Gap doesn't have a direct Flutter mapping in decoration/padding
      // It maps to SizedBox spacing or mainAxisSpacing — recipe-level hint
      // For now, pass through as layout metadata
      continue;
    }

    // ── Background color ──
    if (key === 'backgroundColor') {
      ensureDecoration().color = sv;
      continue;
    }

    // ── Border ──
    if (key === 'borderWidth' || key === 'borderTopWidth' || key === 'borderRightWidth'
      || key === 'borderBottomWidth' || key === 'borderLeftWidth') {
      const n = toNumber(value, remBase);
      if (n !== undefined) {
        const border = ensureDecoration().border ??= {};
        border.width = n;
      }
      continue;
    }
    if (key === 'borderColor' || key === 'borderTopColor' || key === 'borderRightColor'
      || key === 'borderBottomColor' || key === 'borderLeftColor') {
      const border = ensureDecoration().border ??= {};
      border.color = sv;
      continue;
    }
    if (key === 'borderStyle') {
      const border = ensureDecoration().border ??= {};
      border.style = sv === 'none' ? 'none' : 'solid';
      continue;
    }

    // ── Border radius ──
    if (key === 'borderRadius') {
      const n = toNumber(value, remBase);
      if (n !== undefined) {
        const br = ensureDecoration().borderRadius ??= {};
        br.topLeft = n; br.topRight = n; br.bottomLeft = n; br.bottomRight = n;
      }
      continue;
    }
    if (key === 'borderTopLeftRadius') { const n = toNumber(value, remBase); if (n !== undefined) { (ensureDecoration().borderRadius ??= {}).topLeft = n; } continue; }
    if (key === 'borderTopRightRadius') { const n = toNumber(value, remBase); if (n !== undefined) { (ensureDecoration().borderRadius ??= {}).topRight = n; } continue; }
    if (key === 'borderBottomLeftRadius') { const n = toNumber(value, remBase); if (n !== undefined) { (ensureDecoration().borderRadius ??= {}).bottomLeft = n; } continue; }
    if (key === 'borderBottomRightRadius') { const n = toNumber(value, remBase); if (n !== undefined) { (ensureDecoration().borderRadius ??= {}).bottomRight = n; } continue; }

    // ── Box shadow ──
    if (key === 'boxShadow') {
      const shadows = parseBoxShadowForFlutter(sv);
      if (shadows.length > 0) {
        ensureDecoration().boxShadow = shadows;
      }
      continue;
    }

    // ── Sizing → constraints ──
    if (key === 'width') {
      if (isFullPercent(value)) { ensureConstraints().expandWidth = true; }
      else if (isViewportUnit(value)) { dropped.push(key); }
      else { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().width = n; }
      continue;
    }
    if (key === 'height') {
      if (isFullPercent(value)) { ensureConstraints().expandHeight = true; }
      else if (isViewportUnit(value)) { dropped.push(key); }
      else { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().height = n; }
      continue;
    }
    if (key === 'minWidth') { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().minWidth = n; continue; }
    if (key === 'maxWidth') { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().maxWidth = n; continue; }
    if (key === 'minHeight') { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().minHeight = n; continue; }
    if (key === 'maxHeight') { const n = toNumber(value, remBase); if (n !== undefined) ensureConstraints().maxHeight = n; continue; }

    // ── Layout ──
    if (key === 'display') {
      if (sv === 'flex' || sv === 'inline-flex') {
        ensureLayout(); // presence signals flex container
      }
      continue;
    }
    if (key === 'flexDirection') {
      ensureLayout().direction = sv === 'row' || sv === 'row-reverse' ? 'row' : 'column';
      continue;
    }
    if (key === 'justifyContent') {
      ensureLayout().mainAxisAlignment = MAIN_AXIS_MAP[sv] ?? sv;
      continue;
    }
    if (key === 'alignItems') {
      ensureLayout().crossAxisAlignment = CROSS_AXIS_MAP[sv] ?? sv;
      continue;
    }
    if (key === 'flexWrap') {
      if (sv === 'wrap' || sv === 'wrap-reverse') {
        ensureLayout().wrap = true;
      }
      continue;
    }

    // ── Flex child ──
    if (key === 'flex') {
      const n = typeof value === 'number' ? value : parseFloat(sv);
      if (!isNaN(n)) ensureFlexChild().flex = n;
      continue;
    }
    if (key === 'flexGrow') {
      const n = typeof value === 'number' ? value : parseFloat(sv);
      if (!isNaN(n) && n > 0) {
        const fc = ensureFlexChild();
        fc.flex = n;
        fc.flexFit = 'tight';
      }
      continue;
    }
    if (key === 'flexShrink') {
      // Flutter doesn't have direct flexShrink; handled via Flexible
      continue;
    }
    if (key === 'alignSelf') {
      // Flutter handles via Align widget — not directly mappable to recipe field
      continue;
    }
    if (key === 'order') {
      const n = typeof value === 'number' ? value : parseInt(sv, 10);
      if (!isNaN(n)) ensureFlexChild().order = n;
      continue;
    }

    // ── Positioning ──
    if (key === 'position') {
      ensurePositioning().type = sv === 'absolute' || sv === 'fixed' ? 'absolute' : 'relative';
      continue;
    }
    if (key === 'top') { const n = toNumber(value, remBase); if (n !== undefined) ensurePositioning().top = n; continue; }
    if (key === 'right') { const n = toNumber(value, remBase); if (n !== undefined) ensurePositioning().right = n; continue; }
    if (key === 'bottom') { const n = toNumber(value, remBase); if (n !== undefined) ensurePositioning().bottom = n; continue; }
    if (key === 'left') { const n = toNumber(value, remBase); if (n !== undefined) ensurePositioning().left = n; continue; }

    // ── Typography → textStyle ──
    if (key === 'color') { ensureTextStyle().color = sv; continue; }
    if (key === 'fontSize') { const n = toNumber(value, remBase); if (n !== undefined) ensureTextStyle().fontSize = n; continue; }
    if (key === 'fontWeight') { ensureTextStyle().fontWeight = FONT_WEIGHT_MAP[sv] ?? sv; continue; }
    if (key === 'fontFamily') { ensureTextStyle().fontFamily = sv; continue; }
    if (key === 'letterSpacing') { const n = toNumber(value, remBase); if (n !== undefined) ensureTextStyle().letterSpacing = n; continue; }
    if (key === 'lineHeight') {
      // Convert to Flutter height multiplier
      const n = parseFloat(sv);
      if (!isNaN(n)) {
        // If it looks like px value, convert to multiplier relative to fontSize
        if (sv.endsWith('px')) {
          const fontSize = webStyle.fontSize ? toNumber(webStyle.fontSize, remBase) : 16;
          ensureTextStyle().height = fontSize ? n / fontSize : n / 16;
        } else {
          // Already a multiplier (e.g., 1.5)
          ensureTextStyle().height = n;
        }
      }
      continue;
    }
    if (key === 'textDecorationLine') { ensureTextStyle().decoration = TEXT_DECORATION_MAP[sv] ?? sv; continue; }
    if (key === 'fontStyle') { ensureTextStyle().fontStyle = sv; continue; }
    if (key === 'textAlign') { ensureTextStyle().textAlign = sv; continue; }
    if (key === 'textTransform') {
      // Flutter doesn't have direct textTransform — dropped
      dropped.push(key);
      continue;
    }

    // ── Opacity ──
    if (key === 'opacity') {
      const n = typeof value === 'number' ? value : parseFloat(sv);
      if (!isNaN(n)) recipe.opacity = n;
      continue;
    }

    // ── Visibility ──
    if (key === 'visibility') {
      recipe.visible = sv !== 'hidden';
      continue;
    }

    // ── Aspect ratio ──
    if (key === 'aspectRatio') {
      if (sv.includes('/')) {
        const [w, h] = sv.split('/').map((p) => parseFloat(p.trim()));
        if (w && h) recipe.aspectRatio = w / h;
      } else {
        const n = parseFloat(sv);
        if (!isNaN(n)) recipe.aspectRatio = n;
      }
      continue;
    }

    // ── Z-index ──
    if (key === 'zIndex') {
      const n = typeof value === 'number' ? value : parseInt(sv, 10);
      if (!isNaN(n)) recipe.zIndex = n;
      continue;
    }

    // ── Transform ──
    if (key === 'transform') {
      const t = ensureTransform();
      const re = /(\w+)\(([^)]+)\)/g;
      let match;
      while ((match = re.exec(sv)) !== null) {
        const fn = match[1];
        const raw = match[2].trim();
        switch (fn) {
          case 'rotate': t.rotate = degToRad(raw); break;
          case 'scaleX': t.scaleX = parseFloat(raw); break;
          case 'scaleY': t.scaleY = parseFloat(raw); break;
          case 'scale': { const s = parseFloat(raw); t.scaleX = s; t.scaleY = s; break; }
          case 'translateX': t.translateX = toNumber(raw, remBase) ?? 0; break;
          case 'translateY': t.translateY = toNumber(raw, remBase) ?? 0; break;
          case 'skewX': t.skewX = degToRad(raw); break;
          case 'skewY': t.skewY = degToRad(raw); break;
        }
      }
      continue;
    }
    if (key === 'transformOrigin') {
      ensureTransform().origin = sv;
      continue;
    }

    // ── WebkitLineClamp (line-clamp) → textStyle.maxLines ──
    if (key === 'WebkitLineClamp') {
      const n = typeof value === 'number' ? value : parseInt(sv, 10);
      if (!isNaN(n)) {
        const ts = ensureTextStyle();
        ts.maxLines = n;
        ts.overflow = 'ellipsis';
      }
      continue;
    }

    // ── Overflow ──
    if (key === 'overflow' || key === 'overflowX' || key === 'overflowY') {
      // Flutter: Clip behavior on Container or scrollability
      // Recipe-level, not flat style
      continue;
    }

    // Unknown — drop and report
    dropped.push(key);
  }

  if (dropped.length > 0) recipe._dropped = dropped;

  return recipe;
}
