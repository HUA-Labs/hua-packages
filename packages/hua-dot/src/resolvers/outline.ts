import type { StyleObject, DotConfig } from '../types';
import { resolveColor } from './color';
import { parseArbitrary } from './utils';

const OUTLINE_WIDTHS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
};

const OUTLINE_STYLES: Record<string, string> = {
  'dashed': 'dashed',
  'dotted': 'dotted',
  'double': 'double',
};

const OUTLINE_OFFSETS: Record<string, string> = {
  '0': '0px',
  '1': '1px',
  '2': '2px',
  '4': '4px',
  '8': '8px',
};

/**
 * Resolve outline tokens: outline-2, outline-dashed, outline-red-500, outline-offset-2
 */
export function resolveOutline(prefix: string, value: string, config: DotConfig): StyleObject {
  if (prefix === 'outline') {
    // outline with no value → 1px solid (Tailwind default)
    if (!value) return { outlineWidth: '1px', outlineStyle: 'solid' };

    // outline-none → transparent outline (Tailwind behavior)
    if (value === 'none') return { outline: '2px solid transparent', outlineOffset: '2px' };

    // Arbitrary
    const arb = parseArbitrary(value);
    if (arb !== undefined) return { outlineWidth: arb };

    // Width
    if (OUTLINE_WIDTHS[value]) return { outlineWidth: OUTLINE_WIDTHS[value] };

    // Style
    if (OUTLINE_STYLES[value]) return { outlineStyle: OUTLINE_STYLES[value] };

    // Offset
    if (value.startsWith('offset-')) {
      const offsetVal = value.slice(7);
      const arbOffset = parseArbitrary(offsetVal);
      if (arbOffset !== undefined) return { outlineOffset: arbOffset };
      if (OUTLINE_OFFSETS[offsetVal]) return { outlineOffset: OUTLINE_OFFSETS[offsetVal] };
      return {};
    }

    // Color fallthrough
    return resolveColor('outline', value, config);
  }

  if (prefix === 'outline-offset') {
    const arbOffset = parseArbitrary(value);
    if (arbOffset !== undefined) return { outlineOffset: arbOffset };
    if (OUTLINE_OFFSETS[value]) return { outlineOffset: OUTLINE_OFFSETS[value] };
    return {};
  }

  return {};
}
