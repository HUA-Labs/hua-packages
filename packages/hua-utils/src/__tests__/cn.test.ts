import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('')).toBe('');
  });

  it('should handle single class', () => {
    expect(cn('text-red-500')).toBe('text-red-500');
  });

  it('should merge multiple classes', () => {
    expect(cn('text-red-500', 'bg-blue-200')).toBe('text-red-500 bg-blue-200');
  });

  it('should handle conditional classes (falsy values ignored)', () => {
    expect(cn('text-red-500', false && 'hidden', null, undefined, 0, '')).toBe('text-red-500');
    expect(cn('text-red-500', true && 'bg-blue-200')).toBe('text-red-500 bg-blue-200');
  });

  it('should resolve Tailwind class conflicts', () => {
    // Later padding value should override earlier one
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle object syntax', () => {
    expect(cn({ 'text-red-500': true, 'bg-blue-200': false })).toBe('text-red-500');
  });

  it('should handle array syntax', () => {
    expect(cn(['text-red-500', 'bg-blue-200'])).toBe('text-red-500 bg-blue-200');
  });

  it('should handle complex mixed inputs', () => {
    expect(
      cn(
        'base-class',
        { 'conditional-class': true },
        ['array-class'],
        false && 'ignored',
        'p-4',
        'p-2' // should override p-4
      )
    ).toBe('base-class conditional-class array-class p-2');
  });
});
