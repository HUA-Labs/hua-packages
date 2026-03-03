import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('aspect-* (aspect-ratio)', () => {
  it('resolves aspect-auto', () => {
    expect(dot('aspect-auto')).toEqual({ aspectRatio: 'auto' });
  });

  it('resolves aspect-square', () => {
    expect(dot('aspect-square')).toEqual({ aspectRatio: '1 / 1' });
  });

  it('resolves aspect-video', () => {
    expect(dot('aspect-video')).toEqual({ aspectRatio: '16 / 9' });
  });

  it('resolves arbitrary aspect-[4/3]', () => {
    expect(dot('aspect-[4/3]')).toEqual({ aspectRatio: '4/3' });
  });

  it('resolves arbitrary aspect-[21/9]', () => {
    expect(dot('aspect-[21/9]')).toEqual({ aspectRatio: '21/9' });
  });

  it('combines with sizing', () => {
    expect(dot('w-full aspect-video')).toEqual({
      width: '100%',
      aspectRatio: '16 / 9',
    });
  });

  it('returns empty for unknown aspect value', () => {
    expect(dot('aspect-unknown')).toEqual({});
  });
});
