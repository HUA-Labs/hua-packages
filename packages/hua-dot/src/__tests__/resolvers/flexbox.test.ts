import { describe, it, expect } from 'vitest';
import { resolveFlexboxStandalone, resolveFlexbox } from '../../resolvers/flexbox';

describe('resolveFlexboxStandalone', () => {
  it('resolves flex direction', () => {
    expect(resolveFlexboxStandalone('flex-row')).toEqual({ flexDirection: 'row' });
    expect(resolveFlexboxStandalone('flex-col')).toEqual({ flexDirection: 'column' });
    expect(resolveFlexboxStandalone('flex-row-reverse')).toEqual({ flexDirection: 'row-reverse' });
    expect(resolveFlexboxStandalone('flex-col-reverse')).toEqual({ flexDirection: 'column-reverse' });
  });

  it('resolves flex wrap', () => {
    expect(resolveFlexboxStandalone('flex-wrap')).toEqual({ flexWrap: 'wrap' });
    expect(resolveFlexboxStandalone('flex-nowrap')).toEqual({ flexWrap: 'nowrap' });
    expect(resolveFlexboxStandalone('flex-wrap-reverse')).toEqual({ flexWrap: 'wrap-reverse' });
  });

  it('resolves align items', () => {
    expect(resolveFlexboxStandalone('items-center')).toEqual({ alignItems: 'center' });
    expect(resolveFlexboxStandalone('items-start')).toEqual({ alignItems: 'flex-start' });
    expect(resolveFlexboxStandalone('items-end')).toEqual({ alignItems: 'flex-end' });
    expect(resolveFlexboxStandalone('items-baseline')).toEqual({ alignItems: 'baseline' });
    expect(resolveFlexboxStandalone('items-stretch')).toEqual({ alignItems: 'stretch' });
  });

  it('resolves align self', () => {
    expect(resolveFlexboxStandalone('self-auto')).toEqual({ alignSelf: 'auto' });
    expect(resolveFlexboxStandalone('self-center')).toEqual({ alignSelf: 'center' });
    expect(resolveFlexboxStandalone('self-start')).toEqual({ alignSelf: 'flex-start' });
    expect(resolveFlexboxStandalone('self-end')).toEqual({ alignSelf: 'flex-end' });
  });

  it('resolves justify content', () => {
    expect(resolveFlexboxStandalone('justify-center')).toEqual({ justifyContent: 'center' });
    expect(resolveFlexboxStandalone('justify-between')).toEqual({ justifyContent: 'space-between' });
    expect(resolveFlexboxStandalone('justify-around')).toEqual({ justifyContent: 'space-around' });
    expect(resolveFlexboxStandalone('justify-evenly')).toEqual({ justifyContent: 'space-evenly' });
    expect(resolveFlexboxStandalone('justify-start')).toEqual({ justifyContent: 'flex-start' });
    expect(resolveFlexboxStandalone('justify-end')).toEqual({ justifyContent: 'flex-end' });
  });

  it('resolves align content', () => {
    expect(resolveFlexboxStandalone('content-center')).toEqual({ alignContent: 'center' });
    expect(resolveFlexboxStandalone('content-between')).toEqual({ alignContent: 'space-between' });
  });

  it('resolves flex grow/shrink', () => {
    expect(resolveFlexboxStandalone('grow')).toEqual({ flexGrow: '1' });
    expect(resolveFlexboxStandalone('grow-0')).toEqual({ flexGrow: '0' });
    expect(resolveFlexboxStandalone('shrink')).toEqual({ flexShrink: '1' });
    expect(resolveFlexboxStandalone('shrink-0')).toEqual({ flexShrink: '0' });
  });

  it('returns empty for unknown standalone', () => {
    expect(resolveFlexboxStandalone('unknown')).toEqual({});
  });
});

describe('resolveFlexbox', () => {
  it('resolves flex values', () => {
    expect(resolveFlexbox('flex', '1')).toEqual({ flex: '1 1 0%' });
    expect(resolveFlexbox('flex', 'auto')).toEqual({ flex: '1 1 auto' });
    expect(resolveFlexbox('flex', 'initial')).toEqual({ flex: '0 1 auto' });
    expect(resolveFlexbox('flex', 'none')).toEqual({ flex: 'none' });
  });

  it('resolves order values', () => {
    expect(resolveFlexbox('order', '1')).toEqual({ order: '1' });
    expect(resolveFlexbox('order', '12')).toEqual({ order: '12' });
    expect(resolveFlexbox('order', 'first')).toEqual({ order: '-9999' });
    expect(resolveFlexbox('order', 'last')).toEqual({ order: '9999' });
    expect(resolveFlexbox('order', 'none')).toEqual({ order: '0' });
  });

  it('returns empty for unknown flex value', () => {
    expect(resolveFlexbox('flex', 'unknown')).toEqual({});
  });

  it('returns empty for unknown prefix', () => {
    expect(resolveFlexbox('x', '1')).toEqual({});
  });
});
