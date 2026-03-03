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
