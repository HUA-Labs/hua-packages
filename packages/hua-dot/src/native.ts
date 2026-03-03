/**
 * Native-target entry point for React Native consumers.
 *
 * Usage:
 *   import { dot, dotMap } from '@hua-labs/dot/native';
 *   // or auto-resolved via "react-native" condition:
 *   import { dot } from '@hua-labs/dot';
 *
 * All calls go through the native adapter automatically — no need to pass { target: 'native' }.
 */
import type { DotOptions, RNStyleObject, DotStyleMap } from './types';
import { dot as dotCore, dotMap as dotMapCore } from './index';

/** dot() pre-bound to native target */
export function dot(input: string, options?: Omit<DotOptions, 'target'>): RNStyleObject {
  return dotCore(input, { ...options, target: 'native' }) as RNStyleObject;
}

/** dotMap() pre-bound to native target */
export function dotMap(input: string, options?: Omit<DotOptions, 'target'>): DotStyleMap {
  return dotMapCore(input, { ...options, target: 'native' });
}

// Re-export everything else unchanged
export {
  createDotConfig,
  clearDotCache,
  dotCx,
  dotVariants,
  adaptNative,
  adaptWeb,
  _resetNativeWarnings,
} from './index';

// Re-export all types
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
} from './types';

export type {
  VariantProps,
  DotVariantsConfig,
  DotVariantsFn,
  CompoundVariant,
  VariantShape,
} from './variants';
