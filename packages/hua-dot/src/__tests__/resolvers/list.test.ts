import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('list tokens', () => {
  it('resolves list-disc', () => {
    expect(dot('list-disc')).toEqual({ listStyleType: 'disc' });
  });
  it('resolves list-decimal', () => {
    expect(dot('list-decimal')).toEqual({ listStyleType: 'decimal' });
  });
  it('resolves list-none', () => {
    expect(dot('list-none')).toEqual({ listStyleType: 'none' });
  });
  it('resolves list-inside', () => {
    expect(dot('list-inside')).toEqual({ listStylePosition: 'inside' });
  });
  it('resolves list-outside', () => {
    expect(dot('list-outside')).toEqual({ listStylePosition: 'outside' });
  });
});
