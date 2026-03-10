import type { StyleObject } from '../types';
import type { RNStyleObject, RNTransformEntry, AdaptNativeOptions } from './native-types';
import { toNumericValue, parseShadowLayers } from './shared';
import type { ParsedShadowLayer } from './shared';

// Re-export types for consumers importing from this module
export type { AdaptNativeOptions } from './native-types';

// ---------------------------------------------------------------------------
// Property classification sets
// ---------------------------------------------------------------------------

/** Properties to silently drop (unsupported in RN) */
const SKIP_PROPS = new Set([
  'animation',
  'animationName',
  'animationDuration',
  'animationTimingFunction',
  'animationDelay',
  'animationIterationCount',
  'animationFillMode',
  'transitionProperty',
  'transitionDuration',
  'transitionTimingFunction',
  'transitionDelay',
  'transition',
  'backdropFilter',
  'WebkitBackdropFilter',
  'cursor',
  'outline',
  'outlineWidth',
  'outlineStyle',
  'outlineColor',
  'outlineOffset',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumn',
  'gridRow',
  'insetInlineStart',
  'insetInlineEnd',
  'userSelect',
  'resize',
  'whiteSpace',
  'textOverflow',
  'WebkitBoxOrient',
  'clip',
  'visibility',
  'filter',
  'mixBlendMode',
  // Wave 2: web-only properties
  'float',
  'clear',
  'isolation',
  'tableLayout',
  'borderCollapse',
  'borderSpacing',
  'captionSide',
  'listStyleType',
  'listStylePosition',
  'scrollBehavior',
  'scrollMarginTop',
  'scrollMarginRight',
  'scrollMarginBottom',
  'scrollMarginLeft',
  'scrollPaddingTop',
  'scrollPaddingRight',
  'scrollPaddingBottom',
  'scrollPaddingLeft',
  'willChange',
  'touchAction',
  'textIndent',
  'textDecorationThickness',
  'textUnderlineOffset',
  'placeContent',
  'placeItems',
  'placeSelf',
  'objectPosition',
  'overflowWrap',
  'wordBreak',
  'backgroundImage',
  // Phase 0: web-only properties
  'backgroundClip',
  'WebkitBackgroundClip',
  'WebkitFontSmoothing',
  'MozOsxFontSmoothing',
  'overflowX',
  'overflowY',
]);

/** Properties whose px/number values should be converted to plain numbers */
const NUMERIC_PROPS = new Set([
  'padding',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'paddingHorizontal',
  'paddingVertical',
  'margin',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'marginHorizontal',
  'marginVertical',
  'gap',
  'rowGap',
  'columnGap',
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'borderRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
  'borderWidth',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'top',
  'right',
  'bottom',
  'left',
  'fontSize',
  'letterSpacing',
  'lineHeight',
  'flexBasis',
]);

/** Properties that should be parseFloat'd */
const FLOAT_PROPS = new Set(['opacity', 'flexGrow', 'flexShrink']);

/** Properties that should be parseInt'd */
const INT_PROPS = new Set(['zIndex', 'order']);

