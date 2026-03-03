import type { StyleObject, DotConfig } from '../types';
import { parseArbitrary } from './utils';

/**
 * Resolve line-clamp tokens.
 *
 * @example
 * resolveLineClamp('line-clamp', '3', config) → { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }
 * resolveLineClamp('line-clamp', 'none', config) → { overflow: 'visible', display: 'block', WebkitLineClamp: 'unset', WebkitBoxOrient: 'horizontal' }
 */
export function resolveLineClamp(_prefix: string, value: string, _config: DotConfig): StyleObject {
  // Arbitrary value: line-clamp-[7]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    const num = parseInt(arbitrary, 10);
    if (!isNaN(num) && num > 0) {
      return {
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: num,
        WebkitBoxOrient: 'vertical',
      };
    }
    return {};
  }

  // line-clamp-none → reset
  if (value === 'none') {
    return {
      overflow: 'visible',
      display: 'block',
      WebkitLineClamp: 'unset',
      WebkitBoxOrient: 'horizontal',
    };
  }

  // Numeric value: line-clamp-1, line-clamp-2, ..., line-clamp-6
  const num = parseInt(value, 10);
  if (!isNaN(num) && num > 0) {
    return {
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: num,
      WebkitBoxOrient: 'vertical',
    };
  }

  return {};
}
