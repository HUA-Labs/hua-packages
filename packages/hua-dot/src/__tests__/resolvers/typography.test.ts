import { describe, it, expect } from 'vitest';
import { resolveTypography } from '../../resolvers/typography';

describe('resolveTypography', () => {
  describe('text- prefix (ambiguity handling)', () => {
    it('resolves text-align (highest priority)', () => {
      expect(resolveTypography('text', 'center')).toEqual({ textAlign: 'center' });
      expect(resolveTypography('text', 'left')).toEqual({ textAlign: 'left' });
      expect(resolveTypography('text', 'right')).toEqual({ textAlign: 'right' });
      expect(resolveTypography('text', 'justify')).toEqual({ textAlign: 'justify' });
    });

    it('resolves font-size (second priority)', () => {
      expect(resolveTypography('text', 'sm')).toEqual({ fontSize: '14px' });
      expect(resolveTypography('text', 'base')).toEqual({ fontSize: '16px' });
      expect(resolveTypography('text', 'lg')).toEqual({ fontSize: '18px' });
      expect(resolveTypography('text', 'xl')).toEqual({ fontSize: '20px' });
      expect(resolveTypography('text', '2xl')).toEqual({ fontSize: '24px' });
      expect(resolveTypography('text', '6xl')).toEqual({ fontSize: '60px' });
    });

    it('resolves color (fallthrough)', () => {
      expect(resolveTypography('text', 'red-500')).toEqual({ color: '#ef4444' });
      expect(resolveTypography('text', 'white')).toEqual({ color: '#ffffff' });
      expect(resolveTypography('text', 'gray-900')).toEqual({ color: '#111827' });
    });

    it('returns empty for unknown text value', () => {
      expect(resolveTypography('text', 'unknown')).toEqual({});
    });
  });

  describe('font- prefix', () => {
    it('resolves font weights', () => {
      expect(resolveTypography('font', 'bold')).toEqual({ fontWeight: '700' });
      expect(resolveTypography('font', 'normal')).toEqual({ fontWeight: '400' });
      expect(resolveTypography('font', 'semibold')).toEqual({ fontWeight: '600' });
      expect(resolveTypography('font', 'thin')).toEqual({ fontWeight: '100' });
      expect(resolveTypography('font', 'black')).toEqual({ fontWeight: '900' });
    });

    it('returns empty for unknown font value', () => {
      expect(resolveTypography('font', 'unknown')).toEqual({});
    });
  });

  describe('leading- prefix', () => {
    it('resolves line heights', () => {
      expect(resolveTypography('leading', 'tight')).toEqual({ lineHeight: '1.25' });
      expect(resolveTypography('leading', 'normal')).toEqual({ lineHeight: '1.5' });
      expect(resolveTypography('leading', 'loose')).toEqual({ lineHeight: '2' });
      expect(resolveTypography('leading', 'none')).toEqual({ lineHeight: '1' });
    });

    it('resolves numeric line heights', () => {
      expect(resolveTypography('leading', '6')).toEqual({ lineHeight: '24px' });
    });
  });

  describe('tracking- prefix', () => {
    it('resolves letter spacings', () => {
      expect(resolveTypography('tracking', 'tight')).toEqual({ letterSpacing: '-0.025em' });
      expect(resolveTypography('tracking', 'normal')).toEqual({ letterSpacing: '0em' });
      expect(resolveTypography('tracking', 'wide')).toEqual({ letterSpacing: '0.025em' });
      expect(resolveTypography('tracking', 'widest')).toEqual({ letterSpacing: '0.1em' });
    });
  });
});
