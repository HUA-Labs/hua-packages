import { describe, it, expect } from 'vitest';
import { resolveGrid } from '../../resolvers/grid';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('resolveGrid', () => {
  describe('grid-cols', () => {
    it('resolves common column counts', () => {
      expect(resolveGrid('grid-cols', '1', config)).toEqual({
        gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
      });
      expect(resolveGrid('grid-cols', '3', config)).toEqual({
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      });
      expect(resolveGrid('grid-cols', '12', config)).toEqual({
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      });
    });

    it('resolves none and subgrid', () => {
      expect(resolveGrid('grid-cols', 'none', config)).toEqual({
        gridTemplateColumns: 'none',
      });
      expect(resolveGrid('grid-cols', 'subgrid', config)).toEqual({
        gridTemplateColumns: 'subgrid',
      });
    });

    it('returns empty for unknown value', () => {
      expect(resolveGrid('grid-cols', '0', config)).toEqual({});
      expect(resolveGrid('grid-cols', '13', config)).toEqual({});
      expect(resolveGrid('grid-cols', 'banana', config)).toEqual({});
    });

    it('respects custom gridCols from config', () => {
      const custom = resolveConfig({ theme: { gridCols: { '16': 'repeat(16, minmax(0, 1fr))' } } });
      expect(resolveGrid('grid-cols', '16', custom)).toEqual({
        gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
      });
      // defaults preserved
      expect(resolveGrid('grid-cols', '3', custom)).toEqual({
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      });
    });
  });

  describe('grid-rows', () => {
    it('resolves common row counts', () => {
      expect(resolveGrid('grid-rows', '1', config)).toEqual({
        gridTemplateRows: 'repeat(1, minmax(0, 1fr))',
      });
      expect(resolveGrid('grid-rows', '3', config)).toEqual({
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
      });
      expect(resolveGrid('grid-rows', '6', config)).toEqual({
        gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
      });
    });

    it('resolves none and subgrid', () => {
      expect(resolveGrid('grid-rows', 'none', config)).toEqual({
        gridTemplateRows: 'none',
      });
      expect(resolveGrid('grid-rows', 'subgrid', config)).toEqual({
        gridTemplateRows: 'subgrid',
      });
    });

    it('returns empty for unknown value', () => {
      expect(resolveGrid('grid-rows', '7', config)).toEqual({});
      expect(resolveGrid('grid-rows', '0', config)).toEqual({});
    });

    it('respects custom gridRows from config', () => {
      const custom = resolveConfig({ theme: { gridRows: { '10': 'repeat(10, minmax(0, 1fr))' } } });
      expect(resolveGrid('grid-rows', '10', custom)).toEqual({
        gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
      });
    });
  });

  describe('col-span', () => {
    it('resolves column spans', () => {
      expect(resolveGrid('col-span', '1', config)).toEqual({ gridColumn: 'span 1 / span 1' });
      expect(resolveGrid('col-span', '2', config)).toEqual({ gridColumn: 'span 2 / span 2' });
      expect(resolveGrid('col-span', '6', config)).toEqual({ gridColumn: 'span 6 / span 6' });
      expect(resolveGrid('col-span', '12', config)).toEqual({ gridColumn: 'span 12 / span 12' });
    });

    it('resolves full and auto', () => {
      expect(resolveGrid('col-span', 'full', config)).toEqual({ gridColumn: '1 / -1' });
      expect(resolveGrid('col-span', 'auto', config)).toEqual({ gridColumn: 'auto' });
    });

    it('returns empty for unknown span', () => {
      expect(resolveGrid('col-span', '13', config)).toEqual({});
      expect(resolveGrid('col-span', '0', config)).toEqual({});
      expect(resolveGrid('col-span', 'none', config)).toEqual({});
    });
  });

  describe('row-span', () => {
    it('resolves row spans', () => {
      expect(resolveGrid('row-span', '1', config)).toEqual({ gridRow: 'span 1 / span 1' });
      expect(resolveGrid('row-span', '3', config)).toEqual({ gridRow: 'span 3 / span 3' });
      expect(resolveGrid('row-span', '6', config)).toEqual({ gridRow: 'span 6 / span 6' });
    });

    it('resolves full and auto', () => {
      expect(resolveGrid('row-span', 'full', config)).toEqual({ gridRow: '1 / -1' });
      expect(resolveGrid('row-span', 'auto', config)).toEqual({ gridRow: 'auto' });
    });

    it('returns empty for unknown span', () => {
      expect(resolveGrid('row-span', '7', config)).toEqual({});
      expect(resolveGrid('row-span', '0', config)).toEqual({});
    });
  });

  describe('col-start / col-end', () => {
    it('resolves col-start', () => {
      expect(resolveGrid('col-start', '1', config)).toEqual({ gridColumnStart: '1' });
      expect(resolveGrid('col-start', '7', config)).toEqual({ gridColumnStart: '7' });
      expect(resolveGrid('col-start', '13', config)).toEqual({ gridColumnStart: '13' });
      expect(resolveGrid('col-start', 'auto', config)).toEqual({ gridColumnStart: 'auto' });
    });

    it('resolves col-end', () => {
      expect(resolveGrid('col-end', '4', config)).toEqual({ gridColumnEnd: '4' });
      expect(resolveGrid('col-end', '13', config)).toEqual({ gridColumnEnd: '13' });
      expect(resolveGrid('col-end', 'auto', config)).toEqual({ gridColumnEnd: 'auto' });
    });

    it('returns empty for out-of-range', () => {
      expect(resolveGrid('col-start', '14', config)).toEqual({});
      expect(resolveGrid('col-start', '0', config)).toEqual({});
      expect(resolveGrid('col-end', '14', config)).toEqual({});
    });
  });

  describe('row-start / row-end', () => {
    it('resolves row-start', () => {
      expect(resolveGrid('row-start', '1', config)).toEqual({ gridRowStart: '1' });
      expect(resolveGrid('row-start', '7', config)).toEqual({ gridRowStart: '7' });
      expect(resolveGrid('row-start', 'auto', config)).toEqual({ gridRowStart: 'auto' });
    });

    it('resolves row-end', () => {
      expect(resolveGrid('row-end', '3', config)).toEqual({ gridRowEnd: '3' });
      expect(resolveGrid('row-end', 'auto', config)).toEqual({ gridRowEnd: 'auto' });
    });

    it('returns empty for out-of-range', () => {
      expect(resolveGrid('row-start', '8', config)).toEqual({});
      expect(resolveGrid('row-start', '0', config)).toEqual({});
      expect(resolveGrid('row-end', '8', config)).toEqual({});
    });
  });

  describe('auto-cols / auto-rows', () => {
    it('resolves auto-cols', () => {
      expect(resolveGrid('auto-cols', 'auto', config)).toEqual({ gridAutoColumns: 'auto' });
      expect(resolveGrid('auto-cols', 'min', config)).toEqual({ gridAutoColumns: 'min-content' });
      expect(resolveGrid('auto-cols', 'max', config)).toEqual({ gridAutoColumns: 'max-content' });
      expect(resolveGrid('auto-cols', 'fr', config)).toEqual({ gridAutoColumns: 'minmax(0, 1fr)' });
    });

    it('resolves auto-rows', () => {
      expect(resolveGrid('auto-rows', 'auto', config)).toEqual({ gridAutoRows: 'auto' });
      expect(resolveGrid('auto-rows', 'min', config)).toEqual({ gridAutoRows: 'min-content' });
      expect(resolveGrid('auto-rows', 'max', config)).toEqual({ gridAutoRows: 'max-content' });
      expect(resolveGrid('auto-rows', 'fr', config)).toEqual({ gridAutoRows: 'minmax(0, 1fr)' });
    });

    it('returns empty for unknown value', () => {
      expect(resolveGrid('auto-cols', 'banana', config)).toEqual({});
      expect(resolveGrid('auto-rows', '1', config)).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('returns empty for unknown prefix', () => {
      expect(resolveGrid('grid-gap', '4', config)).toEqual({});
      expect(resolveGrid('banana', '1', config)).toEqual({});
    });

    it('returns empty for empty value', () => {
      expect(resolveGrid('grid-cols', '', config)).toEqual({});
      expect(resolveGrid('col-span', '', config)).toEqual({});
    });

    it('boundary values for col-start/end', () => {
      // 1 is min, 13 is max
      expect(resolveGrid('col-start', '1', config)).toEqual({ gridColumnStart: '1' });
      expect(resolveGrid('col-end', '13', config)).toEqual({ gridColumnEnd: '13' });
    });

    it('boundary values for row-start/end', () => {
      // 1 is min, 7 is max
      expect(resolveGrid('row-start', '1', config)).toEqual({ gridRowStart: '1' });
      expect(resolveGrid('row-end', '7', config)).toEqual({ gridRowEnd: '7' });
    });
  });
});
