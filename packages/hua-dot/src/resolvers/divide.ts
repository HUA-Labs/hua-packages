import type { StyleObject, DotConfig } from '../types';
import { resolveColor } from './color';

const DIVIDE_WIDTHS: Record<string, string> = {
  '': '1px',   // divide-y, divide-x (bare — no value = 1px)
  '0': '0px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
};

/**
 * Resolve divide tokens.
 *
 * divide-{color}   → borderColor
 *
 * NOTE: divide-x / divide-y (width utilities) are NOT supported.
 * Tailwind uses `> * + *` child combinator selectors for divide widths,
 * which cannot be expressed as inline styles on a single element.
 * Use CSS classes or a wrapper component for divide spacing.
 */
export function resolveDivide(prefix: string, value: string, config: DotConfig): StyleObject {
  // divide-y, divide-x — unsupported (requires child combinator selector)
  if (prefix === 'divide-y' || prefix === 'divide-x') {
    return {};
  }

  // divide-{color}: divide-gray-200, divide-white, divide-primary-500/50
  if (prefix === 'divide') {
    if (DIVIDE_WIDTHS[value] !== undefined && value !== '') return {};
    return resolveColor('border', value, config);
  }

  return {};
}
