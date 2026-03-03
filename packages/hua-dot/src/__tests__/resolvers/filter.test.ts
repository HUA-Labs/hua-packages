import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('blur-* (element filter)', () => {
  it('resolves blur (bare = 8px)', () => {
    expect(dot('blur')).toEqual({ filter: 'blur(8px)' });
  });

  it('resolves blur-sm', () => {
    expect(dot('blur-sm')).toEqual({ filter: 'blur(4px)' });
  });

  it('resolves blur-md', () => {
    expect(dot('blur-md')).toEqual({ filter: 'blur(12px)' });
  });

  it('resolves blur-lg', () => {
    expect(dot('blur-lg')).toEqual({ filter: 'blur(16px)' });
  });

  it('resolves blur-xl', () => {
    expect(dot('blur-xl')).toEqual({ filter: 'blur(24px)' });
  });

  it('resolves blur-2xl', () => {
    expect(dot('blur-2xl')).toEqual({ filter: 'blur(40px)' });
  });

  it('resolves blur-3xl', () => {
    expect(dot('blur-3xl')).toEqual({ filter: 'blur(64px)' });
  });

  it('resolves blur-none', () => {
    expect(dot('blur-none')).toEqual({ filter: 'blur(0)' });
  });

  it('resolves arbitrary blur-[2px]', () => {
    expect(dot('blur-[2px]')).toEqual({ filter: 'blur(2px)' });
  });

  it('returns empty for unknown blur value', () => {
    expect(dot('blur-unknown')).toEqual({});
  });
});

describe('brightness-*', () => {
  it('resolves brightness-75', () => {
    expect(dot('brightness-75')).toEqual({ filter: 'brightness(.75)' });
  });

  it('resolves brightness-100', () => {
    expect(dot('brightness-100')).toEqual({ filter: 'brightness(1)' });
  });

  it('resolves brightness-150', () => {
    expect(dot('brightness-150')).toEqual({ filter: 'brightness(1.5)' });
  });

  it('resolves arbitrary brightness-[.3]', () => {
    expect(dot('brightness-[.3]')).toEqual({ filter: 'brightness(.3)' });
  });
});

describe('contrast-*', () => {
  it('resolves contrast-50', () => {
    expect(dot('contrast-50')).toEqual({ filter: 'contrast(.5)' });
  });

  it('resolves contrast-125', () => {
    expect(dot('contrast-125')).toEqual({ filter: 'contrast(1.25)' });
  });

  it('resolves contrast-200', () => {
    expect(dot('contrast-200')).toEqual({ filter: 'contrast(2)' });
  });
});

describe('saturate-*', () => {
  it('resolves saturate-0', () => {
    expect(dot('saturate-0')).toEqual({ filter: 'saturate(0)' });
  });

  it('resolves saturate-100', () => {
    expect(dot('saturate-100')).toEqual({ filter: 'saturate(1)' });
  });

  it('resolves saturate-200', () => {
    expect(dot('saturate-200')).toEqual({ filter: 'saturate(2)' });
  });
});

describe('grayscale / grayscale-0', () => {
  it('resolves grayscale (bare = 100%)', () => {
    expect(dot('grayscale')).toEqual({ filter: 'grayscale(100%)' });
  });

  it('resolves grayscale-0', () => {
    expect(dot('grayscale-0')).toEqual({ filter: 'grayscale(0)' });
  });

  it('resolves arbitrary grayscale-[50%]', () => {
    expect(dot('grayscale-[50%]')).toEqual({ filter: 'grayscale(50%)' });
  });
});

describe('sepia / sepia-0', () => {
  it('resolves sepia (bare = 100%)', () => {
    expect(dot('sepia')).toEqual({ filter: 'sepia(100%)' });
  });

  it('resolves sepia-0', () => {
    expect(dot('sepia-0')).toEqual({ filter: 'sepia(0)' });
  });
});

