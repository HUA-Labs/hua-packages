import type { StyleObject, DotConfig } from '../types';
import { BACKDROP_BRIGHTNESS, BACKDROP_CONTRAST, BACKDROP_SATURATE } from '../tokens/backdrop';

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
    default:
      return {};
  }
}
