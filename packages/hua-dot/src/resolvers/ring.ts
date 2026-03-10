import type { StyleObject, DotConfig } from '../types';
import { RING_WIDTHS, RING_OFFSETS, RING_DEFAULT_COLOR, buildRingShadow } from '../tokens/rings';
import { lookupColor } from './color';
import { parseArbitrary } from './utils';

/**
 * Resolve ring tokens.
 *
 * Width: ring, ring-0, ring-2, ring-4, ring-8
 * Color: ring-blue-500, ring-red-300
 * Arbitrary: ring-[5px]
 *
 * @example
 * resolveRing('ring', '', config)         → { boxShadow: '0 0 0 3px #3b82f6' }
 * resolveRing('ring', '2', config)        → { boxShadow: '0 0 0 2px #3b82f6' }
 * resolveRing('ring', 'blue-500', config) → { boxShadow: '0 0 0 3px #3b82f6' }
 */
export function resolveRing(_prefix: string, value: string, config: DotConfig): StyleObject {
  const { colors, semanticColors } = config.tokens;
  // Resolve default ring color from config or semantic colors
  const configRingColor = lookupColor('ring', colors, semanticColors);
  const defaultColor = configRingColor ?? RING_DEFAULT_COLOR;

  // Arbitrary value: ring-[5px]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    return { __dot_ringLayer: buildRingShadow(arbitrary, defaultColor) };
  }

  // Width value: ring (bare), ring-0, ring-1, ring-2, ring-4, ring-8
  const width = RING_WIDTHS[value];
  if (width !== undefined) {
    return { __dot_ringLayer: buildRingShadow(width, defaultColor) };
  }

  // Color value: ring-blue-500, ring-white, etc.
  const color = lookupColor(value, colors, semanticColors);
  if (color) {
    return { __dot_ringLayer: buildRingShadow('3px', color) };
  }

  return {};
}

/**
 * Resolve ring-offset tokens.
 *
 * @example
 * resolveRingOffset('ring-offset', '2', config) → { outlineOffset: '2px' }
 */
export function resolveRingOffset(_prefix: string, value: string, _config: DotConfig): StyleObject {
  // Arbitrary value: ring-offset-[3px]
  const arbitrary = parseArbitrary(value);
  if (arbitrary !== undefined) {
    return { outlineOffset: arbitrary };
  }

  const offset = RING_OFFSETS[value];
  if (offset !== undefined) {
    return { outlineOffset: offset };
  }

  return {};
}
