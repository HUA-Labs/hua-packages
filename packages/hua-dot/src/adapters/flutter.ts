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
import {
  toAbsoluteNumber,
  isFullPercent,
  isViewportUnit,
  degToRad,
  parseShadowLayers,
  splitShadowLayers,
} from './shared';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Alias for shared toAbsoluteNumber — used throughout this adapter */
const toNumber = toAbsoluteNumber;

/** Parse a CSS box-shadow string into FlutterBoxShadow entries using shared parser */
function parseBoxShadowForFlutter(str: string): FlutterBoxShadow[] {
  const layers = parseShadowLayers(str);
  const results: FlutterBoxShadow[] = [];

  for (const layer of layers) {
    if (layer.inset) continue; // Flutter doesn't support inset shadows

    // Flutter keeps the original color string (rgb/hex) for its own rendering
    // Reconstruct the color string from parsed hex + opacity
    let colorStr: string;
    if (layer.opacity < 1) {
      // Convert hex back to rgba for Flutter
      const hex = layer.color;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      colorStr = `rgba(${r}, ${g}, ${b}, ${layer.opacity})`;
    } else {
      colorStr = layer.color;
    }

    results.push({
      color: colorStr,
      offset: { dx: layer.offsetX, dy: layer.offsetY },
      blurRadius: layer.blur,
      spreadRadius: layer.spread,
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

  for (const [key, rawValue] of Object.entries(webStyle)) {
    // Strip !important — not meaningful in Flutter recipes
    const value = typeof rawValue === 'string' ? rawValue.replace(/\s*!important\s*$/, '') : rawValue;
    const sv = String(value);

    // Skip unsupported
    if (FLUTTER_SKIP.has(key)) {
      dropped.push(key);
      continue;
    }

    // Skip CSS custom property declarations (e.g. --tw-enter-opacity) — not supported in Flutter
    if (key.startsWith('--')) {
      dropped.push(key);
      continue;
    }

    // Skip CSS variable values — not supported in Flutter
    // Uses includes() to catch wrapped forms like color-mix(in srgb, var(...) ...)
    if (typeof sv === 'string' && sv.includes('var(')) {
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

    // ── Background gradient ──
    if (key === 'backgroundImage' && sv.startsWith('linear-gradient(')) {
      const inner = sv.slice('linear-gradient('.length, -1);
      // Parenthesis-aware split to handle rgba(), color-mix() etc.
      const parts = splitShadowLayers(inner);
      if (parts.length >= 2) {
        const directionMap: Record<string, [string, string]> = {
          'to right':        ['centerLeft', 'centerRight'],
          'to left':         ['centerRight', 'centerLeft'],
          'to top':          ['bottomCenter', 'topCenter'],
          'to bottom':       ['topCenter', 'bottomCenter'],
          'to top right':    ['bottomLeft', 'topRight'],
          'to top left':     ['bottomRight', 'topLeft'],
          'to bottom right': ['topLeft', 'bottomRight'],
          'to bottom left':  ['topRight', 'bottomLeft'],
        };
        const dirPart = parts[0];
        const alignment = directionMap[dirPart];
        if (alignment) {
          const colorParts = parts.slice(1);
          const colors: string[] = [];
          const stops: (number | undefined)[] = [];
          let hasAnyStop = false;

          for (const cp of colorParts) {
            const spaceIdx = cp.lastIndexOf(' ');
            if (spaceIdx !== -1 && cp.slice(spaceIdx + 1).endsWith('%')) {
              colors.push(cp.slice(0, spaceIdx));
              stops.push(parseFloat(cp.slice(spaceIdx + 1)) / 100);
              hasAnyStop = true;
            } else {
              colors.push(cp);
              stops.push(undefined);
            }
          }

          const gradient: import('./flutter-types').FlutterGradient = {
            type: 'linear',
            begin: alignment[0],
            end: alignment[1],
            colors,
          };

          // Include stops if any are specified (undefined entries mean "auto" position)
          if (hasAnyStop) {
            // Fill undefined stops: evenly distribute between known anchors
            const filledStops: number[] = [];
            for (let i = 0; i < stops.length; i++) {
              if (stops[i] !== undefined) {
                filledStops.push(stops[i]!);
              } else if (i === 0) {
                filledStops.push(0);
              } else if (i === stops.length - 1) {
                filledStops.push(1);
              } else {
                // Find prev and next known stops for interpolation
                let prev = 0, prevIdx = 0;
                for (let j = i - 1; j >= 0; j--) {
                  if (filledStops[j] !== undefined) { prev = filledStops[j]; prevIdx = j; break; }
                }
                let next = 1, nextIdx = stops.length - 1;
                for (let j = i + 1; j < stops.length; j++) {
                  if (stops[j] !== undefined) { next = stops[j]!; nextIdx = j; break; }
                }
                filledStops.push(prev + (next - prev) * (i - prevIdx) / (nextIdx - prevIdx));
              }
            }
            gradient.stops = filledStops;
          }

          ensureDecoration().gradient = gradient;
        }
      }
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
