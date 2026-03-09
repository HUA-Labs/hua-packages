import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('text-decoration-style', () => {
  it('resolves decoration-solid', () => {
    expect(dot('decoration-solid')).toEqual({ textDecorationStyle: 'solid' });
  });
  it('resolves decoration-double', () => {
    expect(dot('decoration-double')).toEqual({ textDecorationStyle: 'double' });
  });
  it('resolves decoration-dotted', () => {
    expect(dot('decoration-dotted')).toEqual({ textDecorationStyle: 'dotted' });
  });
  it('resolves decoration-dashed', () => {
    expect(dot('decoration-dashed')).toEqual({ textDecorationStyle: 'dashed' });
  });
  it('resolves decoration-wavy', () => {
    expect(dot('decoration-wavy')).toEqual({ textDecorationStyle: 'wavy' });
  });
});

describe('text-decoration-thickness', () => {
  it('resolves decoration-0', () => {
    expect(dot('decoration-0')).toEqual({ textDecorationThickness: '0px' });
  });
  it('resolves decoration-2', () => {
    expect(dot('decoration-2')).toEqual({ textDecorationThickness: '2px' });
  });
  it('resolves decoration-auto', () => {
    expect(dot('decoration-auto')).toEqual({ textDecorationThickness: 'auto' });
  });
  it('resolves decoration-from-font', () => {
    expect(dot('decoration-from-font')).toEqual({ textDecorationThickness: 'from-font' });
  });
});

describe('underline-offset', () => {
  it('resolves underline-offset-0', () => {
    expect(dot('underline-offset-0')).toEqual({ textUnderlineOffset: '0px' });
  });
  it('resolves underline-offset-2', () => {
    expect(dot('underline-offset-2')).toEqual({ textUnderlineOffset: '2px' });
  });
  it('resolves underline-offset-4', () => {
    expect(dot('underline-offset-4')).toEqual({ textUnderlineOffset: '4px' });
  });
  it('resolves underline-offset-auto', () => {
    expect(dot('underline-offset-auto')).toEqual({ textUnderlineOffset: 'auto' });
  });
});

describe('text-indent', () => {
  it('resolves indent-0', () => {
    expect(dot('indent-0')).toEqual({ textIndent: '0px' });
  });
  it('resolves indent-4', () => {
    expect(dot('indent-4')).toEqual({ textIndent: '16px' });
  });
  it('resolves indent-8', () => {
    expect(dot('indent-8')).toEqual({ textIndent: '32px' });
  });
  it('resolves indent-px', () => {
    expect(dot('indent-px')).toEqual({ textIndent: '1px' });
  });
});
