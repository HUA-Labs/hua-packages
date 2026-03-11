import type { StyleObject, DotConfig } from '../types';
import { parseArbitrary } from './utils';

/**
 * Resolve z-index tokens: z-10 → { zIndex: '10' }
 * Also supports arbitrary values: z-[55] → { zIndex: '55' }
 */
export function resolveZIndex(_prefix: string, value: string, config: DotConfig): StyleObject {
  const zVal = config.tokens.zIndex[value];
  if (zVal !== undefined) {
    return { zIndex: zVal };
  }

  // Arbitrary value: z-[55], z-[9999], z-[-1]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    return { zIndex: arbitrary };
  }

  return {};
}