/** Properties that pass through unchanged */
const PASSTHROUGH_PROPS = new Set([
  'color',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderRightColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderStyle',
  'flexDirection',
  'flexWrap',
  'alignItems',
  'alignSelf',
  'alignContent',
  'justifyContent',
  'textAlign',
  'textDecorationLine',
  'textDecorationColor',
  'textDecorationStyle',
  'textTransform',
  'position',
  'fontWeight',
  'fontFamily',
  'fontStyle',
  'overflow',
  'overflowX',
  'overflowY',
  'pointerEvents',
  'textTransform',
  'backfaceVisibility',
  'textAlignVertical',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a CSS value string to a numeric value for RN.
 * Delegates to shared toNumericValue — kept as re-export for API compatibility.
 */
export const toNumeric = toNumericValue;

/**
 * Parse a CSS transform string into an RN transform array.
 *
 * `'rotate(45deg) scale(1.1) translateX(16px)'`
 * → `[{ rotate: '45deg' }, { scale: 1.1 }, { translateX: 16 }]`
 */
export function parseTransformString(str: string): RNTransformEntry[] {
  const result: RNTransformEntry[] = [];
  const re = /(\w+)\(([^)]+)\)/g;
  let match;

  while ((match = re.exec(str)) !== null) {
    const fn = match[1];
    const raw = match[2].trim();

    if (fn.startsWith('rotate') || fn.startsWith('skew')) {
      // Angular values — keep as string (e.g., '45deg')
      result.push({ [fn]: raw });
    } else if (fn.startsWith('scale')) {
      result.push({ [fn]: parseFloat(raw) });
    } else if (fn.startsWith('translate')) {
      // translateX/Y — strip px
      const num = parseFloat(raw);
      if (raw.endsWith('px') || (!isNaN(num) && !raw.endsWith('%'))) {
        result.push({ [fn]: num });
      } else if (raw.endsWith('%')) {
        result.push({ [fn]: raw });
      } else {
        result.push({ [fn]: raw });
      }
    } else {
      // Unknown transform function — pass through
      const num = parseFloat(raw);
      result.push({ [fn]: isNaN(num) ? raw : num });
    }
  }

  return result;
}

/**
 * Parse a CSS box-shadow string into RN shadow properties.
 * Uses only the first layer (RN doesn't support multi-layer shadows).
 *
 * Delegates parsing to shared parseShadowLayers, then converts to RN format.
 */
/** Warnings emitted during shadow conversion for reporting */
export interface ShadowWarnings {
  droppedInset: boolean;
  droppedLayers: number;
  droppedSpread: boolean;
}

export function parseBoxShadow(
  str: string,
  warnFn?: (prop: string, reason: string) => void,
): Record<string, string | number | { width: number; height: number }> {
  if (!str || str === 'none') return {};

  // Use shared parser
  const layers: ParsedShadowLayer[] = parseShadowLayers(str);

  const hasInset = layers.some((l) => l.inset);
  const nonInset = layers.filter((l) => !l.inset);
  const first = nonInset[0];
  if (!first) {
    // All layers were inset — nothing to render
    if (warnFn && hasInset) warnFn('boxShadow', 'inset shadows unsupported on RN');
    return {};
  }

  // Dev warnings for approximation details
  if (warnFn) {
    if (hasInset) warnFn('boxShadow:inset', 'inset shadows dropped on RN');
    if (nonInset.length > 1) warnFn('boxShadow:multi', `${nonInset.length} layers → 1 (RN single-layer)`);
    if (first.spread !== 0) warnFn('boxShadow:spread', 'spread radius ignored on RN');
  }

  // Elevation approximation for Android (Material Design heuristic)
  // blur contributes most (depth perception), offset adds subtle lift
  const elevation = Math.min(
    Math.round(first.blur * 0.5 + Math.abs(first.offsetY) * 0.5),
    24,
  );

  return {
    shadowColor: first.color,
    shadowOffset: { width: first.offsetX, height: first.offsetY },
    shadowOpacity: first.opacity,
    shadowRadius: first.blur / 2,
    elevation,
  };
}

// ---------------------------------------------------------------------------
// Dev warnings for dropped properties
// ---------------------------------------------------------------------------

/** Set of property names already warned about (session-scoped dedup) */
const _warnedProps = new Set<string>();

/** Reset warning dedup set — for testing only */
export function _resetNativeWarnings(): void {
  _warnedProps.clear();
}

function warnOnce(prop: string, reason?: string): void {
  if (_warnedProps.has(prop)) return;
  _warnedProps.add(prop);
  const suffix = reason ? ` (${reason})` : '';
  console.warn(`[dot/native] Dropped: "${prop}"${suffix}`);
}

// ---------------------------------------------------------------------------
// Main adapter
// ---------------------------------------------------------------------------

/**
 * Convert a web CSS style object into a React Native StyleSheet-compatible object.
 *
 * This is a pure post-processing function — no side effects, no Dimensions API.
 * Unsupported properties are silently dropped (with optional dev warnings).
 */
export function adaptNative(webStyle: StyleObject, options?: AdaptNativeOptions): RNStyleObject {
  const remBase = options?.remBase ?? 16;
  const warn = options?.warnDropped === true;
  const result: RNStyleObject = {};

  for (const [key, rawValue] of Object.entries(webStyle)) {
    // Strip !important — not meaningful in RN
    const value = typeof rawValue === 'string' ? rawValue.replace(/\s*!important\s*$/, '') : rawValue;

    // Skip unsupported
    if (SKIP_PROPS.has(key)) {
      if (warn) warnOnce(key);
      continue;
    }

    // Skip CSS variable values — not supported in React Native
    // Uses includes() to catch wrapped forms like color-mix(in srgb, var(...) ...)
    if (typeof value === 'string' && value.includes('var(')) {
      if (warn) warnOnce(key, `CSS variable value "${value}" not supported in RN`);
      continue;
    }

    // objectFit → RN resizeMode
    if (key === 'objectFit') {
      const resizeModeMap: Record<string, string> = {
        contain: 'contain',
        cover: 'cover',
        fill: 'stretch',
        none: 'center',
        'scale-down': 'contain',
      };
      const mapped = resizeModeMap[String(value)];
      if (mapped) result['resizeMode'] = mapped;
      continue;
    }

    // Display — only flex/none (skip -webkit-box from line-clamp)
    if (key === 'display') {
      if (value === 'flex' || value === 'none') {
        result[key] = value;
      } else if (warn) {
        warnOnce(`display:${String(value)}`, `unsupported display value "${String(value)}"`);
      }
      continue;
    }

    // WebkitLineClamp → RN numberOfLines
    if (key === 'WebkitLineClamp') {
      const num = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!isNaN(num) && num > 0) {
        result['numberOfLines'] = num;
      }
      continue;
    }

    // Transform — CSS string → RN array
    if (key === 'transform') {
      const arr = parseTransformString(String(value));
      if (arr.length > 0) {
        result[key] = arr;
      }
      continue;
    }

    // Box shadow → RN shadow properties
    if (key === 'boxShadow') {
      const shadow = parseBoxShadow(String(value), warn ? warnOnce : undefined);
      for (const [sk, sv] of Object.entries(shadow)) {
        result[sk] = sv as RNStyleObject[string];
      }
      continue;
    }

    // Flex shorthand
    if (key === 'flex') {
      const sv = String(value);
      if (sv === 'none') {
        result.flexGrow = 0;
        result.flexShrink = 0;
      } else {
        // '1 1 0%' → 1, '1' → 1
        const num = parseFloat(sv);
        result.flex = isNaN(num) ? 0 : num;
      }
      continue;
    }

    // Numeric conversion (px → number)
    if (NUMERIC_PROPS.has(key)) {
      // lineHeight: unitless multiplier → absolute px (RN requires absolute values)
      if (key === 'lineHeight') {
        const strVal = String(value).trim();
        const num = parseFloat(strVal);
        // Unitless (e.g., '1.5', '2') — multiply by fontSize or default 16
        if (!isNaN(num) && String(num) === strVal && !strVal.endsWith('px') && !strVal.endsWith('em') && !strVal.endsWith('rem')) {
          const fontSize = typeof webStyle.fontSize === 'string'
            ? parseFloat(webStyle.fontSize) || remBase
            : (typeof webStyle.fontSize === 'number' ? webStyle.fontSize : remBase);
          result[key] = Math.round(num * fontSize * 100) / 100;
          continue;
        }
      }
      const converted = toNumeric(value, remBase);
      if (converted !== undefined) {
        result[key] = converted;
      }
      continue;
    }

    // Float conversion
    if (FLOAT_PROPS.has(key)) {
      const num = typeof value === 'number' ? value : parseFloat(String(value));
      if (!isNaN(num)) {
        result[key] = num;
      }
      continue;
    }

    // Integer conversion
    if (INT_PROPS.has(key)) {
      const num = typeof value === 'number' ? value : parseInt(String(value), 10);
      if (!isNaN(num)) {
        result[key] = num;
      }
      continue;
    }

    // Passthrough
    if (PASSTHROUGH_PROPS.has(key)) {
      result[key] = value;
      continue;
    }

    // Unknown property — pass through as-is (forward compatibility)
    result[key] = value;
  }

  return result;
}
