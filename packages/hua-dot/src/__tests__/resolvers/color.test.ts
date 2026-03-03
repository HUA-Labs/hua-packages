import { describe, it, expect } from 'vitest';
import { resolveColor, lookupColor } from '../../resolvers/color';
import { resolveConfig } from '../../config';
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
