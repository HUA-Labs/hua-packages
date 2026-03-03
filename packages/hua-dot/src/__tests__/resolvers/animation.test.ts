import { describe, it, expect } from 'vitest';
import { resolveAnimation } from '../../resolvers/animation';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveAnimation', () => {
  it('resolves animate-spin (animation contains spin)', () => {
    const result = resolveAnimation('animate', 'spin', config);
    expect(result).toHaveProperty('animation');
    expect(result.animation).toContain('spin');
  });

  it('resolves animate-ping (animation contains ping)', () => {
    const result = resolveAnimation('animate', 'ping', config);
    expect(result).toHaveProperty('animation');
    expect(result.animation).toContain('ping');
  });

  it('resolves animate-pulse (animation contains pulse)', () => {
    const result = resolveAnimation('animate', 'pulse', config);
    expect(result).toHaveProperty('animation');
    expect(result.animation).toContain('pulse');
  });

  it('resolves animate-bounce (animation contains bounce)', () => {
    const result = resolveAnimation('animate', 'bounce', config);
    expect(result).toHaveProperty('animation');
    expect(result.animation).toContain('bounce');
  });

  it('resolves animate-none', () => {
    expect(resolveAnimation('animate', 'none', config)).toEqual({ animation: 'none' });
  });

  it('returns empty for unknown animation value', () => {
    expect(resolveAnimation('animate', 'unknown', config)).toEqual({});
  });
});
