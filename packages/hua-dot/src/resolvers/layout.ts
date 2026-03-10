import type { StyleObject, DotConfig } from '../types';
import {
  DISPLAY,
  POSITION,
  SIZE_KEYWORDS,
  MAX_WIDTH_KEYWORDS,
  SIZE_PROP_MAP,
  ASPECT_RATIO,
  FLOAT,
  CLEAR,
  ISOLATION,
} from '../tokens/layout';
import { GRID_FLOW } from '../tokens/grid';
import { parseArbitrary } from './utils';

/**
 * Resolve standalone layout tokens: flex → { display: 'flex' }, absolute → { position: 'absolute' }
 */
export function resolveLayout(value: string): StyleObject {
  if (DISPLAY[value]) {
    return { display: DISPLAY[value] };
  }
  if (POSITION[value]) {
    return { position: POSITION[value] };
  }

  // Text transform standalone
  switch (value) {
    case 'uppercase': return { textTransform: 'uppercase' };
    case 'lowercase': return { textTransform: 'lowercase' };
    case 'capitalize': return { textTransform: 'capitalize' };
    case 'normal-case': return { textTransform: 'none' };
    // Overflow standalone
    case 'overflow-hidden': return { overflow: 'hidden' };
    case 'overflow-auto': return { overflow: 'auto' };
    case 'overflow-scroll': return { overflow: 'scroll' };
    case 'overflow-visible': return { overflow: 'visible' };
    case 'truncate': return {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
    // Font style
    case 'italic': return { fontStyle: 'italic' };
    case 'not-italic': return { fontStyle: 'normal' };
    // Text decoration line
    case 'underline': return { textDecorationLine: 'underline' };
    case 'overline': return { textDecorationLine: 'overline' };
    case 'line-through': return { textDecorationLine: 'line-through' };
    case 'no-underline': return { textDecorationLine: 'none' };
    // Overflow directional
    case 'overflow-x-auto': return { overflowX: 'auto' };
    case 'overflow-x-hidden': return { overflowX: 'hidden' };
    case 'overflow-x-scroll': return { overflowX: 'scroll' };
    case 'overflow-x-visible': return { overflowX: 'visible' };
    case 'overflow-y-auto': return { overflowY: 'auto' };
    case 'overflow-y-hidden': return { overflowY: 'hidden' };
    case 'overflow-y-scroll': return { overflowY: 'scroll' };
    case 'overflow-y-visible': return { overflowY: 'visible' };
    // Background clip
    case 'bg-clip-text': return { backgroundClip: 'text', WebkitBackgroundClip: 'text' };
    case 'bg-clip-border': return { backgroundClip: 'border-box' };
    case 'bg-clip-padding': return { backgroundClip: 'padding-box' };
    case 'bg-clip-content': return { backgroundClip: 'content-box' };
    // Font smoothing
    case 'antialiased': return { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' };
    case 'subpixel-antialiased': return { WebkitFontSmoothing: 'auto', MozOsxFontSmoothing: 'auto' };
  }

  // Visibility
  if (value === 'visible') return { visibility: 'visible' };
  if (value === 'invisible') return { visibility: 'hidden' };

  // Accessibility: sr-only / not-sr-only
  if (value === 'sr-only') {
    return {
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    };
  }
  if (value === 'not-sr-only') {
    return {
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
      borderWidth: '0',
    };
  }

  // Float / clear / isolation standalone
  if (FLOAT[value]) return { float: FLOAT[value] };
  if (CLEAR[value]) return { clear: CLEAR[value] };
  if (ISOLATION[value]) return { isolation: ISOLATION[value] };

  // Grid flow standalone
  if (GRID_FLOW[value]) {
    return { gridAutoFlow: GRID_FLOW[value] };
  }

  return {};
}

/**
 * Resolve aspect-ratio tokens: aspect-auto, aspect-square, aspect-video, aspect-[4/3]
 */
export function resolveAspectRatio(_prefix: string, value: string, _config: DotConfig): StyleObject {
  // Arbitrary value: aspect-[4/3]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    return { aspectRatio: arbitrary };
  }

  const ratio = ASPECT_RATIO[value];
  if (ratio) {
    return { aspectRatio: ratio };
  }

  return {};
}

/**
 * Resolve sizing tokens: w-full → { width: '100%' }, h-12 → { height: '48px' }
 *
 * Resolution order: keyword > spacing scale > max-width keywords (for max-w only)
 */
export function resolveSizing(prefix: string, value: string, config: DotConfig): StyleObject {
  const prop = SIZE_PROP_MAP[prefix];
  if (!prop) return {};

  // Arbitrary value: w-[300px], h-[50vh]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) return { [prop]: arbitrary };

  // Keywords: full, screen, auto, fractions, etc.
  if (SIZE_KEYWORDS[value]) {
    // h-screen uses 100vh, w-screen uses 100vw
    if (value === 'screen' && (prefix === 'w' || prefix === 'min-w' || prefix === 'max-w')) {
      return { [prop]: '100vw' };
    }
    return { [prop]: SIZE_KEYWORDS[value] };
  }

  // Max-width specific keywords: max-w-md, max-w-prose, etc.
  if (prefix === 'max-w' && MAX_WIDTH_KEYWORDS[value]) {
    return { [prop]: MAX_WIDTH_KEYWORDS[value] };
  }

  // Spacing scale: w-4 → '16px', h-8 → '32px'
  const spacingVal = config.tokens.spacing[value];
  if (spacingVal) {
    return { [prop]: spacingVal };
  }

  return {};
}
