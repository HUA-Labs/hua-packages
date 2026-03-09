import type { StyleObject, DotConfig } from '../types';
import { TABLE_LAYOUT, CAPTION_SIDE } from '../tokens/table';

/**
 * Resolve table prefix tokens.
 *
 * @example
 * resolveTable('table', 'auto', config)    → { tableLayout: 'auto' }
 * resolveTable('table', 'fixed', config)   → { tableLayout: 'fixed' }
 * resolveTable('caption', 'top', config)   → { captionSide: 'top' }
 * resolveTable('caption', 'bottom', config) → { captionSide: 'bottom' }
 */
export function resolveTable(prefix: string, value: string, _config: DotConfig): StyleObject {
  if (prefix === 'table') {
    if (TABLE_LAYOUT[value]) return { tableLayout: TABLE_LAYOUT[value] };
  }
  if (prefix === 'caption') {
    if (CAPTION_SIDE[value]) return { captionSide: CAPTION_SIDE[value] };
  }
  return {};
}
