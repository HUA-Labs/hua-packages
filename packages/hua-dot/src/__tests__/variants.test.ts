import { describe, it, expect, beforeEach } from 'vitest';
import { dotVariants, createDotConfig } from '../index';

describe('dotVariants()', () => {
  beforeEach(() => {
    createDotConfig(); // reset to defaults
  });

  describe('base styles', () => {
    it('returns empty object when no config', () => {
      const fn = dotVariants({});
      expect(fn()).toEqual({});
    });

    it('resolves base utility string', () => {
      const fn = dotVariants({ base: 'p-4 flex' });
      const result = fn();
      expect(result).toHaveProperty('padding', '16px');
      expect(result).toHaveProperty('display', 'flex');
    });

    it('returns base styles with no variants defined', () => {
      const fn = dotVariants({ base: 'rounded-lg border' });
      const result = fn();
      expect(result).toHaveProperty('borderRadius');
      expect(result).toHaveProperty('borderWidth');
    });
  });

  describe('single variant axis', () => {
    const badge = dotVariants({
      base: 'inline-flex items-center rounded-full border px-2.5 py-0.5',
      variants: {
        variant: {
          default: 'bg-primary-500',
          secondary: 'bg-gray-200',
          outline: 'border-2',
        },
      },
      defaultVariants: { variant: 'default' },
    });

    it('applies default variant when no props', () => {
      const result = badge();
      expect(result).toHaveProperty('backgroundColor', '#2b6cd6');
      expect(result).toHaveProperty('display', 'inline-flex');
    });

    it('applies explicit variant', () => {
      const result = badge({ variant: 'secondary' });
      expect(result).toHaveProperty('backgroundColor', '#c1c4c8');
    });

    it('applies outline variant', () => {
      const result = badge({ variant: 'outline' });
      expect(result).toHaveProperty('borderWidth', '2px');
    });
  });

  describe('multiple variant axes', () => {
    const button = dotVariants({
      base: 'inline-flex items-center rounded-md',
      variants: {
        variant: {
          primary: 'bg-primary-500',
          secondary: 'bg-gray-200',
        },
        size: {
          sm: 'px-2 py-1 text-sm',
          md: 'px-4 py-2 text-base',
          lg: 'px-6 py-3 text-lg',
        },
      },
      defaultVariants: { variant: 'primary', size: 'md' },
    });

    it('applies all default variants', () => {
      const result = button();
      expect(result).toHaveProperty('backgroundColor', '#2b6cd6');
      expect(result).toHaveProperty('paddingLeft', '16px');
      expect(result).toHaveProperty('paddingRight', '16px');
    });

    it('overrides one axis, keeps other default', () => {
      const result = button({ size: 'sm' });
      expect(result).toHaveProperty('backgroundColor', '#2b6cd6'); // default variant
      expect(result).toHaveProperty('paddingLeft', '8px'); // sm size
    });

    it('overrides both axes', () => {
      const result = button({ variant: 'secondary', size: 'lg' });
      expect(result).toHaveProperty('backgroundColor', '#c1c4c8');
      expect(result).toHaveProperty('paddingLeft', '24px');
    });
  });

  describe('compound variants', () => {
    const input = dotVariants({
      base: 'border rounded-md px-3 py-2',
      variants: {
        variant: {
          default: 'border-gray-300',
          error: 'border-red-500',
        },
        size: {
          sm: 'text-sm',
          md: 'text-base',
        },
      },
      defaultVariants: { variant: 'default', size: 'md' },
      compoundVariants: [
        {
          conditions: { variant: 'error', size: 'sm' },
          dot: 'bg-red-50',
        },
      ],
    });

    it('does not apply compound when conditions do not match', () => {
      const result = input({ variant: 'default', size: 'sm' });
      expect(result).not.toHaveProperty('backgroundColor');
    });

    it('applies compound when all conditions match', () => {
      const result = input({ variant: 'error', size: 'sm' });
      expect(result).toHaveProperty('backgroundColor', '#ffeae6');
    });

    it('applies compound with default variants filling in', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: {
          a: { x: 'flex', y: 'grid' },
          b: { one: 'gap-2', two: 'gap-4' },
        },
        defaultVariants: { a: 'x', b: 'one' },
        compoundVariants: [
          { conditions: { a: 'x', b: 'one' }, dot: 'rounded-lg' },
        ],
      });
      // default a=x, default b=one → compound should match
      const result = fn();
      expect(result).toHaveProperty('borderRadius');
    });
  });

  describe('no default variants', () => {
    it('skips variant axes with no selection', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: {
          color: { red: 'bg-red-500', blue: 'bg-blue-500' },
        },
      });
      const result = fn();
      // No default, no prop → no backgroundColor
      expect(result).not.toHaveProperty('backgroundColor');
    });

    it('applies variant when explicitly provided', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: {
          color: { red: 'bg-red-500', blue: 'bg-blue-500' },
        },
      });
      const result = fn({ color: 'blue' });
      expect(result).toHaveProperty('backgroundColor', '#0079b1');
    });
  });

  describe('boolean variants', () => {
    it('handles boolean-string variant keys', () => {
      const fn = dotVariants({
        base: 'inline-flex',
        variants: {
          fullWidth: {
            true: 'w-full',
            false: 'w-auto',
          },
        },
        defaultVariants: { fullWidth: false },
      });

      const narrow = fn();
      expect(narrow).toHaveProperty('width', 'auto');

      const wide = fn({ fullWidth: true });
      expect(wide).toHaveProperty('width', '100%');
    });
  });

  describe('variant overrides base', () => {
    it('variant styles override base styles for same property', () => {
      const fn = dotVariants({
        base: 'p-4 bg-white',
        variants: {
          variant: {
            dark: 'bg-gray-900',
          },
        },
      });
      const result = fn({ variant: 'dark' });
      expect(result).toHaveProperty('backgroundColor', '#121418');
      expect(result).toHaveProperty('padding', '16px'); // base preserved
    });
  });

  describe('caching', () => {
    it('returns consistent results across calls', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: { v: { a: 'bg-red-500', b: 'bg-blue-500' } },
      });
      const r1 = fn({ v: 'a' });
      const r2 = fn({ v: 'a' });
      expect(r1).toEqual(r2);
    });
  });

  describe('empty/edge cases', () => {
    it('handles undefined props gracefully', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: { v: { a: 'flex' } },
      });
      expect(() => fn(undefined)).not.toThrow();
      expect(fn(undefined)).toHaveProperty('padding', '16px');
    });

    it('handles unknown variant value gracefully', () => {
      const fn = dotVariants({
        base: 'p-4',
        variants: { v: { a: 'flex' } },
      });
      // @ts-expect-error - testing runtime behavior with wrong value
      const result = fn({ v: 'nonexistent' });
      expect(result).toHaveProperty('padding', '16px');
      expect(result).not.toHaveProperty('display');
    });
  });
});
