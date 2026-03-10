import type { FlutterRecipe } from './adapters/flutter-types';

// Re-export RN types from their dedicated file (external API preserved)
export type { RNTransformEntry, RNShadowOffset, RNStyleValue, RNStyleObject } from './adapters/native-types';
export type { AdaptNativeOptions } from './adapters/native-types';
// Import for local use in this file
import type { RNStyleObject } from './adapters/native-types';

/** Target platform for style output */
export type DotTarget = 'web' | 'native' | 'flutter';

/**
 * Support level for a utility family on a given target platform.
 *
 * - `native`: target supports the intent directly (e.g., padding on all targets)
 * - `approximate`: target can produce a similar but not identical effect (e.g., RN shadow via elevation)
 * - `recipe-only`: requires widget/component recipe, not flat style (e.g., gradients on Flutter)
 * - `plugin-backed`: needs ecosystem plugin/package (e.g., backdrop-blur on Flutter)
 * - `unsupported`: not available on this target
 */
export type CapabilityLevel = 'native' | 'approximate' | 'recipe-only' | 'plugin-backed' | 'unsupported';

/** Per-target capability report for a utility family */
export type TargetCapability = Record<DotTarget, CapabilityLevel>;

/** Capability metadata attached to explain output */
export interface DotCapabilityReport {
  /** Utilities that were silently dropped for the target */
  _dropped?: string[];
  /** Utilities that were approximated (not exact match) */
  _approximated?: string[];
  /** Per-family capability levels for the target */
  _capabilities?: Record<string, CapabilityLevel>;
  /** Per-property approximation details (e.g. boxShadow: ['inset dropped', 'spread ignored']) */
  _details?: Record<string, string[]>;
}

/** Parsed representation of a single utility token */
export interface DotToken {
  /** Variant prefixes like 'dark', 'md', 'hover' (Phase 2+) */
  variants: string[];
  /** Category prefix: 'p', 'bg', 'text', 'rounded', etc. Empty string for standalone tokens */
  prefix: string;
  /** Value part: '4', 'primary-500', 'center', etc. For standalone tokens, the full utility name */
  value: string;
  /** Original raw input string */
  raw: string;
  /** Whether this is a negative value token (e.g., -m-4, -top-2) */
  negative: boolean;
  /** Whether this token has the !important modifier (e.g., !p-4) */
  important: boolean;
}

/** Platform-agnostic style object (Web CSSProperties compatible) */
export type StyleObject = Record<string, string | number>;

/** Supported state variant names */
export type DotState = 'hover' | 'focus' | 'active' | 'focus-visible' | 'focus-within' | 'disabled';

/** Style output from any target adapter (web, native, or flutter) */
export type DotAdapterOutput = StyleObject | RNStyleObject | FlutterRecipe;

/** Style map with base styles + optional state-variant styles */
export interface DotStyleMap<T extends DotAdapterOutput = DotAdapterOutput> {
  base: T;
  hover?: T;
  focus?: T;
  active?: T;
  'focus-visible'?: T;
  'focus-within'?: T;
  disabled?: T;
}

/** Resolver function signature — receives config for token lookups */
export type ResolverFn = (prefix: string, value: string, config: DotConfig) => StyleObject;

/** Options for dot() call */
export interface DotOptions {
  dark?: boolean;
  /** Active breakpoint for responsive variants (e.g., 'md', 'lg'). Mobile-first cascade. */
  breakpoint?: string;
  /** Target platform. Overrides config-level runtime setting per call. */
  target?: DotTarget;
}

/** User-provided config for customizing tokens */
export interface DotUserConfig {
  /** Default target platform. 'web' if omitted. */
  runtime?: DotTarget;
  theme?: {
    colors?: Record<string, Record<string, string> | string>;
    spacing?: Record<string, string>;
    borderRadius?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string | number>;
    fontFamily?: Record<string, string>;
    lineHeight?: Record<string, string>;
    letterSpacing?: Record<string, string>;
    zIndex?: Record<string, string | number>;
    shadows?: Record<string, string>;
    opacity?: Record<string, string>;
    rotate?: Record<string, string>;
    scale?: Record<string, string>;
    skew?: Record<string, string>;
    transitionProperty?: Record<string, string>;
    duration?: Record<string, string>;
    timing?: Record<string, string>;
    animation?: Record<string, string>;
    backdropBlur?: Record<string, string>;
    gridCols?: Record<string, string>;
    gridRows?: Record<string, string>;
    ringWidths?: Record<string, string>;
    ringOffsets?: Record<string, string>;
    /**
     * CSS variable-based semantic colors.
     *
     * - **string[]** — auto-mapped to `var(--color-{name})` (or custom `semanticPrefix`)
     * - **Record<string, string>** — explicit mapping (key → CSS variable)
     *
     * Merged with built-in defaults (shadcn tokens).
     *
     * @example
     * // Shorthand (auto-mapped to var(--color-*))
     * semanticColors: ['sidebar', 'sidebar-foreground', 'chart-1']
     *
     * // Explicit mapping
     * semanticColors: { brand: 'var(--my-brand)', accent: 'var(--theme-accent)' }
     */
    semanticColors?: string[] | Record<string, string>;
    /**
     * CSS variable prefix for shorthand semantic colors.
     * Only used when `semanticColors` is a `string[]`.
     * @default '--color'
     *
     * @example
     * semanticPrefix: '--theme'
     * semanticColors: ['brand']
     * // → { brand: 'var(--theme-brand)' }
     */
    semanticPrefix?: string;
  };
  cache?: boolean;
  cacheSize?: number;
  strictMode?: boolean;
  /** Warn on unknown tokens in dev mode. Defaults to true when NODE_ENV=development. */
  warnUnknown?: boolean;
  /** Custom breakpoint names in mobile-first order. Defaults to ['sm','md','lg','xl','2xl']. */
  breakpoints?: string[];
  /** Base pixel value for rem/em conversion in native adapter. Defaults to 16. */
  remBase?: number;
}

/** Internal resolved config */
export interface DotConfig {
  tokens: ResolvedTokens;
  cache: boolean;
  cacheSize: number;
  strictMode: boolean;
  /** Warn on unknown tokens via console.warn. Defaults to true in dev mode. */
  warnUnknown: boolean;
  /** Default target platform */
  runtime: DotTarget;
  /** Breakpoint names in mobile-first order */
  breakpointOrder: string[];
  /** Set of breakpoint names for quick lookup */
  breakpointSet: Set<string>;
  /** Base pixel value for rem/em conversion in native adapter */
  remBase: number;
}

/** Fully resolved token set (defaults + user overrides) */
export interface ResolvedTokens {
  colors: Record<string, Record<string, string> | string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string | number>;
  fontFamily: Record<string, string>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
  zIndex: Record<string, string | number>;
  shadows: Record<string, string>;
  opacity: Record<string, string>;
  rotate: Record<string, string>;
  scale: Record<string, string>;
  skew: Record<string, string>;
  transitionProperty: Record<string, string>;
  duration: Record<string, string>;
  timing: Record<string, string>;
  animation: Record<string, string>;
  backdropBlur: Record<string, string>;
  gridCols: Record<string, string>;
  gridRows: Record<string, string>;
  ringWidths: Record<string, string>;
  ringOffsets: Record<string, string>;
  semanticColors: Record<string, string>;
}
