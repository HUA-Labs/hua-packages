import { describe, it, expect } from 'vitest';
import { resolveLayout, resolveSizing } from '../../resolvers/layout';
import { resolveConfig } from '../../config';
const config = resolveConfig();

describe('resolveLayout', () => {
  it('resolves display values', () => {
    expect(resolveLayout('flex')).toEqual({ display: 'flex' });
    expect(resolveLayout('grid')).toEqual({ display: 'grid' });
    expect(resolveLayout('block')).toEqual({ display: 'block' });
    expect(resolveLayout('hidden')).toEqual({ display: 'none' });
    expect(resolveLayout('inline-flex')).toEqual({ display: 'inline-flex' });
  });

  it('resolves position values', () => {
    expect(resolveLayout('absolute')).toEqual({ position: 'absolute' });
    expect(resolveLayout('relative')).toEqual({ position: 'relative' });
    expect(resolveLayout('fixed')).toEqual({ position: 'fixed' });
    expect(resolveLayout('sticky')).toEqual({ position: 'sticky' });
  });

  it('resolves text transform', () => {
    expect(resolveLayout('uppercase')).toEqual({ textTransform: 'uppercase' });
    expect(resolveLayout('lowercase')).toEqual({ textTransform: 'lowercase' });
    expect(resolveLayout('capitalize')).toEqual({ textTransform: 'capitalize' });
    expect(resolveLayout('normal-case')).toEqual({ textTransform: 'none' });
  });

  it('resolves overflow', () => {
    expect(resolveLayout('overflow-hidden')).toEqual({ overflow: 'hidden' });
    expect(resolveLayout('overflow-auto')).toEqual({ overflow: 'auto' });
  });

  it('resolves truncate', () => {
    expect(resolveLayout('truncate')).toEqual({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    });
  });

  it('returns empty for unknown standalone', () => {
    expect(resolveLayout('unknown')).toEqual({});
  });
});

describe('resolveSizing', () => {
  it('resolves width keywords', () => {
    expect(resolveSizing('w', 'full', config)).toEqual({ width: '100%' });
    expect(resolveSizing('w', 'auto', config)).toEqual({ width: 'auto' });
    expect(resolveSizing('w', 'screen', config)).toEqual({ width: '100vw' });
    expect(resolveSizing('w', 'min', config)).toEqual({ width: 'min-content' });
    expect(resolveSizing('w', 'max', config)).toEqual({ width: 'max-content' });
    expect(resolveSizing('w', 'fit', config)).toEqual({ width: 'fit-content' });
  });

  it('resolves height keywords', () => {
    expect(resolveSizing('h', 'full', config)).toEqual({ height: '100%' });
    expect(resolveSizing('h', 'screen', config)).toEqual({ height: '100vh' });
  });

  it('resolves fractional widths', () => {
    expect(resolveSizing('w', '1/2', config)).toEqual({ width: '50%' });
    expect(resolveSizing('w', '1/3', config)).toEqual({ width: '33.333333%' });
    expect(resolveSizing('w', '2/3', config)).toEqual({ width: '66.666667%' });
    expect(resolveSizing('w', '1/4', config)).toEqual({ width: '25%' });
    expect(resolveSizing('w', '3/4', config)).toEqual({ width: '75%' });
  });

  it('resolves spacing-based sizing', () => {
    expect(resolveSizing('w', '4', config)).toEqual({ width: '16px' });
    expect(resolveSizing('h', '8', config)).toEqual({ height: '32px' });
    expect(resolveSizing('w', '12', config)).toEqual({ width: '48px' });
    expect(resolveSizing('h', '64', config)).toEqual({ height: '256px' });
  });

  it('resolves min/max sizing', () => {
    expect(resolveSizing('min-w', 'full', config)).toEqual({ minWidth: '100%' });
    expect(resolveSizing('min-h', 'screen', config)).toEqual({ minHeight: '100vh' });
    expect(resolveSizing('max-w', 'full', config)).toEqual({ maxWidth: '100%' });
    expect(resolveSizing('max-h', 'full', config)).toEqual({ maxHeight: '100%' });
  });

  it('resolves max-w specific keywords', () => {
    expect(resolveSizing('max-w', 'md', config)).toEqual({ maxWidth: '448px' });
    expect(resolveSizing('max-w', 'lg', config)).toEqual({ maxWidth: '512px' });
    expect(resolveSizing('max-w', 'prose', config)).toEqual({ maxWidth: '65ch' });
    expect(resolveSizing('max-w', 'screen-lg', config)).toEqual({ maxWidth: '1024px' });
    expect(resolveSizing('max-w', 'none', config)).toEqual({ maxWidth: 'none' });
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveSizing('x', '4', config)).toEqual({});
  });

  it('returns empty for unknown value', () => {
    expect(resolveSizing('w', 'unknown', config)).toEqual({});
  });
});
