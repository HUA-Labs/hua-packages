import { describe, it, expect } from 'vitest';
import { resolveBorder, resolveBorderStyle, resolveBorderRadius } from '../../resolvers/border';
import { resolveConfig } from '../../config';
const config = resolveConfig();

describe('resolveBorder', () => {
  it('resolves bare border (default 1px)', () => {
    expect(resolveBorder('border', '', config)).toEqual({ borderWidth: '1px' });
  });

  it('resolves border widths', () => {
    expect(resolveBorder('border', '0', config)).toEqual({ borderWidth: '0px' });
    expect(resolveBorder('border', '2', config)).toEqual({ borderWidth: '2px' });
    expect(resolveBorder('border', '4', config)).toEqual({ borderWidth: '4px' });
    expect(resolveBorder('border', '8', config)).toEqual({ borderWidth: '8px' });
  });

  it('resolves directional border widths', () => {
    expect(resolveBorder('border-t', '', config)).toEqual({ borderTopWidth: '1px' });
    expect(resolveBorder('border-t', '2', config)).toEqual({ borderTopWidth: '2px' });
    expect(resolveBorder('border-r', '4', config)).toEqual({ borderRightWidth: '4px' });
    expect(resolveBorder('border-b', '', config)).toEqual({ borderBottomWidth: '1px' });
    expect(resolveBorder('border-l', '2', config)).toEqual({ borderLeftWidth: '2px' });
  });

  it('resolves axis border widths', () => {
    expect(resolveBorder('border-x', '2', config)).toEqual({
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
    });
    expect(resolveBorder('border-y', '', config)).toEqual({
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });
  });

  it('resolves border color (fallthrough)', () => {
    expect(resolveBorder('border', 'red-500', config)).toEqual({ borderColor: '#ca2c22' });
    expect(resolveBorder('border', 'gray-300', config)).toEqual({ borderColor: '#a3a7ae' });
  });

  it('resolves arbitrary color as borderColor (not borderWidth)', () => {
    expect(resolveBorder('border', '[#dadce0]', config)).toEqual({ borderColor: '#dadce0' });
    expect(resolveBorder('border', '[#ff0000]', config)).toEqual({ borderColor: '#ff0000' });
    expect(resolveBorder('border', '[rgb(0,0,0)]', config)).toEqual({ borderColor: 'rgb(0,0,0)' });
  });

  it('resolves directional arbitrary color', () => {
    expect(resolveBorder('border-t', '[#ff0000]', config)).toEqual({ borderTopColor: '#ff0000' });
    expect(resolveBorder('border-r', '[#00ff00]', config)).toEqual({ borderRightColor: '#00ff00' });
    expect(resolveBorder('border-b', '[#0000ff]', config)).toEqual({ borderBottomColor: '#0000ff' });
    expect(resolveBorder('border-l', '[#fff]', config)).toEqual({ borderLeftColor: '#fff' });
    expect(resolveBorder('border-x', '[#aaa]', config)).toEqual({ borderLeftColor: '#aaa', borderRightColor: '#aaa' });
    expect(resolveBorder('border-y', '[#bbb]', config)).toEqual({ borderTopColor: '#bbb', borderBottomColor: '#bbb' });
  });

  it('resolves arbitrary width as borderWidth', () => {
    expect(resolveBorder('border', '[3px]', config)).toEqual({ borderWidth: '3px' });
    expect(resolveBorder('border-t', '[2px]', config)).toEqual({ borderTopWidth: '2px' });
    expect(resolveBorder('border-x', '[4px]', config)).toEqual({ borderLeftWidth: '4px', borderRightWidth: '4px' });
  });

  it('returns empty for unknown border value', () => {
    expect(resolveBorder('border', 'nonexistent', config)).toEqual({});
  });
});

describe('resolveBorderStyle', () => {
  it('resolves border styles', () => {
    expect(resolveBorderStyle('solid')).toEqual({ borderStyle: 'solid' });
    expect(resolveBorderStyle('dashed')).toEqual({ borderStyle: 'dashed' });
    expect(resolveBorderStyle('dotted')).toEqual({ borderStyle: 'dotted' });
    expect(resolveBorderStyle('double')).toEqual({ borderStyle: 'double' });
    expect(resolveBorderStyle('none')).toEqual({ borderStyle: 'none' });
  });

  it('returns empty for unknown style', () => {
    expect(resolveBorderStyle('unknown')).toEqual({});
  });
});

describe('resolveBorderRadius', () => {
  it('resolves bare rounded (default 4px)', () => {
    expect(resolveBorderRadius('rounded', '', config)).toEqual({ borderRadius: '4px' });
  });

  it('resolves border radius sizes', () => {
    expect(resolveBorderRadius('rounded', 'none', config)).toEqual({ borderRadius: '0px' });
    expect(resolveBorderRadius('rounded', 'sm', config)).toEqual({ borderRadius: '2px' });
    expect(resolveBorderRadius('rounded', 'md', config)).toEqual({ borderRadius: '6px' });
    expect(resolveBorderRadius('rounded', 'lg', config)).toEqual({ borderRadius: '8px' });
    expect(resolveBorderRadius('rounded', 'xl', config)).toEqual({ borderRadius: '12px' });
    expect(resolveBorderRadius('rounded', '2xl', config)).toEqual({ borderRadius: '16px' });
    expect(resolveBorderRadius('rounded', 'full', config)).toEqual({ borderRadius: '9999px' });
  });

  it('resolves directional border radius', () => {
    expect(resolveBorderRadius('rounded-t', 'lg', config)).toEqual({
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
    });
    expect(resolveBorderRadius('rounded-b', 'lg', config)).toEqual({
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
    });
    expect(resolveBorderRadius('rounded-l', 'md', config)).toEqual({
      borderTopLeftRadius: '6px',
      borderBottomLeftRadius: '6px',
    });
    expect(resolveBorderRadius('rounded-r', 'xl', config)).toEqual({
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
    });
  });

  it('resolves corner-specific border radius', () => {
    expect(resolveBorderRadius('rounded-tl', 'lg', config)).toEqual({ borderTopLeftRadius: '8px' });
    expect(resolveBorderRadius('rounded-tr', 'md', config)).toEqual({ borderTopRightRadius: '6px' });
    expect(resolveBorderRadius('rounded-bl', 'xl', config)).toEqual({ borderBottomLeftRadius: '12px' });
    expect(resolveBorderRadius('rounded-br', 'full', config)).toEqual({ borderBottomRightRadius: '9999px' });
  });

  it('returns empty for unknown radius value', () => {
    expect(resolveBorderRadius('rounded', 'nonexistent', config)).toEqual({});
  });
});
