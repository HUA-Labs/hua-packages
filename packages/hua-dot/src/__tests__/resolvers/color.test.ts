import { describe, it, expect } from 'vitest';
import { resolveColor, lookupColor } from '../../resolvers/color';

describe('lookupColor', () => {
  it('looks up palette colors', () => {
    expect(lookupColor('primary-500')).toBe('#3b82f6');
    expect(lookupColor('gray-100')).toBe('#f3f4f6');
    expect(lookupColor('red-600')).toBe('#dc2626');
  });

  it('looks up special colors', () => {
    expect(lookupColor('white')).toBe('#ffffff');
    expect(lookupColor('black')).toBe('#000000');
    expect(lookupColor('transparent')).toBe('transparent');
    expect(lookupColor('current')).toBe('currentColor');
  });

  it('returns undefined for unknown colors', () => {
    expect(lookupColor('unknown-500')).toBeUndefined();
    expect(lookupColor('nope')).toBeUndefined();
  });
});

describe('resolveColor', () => {
  it('resolves background color', () => {
    expect(resolveColor('bg', 'primary-500')).toEqual({ backgroundColor: '#3b82f6' });
    expect(resolveColor('bg', 'white')).toEqual({ backgroundColor: '#ffffff' });
  });

  it('resolves text color', () => {
    expect(resolveColor('text', 'gray-700')).toEqual({ color: '#374151' });
    expect(resolveColor('text', 'black')).toEqual({ color: '#000000' });
  });

  it('resolves border color', () => {
    expect(resolveColor('border', 'red-500')).toEqual({ borderColor: '#ef4444' });
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveColor('unknown', 'red-500')).toEqual({});
  });

  it('returns empty for unknown color', () => {
    expect(resolveColor('bg', 'nonexistent-500')).toEqual({});
  });

  it('resolves all palette shades', () => {
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    for (const shade of shades) {
      const result = resolveColor('bg', `blue-${shade}`);
      expect(result).toHaveProperty('backgroundColor');
    }
  });
});
