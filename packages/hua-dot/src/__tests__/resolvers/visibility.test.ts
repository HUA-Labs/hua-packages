import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('visible / invisible (visibility)', () => {
  it('resolves visible', () => {
    expect(dot('visible')).toEqual({ visibility: 'visible' });
  });

  it('resolves invisible', () => {
    expect(dot('invisible')).toEqual({ visibility: 'hidden' });
  });

  it('combines with other utilities', () => {
    expect(dot('invisible p-4')).toEqual({
      visibility: 'hidden',
      padding: '16px',
    });
  });
});

describe('sr-only / not-sr-only (accessibility)', () => {
  it('resolves sr-only', () => {
    const result = dot('sr-only');
    expect(result).toEqual({
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: '0',
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: '0',
    });
  });

  it('resolves not-sr-only', () => {
    const result = dot('not-sr-only');
    expect(result).toEqual({
      position: 'static',
      width: 'auto',
      height: 'auto',
      padding: '0',
      margin: '0',
      overflow: 'visible',
      clip: 'auto',
      whiteSpace: 'normal',
      borderWidth: '0',
    });
  });

  it('sr-only overrides position when combined', () => {
    const result = dot('relative sr-only');
    expect(result.position).toBe('absolute');
  });
});
