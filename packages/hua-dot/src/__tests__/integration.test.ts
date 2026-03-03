import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../index';

describe('dot() integration', () => {
  beforeEach(() => {
    // Reset to default config and clear cache between tests
    createDotConfig();
    clearDotCache();
  });

  it('returns empty object for empty input', () => {
    expect(dot('')).toEqual({});
    expect(dot('   ')).toEqual({});
  });

  it('resolves spacing', () => {
    expect(dot('p-4')).toEqual({ padding: '16px' });
    expect(dot('m-2')).toEqual({ margin: '8px' });
    expect(dot('px-4 py-2')).toEqual({
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
    });
  });

  it('resolves colors', () => {
    expect(dot('bg-primary-500')).toEqual({ backgroundColor: '#3b82f6' });
    expect(dot('text-white')).toEqual({ color: '#ffffff' });
    expect(dot('border-gray-300')).toEqual({ borderColor: '#d1d5db' });
  });

  it('resolves typography', () => {
    expect(dot('text-sm font-bold')).toEqual({
      fontSize: '14px',
      fontWeight: '700',
    });
    expect(dot('text-center leading-tight tracking-wide')).toEqual({
      textAlign: 'center',
      lineHeight: '1.25',
      letterSpacing: '0.025em',
    });
  });

  it('resolves layout', () => {
    expect(dot('flex items-center justify-between')).toEqual({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
    expect(dot('hidden')).toEqual({ display: 'none' });
    expect(dot('absolute')).toEqual({ position: 'absolute' });
  });

  it('resolves sizing', () => {
    expect(dot('w-full h-12')).toEqual({
      width: '100%',
      height: '48px',
    });
    expect(dot('w-1/2 max-w-md')).toEqual({
      width: '50%',
      maxWidth: '448px',
    });
    expect(dot('min-h-screen')).toEqual({ minHeight: '100vh' });
  });

  it('resolves borders', () => {
    expect(dot('border rounded-lg')).toEqual({
      borderWidth: '1px',
      borderRadius: '8px',
    });
    expect(dot('border-2 border-dashed border-red-500')).toEqual({
      borderWidth: '2px',
      borderStyle: 'dashed',
      borderColor: '#ef4444',
    });
  });

  it('resolves border radius directional', () => {
    expect(dot('rounded-t-lg')).toEqual({
      borderTopLeftRadius: '8px',
      borderTopRightRadius: '8px',
    });
  });

  it('resolves flexbox', () => {
    expect(dot('flex flex-col flex-1 gap-4')).toEqual({
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 0%',
      gap: '16px',
    });
    expect(dot('grow shrink-0 order-2')).toEqual({
      flexGrow: '1',
      flexShrink: '0',
      order: '2',
    });
  });

  it('resolves z-index', () => {
    expect(dot('z-10')).toEqual({ zIndex: '10' });
    expect(dot('z-50')).toEqual({ zIndex: '50' });
    expect(dot('z-auto')).toEqual({ zIndex: 'auto' });
  });

  it('handles complex real-world utility strings', () => {
    const result = dot('p-4 flex items-center bg-primary-500 text-white rounded-lg');
    expect(result).toEqual({
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '8px',
    });
  });

  it('handles card-like component styles', () => {
    const result = dot('bg-white rounded-xl p-6 border border-gray-200');
    expect(result).toEqual({
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      borderWidth: '1px',
      borderColor: '#e5e7eb',
    });
  });

  it('handles button-like styles', () => {
    const result = dot('px-4 py-2 bg-primary-500 text-white rounded-md font-medium text-sm');
    expect(result).toEqual({
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '14px',
    });
  });

  it('skips variant tokens in Phase 1', () => {
    const result = dot('bg-white dark:bg-gray-900 p-4');
    expect(result).toEqual({
      backgroundColor: '#ffffff',
      padding: '16px',
    });
  });

  it('last token wins on property conflict', () => {
    const result = dot('p-4 p-8');
    expect(result).toEqual({ padding: '32px' });
  });

  it('uses input cache on repeated calls', () => {
    const result1 = dot('p-4 flex');
    const result2 = dot('p-4 flex');
    expect(result1).toBe(result2); // Same reference (cached)
  });

  it('returns different references for different inputs', () => {
    const result1 = dot('p-4');
    const result2 = dot('p-8');
    expect(result1).not.toBe(result2);
  });

  it('ignores unknown tokens gracefully', () => {
    const result = dot('p-4 unknown-token flex');
    expect(result).toEqual({
      padding: '16px',
      display: 'flex',
    });
  });

  describe('clearDotCache', () => {
    it('clears cache so next call produces new reference', () => {
      const result1 = dot('p-4');
      clearDotCache();
      const result2 = dot('p-4');
      expect(result1).not.toBe(result2); // Different reference
      expect(result1).toEqual(result2);  // Same value
    });
  });

  describe('createDotConfig', () => {
    it('resets cache on config change', () => {
      const result1 = dot('p-4');
      createDotConfig({ cacheSize: 100 });
      const result2 = dot('p-4');
      expect(result1).not.toBe(result2);
    });
  });

  describe('edge cases', () => {
    it('handles null-ish and garbage inputs gracefully', () => {
      // @ts-expect-error testing runtime safety
      expect(dot(null)).toEqual({});
      // @ts-expect-error testing runtime safety
      expect(dot(undefined)).toEqual({});
    });

    it('handles single-character garbage', () => {
      expect(dot('-')).toEqual({});
      expect(dot('x')).toEqual({});
      expect(dot('---')).toEqual({});
    });

    it('handles repeated tokens (idempotency)', () => {
      const result = dot('p-4 p-4 p-4 flex flex');
      expect(result).toEqual({ padding: '16px', display: 'flex' });
    });

    it('handles extremely long inputs', () => {
      const longInput = Array(200).fill('p-4').join(' ');
      const result = dot(longInput);
      expect(result).toEqual({ padding: '16px' });
    });

    it('handles mixed valid and invalid tokens', () => {
      const result = dot('p-4 xyzzy-999 flex banana bg-primary-500 not-a-thing');
      expect(result).toEqual({
        padding: '16px',
        display: 'flex',
        backgroundColor: '#3b82f6',
      });
    });

    it('handles numeric edge values', () => {
      expect(dot('p-0')).toEqual({ padding: '0px' });
      expect(dot('p-96')).toEqual({ padding: '384px' });
      expect(dot('p-0.5')).toEqual({ padding: '2px' });
      expect(dot('z-0')).toEqual({ zIndex: '0' });
    });

    it('handles bare prefix tokens together', () => {
      const result = dot('border rounded');
      expect(result).toEqual({ borderWidth: '1px', borderRadius: '4px' });
    });

    it('handles all spacing directions simultaneously', () => {
      const result = dot('pt-1 pr-2 pb-3 pl-4');
      expect(result).toEqual({
        paddingTop: '4px',
        paddingRight: '8px',
        paddingBottom: '12px',
        paddingLeft: '16px',
      });
    });

    it('handles directional overrides correctly', () => {
      // p-4 sets padding, then pt-8 should override paddingTop? No - p resolves to 'padding', pt to 'paddingTop'
      // These are different CSS properties, both should exist
      const result = dot('p-4 pt-8');
      expect(result).toEqual({ padding: '16px', paddingTop: '32px' });
    });

    it('handles text- ambiguity across a real-world mix', () => {
      // text-center is textAlign, text-sm is fontSize, text-red-500 is color
      const result = dot('text-center text-sm text-red-500');
      // Last text token affecting each property wins
      expect(result).toEqual({
        textAlign: 'center',
        fontSize: '14px',
        color: '#ef4444',
      });
    });

    it('handles border- ambiguity: width vs color vs style', () => {
      const result = dot('border-2 border-solid border-gray-400');
      expect(result).toEqual({
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#9ca3af',
      });
    });

    it('handles all color palettes', () => {
      const palettes = ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'primary', 'secondary', 'success'];
      for (const palette of palettes) {
        const result = dot(`bg-${palette}-500`);
        expect(result).toHaveProperty('backgroundColor');
        expect(typeof result.backgroundColor).toBe('string');
        expect(result.backgroundColor).toMatch(/^#[0-9a-f]{6}$/);
      }
    });

    it('handles special colors as bg/text/border', () => {
      expect(dot('bg-transparent')).toEqual({ backgroundColor: 'transparent' });
      expect(dot('text-current')).toEqual({ color: 'currentColor' });
      expect(dot('bg-black text-white')).toEqual({
        backgroundColor: '#000000',
        color: '#ffffff',
      });
    });

    it('handles whitespace-heavy and tab-containing input', () => {
      expect(dot('  p-4   \t  flex  \n  bg-white  ')).toEqual({
        padding: '16px',
        display: 'flex',
        backgroundColor: '#ffffff',
      });
    });

    it('does not crash on pseudo-valid tokens with wrong values', () => {
      expect(dot('p-999')).toEqual({});       // unknown spacing
      expect(dot('bg-nope-500')).toEqual({});  // unknown palette
      expect(dot('z-999')).toEqual({});        // unknown z-index
      expect(dot('rounded-xxx')).toEqual({});  // unknown radius
      expect(dot('font-xxx')).toEqual({});     // unknown weight
      expect(dot('leading-xxx')).toEqual({});  // unknown line-height
      expect(dot('tracking-xxx')).toEqual({}); // unknown letter-spacing
      expect(dot('w-abc')).toEqual({});        // unknown width
      expect(dot('border-99')).toEqual({});    // unknown border-width
      expect(dot('order-99')).toEqual({});     // unknown order
    });

    it('handles max-w with non-existent keyword', () => {
      expect(dot('max-w-galaxy')).toEqual({});
    });

    it('handles w-screen vs h-screen correctly', () => {
      expect(dot('w-screen')).toEqual({ width: '100vw' });
      expect(dot('h-screen')).toEqual({ height: '100vh' });
    });

    it('handles all border-radius corner combinations', () => {
      const result = dot('rounded-tl-lg rounded-tr-md rounded-bl-sm rounded-br-full');
      expect(result).toEqual({
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '6px',
        borderBottomLeftRadius: '2px',
        borderBottomRightRadius: '9999px',
      });
    });

    it('handles flex-none and order-none', () => {
      expect(dot('flex-none')).toEqual({ flex: 'none' });
      expect(dot('order-none')).toEqual({ order: '0' });
    });

    it('handles negative-looking tokens gracefully (unsupported)', () => {
      // Negative values not supported in Phase 1, should not crash
      expect(dot('-m-4')).toEqual({});
      expect(dot('-top-2')).toEqual({});
    });

    it('handles multiple variants stacked (skipped in Phase 1)', () => {
      const result = dot('dark:hover:md:bg-blue-500 p-4');
      expect(result).toEqual({ padding: '16px' });
    });

    it('handles only variant tokens (all skipped)', () => {
      expect(dot('dark:bg-white hover:text-blue-500')).toEqual({});
    });

    it('handles cache disabled via config', () => {
      createDotConfig({ cache: false });
      const result1 = dot('p-4');
      const result2 = dot('p-4');
      // With cache disabled, these should be different references but same value
      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });
  });
});
