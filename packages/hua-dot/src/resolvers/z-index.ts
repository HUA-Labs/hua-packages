import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve z-index tokens: z-10 → { zIndex: '10' }
 */
export function resolveZIndex(_prefix: string, value: string, config: DotConfig): StyleObject {
  const zVal = config.tokens.zIndex[value];
  if (zVal !== undefined) {
    return { zIndex: zVal };
  }
  return {};
}
