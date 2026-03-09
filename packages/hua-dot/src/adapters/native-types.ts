/**
 * React Native specific types for the native adapter.
 *
 * Separated from core types.ts to keep platform-specific definitions isolated.
 */

/** Single RN transform entry, e.g. { translateX: 16 } or { rotate: '45deg' } */
export type RNTransformEntry = Record<string, string | number>;

/** RN shadowOffset shape */
export interface RNShadowOffset {
  width: number;
  height: number;
}

/** Possible value types in an RN StyleSheet object */
export type RNStyleValue = string | number | RNTransformEntry[] | RNShadowOffset;

/** React Native StyleSheet-compatible style object */
export type RNStyleObject = Record<string, RNStyleValue>;

/** Options for adaptNative() */
export interface AdaptNativeOptions {
  remBase?: number;
  /** When true, emit console.warn for dropped CSS properties (once per property per session) */
  warnDropped?: boolean;
}
