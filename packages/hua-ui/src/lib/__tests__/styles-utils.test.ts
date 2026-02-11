import { describe, it, expect } from 'vitest';
import {
  withDarkMode,
  createGradient,
  withOpacity,
  isTextWhite,
  isGradientVariant,
  responsive,
  conditionalClass
} from '../styles/utils';

describe('withDarkMode', () => {
  it('should concatenate light and dark mode classes', () => {
    expect(withDarkMode('bg-white', 'bg-gray-900')).toBe('bg-white dark:bg-gray-900');
  });

  it('should handle complex classes', () => {
    expect(withDarkMode('bg-white text-black', 'bg-slate-900 text-white'))
      .toBe('bg-white text-black dark:bg-slate-900 text-white');
  });
});

describe('createGradient', () => {
  it('should create gradient with default direction (to-r)', () => {
    const result = createGradient('blue-500', 'purple-600');
    expect(result).toContain('bg-gradient-to-r');
    expect(result).toContain('from-blue-500');
    expect(result).toContain('to-purple-600');
  });

  it('should create gradient with custom direction', () => {
    const result = createGradient('blue-500', 'purple-600', 'to-b');
    expect(result).toContain('bg-gradient-to-b');
    expect(result).toContain('from-blue-500');
    expect(result).toContain('to-purple-600');
  });

  it('should handle all gradient directions', () => {
    expect(createGradient('red-500', 'blue-500', 'to-l')).toContain('bg-gradient-to-l');
    expect(createGradient('red-500', 'blue-500', 'to-t')).toContain('bg-gradient-to-t');
    expect(createGradient('red-500', 'blue-500', 'to-br')).toContain('bg-gradient-to-br');
    expect(createGradient('red-500', 'blue-500', 'to-bl')).toContain('bg-gradient-to-bl');
    expect(createGradient('red-500', 'blue-500', 'to-tr')).toContain('bg-gradient-to-tr');
    expect(createGradient('red-500', 'blue-500', 'to-tl')).toContain('bg-gradient-to-tl');
  });
});

describe('withOpacity', () => {
  it('should add opacity to color class', () => {
    expect(withOpacity('blue-500', 50)).toBe('blue-500/50');
  });

  it('should handle different opacity values', () => {
    expect(withOpacity('red-500', 0)).toBe('red-500/0');
    expect(withOpacity('red-500', 100)).toBe('red-500/100');
    expect(withOpacity('red-500', 75)).toBe('red-500/75');
  });

  it('should work with any color format', () => {
    expect(withOpacity('bg-blue-500', 50)).toBe('bg-blue-500/50');
    expect(withOpacity('text-red-500', 30)).toBe('text-red-500/30');
  });
});

describe('isTextWhite', () => {
  it('should return true for gradient variant', () => {
    expect(isTextWhite('gradient')).toBe(true);
  });

  it('should return true for solid variant', () => {
    expect(isTextWhite('solid')).toBe(true);
  });

  it('should return false for default variant', () => {
    expect(isTextWhite('default')).toBe(false);
  });

  it('should return false for outline variant', () => {
    expect(isTextWhite('outline')).toBe(false);
  });

  it('should return false for ghost variant', () => {
    expect(isTextWhite('ghost')).toBe(false);
  });
});

describe('isGradientVariant', () => {
  it('should return true for gradient variant', () => {
    expect(isGradientVariant('gradient')).toBe(true);
  });

  it('should return false for default variant', () => {
    expect(isGradientVariant('default')).toBe(false);
  });

  it('should return false for solid variant', () => {
    expect(isGradientVariant('solid')).toBe(false);
  });

  it('should return false for other variants', () => {
    expect(isGradientVariant('outline')).toBe(false);
    expect(isGradientVariant('ghost')).toBe(false);
  });
});

describe('responsive', () => {
  it('should create responsive classes with all breakpoints', () => {
    const result = responsive('text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl');
    expect(result).toContain('text-sm');
    expect(result).toContain('sm:text-base');
    expect(result).toContain('md:text-lg');
    expect(result).toContain('lg:text-xl');
    expect(result).toContain('xl:text-2xl');
  });

  it('should handle partial breakpoints', () => {
    const result = responsive('text-sm', undefined, 'text-lg');
    expect(result).toContain('text-sm');
    expect(result).not.toContain('sm:');
    expect(result).toContain('md:text-lg');
  });

  it('should handle only base class', () => {
    const result = responsive('text-base');
    expect(result).toBe('text-base');
  });

  it('should work with complex classes', () => {
    const result = responsive('px-4 py-2', 'px-6 py-3', 'px-8 py-4');
    // Note: merge() will resolve Tailwind conflicts, so later breakpoint values win
    expect(result).toContain('px-4');
    expect(result).toContain('sm:px-6');
    expect(result).toContain('md:px-8');
  });

  it('should filter out undefined breakpoints', () => {
    const result = responsive('text-sm', undefined, undefined, 'text-xl');
    expect(result).not.toContain('undefined');
    expect(result).toContain('lg:text-xl');
  });
});

describe('conditionalClass', () => {
  it('should return trueClass when condition is true', () => {
    expect(conditionalClass(true, 'bg-blue-500', 'bg-gray-500')).toBe('bg-blue-500');
  });

  it('should return falseClass when condition is false', () => {
    expect(conditionalClass(false, 'bg-blue-500', 'bg-gray-500')).toBe('bg-gray-500');
  });

  it('should return empty string when condition is false and no falseClass', () => {
    expect(conditionalClass(false, 'bg-blue-500')).toBe('');
  });

  it('should handle complex classes', () => {
    expect(conditionalClass(true, 'px-4 py-2 rounded-lg')).toBe('px-4 py-2 rounded-lg');
  });
});
