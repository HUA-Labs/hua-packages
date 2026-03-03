import { describe, it, expect } from 'vitest';
import { resolveSpacing } from '../../resolvers/spacing';

describe('resolveSpacing', () => {
  it('resolves padding', () => {
    expect(resolveSpacing('p', '4')).toEqual({ padding: '16px' });
    expect(resolveSpacing('p', '0')).toEqual({ padding: '0px' });
    expect(resolveSpacing('p', 'px')).toEqual({ padding: '1px' });
  });

  it('resolves directional padding', () => {
    expect(resolveSpacing('px', '4')).toEqual({ paddingLeft: '16px', paddingRight: '16px' });
    expect(resolveSpacing('py', '2')).toEqual({ paddingTop: '8px', paddingBottom: '8px' });
    expect(resolveSpacing('pt', '8')).toEqual({ paddingTop: '32px' });
    expect(resolveSpacing('pr', '3')).toEqual({ paddingRight: '12px' });
    expect(resolveSpacing('pb', '6')).toEqual({ paddingBottom: '24px' });
    expect(resolveSpacing('pl', '1')).toEqual({ paddingLeft: '4px' });
  });

  it('resolves margin', () => {
    expect(resolveSpacing('m', '4')).toEqual({ margin: '16px' });
    expect(resolveSpacing('m', 'auto')).toEqual({ margin: 'auto' });
  });

  it('resolves directional margin', () => {
    expect(resolveSpacing('mx', 'auto')).toEqual({ marginLeft: 'auto', marginRight: 'auto' });
    expect(resolveSpacing('my', '2')).toEqual({ marginTop: '8px', marginBottom: '8px' });
    expect(resolveSpacing('mt', '4')).toEqual({ marginTop: '16px' });
  });

  it('resolves gap', () => {
    expect(resolveSpacing('gap', '4')).toEqual({ gap: '16px' });
    expect(resolveSpacing('gap-x', '2')).toEqual({ columnGap: '8px' });
    expect(resolveSpacing('gap-y', '3')).toEqual({ rowGap: '12px' });
  });

  it('resolves fractional spacing', () => {
    expect(resolveSpacing('p', '0.5')).toEqual({ padding: '2px' });
    expect(resolveSpacing('m', '1.5')).toEqual({ margin: '6px' });
  });

  it('returns empty for unknown values', () => {
    expect(resolveSpacing('p', 'unknown')).toEqual({});
    expect(resolveSpacing('p', '999')).toEqual({});
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveSpacing('x', '4')).toEqual({});
  });
});
