import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

describe('divide resolver', () => {
  describe('divide-y / divide-x — unsupported (requires child combinator)', () => {
    it('divide-y → {} (child selector not possible with inline styles)', () => {
      expect(dot('divide-y')).toEqual({});
    });

    it('divide-y-2 → {}', () => {
      expect(dot('divide-y-2')).toEqual({});
    });

    it('divide-y-reverse → {}', () => {
      expect(dot('divide-y-reverse')).toEqual({});
    });

    it('divide-x → {}', () => {
      expect(dot('divide-x')).toEqual({});
    });

    it('divide-x-2 → {}', () => {
      expect(dot('divide-x-2')).toEqual({});
    });

    it('divide-x-reverse → {}', () => {
      expect(dot('divide-x-reverse')).toEqual({});
    });
  });

  describe('divide-color', () => {
    it('divide-gray-200 → borderColor', () => {
      const result = dot('divide-gray-200');
      expect(result).toEqual({ borderColor: '#e5e7eb' });
    });

    it('divide-white → borderColor white', () => {
      const result = dot('divide-white');
      expect(result).toEqual({ borderColor: '#ffffff' });
    });

    it('divide-transparent → borderColor transparent', () => {
      const result = dot('divide-transparent');
      expect(result).toEqual({ borderColor: 'transparent' });
    });

    it('divide-primary-500 → borderColor', () => {
      const result = dot('divide-primary-500');
      expect(result).toEqual({ borderColor: '#3b82f6' });
    });
  });

  describe('combined', () => {
    it('divide-y divide-gray-200 → only color (width unsupported)', () => {
      const result = dot('divide-y divide-gray-200');
      expect(result).toEqual({ borderColor: '#e5e7eb' });
    });
  });
});
