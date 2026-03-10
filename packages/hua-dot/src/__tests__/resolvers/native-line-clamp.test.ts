import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { dot, createDotConfig } from '../../index';

describe('RN line-clamp → numberOfLines', () => {
  beforeEach(() => {
    createDotConfig({ runtime: 'native' });
  });

  afterEach(() => {
    createDotConfig({ runtime: 'web' });
  });

  it('converts line-clamp-3 to numberOfLines: 3', () => {
    const result = dot('line-clamp-3');
    expect(result).toHaveProperty('numberOfLines', 3);
  });

  it('converts line-clamp-1 to numberOfLines: 1', () => {
    const result = dot('line-clamp-1');
    expect(result).toHaveProperty('numberOfLines', 1);
  });

  it('drops WebkitBoxOrient and WebkitLineClamp', () => {
    const result = dot('line-clamp-2');
    expect(result).not.toHaveProperty('WebkitLineClamp');
    expect(result).not.toHaveProperty('WebkitBoxOrient');
  });

  it('drops -webkit-box display value', () => {
    const result = dot('line-clamp-2');
    expect(result).not.toHaveProperty('display');
  });

  it('keeps overflow: hidden', () => {
    const result = dot('line-clamp-2');
    expect(result).toHaveProperty('overflow', 'hidden');
  });

  it('works with per-call target override', () => {
    createDotConfig({ runtime: 'web' });
    const result = dot('line-clamp-3', { target: 'native' });
    expect(result).toHaveProperty('numberOfLines', 3);
    expect(result).not.toHaveProperty('WebkitLineClamp');
  });
});
