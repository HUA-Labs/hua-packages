import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve transition-related tokens:
 * - transition / transition-all / transition-colors → { transitionProperty: '...' }
 * - duration-200 → { transitionDuration: '200ms' }
 * - ease-in-out → { transitionTimingFunction: 'cubic-bezier(...)' }
 * - delay-100 → { transitionDelay: '100ms' }
 */
export function resolveTransition(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'transition': {
      const prop = config.tokens.transitionProperty[value];
      if (prop !== undefined) {
        return { transitionProperty: prop };
      }
      return {};
    }
    case 'duration': {
      const dur = config.tokens.duration[value];
      if (dur !== undefined) {
        return { transitionDuration: dur };
      }
      return {};
    }
    case 'ease': {
      const fn = config.tokens.timing[value];
      if (fn !== undefined) {
        return { transitionTimingFunction: fn };
      }
      return {};
    }
    case 'delay': {
      const del = config.tokens.duration[value];
      if (del !== undefined) {
        return { transitionDelay: del };
      }
      return {};
    }
    default:
      return {};
  }
}
