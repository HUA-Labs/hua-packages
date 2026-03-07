import { describe, it, expect } from 'vitest';
import { resolveTransform } from '../../resolvers/transform';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveTransform — rotate', () => {
  it('resolves rotate-45', () => {
    expect(resolveTransform('rotate', '45', config)).toEqual({ transform: 'rotate(45deg)' });
  });

  it('resolves rotate-0', () => {
    expect(resolveTransform('rotate', '0', config)).toEqual({ transform: 'rotate(0deg)' });
  });

  it('resolves rotate-180', () => {
    expect(resolveTransform('rotate', '180', config)).toEqual({ transform: 'rotate(180deg)' });
  });
});

describe('resolveTransform — scale', () => {
  it('resolves scale-110', () => {
    expect(resolveTransform('scale', '110', config)).toEqual({ transform: 'scale(1.1)' });
  });

  it('resolves scale-0', () => {
    expect(resolveTransform('scale', '0', config)).toEqual({ transform: 'scale(0)' });
  });

  it('resolves scale-150', () => {
    expect(resolveTransform('scale', '150', config)).toEqual({ transform: 'scale(1.5)' });
  });

  it('resolves scale-x-75', () => {
    expect(resolveTransform('scale-x', '75', config)).toEqual({ transform: 'scaleX(.75)' });
  });

  it('resolves scale-y-125', () => {
    expect(resolveTransform('scale-y', '125', config)).toEqual({ transform: 'scaleY(1.25)' });
  });
});

describe('resolveTransform — translate', () => {
  it('resolves translate-x-4 (spacing scale)', () => {
    expect(resolveTransform('translate-x', '4', config)).toEqual({ transform: 'translateX(16px)' });
  });

  it('resolves translate-y-8 (spacing scale)', () => {
    expect(resolveTransform('translate-y', '8', config)).toEqual({ transform: 'translateY(32px)' });
  });

  it('resolves translate-y-full (keyword)', () => {
    expect(resolveTransform('translate-y', 'full', config)).toEqual({ transform: 'translateY(100%)' });
  });

  it('resolves translate-x-1/2 (keyword)', () => {
    expect(resolveTransform('translate-x', '1/2', config)).toEqual({ transform: 'translateX(50%)' });
  });

  it('resolves translate-y-0 (spacing)', () => {
    expect(resolveTransform('translate-y', '0', config)).toEqual({ transform: 'translateY(0px)' });
  });

  it('resolves translate-x-3/4 (keyword fraction)', () => {
    expect(resolveTransform('translate-x', '3/4', config)).toEqual({ transform: 'translateX(75%)' });
  });

  it('rejects translate-y-screen (viewport keywords excluded)', () => {
    expect(resolveTransform('translate-y', 'screen', config)).toEqual({});
  });

  it('resolves translate-x-auto via spacing (auto is in spacing tokens)', () => {
    // auto is in spacing tokens, so it resolves — browsers ignore invalid translateX(auto)
    expect(resolveTransform('translate-x', 'auto', config)).toEqual({ transform: 'translateX(auto)' });
  });

  it('rejects translate-y-min (content keywords excluded)', () => {
    expect(resolveTransform('translate-y', 'min', config)).toEqual({});
  });

  it('rejects translate-x-fit (content keywords excluded)', () => {
    expect(resolveTransform('translate-x', 'fit', config)).toEqual({});
  });

  it('rejects translate-y-max (content keywords excluded)', () => {
    expect(resolveTransform('translate-y', 'max', config)).toEqual({});
  });
});

describe('resolveTransform — skew', () => {
  it('resolves skew-x-6', () => {
    expect(resolveTransform('skew-x', '6', config)).toEqual({ transform: 'skewX(6deg)' });
  });

  it('resolves skew-y-12', () => {
    expect(resolveTransform('skew-y', '12', config)).toEqual({ transform: 'skewY(12deg)' });
  });
});

describe('resolveTransform — unknown', () => {
  it('returns empty for unknown rotate value', () => {
    expect(resolveTransform('rotate', '999', config)).toEqual({});
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveTransform('unknown', '45', config)).toEqual({});
  });
});
