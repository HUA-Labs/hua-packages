import type { StyleObject } from '../types';
import { COLORS, SPECIAL_COLORS, COLOR_PROP_MAP } from '../tokens/colors';

/**
 * Look up a color value from palette or special colors.
 *
 * @example
 * lookupColor('primary-500') → '#3b82f6'
 * lookupColor('white')       → '#ffffff'
 * lookupColor('gray-100')    → '#f3f4f6'
 */
export function lookupColor(value: string): string | undefined {
  // Check special colors first (white, black, transparent, current)
  if (SPECIAL_COLORS[value]) {
    return SPECIAL_COLORS[value];
  }

  // Split color name and shade: 'primary-500' → ['primary', '500']
  const lastDash = value.lastIndexOf('-');
  if (lastDash === -1) return undefined;

  const colorName = value.slice(0, lastDash);
  const shade = value.slice(lastDash + 1);

  const palette = COLORS[colorName];
  if (!palette) return undefined;

  return palette[shade];
}

/**
 * Resolve color tokens: bg-primary-500 → { backgroundColor: '#3b82f6' }
 */
export function resolveColor(prefix: string, value: string): StyleObject {
  const prop = COLOR_PROP_MAP[prefix];
  if (!prop) return {};

  const hex = lookupColor(value);
  if (!hex) return {};

  return { [prop]: hex };
}
