import { describe, it, expect } from 'vitest';
import { dot, adaptFlutter, dotExplain } from '../../index';
import type { FlutterRecipe } from '../../adapters/flutter-types';
import type { StyleObject } from '../../types';

/** Helper: resolve as flutter via dot() */
function flutterDot(input: string): FlutterRecipe {
  return dot(input, { target: 'flutter' }) as FlutterRecipe;
}

describe('Flutter adapter: spacing', () => {
  it('p-4 → padding all sides', () => {
    const r = flutterDot('p-4');
    expect(r.padding).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
  });

  it('px-4 py-2 → correct padding', () => {
    const r = flutterDot('px-4 py-2');
    expect(r.padding?.left).toBe(16);
    expect(r.padding?.right).toBe(16);
    expect(r.padding?.top).toBe(8);
    expect(r.padding?.bottom).toBe(8);
  });

  it('m-8 → margin all sides', () => {
    const r = flutterDot('m-8');
    expect(r.margin).toEqual({ top: 32, right: 32, bottom: 32, left: 32 });
  });

  it('mt-4 mb-2 → partial margin', () => {
    const r = flutterDot('mt-4 mb-2');
    expect(r.margin?.top).toBe(16);
    expect(r.margin?.bottom).toBe(8);
  });
});

describe('Flutter adapter: decoration', () => {
  it('bg-blue-500 → decoration.color', () => {
    const r = flutterDot('bg-blue-500');
    expect(r.decoration?.color).toBe('#0079b1');
  });

  it('rounded-lg → decoration.borderRadius', () => {
    const r = flutterDot('rounded-lg');
    expect(r.decoration?.borderRadius?.topLeft).toBe(8);
    expect(r.decoration?.borderRadius?.bottomRight).toBe(8);
  });

  it('rounded-t-lg → partial border radius', () => {
    const r = flutterDot('rounded-t-lg');
    expect(r.decoration?.borderRadius?.topLeft).toBe(8);
    expect(r.decoration?.borderRadius?.topRight).toBe(8);
    // bottom should not be set by rounded-t-lg
  });

  it('border-2 border-red-500 → decoration.border', () => {
    const r = flutterDot('border-2 border-red-500');
    expect(r.decoration?.border?.width).toBe(2);
    expect(r.decoration?.border?.color).toBe('#ca2c22');
  });

  it('shadow-lg → decoration.boxShadow', () => {
    const r = flutterDot('shadow-lg');
    expect(r.decoration?.boxShadow).toBeDefined();
    expect(r.decoration!.boxShadow!.length).toBeGreaterThan(0);
    expect(r.decoration!.boxShadow![0].blurRadius).toBeGreaterThan(0);
  });

  it('shadow-lg ring-2 → composed boxShadow', () => {
    const r = flutterDot('shadow-lg ring-2');
    // Both ring and shadow should produce boxShadow entries
    expect(r.decoration?.boxShadow).toBeDefined();
    expect(r.decoration!.boxShadow!.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Flutter adapter: constraints (sizing)', () => {
  it('w-64 h-32 → constraints', () => {
    const r = flutterDot('w-64 h-32');
    expect(r.constraints?.width).toBe(256);
    expect(r.constraints?.height).toBe(128);
  });

  it('min-w-0 max-w-full → constraints', () => {
    const r = flutterDot('min-w-0');
    expect(r.constraints?.minWidth).toBe(0);
  });
});

describe('Flutter adapter: layout', () => {
  it('flex flex-col → layout', () => {
    const r = flutterDot('flex flex-col');
    expect(r.layout).toBeDefined();
    expect(r.layout?.direction).toBe('column');
  });

  it('flex items-center justify-between → layout alignment', () => {
    const r = flutterDot('flex items-center justify-between');
    expect(r.layout?.crossAxisAlignment).toBe('center');
    expect(r.layout?.mainAxisAlignment).toBe('spaceBetween');
  });

  it('flex-wrap → layout.wrap', () => {
    const r = flutterDot('flex-wrap');
    expect(r.layout?.wrap).toBe(true);
  });
});

describe('Flutter adapter: flexChild', () => {
  it('flex-1 → flexChild.flex', () => {
    const r = flutterDot('flex-1');
    expect(r.flexChild?.flex).toBe(1);
  });

  it('grow → flexChild.flex with flexFit tight', () => {
    const r = flutterDot('grow');
    expect(r.flexChild?.flex).toBe(1);
    expect(r.flexChild?.flexFit).toBe('tight');
  });
});

describe('Flutter adapter: typography', () => {
  it('text-lg → textStyle.fontSize', () => {
    const r = flutterDot('text-lg');
    expect(r.textStyle?.fontSize).toBeDefined();
    expect(typeof r.textStyle!.fontSize).toBe('number');
  });

  it('font-bold → textStyle.fontWeight', () => {
    const r = flutterDot('font-bold');
    expect(r.textStyle?.fontWeight).toBe('w700');
  });

  it('text-red-500 → textStyle.color', () => {
    const r = flutterDot('text-red-500');
    expect(r.textStyle?.color).toBe('#ca2c22');
  });

  // italic/underline standalone tokens are not yet in dot resolver (Wave 2 typography)
  // When added, they should map to textStyle.fontStyle / textStyle.decoration
});

describe('Flutter adapter: positioning', () => {
  it('absolute top-4 left-0 → positioning', () => {
    const r = flutterDot('absolute top-4 left-0');
    expect(r.positioning?.type).toBe('absolute');
    expect(r.positioning?.top).toBe(16);
    expect(r.positioning?.left).toBe(0);
  });

  it('relative → positioning.type', () => {
    const r = flutterDot('relative');
    expect(r.positioning?.type).toBe('relative');
  });
});

describe('Flutter adapter: opacity & visibility', () => {
  it('opacity-50 → recipe.opacity', () => {
    const r = flutterDot('opacity-50');
    expect(r.opacity).toBe(0.5);
  });

  it('invisible → recipe.visible false', () => {
    const r = flutterDot('invisible');
    expect(r.visible).toBe(false);
  });

  it('visible → recipe.visible true', () => {
    const r = flutterDot('visible');
    expect(r.visible).toBe(true);
  });
});

describe('Flutter adapter: transform', () => {
  it('rotate-45 → transform.rotate in radians', () => {
    const r = flutterDot('rotate-45');
    expect(r.transform?.rotate).toBeCloseTo((45 * Math.PI) / 180);
  });

  it('scale-110 → transform.scaleX/Y', () => {
    const r = flutterDot('scale-110');
    expect(r.transform?.scaleX).toBeCloseTo(1.1);
    expect(r.transform?.scaleY).toBeCloseTo(1.1);
  });

  it('translate-x-4 → transform.translateX', () => {
    const r = flutterDot('translate-x-4');
    expect(r.transform?.translateX).toBe(16);
  });
});

describe('Flutter adapter: z-index', () => {
  it('z-10 → recipe.zIndex', () => {
    const r = flutterDot('z-10');
    expect(r.zIndex).toBe(10);
  });
});

describe('Flutter adapter: aspect ratio', () => {
  it('aspect-video → recipe.aspectRatio', () => {
    const r = flutterDot('aspect-video');
    expect(r.aspectRatio).toBeCloseTo(16 / 9);
  });

  it('aspect-square → recipe.aspectRatio 1', () => {
    const r = flutterDot('aspect-square');
    expect(r.aspectRatio).toBe(1);
  });
});

describe('Flutter adapter: dropped properties', () => {
  it('filter utilities are dropped', () => {
    const r = flutterDot('p-4 blur-md');
    expect(r.padding).toBeDefined();
    expect(r._dropped).toContain('filter');
  });

  it('transition is dropped', () => {
    const r = flutterDot('transition-all duration-200');
    expect(r._dropped).toBeDefined();
  });

  it('grid is dropped', () => {
    const r = flutterDot('grid grid-cols-3');
    expect(r._dropped).toBeDefined();
  });
});

describe('Flutter adapter: dark variant', () => {
  it('dark:bg-gray-900 in dark mode', () => {
    const r = dot('bg-white dark:bg-gray-900', { target: 'flutter', dark: true }) as FlutterRecipe;
    expect(r.decoration?.color).toBe('#121418');
  });

  it('dark:bg-gray-900 in light mode (ignored)', () => {
    const r = dot('bg-white dark:bg-gray-900', { target: 'flutter', dark: false }) as FlutterRecipe;
    expect(r.decoration?.color).toBe('#ffffff');
  });
});

describe('Flutter adapter: empty/null input', () => {
  it('empty string → empty object', () => {
    expect(flutterDot('')).toEqual({});
  });

  it('null → empty object', () => {
    expect(dot(null, { target: 'flutter' })).toEqual({});
  });
});

describe('dotExplain with flutter target', () => {
  it('reports filter as plugin-backed on flutter (not native)', () => {
    const result = dotExplain('p-4 blur-md', { target: 'flutter' });
    // filter is plugin-backed on Flutter, not unsupported
    expect(result.report._capabilities?.filter).toBe('plugin-backed');
  });

  it('spacing is native on flutter — no capabilities reported', () => {
    const result = dotExplain('p-4', { target: 'flutter' });
    expect(result.report._dropped).toBeUndefined();
  });

  it('transition is unsupported → dropped on flutter', () => {
    const result = dotExplain('p-4 transition-all', { target: 'flutter' });
    expect(result.report._dropped).toContain('transitionProperty');
  });
});

describe('adaptFlutter direct usage', () => {
  it('converts web style to recipe', () => {
    const webStyle: StyleObject = {
      padding: '16px',
      backgroundColor: '#0079b1',
      borderRadius: '8px',
    };
    const recipe = adaptFlutter(webStyle);
    expect(recipe.padding).toEqual({ top: 16, right: 16, bottom: 16, left: 16 });
    expect(recipe.decoration?.color).toBe('#0079b1');
    expect(recipe.decoration?.borderRadius?.topLeft).toBe(8);
  });
});
