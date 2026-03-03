import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve animation tokens:
 * - animate-spin → { animation: 'spin 1s linear infinite' }
 * - animate-none → { animation: 'none' }
 */
export function resolveAnimation(_prefix: string, value: string, config: DotConfig): StyleObject {
  const anim = config.tokens.animation[value];
  if (anim !== undefined) {
    return { animation: anim };
  }
  return {};
}
