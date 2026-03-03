import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('space-x/y utilities', () => {
  describe('space-x (maps to columnGap)', () => {
    it('space-x-4', () => {
      expect(dot('space-x-4')).toEqual({ columnGap: '16px' });
    });
    it('space-x-0', () => {
      expect(dot('space-x-0')).toEqual({ columnGap: '0px' });
    });
    it('space-x-2', () => {
      expect(dot('space-x-2')).toEqual({ columnGap: '8px' });
    });
    it('space-x-[12px] (arbitrary)', () => {
      expect(dot('space-x-[12px]')).toEqual({ columnGap: '12px' });
    });
  });

  describe('space-y (maps to rowGap)', () => {
    it('space-y-4', () => {
      expect(dot('space-y-4')).toEqual({ rowGap: '16px' });
    });
    it('space-y-0', () => {
      expect(dot('space-y-0')).toEqual({ rowGap: '0px' });
    });
    it('space-y-8', () => {
      expect(dot('space-y-8')).toEqual({ rowGap: '32px' });
    });
    it('space-y-[1.5rem] (arbitrary)', () => {
      expect(dot('space-y-[1.5rem]')).toEqual({ rowGap: '1.5rem' });
    });
  });

  describe('combined with flex', () => {
    it('flex flex-col space-y-4', () => {
      expect(dot('flex flex-col space-y-4')).toEqual({
        display: 'flex',
        flexDirection: 'column',
        rowGap: '16px',
      });
    });
    it('flex space-x-2', () => {
      expect(dot('flex space-x-2')).toEqual({
        display: 'flex',
        columnGap: '8px',
      });
    });
  });

  describe('with variants', () => {
    it('md:space-y-8', () => {
      expect(dot('space-y-4 md:space-y-8', { breakpoint: 'md' })).toEqual({
        rowGap: '32px',
      });
    });
  });
});
