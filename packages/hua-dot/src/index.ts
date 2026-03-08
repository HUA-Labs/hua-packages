import type { StyleObject, RNStyleObject, DotUserConfig, DotConfig, DotOptions, DotTarget, DotStyleMap, DotState } from './types';
import type { FlutterRecipe } from './adapters/flutter-types';
import { parse } from './parser';
import { resolveToken } from './resolver';
import { DotCache } from './cache';
import { resolveConfig } from './config';
import { adaptNative } from './adapters/native';
import { adaptFlutter } from './adapters/flutter';

/** Keys whose values accumulate (space-separated) instead of last-wins */
const ACCUMULATE_KEYS = new Set(['transform', 'filter', 'backdropFilter']);

/** Internal layer keys that get merged into boxShadow */
const SHADOW_LAYER_KEYS = new Set(['__dot_shadowLayer', '__dot_ringLayer']);

/** Merge resolved styles, accumulating transform/filter/backdropFilter instead of overwriting */
function mergeStyle(target: StyleObject, source: StyleObject): void {
  for (const key of Object.keys(source)) {
    if (ACCUMULATE_KEYS.has(key) && target[key]) {
      target[key] = `${target[key]} ${source[key]}`;
    } else {
      target[key] = source[key];
    }
  }
}

/** Strip trailing ' !important' from a value, return [cleanValue, hadImportant] */
function stripImportant(val: string | number): [string, boolean] {
  if (typeof val !== 'string') return [String(val), false];
  if (val.endsWith(' !important')) {
    return [val.slice(0, -' !important'.length), true];
  }
  return [val, false];
}

/** Finalize style: merge shadow layers into boxShadow, remove internal keys */
function finalizeStyle(style: StyleObject): StyleObject {
  const ringLayer = style.__dot_ringLayer;
  const shadowLayer = style.__dot_shadowLayer;

  // Fast path: no shadow layers
  if (ringLayer === undefined && shadowLayer === undefined) return style;

  const result: StyleObject = {};
  for (const [key, value] of Object.entries(style)) {
    if (!SHADOW_LAYER_KEYS.has(key)) {
      result[key] = value;
    }
  }

  // Compose: ring before shadow (Tailwind convention)
  // Strip !important from individual layers, apply once at the end if any layer had it
  const layers: string[] = [];
  let anyImportant = false;

  if (ringLayer !== undefined) {
    const [clean, imp] = stripImportant(ringLayer);
    layers.push(clean);
    if (imp) anyImportant = true;
  }
  if (shadowLayer !== undefined) {
    const [clean, imp] = stripImportant(shadowLayer);
    layers.push(clean);
    if (imp) anyImportant = true;
  }

  result.boxShadow = layers.join(', ') + (anyImportant ? ' !important' : '');

  return result;
}

/** Append !important to all values in a style object */
function applyImportant(style: StyleObject): StyleObject {
  const result: StyleObject = {};
  for (const [key, value] of Object.entries(style)) {
    result[key] = typeof value === 'string' && !value.endsWith('!important')
      ? `${value} !important`
      : typeof value === 'number'
        ? `${value} !important`
        : value;
  }
  return result;
}

/** Supported state variants for dotMap() */
const STATE_VARIANT_SET = new Set<string>([
  'hover', 'focus', 'active', 'focus-visible', 'focus-within', 'disabled',
]);

