import type { StyleObject, DotConfig, ResolvedTokens } from '../types';
import { COLOR_PROP_MAP } from '../tokens/colors';
import { parseArbitrary, hexToRgb } from './utils';

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

  // Arbitrary value: bg-[#ff0000], text-[rgb(0,0,0)]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) return { [prop]: arbitrary };

  // Opacity modifier: bg-primary-500/50 → rgb(59 130 246 / 0.5)
  const slashIdx = value.lastIndexOf('/');
  if (slashIdx !== -1) {
    const colorValue = value.slice(0, slashIdx);
    const opacityKey = value.slice(slashIdx + 1);
    const opacityNum = parseInt(opacityKey, 10);
    if (!isNaN(opacityNum) && opacityNum >= 0 && opacityNum <= 100) {
      const hex = lookupColor(colorValue, config.tokens.colors);
      if (hex && hex.startsWith('#')) {
        const rgb = hexToRgb(hex, opacityNum / 100);
        if (rgb) return { [prop]: rgb };
      }
      // non-hex (CSS var, etc.) → use color-mix for opacity
      if (hex) {
        return { [prop]: `color-mix(in srgb, ${hex} ${opacityNum}%, transparent)` };
      }
    }
  }

  const hex = lookupColor(value, config.tokens.colors);
  if (!hex) return {};

  return { [prop]: hex };
}
