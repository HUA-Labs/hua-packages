import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('Arbitrary values ([...])', () => {
  describe('spacing', () => {
    it('p-[20px]', () => {
      expect(dot('p-[20px]')).toEqual({ padding: '20px' });
    });
    it('mx-[2rem]', () => {
      expect(dot('mx-[2rem]')).toEqual({ marginLeft: '2rem', marginRight: '2rem' });
    });
    it('gap-[10px]', () => {
      expect(dot('gap-[10px]')).toEqual({ gap: '10px' });
    });
  });

  describe('sizing', () => {
    it('w-[300px]', () => {
      expect(dot('w-[300px]')).toEqual({ width: '300px' });
    });
    it('h-[50vh]', () => {
      expect(dot('h-[50vh]')).toEqual({ height: '50vh' });
    });
    it('max-w-[600px]', () => {
      expect(dot('max-w-[600px]')).toEqual({ maxWidth: '600px' });
    });
    it('min-h-[100dvh]', () => {
      expect(dot('min-h-[100dvh]')).toEqual({ minHeight: '100dvh' });
    });
  });

  describe('color', () => {
    it('bg-[#ff0000]', () => {
      expect(dot('bg-[#ff0000]')).toEqual({ backgroundColor: '#ff0000' });
    });
    it('text-[rgb(0,0,0)]', () => {
      expect(dot('text-[rgb(0,0,0)]')).toEqual({ color: 'rgb(0,0,0)' });
    });
    it('bg-[var(--color-card)]', () => {
      expect(dot('bg-[var(--color-card)]')).toEqual({ backgroundColor: 'var(--color-card)' });
    });
  });

  describe('border', () => {
    it('border-[3px]', () => {
      expect(dot('border-[3px]')).toEqual({ borderWidth: '3px' });
    });
    it('border-t-[2px]', () => {
      expect(dot('border-t-[2px]')).toEqual({ borderTopWidth: '2px' });
    });
  });

  describe('shadow', () => {
    it('shadow-[0_4px_6px_rgba(0,0,0,0.1)]', () => {
      expect(dot('shadow-[0_4px_6px_rgba(0,0,0,0.1)]')).toEqual({
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      });
    });
  });

  describe('combined', () => {
    it('w-[300px] p-[20px] bg-[#ff0000]', () => {
      expect(dot('w-[300px] p-[20px] bg-[#ff0000]')).toEqual({
        width: '300px',
        padding: '20px',
        backgroundColor: '#ff0000',
      });
    });
  });

  describe('with variants', () => {
    it('dark:bg-[#1a1a2e]', () => {
      expect(dot('dark:bg-[#1a1a2e]', { dark: true })).toEqual({
        backgroundColor: '#1a1a2e',
      });
    });
    it('md:w-[600px]', () => {
      expect(dot('md:w-[600px]', { breakpoint: 'md' })).toEqual({
        width: '600px',
      });
    });
  });
});
