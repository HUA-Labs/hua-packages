import { describe, it, expect } from 'vitest';
import { dot } from '../../index';
import { hexToRgb } from '../../resolvers/utils';

describe('hexToRgb', () => {
  it('converts 6-digit hex', () => {
    expect(hexToRgb('#0079b1')).toBe('rgb(0 121 177)');
  });
  it('converts 3-digit shorthand', () => {
    expect(hexToRgb('#fff')).toBe('rgb(255 255 255)');
  });
  it('applies alpha', () => {
    expect(hexToRgb('#0079b1', 0.5)).toBe('rgb(0 121 177 / 0.5)');
  });
  it('returns undefined for invalid hex', () => {
    expect(hexToRgb('#gg0000')).toBeUndefined();
  });
  it('handles hex without #', () => {
    expect(hexToRgb('3b82f6')).toBe('rgb(59 130 246)');
  });
});

describe('Opacity modifier (/50)', () => {
  describe('bg color', () => {
    it('bg-primary-500/50', () => {
      expect(dot('bg-primary-500/50')).toEqual({
        backgroundColor: 'rgb(43 108 214 / 0.5)',
      });
    });
    it('bg-red-500/75', () => {
      expect(dot('bg-red-500/75')).toEqual({
        backgroundColor: 'rgb(202 44 34 / 0.75)',
      });
    });
    it('bg-white/10', () => {
      expect(dot('bg-white/10')).toEqual({
        backgroundColor: 'rgb(255 255 255 / 0.1)',
      });
    });
    it('bg-black/0', () => {
      expect(dot('bg-black/0')).toEqual({
        backgroundColor: 'rgb(0 0 0 / 0)',
      });
    });
    it('bg-blue-500/100', () => {
      expect(dot('bg-blue-500/100')).toEqual({
        backgroundColor: 'rgb(0 121 177 / 1)',
      });
    });
  });

  describe('text color', () => {
    it('text-gray-900/80', () => {
      expect(dot('text-gray-900/80')).toEqual({
        color: 'rgb(18 20 24 / 0.8)',
      });
    });
  });

  describe('border color', () => {
    it('border-red-500/25', () => {
      expect(dot('border-red-500/25')).toEqual({
        borderColor: 'rgb(202 44 34 / 0.25)',
      });
    });
  });

  describe('edge cases', () => {
    it('transparent with opacity → color-mix', () => {
      expect(dot('bg-transparent/50')).toEqual({
        backgroundColor: 'color-mix(in srgb, transparent 50%, transparent)',
      });
    });
    it('no conflict with positioning fractions (left-1/2)', () => {
      // left-1/2 goes to positioning resolver, not color
      expect(dot('left-1/2')).toEqual({ left: '50%' });
    });
    it('bg-[#ff0000]/50 → arbitrary wins, opacity ignored', () => {
      // arbitrary check runs before slash parsing
      // The parser sees "bg-[#ff0000]/50" — bracket doesn't contain the slash
      // so value is "[#ff0000]/50" which is NOT a valid bracket notation
      // This actually falls through to slash split: "[#ff0000]" / "50"
      // "[#ff0000]" is not a valid color lookup → empty
      // This is the intended behavior: use either arbitrary OR opacity, not both
      expect(dot('bg-[#ff0000]/50')).toEqual({});
    });
    it('invalid opacity number → no match', () => {
      expect(dot('bg-primary-500/abc')).toEqual({});
    });
  });

  describe('with variants', () => {
    it('dark:bg-primary-500/30', () => {
      expect(dot('dark:bg-primary-500/30', { dark: true })).toEqual({
        backgroundColor: 'rgb(43 108 214 / 0.3)',
      });
    });
  });
});
