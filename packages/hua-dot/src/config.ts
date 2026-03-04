import type { DotUserConfig, DotConfig, ResolvedTokens } from './types';
import { SPACING } from './tokens/spacing';
import { COLORS, SPECIAL_COLORS, SEMANTIC_COLORS } from './tokens/colors';
import { FONT_SIZES, FONT_WEIGHTS, FONT_FAMILIES, LINE_HEIGHTS, LETTER_SPACINGS } from './tokens/typography';
import { BORDER_RADIUS } from './tokens/borders';
import { Z_INDEX } from './tokens/z-index';
import { SHADOWS } from './tokens/shadows';
import { OPACITY } from './tokens/opacity';
import { ROTATE, SCALE, SKEW } from './tokens/transforms';
import { TRANSITION_PROPERTY, DURATION, TIMING } from './tokens/transitions';
import { ANIMATION } from './tokens/animations';
import { BACKDROP_BLUR } from './tokens/backdrop';
import { GRID_COLS, GRID_ROWS } from './tokens/grid';
import { RING_WIDTHS, RING_OFFSETS } from './tokens/rings';
import { BREAKPOINT_ORDER } from './tokens/breakpoints';

/** Default token set built from hua-css data */
const DEFAULT_TOKENS: ResolvedTokens = {
  colors: { ...COLORS, ...Object.fromEntries(
    Object.entries(SPECIAL_COLORS).map(([k, v]) => [k, v])
  ), ...SEMANTIC_COLORS},
  spacing: { ...SPACING },
  borderRadius: { ...BORDER_RADIUS },
  fontSize: { ...FONT_SIZES },
  fontWeight: { ...FONT_WEIGHTS },
  fontFamily: { ...FONT_FAMILIES },
  lineHeight: { ...LINE_HEIGHTS },
  letterSpacing: { ...LETTER_SPACINGS },
  zIndex: { ...Z_INDEX },
  shadows: { ...SHADOWS },
  opacity: { ...OPACITY },
  rotate: { ...ROTATE },
  scale: { ...SCALE },
  skew: { ...SKEW },
  transitionProperty: { ...TRANSITION_PROPERTY },
  duration: { ...DURATION },
  timing: { ...TIMING },
  animation: { ...ANIMATION },
  backdropBlur: { ...BACKDROP_BLUR },
  gridCols: { ...GRID_COLS },
  gridRows: { ...GRID_ROWS },
  ringWidths: { ...RING_WIDTHS },
  ringOffsets: { ...RING_OFFSETS },
};

/**
 * Deep merge two objects. Source values override target values.
 * Only merges plain objects; arrays and primitives are replaced.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal &&
      typeof sourceVal === 'object' &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === 'object' &&
      !Array.isArray(targetVal)
    ) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result[key] = deepMerge(targetVal as any, sourceVal as any) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }

  return result;
}

/**
 * Resolve user config into final DotConfig by merging with defaults.
 */
export function resolveConfig(userConfig?: DotUserConfig): DotConfig {
  const theme = userConfig?.theme;
  const tokens: ResolvedTokens = theme
    ? deepMerge(DEFAULT_TOKENS, theme as Partial<ResolvedTokens>)
    : { ...DEFAULT_TOKENS };

  const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

  const breakpointOrder = userConfig?.breakpoints ?? [...BREAKPOINT_ORDER];
  const breakpointSet = new Set<string>(breakpointOrder);

  return {
    tokens,
    cache: userConfig?.cache ?? true,
    cacheSize: userConfig?.cacheSize ?? 500,
    strictMode: userConfig?.strictMode ?? false,
    warnUnknown: userConfig?.warnUnknown ?? isDev,
    runtime: userConfig?.runtime ?? 'web',
    breakpointOrder,
    breakpointSet,
    remBase: userConfig?.remBase ?? 16,
  };
}

/**
 * Create a custom dot configuration.
 * Merges user tokens with defaults and returns a resolved config.
 *
 * @example
 * const config = createDotConfig({
 *   theme: {
 *     colors: { brand: { 500: '#6630E6' } },
 *     spacing: { '18': '72px' },
 *   },
 * });
 */
export function createDotConfig(userConfig?: DotUserConfig): DotConfig {
  return resolveConfig(userConfig);
}
