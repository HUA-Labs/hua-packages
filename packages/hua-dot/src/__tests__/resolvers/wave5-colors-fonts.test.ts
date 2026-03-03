import { describe, it, expect } from 'vitest';
import { resolveColor, lookupColor } from '../../resolvers/color';
import { resolveTypography } from '../../resolvers/typography';
import { dot } from '../../index';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('Wave 5: Extended color palettes', () => {
  const newPalettes = [
    'slate', 'zinc', 'neutral', 'stone',
    'amber', 'lime', 'emerald', 'teal',
    'cyan', 'sky', 'indigo', 'violet',
    'fuchsia', 'rose',
  ];

  it.each(newPalettes)('%s palette has 50-950 shades', (name) => {
    const palette = config.tokens.colors[name];
    expect(palette).toBeDefined();
    expect(typeof palette).toBe('object');
    for (const shade of ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']) {
      expect((palette as Record<string, string>)[shade]).toBeDefined();
    }
  });

  it('resolves bg-cyan-500', () => {
    expect(resolveColor('bg', 'cyan-500', config)).toEqual({ backgroundColor: '#06b6d4' });
  });

  it('resolves text-cyan-700', () => {
    expect(resolveColor('text', 'cyan-700', config)).toEqual({ color: '#0e7490' });
  });

  it('resolves bg-teal-400', () => {
    expect(resolveColor('bg', 'teal-400', config)).toEqual({ backgroundColor: '#2dd4bf' });
  });

  it('resolves text-indigo-600', () => {
    expect(resolveColor('text', 'indigo-600', config)).toEqual({ color: '#4f46e5' });
  });

  it('resolves bg-violet-500', () => {
    expect(resolveColor('bg', 'violet-500', config)).toEqual({ backgroundColor: '#8b5cf6' });
  });

  it('resolves border-rose-300', () => {
    expect(resolveColor('border', 'rose-300', config)).toEqual({ borderColor: '#fda4af' });
  });

  it('resolves bg-amber-200', () => {
    expect(resolveColor('bg', 'amber-200', config)).toEqual({ backgroundColor: '#fde68a' });
  });

  it('resolves text-emerald-500', () => {
    expect(resolveColor('text', 'emerald-500', config)).toEqual({ color: '#10b981' });
  });

  it('resolves bg-sky-100', () => {
    expect(resolveColor('bg', 'sky-100', config)).toEqual({ backgroundColor: '#e0f2fe' });
  });

  it('resolves text-fuchsia-400', () => {
    expect(resolveColor('text', 'fuchsia-400', config)).toEqual({ color: '#e879f9' });
  });

  it('resolves bg-lime-300', () => {
    expect(resolveColor('bg', 'lime-300', config)).toEqual({ backgroundColor: '#bef264' });
  });

  it('resolves bg-slate-800', () => {
    expect(resolveColor('bg', 'slate-800', config)).toEqual({ backgroundColor: '#1e293b' });
  });

  it('resolves text-zinc-500', () => {
    expect(resolveColor('text', 'zinc-500', config)).toEqual({ color: '#71717a' });
  });

  it('resolves bg-neutral-100', () => {
    expect(resolveColor('bg', 'neutral-100', config)).toEqual({ backgroundColor: '#f5f5f5' });
  });

  it('resolves border-stone-400', () => {
    expect(resolveColor('border', 'stone-400', config)).toEqual({ borderColor: '#a8a29e' });
  });

  it('950 shade works', () => {
    expect(lookupColor('cyan-950', config.tokens.colors)).toBe('#083344');
    expect(lookupColor('rose-950', config.tokens.colors)).toBe('#4c0519');
  });

  it('existing palettes still work', () => {
    expect(lookupColor('red-500', config.tokens.colors)).toBe('#ef4444');
    expect(lookupColor('blue-700', config.tokens.colors)).toBe('#1d4ed8');
    expect(lookupColor('primary-500', config.tokens.colors)).toBe('#3b82f6');
  });

  it('dot() resolves new colors end-to-end', () => {
    expect(dot('bg-cyan-500')).toEqual({ backgroundColor: '#06b6d4' });
    expect(dot('text-indigo-300')).toEqual({ color: '#a5b4fc' });
  });
});

describe('Wave 5: Font family tokens', () => {
  it('resolves font-sans', () => {
    const result = resolveTypography('font', 'sans', config);
    expect(result).toHaveProperty('fontFamily');
    expect(result.fontFamily).toContain('sans-serif');
  });

  it('resolves font-serif', () => {
    const result = resolveTypography('font', 'serif', config);
    expect(result).toHaveProperty('fontFamily');
    expect(result.fontFamily).toContain('serif');
  });

  it('resolves font-mono', () => {
    const result = resolveTypography('font', 'mono', config);
    expect(result).toHaveProperty('fontFamily');
    expect(result.fontFamily).toContain('monospace');
  });

  it('font weights still work', () => {
    expect(resolveTypography('font', 'bold', config)).toEqual({ fontWeight: '700' });
    expect(resolveTypography('font', 'semibold', config)).toEqual({ fontWeight: '600' });
  });

  it('font weight takes priority over family (no collision in practice)', () => {
    // 'normal' is a fontWeight — should resolve as weight, not family
    expect(resolveTypography('font', 'normal', config)).toEqual({ fontWeight: '400' });
  });

  it('dot() resolves font-mono end-to-end', () => {
    const result = dot('font-mono');
    expect(result).toHaveProperty('fontFamily');
    expect((result as Record<string, string>).fontFamily).toContain('monospace');
  });

  it('dot() combines font-family with other tokens', () => {
    const result = dot('font-mono text-sm text-cyan-500');
    expect(result).toHaveProperty('fontFamily');
    expect(result).toHaveProperty('fontSize', '14px');
    expect(result).toHaveProperty('color', '#06b6d4');
  });
});
