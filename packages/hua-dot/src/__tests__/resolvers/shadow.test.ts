import { describe, it, expect, vi } from 'vitest';
import { resolveShadow } from '../../resolvers/shadow';
import { resolveConfig } from '../../config';
import { dot, dotExplain } from '../../index';
import { parseBoxShadow, _resetNativeWarnings } from '../../adapters/native';

const config = resolveConfig();

describe('resolveShadow (resolver unit)', () => {
  it('resolves shadow-sm to internal layer key', () => {
    expect(resolveShadow('shadow', 'sm', config)).toEqual({
      __dot_shadowLayer: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('resolves bare shadow (DEFAULT key)', () => {
    expect(resolveShadow('shadow', '', config)).toEqual({
      __dot_shadowLayer: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    });
  });

  it('resolves shadow-md', () => {
    const result = resolveShadow('shadow', 'md', config);
    expect(result).toHaveProperty('__dot_shadowLayer');
  });

  it('resolves shadow-inner (contains inset)', () => {
    const result = resolveShadow('shadow', 'inner', config);
    expect(result).toHaveProperty('__dot_shadowLayer');
    expect(result.__dot_shadowLayer).toContain('inset');
  });

  it('resolves shadow-none', () => {
    expect(resolveShadow('shadow', 'none', config)).toEqual({ __dot_shadowLayer: 'none' });
  });

  it('returns empty for unknown shadow value', () => {
    expect(resolveShadow('shadow', 'unknown', config)).toEqual({});
  });
});

describe('shadow via dot() (integration)', () => {
  it('shadow-sm outputs boxShadow', () => {
    expect(dot('shadow-sm')).toEqual({
      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    });
  });

  it('shadow-lg outputs boxShadow', () => {
    const result = dot('shadow-lg');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-xl outputs boxShadow', () => {
    const result = dot('shadow-xl');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-2xl outputs boxShadow', () => {
    const result = dot('shadow-2xl');
    expect(result).toHaveProperty('boxShadow');
  });

  it('shadow-none outputs boxShadow: none', () => {
    expect(dot('shadow-none')).toEqual({ boxShadow: 'none' });
  });
});

describe('shadow + ring composition', () => {
  it('shadow-lg + ring-2 combines into single boxShadow', () => {
    const result = dot('shadow-lg ring-2');
    expect(result).toHaveProperty('boxShadow');
    // Ring comes first, shadow second (Tailwind convention)
    expect(result.boxShadow).toContain('0 0 0 2px');
    expect((result.boxShadow as string).split(', ').length).toBeGreaterThanOrEqual(2);
  });

  it('ring-2 alone outputs boxShadow', () => {
    const result = dot('ring-2');
    expect(result).toEqual({ boxShadow: '0 0 0 2px var(--color-ring)' });
  });

  it('shadow-sm + ring-4 both present', () => {
    const result = dot('shadow-sm ring-4');
    const parts = (result.boxShadow as string);
    expect(parts).toContain('0 0 0 4px'); // ring
    expect(parts).toContain('0 1px 2px'); // shadow
  });

  it('ring overrides previous ring (same layer)', () => {
    const result = dot('ring-2 ring-4');
    // Last ring wins within ring layer
    expect(result.boxShadow).toBe('0 0 0 4px var(--color-ring)');
  });

  it('shadow overrides previous shadow (same layer)', () => {
    const result = dot('shadow-lg shadow-sm');
    // Last shadow wins within shadow layer
    expect(result.boxShadow).toBe('0 1px 2px 0 rgb(0 0 0 / 0.05)');
  });
});

describe('shadow native approximation warnings', () => {
  beforeEach(() => _resetNativeWarnings());

  it('warns about inset shadows when warnFn provided', () => {
    const warnings: string[] = [];
    const warnFn = (prop: string, reason: string) => warnings.push(`${prop}: ${reason}`);
    parseBoxShadow('inset 0 2px 4px 0 rgb(0 0 0 / 0.05)', warnFn);
    expect(warnings).toContain('boxShadow: inset shadows unsupported on RN');
  });

  it('warns about multi-layer shadows', () => {
    const warnings: string[] = [];
    const warnFn = (prop: string, reason: string) => warnings.push(`${prop}: ${reason}`);
    parseBoxShadow('0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', warnFn);
    expect(warnings.some(w => w.includes('layers → 1'))).toBe(true);
  });

  it('warns about spread radius', () => {
    const warnings: string[] = [];
    const warnFn = (prop: string, reason: string) => warnings.push(`${prop}: ${reason}`);
    parseBoxShadow('0 10px 15px -3px rgb(0 0 0 / 0.1)', warnFn);
    expect(warnings.some(w => w.includes('spread'))).toBe(true);
  });

  it('no warnings for simple shadow without spread', () => {
    const warnings: string[] = [];
    const warnFn = (prop: string, reason: string) => warnings.push(`${prop}: ${reason}`);
    parseBoxShadow('0 1px 2px 0 rgb(0 0 0 / 0.05)', warnFn);
    expect(warnings).toEqual([]);
  });
});

describe('dotExplain shadow details on native', () => {
  it('reports multi-layer detail for shadow (default)', () => {
    const result = dotExplain('shadow', { target: 'native' });
    expect(result.report._approximated).toContain('boxShadow');
    // Default shadow has 2 layers
    expect(result.report._details?.boxShadow).toContain('2 layers → 1');
  });

  it('reports no details for shadow-sm (single layer, no spread)', () => {
    const result = dotExplain('shadow-sm', { target: 'native' });
    expect(result.report._approximated).toContain('boxShadow');
    // shadow-sm: 0 1px 2px 0 — single layer, spread=0 → no details
    expect(result.report._details?.boxShadow).toBeUndefined();
  });

  it('reports inset detail for shadow-inner', () => {
    const result = dotExplain('shadow-inner', { target: 'native' });
    expect(result.report._details?.boxShadow).toContain('inset dropped');
  });

  it('reports spread detail for shadow-lg', () => {
    const result = dotExplain('shadow-lg', { target: 'native' });
    expect(result.report._details?.boxShadow).toContain('spread ignored');
  });
});
