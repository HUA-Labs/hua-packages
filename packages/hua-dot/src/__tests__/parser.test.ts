import { describe, it, expect } from 'vitest';
import { parse } from '../parser';

describe('parser', () => {
  it('parses empty input', () => {
    expect(parse('')).toEqual([]);
    expect(parse('   ')).toEqual([]);
  });

  it('parses single-segment prefix tokens', () => {
    const tokens = parse('p-4 m-2 bg-blue-500');
    expect(tokens).toHaveLength(3);
    expect(tokens[0]).toEqual({ variants: [], prefix: 'p', value: '4', raw: 'p-4' });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'm', value: '2', raw: 'm-2' });
    expect(tokens[2]).toEqual({ variants: [], prefix: 'bg', value: 'blue-500', raw: 'bg-blue-500' });
  });

  it('parses multi-segment prefix tokens', () => {
    const tokens = parse('gap-x-4 min-w-full rounded-tl-lg border-t-2');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'gap-x', value: '4', raw: 'gap-x-4' });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'min-w', value: 'full', raw: 'min-w-full' });
    expect(tokens[2]).toEqual({ variants: [], prefix: 'rounded-tl', value: 'lg', raw: 'rounded-tl-lg' });
    expect(tokens[3]).toEqual({ variants: [], prefix: 'border-t', value: '2', raw: 'border-t-2' });
  });

  it('parses standalone tokens', () => {
    const tokens = parse('flex hidden absolute items-center justify-between');
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex', raw: 'flex' });
    expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'hidden', raw: 'hidden' });
    expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'absolute', raw: 'absolute' });
    expect(tokens[3]).toEqual({ variants: [], prefix: '', value: 'items-center', raw: 'items-center' });
    expect(tokens[4]).toEqual({ variants: [], prefix: '', value: 'justify-between', raw: 'justify-between' });
  });

  it('parses bare prefix tokens (no value)', () => {
    const tokens = parse('border rounded');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'border', value: '', raw: 'border' });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'rounded', value: '', raw: 'rounded' });
  });

  it('parses variant prefixes', () => {
    const tokens = parse('dark:bg-gray-900 md:flex hover:text-blue-500');
    expect(tokens[0]).toEqual({ variants: ['dark'], prefix: 'bg', value: 'gray-900', raw: 'dark:bg-gray-900' });
    expect(tokens[1]).toEqual({ variants: ['md'], prefix: '', value: 'flex', raw: 'md:flex' });
    expect(tokens[2]).toEqual({ variants: ['hover'], prefix: 'text', value: 'blue-500', raw: 'hover:text-blue-500' });
  });

  it('parses multiple variant prefixes', () => {
    const tokens = parse('dark:md:bg-gray-900');
    expect(tokens[0]).toEqual({
      variants: ['dark', 'md'],
      prefix: 'bg',
      value: 'gray-900',
      raw: 'dark:md:bg-gray-900',
    });
  });

  it('handles extra whitespace', () => {
    const tokens = parse('  p-4   flex   bg-blue-500  ');
    expect(tokens).toHaveLength(3);
  });

  it('parses flexbox standalone tokens', () => {
    const tokens = parse('flex-col flex-wrap flex-nowrap');
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex-col', raw: 'flex-col' });
    expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'flex-wrap', raw: 'flex-wrap' });
    expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'flex-nowrap', raw: 'flex-nowrap' });
  });

  it('parses bare multi-segment prefix (border-t)', () => {
    const tokens = parse('border-t');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'border-t', value: '', raw: 'border-t' });
  });

  it('distinguishes flex (standalone) from flex-1 (prefix)', () => {
    const tokens = parse('flex flex-1');
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex', raw: 'flex' });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'flex', value: '1', raw: 'flex-1' });
  });

  describe('edge cases', () => {
    it('handles single token', () => {
      const tokens = parse('flex');
      expect(tokens).toHaveLength(1);
    });

    it('handles tabs and newlines as whitespace', () => {
      const tokens = parse("p-4\tflex\nbg-white");
      expect(tokens).toHaveLength(3);
    });

    it('handles unknown tokens (parsed but won\'t resolve)', () => {
      const tokens = parse('banana-split');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({ variants: [], prefix: 'banana', value: 'split', raw: 'banana-split' });
    });

    it('handles token that is just a hyphen', () => {
      const tokens = parse('-');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].prefix).toBe('');
      expect(tokens[0].value).toBe('');
    });

    it('handles double-hyphen token', () => {
      const tokens = parse('--custom');
      expect(tokens).toHaveLength(1);
      // First hyphen → empty prefix, rest → value
      expect(tokens[0].prefix).toBe('');
      expect(tokens[0].value).toBe('-custom');
    });

    it('handles grow and shrink standalone correctly', () => {
      const tokens = parse('grow grow-0 shrink shrink-0');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'grow', raw: 'grow' });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'grow-0', raw: 'grow-0' });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'shrink', raw: 'shrink' });
      expect(tokens[3]).toEqual({ variants: [], prefix: '', value: 'shrink-0', raw: 'shrink-0' });
    });

    it('handles self-* tokens as standalone', () => {
      const tokens = parse('self-center self-start self-end');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'self-center', raw: 'self-center' });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'self-start', raw: 'self-start' });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'self-end', raw: 'self-end' });
    });

    it('handles content-* tokens as standalone', () => {
      const tokens = parse('content-center content-between');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'content-center', raw: 'content-center' });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'content-between', raw: 'content-between' });
    });

    it('handles variant on standalone token', () => {
      const tokens = parse('dark:hidden md:items-center');
      expect(tokens[0]).toEqual({ variants: ['dark'], prefix: '', value: 'hidden', raw: 'dark:hidden' });
      expect(tokens[1]).toEqual({ variants: ['md'], prefix: '', value: 'items-center', raw: 'md:items-center' });
    });

    it('handles variant on multi-segment prefix', () => {
      const tokens = parse('md:gap-x-4 dark:border-t-2');
      expect(tokens[0]).toEqual({ variants: ['md'], prefix: 'gap-x', value: '4', raw: 'md:gap-x-4' });
      expect(tokens[1]).toEqual({ variants: ['dark'], prefix: 'border-t', value: '2', raw: 'dark:border-t-2' });
    });

    it('preserves all raw strings', () => {
      const input = 'dark:hover:bg-blue-500 p-4 items-center';
      const tokens = parse(input);
      expect(tokens.map(t => t.raw)).toEqual(['dark:hover:bg-blue-500', 'p-4', 'items-center']);
    });

    it('handles overflow-* and truncate correctly', () => {
      const tokens = parse('overflow-hidden overflow-auto truncate');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'overflow-hidden', raw: 'overflow-hidden' });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'overflow-auto', raw: 'overflow-auto' });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'truncate', raw: 'truncate' });
    });

    it('handles text transform standalone tokens', () => {
      const tokens = parse('uppercase lowercase capitalize normal-case');
      expect(tokens.every(t => t.prefix === '')).toBe(true);
    });
  });
});
