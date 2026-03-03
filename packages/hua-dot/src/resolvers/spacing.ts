import type { StyleObject, DotConfig } from '../types';
import { SPACING_PROP_MAP } from '../tokens/spacing';
import { parseArbitrary } from './utils';

/**
 * Resolve spacing tokens: p-4 → { padding: '16px' }, mx-auto → { marginLeft: 'auto', marginRight: 'auto' }
 */
export function resolveSpacing(prefix: string, value: string, config: DotConfig): StyleObject {
  const props = SPACING_PROP_MAP[prefix];
  if (!props) return {};

  // Arbitrary value: p-[20px], m-[2rem]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    const result: StyleObject = {};
    for (const prop of props) {
      result[prop] = arbitrary;
    }
    return result;
  }

  const cssValue = config.tokens.spacing[value];
  if (cssValue === undefined) return {};

  const result: StyleObject = {};
  for (const prop of props) {
    result[prop] = cssValue;
  }
  return result;
}
