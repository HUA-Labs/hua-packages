import { describe, it, expect } from 'vitest';
import { resolveShadow } from '../../resolvers/shadow';
import { resolveConfig } from '../../config';
import { dot } from '../../index';

const config = resolveConfig();

describe('resolveShadow (resolver unit)', () => {
  it('resolves shadow-sm to internal layer key', () => {
    expect(resolveShadow('shadow', 'sm', config)).toEqual({
      __dot_shadowLayer: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('resolves bare shadow (DEFAULT key)', () => {
    expect(resolveShadow('shadow', '', config)).toEqual({
      __dot_shadowLayer: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });
  });

  it('resolves shadow-md', () => {
    const result = resolveShadow('shadow', 'md', config);
    expect(result).toHaveProperty('__dot_shadowLayer');
  });

  it('resolves shadow-inner (contains inset)', () => {
    const result = resolveShadow('shadow', 'inner', config);
    expect(result).toHaveProperty('__dot_shadowLayer');
    expect(result.__dot_shadowLayer).toContain('inset');
  });

  it('resolves shadow-none', () => {
    expect(resolveShadow('shadow', 'none', config)).toEqual({ __dot_shadowLayer: 'none' });
  });

  it('returns empty for unknown shadow value', () => {
    expect(resolveShadow('shadow', 'unknown', config)).toEqual({});
  });
});

describe('shadow via dot() (integration)', () => {
  it('shadow-sm outputs boxShadow', () => {
    expect(dot('shadow-sm')).toEqual({
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('shadow-lg outputs boxShadow', () => {
    const result = dot('shadow-lg');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-xl outputs boxShadow', () => {
    const result = dot('shadow-xl');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-2xl outputs boxShadow', () => {
    const result = dot('shadow-2xl');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-none outputs boxShadow: none', () => {
    expect(dot('shadow-none')).toEqual({ boxShadow: 'none' });
  });
});

describe('shadow + ring composition', () => {
  it('shadow-lg + ring-2 combines into single boxShadow', () => {
    const result = dot('shadow-lg ring-2');
    expect(result).toHaveProperty('boxShadow');
    // Ring comes first, shadow second (Tailwind convention)
    expect(result.boxShadow).toContain('0 0 0 2px');
    expect((result.boxShadow as string).split(', ').length).toBeGreaterThanOrEqual(2);
  });

  it('ring-2 alone outputs boxShadow', () => {
    const result = dot('ring-2');
    expect(result).toEqual({ boxShadow: '0 0 0 2px var(--color-ring)' });
  });

  it('shadow-sm + ring-4 both present', () => {
    const result = dot('shadow-sm ring-4');
    const parts = (result.boxShadow as string);
    expect(parts).toContain('0 0 0 4px'); // ring
    expect(parts).toContain('0 1px 2px'); // shadow
  });

  it('ring overrides previous ring (same layer)', () => {
    const result = dot('ring-2 ring-4');
    // Last ring wins within ring layer
    expect(result.boxShadow).toBe('0 0 0 4px var(--color-ring)');
  });

  it('shadow overrides previous shadow (same layer)', () => {
    const result = dot('shadow-lg shadow-sm');
    // Last shadow wins within shadow layer
    expect(result.boxShadow).toBe('0 1px 2px 0 rgb(0 0 0 / 0.05)');
  });
});
