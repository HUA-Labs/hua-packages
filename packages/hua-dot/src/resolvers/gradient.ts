import type { StyleObject, DotConfig } from '../types';
import { GRADIENT_DIRECTIONS } from '../tokens/gradients';
import { lookupColor } from './color';
import { parseArbitrary, hexToRgb } from './utils';

/**
 * Resolve gradient direction: bg-gradient-to-{r,l,t,b,tr,tl,br,bl}
 *
 * Returns internal key `__dot_gradientDirection` for finalizeStyle() composition.
 */
export function resolveGradientDirection(_prefix: string, value: string): StyleObject {
  const direction = GRADIENT_DIRECTIONS[value];
  if (!direction) return {};
  return { __dot_gradientDirection: direction };
}

/**
 * Resolve gradient color stop: from-{color}, via-{color}, to-{color}
 * Also handles stop positions: from-{n}%, via-[25%], to-100%
 *
 * Returns internal keys like `__dot_gradientFrom`, `__dot_gradientFromPos` etc.
 */
export function resolveGradientStop(prefix: string, value: string, config: DotConfig): StyleObject {
  const key = prefix === 'from' ? 'From' : prefix === 'via' ? 'Via' : 'To';

  // Arbitrary value: from-[#ff0000], from-[25%]
  const arb = parseArbitrary(value);
  if (arb !== undefined) {
    if (arb.endsWith('%')) {
      return { [`__dot_gradient${key}Pos`]: arb };
    }
    return { [`__dot_gradient${key}`]: arb };
  }

  // Percentage position: from-0%, from-50%, to-100%
  if (value.endsWith('%')) {
    return { [`__dot_gradient${key}Pos`]: value };
  }

  // Opacity modifier: from-red-500/50
  const slashIdx = value.lastIndexOf('/');
  if (slashIdx !== -1) {
    const colorValue = value.slice(0, slashIdx);
    const opacityKey = value.slice(slashIdx + 1);
    const opacityNum = parseInt(opacityKey, 10);
    if (!isNaN(opacityNum) && opacityNum >= 0 && opacityNum <= 100) {
      const hex = lookupColor(colorValue, config.tokens.colors);
      if (hex && hex.startsWith('#')) {
        const rgb = hexToRgb(hex, opacityNum / 100);
        if (rgb) return { [`__dot_gradient${key}`]: rgb };
      }
      if (hex) {
        return { [`__dot_gradient${key}`]: `color-mix(in srgb, ${hex} ${opacityNum}%, transparent)` };
      }
    }
  }

  // Color lookup: from-red-500, via-white, to-transparent
  const color = lookupColor(value, config.tokens.colors);
  if (color) {
    return { [`__dot_gradient${key}`]: color };
  }

  return {};
}
