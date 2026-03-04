import { describe, it, expect } from 'vitest';
import { dot, dotMap } from '../../index';

describe('ring utilities', () => {
  describe('ring width', () => {
    it('ring (bare) → 3px default', () => {
      expect(dot('ring')).toEqual({ boxShadow: '0 0 0 3px var(--color-ring)' });
    });
    it('ring-0', () => {
      expect(dot('ring-0')).toEqual({ boxShadow: '0 0 0 0px var(--color-ring)' });
    });
    it('ring-1', () => {
      expect(dot('ring-1')).toEqual({ boxShadow: '0 0 0 1px var(--color-ring)' });
    });
    it('ring-2', () => {
      expect(dot('ring-2')).toEqual({ boxShadow: '0 0 0 2px var(--color-ring)' });
    });
    it('ring-4', () => {
      expect(dot('ring-4')).toEqual({ boxShadow: '0 0 0 4px var(--color-ring)' });
    });
    it('ring-8', () => {
      expect(dot('ring-8')).toEqual({ boxShadow: '0 0 0 8px var(--color-ring)' });
    });
  });

  describe('ring color', () => {
    it('ring-blue-500', () => {
      expect(dot('ring-blue-500')).toEqual({ boxShadow: '0 0 0 3px #3b82f6' });
    });
    it('ring-red-500', () => {
      expect(dot('ring-red-500')).toEqual({ boxShadow: '0 0 0 3px #ef4444' });
    });
    it('ring-white', () => {
      expect(dot('ring-white')).toEqual({ boxShadow: '0 0 0 3px #ffffff' });
    });
    it('ring-transparent', () => {
      expect(dot('ring-transparent')).toEqual({ boxShadow: '0 0 0 3px transparent' });
    });
  });

  describe('ring arbitrary', () => {
    it('ring-[5px]', () => {
      expect(dot('ring-[5px]')).toEqual({ boxShadow: '0 0 0 5px var(--color-ring)' });
    });
  });

  describe('ring-offset', () => {
    it('ring-offset-0', () => {
      expect(dot('ring-offset-0')).toEqual({ outlineOffset: '0px' });
    });
    it('ring-offset-2', () => {
      expect(dot('ring-offset-2')).toEqual({ outlineOffset: '2px' });
    });
    it('ring-offset-4', () => {
      expect(dot('ring-offset-4')).toEqual({ outlineOffset: '4px' });
    });
    it('ring-offset-[3px]', () => {
      expect(dot('ring-offset-[3px]')).toEqual({ outlineOffset: '3px' });
    });
  });

  describe('combined ring', () => {
    it('ring-2 ring-blue-500 → last-wins (both produce boxShadow)', () => {
      expect(dot('ring-2 ring-blue-500')).toEqual({
        boxShadow: '0 0 0 3px #3b82f6',
      });
    });
    it('ring-2 ring-offset-2', () => {
      expect(dot('ring-2 ring-offset-2')).toEqual({
        boxShadow: '0 0 0 2px var(--color-ring)',
        outlineOffset: '2px',
      });
    });
  });

  describe('with state variants (dotMap)', () => {
    it('focus:ring-2', () => {
      const result = dotMap('focus:ring-2');
      expect(result.base).toEqual({});
      expect(result.focus).toEqual({ boxShadow: '0 0 0 2px var(--color-ring)' });
    });
    it('focus-visible:ring-2 focus-visible:ring-blue-500', () => {
      const result = dotMap('focus-visible:ring-2 focus-visible:ring-blue-500');
      expect(result['focus-visible']).toEqual({
        boxShadow: '0 0 0 3px #3b82f6',
      });
    });
  });

  describe('with dark variant', () => {
    it('dark:ring-purple-500', () => {
      expect(dot('dark:ring-purple-500', { dark: true })).toEqual({
        boxShadow: '0 0 0 3px #a855f7',
      });
    });
    it('dark:ring-purple-500 (dark=false → ignored)', () => {
      expect(dot('dark:ring-purple-500', { dark: false })).toEqual({});
    });
  });
});
