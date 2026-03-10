import { describe, it, expect, beforeEach } from 'vitest';
import { dot, createDotConfig, semanticVars, dotExplain } from '../../index';
import { lookupColor } from '../../resolvers/color';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('semantic colors — lookupColor priority', () => {
  const { colors, semanticColors } = config.tokens;

  it('string in colors wins over semantic (user override)', () => {
    const customColors = { ...colors, ring: '#ff0000' };
    expect(lookupColor('ring', customColors, semanticColors)).toBe('#ff0000');
  });

  it('semantic wins over palette object', () => {
    expect(lookupColor('primary', colors, semanticColors)).toBe('var(--color-primary)');
  });

  it('semantic wins for secondary too', () => {
    expect(lookupColor('secondary', colors, semanticColors)).toBe('var(--color-secondary)');
  });

  it('without semanticColors param, palette shade 500 is returned', () => {
    expect(lookupColor('primary', colors)).toBe('#3b82f6');
  });

  it('shade lookup bypasses semantic', () => {
    expect(lookupColor('primary-500', colors, semanticColors)).toBe('#3b82f6');
    expect(lookupColor('primary-300', colors, semanticColors)).toBe('#93c5fd');
  });

  it('semantic colors without palette entry work', () => {
    expect(lookupColor('muted', colors, semanticColors)).toBe('var(--color-muted)');
    expect(lookupColor('muted-foreground', colors, semanticColors)).toBe('var(--color-muted-foreground)');
    expect(lookupColor('foreground', colors, semanticColors)).toBe('var(--color-foreground)');
    expect(lookupColor('background', colors, semanticColors)).toBe('var(--color-background)');
  });

  it('special colors still work', () => {
    expect(lookupColor('white', colors, semanticColors)).toBe('#ffffff');
    expect(lookupColor('black', colors, semanticColors)).toBe('#000000');
    expect(lookupColor('transparent', colors, semanticColors)).toBe('transparent');
  });

  it('non-semantic palette colors unaffected', () => {
    expect(lookupColor('red', colors, semanticColors)).toBe('#ef4444');
    expect(lookupColor('blue-700', colors, semanticColors)).toBe('#1d4ed8');
  });
});

describe('semantic colors — dot() integration', () => {
  beforeEach(() => {
    createDotConfig(); // reset to defaults
  });

  // bg-* semantic
  it('bg-primary → CSS variable', () => {
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--color-primary)' });
  });

  it('bg-secondary → CSS variable', () => {
    expect(dot('bg-secondary')).toEqual({ backgroundColor: 'var(--color-secondary)' });
  });

  it('bg-muted → CSS variable', () => {
    expect(dot('bg-muted')).toEqual({ backgroundColor: 'var(--color-muted)' });
  });

  it('bg-destructive → CSS variable', () => {
    expect(dot('bg-destructive')).toEqual({ backgroundColor: 'var(--color-destructive)' });
  });

  it('bg-accent → CSS variable', () => {
    expect(dot('bg-accent')).toEqual({ backgroundColor: 'var(--color-accent)' });
  });

  it('bg-background → CSS variable', () => {
    expect(dot('bg-background')).toEqual({ backgroundColor: 'var(--color-background)' });
  });

  it('bg-card → CSS variable', () => {
    expect(dot('bg-card')).toEqual({ backgroundColor: 'var(--color-card)' });
  });

  it('bg-popover → CSS variable', () => {
    expect(dot('bg-popover')).toEqual({ backgroundColor: 'var(--color-popover)' });
  });

  // text-* semantic
  it('text-primary → CSS variable', () => {
    expect(dot('text-primary')).toEqual({ color: 'var(--color-primary)' });
  });

  it('text-foreground → CSS variable', () => {
    expect(dot('text-foreground')).toEqual({ color: 'var(--color-foreground)' });
  });

  it('text-muted-foreground → CSS variable', () => {
    expect(dot('text-muted-foreground')).toEqual({ color: 'var(--color-muted-foreground)' });
  });

  it('text-primary-foreground → CSS variable', () => {
    expect(dot('text-primary-foreground')).toEqual({ color: 'var(--color-primary-foreground)' });
  });

  it('text-destructive → CSS variable', () => {
    expect(dot('text-destructive')).toEqual({ color: 'var(--color-destructive)' });
  });

  it('text-destructive-foreground → CSS variable', () => {
    expect(dot('text-destructive-foreground')).toEqual({ color: 'var(--color-destructive-foreground)' });
  });

  it('text-accent-foreground → CSS variable', () => {
    expect(dot('text-accent-foreground')).toEqual({ color: 'var(--color-accent-foreground)' });
  });

  // border-* semantic
  it('border-border → CSS variable', () => {
    expect(dot('border-border')).toEqual({ borderColor: 'var(--color-border)' });
  });

  it('border-input → CSS variable', () => {
    expect(dot('border-input')).toEqual({ borderColor: 'var(--color-input)' });
  });

  // Shade access still works
  it('bg-primary-500 → palette hex', () => {
    expect(dot('bg-primary-500')).toEqual({ backgroundColor: '#3b82f6' });
  });

  it('text-primary-300 → palette hex', () => {
    expect(dot('text-primary-300')).toEqual({ color: '#93c5fd' });
  });

  it('bg-secondary-200 → palette hex', () => {
    expect(dot('bg-secondary-200')).toEqual({ backgroundColor: '#e2e8f0' });
  });

  // Non-semantic palette unaffected
  it('bg-red → palette 500 (no semantic)', () => {
    expect(dot('bg-red')).toEqual({ backgroundColor: '#ef4444' });
  });

  it('text-blue-700 → palette hex', () => {
    expect(dot('text-blue-700')).toEqual({ color: '#1d4ed8' });
  });

  // Opacity with semantic
  it('bg-primary/50 → color-mix', () => {
    const result = dot('bg-primary/50');
    expect(result.backgroundColor).toBe('color-mix(in srgb, var(--color-primary) 50%, transparent)');
  });

  it('text-muted-foreground/80 → color-mix', () => {
    const result = dot('text-muted-foreground/80');
    expect(result.color).toBe('color-mix(in srgb, var(--color-muted-foreground) 80%, transparent)');
  });

  it('bg-red-500/50 → rgb (hex-based opacity)', () => {
    const result = dot('bg-red-500/50');
    expect((result.backgroundColor as string)).toContain('rgb');
  });

  // Ring uses semantic ring color
  it('ring-2 uses semantic ring color', () => {
    const result = dot('ring-2');
    expect(result.boxShadow).toContain('var(--color-ring)');
  });
});

