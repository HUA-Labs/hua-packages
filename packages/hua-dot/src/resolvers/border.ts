import type { StyleObject } from '../types';
import {
  BORDER_WIDTHS,
  BORDER_STYLES,
  BORDER_RADIUS,
  BORDER_WIDTH_PROP_MAP,
  BORDER_RADIUS_PROP_MAP,
} from '../tokens/borders';
import { lookupColor } from './color';

/**
 * Resolve border tokens.
 *
 * Handles `border-` ambiguity: borderWidth > borderColor
 *
 * @example
 * resolveBorder('border', '')     → { borderWidth: '1px' }   (bare prefix)
 * resolveBorder('border', '2')    → { borderWidth: '2px' }
 * resolveBorder('border-t', '4')  → { borderTopWidth: '4px' }
 * resolveBorder('border', 'red-500') → { borderColor: '#ef4444' }
 */
export function resolveBorder(prefix: string, value: string): StyleObject {
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

    // Color fallthrough (only for 'border' prefix)
    if (prefix === 'border') {
      const hex = lookupColor(value);
      if (hex) {
        return { borderColor: hex };
      }
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
 * resolveBorderRadius('rounded', '')     → { borderRadius: '4px' }   (bare prefix)
 * resolveBorderRadius('rounded', 'lg')   → { borderRadius: '8px' }
 * resolveBorderRadius('rounded-tl', 'lg') → { borderTopLeftRadius: '8px' }
 */
export function resolveBorderRadius(prefix: string, value: string): StyleObject {
  const props = BORDER_RADIUS_PROP_MAP[prefix];
  if (!props) return {};

  if (value in BORDER_RADIUS) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = BORDER_RADIUS[value as keyof typeof BORDER_RADIUS];
    }
    return result;
  }

  return {};
}
