import type { DotUserConfig, DotConfig, ResolvedTokens } from "./types";
import { SPACING } from "./tokens/spacing";
import { COLORS, SPECIAL_COLORS, SEMANTIC_COLORS } from "./tokens/colors";
import {
  FONT_SIZES,
  FONT_WEIGHTS,
  FONT_FAMILIES,
  LINE_HEIGHTS,
  LETTER_SPACINGS,
} from "./tokens/typography";
import { BORDER_RADIUS } from "./tokens/borders";
import { Z_INDEX } from "./tokens/z-index";
import { SHADOWS } from "./tokens/shadows";
import { OPACITY } from "./tokens/opacity";
import { ROTATE, SCALE, SKEW } from "./tokens/transforms";
import { TRANSITION_PROPERTY, DURATION, TIMING } from "./tokens/transitions";
import { ANIMATION } from "./tokens/animations";
import { BACKDROP_BLUR } from "./tokens/backdrop";
import { GRID_COLS, GRID_ROWS } from "./tokens/grid";
import { RING_WIDTHS, RING_OFFSETS } from "./tokens/rings";
import { BREAKPOINT_ORDER, BREAKPOINT_WIDTHS } from "./tokens/breakpoints";

/** Default token set built from hua-css data */
const DEFAULT_TOKENS: ResolvedTokens = {
  colors: {
    ...COLORS,
    ...Object.fromEntries(
      Object.entries(SPECIAL_COLORS).map(([k, v]) => [k, v]),
    ),
  },
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
  semanticColors: { ...SEMANTIC_COLORS },
};

/**
 * Deep merge two objects. Source values override target values.
 * Only merges plain objects; arrays and primitives are replaced.
 */

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target };

  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = result[key];

    if (
      sourceVal &&
      typeof sourceVal === "object" &&
      !Array.isArray(sourceVal) &&
      targetVal &&
      typeof targetVal === "object" &&
      !Array.isArray(targetVal)
    ) {
      result[key] = deepMerge(targetVal as any, sourceVal as any) as T[keyof T];
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal as T[keyof T];
    }
  }

  return result;
}

/**
 * Normalize semantic colors from user config.
 *
 * Accepts `string[]` (auto-mapped to `var({prefix}-{name})`) or `Record<string, string>`.
 * Merges with built-in SEMANTIC_COLORS defaults.
 */
function normalizeSemanticColors(
  input: string[] | Record<string, string> | undefined,
  prefix: string,
): Record<string, string> {
  if (!input) return { ...SEMANTIC_COLORS };

  let userMap: Record<string, string>;
  if (Array.isArray(input)) {
    userMap = {};
    for (const name of input) {
      userMap[name] = `var(${prefix}-${name})`;
    }
  } else {
    userMap = input;
  }

  return { ...SEMANTIC_COLORS, ...userMap };
}

/**
 * Resolve user config into final DotConfig by merging with defaults.
 */
export function resolveConfig(userConfig?: DotUserConfig): DotConfig {
  const theme = userConfig?.theme;

  // Normalize semanticColors before deepMerge (handles string[] → Record conversion)
  const semanticPrefix = theme?.semanticPrefix ?? "--color";
  const resolvedSemantic = normalizeSemanticColors(
    theme?.semanticColors,
    semanticPrefix,
  );

  // Strip semanticColors/semanticPrefix from theme before deepMerge (already handled above)
  let themeForMerge: Partial<ResolvedTokens> | undefined;
  if (theme) {
    const { semanticColors: _sc, semanticPrefix: _sp, ...rest } = theme;
    themeForMerge = rest as Partial<ResolvedTokens>;
  }

  const tokens: ResolvedTokens = themeForMerge
    ? deepMerge(DEFAULT_TOKENS, themeForMerge)
    : { ...DEFAULT_TOKENS };

  // Override semanticColors with our normalized version
  tokens.semanticColors = resolvedSemantic;

  const isDev =
    typeof process !== "undefined" && process.env?.NODE_ENV === "development";

  const breakpointOrder = userConfig?.breakpoints ?? [...BREAKPOINT_ORDER];
  const breakpointSet = new Set<string>(breakpointOrder);
  const breakpointWidths = userConfig?.breakpointWidths
    ? { ...BREAKPOINT_WIDTHS, ...userConfig.breakpointWidths }
    : { ...BREAKPOINT_WIDTHS };

  return {
    tokens,
    cache: userConfig?.cache ?? true,
    cacheSize: userConfig?.cacheSize ?? 500,
    strictMode: userConfig?.strictMode ?? false,
    warnUnknown: userConfig?.warnUnknown ?? isDev,
    runtime: userConfig?.runtime ?? "web",
    breakpointOrder,
    breakpointSet,
    breakpointWidths,
    remBase: userConfig?.remBase ?? 16,
  };
}

// ── Global config store (shared across adapters) ──

let _globalConfig: DotConfig | null = null;

/** Store config globally so adapters (e.g. class mode) can pick it up. */
export function setGlobalConfig(config: DotConfig): void {
  _globalConfig = config;
}

/** Get the current global config, or resolve defaults if none was set. */
export function getGlobalConfig(): DotConfig {
  return _globalConfig ?? resolveConfig();
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
