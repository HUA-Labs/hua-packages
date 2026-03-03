import { describe, it, expect } from 'vitest';
import { resolveOpacity } from '../../resolvers/opacity';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveOpacity', () => {
  it('resolves opacity-0', () => {
    expect(resolveOpacity('opacity', '0', config)).toEqual({ opacity: '0' });
  });

  it('resolves opacity-50', () => {
    expect(resolveOpacity('opacity', '50', config)).toEqual({ opacity: '0.5' });
  });

  it('resolves opacity-100', () => {
    expect(resolveOpacity('opacity', '100', config)).toEqual({ opacity: '1' });
  });

  it('resolves opacity-25', () => {
    expect(resolveOpacity('opacity', '25', config)).toEqual({ opacity: '0.25' });
  });

  it('resolves opacity-75', () => {
    expect(resolveOpacity('opacity', '75', config)).toEqual({ opacity: '0.75' });
  });

  it('resolves boundary value opacity-5', () => {
    expect(resolveOpacity('opacity', '5', config)).toEqual({ opacity: '0.05' });
  });

  it('returns empty for unknown opacity value', () => {
    expect(resolveOpacity('opacity', '99', config)).toEqual({});
  });
});
