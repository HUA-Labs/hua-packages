import type { StyleObject, RNStyleObject, RNTransformEntry } from '../types';

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
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert a CSS value string to a numeric value for RN.
 * - `'16px'` → `16`
 * - `'1.5rem'` → `24` (rem × 16)
 * - `'2em'` → `32` (em × 16)
 * - `'50%'` → `'50%'` (preserved)
 * - `'auto'` → `'auto'` (preserved)
 * - `'100vh'` / `'100vw'` → `undefined` (skip)
 */
export function toNumeric(value: string | number): string | number | undefined {
  if (typeof value === 'number') return value;
  const trimmed = value.trim();

  // Viewport units — can't convert without Dimensions API
  if (trimmed.endsWith('vh') || trimmed.endsWith('vw') || trimmed.endsWith('dvh') || trimmed.endsWith('dvw')) {
    return undefined;
  }

  // Percentage — keep as string
  if (trimmed.endsWith('%')) return trimmed;

  // Keywords — keep as string
  if (trimmed === 'auto' || trimmed === 'none') return trimmed;

  // px — strip suffix
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }

  // rem/em — approximate: ×16
  if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
    return parseFloat(trimmed) * 16;
  }

  // Pure number string
  const num = parseFloat(trimmed);
  if (!isNaN(num) && String(num) === trimmed) return num;

  // Fallback — keep as is (e.g., color strings shouldn't be here, but safety)
  return trimmed;
}

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
 * Returns properties: shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation
 */
export function parseBoxShadow(
  str: string,
): Record<string, string | number | { width: number; height: number }> {
  if (!str || str === 'none') return {};

  // Skip inset shadows (RN unsupported)
  if (str.trim().startsWith('inset')) return {};

  // Take first layer only (split on comma that's outside parentheses)
  const firstLayer = splitShadowLayers(str)[0];
  if (!firstLayer) return {};

  // Skip if first layer is inset
  if (firstLayer.trim().startsWith('inset')) return {};

  // Extract color — look for rgb(...) or hex at end
  let color = '#000000';
  let opacity = 1;
  let rest = firstLayer.trim();

  // Match rgb(r g b / a) or rgba(r, g, b, a) at end
  const rgbMatch = rest.match(/rgba?\([^)]+\)\s*$/);
  if (rgbMatch) {
    const colorStr = rgbMatch[0].trim();
    rest = rest.slice(0, rgbMatch.index).trim();
    const parsed = parseRgbColor(colorStr);
    color = parsed.hex;
    opacity = parsed.opacity;
  } else {
    // Match hex at end
    const hexMatch = rest.match(/#[0-9a-fA-F]{3,8}\s*$/);
    if (hexMatch) {
      color = hexMatch[0].trim();
      rest = rest.slice(0, hexMatch.index).trim();
    }
  }

  // Remaining should be: offsetX offsetY blur? spread?
  const parts = rest.split(/\s+/).map((p) => parseFloat(p));
  const offsetX = parts[0] || 0;
  const offsetY = parts[1] || 0;
  const blur = parts[2] || 0;
  // spread is parts[3] — RN ignores it

  // elevation approximation for Android (blur-based)
  const elevation = Math.min(Math.round(blur * 0.5 + Math.abs(offsetY) * 0.5), 24);

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blur / 2,
    elevation,
  };
}

/** Split shadow layers respecting parentheses (commas inside rgb() are not separators) */
function splitShadowLayers(str: string): string[] {
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
  return layers;
}

/** Parse rgb/rgba color string → { hex, opacity } */
function parseRgbColor(str: string): { hex: string; opacity: number } {
  // Modern: rgb(0 0 0 / 0.1) or rgb(0, 0, 0, 0.1)
  const match = str.match(
    /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*(?:[,/]\s*([\d.]+))?\s*\)/,
  );
  if (match) {
    const r = parseInt(match[1], 10);
    const g = parseInt(match[2], 10);
    const b = parseInt(match[3], 10);
    const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    return { hex, opacity: a };
  }
  return { hex: '#000000', opacity: 1 };
}

// ---------------------------------------------------------------------------
// Main adapter
// ---------------------------------------------------------------------------

/**
 * Convert a web CSS style object into a React Native StyleSheet-compatible object.
 *
 * This is a pure post-processing function — no side effects, no Dimensions API.
 * Unsupported properties are silently dropped.
 */
export function adaptNative(webStyle: StyleObject): RNStyleObject {
  const result: RNStyleObject = {};

  for (const [key, value] of Object.entries(webStyle)) {
    // Skip unsupported
    if (SKIP_PROPS.has(key)) continue;

    // Display — only flex/none
    if (key === 'display') {
      if (value === 'flex' || value === 'none') {
        result[key] = value;
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
      const shadow = parseBoxShadow(String(value));
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
      const converted = toNumeric(value);
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
