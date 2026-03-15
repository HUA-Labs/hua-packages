import { describe, it, expect } from 'vitest';
import {
  resolveAnimation,
  resolveFadeAnimation,
  resolveZoomAnimation,
  resolveSlideIn,
  resolveSlideOut,
} from '../../resolvers/animation';
import { resolveConfig } from '../../config';
import { dot } from '../../index';

const config = resolveConfig();

// ---------------------------------------------------------------------------
// animate-in / animate-out (tailwindcss-animate keyframe trigger)
// ---------------------------------------------------------------------------

describe('animate-in / animate-out', () => {
  it('animate-in sets enter keyframe properties', () => {
    const result = resolveAnimation('animate', 'in', config);
    expect(result).toMatchObject({
      animationName: 'enter',
      animationDuration: '150ms',
      animationFillMode: 'both',
    });
  });

  it('animate-out sets exit keyframe properties', () => {
    const result = resolveAnimation('animate', 'out', config);
    expect(result).toMatchObject({
      animationName: 'exit',
      animationDuration: '150ms',
      animationFillMode: 'both',
    });
  });

  it('still resolves existing animate-spin', () => {
    const result = resolveAnimation('animate', 'spin', config);
    expect(result).toHaveProperty('animation');
    expect(String(result.animation)).toContain('spin');
  });

  it('still resolves animate-none', () => {
    expect(resolveAnimation('animate', 'none', config)).toEqual({ animation: 'none' });
  });
});

// ---------------------------------------------------------------------------
// fade-in / fade-out (--tw-enter-opacity / --tw-exit-opacity)
// ---------------------------------------------------------------------------

