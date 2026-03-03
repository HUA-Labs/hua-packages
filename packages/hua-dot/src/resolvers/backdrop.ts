import type { StyleObject, DotConfig } from '../types';

/**
 * Resolve backdrop tokens:
 * - backdrop-blur-md → { backdropFilter: 'blur(12px)' }
 * - backdrop-blur → { backdropFilter: 'blur(8px)' } (DEFAULT)
 * - backdrop-blur-none → { backdropFilter: 'blur(0)' }
 */
export function resolveBackdrop(_prefix: string, value: string, config: DotConfig): StyleObject {
  const blur = config.tokens.backdropBlur[value];
  if (blur !== undefined) {
    return { backdropFilter: `blur(${blur})` };
  }
  return {};
}
