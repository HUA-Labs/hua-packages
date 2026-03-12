import type { StyleObject, DotConfig } from '../types';
import { parseArbitrary } from './utils';

/**
 * Resolve transition-related tokens:
 * - transition / transition-all / transition-colors → { transitionProperty: '...' }
 * - transition-[width] → { transitionProperty: 'width' }
 * - duration-200 → { transitionDuration: '200ms' }
 * - duration-[300ms] → { transitionDuration: '300ms' }
 * - ease-in-out → { transitionTimingFunction: 'cubic-bezier(...)' }
 * - ease-[cubic-bezier(0.4,0,0.2,1)] → { transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }
 * - delay-100 → { transitionDelay: '100ms' }
 * - delay-[150ms] → { transitionDelay: '150ms' }
 */
export function resolveTransition(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'transition': {
      const prop = config.tokens.transitionProperty[value];
      if (prop !== undefined) {
        return { transitionProperty: prop };
      }
      const arb = parseArbitrary(value);
      if (arb !== undefined) {
        return { transitionProperty: arb };
      }
      return {};
    }
    case 'duration': {
      const dur = config.tokens.duration[value];
      if (dur !== undefined) {
        return { transitionDuration: dur };
      }
      const arb = parseArbitrary(value);
      if (arb !== undefined) {
        return { transitionDuration: arb };
      }
      return {};
    }
    case 'ease': {
      const fn = config.tokens.timing[value];
      if (fn !== undefined) {
        return { transitionTimingFunction: fn };
      }
      const arb = parseArbitrary(value);
      if (arb !== undefined) {
        return { transitionTimingFunction: arb };
      }
      return {};
    }
    case 'delay': {
      const del = config.tokens.duration[value];
      if (del !== undefined) {
        return { transitionDelay: del };
      }
      const arb = parseArbitrary(value);
      if (arb !== undefined) {
        return { transitionDelay: arb };
      }
      return {};
    }
    default:
      return {};
  }
}
