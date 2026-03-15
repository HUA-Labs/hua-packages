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
 * divide-{color}   → borderColor (inline style)
 *
 * divide-y / divide-x → internal marker `__dot_divideY` / `__dot_divideX`.
 *   These use CSS child combinator selectors (`> * + *`) which cannot be
 *   expressed as inline styles. The class adapter (class.ts) converts these
 *   markers into proper CSS rules. Web/native adapters strip them silently.
 *
 * divide-y-reverse / divide-x-reverse → `__dot_divideYReverse` / `__dot_divideXReverse`.
 */
export function resolveDivide(prefix: string, value: string, config: DotConfig): StyleObject {
  // divide-y-reverse / divide-x-reverse
  if (prefix === 'divide-y' && value === 'reverse') {
    return { __dot_divideYReverse: '1' };
  }
  if (prefix === 'divide-x' && value === 'reverse') {
    return { __dot_divideXReverse: '1' };
  }

  // divide-y / divide-x — return internal marker for class adapter
  if (prefix === 'divide-y') {
    const width = DIVIDE_WIDTHS[value] ?? '1px';
    return { __dot_divideY: width };
  }
  if (prefix === 'divide-x') {
    const width = DIVIDE_WIDTHS[value] ?? '1px';
    return { __dot_divideX: width };
  }

  // divide-{color}: divide-gray-200, divide-white, divide-primary-500/50
  if (prefix === 'divide') {
    if (DIVIDE_WIDTHS[value] !== undefined && value !== '') return {};
    return resolveColor('border', value, config);
  }

  return {};
}
