import type { StyleObject, DotConfig } from '../types';
import { SCROLL_BEHAVIOR, SCROLL_SPACING_PROP_MAP } from '../tokens/scroll';

/**
 * Resolve scroll prefix tokens.
 *
 * Handles both behavior variants (scroll-auto, scroll-smooth)
 * and scroll margin/padding variants (scroll-m-4, scroll-px-2, etc.).
 *
 * @example
 * resolveScroll('scroll', 'auto', config)   → { scrollBehavior: 'auto' }
 * resolveScroll('scroll', 'smooth', config) → { scrollBehavior: 'smooth' }
 * resolveScroll('scroll-m', '4', config)    → { scrollMarginTop: '16px', ... }
 * resolveScroll('scroll-mx', '2', config)   → { scrollMarginLeft: '8px', scrollMarginRight: '8px' }
 * resolveScroll('scroll-pt', '8', config)   → { scrollPaddingTop: '32px' }
 */
export function resolveScroll(prefix: string, value: string, config: DotConfig): StyleObject {
  // scroll-auto, scroll-smooth (prefix === 'scroll')
  if (prefix === 'scroll') {
    if (SCROLL_BEHAVIOR[value]) return { scrollBehavior: SCROLL_BEHAVIOR[value] };
    return {};
  }

  // scroll-m-*, scroll-mx-*, scroll-my-*, scroll-mt-*, ...,
  // scroll-p-*, scroll-px-*, scroll-py-*, scroll-pt-*, ...
  const props = SCROLL_SPACING_PROP_MAP[prefix];
  if (!props) return {};

  const spacingVal = config.tokens.spacing[value];
  if (!spacingVal) return {};

  const result: StyleObject = {};
  for (const prop of props) {
    result[prop] = spacingVal;
  }
  return result;
}
