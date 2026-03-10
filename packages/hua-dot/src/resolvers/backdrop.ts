import type { StyleObject, DotConfig } from '../types';
import { BACKDROP_BRIGHTNESS, BACKDROP_CONTRAST, BACKDROP_SATURATE, BACKDROP_GRAYSCALE, BACKDROP_SEPIA, BACKDROP_INVERT, BACKDROP_HUE_ROTATE, BACKDROP_OPACITY } from '../tokens/backdrop';

/**
 * Resolve backdrop tokens:
 * - backdrop-blur-md → { backdropFilter: 'blur(12px)' }
 * - backdrop-blur → { backdropFilter: 'blur(8px)' } (DEFAULT)
 * - backdrop-blur-none → { backdropFilter: 'blur(0)' }
 * - backdrop-brightness-75 → { backdropFilter: 'brightness(.75)' }
 * - backdrop-contrast-125 → { backdropFilter: 'contrast(1.25)' }
 * - backdrop-saturate-150 → { backdropFilter: 'saturate(1.5)' }
 */
export function resolveBackdrop(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'backdrop-blur': {
      const blur = config.tokens.backdropBlur[value];
      if (blur !== undefined) {
        return { backdropFilter: `blur(${blur})` };
      }
      return {};
    }
    case 'backdrop-brightness': {
      const val = BACKDROP_BRIGHTNESS[value];
      if (val !== undefined) {
        return { backdropFilter: `brightness(${val})` };
      }
      return {};
    }
    case 'backdrop-contrast': {
      const val = BACKDROP_CONTRAST[value];
      if (val !== undefined) {
        return { backdropFilter: `contrast(${val})` };
      }
      return {};
    }
    case 'backdrop-saturate': {
      const val = BACKDROP_SATURATE[value];
      if (val !== undefined) {
        return { backdropFilter: `saturate(${val})` };
      }
      return {};
    }
    case 'backdrop-grayscale': {
      const val = BACKDROP_GRAYSCALE[value];
      if (val !== undefined) {
        return { backdropFilter: `grayscale(${val})` };
      }
      return {};
    }
    case 'backdrop-sepia': {
      const val = BACKDROP_SEPIA[value];
      if (val !== undefined) {
        return { backdropFilter: `sepia(${val})` };
      }
      return {};
    }
    case 'backdrop-invert': {
      const val = BACKDROP_INVERT[value];
      if (val !== undefined) {
        return { backdropFilter: `invert(${val})` };
      }
      return {};
    }
    case 'backdrop-hue-rotate': {
      const val = BACKDROP_HUE_ROTATE[value];
      if (val !== undefined) {
        return { backdropFilter: `hue-rotate(${val})` };
      }
      return {};
    }
    case 'backdrop-opacity': {
      const val = BACKDROP_OPACITY[value];
      if (val !== undefined) {
        return { backdropFilter: `opacity(${val})` };
      }
      return {};
    }
    default:
      return {};
  }
}
