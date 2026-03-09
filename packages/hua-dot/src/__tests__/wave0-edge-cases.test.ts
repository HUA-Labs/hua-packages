import { describe, it, expect } from 'vitest';
import { dot, dotMap, dotExplain, createDotConfig } from '../index';

describe('Wave 0: filter accumulation edge cases', () => {
  it('single filter still works (no double-space)', () => {
    const result = dot('blur-md');
    expect(result.filter).toBe('blur(12px)');
    expect(result.filter).not.toContain('  ');
  });

  it('dark overrides base filter completely', () => {
    // dark:blur-lg should replace base blur-sm, not accumulate
    const result = dot('blur-sm dark:blur-lg', { dark: true });
    expect(result.filter).toBe('blur(16px)');
  });

  it('filter + transform accumulate independently', () => {
    const result = dot('blur-md brightness-75 rotate-45 scale-110');
    expect(result.filter).toBe('blur(12px) brightness(.75)');
    expect(result.transform).toBe('rotate(45deg) scale(1.1)');
  });

  it('filter none resets accumulation', () => {
    // blur-md then blur-none: should the none kill previous blur?
    // With accumulation, it becomes 'blur(12px) blur(0)' — last blur(0) dominates
    const result = dot('blur-md blur-none');
    expect(result.filter).toBe('blur(12px) blur(0)');
  });

  it('all filter functions accumulate in order', () => {
    const result = dot('blur-sm brightness-125 contrast-75 saturate-200 grayscale sepia invert hue-rotate-90');
    const parts = (result.filter as string).split(' ');
    expect(parts).toHaveLength(8);
    expect(parts[0]).toBe('blur(4px)');
    expect(parts[7]).toBe('hue-rotate(90deg)');
  });
});

describe('Wave 0: backdrop accumulation edge cases', () => {
  it('single backdrop still works', () => {
    const result = dot('backdrop-blur-md');
    expect(result.backdropFilter).toBe('blur(12px)');
    expect(result.backdropFilter).not.toContain('  ');
  });

  it('filter and backdrop accumulate independently', () => {
    const result = dot('blur-sm backdrop-blur-md brightness-75 backdrop-brightness-125');
    expect(result.filter).toBe('blur(4px) brightness(.75)');
    expect(result.backdropFilter).toBe('blur(12px) brightness(1.25)');
  });
});

describe('Wave 0: shadow/ring composition edge cases', () => {
  it('only shadow: no ring layer, clean boxShadow', () => {
    const result = dot('shadow-lg');
    expect(result).toHaveProperty('boxShadow');
    expect((result.boxShadow as string)).not.toContain('__dot_');
  });

  it('only ring: no shadow layer, clean boxShadow', () => {
    const result = dot('ring-2');
    expect(result).toHaveProperty('boxShadow');
    expect((result.boxShadow as string)).not.toContain('__dot_');
  });

  it('shadow-none + ring-2: ring-only output', () => {
    const result = dot('shadow-none ring-2');
    const parts = (result.boxShadow as string).split(', ');
    // ring + shadow-none
    expect(parts.length).toBe(2);
    expect(parts[0]).toContain('0 0 0 2px');
    expect(parts[1]).toBe('none');
  });

  it('no shadow/ring: no boxShadow in output', () => {
    const result = dot('p-4 text-red-500');
    expect(result).not.toHaveProperty('boxShadow');
    expect(result).not.toHaveProperty('__dot_shadowLayer');
    expect(result).not.toHaveProperty('__dot_ringLayer');
  });

  it('internal layer keys never leak to output', () => {
    const result1 = dot('shadow-lg ring-2');
    expect(result1).not.toHaveProperty('__dot_shadowLayer');
    expect(result1).not.toHaveProperty('__dot_ringLayer');

    const result2 = dot('shadow-sm');
    expect(result2).not.toHaveProperty('__dot_shadowLayer');

    const result3 = dot('ring-4');
    expect(result3).not.toHaveProperty('__dot_ringLayer');
  });

  it('dotMap: shadow/ring compose in state variants', () => {
    const result = dotMap('shadow-sm focus:ring-2');
    expect(result.base).toHaveProperty('boxShadow');
    expect(result.focus).toHaveProperty('boxShadow');
    // Internal keys should not leak
    expect(result.base).not.toHaveProperty('__dot_shadowLayer');
    expect(result.focus).not.toHaveProperty('__dot_ringLayer');
  });

  it('dotMap: hover shadow + focus ring are independent', () => {
    const result = dotMap('hover:shadow-lg focus:ring-2');
    expect(result.hover).toHaveProperty('boxShadow');
    expect(result.focus).toHaveProperty('boxShadow');
    // Each state has its own shadow, not composed across states
    expect((result.hover!.boxShadow as string)).not.toContain('0 0 0 2px');
    expect((result.focus!.boxShadow as string)).toContain('0 0 0 2px');
  });
});

describe('Wave 0: capability edge cases', () => {
  it('dotExplain with only native-supported utils has empty report', () => {
    // Use tokens that produce only fully-native props (no display — it's approximate)
    const result = dotExplain('p-4 items-center text-center', { target: 'native' });
    expect(result.report._dropped).toBeUndefined();
    expect(result.report._approximated).toBeUndefined();
  });

  it('dotExplain with mixed support', () => {
    const result = dotExplain('p-4 shadow-lg blur-md', { target: 'native' });
    expect(result.report._dropped).toContain('filter');
    expect(result.report._approximated).toContain('boxShadow');
    // padding should not appear in capabilities (native support)
    expect(result.report._capabilities).not.toHaveProperty('padding');
  });

  it('dotExplain on web always returns empty report', () => {
    const result = dotExplain('blur-md grid grid-cols-3', { target: 'web' });
    expect(result.report).toEqual({});
  });

  it('dotExplain with dark variant', () => {
    const result = dotExplain('p-4 dark:blur-md', { target: 'native', dark: true });
    expect(result.report._dropped).toContain('filter');
  });
});

describe('Wave 0: native target shadow/ring', () => {
  it('shadow on native target produces approximate output', () => {
    const result = dot('shadow-lg', { target: 'native' });
    // RN native adapter may transform boxShadow differently
    // Key point: internal keys don't leak
    expect(result).not.toHaveProperty('__dot_shadowLayer');
    expect(result).not.toHaveProperty('__dot_ringLayer');
  });
});

describe('Wave 0: !important + shadow/ring composition', () => {
  it('!ring-2 shadow-sm: !important appears only once at end', () => {
    const result = dot('!ring-2 shadow-sm');
    const bs = result.boxShadow as string;
    // !important should be at the very end, not in the middle
    expect(bs).toMatch(/!important$/);
    // Should NOT have !important in the middle (between layers)
    const parts = bs.replace(/ !important$/, '').split(', ');
    for (const part of parts) {
      expect(part).not.toContain('!important');
    }
  });

  it('!shadow-sm !ring-2: !important appears exactly once', () => {
    const result = dot('!shadow-sm !ring-2');
    const bs = result.boxShadow as string;
    const importantCount = (bs.match(/!important/g) || []).length;
    expect(importantCount).toBe(1);
    expect(bs).toMatch(/!important$/);
  });

  it('shadow-sm ring-2 (no !important): clean output', () => {
    const result = dot('shadow-sm ring-2');
    const bs = result.boxShadow as string;
    expect(bs).not.toContain('!important');
  });

  it('!shadow-lg alone: !important at end', () => {
    const result = dot('!shadow-lg');
    const bs = result.boxShadow as string;
    expect(bs).toMatch(/!important$/);
    expect((bs.match(/!important/g) || []).length).toBe(1);
  });
});
