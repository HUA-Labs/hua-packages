import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('table tokens', () => {
  it('resolves table-auto', () => {
    expect(dot('table-auto')).toEqual({ tableLayout: 'auto' });
  });
  it('resolves table-fixed', () => {
    expect(dot('table-fixed')).toEqual({ tableLayout: 'fixed' });
  });
  it('resolves border-collapse', () => {
    expect(dot('border-collapse')).toEqual({ borderCollapse: 'collapse' });
  });
  it('resolves border-separate', () => {
    expect(dot('border-separate')).toEqual({ borderCollapse: 'separate' });
  });
  it('resolves caption-top', () => {
    expect(dot('caption-top')).toEqual({ captionSide: 'top' });
  });
  it('resolves caption-bottom', () => {
    expect(dot('caption-bottom')).toEqual({ captionSide: 'bottom' });
  });
});
