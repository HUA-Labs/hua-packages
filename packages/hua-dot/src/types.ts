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
}

/** Platform-agnostic style object (Web CSSProperties compatible) */
export type StyleObject = Record<string, string | number>;

/** Resolver function signature — receives config for token lookups */
export type ResolverFn = (prefix: string, value: string, config: DotConfig) => StyleObject;

/** Options for dot() call */
export interface DotOptions {
  dark?: boolean;
  /** Active breakpoint for responsive variants (e.g., 'md', 'lg'). Mobile-first cascade. */
  breakpoint?: string;
}

/** User-provided config for customizing tokens */
export interface DotUserConfig {
  theme?: {
    colors?: Record<string, Record<string, string> | string>;
    spacing?: Record<string, string>;
    borderRadius?: Record<string, string>;
    fontSize?: Record<string, string>;
    fontWeight?: Record<string, string | number>;
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
  };
  cache?: boolean;
  cacheSize?: number;
  strictMode?: boolean;
}

/** Internal resolved config */
export interface DotConfig {
  tokens: ResolvedTokens;
  cache: boolean;
  cacheSize: number;
  strictMode: boolean;
}

/** Fully resolved token set (defaults + user overrides) */
export interface ResolvedTokens {
  colors: Record<string, Record<string, string> | string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  fontSize: Record<string, string>;
  fontWeight: Record<string, string | number>;
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
}
