import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('line-clamp utilities', () => {
  describe('numeric values', () => {
    it('line-clamp-1', () => {
      expect(dot('line-clamp-1')).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 1,
        WebkitBoxOrient: 'vertical',
      });
    });
    it('line-clamp-3', () => {
      expect(dot('line-clamp-3')).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      });
    });
    it('line-clamp-6', () => {
      expect(dot('line-clamp-6')).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 6,
        WebkitBoxOrient: 'vertical',
      });
    });
  });

  describe('none (reset)', () => {
    it('line-clamp-none', () => {
      expect(dot('line-clamp-none')).toEqual({
        overflow: 'visible',
        display: 'block',
        WebkitLineClamp: 'unset',
        WebkitBoxOrient: 'horizontal',
      });
    });
  });

  describe('arbitrary', () => {
    it('line-clamp-[10]', () => {
      expect(dot('line-clamp-[10]')).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 10,
        WebkitBoxOrient: 'vertical',
      });
    });
    it('line-clamp-[abc] → empty (invalid)', () => {
      expect(dot('line-clamp-[abc]')).toEqual({});
    });
  });

  describe('combined', () => {
    it('line-clamp-2 text-sm', () => {
      expect(dot('line-clamp-2 text-sm')).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        fontSize: '14px',
      });
    });
  });

  describe('with variants', () => {
    it('md:line-clamp-3', () => {
      expect(dot('line-clamp-2 md:line-clamp-3', { breakpoint: 'md' })).toEqual({
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
      });
    });
  });
});
