import type { StyleObject, DotConfig } from '../types';
import { TRANSFORM_ORIGIN } from '../tokens/transforms';

/**
 * Resolve transform tokens:
 * - rotate-45 → { transform: 'rotate(45deg)' }
 * - scale-110 → { transform: 'scale(1.1)' }
 * - translate-x-4 → { transform: 'translateX(16px)' }
 * - translate-y-4 → { transform: 'translateY(16px)' }
 * - skew-x-6 → { transform: 'skewX(6deg)' }
 * - skew-y-6 → { transform: 'skewY(6deg)' }
 *
 * Phase 2: Single transform per token (last-wins). Phase 3 will add accumulator.
 */
export function resolveTransform(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'rotate': {
      const deg = config.tokens.rotate[value];
      if (deg !== undefined) {
        return { transform: `rotate(${deg})` };
      }
      return {};
    }
    case 'scale': {
      const s = config.tokens.scale[value];
      if (s !== undefined) {
        return { transform: `scale(${s})` };
      }
      return {};
    }
    case 'scale-x': {
      const s = config.tokens.scale[value];
      if (s !== undefined) {
        return { transform: `scaleX(${s})` };
      }
      return {};
    }
    case 'scale-y': {
      const s = config.tokens.scale[value];
      if (s !== undefined) {
        return { transform: `scaleY(${s})` };
      }
      return {};
    }
    case 'translate-x': {
      const px = config.tokens.spacing[value];
      if (px !== undefined) {
        return { transform: `translateX(${px})` };
      }
      return {};
    }
    case 'translate-y': {
      const px = config.tokens.spacing[value];
      if (px !== undefined) {
        return { transform: `translateY(${px})` };
      }
      return {};
    }
    case 'skew-x': {
      const deg = config.tokens.skew[value];
      if (deg !== undefined) {
        return { transform: `skewX(${deg})` };
      }
      return {};
    }
    case 'skew-y': {
      const deg = config.tokens.skew[value];
      if (deg !== undefined) {
        return { transform: `skewY(${deg})` };
      }
      return {};
    }
    case 'origin': {
      const origin = TRANSFORM_ORIGIN[value];
      if (origin !== undefined) {
        return { transformOrigin: origin };
      }
      return {};
    }
    default:
      return {};
  }
}
