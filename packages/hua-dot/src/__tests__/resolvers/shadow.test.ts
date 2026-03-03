import { describe, it, expect } from 'vitest';
import { resolveShadow } from '../../resolvers/shadow';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveShadow', () => {
  it('resolves shadow-sm', () => {
    expect(resolveShadow('shadow', 'sm', config)).toEqual({
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('resolves bare shadow (DEFAULT key)', () => {
    expect(resolveShadow('shadow', '', config)).toEqual({
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });
  });

  it('resolves shadow-md', () => {
    const result = resolveShadow('shadow', 'md', config);
    expect(result).toHaveProperty('boxShadow');
  });

  it('resolves shadow-lg', () => {
    const result = resolveShadow('shadow', 'lg', config);
    expect(result).toHaveProperty('boxShadow');
  });

  it('resolves shadow-xl', () => {
    const result = resolveShadow('shadow', 'xl', config);
    expect(result).toHaveProperty('boxShadow');
  });

  it('resolves shadow-2xl', () => {
    const result = resolveShadow('shadow', '2xl', config);
    expect(result).toHaveProperty('boxShadow');
  });

  it('resolves shadow-inner (contains inset)', () => {
    const result = resolveShadow('shadow', 'inner', config);
    expect(result).toHaveProperty('boxShadow');
    expect(result.boxShadow).toContain('inset');
  });

  it('resolves shadow-none', () => {
    expect(resolveShadow('shadow', 'none', config)).toEqual({ boxShadow: 'none' });
  });

  it('returns empty for unknown shadow value', () => {
    expect(resolveShadow('shadow', 'unknown', config)).toEqual({});
  });
});
