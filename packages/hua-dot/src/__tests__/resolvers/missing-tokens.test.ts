import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('previously missing tokens', () => {
  // transform standalone
  it('transform → identity transform', () => {
    expect(dot('transform')).toHaveProperty('transform');
  });

  // container
  it('container → width 100% + mx-auto', () => {
    const r = dot('container');
    expect(r.width).toBe('100%');
    expect(r.marginLeft).toBe('auto');
    expect(r.marginRight).toBe('auto');
  });

  // flex-shrink-0
  it('flex-shrink-0 → flexShrink 0', () => {
    expect(dot('flex-shrink-0')).toEqual({ flexShrink: '0' });
  });
  it('flex-grow-0 → flexGrow 0', () => {
    expect(dot('flex-grow-0')).toEqual({ flexGrow: '0' });
  });

  // directional border colors
  it('border-t-transparent', () => {
    expect(dot('border-t-transparent')).toEqual({ borderTopColor: 'transparent' });
  });
  it('border-t-cyan-500', () => {
    const r = dot('border-t-cyan-500');
    expect(r).toHaveProperty('borderTopColor');
  });
  it('border-b-red-500', () => {
    const r = dot('border-b-red-500');
    expect(r).toHaveProperty('borderBottomColor');
  });
  it('border-l-white', () => {
    expect(dot('border-l-white')).toEqual({ borderLeftColor: '#ffffff' });
  });
  it('border-x-primary', () => {
    const r = dot('border-x-primary');
    expect(r).toHaveProperty('borderLeftColor');
    expect(r).toHaveProperty('borderRightColor');
  });

  // arbitrary z-index
  it('z-[55] → zIndex 55', () => {
    expect(dot('z-[55]')).toEqual({ zIndex: '55' });
  });
  it('z-[9999] → zIndex 9999', () => {
    expect(dot('z-[9999]')).toEqual({ zIndex: '9999' });
  });

  // arbitrary positioning
  it('left-[5px] → left 5px', () => {
    expect(dot('left-[5px]')).toEqual({ left: '5px' });
  });
  it('top-[50%] → top 50%', () => {
    expect(dot('top-[50%]')).toEqual({ top: '50%' });
  });
});
