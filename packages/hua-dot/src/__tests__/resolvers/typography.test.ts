import { describe, it, expect } from 'vitest';
import { resolveTypography } from '../../resolvers/typography';
import { resolveConfig } from '../../config';
const config = resolveConfig();

describe('resolveTypography', () => {
  describe('text- prefix (ambiguity handling)', () => {
    it('resolves text-align (highest priority)', () => {
      expect(resolveTypography('text', 'center', config)).toEqual({ textAlign: 'center' });
      expect(resolveTypography('text', 'left', config)).toEqual({ textAlign: 'left' });
      expect(resolveTypography('text', 'right', config)).toEqual({ textAlign: 'right' });
      expect(resolveTypography('text', 'justify', config)).toEqual({ textAlign: 'justify' });
    });

    it('resolves font-size (second priority)', () => {
      expect(resolveTypography('text', 'sm', config)).toEqual({ fontSize: '14px' });
      expect(resolveTypography('text', 'base', config)).toEqual({ fontSize: '16px' });
      expect(resolveTypography('text', 'lg', config)).toEqual({ fontSize: '18px' });
      expect(resolveTypography('text', 'xl', config)).toEqual({ fontSize: '20px' });
      expect(resolveTypography('text', '2xl', config)).toEqual({ fontSize: '24px' });
      expect(resolveTypography('text', '6xl', config)).toEqual({ fontSize: '60px' });
    });

    it('resolves color (fallthrough)', () => {
      expect(resolveTypography('text', 'red-500', config)).toEqual({ color: '#ca2c22' });
      expect(resolveTypography('text', 'white', config)).toEqual({ color: '#ffffff' });
      expect(resolveTypography('text', 'gray-900', config)).toEqual({ color: '#121418' });
    });

    it('returns empty for unknown text value', () => {
      expect(resolveTypography('text', 'unknown', config)).toEqual({});
    });
  });

  describe('font- prefix', () => {
    it('resolves font weights', () => {
      expect(resolveTypography('font', 'bold', config)).toEqual({ fontWeight: '700' });
      expect(resolveTypography('font', 'normal', config)).toEqual({ fontWeight: '400' });
      expect(resolveTypography('font', 'semibold', config)).toEqual({ fontWeight: '600' });
      expect(resolveTypography('font', 'thin', config)).toEqual({ fontWeight: '100' });
      expect(resolveTypography('font', 'black', config)).toEqual({ fontWeight: '900' });
    });

    it('returns empty for unknown font value', () => {
      expect(resolveTypography('font', 'unknown', config)).toEqual({});
    });
  });

  describe('leading- prefix', () => {
    it('resolves line heights', () => {
      expect(resolveTypography('leading', 'tight', config)).toEqual({ lineHeight: '1.25' });
      expect(resolveTypography('leading', 'normal', config)).toEqual({ lineHeight: '1.5' });
      expect(resolveTypography('leading', 'loose', config)).toEqual({ lineHeight: '2' });
      expect(resolveTypography('leading', 'none', config)).toEqual({ lineHeight: '1' });
    });

    it('resolves numeric line heights', () => {
      expect(resolveTypography('leading', '6', config)).toEqual({ lineHeight: '24px' });
    });
  });

  describe('tracking- prefix', () => {
    it('resolves letter spacings', () => {
      expect(resolveTypography('tracking', 'tight', config)).toEqual({ letterSpacing: '-0.025em' });
      expect(resolveTypography('tracking', 'normal', config)).toEqual({ letterSpacing: '0em' });
      expect(resolveTypography('tracking', 'wide', config)).toEqual({ letterSpacing: '0.025em' });
      expect(resolveTypography('tracking', 'widest', config)).toEqual({ letterSpacing: '0.1em' });
    });
  });
});
