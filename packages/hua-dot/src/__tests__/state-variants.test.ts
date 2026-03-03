import { describe, it, expect, beforeEach } from 'vitest';
import { dot, dotMap, createDotConfig, clearDotCache } from '../index';

describe('dotMap() — state variants', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // -----------------------------------------------------------------------
  // Basic state routing
  // -----------------------------------------------------------------------
  it('routes hover: to hover bucket', () => {
    const result = dotMap('bg-white hover:bg-gray-100');
    expect(result.base).toEqual({ backgroundColor: '#ffffff' });
    expect(result.hover).toEqual({ backgroundColor: '#f3f4f6' });
  });

  it('routes focus: to focus bucket', () => {
    const result = dotMap('p-4 focus:opacity-75');
    expect(result.base).toEqual({ padding: '16px' });
    expect(result.focus).toEqual({ opacity: '0.75' });
  });

  it('routes active: to active bucket', () => {
    const result = dotMap('bg-primary-500 active:bg-primary-600');
    expect(result.base).toEqual({ backgroundColor: '#3b82f6' });
    expect(result.active).toEqual({ backgroundColor: '#2563eb' });
  });

  it('routes focus-visible: to focus-visible bucket', () => {
    const result = dotMap('p-4 focus-visible:shadow-sm');
    expect(result.base).toEqual({ padding: '16px' });
    expect(result['focus-visible']).toHaveProperty('boxShadow');
  });

  it('routes disabled: to disabled bucket', () => {
    const result = dotMap('opacity-100 disabled:opacity-50');
    expect(result.base).toEqual({ opacity: '1' });
    expect(result.disabled).toEqual({ opacity: '0.5' });
  });

  // -----------------------------------------------------------------------
  // Multiple states
  // -----------------------------------------------------------------------
  it('handles multiple state variants', () => {
    const result = dotMap('bg-white hover:bg-gray-100 focus:bg-gray-200 active:bg-gray-300');
    expect(result.base).toEqual({ backgroundColor: '#ffffff' });
    expect(result.hover).toEqual({ backgroundColor: '#f3f4f6' });
    expect(result.focus).toEqual({ backgroundColor: '#e5e7eb' });
    expect(result.active).toEqual({ backgroundColor: '#d1d5db' });
  });

  it('accumulates multiple properties in same state', () => {
    const result = dotMap('hover:bg-gray-100 hover:text-gray-900');
    expect(result.base).toEqual({});
    expect(result.hover).toEqual({
      backgroundColor: '#f3f4f6',
      color: '#111827',
    });
  });

  // -----------------------------------------------------------------------
  // Omitted empty states
  // -----------------------------------------------------------------------
  it('omits state keys with no styles', () => {
    const result = dotMap('p-4 hover:bg-gray-100');
    expect(result.base).toEqual({ padding: '16px' });
    expect(result.hover).toBeDefined();
    expect(result.focus).toBeUndefined();
    expect(result.active).toBeUndefined();
  });

  // -----------------------------------------------------------------------
  // Empty / no state input
  // -----------------------------------------------------------------------
  it('returns only base when no state variants', () => {
    const result = dotMap('p-4 flex items-center');
    expect(result.base).toEqual({
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
    });
    expect(result.hover).toBeUndefined();
  });

  it('returns empty base for empty input', () => {
    expect(dotMap('')).toEqual({ base: {} });
    expect(dotMap('   ')).toEqual({ base: {} });
  });

  // -----------------------------------------------------------------------
  // Dark + state
  // -----------------------------------------------------------------------
  it('applies dark mode in base and state', () => {
    const result = dotMap('bg-white dark:bg-gray-900 hover:bg-gray-100', { dark: true });
    expect(result.base).toEqual({ backgroundColor: '#111827' });
    expect(result.hover).toEqual({ backgroundColor: '#f3f4f6' });
  });

  // -----------------------------------------------------------------------
  // Responsive + state
  // -----------------------------------------------------------------------
  it('applies responsive cascade with state variants', () => {
    const result = dotMap('p-4 md:p-8 hover:bg-gray-100', { breakpoint: 'md' });
    expect(result.base).toEqual({ padding: '32px' });
    expect(result.hover).toEqual({ backgroundColor: '#f3f4f6' });
  });

  // -----------------------------------------------------------------------
  // Native + state
  // -----------------------------------------------------------------------
  it('applies native adapter to state styles', () => {
    const result = dotMap('p-4 hover:p-8', { target: 'native' });
    expect(result.base).toEqual({ padding: 16 });
    expect(result.hover).toEqual({ padding: 32 });
  });

  it('strips unsupported props from state styles in native', () => {
    const result = dotMap('hover:cursor-pointer hover:bg-gray-100', { target: 'native' });
    expect(result.hover).toEqual({ backgroundColor: '#f3f4f6' });
  });

  // -----------------------------------------------------------------------
  // Caching
  // -----------------------------------------------------------------------
  it('caches dotMap results', () => {
    const result1 = dotMap('p-4 hover:bg-gray-100');
    const result2 = dotMap('p-4 hover:bg-gray-100');
    expect(result1).toEqual(result2);
  });

  // -----------------------------------------------------------------------
  // dot() backward compat
  // -----------------------------------------------------------------------
  it('dot() still ignores state variants (backward compat)', () => {
    const result = dot('p-4 hover:p-8');
    expect(result).toEqual({ padding: '16px' });
  });

  it('dot() ignores focus: and active: variants', () => {
    const result = dot('bg-white focus:bg-gray-100 active:bg-gray-200');
    expect(result).toEqual({ backgroundColor: '#ffffff' });
  });
});
