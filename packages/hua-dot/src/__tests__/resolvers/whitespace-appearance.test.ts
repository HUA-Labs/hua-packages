import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig } from '../../index';

describe('whitespace tokens', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves whitespace-nowrap', () => {
    expect(dot('whitespace-nowrap')).toEqual({ whiteSpace: 'nowrap' });
  });

  it('resolves whitespace-normal', () => {
    expect(dot('whitespace-normal')).toEqual({ whiteSpace: 'normal' });
  });

  it('resolves whitespace-pre', () => {
    expect(dot('whitespace-pre')).toEqual({ whiteSpace: 'pre' });
  });

  it('resolves whitespace-pre-line', () => {
    expect(dot('whitespace-pre-line')).toEqual({ whiteSpace: 'pre-line' });
  });

  it('resolves whitespace-pre-wrap', () => {
    expect(dot('whitespace-pre-wrap')).toEqual({ whiteSpace: 'pre-wrap' });
  });

  it('resolves whitespace-break-spaces', () => {
    expect(dot('whitespace-break-spaces')).toEqual({ whiteSpace: 'break-spaces' });
  });

  it('combines with other tokens', () => {
    const result = dot('whitespace-nowrap truncate');
    expect(result).toHaveProperty('whiteSpace', 'nowrap');
    expect(result).toHaveProperty('overflow', 'hidden');
    expect(result).toHaveProperty('textOverflow', 'ellipsis');
  });
});

describe('appearance tokens', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('resolves appearance-none', () => {
    expect(dot('appearance-none')).toEqual({ appearance: 'none' });
  });

  it('resolves appearance-auto', () => {
    expect(dot('appearance-auto')).toEqual({ appearance: 'auto' });
  });

  it('combines with other form tokens', () => {
    const result = dot('appearance-none border rounded-md px-3 py-2');
    expect(result).toHaveProperty('appearance', 'none');
    expect(result).toHaveProperty('borderWidth');
    expect(result).toHaveProperty('borderRadius');
    expect(result).toHaveProperty('paddingLeft');
  });
});