describe('resolveFadeAnimation', () => {
  it('fade-in bare → --tw-enter-opacity: 1', () => {
    expect(resolveFadeAnimation('fade', 'in', config)).toEqual({
      '--tw-enter-opacity': '1',
    });
  });

  it('fade-in-0 → --tw-enter-opacity: 0', () => {
    expect(resolveFadeAnimation('fade', 'in-0', config)).toEqual({
      '--tw-enter-opacity': '0',
    });
  });

  it('fade-in-50 → --tw-enter-opacity: 0.5', () => {
    expect(resolveFadeAnimation('fade', 'in-50', config)).toEqual({
      '--tw-enter-opacity': '0.5',
    });
  });

  it('fade-in-100 → --tw-enter-opacity: 1', () => {
    expect(resolveFadeAnimation('fade', 'in-100', config)).toEqual({
      '--tw-enter-opacity': '1',
    });
  });

  it('fade-out bare → --tw-exit-opacity: 1', () => {
    expect(resolveFadeAnimation('fade', 'out', config)).toEqual({
      '--tw-exit-opacity': '1',
    });
  });

  it('fade-out-0 → --tw-exit-opacity: 0', () => {
    expect(resolveFadeAnimation('fade', 'out-0', config)).toEqual({
      '--tw-exit-opacity': '0',
    });
  });

  it('fade-out-75 → --tw-exit-opacity: 0.75', () => {
    expect(resolveFadeAnimation('fade', 'out-75', config)).toEqual({
      '--tw-exit-opacity': '0.75',
    });
  });

  it('returns {} for unknown step', () => {
    expect(resolveFadeAnimation('fade', 'in-999', config)).toEqual({});
  });

  it('returns {} for unknown value', () => {
    expect(resolveFadeAnimation('fade', 'unknown', config)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// zoom-in / zoom-out (--tw-enter-scale / --tw-exit-scale)
// ---------------------------------------------------------------------------

describe('resolveZoomAnimation', () => {
  it('zoom-in bare → --tw-enter-scale: 1', () => {
    expect(resolveZoomAnimation('zoom', 'in', config)).toEqual({
      '--tw-enter-scale': '1',
    });
  });

  it('zoom-in-50 → --tw-enter-scale: 0.5', () => {
    expect(resolveZoomAnimation('zoom', 'in-50', config)).toEqual({
      '--tw-enter-scale': '0.5',
    });
  });

  it('zoom-in-0 → --tw-enter-scale: 0', () => {
    expect(resolveZoomAnimation('zoom', 'in-0', config)).toEqual({
      '--tw-enter-scale': '0',
    });
  });

  it('zoom-out bare → --tw-exit-scale: 1', () => {
    expect(resolveZoomAnimation('zoom', 'out', config)).toEqual({
      '--tw-exit-scale': '1',
    });
  });

  it('zoom-out-75 → --tw-exit-scale: 0.75', () => {
    expect(resolveZoomAnimation('zoom', 'out-75', config)).toEqual({
      '--tw-exit-scale': '0.75',
    });
  });
});

// ---------------------------------------------------------------------------
// slide-in-from-{direction}-{amount} (--tw-enter-translate-*)
// ---------------------------------------------------------------------------

describe('resolveSlideIn', () => {
  it('slide-in-from-top-2 → --tw-enter-translate-y: -8px', () => {
    expect(resolveSlideIn('slide-in-from-top', '2', config)).toEqual({
      '--tw-enter-translate-y': '-8px',
    });
  });

  it('slide-in-from-bottom-2 → --tw-enter-translate-y: 8px (positive)', () => {
    expect(resolveSlideIn('slide-in-from-bottom', '2', config)).toEqual({
      '--tw-enter-translate-y': '8px',
    });
  });

  it('slide-in-from-left-4 → --tw-enter-translate-x: -16px', () => {
    expect(resolveSlideIn('slide-in-from-left', '4', config)).toEqual({
      '--tw-enter-translate-x': '-16px',
    });
  });

  it('slide-in-from-right-4 → --tw-enter-translate-x: 16px (positive)', () => {
    expect(resolveSlideIn('slide-in-from-right', '4', config)).toEqual({
      '--tw-enter-translate-x': '16px',
    });
  });

  it('slide-in-from-top-0 → --tw-enter-translate-y: 0px (no sign)', () => {
    expect(resolveSlideIn('slide-in-from-top', '0', config)).toEqual({
      '--tw-enter-translate-y': '0px',
    });
  });

  it('slide-in-from-top (bare, no amount) → --tw-enter-translate-y: -100%', () => {
    expect(resolveSlideIn('slide-in-from-top', '', config)).toEqual({
      '--tw-enter-translate-y': '-100%',
    });
  });

  it('slide-in-from-bottom (bare) → --tw-enter-translate-y: 100%', () => {
    expect(resolveSlideIn('slide-in-from-bottom', '', config)).toEqual({
      '--tw-enter-translate-y': '100%',
    });
  });

  it('slide-in-from-top-full → --tw-enter-translate-y: -100%', () => {
    expect(resolveSlideIn('slide-in-from-top', 'full', config)).toEqual({
      '--tw-enter-translate-y': '-100%',
    });
  });

  it('returns {} for unknown spacing step', () => {
    expect(resolveSlideIn('slide-in-from-top', 'unknown', config)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// slide-out-to-{direction}-{amount} (--tw-exit-translate-*)
// ---------------------------------------------------------------------------

describe('resolveSlideOut', () => {
  it('slide-out-to-top-2 → --tw-exit-translate-y: -8px', () => {
    expect(resolveSlideOut('slide-out-to-top', '2', config)).toEqual({
      '--tw-exit-translate-y': '-8px',
    });
  });

  it('slide-out-to-bottom-4 → --tw-exit-translate-y: 16px', () => {
    expect(resolveSlideOut('slide-out-to-bottom', '4', config)).toEqual({
      '--tw-exit-translate-y': '16px',
    });
  });

  it('slide-out-to-left-2 → --tw-exit-translate-x: -8px', () => {
    expect(resolveSlideOut('slide-out-to-left', '2', config)).toEqual({
      '--tw-exit-translate-x': '-8px',
    });
  });

  it('slide-out-to-right-2 → --tw-exit-translate-x: 8px', () => {
    expect(resolveSlideOut('slide-out-to-right', '2', config)).toEqual({
      '--tw-exit-translate-x': '8px',
    });
  });

  it('slide-out-to-top (bare) → --tw-exit-translate-y: -100%', () => {
    expect(resolveSlideOut('slide-out-to-top', '', config)).toEqual({
      '--tw-exit-translate-y': '-100%',
    });
  });

  it('slide-out-to-right (bare) → --tw-exit-translate-x: 100%', () => {
    expect(resolveSlideOut('slide-out-to-right', '', config)).toEqual({
      '--tw-exit-translate-x': '100%',
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: dot() end-to-end parsing
// ---------------------------------------------------------------------------

describe('dot() integration — tailwindcss-animate tokens', () => {
  it('animate-in parses and emits enter keyframe styles', () => {
    const result = dot('animate-in');
    expect(result).toMatchObject({
      animationName: 'enter',
      animationDuration: '150ms',
    });
  });

  it('fade-in-0 parses and emits CSS variable', () => {
    const result = dot('fade-in-0');
    expect(result).toHaveProperty('--tw-enter-opacity', '0');
  });

  it('fade-in-50 parses and emits correct opacity step', () => {
    const result = dot('fade-in-50');
    expect(result).toHaveProperty('--tw-enter-opacity', '0.5');
  });

  it('slide-in-from-top-2 parses to negative Y variable', () => {
    const result = dot('slide-in-from-top-2');
    expect(result).toHaveProperty('--tw-enter-translate-y', '-8px');
  });

  it('slide-in-from-bottom-4 parses to positive Y variable', () => {
    const result = dot('slide-in-from-bottom-4');
    expect(result).toHaveProperty('--tw-enter-translate-y', '16px');
  });

  it('composes multiple tokens: animate-in fade-in-0 slide-in-from-top-2', () => {
    const result = dot('animate-in fade-in-0 slide-in-from-top-2');
    expect(result).toMatchObject({
      animationName: 'enter',
      animationDuration: '150ms',
      '--tw-enter-opacity': '0',
      '--tw-enter-translate-y': '-8px',
    });
  });

  it('zoom-in-50 parses to scale variable', () => {
    const result = dot('zoom-in-50');
    expect(result).toHaveProperty('--tw-enter-scale', '0.5');
  });

  it('slide-out-to-right-2 parses to positive X exit variable', () => {
    const result = dot('slide-out-to-right-2');
    expect(result).toHaveProperty('--tw-exit-translate-x', '8px');
  });
});
