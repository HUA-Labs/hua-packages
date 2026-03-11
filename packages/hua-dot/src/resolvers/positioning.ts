import type { StyleObject, DotConfig } from '../types';
import { INSET_KEYWORDS, INSET_PROP_MAP } from '../tokens/layout';
import { parseArbitrary } from './utils';

/**
 * Resolve positioning tokens: top-4 → { top: '16px' }, inset-0 → { top/right/bottom/left: '0px' }
 *
 * Resolution order: INSET_KEYWORDS (auto/full/fractions) > spacing scale > arbitrary
 */
export function resolvePositioning(prefix: string, value: string, config: DotConfig): StyleObject {
  const props = INSET_PROP_MAP[prefix];
  if (!props) return {};

  // Arbitrary value: left-[5px], top-[50%], right-[2rem]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = arbitrary;
    }
    return result;
  }

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
