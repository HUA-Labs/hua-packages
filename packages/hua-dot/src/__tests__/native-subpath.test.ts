import { describe, it, expect, beforeEach } from 'vitest';
import { dot, dotMap, createDotConfig, clearDotCache, dotCx } from '../native';

describe('@hua-labs/dot/native subpath', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // -----------------------------------------------------------------------
  // dot() — auto native target
  // -----------------------------------------------------------------------
  describe('dot()', () => {
    it('returns numeric spacing values (native format)', () => {
      const result = dot('p-4 m-2');
      expect(result).toEqual({ padding: 16, margin: 8 });
    });

    it('converts border-radius to numbers', () => {
      const result = dot('rounded-lg');
      expect(result).toHaveProperty('borderRadius');
      expect(typeof result['borderRadius']).toBe('number');
    });

    it('passes through colors', () => {
      const result = dot('bg-primary-500 text-white');
      expect(result).toEqual({
        backgroundColor: '#3b82f6',
        color: '#ffffff',
      });
    });

    it('drops CSS-only properties silently', () => {
      const result = dot('cursor-pointer p-4');
      expect(result).not.toHaveProperty('cursor');
      expect(result).toHaveProperty('padding', 16);
    });

    it('converts typography to numeric', () => {
      const result = dot('text-sm font-bold');
      expect(result).toHaveProperty('fontSize');
      expect(typeof result['fontSize']).toBe('number');
      expect(result).toHaveProperty('fontWeight', '700');
    });

    it('handles transforms as RN array', () => {
      const result = dot('rotate-45 scale-110');
      expect(result).toHaveProperty('transform');
      expect(Array.isArray(result['transform'])).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // dotMap() — auto native target
  // -----------------------------------------------------------------------
  describe('dotMap()', () => {
    it('returns base styles in native format', () => {
      const result = dotMap('p-4 bg-white hover:bg-gray-100');

      expect(result.base).toHaveProperty('padding', 16);
      expect(result.base).toHaveProperty('backgroundColor', '#ffffff');
      expect(result.hover).toBeDefined();
      expect(result.hover).toHaveProperty('backgroundColor', '#f3f4f6');
    });

    it('handles focus state', () => {
      const result = dotMap('p-4 focus:bg-gray-200');

      expect(result.base).toHaveProperty('padding', 16);
      expect(result.focus).toBeDefined();
    });
  });

  // -----------------------------------------------------------------------
  // Dark mode
  // -----------------------------------------------------------------------
  describe('dark mode', () => {
    it('resolves dark variant styles', () => {
      const result = dot('bg-white dark:bg-gray-900', { dark: true });
      expect(result).toHaveProperty('backgroundColor', '#111827');
    });

    it('ignores dark variants when dark=false', () => {
      const result = dot('bg-white dark:bg-gray-900');
      expect(result).toHaveProperty('backgroundColor', '#ffffff');
    });
  });

  // -----------------------------------------------------------------------
  // Responsive
  // -----------------------------------------------------------------------
  describe('responsive', () => {
    it('applies mobile-first cascade', () => {
      const result = dot('p-4 md:p-8 lg:p-12', { breakpoint: 'lg' });
      expect(result).toHaveProperty('padding', 48);
    });

    it('ignores higher breakpoints', () => {
      const result = dot('p-4 md:p-8 lg:p-12', { breakpoint: 'md' });
      expect(result).toHaveProperty('padding', 32);
    });
  });

  // -----------------------------------------------------------------------
  // Re-exports
  // -----------------------------------------------------------------------
  describe('re-exports', () => {
    it('dotCx is available and works', () => {
      expect(dotCx('p-4', false, 'flex')).toBe('p-4 flex');
    });

    it('createDotConfig returns config', () => {
      const config = createDotConfig({ runtime: 'native' });
      expect(config.runtime).toBe('native');
      // Reset
      createDotConfig();
    });
  });
});
