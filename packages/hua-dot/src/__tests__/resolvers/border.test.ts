import { describe, it, expect } from 'vitest';
import { resolveBorder, resolveBorderStyle, resolveBorderRadius } from '../../resolvers/border';

describe('resolveBorder', () => {
  it('resolves bare border (default 1px)', () => {
    expect(resolveBorder('border', '')).toEqual({ borderWidth: '1px' });
  });

  it('resolves border widths', () => {
    expect(resolveBorder('border', '0')).toEqual({ borderWidth: '0px' });
    expect(resolveBorder('border', '2')).toEqual({ borderWidth: '2px' });
    expect(resolveBorder('border', '4')).toEqual({ borderWidth: '4px' });
    expect(resolveBorder('border', '8')).toEqual({ borderWidth: '8px' });
  });

  it('resolves directional border widths', () => {
    expect(resolveBorder('border-t', '')).toEqual({ borderTopWidth: '1px' });
    expect(resolveBorder('border-t', '2')).toEqual({ borderTopWidth: '2px' });
    expect(resolveBorder('border-r', '4')).toEqual({ borderRightWidth: '4px' });
    expect(resolveBorder('border-b', '')).toEqual({ borderBottomWidth: '1px' });
    expect(resolveBorder('border-l', '2')).toEqual({ borderLeftWidth: '2px' });
  });

  it('resolves axis border widths', () => {
    expect(resolveBorder('border-x', '2')).toEqual({
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
    });
    expect(resolveBorder('border-y', '')).toEqual({
      borderTopWidth: '1px',
      borderBottomWidth: '1px',
    });
  });

  it('resolves border color (fallthrough)', () => {
    expect(resolveBorder('border', 'red-500')).toEqual({ borderColor: '#ef4444' });
    expect(resolveBorder('border', 'gray-300')).toEqual({ borderColor: '#d1d5db' });
  });

  it('returns empty for unknown border value', () => {
    expect(resolveBorder('border', 'nonexistent')).toEqual({});
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
    expect(resolveBorderRadius('rounded', '')).toEqual({ borderRadius: '4px' });
  });

  it('resolves border radius sizes', () => {
    expect(resolveBorderRadius('rounded', 'none')).toEqual({ borderRadius: '0px' });
    expect(resolveBorderRadius('rounded', 'sm')).toEqual({ borderRadius: '2px' });
    expect(resolveBorderRadius('rounded', 'md')).toEqual({ borderRadius: '6px' });
    expect(resolveBorderRadius('rounded', 'lg')).toEqual({ borderRadius: '8px' });
    expect(resolveBorderRadius('rounded', 'xl')).toEqual({ borderRadius: '12px' });
    expect(resolveBorderRadius('rounded', '2xl')).toEqual({ borderRadius: '16px' });
    expect(resolveBorderRadius('rounded', 'full')).toEqual({ borderRadius: '9999px' });
  });

  it('resolves directional border radius', () => {
    expect(resolveBorderRadius('rounded-t', 'lg')).toEqual({
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
    });
    expect(resolveBorderRadius('rounded-b', 'lg')).toEqual({
      borderBottomLeftRadius: '8px',
      borderBottomRightRadius: '8px',
    });
    expect(resolveBorderRadius('rounded-l', 'md')).toEqual({
      borderTopLeftRadius: '6px',
      borderBottomLeftRadius: '6px',
    });
    expect(resolveBorderRadius('rounded-r', 'xl')).toEqual({
      borderTopRightRadius: '12px',
      borderBottomRightRadius: '12px',
    });
  });

  it('resolves corner-specific border radius', () => {
    expect(resolveBorderRadius('rounded-tl', 'lg')).toEqual({ borderTopLeftRadius: '8px' });
    expect(resolveBorderRadius('rounded-tr', 'md')).toEqual({ borderTopRightRadius: '6px' });
    expect(resolveBorderRadius('rounded-bl', 'xl')).toEqual({ borderBottomLeftRadius: '12px' });
    expect(resolveBorderRadius('rounded-br', 'full')).toEqual({ borderBottomRightRadius: '9999px' });
  });

  it('returns empty for unknown radius value', () => {
    expect(resolveBorderRadius('rounded', 'nonexistent')).toEqual({});
  });
});
