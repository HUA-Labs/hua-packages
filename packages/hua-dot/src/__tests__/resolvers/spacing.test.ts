import { describe, it, expect } from 'vitest';
import { resolveSpacing } from '../../resolvers/spacing';
import { resolveConfig } from '../../config';
const config = resolveConfig();

describe('resolveSpacing', () => {
  it('resolves padding', () => {
    expect(resolveSpacing('p', '4', config)).toEqual({ padding: '16px' });
    expect(resolveSpacing('p', '0', config)).toEqual({ padding: '0px' });
    expect(resolveSpacing('p', 'px', config)).toEqual({ padding: '1px' });
  });

  it('resolves directional padding', () => {
    expect(resolveSpacing('px', '4', config)).toEqual({ paddingLeft: '16px', paddingRight: '16px' });
    expect(resolveSpacing('py', '2', config)).toEqual({ paddingTop: '8px', paddingBottom: '8px' });
    expect(resolveSpacing('pt', '8', config)).toEqual({ paddingTop: '32px' });
    expect(resolveSpacing('pr', '3', config)).toEqual({ paddingRight: '12px' });
    expect(resolveSpacing('pb', '6', config)).toEqual({ paddingBottom: '24px' });
    expect(resolveSpacing('pl', '1', config)).toEqual({ paddingLeft: '4px' });
  });

  it('resolves margin', () => {
    expect(resolveSpacing('m', '4', config)).toEqual({ margin: '16px' });
    expect(resolveSpacing('m', 'auto', config)).toEqual({ margin: 'auto' });
  });

  it('resolves directional margin', () => {
    expect(resolveSpacing('mx', 'auto', config)).toEqual({ marginLeft: 'auto', marginRight: 'auto' });
    expect(resolveSpacing('my', '2', config)).toEqual({ marginTop: '8px', marginBottom: '8px' });
    expect(resolveSpacing('mt', '4', config)).toEqual({ marginTop: '16px' });
  });

  it('resolves gap', () => {
    expect(resolveSpacing('gap', '4', config)).toEqual({ gap: '16px' });
    expect(resolveSpacing('gap-x', '2', config)).toEqual({ columnGap: '8px' });
    expect(resolveSpacing('gap-y', '3', config)).toEqual({ rowGap: '12px' });
  });

  it('resolves fractional spacing', () => {
    expect(resolveSpacing('p', '0.5', config)).toEqual({ padding: '2px' });
    expect(resolveSpacing('m', '1.5', config)).toEqual({ margin: '6px' });
  });

  it('returns empty for unknown values', () => {
    expect(resolveSpacing('p', 'unknown', config)).toEqual({});
    expect(resolveSpacing('p', '999', config)).toEqual({});
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveSpacing('x', '4', config)).toEqual({});
  });
});
