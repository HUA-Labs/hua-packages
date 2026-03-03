import type { StyleObject, DotUserConfig, DotConfig, DotOptions } from './types';
import { parse } from './parser';
import { resolveToken } from './resolver';
import { DotCache } from './cache';
import { resolveConfig } from './config';
import { BREAKPOINT_ORDER, BREAKPOINT_SET } from './tokens/breakpoints';

/** Merge resolved styles, accumulating transform values instead of overwriting */
function mergeStyle(target: StyleObject, source: StyleObject): void {
  for (const key of Object.keys(source)) {
    if (key === 'transform' && target[key]) {
      target[key] = `${target[key]} ${source[key]}`;
    } else {
      target[key] = source[key];
    }
  }
}

/** Categorize a token's variants into dark, breakpoint, and unsupported */
function categorizeVariants(variants: string[]): {
  dark: boolean;
  breakpoint: string | null;
  unsupported: boolean;
} {
  let dark = false;
  let breakpoint: string | null = null;
  let unsupported = false;
  for (const v of variants) {
    if (v === 'dark') dark = true;
    else if (BREAKPOINT_SET.has(v)) breakpoint = v;
    else unsupported = true;
  }
  return { dark, breakpoint, unsupported };
}

// Module-level singleton state
let currentConfig: DotConfig = resolveConfig();
let cache = new DotCache(currentConfig.cacheSize);

/**
 * Convert a utility string into a CSSProperties-compatible style object.
 *
 * @example
 * dot('p-4 flex items-center bg-primary-500')
 * // → { padding: '16px', display: 'flex', alignItems: 'center', backgroundColor: '#3b82f6' }
 *
 * dot('bg-white dark:bg-gray-900', { dark: true })
 * // → { backgroundColor: '#111827' }
 *
 * dot('p-4 md:p-8 lg:p-12', { breakpoint: 'lg' })
 * // → { padding: '48px' }  (mobile-first cascade: base → md → lg)
 */
export function dot(input: string, options?: DotOptions): StyleObject {
  if (!input || !input.trim()) return {};

  const isDark = options?.dark === true;
  const activeBreakpoint = options?.breakpoint;
  const activeBpIndex = activeBreakpoint
    ? BREAKPOINT_ORDER.indexOf(activeBreakpoint as typeof BREAKPOINT_ORDER[number])
    : -1;

  // Layer 1: Full input cache hit (cache key encodes full context)
  const cacheKey = `${activeBreakpoint ?? ''}${isDark ? '\x01d' : ''}\x01${input}`;
  if (currentConfig.cache) {
    const cached = cache.getInput(cacheKey);
    if (cached) return cached;
  }

  // Parse input into tokens
  const tokens = parse(input);

  // Resolve each token into layered buckets
  const base: StyleObject = {};
  const bpLayers: Record<string, StyleObject> = {};
  const darkBase: StyleObject = {};
  const darkBpLayers: Record<string, StyleObject> = {};

  for (const token of tokens) {
    const { dark, breakpoint, unsupported } = categorizeVariants(token.variants);

    // Skip unsupported variants (hover:, focus:, etc.)
    if (unsupported) continue;

    // Skip dark tokens in light mode
    if (dark && !isDark) continue;

    // Skip responsive tokens when no active breakpoint or below active
    if (breakpoint) {
      if (activeBpIndex === -1) continue;
      const tokenBpIndex = BREAKPOINT_ORDER.indexOf(breakpoint as typeof BREAKPOINT_ORDER[number]);
      if (tokenBpIndex === -1 || tokenBpIndex > activeBpIndex) continue;
    }

    // Strip variants from raw for resolution
    const rawUtility = token.raw.includes(':')
      ? token.raw.slice(token.raw.lastIndexOf(':') + 1)
      : token.raw;
    const resolveTarget = { ...token, variants: [], raw: rawUtility };

    // Resolve (with token cache)
    let resolved: StyleObject;
    const tokenCacheKey = resolveTarget.raw;
    if (currentConfig.cache) {
      const cachedToken = cache.getToken(tokenCacheKey);
      if (cachedToken) {
        resolved = cachedToken;
      } else {
        resolved = resolveToken(resolveTarget, currentConfig);
        cache.setToken(tokenCacheKey, resolved);
      }
    } else {
      resolved = resolveToken(resolveTarget, currentConfig);
    }

    // Route to the correct layer
    if (!dark && !breakpoint) {
      mergeStyle(base, resolved);
    } else if (!dark && breakpoint) {
      if (!bpLayers[breakpoint]) bpLayers[breakpoint] = {};
      mergeStyle(bpLayers[breakpoint], resolved);
    } else if (dark && !breakpoint) {
      mergeStyle(darkBase, resolved);
    } else {
      // dark + breakpoint
      if (!darkBpLayers[breakpoint!]) darkBpLayers[breakpoint!] = {};
      mergeStyle(darkBpLayers[breakpoint!], resolved);
    }
  }

  // Cascade merge: base → sm → md → lg → xl → 2xl → dark → dark:sm → ...
  const result: StyleObject = { ...base };

  if (activeBpIndex >= 0) {
    for (let i = 0; i <= activeBpIndex; i++) {
      const bp = BREAKPOINT_ORDER[i];
      if (bpLayers[bp]) Object.assign(result, bpLayers[bp]);
    }
  }

  if (isDark) {
    Object.assign(result, darkBase);
    if (activeBpIndex >= 0) {
      for (let i = 0; i <= activeBpIndex; i++) {
        const bp = BREAKPOINT_ORDER[i];
        if (darkBpLayers[bp]) Object.assign(result, darkBpLayers[bp]);
      }
    }
  }

  // Layer 1: Cache the full result
  if (currentConfig.cache) {
    cache.setInput(cacheKey, result);
  }

  return result;
}

/**
 * Create a custom dot configuration with token overrides.
 * Applies the config globally (module-level singleton).
 *
 * @example
 * createDotConfig({
 *   theme: {
 *     colors: { brand: { 500: '#6630E6' } },
 *     spacing: { '18': '72px' },
 *   },
 * });
 */
export function createDotConfig(userConfig?: DotUserConfig): DotConfig {
  currentConfig = resolveConfig(userConfig);
  cache = new DotCache(currentConfig.cacheSize);
  return currentConfig;
}

/**
 * Clear both input and token caches.
 * Useful when config changes or for memory management.
 */
export function clearDotCache(): void {
  cache.clear();
}

// Re-export types for consumers
export type {
  StyleObject,
  DotToken,
  DotUserConfig,
  DotConfig,
  DotOptions,
  ResolverFn,
  ResolvedTokens,
} from './types';
