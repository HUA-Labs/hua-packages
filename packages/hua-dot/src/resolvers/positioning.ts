import type { StyleObject, DotConfig } from '../types';
import { INSET_KEYWORDS, INSET_PROP_MAP } from '../tokens/layout';

/**
 * Resolve positioning tokens: top-4 → { top: '16px' }, inset-0 → { top/right/bottom/left: '0px' }
 *
 * Resolution order: INSET_KEYWORDS (auto/full/fractions) > spacing scale
 */
export function resolvePositioning(prefix: string, value: string, config: DotConfig): StyleObject {
  const props = INSET_PROP_MAP[prefix];
  if (!props) return {};

  // Keywords: auto, full, fractions
  const keyword = INSET_KEYWORDS[value];
  if (keyword !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = keyword;
    }
    return result;
  }

  // Spacing scale: inset-4 → '16px'
  const spacingVal = config.tokens.spacing[value];
  if (spacingVal !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = spacingVal;
    }
    return result;
  }

  return {};
}