describe('semantic colors — user config override', () => {
  it('user theme.semanticColors extends defaults', () => {
    createDotConfig({
      theme: {
        semanticColors: {
          'sidebar': 'var(--color-sidebar)',
        },
      },
    });
    expect(dot('bg-sidebar')).toEqual({ backgroundColor: 'var(--color-sidebar)' });
    // Default semantic still works
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--color-primary)' });
  });

  it('user theme.semanticColors can override defaults', () => {
    createDotConfig({
      theme: {
        semanticColors: {
          'primary': 'var(--my-brand-color)',
        },
      },
    });
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--my-brand-color)' });
  });

  it('user theme.colors string overrides semantic', () => {
    createDotConfig({
      theme: {
        colors: {
          ring: '#ff0000',
        },
      },
    });
    const result = dot('ring-2');
    expect(result.boxShadow).toContain('#ff0000');
  });

  it('gradient from-primary uses semantic', () => {
    createDotConfig();
    const result = dot('bg-gradient-to-r from-primary to-secondary');
    expect(result.backgroundImage).toContain('var(--color-primary)');
    expect(result.backgroundImage).toContain('var(--color-secondary)');
  });
});

describe('semantic colors — string[] shorthand', () => {
  it('array auto-maps to var(--color-{name})', () => {
    createDotConfig({
      theme: {
        semanticColors: ['sidebar', 'sidebar-foreground', 'chart-1'],
      },
    });
    expect(dot('bg-sidebar')).toEqual({ backgroundColor: 'var(--color-sidebar)' });
    expect(dot('text-sidebar-foreground')).toEqual({ color: 'var(--color-sidebar-foreground)' });
    expect(dot('bg-chart-1')).toEqual({ backgroundColor: 'var(--color-chart-1)' });
    // built-in defaults still work
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--color-primary)' });
  });

  it('custom prefix via semanticPrefix', () => {
    createDotConfig({
      theme: {
        semanticColors: ['brand', 'brand-secondary'],
        semanticPrefix: '--theme',
      },
    });
    expect(dot('bg-brand')).toEqual({ backgroundColor: 'var(--theme-brand)' });
    expect(dot('text-brand-secondary')).toEqual({ color: 'var(--theme-brand-secondary)' });
    // built-in defaults still use --color prefix
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--color-primary)' });
  });
});

describe('semantic colors — semanticVars helper', () => {
  it('generates var mappings from names', () => {
    const result = semanticVars('sidebar', 'chart-1', 'chart-2');
    expect(result).toEqual({
      'sidebar': 'var(--color-sidebar)',
      'chart-1': 'var(--color-chart-1)',
      'chart-2': 'var(--color-chart-2)',
    });
  });

  it('supports custom prefix', () => {
    const result = semanticVars({ prefix: '--theme' }, 'brand', 'accent');
    expect(result).toEqual({
      'brand': 'var(--theme-brand)',
      'accent': 'var(--theme-accent)',
    });
  });

  it('works with createDotConfig', () => {
    createDotConfig({
      theme: {
        semanticColors: {
          ...semanticVars('sidebar', 'sidebar-foreground'),
          'custom': 'var(--my-custom)',
        },
      },
    });
    expect(dot('bg-sidebar')).toEqual({ backgroundColor: 'var(--color-sidebar)' });
    expect(dot('bg-custom')).toEqual({ backgroundColor: 'var(--my-custom)' });
  });
});

