import { describe, it, expect, beforeEach } from 'vitest';
import { createDotConfig, clearDotCache, dot } from '../index';

describe('Config validation & edge cases', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('resolves default config with no arguments', () => {
    const config = createDotConfig();
    expect(config.tokens).toBeDefined();
    expect(config.cache).toBe(true);
    expect(config.strictMode).toBe(false);
    expect(config.runtime).toBe('web');
    expect(config.remBase).toBe(16);
    expect(config.breakpointOrder).toEqual(['sm', 'md', 'lg', 'xl', '2xl']);
  });

  it('resolves config with empty object', () => {
    const config = createDotConfig({});
    expect(config.runtime).toBe('web');
  });

  it('merges custom colors into defaults', () => {
    const config = createDotConfig({
      theme: { colors: { brand: { 500: '#6630E6' } } },
    });
    expect((config.tokens.colors as Record<string, any>).brand?.['500']).toBe('#6630E6');
    expect((config.tokens.colors as Record<string, any>).gray).toBeDefined();
  });

  it('merges custom spacing into defaults', () => {
    const config = createDotConfig({
      theme: { spacing: { '18': '72px' } },
    });
    expect(config.tokens.spacing['18']).toBe('72px');
    expect(config.tokens.spacing['4']).toBe('16px');
  });

  it('overrides runtime target', () => {
    const config = createDotConfig({ runtime: 'native' });
    expect(config.runtime).toBe('native');
  });

  it('overrides remBase', () => {
    const config = createDotConfig({ remBase: 20 });
    expect(config.remBase).toBe(20);
  });

  it('overrides cache settings', () => {
    const config = createDotConfig({ cache: false, cacheSize: 100 });
    expect(config.cache).toBe(false);
    expect(config.cacheSize).toBe(100);
  });

  it('enables strict mode', () => {
    const config = createDotConfig({ strictMode: true });
    expect(config.strictMode).toBe(true);
  });

  it('accepts custom breakpoint order', () => {
    const config = createDotConfig({ breakpoints: ['tablet', 'desktop'] });
    expect(config.breakpointOrder).toEqual(['tablet', 'desktop']);
    expect(config.breakpointSet.has('tablet')).toBe(true);
    expect(config.breakpointSet.has('sm')).toBe(false);
  });

  it('merges custom breakpoint widths', () => {
    const config = createDotConfig({ breakpointWidths: { tablet: '900px' } });
    expect(config.breakpointWidths.tablet).toBe('900px');
    expect(config.breakpointWidths.sm).toBeDefined();
  });

  it('accepts semantic colors as string array', () => {
    const config = createDotConfig({ theme: { semanticColors: ['brand', 'accent'] } });
    expect(config.tokens.semanticColors.brand).toBe('var(--color-brand)');
    expect(config.tokens.semanticColors.accent).toBe('var(--color-accent)');
  });

  it('accepts semantic colors as Record', () => {
    const config = createDotConfig({ theme: { semanticColors: { brand: 'var(--my-brand)' } } });
    expect(config.tokens.semanticColors.brand).toBe('var(--my-brand)');
  });

  it('uses custom semantic prefix', () => {
    const config = createDotConfig({ theme: { semanticPrefix: '--theme', semanticColors: ['primary'] } });
    expect(config.tokens.semanticColors.primary).toBe('var(--theme-primary)');
  });

  it('handles undefined theme gracefully', () => {
    const config = createDotConfig({ theme: undefined });
    expect(config.tokens.spacing).toBeDefined();
  });

  it('handles empty theme object', () => {
    const config = createDotConfig({ theme: {} });
    expect(config.tokens.colors).toBeDefined();
  });

  it('handles empty semantic colors array', () => {
    const config = createDotConfig({ theme: { semanticColors: [] } });
    expect(Object.keys(config.tokens.semanticColors).length).toBeGreaterThan(0);
  });

  it('custom color token is resolvable via dot()', () => {
    createDotConfig({ theme: { colors: { brand: { 500: '#6630E6' } } } });
    expect(dot('bg-brand-500')).toEqual({ backgroundColor: '#6630E6' });
  });

  it('custom spacing token is resolvable via dot()', () => {
    createDotConfig({ theme: { spacing: { '18': '72px' } } });
    expect(dot('p-18')).toEqual({ padding: '72px' });
  });

  it('strict mode throws on unknown tokens', () => {
    createDotConfig({ strictMode: true });
    expect(() => dot('totally-bogus-token')).toThrow('[dot] Unknown token');
  });

  it('non-strict mode returns empty for unknown tokens', () => {
    createDotConfig({ strictMode: false });
    expect(dot('totally-bogus-token')).toEqual({});
  });
});
