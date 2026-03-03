import type { DotToken } from './types';
import {
  DISPLAY,
  POSITION,
  FLEX_DIRECTION,
  FLEX_WRAP,
  ALIGN_ITEMS,
  ALIGN_SELF,
  JUSTIFY_CONTENT,
  ALIGN_CONTENT,
  FLEX_GROW,
  FLEX_SHRINK,
  GRID_FLOW,
} from './tokens';

/**
 * Set of standalone tokens that have no prefix-value structure.
 * These map directly to style objects without splitting.
 */
const STANDALONE_TOKENS = new Set<string>([
  // display
  ...Object.keys(DISPLAY),
  // position
  ...Object.keys(POSITION),
  // flexbox standalone
  ...Object.keys(FLEX_DIRECTION),
  ...Object.keys(FLEX_WRAP),
  ...Object.keys(ALIGN_ITEMS),
  ...Object.keys(ALIGN_SELF),
  ...Object.keys(JUSTIFY_CONTENT),
  ...Object.keys(ALIGN_CONTENT),
  ...Object.keys(FLEX_GROW),
  ...Object.keys(FLEX_SHRINK),
  // text transform
  'uppercase',
  'lowercase',
  'capitalize',
  'normal-case',
  // overflow
  'overflow-hidden',
  'overflow-auto',
  'overflow-scroll',
  'overflow-visible',
  'truncate',
  // grid flow
  ...Object.keys(GRID_FLOW),
]);

/**
 * Multi-segment prefixes that contain hyphens.
 * Sorted longest-first for correct matching.
 */
const MULTI_SEGMENT_PREFIXES = [
  // backdrop (longest first)
  'backdrop-blur',
  // border radius directional
  'rounded-tl',
  'rounded-tr',
  'rounded-bl',
  'rounded-br',
  'rounded-t',
  'rounded-r',
  'rounded-b',
  'rounded-l',
  // border width directional
  'border-t',
  'border-r',
  'border-b',
  'border-l',
  'border-x',
  'border-y',
  // sizing
  'min-w',
  'min-h',
  'max-w',
  'max-h',
  // gap
  'gap-x',
  'gap-y',
  // transform
  'translate-x',
  'translate-y',
  'scale-x',
  'scale-y',
  'skew-x',
  'skew-y',
  // Phase 3a: positioning
  'inset-x',
  'inset-y',
  // Phase 3a: grid (longest first)
  'grid-cols',
  'grid-rows',
  'col-span',
  'col-start',
  'col-end',
  'row-span',
  'row-start',
  'row-end',
  'auto-cols',
  'auto-rows',
] as const;

/**
 * Parse a utility string into an array of DotTokens.
 *
 * @example
 * parse('p-4 flex bg-primary-500')
 * // → [
 * //   { variants: [], prefix: 'p', value: '4', raw: 'p-4' },
 * //   { variants: [], prefix: '', value: 'flex', raw: 'flex' },
 * //   { variants: [], prefix: 'bg', value: 'primary-500', raw: 'bg-primary-500' },
 * // ]
 */
export function parse(input: string): DotToken[] {
  if (!input || !input.trim()) return [];
  return input.trim().split(/\s+/).map(parseToken);
}

function parseToken(raw: string): DotToken {
  // Split variant prefixes (dark:, md:, hover:, etc.)
  const parts = raw.split(':');
  let utility = parts.pop()!;
  const variants = parts;

  // Detect negative prefix: -m-4, -top-2, -translate-x-4
  // Must start with '-' followed by a letter (not '--' or '-' alone)
  const negative = utility.length > 1 && utility[0] === '-' && /[a-z]/i.test(utility[1]);
  if (negative) {
    utility = utility.slice(1);
  }

  // Check standalone tokens first (standalone tokens cannot be negative)
  if (STANDALONE_TOKENS.has(utility)) {
    return { variants, prefix: '', value: utility, raw, negative: false };
  }

  // Split into prefix and value
  const { prefix, value } = splitUtility(utility);
  return { variants, prefix, value, raw, negative };
}

/**
 * Split a utility string into prefix and value.
 * Handles multi-segment prefixes like 'gap-x', 'rounded-tl', 'min-w', etc.
 *
 * Examples:
 *   'p-4'             → { prefix: 'p', value: '4' }
 *   'bg-primary-500'  → { prefix: 'bg', value: 'primary-500' }
 *   'gap-x-4'         → { prefix: 'gap-x', value: '4' }
 *   'rounded-tl-lg'   → { prefix: 'rounded-tl', value: 'lg' }
 *   'border'          → { prefix: 'border', value: '' }  (bare prefix)
 *   'rounded'         → { prefix: 'rounded', value: '' }  (bare prefix)
 */
function splitUtility(utility: string): { prefix: string; value: string } {
  // Check multi-segment prefixes first (longest match)
  for (const multi of MULTI_SEGMENT_PREFIXES) {
    if (utility.startsWith(multi + '-')) {
      return { prefix: multi, value: utility.slice(multi.length + 1) };
    }
    // Bare multi-segment prefix (e.g., 'border-t' with no value)
    if (utility === multi) {
      return { prefix: multi, value: '' };
    }
  }

  // Single-segment prefix: split on first hyphen
  const dashIndex = utility.indexOf('-');
  if (dashIndex === -1) {
    // No hyphen: bare prefix (e.g., 'border', 'rounded')
    return { prefix: utility, value: '' };
  }

  return {
    prefix: utility.slice(0, dashIndex),
    value: utility.slice(dashIndex + 1),
  };
}
