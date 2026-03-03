import { describe, it, expect } from 'vitest';
import { resolveTransition } from '../../resolvers/transition';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveTransition — transition property', () => {
  it('resolves transition-all', () => {
    expect(resolveTransition('transition', 'all', config)).toEqual({
      transitionProperty: 'all',
    });
  });

  it('resolves transition-none', () => {
    expect(resolveTransition('transition', 'none', config)).toEqual({
      transitionProperty: 'none',
    });
  });

  it('resolves bare transition (DEFAULT value)', () => {
    const result = resolveTransition('transition', '', config);
    expect(result).toHaveProperty('transitionProperty');
  });

  it('resolves transition-colors (contains color)', () => {
    const result = resolveTransition('transition', 'colors', config);
    expect(result).toHaveProperty('transitionProperty');
    expect(result.transitionProperty).toContain('color');
  });

  it('resolves transition-opacity', () => {
    expect(resolveTransition('transition', 'opacity', config)).toEqual({
      transitionProperty: 'opacity',
    });
  });

  it('resolves transition-shadow', () => {
    expect(resolveTransition('transition', 'shadow', config)).toEqual({
      transitionProperty: 'box-shadow',
    });
  });

  it('resolves transition-transform', () => {
    expect(resolveTransition('transition', 'transform', config)).toEqual({
      transitionProperty: 'transform',
    });
  });
});

describe('resolveTransition — duration', () => {
  it('resolves duration-200', () => {
    expect(resolveTransition('duration', '200', config)).toEqual({
      transitionDuration: '200ms',
    });
  });

  it('resolves duration-0', () => {
    expect(resolveTransition('duration', '0', config)).toEqual({
      transitionDuration: '0s',
    });
  });

  it('resolves duration-1000', () => {
    expect(resolveTransition('duration', '1000', config)).toEqual({
      transitionDuration: '1000ms',
    });
  });
});

describe('resolveTransition — ease (timing function)', () => {
  it('resolves ease-linear', () => {
    expect(resolveTransition('ease', 'linear', config)).toEqual({
      transitionTimingFunction: 'linear',
    });
  });

  it('resolves ease-in (contains cubic-bezier)', () => {
    const result = resolveTransition('ease', 'in', config);
    expect(result).toHaveProperty('transitionTimingFunction');
    expect(result.transitionTimingFunction).toContain('cubic-bezier');
  });

  it('resolves ease-out', () => {
    const result = resolveTransition('ease', 'out', config);
    expect(result).toHaveProperty('transitionTimingFunction');
  });

  it('resolves ease-in-out', () => {
    const result = resolveTransition('ease', 'in-out', config);
    expect(result).toHaveProperty('transitionTimingFunction');
  });
});

describe('resolveTransition — delay', () => {
  it('resolves delay-100', () => {
    expect(resolveTransition('delay', '100', config)).toEqual({
      transitionDelay: '100ms',
    });
  });

  it('resolves delay-500', () => {
    expect(resolveTransition('delay', '500', config)).toEqual({
      transitionDelay: '500ms',
    });
  });
});

describe('resolveTransition — unknown', () => {
  it('returns empty for unknown duration value', () => {
    expect(resolveTransition('duration', '999', config)).toEqual({});
  });
});
