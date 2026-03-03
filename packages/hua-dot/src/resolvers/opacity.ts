import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve opacity tokens: opacity-50 → { opacity: '0.5' }
 */
export function resolveOpacity(_prefix: string, value: string, config: DotConfig): StyleObject {
  const cssValue = config.tokens.opacity[value];
  if (cssValue !== undefined) {
    return { opacity: cssValue };
  }
  return {};
}
