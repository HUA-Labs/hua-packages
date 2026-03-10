import { describe, it, expect } from 'vitest';
import { dot, dotMap, createDotConfig, dotVariants } from '../../index';
import type { FlutterRecipe } from '../../adapters/flutter-types';

function flutterDot(input: string, options?: { dark?: boolean }): FlutterRecipe {
  return dot(input, { target: 'flutter', ...options }) as FlutterRecipe;
}

describe('Flutter edge cases: negative values', () => {
  it('-m-4 → negative margin', () => {
    const r = flutterDot('-m-4');
    expect(r.margin?.top).toBe(-16);
    expect(r.margin?.left).toBe(-16);
  });

  it('-translate-x-4 → negative translateX', () => {
    const r = flutterDot('-translate-x-4');
    expect(r.transform?.translateX).toBe(-16);
  });

  it('-rotate-45 → negative rotation', () => {
    const r = flutterDot('-rotate-45');
    expect(r.transform?.rotate).toBeCloseTo((-45 * Math.PI) / 180);
  });
});

describe('Flutter edge cases: combined utilities', () => {
  it('p-4 m-2 bg-blue-500 rounded-lg → all sections present', () => {
    const r = flutterDot('p-4 m-2 bg-blue-500 rounded-lg');
    expect(r.padding).toBeDefined();
    expect(r.margin).toBeDefined();
    expect(r.decoration?.color).toBe('#0079b1');
    expect(r.decoration?.borderRadius).toBeDefined();
  });

  it('flex flex-col items-center p-4 bg-white → layout + padding + decoration', () => {
    const r = flutterDot('flex flex-col items-center p-4 bg-white');
    expect(r.layout?.direction).toBe('column');
    expect(r.layout?.crossAxisAlignment).toBe('center');
    expect(r.padding).toBeDefined();
    expect(r.decoration?.color).toBe('#ffffff');
  });

  it('w-full → expandWidth (not 100px)', () => {
    const r = flutterDot('w-full');
    expect(r.constraints?.expandWidth).toBe(true);
    expect(r.constraints?.width).toBeUndefined();
  });

  it('h-screen → dropped (viewport unit)', () => {
    const r = flutterDot('h-screen');
    // 100vh is a viewport unit — cannot be statically mapped to Flutter
    expect(r.constraints?.height).toBeUndefined();
    expect(r._dropped).toContain('height');
  });
});

describe('Flutter edge cases: !important', () => {
  it('!p-4 → same padding (important has no Flutter effect)', () => {
    const r = flutterDot('!p-4');
    // !important values may have trailing ' !important' stripped by toNumber
    expect(r.padding).toBeDefined();
  });

  it('!shadow-lg !ring-2 → boxShadow without !important leak', () => {
    const r = flutterDot('!shadow-lg !ring-2');
    expect(r.decoration?.boxShadow).toBeDefined();
    // Verify no !important in color or other shadow fields
    if (r.decoration?.boxShadow) {
      for (const shadow of r.decoration.boxShadow) {
        expect(shadow.color).not.toContain('!important');
      }
    }
  });
});

describe('Flutter edge cases: breakpoint variants', () => {
  it('md:p-8 with breakpoint md', () => {
    const r = dot('p-4 md:p-8', { target: 'flutter', breakpoint: 'md' }) as FlutterRecipe;
    expect(r.padding?.top).toBe(32); // md overrides base
  });

  it('md:p-8 without breakpoint → base only', () => {
    const r = dot('p-4 md:p-8', { target: 'flutter' }) as FlutterRecipe;
    expect(r.padding?.top).toBe(16); // only base applies
  });
});

describe('Flutter edge cases: no internal keys leak', () => {
  it('shadow output has no __dot_ keys', () => {
    const r = flutterDot('shadow-lg ring-2');
    const json = JSON.stringify(r);
    expect(json).not.toContain('__dot_');
  });
});

describe('Flutter edge cases: empty sections not created', () => {
  it('p-4 only → no decoration, no layout, no textStyle', () => {
    const r = flutterDot('p-4');
    expect(r.decoration).toBeUndefined();
    expect(r.layout).toBeUndefined();
    expect(r.textStyle).toBeUndefined();
    expect(r.transform).toBeUndefined();
  });

  it('bg-red-500 only → decoration, nothing else', () => {
    const r = flutterDot('bg-red-500');
    expect(r.decoration).toBeDefined();
    expect(r.padding).toBeUndefined();
    expect(r.margin).toBeUndefined();
  });
});

describe('Flutter edge cases: aspect ratio parsing', () => {
  it('aspect-[4/3] arbitrary → 1.333...', () => {
    const r = flutterDot('aspect-[4/3]');
    expect(r.aspectRatio).toBeCloseTo(4 / 3);
  });
});

describe('Flutter edge cases: font weight mapping', () => {
  it('font-normal → w400', () => {
    const r = flutterDot('font-normal');
    expect(r.textStyle?.fontWeight).toBe('w400');
  });

  it('font-semibold → w600', () => {
    const r = flutterDot('font-semibold');
    expect(r.textStyle?.fontWeight).toBe('w600');
  });

  it('font-black → w900', () => {
    const r = flutterDot('font-black');
    expect(r.textStyle?.fontWeight).toBe('w900');
  });
});

describe('Flutter edge cases: line-clamp → maxLines', () => {
  it('line-clamp-2 → textStyle.maxLines = 2', () => {
    const r = flutterDot('line-clamp-2');
    expect(r.textStyle?.maxLines).toBe(2);
    expect(r.textStyle?.overflow).toBe('ellipsis');
  });

  it('line-clamp-3 → textStyle.maxLines = 3', () => {
    const r = flutterDot('line-clamp-3');
    expect(r.textStyle?.maxLines).toBe(3);
  });
});

describe('Flutter edge cases: relative/viewport sizing', () => {
  it('w-64 → constraints.width = 256 (absolute value)', () => {
    const r = flutterDot('w-64');
    expect(r.constraints?.width).toBe(256);
    expect(r.constraints?.expandWidth).toBeUndefined();
  });

  it('percentage values do not become pixel numbers', () => {
    // h-full resolves to height: 100% — should NOT become 100px
    const r = flutterDot('h-full');
    expect(r.constraints?.height).toBeUndefined();
    expect(r.constraints?.expandHeight).toBe(true);
  });
});

describe('Flutter edge cases: dotMap() flutter support', () => {
  it('dotMap with target flutter returns FlutterRecipe in base', () => {
    const map = dotMap('p-4 hover:bg-red-500', { target: 'flutter' });
    const base = map.base as FlutterRecipe;
    expect(base.padding?.top).toBe(16);
    // hover state should also be flutter-adapted
    const hover = map.hover as FlutterRecipe;
    expect(hover?.decoration?.color).toBe('#ca2c22');
  });
});

describe('Flutter edge cases: dotVariants() flutter guard', () => {
  it('throws when global runtime is flutter', () => {
    const prevConfig = createDotConfig({ runtime: 'flutter' });
    expect(() => {
      const badge = dotVariants({ base: 'p-4' });
      badge();
    }).toThrow('Flutter target is not supported');
    // Restore default
    createDotConfig({ runtime: 'web' });
  });
});