describe('invert / invert-0', () => {
  it('resolves invert (bare = 100%)', () => {
    expect(dot('invert')).toEqual({ filter: 'invert(100%)' });
  });

  it('resolves invert-0', () => {
    expect(dot('invert-0')).toEqual({ filter: 'invert(0)' });
  });
});

describe('hue-rotate-*', () => {
  it('resolves hue-rotate-0', () => {
    expect(dot('hue-rotate-0')).toEqual({ filter: 'hue-rotate(0deg)' });
  });

  it('resolves hue-rotate-90', () => {
    expect(dot('hue-rotate-90')).toEqual({ filter: 'hue-rotate(90deg)' });
  });

  it('resolves hue-rotate-180', () => {
    expect(dot('hue-rotate-180')).toEqual({ filter: 'hue-rotate(180deg)' });
  });

  it('resolves arbitrary hue-rotate-[270deg]', () => {
    expect(dot('hue-rotate-[270deg]')).toEqual({ filter: 'hue-rotate(270deg)' });
  });
});

describe('drop-shadow-*', () => {
  it('resolves drop-shadow (bare = default)', () => {
    const result = dot('drop-shadow');
    expect(result.filter).toContain('drop-shadow(');
  });

  it('resolves drop-shadow-sm', () => {
    expect(dot('drop-shadow-sm')).toEqual({
      filter: 'drop-shadow(0 1px 1px rgb(0 0 0 / 0.05))',
    });
  });

  it('resolves drop-shadow-lg', () => {
    const result = dot('drop-shadow-lg');
    expect(result.filter).toContain('drop-shadow(');
  });

  it('resolves drop-shadow-none', () => {
    expect(dot('drop-shadow-none')).toEqual({
      filter: 'drop-shadow(0 0 0 transparent)',
    });
  });

  it('resolves arbitrary drop-shadow-[0_2px_4px_black]', () => {
    expect(dot('drop-shadow-[0_2px_4px_black]')).toEqual({
      filter: 'drop-shadow(0 2px 4px black)',
    });
  });
});

describe('mix-blend-*', () => {
  it('resolves mix-blend-normal', () => {
    expect(dot('mix-blend-normal')).toEqual({ mixBlendMode: 'normal' });
  });

  it('resolves mix-blend-multiply', () => {
    expect(dot('mix-blend-multiply')).toEqual({ mixBlendMode: 'multiply' });
  });

  it('resolves mix-blend-screen', () => {
    expect(dot('mix-blend-screen')).toEqual({ mixBlendMode: 'screen' });
  });

  it('resolves mix-blend-overlay', () => {
    expect(dot('mix-blend-overlay')).toEqual({ mixBlendMode: 'overlay' });
  });

  it('resolves mix-blend-difference', () => {
    expect(dot('mix-blend-difference')).toEqual({ mixBlendMode: 'difference' });
  });

  it('resolves mix-blend-color-dodge', () => {
    expect(dot('mix-blend-color-dodge')).toEqual({ mixBlendMode: 'color-dodge' });
  });

  it('resolves mix-blend-luminosity', () => {
    expect(dot('mix-blend-luminosity')).toEqual({ mixBlendMode: 'luminosity' });
  });

  it('returns empty for unknown mix-blend value', () => {
    expect(dot('mix-blend-unknown')).toEqual({});
  });
});

describe('filter combinations', () => {
  it('last filter wins (single filter property)', () => {
    const result = dot('blur-md brightness-75');
    // Both set `filter`, last wins
    expect(result.filter).toBe('brightness(.75)');
  });

  it('filter + non-filter utilities combine correctly', () => {
    const result = dot('blur-md p-4 opacity-50');
    expect(result).toEqual({
      filter: 'blur(12px)',
      padding: '16px',
      opacity: '0.5',
    });
  });

  it('dark variant works with filter', () => {
    const result = dot('blur-sm dark:blur-lg', { dark: true });
    expect(result).toEqual({ filter: 'blur(16px)' });
  });
});
