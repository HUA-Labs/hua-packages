import type { StyleObject, DotConfig } from '../types';
import { TEXT_ALIGNS, TEXT_DECORATION_STYLE, TEXT_DECORATION_THICKNESS, UNDERLINE_OFFSET } from '../tokens/typography';
import { resolveColor } from './color';

/**
 * Resolve typography tokens.
 *
 * Handles `text-` ambiguity: textAlign > fontSize > color fallthrough
 *
 * @example
 * resolveTypography('text', 'center', config)  → { textAlign: 'center' }
 * resolveTypography('text', 'sm', config)      → { fontSize: '14px' }
 * resolveTypography('text', 'red-500', config) → { color: '#ef4444' }
 * resolveTypography('font', 'bold', config)    → { fontWeight: '700' }
 * resolveTypography('leading', 'tight', config) → { lineHeight: '1.25' }
 * resolveTypography('tracking', 'wide', config) → { letterSpacing: '0.025em' }
 */
export function resolveTypography(prefix: string, value: string, config: DotConfig): StyleObject {
  switch (prefix) {
    case 'text': {
      // Priority: textAlign > fontSize > color (fallthrough to resolver router)
      if (TEXT_ALIGNS[value]) {
        return { textAlign: TEXT_ALIGNS[value] };
      }
      if (config.tokens.fontSize[value]) {
        return { fontSize: config.tokens.fontSize[value] };
      }
      // Text wrap utilities
      if (value === 'wrap') return { textWrap: 'wrap' };
      if (value === 'nowrap') return { textWrap: 'nowrap' };
      if (value === 'balance') return { textWrap: 'balance' };
      if (value === 'pretty') return { textWrap: 'pretty' };
      // Color fallthrough: text-red-500, text-white, text-red-500/50, text-[#ff0000]
      return resolveColor('text', value, config);
    }
    case 'font': {
      // Priority: fontWeight > fontFamily
      const weight = config.tokens.fontWeight[value];
      if (weight !== undefined) {
        return { fontWeight: weight };
      }
      const family = config.tokens.fontFamily[value];
      if (family !== undefined) {
        return { fontFamily: family };
      }
      return {};
    }
    case 'leading': {
      if (config.tokens.lineHeight[value]) {
        return { lineHeight: config.tokens.lineHeight[value] };
      }
      return {};
    }
    case 'tracking': {
      if (config.tokens.letterSpacing[value]) {
        return { letterSpacing: config.tokens.letterSpacing[value] };
      }
      return {};
    }
    case 'decoration': {
      // Priority: style > thickness
      if (TEXT_DECORATION_STYLE[value]) {
        return { textDecorationStyle: TEXT_DECORATION_STYLE[value] };
      }
      if (TEXT_DECORATION_THICKNESS[value]) {
        return { textDecorationThickness: TEXT_DECORATION_THICKNESS[value] };
      }
      return {};
    }
    case 'underline-offset': {
      if (UNDERLINE_OFFSET[value]) {
        return { textUnderlineOffset: UNDERLINE_OFFSET[value] };
      }
      return {};
    }
    case 'indent': {
      // Use spacing scale for indent values
      const spacingVal = config.tokens.spacing[value];
      if (spacingVal) {
        return { textIndent: spacingVal };
      }
      return {};
    }
    default:
      return {};
  }
}
