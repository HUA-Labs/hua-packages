import { describe, it, expect } from 'vitest';
import { resolveBackdrop } from '../../resolvers/backdrop';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveBackdrop', () => {
  it('resolves bare backdrop-blur (DEFAULT — 8px)', () => {
    expect(resolveBackdrop('backdrop-blur', '', config)).toEqual({
      backdropFilter: 'blur(8px)',
    });
  });

  it('resolves backdrop-blur-sm', () => {
    expect(resolveBackdrop('backdrop-blur', 'sm', config)).toEqual({
      backdropFilter: 'blur(4px)',
    });
  });

  it('resolves backdrop-blur-md', () => {
    expect(resolveBackdrop('backdrop-blur', 'md', config)).toEqual({
      backdropFilter: 'blur(12px)',
    });
  });

  it('resolves backdrop-blur-lg', () => {
    expect(resolveBackdrop('backdrop-blur', 'lg', config)).toEqual({
      backdropFilter: 'blur(16px)',
    });
  });

  it('resolves backdrop-blur-xl', () => {
    expect(resolveBackdrop('backdrop-blur', 'xl', config)).toEqual({
      backdropFilter: 'blur(24px)',
    });
  });

  it('resolves backdrop-blur-2xl', () => {
    expect(resolveBackdrop('backdrop-blur', '2xl', config)).toEqual({
      backdropFilter: 'blur(40px)',
    });
  });

  it('resolves backdrop-blur-3xl', () => {
    expect(resolveBackdrop('backdrop-blur', '3xl', config)).toEqual({
      backdropFilter: 'blur(64px)',
    });
  });

  it('resolves backdrop-blur-none', () => {
    expect(resolveBackdrop('backdrop-blur', 'none', config)).toEqual({
      backdropFilter: 'blur(0)',
    });
  });

  it('returns empty for unknown backdrop-blur value', () => {
    expect(resolveBackdrop('backdrop-blur', 'unknown', config)).toEqual({});
  });
});

// Integration tests via dot() for backdropFilter accumulation
import { dot } from '../../index';

describe('backdropFilter accumulation', () => {
  it('accumulates backdrop-blur + backdrop-brightness', () => {
    const result = dot('backdrop-blur-md backdrop-brightness-75');
    expect(result.backdropFilter).toBe('blur(12px) brightness(.75)');
  });

  it('accumulates three backdrop functions', () => {
    const result = dot('backdrop-blur-sm backdrop-brightness-125 backdrop-contrast-75');
    expect(result.backdropFilter).toBe('blur(4px) brightness(1.25) contrast(.75)');
  });

  it('accumulates backdrop-blur + backdrop-saturate', () => {
    const result = dot('backdrop-blur-lg backdrop-saturate-150');
    expect(result.backdropFilter).toBe('blur(16px) saturate(1.5)');
  });

  it('single backdrop utility still works', () => {
    expect(dot('backdrop-blur-md')).toEqual({ backdropFilter: 'blur(12px)' });
  });
});
