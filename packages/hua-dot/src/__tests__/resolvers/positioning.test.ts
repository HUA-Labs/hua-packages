import { describe, it, expect } from 'vitest';
import { resolvePositioning } from '../../resolvers/positioning';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolvePositioning', () => {
  describe('single direction', () => {
    it('resolves top with spacing scale', () => {
      expect(resolvePositioning('top', '0', config)).toEqual({ top: '0px' });
      expect(resolvePositioning('top', '4', config)).toEqual({ top: '16px' });
      expect(resolvePositioning('top', '8', config)).toEqual({ top: '32px' });
      expect(resolvePositioning('top', 'px', config)).toEqual({ top: '1px' });
    });

    it('resolves right with spacing scale', () => {
      expect(resolvePositioning('right', '2', config)).toEqual({ right: '8px' });
      expect(resolvePositioning('right', '0.5', config)).toEqual({ right: '2px' });
    });

    it('resolves bottom with spacing scale', () => {
      expect(resolvePositioning('bottom', '6', config)).toEqual({ bottom: '24px' });
    });

    it('resolves left with spacing scale', () => {
      expect(resolvePositioning('left', '3', config)).toEqual({ left: '12px' });
    });
  });

  describe('keywords', () => {
    it('resolves auto', () => {
      expect(resolvePositioning('top', 'auto', config)).toEqual({ top: 'auto' });
      expect(resolvePositioning('left', 'auto', config)).toEqual({ left: 'auto' });
    });

    it('resolves full (100%)', () => {
      expect(resolvePositioning('top', 'full', config)).toEqual({ top: '100%' });
      expect(resolvePositioning('right', 'full', config)).toEqual({ right: '100%' });
    });

    it('resolves fractions', () => {
      expect(resolvePositioning('top', '1/2', config)).toEqual({ top: '50%' });
      expect(resolvePositioning('left', '1/3', config)).toEqual({ left: '33.333333%' });
      expect(resolvePositioning('right', '2/3', config)).toEqual({ right: '66.666667%' });
      expect(resolvePositioning('bottom', '1/4', config)).toEqual({ bottom: '25%' });
      expect(resolvePositioning('top', '3/4', config)).toEqual({ top: '75%' });
    });
  });

  describe('inset (all sides)', () => {
    it('resolves inset-0 to all four sides', () => {
      expect(resolvePositioning('inset', '0', config)).toEqual({
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      });
    });

    it('resolves inset with spacing', () => {
      expect(resolvePositioning('inset', '4', config)).toEqual({
        top: '16px',
        right: '16px',
        bottom: '16px',
        left: '16px',
      });
    });

    it('resolves inset-auto', () => {
      expect(resolvePositioning('inset', 'auto', config)).toEqual({
        top: 'auto',
        right: 'auto',
        bottom: 'auto',
        left: 'auto',
      });
    });

    it('resolves inset with fraction', () => {
      expect(resolvePositioning('inset', '1/2', config)).toEqual({
        top: '50%',
        right: '50%',
        bottom: '50%',
        left: '50%',
      });
    });
  });

  describe('inset-x (horizontal)', () => {
    it('resolves inset-x-0', () => {
      expect(resolvePositioning('inset-x', '0', config)).toEqual({
        left: '0px',
        right: '0px',
      });
    });

    it('resolves inset-x with spacing', () => {
      expect(resolvePositioning('inset-x', '4', config)).toEqual({
        left: '16px',
        right: '16px',
      });
    });

    it('resolves inset-x-auto', () => {
      expect(resolvePositioning('inset-x', 'auto', config)).toEqual({
        left: 'auto',
        right: 'auto',
      });
    });
  });

  describe('inset-y (vertical)', () => {
    it('resolves inset-y-0', () => {
      expect(resolvePositioning('inset-y', '0', config)).toEqual({
        top: '0px',
        bottom: '0px',
      });
    });

    it('resolves inset-y with spacing', () => {
      expect(resolvePositioning('inset-y', '8', config)).toEqual({
        top: '32px',
        bottom: '32px',
      });
    });
  });

  describe('logical properties', () => {
    it('resolves start', () => {
      expect(resolvePositioning('start', '4', config)).toEqual({ insetInlineStart: '16px' });
      expect(resolvePositioning('start', 'auto', config)).toEqual({ insetInlineStart: 'auto' });
      expect(resolvePositioning('start', '1/2', config)).toEqual({ insetInlineStart: '50%' });
    });

    it('resolves end', () => {
      expect(resolvePositioning('end', '4', config)).toEqual({ insetInlineEnd: '16px' });
      expect(resolvePositioning('end', 'auto', config)).toEqual({ insetInlineEnd: 'auto' });
      expect(resolvePositioning('end', 'full', config)).toEqual({ insetInlineEnd: '100%' });
    });
  });

  describe('edge cases', () => {
    it('returns empty for unknown prefix', () => {
      expect(resolvePositioning('center', '4', config)).toEqual({});
      expect(resolvePositioning('middle', '0', config)).toEqual({});
    });

    it('returns empty for unknown value', () => {
      expect(resolvePositioning('top', 'unknown', config)).toEqual({});
      expect(resolvePositioning('top', '999', config)).toEqual({});
      expect(resolvePositioning('top', 'banana', config)).toEqual({});
    });

    it('returns empty for empty value', () => {
      expect(resolvePositioning('top', '', config)).toEqual({});
    });

    it('handles spacing 0 correctly (not falsy)', () => {
      // '0' maps to '0px', should not be skipped
      expect(resolvePositioning('top', '0', config)).toEqual({ top: '0px' });
      expect(resolvePositioning('inset', '0', config)).toEqual({
        top: '0px', right: '0px', bottom: '0px', left: '0px',
      });
    });

    it('respects custom spacing from config', () => {
      const custom = resolveConfig({ theme: { spacing: { '18': '72px' } } });
      expect(resolvePositioning('top', '18', custom)).toEqual({ top: '72px' });
      expect(resolvePositioning('inset', '18', custom)).toEqual({
        top: '72px', right: '72px', bottom: '72px', left: '72px',
      });
    });

    it('keywords take priority over spacing scale', () => {
      // 'auto' is both in INSET_KEYWORDS and SPACING — keyword should win
      expect(resolvePositioning('top', 'auto', config)).toEqual({ top: 'auto' });
    });

    it('handles fractional spacing values', () => {
      expect(resolvePositioning('top', '0.5', config)).toEqual({ top: '2px' });
      expect(resolvePositioning('left', '1.5', config)).toEqual({ left: '6px' });
    });

    it('handles large spacing values', () => {
      expect(resolvePositioning('top', '96', config)).toEqual({ top: '384px' });
    });
  });
});