describe('semantic colors — composition', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('multiple semantic tokens compose correctly', () => {
    const result = dot('bg-background text-foreground border-border');
    expect(result).toEqual({
      backgroundColor: 'var(--color-background)',
      color: 'var(--color-foreground)',
      borderColor: 'var(--color-border)',
    });
  });

  it('semantic + utility tokens compose correctly', () => {
    const result = dot('p-4 bg-primary text-primary-foreground rounded-lg');
    expect(result).toEqual({
      padding: '16px',
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-primary-foreground)',
      borderRadius: '8px',
    });
  });
});

describe('semantic colors — non-web targets', () => {
  beforeEach(() => {
    createDotConfig();
  });

  it('native target drops CSS variable color values', () => {
    const result = dot('bg-primary text-primary', { target: 'native' });
    // CSS variable values should be dropped — not present in output
    expect(result).not.toHaveProperty('backgroundColor');
    expect(result).not.toHaveProperty('color');
  });

  it('native target keeps palette shade colors', () => {
    const result = dot('bg-primary-500 text-red-600', { target: 'native' });
    expect(result).toHaveProperty('backgroundColor');
    expect(result).toHaveProperty('color');
  });

  it('native target ring-2 drops CSS variable ring color', () => {
    const result = dot('ring-2', { target: 'native' });
    // boxShadow with CSS variable ring color → native shadow parsing may fail gracefully
    // The key point: no crash, and the value doesn't leak as a raw var() string
    const hasVarLeak = Object.values(result).some(
      v => typeof v === 'string' && v.includes('var(')
    );
    expect(hasVarLeak).toBe(false);
  });

  it('flutter target drops CSS variable color values', () => {
    const result = dot('bg-primary text-muted-foreground', { target: 'flutter' }) as Record<string, unknown>;
    // decoration.color and textStyle.color should not contain var()
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const textStyle = result.textStyle as Record<string, unknown> | undefined;
    const hasVarLeak = [decoration?.color, textStyle?.color].some(
      v => typeof v === 'string' && String(v).includes('var(')
    );
    expect(hasVarLeak).toBe(false);
  });

  it('flutter target keeps palette shade colors', () => {
    const result = dot('bg-red-500 text-blue-700', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const textStyle = result.textStyle as Record<string, unknown> | undefined;
    expect(decoration?.color).toBe('#ef4444');
    expect(textStyle?.color).toBe('#1d4ed8');
  });

  it('dotExplain reports CSS variable values as unsupported on native', () => {
    const { report } = dotExplain('bg-primary text-muted-foreground p-4', { target: 'native' });
    // CSS var properties should be in dropped list
    expect(report._dropped).toContain('backgroundColor');
    expect(report._dropped).toContain('color');
    // Non-var properties should NOT be dropped
    expect(report._dropped).not.toContain('padding');
  });

  // color-mix() wrapping var() — must not leak to non-web targets
  it('native target drops color-mix() with var() (opacity on semantic)', () => {
    const result = dot('bg-primary/50', { target: 'native' });
    const hasVarLeak = Object.values(result).some(
      v => typeof v === 'string' && v.includes('var(')
    );
    expect(hasVarLeak).toBe(false);
    expect(result).not.toHaveProperty('backgroundColor');
  });

  it('flutter target drops color-mix() with var() (opacity on semantic)', () => {
    const result = dot('bg-primary/50 text-muted-foreground/80', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const textStyle = result.textStyle as Record<string, unknown> | undefined;
    const hasVarLeak = [decoration?.color, textStyle?.color].some(
      v => typeof v === 'string' && String(v).includes('var(')
    );
    expect(hasVarLeak).toBe(false);
  });

  it('native target drops gradient with semantic color stops', () => {
    const result = dot('bg-gradient-to-r from-primary to-secondary', { target: 'native' });
    const hasVarLeak = Object.values(result).some(
      v => typeof v === 'string' && v.includes('var(')
    );
    expect(hasVarLeak).toBe(false);
  });

  it('flutter target drops gradient with semantic color stops', () => {
    const result = dot('bg-gradient-to-r from-primary to-secondary', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    // gradient should not contain var() colors
    const gradient = decoration?.gradient as Record<string, unknown> | undefined;
    expect(gradient).toBeUndefined();
  });

  it('dotExplain reports color-mix(var()) as unsupported on native', () => {
    const { report } = dotExplain('bg-primary/50 p-4', { target: 'native' });
    expect(report._dropped).toContain('backgroundColor');
    expect(report._dropped).not.toContain('padding');
  });
});
