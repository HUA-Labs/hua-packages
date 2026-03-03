import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig } from '../../index';

describe('backdrop-brightness', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves backdrop-brightness-75', () => {
    expect(dot('backdrop-brightness-75')).toEqual({ backdropFilter: 'brightness(.75)' });
  });

  it('resolves backdrop-brightness-100', () => {
    expect(dot('backdrop-brightness-100')).toEqual({ backdropFilter: 'brightness(1)' });
  });

  it('resolves backdrop-brightness-125', () => {
    expect(dot('backdrop-brightness-125')).toEqual({ backdropFilter: 'brightness(1.25)' });
  });

  it('resolves backdrop-brightness-150', () => {
    expect(dot('backdrop-brightness-150')).toEqual({ backdropFilter: 'brightness(1.5)' });
  });

  it('resolves backdrop-brightness-0', () => {
    expect(dot('backdrop-brightness-0')).toEqual({ backdropFilter: 'brightness(0)' });
  });

  it('resolves backdrop-brightness-50', () => {
    expect(dot('backdrop-brightness-50')).toEqual({ backdropFilter: 'brightness(.5)' });
  });

  it('resolves backdrop-brightness-200', () => {
    expect(dot('backdrop-brightness-200')).toEqual({ backdropFilter: 'brightness(2)' });
  });
});

describe('backdrop-contrast', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves backdrop-contrast-0', () => {
    expect(dot('backdrop-contrast-0')).toEqual({ backdropFilter: 'contrast(0)' });
  });

  it('resolves backdrop-contrast-75', () => {
    expect(dot('backdrop-contrast-75')).toEqual({ backdropFilter: 'contrast(.75)' });
  });

  it('resolves backdrop-contrast-100', () => {
    expect(dot('backdrop-contrast-100')).toEqual({ backdropFilter: 'contrast(1)' });
  });

  it('resolves backdrop-contrast-125', () => {
    expect(dot('backdrop-contrast-125')).toEqual({ backdropFilter: 'contrast(1.25)' });
  });

  it('resolves backdrop-contrast-200', () => {
    expect(dot('backdrop-contrast-200')).toEqual({ backdropFilter: 'contrast(2)' });
  });
});

describe('backdrop-saturate', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves backdrop-saturate-0', () => {
    expect(dot('backdrop-saturate-0')).toEqual({ backdropFilter: 'saturate(0)' });
  });

  it('resolves backdrop-saturate-50', () => {
    expect(dot('backdrop-saturate-50')).toEqual({ backdropFilter: 'saturate(.5)' });
  });

  it('resolves backdrop-saturate-100', () => {
    expect(dot('backdrop-saturate-100')).toEqual({ backdropFilter: 'saturate(1)' });
  });

  it('resolves backdrop-saturate-150', () => {
    expect(dot('backdrop-saturate-150')).toEqual({ backdropFilter: 'saturate(1.5)' });
  });

  it('resolves backdrop-saturate-200', () => {
    expect(dot('backdrop-saturate-200')).toEqual({ backdropFilter: 'saturate(2)' });
  });
});

describe('backdrop combinations', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('last backdrop filter wins (CSS property override)', () => {
    // Since all backdrop-* tokens map to the same CSS property,
    // the last one wins in the style object
    const result = dot('backdrop-blur-md backdrop-brightness-75');
    expect(result).toHaveProperty('backdropFilter', 'brightness(.75)');
  });
});
