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
}

/** Platform-agnostic style object (Web CSSProperties compatible) */
export type StyleObject = Record<string, string | number>;

/** Resolver function signature */
export type ResolverFn = (prefix: string, value: string) => StyleObject;

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
}