/** Categorize a token's variants into dark, breakpoint, state, and unsupported */
function categorizeVariants(variants: string[], breakpointSet: Set<string>): {
  dark: boolean;
  breakpoint: string | null;
  state: string | null;
  unsupported: boolean;
} {
  let dark = false;
  let breakpoint: string | null = null;
  let state: string | null = null;
  let unsupported = false;
  for (const v of variants) {
    if (v === 'dark') dark = true;
    else if (breakpointSet.has(v)) breakpoint = v;
    else if (STATE_VARIANT_SET.has(v)) state = v;
    else unsupported = true;
  }
  return { dark, breakpoint, state, unsupported };
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
export function dot(input: string | undefined | null, options?: DotOptions): StyleObject | RNStyleObject | FlutterRecipe {
  if (!input || !input.trim()) return {};

  const isDark = options?.dark === true;
  const activeBreakpoint = options?.breakpoint;
  const target: DotTarget = options?.target ?? currentConfig.runtime;
  const isNative = target === 'native';
  const isFlutter = target === 'flutter';
  const bpOrder = currentConfig.breakpointOrder;
  const activeBpIndex = activeBreakpoint
    ? bpOrder.indexOf(activeBreakpoint)
    : -1;

  // Layer 1: Full input cache hit (cache key encodes full context including target)
  const targetPrefix = isFlutter ? '\x02f' : isNative ? '\x02n' : '';
  const cacheKey = `${targetPrefix}${activeBreakpoint ?? ''}${isDark ? '\x01d' : ''}\x01${input}`;
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
    const { dark, breakpoint, state, unsupported } = categorizeVariants(token.variants, currentConfig.breakpointSet);

    // Skip unsupported and state variants (dot() returns flat styles; use dotMap() for states)
    if (unsupported || state) continue;

    // Skip dark tokens in light mode
    if (dark && !isDark) continue;

    // Skip responsive tokens when no active breakpoint or below active
    if (breakpoint) {
      if (activeBpIndex === -1) continue;
      const tokenBpIndex = bpOrder.indexOf(breakpoint);
      if (tokenBpIndex === -1 || tokenBpIndex > activeBpIndex) continue;
    }

    // Strip variants and !important from raw for resolution
    let rawUtility = token.raw.includes(':')
      ? token.raw.slice(token.raw.lastIndexOf(':') + 1)
      : token.raw;
    if (rawUtility.startsWith('!')) rawUtility = rawUtility.slice(1);

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

    // Apply !important if flagged
    if (token.important) {
      resolved = applyImportant(resolved);
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
      const bp = bpOrder[i];
      if (bpLayers[bp]) Object.assign(result, bpLayers[bp]);
    }
  }

  if (isDark) {
    Object.assign(result, darkBase);
    if (activeBpIndex >= 0) {
      for (let i = 0; i <= activeBpIndex; i++) {
        const bp = bpOrder[i];
        if (darkBpLayers[bp]) Object.assign(result, darkBpLayers[bp]);
      }
    }
  }

  // Finalize shadow layers → boxShadow
  const finalized = finalizeStyle(result);

  // Apply target adapter
  let finalResult: StyleObject | RNStyleObject | FlutterRecipe;
  if (isFlutter) {
    finalResult = adaptFlutter(finalized, { remBase: currentConfig.remBase });
  } else if (isNative) {
    finalResult = adaptNative(finalized, { remBase: currentConfig.remBase, warnDropped: currentConfig.warnUnknown });
  } else {
    finalResult = finalized;
  }

  // Layer 1: Cache the full result
  if (currentConfig.cache) {
    cache.setInput(cacheKey, finalResult as StyleObject);
  }

  return finalResult;
}

import type { CapabilityLevel, DotCapabilityReport } from './types';
import { getCapability } from './capabilities';

/** Result of dotExplain() — resolved styles plus capability metadata */
export interface DotExplainResult {
  /** Resolved style object (same as dot() output) */
  styles: StyleObject | RNStyleObject | FlutterRecipe;
  /** Capability report for the target */
  report: DotCapabilityReport;
}

/**
 * Resolve a utility string and return both styles and a capability report.
 *
 * The report lists which utilities were dropped, approximated, or have
 * limited support on the target platform.
 *
 * @example
 * dotExplain('p-4 blur-md grid grid-cols-3', { target: 'native' })
 * // → {
 * //   styles: { padding: 16, ... },
 * //   report: {
 * //     _dropped: ['filter', 'gridTemplateColumns'],
 * //     _approximated: [],
 * //     _capabilities: { spacing: 'native', filter: 'unsupported', grid: 'unsupported' }
 * //   }
 * // }
 */
