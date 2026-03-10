import type { StyleObject, DotConfig, ResolvedTokens } from '../types';
import { COLOR_PROP_MAP } from '../tokens/colors';
import { parseArbitrary, hexToRgb } from './utils';

/**
 * Look up a color value from palette, special colors, or semantic colors.
 *
 * Priority order:
 *   1. colors[value] as string → user override / SPECIAL_COLORS (highest)
 *   2. semanticColors[value]   → CSS variable-based semantic token
 *   3. colors[value] as object → palette shade 500 default
 *   4. shade split lookup      → palette[colorName][shade]
 *
 * @example
 * lookupColor('white', colors)                    → '#ffffff'
 * lookupColor('primary', colors, semanticColors)  → 'var(--color-primary)'
 * lookupColor('primary-500', colors, semanticColors) → '#3b82f6'
 * lookupColor('primary', colors)                  → '#3b82f6' (no semantic → palette 500)
 */
export function lookupColor(
  value: string,
  colors: ResolvedTokens['colors'],
  semanticColors?: Record<string, string>,
): string | undefined {
  // 1. Check special/flat string colors first (white, black, transparent, current, user overrides)
  const flat = colors[value];
  if (typeof flat === 'string') {
    return flat;
  }

  // 2. Check semantic colors (CSS variable-based tokens like 'primary', 'muted-foreground')
  if (semanticColors?.[value]) {
    return semanticColors[value];
  }

  // 3. If a palette object is found without a shade, use 500 as default (matches Tailwind behavior)
  if (flat && typeof flat === 'object') {
    return (flat as Record<string, string>)['500'];
  }

  // 4. Split color name and shade: 'primary-500' → ['primary', '500']
  const lastDash = value.lastIndexOf('-');
  if (lastDash === -1) return undefined;

  const colorName = value.slice(0, lastDash);
  const shade = value.slice(lastDash + 1);

  const palette = colors[colorName];
  if (!palette || typeof palette === 'string') return undefined;

  return (palette as Record<string, string>)[shade];
}

/**
 * Resolve color tokens: bg-primary-500 → { backgroundColor: '#3b82f6' }
 */
export function resolveColor(prefix: string, value: string, config: DotConfig): StyleObject {
  const prop = COLOR_PROP_MAP[prefix];
  if (!prop) return {};

  const { colors, semanticColors } = config.tokens;

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
      const hex = lookupColor(colorValue, colors, semanticColors);
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

  const hex = lookupColor(value, colors, semanticColors);
  if (!hex) return {};

  return { [prop]: hex };
}
