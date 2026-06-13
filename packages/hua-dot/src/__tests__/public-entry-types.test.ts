/**
 * Public entry type-export regression tests.
 *
 * UI and other consumers import these types from `@hua-labs/dot`, so keep this
 * coverage on the package entrypoint instead of the internal `types` module.
 */
import { describe, it, expectTypeOf } from 'vitest';
import { dot, dotMap } from '../index';
import { dot as dotNative, dotMap as dotMapNative } from '../native';
import type {
  DotOptions,
  DotStyleMap,
  RNStyleObject,
  StyleObject,
} from '../index';
import type {
  DotOptions as NativeDotOptions,
  DotStyleMap as NativeDotStyleMap,
  RNStyleObject as NativeRNStyleObject,
  StyleObject as NativeStyleObject,
} from '../native';

describe('public entry type exports', () => {
  it('exports web entry style and options types', () => {
    const options: DotOptions = { dark: true };
    const style = dot('p-4', options);
    const map = dotMap('hover:p-4', options);

    expectTypeOf(style).toEqualTypeOf<StyleObject>();
    expectTypeOf(map).toEqualTypeOf<DotStyleMap<StyleObject>>();
  });

  it('exports native entry style and options types', () => {
    const options: Omit<NativeDotOptions, 'target'> = { dark: true };
    const style = dotNative('p-4', options);
    const map = dotMapNative('hover:p-4', options);

    expectTypeOf(style).toEqualTypeOf<NativeRNStyleObject>();
    expectTypeOf(map).toEqualTypeOf<NativeDotStyleMap<NativeRNStyleObject>>();
    expectTypeOf<NativeStyleObject>().toEqualTypeOf<StyleObject>();
    expectTypeOf<RNStyleObject>().toEqualTypeOf<NativeRNStyleObject>();
  });
});
