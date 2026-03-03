import type { StyleObject } from '../types';
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACINGS,
  TEXT_ALIGNS,
} from '../tokens/typography';
import { lookupColor } from './color';

/**
 * Resolve typography tokens.
 *
 * Handles `text-` ambiguity: textAlign > fontSize > color fallthrough
 *
 * @example
 * resolveTypography('text', 'center')  → { textAlign: 'center' }
 * resolveTypography('text', 'sm')      → { fontSize: '14px' }
 * resolveTypography('text', 'red-500') → { color: '#ef4444' }
 * resolveTypography('font', 'bold')    → { fontWeight: '700' }
 * resolveTypography('leading', 'tight') → { lineHeight: '1.25' }
 * resolveTypography('tracking', 'wide') → { letterSpacing: '0.025em' }
 */
export function resolveTypography(prefix: string, value: string): StyleObject {
  switch (prefix) {
    case 'text': {
      // Priority: textAlign > fontSize > color (fallthrough to resolver router)
      if (TEXT_ALIGNS[value]) {
        return { textAlign: TEXT_ALIGNS[value] };
      }
      if (FONT_SIZES[value]) {
        return { fontSize: FONT_SIZES[value] };
      }
      // Color fallthrough: text-red-500, text-white, etc.
      const hex = lookupColor(value);
      if (hex) {
        return { color: hex };
      }
      return {};
    }
    case 'font': {
      if (FONT_WEIGHTS[value]) {
        return { fontWeight: FONT_WEIGHTS[value] };
      }
      return {};
    }
    case 'leading': {
      if (LINE_HEIGHTS[value]) {
        return { lineHeight: LINE_HEIGHTS[value] };
      }
      return {};
    }
    case 'tracking': {
      if (LETTER_SPACINGS[value]) {
        return { letterSpacing: LETTER_SPACINGS[value] };
      }
      return {};
    }
    default:
      return {};
  }
}
