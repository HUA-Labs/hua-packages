import { describe, it, expect, beforeEach } from 'vitest';
import { dot, dotExplain, clearDotCache } from '../../index';
import { _resetNativeWarnings } from '../../adapters/native';

beforeEach(() => {
  clearDotCache();
  _resetNativeWarnings();
});

describe('Phase 0 — native target correctness', () => {
  describe('bg-clip-text → dropped on native', () => {
    it('web returns backgroundClip + WebkitBackgroundClip', () => {
      const result = dot('bg-clip-text');
      expect(result).toEqual({ backgroundClip: 'text', WebkitBackgroundClip: 'text' });
    });

    it('native drops bg-clip properties', () => {
      const result = dot('bg-clip-text', { target: 'native' });
      expect(result).toEqual({});
    });

    it('dotExplain reports bg-clip as dropped on native', () => {
      const { report } = dotExplain('bg-clip-text', { target: 'native' });
      expect(report._dropped).toContain('backgroundClip');
      expect(report._dropped).toContain('WebkitBackgroundClip');
    });
  });

  describe('antialiased → dropped on native', () => {
    it('web returns font smoothing', () => {
      const result = dot('antialiased');
      expect(result).toEqual({
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      });
    });

    it('native drops font smoothing', () => {
      const result = dot('antialiased', { target: 'native' });
      expect(result).toEqual({});
    });

    it('dotExplain reports as dropped on native', () => {
      const { report } = dotExplain('antialiased', { target: 'native' });
      expect(report._dropped).toContain('WebkitFontSmoothing');
      expect(report._dropped).toContain('MozOsxFontSmoothing');
    });
  });

  describe('subpixel-antialiased → dropped on native', () => {
    it('native drops subpixel font smoothing', () => {
      const result = dot('subpixel-antialiased', { target: 'native' });
      expect(result).toEqual({});
    });
  });

  describe('overflow-x/y → dropped on native', () => {
    it('web returns overflowX', () => {
      const result = dot('overflow-x-auto');
      expect(result).toEqual({ overflowX: 'auto' });
    });

    it('native drops overflowX (RN only supports overflow)', () => {
      const result = dot('overflow-x-auto', { target: 'native' });
      expect(result).toEqual({});
    });

    it('native drops overflowY', () => {
      const result = dot('overflow-y-hidden', { target: 'native' });
      expect(result).toEqual({});
    });

    it('dotExplain reports overflowX as dropped', () => {
      const { report } = dotExplain('overflow-x-auto', { target: 'native' });
      expect(report._dropped).toContain('overflowX');
    });

    it('overflow (no axis) still works on native', () => {
      const result = dot('overflow-hidden', { target: 'native' });
      expect(result).toHaveProperty('overflow', 'hidden');
    });
  });

  describe('outline bare → outlineWidth + outlineStyle', () => {
    it('outline → width 1px + style solid', () => {
      const result = dot('outline');
      expect(result).toEqual({ outlineWidth: '1px', outlineStyle: 'solid' });
    });
  });

  describe('divide-x/y → unsupported (child selector)', () => {
    it('divide-y → {} (requires > * + * selector)', () => {
      expect(dot('divide-y')).toEqual({});
    });

    it('divide-x → {}', () => {
      expect(dot('divide-x')).toEqual({});
    });

    it('divide-color still works', () => {
      expect(dot('divide-gray-200')).toEqual({ borderColor: '#c1c4c8' });
    });
  });
});
