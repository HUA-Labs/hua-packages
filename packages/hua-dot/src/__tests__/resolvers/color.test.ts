import { describe, it, expect } from 'vitest';
import { resolveColor, lookupColor } from '../../resolvers/color';
import { resolveConfig } from '../../config';
import { dot } from '../../index';
const config = resolveConfig();

describe('lookupColor', () => {
  it('looks up palette colors', () => {
    expect(lookupColor('primary-500', config.tokens.colors)).toBe('#3b82f6');
    expect(lookupColor('gray-100', config.tokens.colors)).toBe('#f3f4f6');
    expect(lookupColor('red-600', config.tokens.colors)).toBe('#dc2626');
  });

  it('looks up special colors', () => {
    expect(lookupColor('white', config.tokens.colors)).toBe('#ffffff');
    expect(lookupColor('black', config.tokens.colors)).toBe('#000000');
    expect(lookupColor('transparent', config.tokens.colors)).toBe('transparent');
    expect(lookupColor('current', config.tokens.colors)).toBe('currentColor');
  });

  it('returns undefined for unknown colors', () => {
    expect(lookupColor('unknown-500', config.tokens.colors)).toBeUndefined();
    expect(lookupColor('nope', config.tokens.colors)).toBeUndefined();
  });

  it('returns shade 500 for flat palette names (no shade specified)', () => {
    expect(lookupColor('primary', config.tokens.colors)).toBe('#3b82f6');
    expect(lookupColor('red', config.tokens.colors)).toBe('#ef4444');
    expect(lookupColor('gray', config.tokens.colors)).toBe('#6b7280');
    expect(lookupColor('blue', config.tokens.colors)).toBe('#3b82f6');
  });
});

describe('resolveColor', () => {
  it('resolves background color', () => {
    expect(resolveColor('bg', 'primary-500', config)).toEqual({ backgroundColor: '#3b82f6' });
    expect(resolveColor('bg', 'white', config)).toEqual({ backgroundColor: '#ffffff' });
  });

  it('resolves text color', () => {
    expect(resolveColor('text', 'gray-700', config)).toEqual({ color: '#374151' });
    expect(resolveColor('text', 'black', config)).toEqual({ color: '#000000' });
  });

  it('resolves border color', () => {
    expect(resolveColor('border', 'red-500', config)).toEqual({ borderColor: '#ef4444' });
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveColor('unknown', 'red-500', config)).toEqual({});
  });

  it('returns empty for unknown color', () => {
    expect(resolveColor('bg', 'nonexistent-500', config)).toEqual({});
  });

  it('resolves all palette shades', () => {
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    for (const shade of shades) {
      const result = resolveColor('bg', `blue-${shade}`, config);
      expect(result).toHaveProperty('backgroundColor');
    }
  });
});

describe('flat color (no shade)', () => {
  it('bg-primary uses 500 shade as default', () => {
    const result = dot('bg-primary');
    expect(result).toEqual({ backgroundColor: '#3b82f6' });
  });

  it('bg-red uses 500 shade', () => {
    const result = dot('bg-red');
    expect(result).toEqual({ backgroundColor: '#ef4444' });
  });

  it('text-primary uses 500 shade', () => {
    const result = dot('text-primary');
    expect(result).toEqual({ color: '#3b82f6' });
  });

  it('border-gray uses 500 shade', () => {
    const result = dot('border-gray');
    expect(result).toEqual({ borderColor: '#6b7280' });
  });

  it('bg-primary/50 uses 500 shade with opacity', () => {
    const result = dot('bg-primary/50');
    expect(result).toHaveProperty('backgroundColor');
    expect((result as { backgroundColor: string }).backgroundColor).toContain('rgb');
  });
});
