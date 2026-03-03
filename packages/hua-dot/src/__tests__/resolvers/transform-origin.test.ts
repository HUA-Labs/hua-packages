import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('origin-* (transform-origin)', () => {
  it('resolves origin-center', () => {
    expect(dot('origin-center')).toEqual({ transformOrigin: 'center' });
  });

  it('resolves origin-top', () => {
    expect(dot('origin-top')).toEqual({ transformOrigin: 'top' });
  });

  it('resolves origin-top-right', () => {
    expect(dot('origin-top-right')).toEqual({ transformOrigin: 'top right' });
  });

  it('resolves origin-bottom-left', () => {
    expect(dot('origin-bottom-left')).toEqual({ transformOrigin: 'bottom left' });
  });

  it('resolves all 9 origin values', () => {
    const origins = [
      ['center', 'center'],
      ['top', 'top'],
      ['top-right', 'top right'],
      ['right', 'right'],
      ['bottom-right', 'bottom right'],
      ['bottom', 'bottom'],
      ['bottom-left', 'bottom left'],
      ['left', 'left'],
      ['top-left', 'top left'],
    ] as const;

    for (const [input, expected] of origins) {
      expect(dot(`origin-${input}`)).toEqual({ transformOrigin: expected });
    }
  });

  it('combines with transform tokens', () => {
    expect(dot('origin-top-left rotate-45')).toEqual({
      transformOrigin: 'top left',
      transform: 'rotate(45deg)',
    });
  });

  it('returns empty for unknown origin value', () => {
    expect(dot('origin-middle')).toEqual({});
  });
});
