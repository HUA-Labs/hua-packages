import type { StyleObject, DotConfig } from '../types';
import {
  DISPLAY,
  POSITION,
  SIZE_KEYWORDS,
  MAX_WIDTH_KEYWORDS,
  SIZE_PROP_MAP,
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
  }

  // Grid flow standalone
  if (GRID_FLOW[value]) {
    return { gridAutoFlow: GRID_FLOW[value] };
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
