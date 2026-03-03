import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve shadow tokens: shadow-lg → { boxShadow: '...' }
 * Bare `shadow` uses DEFAULT ('') key.
 */
export function resolveShadow(_prefix: string, value: string, config: DotConfig): StyleObject {
  const cssValue = config.tokens.shadows[value];
  if (cssValue !== undefined) {
    return { boxShadow: cssValue };
  }
  return {};
}
