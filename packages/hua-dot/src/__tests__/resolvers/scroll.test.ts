import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('scroll tokens', () => {
  it('resolves scroll-auto', () => {
    expect(dot('scroll-auto')).toEqual({ scrollBehavior: 'auto' });
  });
  it('resolves scroll-smooth', () => {
    expect(dot('scroll-smooth')).toEqual({ scrollBehavior: 'smooth' });
  });
  it('resolves scroll-m-4', () => {
    expect(dot('scroll-m-4')).toEqual({
      scrollMarginTop: '16px',
      scrollMarginRight: '16px',
      scrollMarginBottom: '16px',
      scrollMarginLeft: '16px',
    });
  });
  it('resolves scroll-mx-2', () => {
    expect(dot('scroll-mx-2')).toEqual({
      scrollMarginLeft: '8px',
      scrollMarginRight: '8px',
    });
  });
  it('resolves scroll-mt-8', () => {
    expect(dot('scroll-mt-8')).toEqual({ scrollMarginTop: '32px' });
  });
  it('resolves scroll-p-4', () => {
    expect(dot('scroll-p-4')).toEqual({
      scrollPaddingTop: '16px',
      scrollPaddingRight: '16px',
      scrollPaddingBottom: '16px',
      scrollPaddingLeft: '16px',
    });
  });
  it('resolves scroll-py-6', () => {
    expect(dot('scroll-py-6')).toEqual({
      scrollPaddingTop: '24px',
      scrollPaddingBottom: '24px',
    });
  });
  it('resolves scroll-pl-0', () => {
    expect(dot('scroll-pl-0')).toEqual({ scrollPaddingLeft: '0px' });
  });
});
