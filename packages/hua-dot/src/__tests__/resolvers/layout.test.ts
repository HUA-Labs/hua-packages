import { describe, it, expect } from 'vitest';
import { resolveLayout, resolveSizing } from '../../resolvers/layout';

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
    expect(resolveSizing('w', 'full')).toEqual({ width: '100%' });
    expect(resolveSizing('w', 'auto')).toEqual({ width: 'auto' });
    expect(resolveSizing('w', 'screen')).toEqual({ width: '100vw' });
    expect(resolveSizing('w', 'min')).toEqual({ width: 'min-content' });
    expect(resolveSizing('w', 'max')).toEqual({ width: 'max-content' });
    expect(resolveSizing('w', 'fit')).toEqual({ width: 'fit-content' });
  });

  it('resolves height keywords', () => {
    expect(resolveSizing('h', 'full')).toEqual({ height: '100%' });
    expect(resolveSizing('h', 'screen')).toEqual({ height: '100vh' });
  });

  it('resolves fractional widths', () => {
    expect(resolveSizing('w', '1/2')).toEqual({ width: '50%' });
    expect(resolveSizing('w', '1/3')).toEqual({ width: '33.333333%' });
    expect(resolveSizing('w', '2/3')).toEqual({ width: '66.666667%' });
    expect(resolveSizing('w', '1/4')).toEqual({ width: '25%' });
    expect(resolveSizing('w', '3/4')).toEqual({ width: '75%' });
  });

  it('resolves spacing-based sizing', () => {
    expect(resolveSizing('w', '4')).toEqual({ width: '16px' });
    expect(resolveSizing('h', '8')).toEqual({ height: '32px' });
    expect(resolveSizing('w', '12')).toEqual({ width: '48px' });
    expect(resolveSizing('h', '64')).toEqual({ height: '256px' });
  });

  it('resolves min/max sizing', () => {
    expect(resolveSizing('min-w', 'full')).toEqual({ minWidth: '100%' });
    expect(resolveSizing('min-h', 'screen')).toEqual({ minHeight: '100vh' });
    expect(resolveSizing('max-w', 'full')).toEqual({ maxWidth: '100%' });
    expect(resolveSizing('max-h', 'full')).toEqual({ maxHeight: '100%' });
  });

  it('resolves max-w specific keywords', () => {
    expect(resolveSizing('max-w', 'md')).toEqual({ maxWidth: '448px' });
    expect(resolveSizing('max-w', 'lg')).toEqual({ maxWidth: '512px' });
    expect(resolveSizing('max-w', 'prose')).toEqual({ maxWidth: '65ch' });
    expect(resolveSizing('max-w', 'screen-lg')).toEqual({ maxWidth: '1024px' });
    expect(resolveSizing('max-w', 'none')).toEqual({ maxWidth: 'none' });
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveSizing('x', '4')).toEqual({});
  });

  it('returns empty for unknown value', () => {
    expect(resolveSizing('w', 'unknown')).toEqual({});
  });
});
