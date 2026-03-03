import type { StyleObject, DotConfig } from '../types';
import {
  BLUR,
  BRIGHTNESS,
  CONTRAST,
  SATURATE,
  GRAYSCALE,
  SEPIA,
  INVERT,
  HUE_ROTATE,
  DROP_SHADOW,
  MIX_BLEND,
} from '../tokens/filter';
import { parseArbitrary } from './utils';

/**
 * Resolve element filter tokens → CSS `filter` property.
 *
 * @example
 * resolveFilter('blur', 'md', config)     → { filter: 'blur(12px)' }
 * resolveFilter('grayscale', '', config)   → { filter: 'grayscale(100%)' }
 * resolveFilter('hue-rotate', '90', config) → { filter: 'hue-rotate(90deg)' }
 */
export function resolveFilter(prefix: string, value: string, _config: DotConfig): StyleObject {
  switch (prefix) {
    case 'blur': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `blur(${arbitrary})` };
      const v = BLUR[value];
      if (v !== undefined) return { filter: `blur(${v})` };
      return {};
    }
    case 'brightness': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `brightness(${arbitrary})` };
      const v = BRIGHTNESS[value];
      if (v !== undefined) return { filter: `brightness(${v})` };
      return {};
    }
    case 'contrast': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `contrast(${arbitrary})` };
      const v = CONTRAST[value];
      if (v !== undefined) return { filter: `contrast(${v})` };
      return {};
    }
    case 'saturate': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `saturate(${arbitrary})` };
      const v = SATURATE[value];
      if (v !== undefined) return { filter: `saturate(${v})` };
      return {};
    }
    case 'grayscale': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `grayscale(${arbitrary})` };
      const v = GRAYSCALE[value];
      if (v !== undefined) return { filter: `grayscale(${v})` };
      return {};
    }
    case 'sepia': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `sepia(${arbitrary})` };
      const v = SEPIA[value];
      if (v !== undefined) return { filter: `sepia(${v})` };
      return {};
    }
    case 'invert': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `invert(${arbitrary})` };
      const v = INVERT[value];
      if (v !== undefined) return { filter: `invert(${v})` };
      return {};
    }
    case 'hue-rotate': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `hue-rotate(${arbitrary})` };
      const v = HUE_ROTATE[value];
      if (v !== undefined) return { filter: `hue-rotate(${v})` };
      return {};
    }
    case 'drop-shadow': {
      const arbitrary = parseArbitrary(value);
      if (arbitrary !== undefined) return { filter: `drop-shadow(${arbitrary.replace(/_/g, ' ')})` };
      const v = DROP_SHADOW[value];
      if (v !== undefined) return { filter: v };
      return {};
    }
    default:
      return {};
  }
}

/**
 * Resolve mix-blend-mode tokens.
 *
 * @example
 * resolveMixBlend('mix-blend', 'multiply', config) → { mixBlendMode: 'multiply' }
 */
export function resolveMixBlend(_prefix: string, value: string, _config: DotConfig): StyleObject {
  const v = MIX_BLEND[value];
  if (v !== undefined) return { mixBlendMode: v };
  return {};
}
