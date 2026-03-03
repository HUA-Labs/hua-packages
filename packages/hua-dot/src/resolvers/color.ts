import type { StyleObject, DotConfig, ResolvedTokens } from '../types';
import { COLOR_PROP_MAP } from '../tokens/colors';

/**
 * Look up a color value from palette or special colors.
 *
 * @example
 * lookupColor('primary-500', colors) → '#3b82f6'
 * lookupColor('white', colors)       → '#ffffff'
 * lookupColor('gray-100', colors)    → '#f3f4f6'
 */
export function lookupColor(value: string, colors: ResolvedTokens['colors']): string | undefined {
  // Check special/flat colors first (white, black, transparent, current)
  const flat = colors[value];
  if (typeof flat === 'string') {
    return flat;
  }

  // Split color name and shade: 'primary-500' → ['primary', '500']
  const lastDash = value.lastIndexOf('-');
  if (lastDash === -1) return undefined;

  const colorName = value.slice(0, lastDash);
  const shade = value.slice(lastDash + 1);

  const palette = colors[colorName];
  if (!palette || typeof palette === 'string') return undefined;

  return palette[shade];
}

/**
 * Resolve color tokens: bg-primary-500 → { backgroundColor: '#3b82f6' }
 */
export function resolveColor(prefix: string, value: string, config: DotConfig): StyleObject {
  const prop = COLOR_PROP_MAP[prefix];
  if (!prop) return {};

  const hex = lookupColor(value, config.tokens.colors);
  if (!hex) return {};

  return { [prop]: hex };
}
