import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, clearDotCache } from '../../index';

describe('dot() with target: native — integration', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  // -----------------------------------------------------------------------
  // Basic conversion
  // -----------------------------------------------------------------------
  it('converts spacing to numbers', () => {
    const result = dot('p-4 m-2', { target: 'native' });
    expect(result).toEqual({ padding: 16, margin: 8 });
  });

  it('converts directional spacing', () => {
    const result = dot('px-4 py-2', { target: 'native' });
    expect(result).toEqual({
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 8,
      paddingBottom: 8,
    });
  });

  it('resolves colors (passthrough)', () => {
    const result = dot('bg-primary-500 text-white', { target: 'native' });
    expect(result).toEqual({
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    });
  });

  it('resolves typography', () => {
    const result = dot('text-sm font-bold', { target: 'native' });
    expect(result).toHaveProperty('fontSize', 14);
    expect(result).toHaveProperty('fontWeight', '700');
  });

  it('resolves layout (flex)', () => {
    const result = dot('flex items-center justify-between', {
      target: 'native',
    });
    expect(result).toEqual({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });

  it('hides elements', () => {
    expect(dot('hidden', { target: 'native' })).toEqual({
      display: 'none',
    });
  });

  it('resolves sizing', () => {
    const result = dot('w-full h-12', { target: 'native' });
    expect(result).toEqual({ width: '100%', height: 48 });
  });

  it('resolves border-radius', () => {
    const result = dot('rounded-lg', { target: 'native' });
    expect(result).toHaveProperty('borderRadius', 8);
  });

  it('resolves z-index as number', () => {
    const result = dot('z-10', { target: 'native' });
    expect(result).toEqual({ zIndex: 10 });
  });

  it('resolves opacity as number', () => {
    const result = dot('opacity-50', { target: 'native' });
    expect(result).toEqual({ opacity: 0.5 });
  });

  // -----------------------------------------------------------------------
  // Transform
  // -----------------------------------------------------------------------
  it('converts rotate to RN transform array', () => {
    const result = dot('rotate-45', { target: 'native' });
    expect(result).toEqual({
      transform: [{ rotate: '45deg' }],
    });
  });

  it('converts scale to RN transform array', () => {
    const result = dot('scale-110', { target: 'native' });
    expect(result).toEqual({
      transform: [{ scale: 1.1 }],
    });
  });

  it('accumulates multiple transforms', () => {
    const result = dot('rotate-45 scale-110', { target: 'native' });
    // dot() merges transform strings before adapter converts
    expect(result).toHaveProperty('transform');
    const transforms = result.transform as Array<Record<string, unknown>>;
    expect(transforms).toContainEqual({ rotate: '45deg' });
    expect(transforms).toContainEqual({ scale: 1.1 });
  });

  // -----------------------------------------------------------------------
  // Shadow
  // -----------------------------------------------------------------------
  it('converts shadow to RN properties', () => {
    const result = dot('shadow-sm', { target: 'native' });
    expect(result).toHaveProperty('shadowColor');
    expect(result).toHaveProperty('shadowOffset');
    expect(result).toHaveProperty('shadowOpacity');
    expect(result).toHaveProperty('shadowRadius');
    expect(result).toHaveProperty('elevation');
    expect(result).not.toHaveProperty('boxShadow');
  });

  it('shadow-none produces no shadow props', () => {
    const result = dot('shadow-none', { target: 'native' });
    expect(result).not.toHaveProperty('shadowColor');
    expect(result).not.toHaveProperty('boxShadow');
  });

  // -----------------------------------------------------------------------
  // Unsupported stripped
  // -----------------------------------------------------------------------
  it('strips transition properties', () => {
    const result = dot('transition-all duration-300 ease-in-out', {
      target: 'native',
    });
    expect(result).not.toHaveProperty('transitionProperty');
    expect(result).not.toHaveProperty('transitionDuration');
    expect(result).not.toHaveProperty('transitionTimingFunction');
  });

  it('strips backdrop-blur', () => {
    const result = dot('backdrop-blur-sm', { target: 'native' });
    expect(result).not.toHaveProperty('backdropFilter');
    expect(result).not.toHaveProperty('WebkitBackdropFilter');
  });

  // -----------------------------------------------------------------------
  // Dark + native
  // -----------------------------------------------------------------------
  it('applies dark mode with native target', () => {
    const result = dot('bg-white dark:bg-gray-900', {
      dark: true,
      target: 'native',
    });
    expect(result).toHaveProperty('backgroundColor', '#111827');
  });

  it('ignores dark tokens in light mode', () => {
    const result = dot('bg-white dark:bg-gray-900', {
      dark: false,
      target: 'native',
    });
    expect(result).toHaveProperty('backgroundColor', '#ffffff');
  });

  // -----------------------------------------------------------------------
  // Responsive + native
  // -----------------------------------------------------------------------
  it('applies responsive cascade with native target', () => {
    const result = dot('p-4 md:p-8', {
      breakpoint: 'md',
      target: 'native',
    });
    expect(result).toEqual({ padding: 32 });
  });

  it('dark + responsive + native combined', () => {
    const result = dot('p-4 md:p-8 dark:bg-gray-900', {
      dark: true,
      breakpoint: 'md',
      target: 'native',
    });
    expect(result.padding).toBe(32);
    expect(result.backgroundColor).toBe('#111827');
  });

  // -----------------------------------------------------------------------
  // Cache separation
  // -----------------------------------------------------------------------
  it('caches web and native separately', () => {
    const webResult = dot('p-4');
    const nativeResult = dot('p-4', { target: 'native' });

    expect(webResult).toEqual({ padding: '16px' });
    expect(nativeResult).toEqual({ padding: 16 });

    // Second call (from cache) should return same results
    expect(dot('p-4')).toEqual({ padding: '16px' });
    expect(dot('p-4', { target: 'native' })).toEqual({ padding: 16 });
  });

  it('does not mix dark+native and dark+web caches', () => {
    const webDark = dot('bg-white dark:bg-gray-900', { dark: true });
    const nativeDark = dot('bg-white dark:bg-gray-900', {
      dark: true,
      target: 'native',
    });

    expect(webDark).toEqual({ backgroundColor: '#111827' });
    expect(nativeDark).toEqual({ backgroundColor: '#111827' });
  });

  // -----------------------------------------------------------------------
  // Config-level runtime
  // -----------------------------------------------------------------------
  it('respects config-level runtime: native', () => {
    createDotConfig({ runtime: 'native' });
    const result = dot('p-4');
    expect(result).toEqual({ padding: 16 });
  });

  it('options.target overrides config runtime', () => {
    createDotConfig({ runtime: 'native' });
    const result = dot('p-4', { target: 'web' });
    expect(result).toEqual({ padding: '16px' });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------
  it('returns empty object for empty input', () => {
    expect(dot('', { target: 'native' })).toEqual({});
    expect(dot('   ', { target: 'native' })).toEqual({});
  });

  it('negative spacing converts correctly', () => {
    const result = dot('-m-4', { target: 'native' });
    expect(result).toEqual({ margin: -16 });
  });

  it('border with arbitrary color does not set borderWidth to string', () => {
    const result = dot('border border-[#dadce0]', { target: 'native' });
    expect(result.borderWidth).toBe(1);
    expect(result.borderColor).toBe('#dadce0');
  });

  it('color shade tokens work on native', () => {
    const result = dot('bg-cyan-500 text-red-300', { target: 'native' });
    expect(result).toEqual({
      backgroundColor: '#06b6d4',
      color: '#fca5a5',
    });
  });
});
