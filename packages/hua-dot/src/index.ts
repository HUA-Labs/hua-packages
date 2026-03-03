import type { StyleObject, DotUserConfig, DotConfig } from './types';
import { parse } from './parser';
import { resolveToken } from './resolver';
import { DotCache } from './cache';
import { resolveConfig } from './config';

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
 * dot('text-sm font-bold text-gray-700')
 * // → { fontSize: '14px', fontWeight: '700', color: '#374151' }
 */
export function dot(input: string): StyleObject {
  if (!input || !input.trim()) return {};

  // Layer 1: Full input cache hit
  if (currentConfig.cache) {
    const cached = cache.getInput(input);
    if (cached) return cached;
  }

  // Parse input into tokens
  const tokens = parse(input);

  // Resolve each token and merge
  const result: StyleObject = {};

  for (const token of tokens) {
    // Phase 1: Skip variant tokens (dark:, sm:, hover:, etc.)
    if (token.variants.length > 0) continue;

    let resolved: StyleObject;

    // Layer 2: Token cache hit
    if (currentConfig.cache) {
      const cachedToken = cache.getToken(token.raw);
      if (cachedToken) {
        resolved = cachedToken;
      } else {
        resolved = resolveToken(token);
        cache.setToken(token.raw, resolved);
      }
    } else {
      resolved = resolveToken(token);
    }

    Object.assign(result, resolved);
  }

  // Layer 1: Cache the full result
  if (currentConfig.cache) {
    cache.setInput(input, result);
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
  ResolverFn,
  ResolvedTokens,
} from './types';
