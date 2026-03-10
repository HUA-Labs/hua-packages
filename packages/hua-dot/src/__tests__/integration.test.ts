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
    expect(dot('bg-primary-500')).toEqual({ backgroundColor: '#2b6cd6' });
    expect(dot('text-white')).toEqual({ color: '#ffffff' });
    expect(dot('border-gray-300')).toEqual({ borderColor: '#a3a7ae' });
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
      borderColor: '#ca2c22',
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
      backgroundColor: '#2b6cd6',
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
      borderColor: '#c1c4c8',
    });
  });

  it('handles button-like styles', () => {
    const result = dot('px-4 py-2 bg-primary-500 text-white rounded-md font-medium text-sm');
    expect(result).toEqual({
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      backgroundColor: '#2b6cd6',
      color: '#ffffff',
      borderRadius: '6px',
      fontWeight: '500',
      fontSize: '14px',
    });
  });

  it('applies base tokens and ignores dark: tokens in light mode', () => {
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
        backgroundColor: '#2b6cd6',
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
        color: '#ca2c22',
      });
    });

    it('handles border- ambiguity: width vs color vs style', () => {
      const result = dot('border-2 border-solid border-gray-400');
      expect(result).toEqual({
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: '#888c93',
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

    it('resolves negative margin', () => {
      expect(dot('-m-4')).toEqual({ margin: '-16px' });
      expect(dot('-mt-2')).toEqual({ marginTop: '-8px' });
      expect(dot('-mx-auto')).toEqual({ marginLeft: 'auto', marginRight: 'auto' });
    });

    it('resolves negative positioning', () => {
      expect(dot('-top-2')).toEqual({ top: '-8px' });
      expect(dot('-left-4')).toEqual({ left: '-16px' });
      expect(dot('-inset-x-2')).toEqual({ left: '-8px', right: '-8px' });
    });

    it('resolves negative translate', () => {
      expect(dot('-translate-x-4')).toEqual({ transform: 'translateX(-16px)' });
      expect(dot('-translate-y-8')).toEqual({ transform: 'translateY(-32px)' });
    });

    it('does not negate zero values', () => {
      expect(dot('-m-0')).toEqual({ margin: '0px' });
      expect(dot('-top-0')).toEqual({ top: '0px' });
    });

    it('negates percentage values', () => {
      expect(dot('-top-1/2')).toEqual({ top: '-50%' });
      expect(dot('-left-full')).toEqual({ left: '-100%' });
    });

    it('does not negate auto keyword', () => {
      expect(dot('-top-auto')).toEqual({ top: 'auto' });
    });

    it('combines negative with other tokens', () => {
      const result = dot('absolute -top-2 -left-4 p-4');
      expect(result).toEqual({
        position: 'absolute',
        top: '-8px',
        left: '-16px',
        padding: '16px',
      });
    });

    it('handles multiple variants stacked (only dark: supported)', () => {
      // Multi-variant tokens still skipped
      const result = dot('dark:hover:md:bg-blue-500 p-4');
      expect(result).toEqual({ padding: '16px' });
    });

    it('handles mixed variant tokens', () => {
      // dark: tokens resolved only in dark mode, hover: still skipped
      expect(dot('dark:bg-white hover:text-blue-500')).toEqual({});
      expect(dot('dark:bg-white hover:text-blue-500', { dark: true })).toEqual({ backgroundColor: '#ffffff' });
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

  describe('custom tokens (Phase 2)', () => {
    it('resolves custom spacing token', () => {
      createDotConfig({ theme: { spacing: { '18': '72px' } } });
      expect(dot('p-18')).toEqual({ padding: '72px' });
    });

    it('resolves custom color palette', () => {
      createDotConfig({ theme: { colors: { brand: { '500': '#6630E6' } } } });
      expect(dot('bg-brand-500')).toEqual({ backgroundColor: '#6630E6' });
    });

    it('overrides existing token', () => {
      createDotConfig({ theme: { colors: { primary: { '500': '#00ffff' } } } });
      expect(dot('bg-primary-500')).toEqual({ backgroundColor: '#00ffff' });
    });

    it('preserves default tokens alongside custom ones', () => {
      createDotConfig({ theme: { spacing: { '18': '72px' } } });
      expect(dot('p-4')).toEqual({ padding: '16px' }); // default still works
      expect(dot('p-18')).toEqual({ padding: '72px' }); // custom works
    });
  });

  describe('strictMode (Phase 2)', () => {
    it('throws on unknown token when enabled', () => {
      createDotConfig({ strictMode: true });
      expect(() => dot('banana-split')).toThrow('[dot] Unknown token: "banana-split"');
    });

    it('throws on unknown standalone token when enabled', () => {
      createDotConfig({ strictMode: true });
      expect(() => dot('xyzzy')).toThrow('[dot] Unknown token');
    });

    it('does not throw on valid tokens', () => {
      createDotConfig({ strictMode: true });
      expect(() => dot('p-4 flex bg-primary-500')).not.toThrow();
    });

    it('returns empty for unknown token when disabled (default)', () => {
      createDotConfig({ strictMode: false });
      expect(dot('banana-split')).toEqual({});
    });
  });

  describe('dark: variant (Phase 2)', () => {
    it('ignores dark tokens in light mode (default)', () => {
      const result = dot('bg-white dark:bg-gray-900');
      expect(result).toEqual({ backgroundColor: '#ffffff' });
    });

    it('applies dark overrides in dark mode', () => {
      const result = dot('bg-white dark:bg-gray-900', { dark: true });
      expect(result).toEqual({ backgroundColor: '#121418' });
    });

    it('handles dark-only tokens', () => {
      const result = dot('dark:text-white', { dark: true });
      expect(result).toEqual({ color: '#ffffff' });
    });

    it('dark-only tokens ignored in light mode', () => {
      const result = dot('dark:text-white');
      expect(result).toEqual({});
    });

    it('dark overrides only affected properties', () => {
      const result = dot('p-4 bg-white dark:bg-gray-900', { dark: true });
      expect(result).toEqual({ padding: '16px', backgroundColor: '#121418' });
    });

    it('dark tokens without dark context returns base only', () => {
      const result = dot('p-4 dark:bg-gray-900');
      expect(result).toEqual({ padding: '16px' });
    });

    it('caches dark and light results separately', () => {
      const light = dot('bg-white dark:bg-gray-900');
      const dark = dot('bg-white dark:bg-gray-900', { dark: true });
      expect(light).toEqual({ backgroundColor: '#ffffff' });
      expect(dark).toEqual({ backgroundColor: '#121418' });
      expect(light).not.toEqual(dark);
    });
  });

  describe('new resolvers (Phase 2)', () => {
    it('resolves shadow', () => {
      expect(dot('shadow')).toHaveProperty('boxShadow');
      expect(dot('shadow-lg')).toHaveProperty('boxShadow');
      expect(dot('shadow-none')).toEqual({ boxShadow: 'none' });
    });

    it('resolves opacity', () => {
      expect(dot('opacity-50')).toEqual({ opacity: '0.5' });
      expect(dot('opacity-0')).toEqual({ opacity: '0' });
      expect(dot('opacity-100')).toEqual({ opacity: '1' });
    });

    it('resolves rotate', () => {
      expect(dot('rotate-45')).toEqual({ transform: 'rotate(45deg)' });
      expect(dot('rotate-180')).toEqual({ transform: 'rotate(180deg)' });
    });

    it('resolves scale', () => {
      expect(dot('scale-110')).toEqual({ transform: 'scale(1.1)' });
      expect(dot('scale-0')).toEqual({ transform: 'scale(0)' });
    });

    it('resolves translate', () => {
      expect(dot('translate-x-4')).toEqual({ transform: 'translateX(16px)' });
      expect(dot('translate-y-8')).toEqual({ transform: 'translateY(32px)' });
    });

    it('resolves skew', () => {
      expect(dot('skew-x-6')).toEqual({ transform: 'skewX(6deg)' });
      expect(dot('skew-y-12')).toEqual({ transform: 'skewY(12deg)' });
    });

    it('resolves transition properties', () => {
      expect(dot('transition-all')).toEqual({ transitionProperty: 'all' });
      expect(dot('transition-none')).toEqual({ transitionProperty: 'none' });
      expect(dot('transition')).toHaveProperty('transitionProperty');
    });

    it('resolves duration', () => {
      expect(dot('duration-200')).toEqual({ transitionDuration: '200ms' });
      expect(dot('duration-0')).toEqual({ transitionDuration: '0s' });
    });

    it('resolves ease', () => {
      expect(dot('ease-linear')).toEqual({ transitionTimingFunction: 'linear' });
      expect(dot('ease-in-out')).toHaveProperty('transitionTimingFunction');
    });

    it('resolves delay', () => {
      expect(dot('delay-100')).toEqual({ transitionDelay: '100ms' });
    });

    it('resolves animation', () => {
      expect(dot('animate-spin')).toHaveProperty('animation');
      expect(dot('animate-none')).toEqual({ animation: 'none' });
    });

    it('resolves backdrop-blur', () => {
      expect(dot('backdrop-blur')).toEqual({ backdropFilter: 'blur(8px)' });
      expect(dot('backdrop-blur-md')).toEqual({ backdropFilter: 'blur(12px)' });
      expect(dot('backdrop-blur-none')).toEqual({ backdropFilter: 'blur(0)' });
    });

    it('handles complex Phase 2 utility string', () => {
      const result = dot('shadow-lg opacity-50 rotate-45 duration-200 animate-spin backdrop-blur-md');
      expect(result).toHaveProperty('boxShadow');
      expect(result).toHaveProperty('opacity', '0.5');
      expect(result).toHaveProperty('transform', 'rotate(45deg)');
      expect(result).toHaveProperty('transitionDuration', '200ms');
      expect(result).toHaveProperty('animation');
      expect(result).toHaveProperty('backdropFilter', 'blur(12px)');
    });

    it('accumulates multiple transforms', () => {
      expect(dot('rotate-45 scale-110')).toEqual({
        transform: 'rotate(45deg) scale(1.1)',
      });
    });

    it('accumulates three transforms', () => {
      expect(dot('rotate-45 scale-110 translate-x-4')).toEqual({
        transform: 'rotate(45deg) scale(1.1) translateX(16px)',
      });
    });

    it('accumulates directional transforms', () => {
      expect(dot('scale-x-75 scale-y-125')).toEqual({
        transform: 'scaleX(.75) scaleY(1.25)',
      });
    });

    it('accumulates translate + skew', () => {
      expect(dot('translate-x-4 translate-y-8 skew-x-6')).toEqual({
        transform: 'translateX(16px) translateY(32px) skewX(6deg)',
      });
    });

    it('single transform still works normally', () => {
      expect(dot('rotate-90')).toEqual({ transform: 'rotate(90deg)' });
    });

    it('transform accumulation with other properties', () => {
      const result = dot('p-4 rotate-45 scale-110 opacity-50');
      expect(result).toEqual({
        padding: '16px',
        transform: 'rotate(45deg) scale(1.1)',
        opacity: '0.5',
      });
    });

    it('dark: variant with accumulated transforms', () => {
      const result = dot('rotate-45 dark:scale-110', { dark: true });
      // dark override replaces, not accumulates (separate layer)
      expect(result).toEqual({
        transform: 'scale(1.1)',
      });
    });
  });

  describe('positioning (Phase 3a)', () => {
    it('resolves basic position offsets', () => {
      expect(dot('top-0')).toEqual({ top: '0px' });
      expect(dot('right-4')).toEqual({ right: '16px' });
      expect(dot('bottom-8')).toEqual({ bottom: '32px' });
      expect(dot('left-2')).toEqual({ left: '8px' });
    });

    it('resolves inset shorthand', () => {
      expect(dot('inset-0')).toEqual({
        top: '0px', right: '0px', bottom: '0px', left: '0px',
      });
      expect(dot('inset-4')).toEqual({
        top: '16px', right: '16px', bottom: '16px', left: '16px',
      });
    });

    it('resolves inset-x and inset-y', () => {
      expect(dot('inset-x-0')).toEqual({ left: '0px', right: '0px' });
      expect(dot('inset-y-4')).toEqual({ top: '16px', bottom: '16px' });
    });

    it('resolves positioning keywords', () => {
      expect(dot('top-auto')).toEqual({ top: 'auto' });
      expect(dot('top-full')).toEqual({ top: '100%' });
      expect(dot('left-1/2')).toEqual({ left: '50%' });
      expect(dot('right-1/3')).toEqual({ right: '33.333333%' });
    });

    it('resolves logical properties', () => {
      expect(dot('start-4')).toEqual({ insetInlineStart: '16px' });
      expect(dot('end-0')).toEqual({ insetInlineEnd: '0px' });
    });

    it('combines positioning with position type', () => {
      const result = dot('absolute inset-0');
      expect(result).toEqual({
        position: 'absolute',
        top: '0px', right: '0px', bottom: '0px', left: '0px',
      });
    });

    it('handles absolute + directional offsets', () => {
      const result = dot('fixed top-0 left-0 right-0');
      expect(result).toEqual({
        position: 'fixed',
        top: '0px', left: '0px', right: '0px',
      });
    });

    it('handles sticky header pattern', () => {
      const result = dot('sticky top-0 z-50');
      expect(result).toEqual({
        position: 'sticky',
        top: '0px',
        zIndex: '50',
      });
    });

    it('handles centering pattern', () => {
      const result = dot('absolute top-1/2 left-1/2');
      expect(result).toEqual({
        position: 'absolute',
        top: '50%',
        left: '50%',
      });
    });

    it('ignores unknown positioning values', () => {
      expect(dot('top-999')).toEqual({});
      expect(dot('left-banana')).toEqual({});
    });

    it('last-wins for conflicting position offsets', () => {
      const result = dot('top-4 top-8');
      expect(result).toEqual({ top: '32px' });
    });

    it('inset then override specific side', () => {
      const result = dot('inset-0 top-4');
      expect(result).toEqual({
        top: '16px', right: '0px', bottom: '0px', left: '0px',
      });
    });

    it('handles dark: variant on positioning', () => {
      const result = dot('top-4 dark:top-8', { dark: true });
      expect(result).toEqual({ top: '32px' });
    });
  });

  describe('grid (Phase 3a)', () => {
    it('resolves grid-cols', () => {
      expect(dot('grid-cols-3')).toEqual({
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      });
      expect(dot('grid-cols-12')).toEqual({
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
      });
      expect(dot('grid-cols-none')).toEqual({
        gridTemplateColumns: 'none',
      });
    });

    it('resolves grid-rows', () => {
      expect(dot('grid-rows-3')).toEqual({
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
      });
      expect(dot('grid-rows-none')).toEqual({
        gridTemplateRows: 'none',
      });
    });

    it('resolves col-span', () => {
      expect(dot('col-span-2')).toEqual({ gridColumn: 'span 2 / span 2' });
      expect(dot('col-span-full')).toEqual({ gridColumn: '1 / -1' });
      expect(dot('col-span-auto')).toEqual({ gridColumn: 'auto' });
    });

    it('resolves row-span', () => {
      expect(dot('row-span-3')).toEqual({ gridRow: 'span 3 / span 3' });
      expect(dot('row-span-full')).toEqual({ gridRow: '1 / -1' });
    });

    it('resolves col-start/end', () => {
      expect(dot('col-start-1')).toEqual({ gridColumnStart: '1' });
      expect(dot('col-end-4')).toEqual({ gridColumnEnd: '4' });
      expect(dot('col-start-auto')).toEqual({ gridColumnStart: 'auto' });
    });

    it('resolves row-start/end', () => {
      expect(dot('row-start-2')).toEqual({ gridRowStart: '2' });
      expect(dot('row-end-5')).toEqual({ gridRowEnd: '5' });
    });

    it('resolves auto-cols/auto-rows', () => {
      expect(dot('auto-cols-fr')).toEqual({ gridAutoColumns: 'minmax(0, 1fr)' });
      expect(dot('auto-rows-min')).toEqual({ gridAutoRows: 'min-content' });
    });

    it('resolves grid-flow standalone', () => {
      expect(dot('grid-flow-row')).toEqual({ gridAutoFlow: 'row' });
      expect(dot('grid-flow-col')).toEqual({ gridAutoFlow: 'column' });
      expect(dot('grid-flow-dense')).toEqual({ gridAutoFlow: 'dense' });
      expect(dot('grid-flow-row-dense')).toEqual({ gridAutoFlow: 'row dense' });
      expect(dot('grid-flow-col-dense')).toEqual({ gridAutoFlow: 'column dense' });
    });

    it('handles full grid layout pattern', () => {
      const result = dot('grid grid-cols-3 gap-4');
      expect(result).toEqual({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '16px',
      });
    });

    it('handles grid item spanning', () => {
      const result = dot('col-span-2 row-span-3');
      expect(result).toEqual({
        gridColumn: 'span 2 / span 2',
        gridRow: 'span 3 / span 3',
      });
    });

    it('handles grid item placement', () => {
      const result = dot('col-start-2 col-end-5 row-start-1 row-end-3');
      expect(result).toEqual({
        gridColumnStart: '2',
        gridColumnEnd: '5',
        gridRowStart: '1',
        gridRowEnd: '3',
      });
    });

    it('handles complex grid layout', () => {
      const result = dot('grid grid-cols-12 gap-4 grid-flow-row-dense');
      expect(result).toEqual({
        display: 'grid',
        gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
        gap: '16px',
        gridAutoFlow: 'row dense',
      });
    });

    it('handles dashboard layout pattern', () => {
      const result = dot('grid grid-cols-4 grid-rows-3 gap-6');
      expect(result).toEqual({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
      });
    });

    it('ignores unknown grid values', () => {
      expect(dot('grid-cols-99')).toEqual({});
      expect(dot('col-span-13')).toEqual({});
      expect(dot('row-start-0')).toEqual({});
      expect(dot('auto-cols-banana')).toEqual({});
    });

    it('handles custom gridCols config', () => {
      createDotConfig({ theme: { gridCols: { '16': 'repeat(16, minmax(0, 1fr))' } } });
      expect(dot('grid-cols-16')).toEqual({
        gridTemplateColumns: 'repeat(16, minmax(0, 1fr))',
      });
      // default still works
      expect(dot('grid-cols-3')).toEqual({
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      });
    });

    it('handles dark: variant on grid tokens', () => {
      const result = dot('grid-cols-2 dark:grid-cols-4', { dark: true });
      expect(result).toEqual({
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      });
    });

    it('handles subgrid', () => {
      expect(dot('grid-cols-subgrid')).toEqual({ gridTemplateColumns: 'subgrid' });
      expect(dot('grid-rows-subgrid')).toEqual({ gridTemplateRows: 'subgrid' });
    });
  });

  describe('Phase 3a combined patterns', () => {
    it('handles modal overlay pattern', () => {
      const result = dot('fixed inset-0 bg-black opacity-50 z-50');
      expect(result).toEqual({
        position: 'fixed',
        top: '0px', right: '0px', bottom: '0px', left: '0px',
        backgroundColor: '#000000',
        opacity: '0.5',
        zIndex: '50',
      });
    });

    it('handles tooltip pattern', () => {
      const result = dot('absolute bottom-full left-1/2 mb-2');
      expect(result).toEqual({
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        marginBottom: '8px',
      });
    });

    it('handles grid card layout', () => {
      const result = dot('grid grid-cols-3 gap-4 p-6');
      expect(result).toEqual({
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '16px',
        padding: '24px',
      });
    });

    it('handles grid item with positioning', () => {
      const result = dot('relative col-span-2 row-span-2 p-4');
      expect(result).toEqual({
        position: 'relative',
        gridColumn: 'span 2 / span 2',
        gridRow: 'span 2 / span 2',
        padding: '16px',
      });
    });

    it('handles notification badge pattern', () => {
      const result = dot('absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5');
      expect(result).toEqual({
        position: 'absolute',
        top: '0px',
        right: '0px',
        backgroundColor: '#ca2c22',
        color: '#ffffff',
        borderRadius: '9999px',
        width: '20px',
        height: '20px',
      });
    });

    it('strictMode throws for unknown grid/positioning values', () => {
      createDotConfig({ strictMode: true });
      expect(() => dot('top-999')).toThrow('[dot] Unknown token');
      expect(() => dot('grid-cols-99')).toThrow('[dot] Unknown token');
      expect(() => dot('col-span-13')).toThrow('[dot] Unknown token');
    });

    it('strictMode does not throw on valid Phase 3a tokens', () => {
      createDotConfig({ strictMode: true });
      expect(() => dot('top-4 inset-0 grid-cols-3 col-span-2 grid-flow-row')).not.toThrow();
    });
  });

  describe('responsive variants', () => {
    it('ignores responsive tokens without breakpoint context', () => {
      expect(dot('p-4 md:p-8')).toEqual({ padding: '16px' });
      expect(dot('md:p-8')).toEqual({});
    });

    it('applies responsive overrides at matching breakpoint', () => {
      expect(dot('p-4 md:p-8', { breakpoint: 'md' })).toEqual({ padding: '32px' });
    });

    it('cascades lower breakpoints (mobile-first)', () => {
      // At lg: sm and md should also apply
      const result = dot('p-4 sm:p-6 md:p-8 lg:p-12', { breakpoint: 'lg' });
      expect(result).toEqual({ padding: '48px' }); // lg wins (last cascade)
    });

    it('does not apply higher breakpoints', () => {
      // At sm: md and lg should NOT apply
      const result = dot('p-4 sm:p-6 md:p-8 lg:p-12', { breakpoint: 'sm' });
      expect(result).toEqual({ padding: '24px' }); // sm wins
    });

    it('base only when no breakpoint option', () => {
      const result = dot('p-4 sm:p-6 md:p-8');
      expect(result).toEqual({ padding: '16px' });
    });

    it('handles all breakpoint levels', () => {
      expect(dot('sm:p-2', { breakpoint: 'sm' })).toEqual({ padding: '8px' });
      expect(dot('md:p-4', { breakpoint: 'md' })).toEqual({ padding: '16px' });
      expect(dot('lg:p-6', { breakpoint: 'lg' })).toEqual({ padding: '24px' });
      expect(dot('xl:p-8', { breakpoint: 'xl' })).toEqual({ padding: '32px' });
      expect(dot('2xl:p-12', { breakpoint: '2xl' })).toEqual({ padding: '48px' });
    });

    it('responsive with different properties', () => {
      const result = dot('p-4 md:p-8 hidden md:flex', { breakpoint: 'md' });
      expect(result).toEqual({
        padding: '32px',
        display: 'flex',
      });
    });

    it('responsive with non-overridden base properties', () => {
      const result = dot('p-4 bg-white md:p-8', { breakpoint: 'md' });
      expect(result).toEqual({
        padding: '32px',
        backgroundColor: '#ffffff',
      });
    });

    it('dark + responsive combined', () => {
      const result = dot('p-4 md:p-8 dark:bg-gray-900', { breakpoint: 'md', dark: true });
      expect(result).toEqual({
        padding: '32px',
        backgroundColor: '#121418',
      });
    });

    it('dark:md: multi-variant', () => {
      const result = dot('bg-white dark:bg-gray-800 dark:md:bg-gray-900', {
        breakpoint: 'md',
        dark: true,
      });
      expect(result).toEqual({ backgroundColor: '#121418' });
    });

    it('dark:md: without dark mode ignores dark tokens', () => {
      const result = dot('bg-white dark:md:bg-gray-900', { breakpoint: 'md' });
      expect(result).toEqual({ backgroundColor: '#ffffff' });
    });

    it('dark:md: without breakpoint ignores responsive tokens', () => {
      const result = dot('bg-white dark:md:bg-gray-900', { dark: true });
      expect(result).toEqual({ backgroundColor: '#ffffff' });
    });

    it('responsive cascade order is correct regardless of input order', () => {
      // lg:p-12 appears before sm:p-6 in input, but sm should cascade before lg
      const result = dot('p-4 lg:p-12 sm:p-6', { breakpoint: 'lg' });
      expect(result).toEqual({ padding: '48px' }); // lg wins
    });

    it('partial cascade: sm has value, md does not', () => {
      const result = dot('p-4 sm:p-6 lg:p-12', { breakpoint: 'md' });
      // At md: base(p-4) → sm(p-6) applied, md nothing, lg skipped
      expect(result).toEqual({ padding: '24px' });
    });

    it('responsive grid layout', () => {
      const result = dot('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', {
        breakpoint: 'lg',
      });
      expect(result).toEqual({
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
      });
    });

    it('responsive positioning', () => {
      const result = dot('relative md:absolute md:top-0 md:left-0', { breakpoint: 'md' });
      expect(result).toEqual({
        position: 'absolute',
        top: '0px',
        left: '0px',
      });
    });

    it('responsive hidden/flex pattern', () => {
      expect(dot('hidden md:flex', { breakpoint: 'sm' })).toEqual({ display: 'none' });
      expect(dot('hidden md:flex', { breakpoint: 'md' })).toEqual({ display: 'flex' });
      expect(dot('hidden md:flex', { breakpoint: 'lg' })).toEqual({ display: 'flex' });
    });

    it('caches responsive results separately', () => {
      const base = dot('p-4 md:p-8');
      const md = dot('p-4 md:p-8', { breakpoint: 'md' });
      expect(base).toEqual({ padding: '16px' });
      expect(md).toEqual({ padding: '32px' });
      expect(base).not.toBe(md);
    });

    it('hover: variant still skipped', () => {
      const result = dot('p-4 hover:p-8 md:p-6', { breakpoint: 'md' });
      expect(result).toEqual({ padding: '24px' });
    });

    it('unknown breakpoint returns base only', () => {
      const result = dot('p-4 md:p-8', { breakpoint: 'xxl' as string });
      expect(result).toEqual({ padding: '16px' });
    });

    it('responsive with negative values', () => {
      const result = dot('-mt-4 md:-mt-8', { breakpoint: 'md' });
      expect(result).toEqual({ marginTop: '-32px' });
    });

    it('full responsive card pattern', () => {
      const result = dot(
        'p-4 md:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
        { breakpoint: 'lg' },
      );
      expect(result).toEqual({
        padding: '32px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '24px',
      });
    });
  });
});
