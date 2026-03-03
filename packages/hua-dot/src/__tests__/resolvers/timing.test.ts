import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig } from '../../index';

describe('timing tokens', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves ease-spring', () => {
    expect(dot('ease-spring')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    });
  });

  it('resolves ease-bounce', () => {
    expect(dot('ease-bounce')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    });
  });

  it('resolves ease-snap', () => {
    expect(dot('ease-snap')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    });
  });

  it('existing ease-in still works', () => {
    expect(dot('ease-in')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 1, 1)',
    });
  });

  it('existing ease-out still works', () => {
    expect(dot('ease-out')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
    });
  });

  it('existing ease-in-out still works', () => {
    expect(dot('ease-in-out')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    });
  });

  it('custom timing overrides via config', () => {
    createDotConfig({
      theme: {
        timing: {
          'custom': 'cubic-bezier(0.1, 0.2, 0.3, 0.4)',
        },
      },
    });
    expect(dot('ease-custom')).toEqual({
      transitionTimingFunction: 'cubic-bezier(0.1, 0.2, 0.3, 0.4)',
    });
  });

  it('combines with transition and duration', () => {
    const result = dot('transition duration-300 ease-spring');
    expect(result).toHaveProperty('transitionProperty');
    expect(result).toHaveProperty('transitionDuration', '300ms');
    expect(result).toHaveProperty(
      'transitionTimingFunction',
      'cubic-bezier(0.34, 1.56, 0.64, 1)',
    );
  });
});
