import type { StyleObject, DotConfig } from '../types';
import { LIST_STYLE_TYPE, LIST_STYLE_POSITION } from '../tokens/list';

/**
 * Resolve list prefix tokens.
 *
 * @example
 * resolveList('list', 'disc', config)    → { listStyleType: 'disc' }
 * resolveList('list', 'decimal', config) → { listStyleType: 'decimal' }
 * resolveList('list', 'none', config)    → { listStyleType: 'none' }
 * resolveList('list', 'inside', config)  → { listStylePosition: 'inside' }
 * resolveList('list', 'outside', config) → { listStylePosition: 'outside' }
 */
export function resolveList(_prefix: string, value: string, _config: DotConfig): StyleObject {
  if (LIST_STYLE_TYPE[value]) return { listStyleType: LIST_STYLE_TYPE[value] };
  if (LIST_STYLE_POSITION[value]) return { listStylePosition: LIST_STYLE_POSITION[value] };
  return {};
}
