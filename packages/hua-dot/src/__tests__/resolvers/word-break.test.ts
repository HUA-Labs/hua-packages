import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('word-break', () => {
  it('resolves break-normal', () => {
    expect(dot('break-normal')).toEqual({ overflowWrap: 'normal', wordBreak: 'normal' });
  });
  it('resolves break-words', () => {
    expect(dot('break-words')).toEqual({ overflowWrap: 'break-word' });
  });
  it('resolves break-all', () => {
    expect(dot('break-all')).toEqual({ wordBreak: 'break-all' });
  });
  it('resolves break-keep', () => {
    expect(dot('break-keep')).toEqual({ wordBreak: 'keep-all' });
  });
});

describe('touch-action', () => {
  it('resolves touch-auto', () => {
    expect(dot('touch-auto')).toEqual({ touchAction: 'auto' });
  });
  it('resolves touch-none', () => {
    expect(dot('touch-none')).toEqual({ touchAction: 'none' });
  });
  it('resolves touch-pan-x', () => {
    expect(dot('touch-pan-x')).toEqual({ touchAction: 'pan-x' });
  });
  it('resolves touch-manipulation', () => {
    expect(dot('touch-manipulation')).toEqual({ touchAction: 'manipulation' });
  });
});

describe('will-change', () => {
  it('resolves will-change-auto', () => {
    expect(dot('will-change-auto')).toEqual({ willChange: 'auto' });
  });
  it('resolves will-change-scroll', () => {
    expect(dot('will-change-scroll')).toEqual({ willChange: 'scroll-position' });
  });
  it('resolves will-change-contents', () => {
    expect(dot('will-change-contents')).toEqual({ willChange: 'contents' });
  });
  it('resolves will-change-transform', () => {
    expect(dot('will-change-transform')).toEqual({ willChange: 'transform' });
  });
});

describe('float', () => {
  it('resolves float-left', () => {
    expect(dot('float-left')).toEqual({ float: 'left' });
  });
  it('resolves float-right', () => {
    expect(dot('float-right')).toEqual({ float: 'right' });
  });
  it('resolves float-none', () => {
    expect(dot('float-none')).toEqual({ float: 'none' });
  });
});

describe('clear', () => {
  it('resolves clear-left', () => {
    expect(dot('clear-left')).toEqual({ clear: 'left' });
  });
  it('resolves clear-both', () => {
    expect(dot('clear-both')).toEqual({ clear: 'both' });
  });
  it('resolves clear-none', () => {
    expect(dot('clear-none')).toEqual({ clear: 'none' });
  });
});

describe('isolation', () => {
  it('resolves isolate', () => {
    expect(dot('isolate')).toEqual({ isolation: 'isolate' });
  });
  it('resolves isolation-auto', () => {
    expect(dot('isolation-auto')).toEqual({ isolation: 'auto' });
  });
});
