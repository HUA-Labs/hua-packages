import { describe, it, expect } from 'vitest';
import { dotCx } from '../index';

describe('dotCx()', () => {
  it('joins multiple strings', () => {
    expect(dotCx('p-4', 'flex', 'bg-white')).toBe('p-4 flex bg-white');
  });

  it('filters false values', () => {
    expect(dotCx('p-4', false, 'flex')).toBe('p-4 flex');
  });

  it('filters null values', () => {
    expect(dotCx('p-4', null, 'flex')).toBe('p-4 flex');
  });

  it('filters undefined values', () => {
    expect(dotCx('p-4', undefined, 'flex')).toBe('p-4 flex');
  });

  it('filters empty strings', () => {
    expect(dotCx('p-4', '', 'flex')).toBe('p-4 flex');
  });

  it('filters zero', () => {
    expect(dotCx('p-4', 0, 'flex')).toBe('p-4 flex');
  });

  it('handles conditional expressions', () => {
    const isActive = true;
    const isDisabled = false;
    expect(dotCx('p-4', isActive && 'bg-primary-500', isDisabled && 'opacity-50')).toBe(
      'p-4 bg-primary-500',
    );
  });

  it('returns empty string when all falsy', () => {
    expect(dotCx(false, null, undefined, '', 0)).toBe('');
  });

  it('returns single string as-is', () => {
    expect(dotCx('p-4')).toBe('p-4');
  });

  it('returns empty string with no arguments', () => {
    expect(dotCx()).toBe('');
  });

  it('handles complex conditional patterns', () => {
    const variant = 'primary' as string;
    const className = 'custom-class';
    expect(
      dotCx(
        'base-styles',
        variant === 'primary' && 'bg-primary-500',
        variant === 'secondary' && 'bg-secondary-500',
        className,
      ),
    ).toBe('base-styles bg-primary-500 custom-class');
  });
});