export function dotExplain(input: string | undefined | null, options?: DotOptions): DotExplainResult {
  const target: DotTarget = options?.target ?? currentConfig.runtime;

  if (!input || !input.trim() || target === 'web') {
    const styles = dot(input, options);
    return { styles, report: {} };
  }

  // Resolve as web first to see all CSS properties before native drops them
  const webStyles = dot(input, { ...options, target: 'web' });
  // Then resolve as native for final output
  const styles = dot(input, options);

  const dropped: string[] = [];
  const approximated: string[] = [];
  const capabilities: Record<string, CapabilityLevel> = {};

  for (const prop of Object.keys(webStyles)) {
    const level = getCapability(prop, target);

    if (level === 'unsupported') {
      dropped.push(prop);
    } else if (level === 'approximate') {
      approximated.push(prop);
    }

    if (level !== 'native') {
      capabilities[prop] = level;
    }
  }

  const report: DotCapabilityReport = {};
  if (dropped.length > 0) report._dropped = dropped;
  if (approximated.length > 0) report._approximated = approximated;
  if (Object.keys(capabilities).length > 0) report._capabilities = capabilities;

  return { styles, report };
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

/**
 * Convert a utility string into a style map with base + state-variant styles.
 *
 * Unlike dot(), this function resolves hover:/focus:/active: variants
 * into separate style objects for the consumer to apply via event handlers.
 *
 * @example
 * dotMap('p-4 bg-white hover:bg-gray-100 focus:ring-2')
 * // → {
 * //   base: { padding: '16px', backgroundColor: '#ffffff' },
 * //   hover: { backgroundColor: '#f3f4f6' },
 * //   focus: { boxShadow: '...' },
 * // }
 *
 * // React usage:
 * const styles = dotMap('bg-white hover:bg-gray-100');
 * <div style={styles.base} onMouseEnter={...} />
 */
export function dotMap(input: string | undefined | null, options?: DotOptions): DotStyleMap {
  if (!input || !input.trim()) return { base: {} };

  const isDark = options?.dark === true;
  const activeBreakpoint = options?.breakpoint;
  const target: DotTarget = options?.target ?? currentConfig.runtime;
  const isNative = target === 'native';
  const isFlutter = target === 'flutter';
  const bpOrder = currentConfig.breakpointOrder;
  const activeBpIndex = activeBreakpoint
    ? bpOrder.indexOf(activeBreakpoint)
    : -1;

  // Cache key with map prefix
  const targetPrefix = isFlutter ? '\x02f' : isNative ? '\x02n' : '';
  const cacheKey = `\x03m${targetPrefix}${activeBreakpoint ?? ''}${isDark ? '\x01d' : ''}\x01${input}`;
  if (currentConfig.cache) {
    const cached = cache.getInput(cacheKey);
    if (cached && typeof cached === 'object' && 'base' in cached) {
      return cached as unknown as DotStyleMap;
    }
  }

  const tokens = parse(input);

  // Base buckets (same as dot())
  const base: StyleObject = {};
  const bpLayers: Record<string, StyleObject> = {};
  const darkBase: StyleObject = {};
  const darkBpLayers: Record<string, StyleObject> = {};

  // State buckets
  const stateLayers: Record<string, StyleObject> = {};

  for (const token of tokens) {
    const { dark, breakpoint, state, unsupported } = categorizeVariants(token.variants, currentConfig.breakpointSet);

    if (unsupported) continue;
    if (dark && !isDark) continue;

    if (breakpoint) {
      if (activeBpIndex === -1) continue;
      const tokenBpIndex = bpOrder.indexOf(breakpoint);
      if (tokenBpIndex === -1 || tokenBpIndex > activeBpIndex) continue;
    }

    let rawUtility = token.raw.includes(':')
      ? token.raw.slice(token.raw.lastIndexOf(':') + 1)
      : token.raw;
    if (rawUtility.startsWith('!')) rawUtility = rawUtility.slice(1);

    const resolveTarget = { ...token, variants: [], raw: rawUtility };

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

    // Apply !important if flagged
    if (token.important) {
      resolved = applyImportant(resolved);
    }

    // Route: state variants go to state buckets, rest same as dot()
    if (state) {
      if (!stateLayers[state]) stateLayers[state] = {};
      mergeStyle(stateLayers[state], resolved);
    } else if (!dark && !breakpoint) {
      mergeStyle(base, resolved);
    } else if (!dark && breakpoint) {
      if (!bpLayers[breakpoint]) bpLayers[breakpoint] = {};
      mergeStyle(bpLayers[breakpoint], resolved);
    } else if (dark && !breakpoint) {
      mergeStyle(darkBase, resolved);
    } else {
      if (!darkBpLayers[breakpoint!]) darkBpLayers[breakpoint!] = {};
      mergeStyle(darkBpLayers[breakpoint!], resolved);
    }
  }

  // Cascade base styles (same as dot())
  const baseResult: StyleObject = { ...base };
  if (activeBpIndex >= 0) {
    for (let i = 0; i <= activeBpIndex; i++) {
      const bp = bpOrder[i];
      if (bpLayers[bp]) Object.assign(baseResult, bpLayers[bp]);
    }
  }
  if (isDark) {
    Object.assign(baseResult, darkBase);
    if (activeBpIndex >= 0) {
      for (let i = 0; i <= activeBpIndex; i++) {
        const bp = bpOrder[i];
        if (darkBpLayers[bp]) Object.assign(baseResult, darkBpLayers[bp]);
      }
    }
  }

  // Finalize shadow layers → boxShadow
  const finalizedBase = finalizeStyle(baseResult);

  // Apply target adapter to a style object
  const applyAdapter = (style: StyleObject): StyleObject | RNStyleObject | FlutterRecipe => {
    if (isFlutter) return adaptFlutter(style, { remBase: currentConfig.remBase });
    if (isNative) return adaptNative(style, { remBase: currentConfig.remBase, warnDropped: currentConfig.warnUnknown });
    return style;
  };

  // Build result
  const result: DotStyleMap = {
    base: applyAdapter(finalizedBase),
  };

  for (const [stateKey, stateStyle] of Object.entries(stateLayers)) {
    if (Object.keys(stateStyle).length > 0) {
      const finalizedState = finalizeStyle(stateStyle);
      result[stateKey as DotState] = applyAdapter(finalizedState);
    }
  }

  // Cache
  if (currentConfig.cache) {
    cache.setInput(cacheKey, result as unknown as StyleObject);
  }

  return result;
}

// Re-export types for consumers
export type {
  StyleObject,
  DotToken,
  DotUserConfig,
  DotConfig,
  DotOptions,
  DotTarget,
  DotState,
  DotStyleMap,
  ResolverFn,
  ResolvedTokens,
  RNStyleObject,
  RNStyleValue,
  RNTransformEntry,
  RNShadowOffset,
  CapabilityLevel,
  TargetCapability,
  DotCapabilityReport,
} from './types';

// Re-export capabilities
export { CAPABILITY_MATRIX, PROPERTY_TO_FAMILY, getCapability } from './capabilities';

// Re-export adapters for direct usage
export { adaptNative, _resetNativeWarnings } from './adapters/native';
export type { AdaptNativeOptions } from './adapters/native';
export { adaptWeb } from './adapters/web';
export { adaptFlutter } from './adapters/flutter';
export type { AdaptFlutterOptions } from './adapters/flutter';
export type {
  FlutterRecipe, FlutterDecoration, FlutterEdgeInsets, FlutterConstraints,
  FlutterLayout, FlutterFlexChild, FlutterPositioning, FlutterTextStyle,
  FlutterTransform, FlutterBoxShadow, FlutterBorderSide, FlutterBorderRadius,
} from './adapters/flutter-types';

// Re-export cx utility
export { dotCx } from './cx';

// Re-export variants (CVA replacement) — inject dot function to avoid circular import
import { _setDotFn, _setGetRuntime, dotVariants } from './variants';
_setDotFn(dot as (input: string, options?: DotOptions) => StyleObject);
_setGetRuntime(() => currentConfig.runtime);
export { dotVariants };
export type { VariantProps, DotVariantsConfig, DotVariantsFn, CompoundVariant, VariantShape } from './variants';
