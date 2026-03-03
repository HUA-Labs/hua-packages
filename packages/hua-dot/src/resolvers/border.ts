import type { StyleObject, DotConfig } from '../types';
import {
  BORDER_WIDTHS,
  BORDER_STYLES,
  BORDER_WIDTH_PROP_MAP,
  BORDER_RADIUS_PROP_MAP,
} from '../tokens/borders';
import { resolveColor } from './color';
import { parseArbitrary } from './utils';

/**
 * Resolve border tokens.
 *
 * Handles `border-` ambiguity: borderWidth > borderColor
 *
 * @example
 * resolveBorder('border', '', config)     → { borderWidth: '1px' }   (bare prefix)
 * resolveBorder('border', '2', config)    → { borderWidth: '2px' }
 * resolveBorder('border-t', '4', config)  → { borderTopWidth: '4px' }
 * resolveBorder('border', 'red-500', config) → { borderColor: '#ef4444' }
 */
export function resolveBorder(prefix: string, value: string, config: DotConfig): StyleObject {
  // Arbitrary value: border-[3px], border-t-[2px]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    const widthProps = BORDER_WIDTH_PROP_MAP[prefix];
    if (widthProps) {
      const result: StyleObject = {};
      for (const prop of widthProps) {
        result[prop] = arbitrary;
      }
      return result;
    }
    return {};
  }

  // Border width (including bare prefix)
  const widthProps = BORDER_WIDTH_PROP_MAP[prefix];
  if (widthProps) {
    // Check width values first
    if (value in BORDER_WIDTHS) {
      const result: StyleObject = {};
      for (const prop of widthProps) {
        result[prop] = BORDER_WIDTHS[value as keyof typeof BORDER_WIDTHS];
      }
      return result;
    }

    // Color fallthrough (only for 'border' prefix) — delegates to resolveColor for opacity support
    if (prefix === 'border') {
      return resolveColor('border', value, config);
    }
  }

  return {};
}

/**
 * Resolve border-style tokens: border-solid → { borderStyle: 'solid' }
 */
export function resolveBorderStyle(value: string): StyleObject {
  if (BORDER_STYLES[value]) {
    return { borderStyle: BORDER_STYLES[value] };
  }
  return {};
}

/**
 * Resolve border-radius tokens.
 *
 * @example
 * resolveBorderRadius('rounded', '', config)     → { borderRadius: '4px' }   (bare prefix)
 * resolveBorderRadius('rounded', 'lg', config)   → { borderRadius: '8px' }
 * resolveBorderRadius('rounded-tl', 'lg', config) → { borderTopLeftRadius: '8px' }
 */
export function resolveBorderRadius(prefix: string, value: string, config: DotConfig): StyleObject {
  const props = BORDER_RADIUS_PROP_MAP[prefix];
  if (!props) return {};

  const cssValue = config.tokens.borderRadius[value];
  if (cssValue !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = cssValue;
    }
    return result;
  }

  return {};
}
