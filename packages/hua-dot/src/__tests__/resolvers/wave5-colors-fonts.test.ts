import { describe, it, expect } from 'vitest';
import { resolveColor, lookupColor } from '../../resolvers/color';
import { resolveTypography } from '../../resolvers/typography';
import { dot } from '../../index';
import { resolveConfig } from '../../config';

const config = resolveConfig();

describe('Wave 5: Extended color palettes', () => {
  const newPalettes = [
    'slate', 'zinc', 'neutral', 'stone',
    'amber', 'lime', 'grass', 'green',
    'emerald', 'teal', 'cyan', 'indigo', 'violet',
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

  it('resolves bg-teal-500', () => {
    expect(resolveColor('bg', 'teal-500', config)).toEqual({ backgroundColor: '#008284' });
  });

  it('resolves text-teal-700', () => {
    expect(resolveColor('text', 'teal-700', config)).toEqual({ color: '#004a4b' });
  });

  it('resolves bg-emerald-400', () => {
    expect(resolveColor('bg', 'emerald-400', config)).toEqual({ backgroundColor: '#00a389' });
  });

  it('resolves text-indigo-600', () => {
    expect(resolveColor('text', 'indigo-600', config)).toEqual({ color: '#1e54a8' });
  });

  it('resolves bg-violet-500', () => {
    expect(resolveColor('bg', 'violet-500', config)).toEqual({ backgroundColor: '#635bd9' });
  });

  it('resolves border-rose-300', () => {
    expect(resolveColor('border', 'rose-300', config)).toEqual({ borderColor: '#f47b94' });
  });

  it('resolves bg-amber-200', () => {
    expect(resolveColor('bg', 'amber-200', config)).toEqual({ backgroundColor: '#e7bb82' });
  });

  it('resolves text-green-500', () => {
    expect(resolveColor('text', 'green-500', config)).toEqual({ color: '#00874c' });
  });

  it('resolves bg-cyan-100', () => {
    expect(resolveColor('bg', 'cyan-100', config)).toEqual({ backgroundColor: '#c0e8f6' });
  });

  it('resolves text-fuchsia-400', () => {
    expect(resolveColor('text', 'fuchsia-400', config)).toEqual({ color: '#bf5dcb' });
  });

  it('resolves bg-lime-300', () => {
    expect(resolveColor('bg', 'lime-300', config)).toEqual({ backgroundColor: '#a9b035' });
  });

  it('resolves bg-slate-800', () => {
    expect(resolveColor('bg', 'slate-800', config)).toEqual({ backgroundColor: '#1e2b30' });
  });

  it('resolves text-zinc-500', () => {
    expect(resolveColor('text', 'zinc-500', config)).toEqual({ color: '#6c7276' });
  });

  it('resolves bg-neutral-100', () => {
    expect(resolveColor('bg', 'neutral-100', config)).toEqual({ backgroundColor: '#e1e0e0' });
  });

  it('resolves border-stone-400', () => {
    expect(resolveColor('border', 'stone-400', config)).toEqual({ borderColor: '#948985' });
  });

  it('950 shade works', () => {
    expect(lookupColor('teal-950', config.tokens.colors)).toBe('#000d0e');
    expect(lookupColor('rose-950', config.tokens.colors)).toBe('#180307');
  });

  it('existing palettes still work', () => {
    expect(lookupColor('red-500', config.tokens.colors)).toBe('#ca2c22');
    expect(lookupColor('blue-700', config.tokens.colors)).toBe('#004565');
    expect(lookupColor('primary-500', config.tokens.colors)).toBe('#2b6cd6');
  });

  it('dot() resolves new colors end-to-end', () => {
    expect(dot('bg-teal-500')).toEqual({ backgroundColor: '#008284' });
    expect(dot('text-indigo-300')).toEqual({ color: '#73a6ff' });
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
    const result = dot('font-mono text-sm text-teal-500');
    expect(result).toHaveProperty('fontFamily');
    expect(result).toHaveProperty('fontSize', '14px');
    expect(result).toHaveProperty('color', '#008284');
  });
});
