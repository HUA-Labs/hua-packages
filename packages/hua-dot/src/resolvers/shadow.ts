import type { StyleObject, DotConfig } from '../types';
import { parseArbitrary } from './utils';

/**
 * Resolve shadow tokens: shadow-lg → { __dot_shadowLayer: '...' }
 * Uses internal layer key for composition with ring.
 * Bare `shadow` uses DEFAULT ('') key.
 */
export function resolveShadow(_prefix: string, value: string, config: DotConfig): StyleObject {
  // Arbitrary value: shadow-[0_4px_6px_rgba(0,0,0,0.1)]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    // Replace underscores with spaces for shadow syntax
    return { __dot_shadowLayer: arbitrary.replace(/_/g, ' ') };
  }

  const cssValue = config.tokens.shadows[value];
  if (cssValue !== undefined) {
    return { __dot_shadowLayer: cssValue };
  }
  return {};
}
