/**
 * Type-level tests for dot() / dotMap() overload resolution.
 *
 * These tests verify compile-time type inference — they don't run code,
 * just assert that TypeScript resolves the correct return types.
 */
import { describe, it, expectTypeOf } from 'vitest';
import { dot, dotMap } from '../index';
import type { StyleObject, DotTarget, DotAdapterOutput, DotStyleMap } from '../types';
import type { RNStyleObject } from '../adapters/native-types';
import type { FlutterRecipe } from '../adapters/flutter-types';

describe('dot() overload type inference', () => {
  it('no target → StyleObject', () => {
    const result = dot('p-4');
    expectTypeOf(result).toEqualTypeOf<StyleObject>();
  });

  it('target: "web" → StyleObject', () => {
    const result = dot('p-4', { target: 'web' });
    expectTypeOf(result).toEqualTypeOf<StyleObject>();
  });

  it('target: "native" → RNStyleObject', () => {
    const result = dot('p-4', { target: 'native' });
    expectTypeOf(result).toEqualTypeOf<RNStyleObject>();
  });

  it('target: "flutter" → FlutterRecipe', () => {
    const result = dot('p-4', { target: 'flutter' });
    expectTypeOf(result).toEqualTypeOf<FlutterRecipe>();
  });

  it('target: DotTarget variable → DotAdapterOutput (union)', () => {
    const target: DotTarget = 'web';
    const result = dot('p-4', { target });
    expectTypeOf(result).toEqualTypeOf<DotAdapterOutput>();
  });

  it('{ dark: true } without target → StyleObject', () => {
    const result = dot('p-4', { dark: true });
    expectTypeOf(result).toEqualTypeOf<StyleObject>();
  });
});

describe('dotMap() overload type inference', () => {
  it('no target → DotStyleMap<StyleObject>', () => {
    const result = dotMap('hover:p-4');
    expectTypeOf(result).toEqualTypeOf<DotStyleMap<StyleObject>>();
  });

  it('target: "native" → DotStyleMap<RNStyleObject>', () => {
    const result = dotMap('hover:p-4', { target: 'native' });
    expectTypeOf(result).toEqualTypeOf<DotStyleMap<RNStyleObject>>();
  });

  it('target: DotTarget variable → DotStyleMap (union base)', () => {
    const target: DotTarget = 'web';
    const result = dotMap('hover:p-4', { target });
    expectTypeOf(result).toEqualTypeOf<DotStyleMap<DotAdapterOutput>>();
  });
});
