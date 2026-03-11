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
    expect(tokens[0]).toEqual({ variants: [], prefix: 'p', value: '4', raw: 'p-4', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'm', value: '2', raw: 'm-2', negative: false, important: false });
    expect(tokens[2]).toEqual({ variants: [], prefix: 'bg', value: 'blue-500', raw: 'bg-blue-500', negative: false, important: false });
  });

  it('parses multi-segment prefix tokens', () => {
    const tokens = parse('gap-x-4 min-w-full rounded-tl-lg border-t-2');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'gap-x', value: '4', raw: 'gap-x-4', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'min-w', value: 'full', raw: 'min-w-full', negative: false, important: false });
    expect(tokens[2]).toEqual({ variants: [], prefix: 'rounded-tl', value: 'lg', raw: 'rounded-tl-lg', negative: false, important: false });
    expect(tokens[3]).toEqual({ variants: [], prefix: 'border-t', value: '2', raw: 'border-t-2', negative: false, important: false });
  });

  it('parses standalone tokens', () => {
    const tokens = parse('flex hidden absolute items-center justify-between');
    expect(tokens).toHaveLength(5);
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex', raw: 'flex', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'hidden', raw: 'hidden', negative: false, important: false });
    expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'absolute', raw: 'absolute', negative: false, important: false });
    expect(tokens[3]).toEqual({ variants: [], prefix: '', value: 'items-center', raw: 'items-center', negative: false, important: false });
    expect(tokens[4]).toEqual({ variants: [], prefix: '', value: 'justify-between', raw: 'justify-between', negative: false, important: false });
  });

  it('parses bare prefix tokens (no value)', () => {
    const tokens = parse('border rounded');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'border', value: '', raw: 'border', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'rounded', value: '', raw: 'rounded', negative: false, important: false });
  });

  it('parses variant prefixes', () => {
    const tokens = parse('dark:bg-gray-900 md:flex hover:text-blue-500');
    expect(tokens[0]).toEqual({ variants: ['dark'], prefix: 'bg', value: 'gray-900', raw: 'dark:bg-gray-900', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: ['md'], prefix: '', value: 'flex', raw: 'md:flex', negative: false, important: false });
    expect(tokens[2]).toEqual({ variants: ['hover'], prefix: 'text', value: 'blue-500', raw: 'hover:text-blue-500', negative: false, important: false });
  });

  it('parses multiple variant prefixes', () => {
    const tokens = parse('dark:md:bg-gray-900');
    expect(tokens[0]).toEqual({
      variants: ['dark', 'md'],
      prefix: 'bg',
      value: 'gray-900',
      raw: 'dark:md:bg-gray-900',
      negative: false,
      important: false,
    });
  });

  it('handles extra whitespace', () => {
    const tokens = parse('  p-4   flex   bg-blue-500  ');
    expect(tokens).toHaveLength(3);
  });

  it('parses flexbox standalone tokens', () => {
    const tokens = parse('flex-col flex-wrap flex-nowrap');
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex-col', raw: 'flex-col', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'flex-wrap', raw: 'flex-wrap', negative: false, important: false });
    expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'flex-nowrap', raw: 'flex-nowrap', negative: false, important: false });
  });

  it('parses bare multi-segment prefix (border-t)', () => {
    const tokens = parse('border-t');
    expect(tokens[0]).toEqual({ variants: [], prefix: 'border-t', value: '', raw: 'border-t', negative: false, important: false });
  });

  it('distinguishes flex (standalone) from flex-1 (prefix)', () => {
    const tokens = parse('flex flex-1');
    expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'flex', raw: 'flex', negative: false, important: false });
    expect(tokens[1]).toEqual({ variants: [], prefix: 'flex', value: '1', raw: 'flex-1', negative: false, important: false });
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
      expect(tokens[0]).toEqual({ variants: [], prefix: 'banana', value: 'split', raw: 'banana-split', negative: false, important: false });
    });

    it('handles token that is just a hyphen', () => {
      const tokens = parse('-');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].prefix).toBe('');
      expect(tokens[0].value).toBe('');
      expect(tokens[0].negative).toBe(false);
    });

    it('handles double-hyphen token', () => {
      const tokens = parse('--custom');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].prefix).toBe('');
      expect(tokens[0].value).toBe('-custom');
      expect(tokens[0].negative).toBe(false);
    });

    it('handles grow and shrink standalone correctly', () => {
      const tokens = parse('grow grow-0 shrink shrink-0');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'grow', raw: 'grow', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'grow-0', raw: 'grow-0', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'shrink', raw: 'shrink', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: '', value: 'shrink-0', raw: 'shrink-0', negative: false, important: false });
    });

    it('handles self-* tokens as standalone', () => {
      const tokens = parse('self-center self-start self-end');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'self-center', raw: 'self-center', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'self-start', raw: 'self-start', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'self-end', raw: 'self-end', negative: false, important: false });
    });

    it('handles content-* tokens as standalone', () => {
      const tokens = parse('content-center content-between');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'content-center', raw: 'content-center', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'content-between', raw: 'content-between', negative: false, important: false });
    });

    it('handles variant on standalone token', () => {
      const tokens = parse('dark:hidden md:items-center');
      expect(tokens[0]).toEqual({ variants: ['dark'], prefix: '', value: 'hidden', raw: 'dark:hidden', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: ['md'], prefix: '', value: 'items-center', raw: 'md:items-center', negative: false, important: false });
    });

    it('handles variant on multi-segment prefix', () => {
      const tokens = parse('md:gap-x-4 dark:border-t-2');
      expect(tokens[0]).toEqual({ variants: ['md'], prefix: 'gap-x', value: '4', raw: 'md:gap-x-4', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: ['dark'], prefix: 'border-t', value: '2', raw: 'dark:border-t-2', negative: false, important: false });
    });

    it('preserves all raw strings', () => {
      const input = 'dark:hover:bg-blue-500 p-4 items-center';
      const tokens = parse(input);
      expect(tokens.map(t => t.raw)).toEqual(['dark:hover:bg-blue-500', 'p-4', 'items-center']);
    });

    it('handles overflow-* and truncate correctly', () => {
      const tokens = parse('overflow-hidden overflow-auto truncate');
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'overflow-hidden', raw: 'overflow-hidden', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'overflow-auto', raw: 'overflow-auto', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'truncate', raw: 'truncate', negative: false, important: false });
    });

    it('handles text transform standalone tokens', () => {
      const tokens = parse('uppercase lowercase capitalize normal-case');
      expect(tokens.every(t => t.prefix === '')).toBe(true);
    });

    it('handles transform multi-segment prefixes', () => {
      const tokens = parse('translate-x-4 translate-y-8 scale-x-110 scale-y-75 skew-x-6 skew-y-12');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'translate-x', value: '4', raw: 'translate-x-4', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'translate-y', value: '8', raw: 'translate-y-8', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'scale-x', value: '110', raw: 'scale-x-110', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: 'scale-y', value: '75', raw: 'scale-y-75', negative: false, important: false });
      expect(tokens[4]).toEqual({ variants: [], prefix: 'skew-x', value: '6', raw: 'skew-x-6', negative: false, important: false });
      expect(tokens[5]).toEqual({ variants: [], prefix: 'skew-y', value: '12', raw: 'skew-y-12', negative: false, important: false });
    });

    it('handles backdrop-blur prefix', () => {
      const tokens = parse('backdrop-blur backdrop-blur-md backdrop-blur-none');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'backdrop-blur', value: '', raw: 'backdrop-blur', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'backdrop-blur', value: 'md', raw: 'backdrop-blur-md', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'backdrop-blur', value: 'none', raw: 'backdrop-blur-none', negative: false, important: false });
    });

    it('handles Phase 2 prefix tokens', () => {
      const tokens = parse('shadow-lg opacity-50 rotate-45 duration-200 ease-in-out delay-100 animate-spin');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'shadow', value: 'lg', raw: 'shadow-lg', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'opacity', value: '50', raw: 'opacity-50', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'rotate', value: '45', raw: 'rotate-45', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: 'duration', value: '200', raw: 'duration-200', negative: false, important: false });
      expect(tokens[4]).toEqual({ variants: [], prefix: 'ease', value: 'in-out', raw: 'ease-in-out', negative: false, important: false });
      expect(tokens[5]).toEqual({ variants: [], prefix: 'delay', value: '100', raw: 'delay-100', negative: false, important: false });
      expect(tokens[6]).toEqual({ variants: [], prefix: 'animate', value: 'spin', raw: 'animate-spin', negative: false, important: false });
    });

    it('handles bare transition prefix', () => {
      const tokens = parse('transition transition-all transition-colors');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'transition', value: '', raw: 'transition', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'transition', value: 'all', raw: 'transition-all', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'transition', value: 'colors', raw: 'transition-colors', negative: false, important: false });
    });

    it('handles dark: with Phase 2 tokens', () => {
      const tokens = parse('dark:shadow-lg dark:opacity-50 dark:backdrop-blur-md');
      expect(tokens[0]).toEqual({ variants: ['dark'], prefix: 'shadow', value: 'lg', raw: 'dark:shadow-lg', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: ['dark'], prefix: 'opacity', value: '50', raw: 'dark:opacity-50', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: ['dark'], prefix: 'backdrop-blur', value: 'md', raw: 'dark:backdrop-blur-md', negative: false, important: false });
    });

    it('handles positioning prefixes', () => {
      const tokens = parse('top-4 right-0 bottom-auto left-1/2');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'top', value: '4', raw: 'top-4', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'right', value: '0', raw: 'right-0', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'bottom', value: 'auto', raw: 'bottom-auto', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: 'left', value: '1/2', raw: 'left-1/2', negative: false, important: false });
    });

    it('handles inset multi-segment prefixes', () => {
      const tokens = parse('inset-0 inset-x-4 inset-y-auto');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'inset', value: '0', raw: 'inset-0', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'inset-x', value: '4', raw: 'inset-x-4', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'inset-y', value: 'auto', raw: 'inset-y-auto', negative: false, important: false });
    });

    it('handles logical positioning prefixes', () => {
      const tokens = parse('start-4 end-0');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'start', value: '4', raw: 'start-4', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'end', value: '0', raw: 'end-0', negative: false, important: false });
    });

    it('handles grid multi-segment prefixes', () => {
      const tokens = parse('grid-cols-3 grid-rows-2 col-span-6 row-span-2');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'grid-cols', value: '3', raw: 'grid-cols-3', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'grid-rows', value: '2', raw: 'grid-rows-2', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'col-span', value: '6', raw: 'col-span-6', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: 'row-span', value: '2', raw: 'row-span-2', negative: false, important: false });
    });

    it('handles grid start/end prefixes', () => {
      const tokens = parse('col-start-1 col-end-4 row-start-2 row-end-5');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'col-start', value: '1', raw: 'col-start-1', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'col-end', value: '4', raw: 'col-end-4', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'row-start', value: '2', raw: 'row-start-2', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: 'row-end', value: '5', raw: 'row-end-5', negative: false, important: false });
    });

    it('handles auto-cols/auto-rows prefixes', () => {
      const tokens = parse('auto-cols-fr auto-rows-min');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'auto-cols', value: 'fr', raw: 'auto-cols-fr', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'auto-rows', value: 'min', raw: 'auto-rows-min', negative: false, important: false });
    });

    it('handles grid-flow standalone tokens', () => {
      const tokens = parse('grid-flow-row grid-flow-col grid-flow-dense grid-flow-row-dense grid-flow-col-dense');
      expect(tokens).toHaveLength(5);
      expect(tokens[0]).toEqual({ variants: [], prefix: '', value: 'grid-flow-row', raw: 'grid-flow-row', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: '', value: 'grid-flow-col', raw: 'grid-flow-col', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: '', value: 'grid-flow-dense', raw: 'grid-flow-dense', negative: false, important: false });
      expect(tokens[3]).toEqual({ variants: [], prefix: '', value: 'grid-flow-row-dense', raw: 'grid-flow-row-dense', negative: false, important: false });
      expect(tokens[4]).toEqual({ variants: [], prefix: '', value: 'grid-flow-col-dense', raw: 'grid-flow-col-dense', negative: false, important: false });
    });

    it('handles dark: with Phase 3a tokens', () => {
      const tokens = parse('dark:top-4 dark:grid-cols-2 dark:grid-flow-row');
      expect(tokens[0]).toEqual({ variants: ['dark'], prefix: 'top', value: '4', raw: 'dark:top-4', negative: false, important: false });
      expect(tokens[1]).toEqual({ variants: ['dark'], prefix: 'grid-cols', value: '2', raw: 'dark:grid-cols-2', negative: false, important: false });
      expect(tokens[2]).toEqual({ variants: ['dark'], prefix: '', value: 'grid-flow-row', raw: 'dark:grid-flow-row', negative: false, important: false });
    });

    it('parses negative prefix tokens', () => {
      const tokens = parse('-m-4 -top-2 -translate-x-4');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'm', value: '4', raw: '-m-4', negative: true, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'top', value: '2', raw: '-top-2', negative: true, important: false });
      expect(tokens[2]).toEqual({ variants: [], prefix: 'translate-x', value: '4', raw: '-translate-x-4', negative: true, important: false });
    });

    it('parses negative with multi-segment prefix', () => {
      const tokens = parse('-inset-x-4 -inset-y-2');
      expect(tokens[0]).toEqual({ variants: [], prefix: 'inset-x', value: '4', raw: '-inset-x-4', negative: true, important: false });
      expect(tokens[1]).toEqual({ variants: [], prefix: 'inset-y', value: '2', raw: '-inset-y-2', negative: true, important: false });
    });

    it('parses negative with variant', () => {
      const tokens = parse('dark:-m-4');
      expect(tokens[0]).toEqual({ variants: ['dark'], prefix: 'm', value: '4', raw: 'dark:-m-4', negative: true, important: false });
    });

    it('does not treat -- or - alone as negative', () => {
      const tokens = parse('- --custom');
      expect(tokens[0].negative).toBe(false);
      expect(tokens[1].negative).toBe(false);
    });

    it('non-negative tokens have negative: false', () => {
      const tokens = parse('p-4 flex bg-primary-500');
      expect(tokens.every(t => t.negative === false)).toBe(true);
    });

    it('parses group as standalone token', () => {
      const tokens = parse('group');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        variants: [],
        prefix: '',
        value: 'group',
        raw: 'group',
        negative: false,
        important: false,
      });
    });

    it('parses peer as standalone token', () => {
      const tokens = parse('peer');
      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        variants: [],
        prefix: '',
        value: 'peer',
        raw: 'peer',
        negative: false,
        important: false,
      });
    });

    it('parses group alongside other tokens', () => {
      const tokens = parse('group p-4 hover:bg-red-500');
      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({
        variants: [],
        prefix: '',
        value: 'group',
        raw: 'group',
        negative: false,
        important: false,
      });
      expect(tokens[1].prefix).toBe('p');
      expect(tokens[2].variants).toEqual(['hover']);
    });
  });
});
