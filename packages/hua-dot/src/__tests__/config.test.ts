import { describe, it, expect } from 'vitest';
import { createDotConfig, deepMerge } from '../config';

describe('deepMerge', () => {
  it('merges flat objects', () => {
    const result = deepMerge({ a: 1, b: 2 }, { b: 3, c: 4 });
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('deep merges nested objects', () => {
    const result = deepMerge(
      { colors: { primary: { 500: '#blue' } } },
      { colors: { primary: { 500: '#cyan' } } },
    );
    expect(result).toEqual({ colors: { primary: { 500: '#cyan' } } });
  });

  it('preserves unmodified nested keys', () => {
    const result = deepMerge(
      { colors: { primary: { 500: '#blue', 600: '#darkblue' } } },
      { colors: { primary: { 500: '#cyan' } } },
    );
    expect(result.colors.primary).toEqual({ 500: '#cyan', 600: '#darkblue' });
  });

  it('does not mutate the original', () => {
    const target = { a: { b: 1 } };
    const result = deepMerge(target, { a: { b: 2 } });
    expect(target.a.b).toBe(1);
    expect(result.a.b).toBe(2);
  });
});

describe('createDotConfig', () => {
  it('returns default config when no user config provided', () => {
    const config = createDotConfig();
    expect(config.cache).toBe(true);
    expect(config.cacheSize).toBe(500);
    expect(config.strictMode).toBe(false);
    expect(config.tokens.spacing['4']).toBe('16px');
    expect(config.tokens.fontSize['sm']).toBe('14px');
  });

  it('merges user theme tokens', () => {
    const config = createDotConfig({
      theme: {
        spacing: { '18': '72px' },
        colors: { brand: { '500': '#6630E6' } },
      },
    });
    // Custom tokens added
    expect(config.tokens.spacing['18']).toBe('72px');
    expect((config.tokens.colors['brand'] as Record<string, string>)['500']).toBe('#6630E6');
    // Defaults preserved
    expect(config.tokens.spacing['4']).toBe('16px');
  });

  it('overrides config options', () => {
    const config = createDotConfig({
      cache: false,
      cacheSize: 200,
      strictMode: true,
    });
    expect(config.cache).toBe(false);
    expect(config.cacheSize).toBe(200);
    expect(config.strictMode).toBe(true);
  });
});
