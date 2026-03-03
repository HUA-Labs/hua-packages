import { describe, it, expect, afterEach } from 'vitest';
import { dot, dotMap, createDotConfig, adaptNative } from '../index';

afterEach(() => {
  // Reset to defaults
  createDotConfig();
});

describe('custom breakpoints', () => {
  it('uses default breakpoints', () => {
    const result = dot('p-4 md:p-8', { breakpoint: 'md' });
    expect(result).toEqual({ padding: '32px' });
  });

  it('supports custom breakpoint names', () => {
    createDotConfig({
      breakpoints: ['tablet', 'desktop', 'wide'],
    });

    // tablet: breakpoint is active, p-8 cascades over p-4
    const result = dot('p-4 tablet:p-8', { breakpoint: 'tablet' });
    expect(result).toEqual({ padding: '32px' });
  });

  it('cascades custom breakpoints in order', () => {
    createDotConfig({
      breakpoints: ['tablet', 'desktop', 'wide'],
    });

    // At 'desktop' breakpoint: base p-4 → tablet:p-8 → desktop:p-12
    const result = dot('p-4 tablet:p-8 desktop:p-12', { breakpoint: 'desktop' });
    expect(result).toEqual({ padding: '48px' });
  });

  it('ignores higher breakpoints', () => {
    createDotConfig({
      breakpoints: ['tablet', 'desktop', 'wide'],
    });

    // At 'tablet': wide:p-16 should be ignored
    const result = dot('p-4 tablet:p-8 wide:p-16', { breakpoint: 'tablet' });
    expect(result).toEqual({ padding: '32px' });
  });

  it('custom breakpoints work with dotMap', () => {
    createDotConfig({
      breakpoints: ['tablet', 'desktop'],
    });

    const result = dotMap('p-4 tablet:p-8 hover:bg-red-500', { breakpoint: 'tablet' });
    expect(result.base).toEqual({ padding: '32px' });
    expect(result.hover).toHaveProperty('backgroundColor');
  });

  it('unknown default breakpoints are ignored with custom config', () => {
    createDotConfig({
      breakpoints: ['tablet', 'desktop'],
    });

    // md: is not a recognized breakpoint now
    const result = dot('p-4 md:p-8', { breakpoint: 'tablet' });
    expect(result).toEqual({ padding: '16px' });
  });
});

describe('rem base customization', () => {
  it('uses default remBase (16) for native adapter', () => {
    createDotConfig({ runtime: 'native' });
    // 1rem = 16px default — but spacing tokens are already px, so test via em
    // The native adapter toNumeric handles rem/em conversion
    createDotConfig({ runtime: 'web' });
  });

  it('custom remBase changes rem-to-px conversion in native', () => {
    const result = adaptNative({ fontSize: '1.5rem' }, { remBase: 10 });
    expect(result.fontSize).toBe(15); // 1.5 * 10
  });

  it('default remBase 16 converts correctly', () => {
    const result = adaptNative({ fontSize: '1.5rem' }, { remBase: 16 });
    expect(result.fontSize).toBe(24); // 1.5 * 16
  });
});

describe('!important modifier', () => {
  it('parses !p-4 as important', () => {
    const result = dot('!p-4');
    expect(result).toEqual({ padding: '16px !important' });
  });

  it('parses !flex as important standalone', () => {
    const result = dot('!flex');
    expect(result).toEqual({ display: 'flex !important' });
  });

  it('important works with variants', () => {
    const result = dot('dark:!bg-red-500', { dark: true });
    expect((result as Record<string, string>).backgroundColor).toContain('!important');
  });

  it('important works with negative', () => {
    // !-m-4 — important + negative
    // Parser: ! detected first, then - for negative
    const result = dot('!-m-4');
    expect(result).toEqual({ margin: '-16px !important' });
  });

  it('mixes important and non-important tokens', () => {
    const result = dot('p-4 !m-2');
    expect(result).toEqual({
      padding: '16px',
      margin: '8px !important',
    });
  });

  it('important with multi-property tokens (sr-only)', () => {
    const result = dot('!sr-only');
    expect((result as Record<string, string>).position).toBe('absolute !important');
    expect((result as Record<string, string>).width).toBe('1px !important');
  });

  it('important in dotMap', () => {
    const result = dotMap('!p-4 hover:!bg-red-500');
    expect((result.base as Record<string, string>).padding).toBe('16px !important');
    if (result.hover) {
      expect((result.hover as Record<string, string>).backgroundColor).toContain('!important');
    }
  });

  it('does not double-append !important', () => {
    const result = dot('!p-4');
    const padding = (result as Record<string, string>).padding;
    // Should be exactly one !important
    expect(padding).toBe('16px !important');
    expect(padding.match(/!important/g)?.length).toBe(1);
  });
});
