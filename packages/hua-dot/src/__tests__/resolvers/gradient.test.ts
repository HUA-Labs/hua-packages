import { describe, it, expect } from 'vitest';
import { dot, dotExplain } from '../../index';
import { dot as dotNative } from '../../native';
import { getCapability } from '../../capabilities';
import { adaptFlutter } from '../../adapters/flutter';

describe('gradient direction', () => {
  it('resolves bg-gradient-to-r', () => {
    // Direction alone doesn't produce output (no color stops)
    expect(dot('bg-gradient-to-r')).toEqual({});
  });

  it.each([
    ['r', 'to right'],
    ['l', 'to left'],
    ['t', 'to top'],
    ['b', 'to bottom'],
    ['tr', 'to top right'],
    ['tl', 'to top left'],
    ['br', 'to bottom right'],
    ['bl', 'to bottom left'],
  ])('bg-gradient-to-%s produces direction "%s"', (dir, expected) => {
    const result = dot(`bg-gradient-to-${dir} from-red-500 to-blue-500`);
    expect(result.backgroundImage).toContain(expected);
  });

  it('returns empty for unknown direction', () => {
    expect(dot('bg-gradient-to-x')).toEqual({});
  });
});

describe('gradient color stops', () => {
  it('resolves from-red-500 to-blue-500 with default direction', () => {
    const result = dot('from-red-500 to-blue-500');
    expect(result.backgroundImage).toBe('linear-gradient(to bottom, #ca2c22, #0079b1)');
  });

  it('resolves full gradient: direction + from + via + to', () => {
    const result = dot('bg-gradient-to-r from-red-500 via-yellow-500 to-green-500');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22, #896e00, #00874c)');
  });

  it('resolves from + to without via', () => {
    const result = dot('bg-gradient-to-r from-red-500 to-blue-500');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22, #0079b1)');
  });

  it('resolves special colors (white, black, transparent)', () => {
    const result = dot('bg-gradient-to-b from-white to-transparent');
    expect(result.backgroundImage).toBe('linear-gradient(to bottom, #ffffff, transparent)');
  });

  it('resolves arbitrary color values', () => {
    const result = dot('bg-gradient-to-r from-[#ff0000] to-[#0000ff]');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ff0000, #0000ff)');
  });

  it('handles opacity modifier: from-red-500/50', () => {
    const result = dot('bg-gradient-to-r from-red-500/50 to-blue-500');
    expect(result.backgroundImage).toMatch(/linear-gradient\(to right, rgb\(202 44 34 \/ 0\.5\), #0079b1\)/);
  });
});

describe('gradient stop positions', () => {
  it('resolves from-50% position', () => {
    const result = dot('bg-gradient-to-r from-red-500 from-10% to-blue-500 to-90%');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22 10%, #0079b1 90%)');
  });

  it('resolves arbitrary position: from-[25%]', () => {
    const result = dot('bg-gradient-to-r from-red-500 from-[25%] to-blue-500');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22 25%, #0079b1)');
  });

  it('resolves via position', () => {
    const result = dot('bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22, #896e00 30%, #0079b1)');
  });
});

describe('gradient combinations with other utilities', () => {
  it('combines gradient with spacing', () => {
    const result = dot('bg-gradient-to-r from-red-500 to-blue-500 p-4');
    expect(result.backgroundImage).toBe('linear-gradient(to right, #ca2c22, #0079b1)');
    expect(result.padding).toBe('16px');
  });

  it('combines gradient with other bg properties (gradient wins backgroundImage)', () => {
    const result = dot('bg-gradient-to-r from-red-500 to-blue-500 rounded-lg');
    expect(result.backgroundImage).toBeDefined();
    expect(result.borderRadius).toBe('8px');
  });

  it('internal gradient keys never leak to output', () => {
    const result = dot('bg-gradient-to-r from-red-500 to-blue-500');
    for (const key of Object.keys(result)) {
      expect(key).not.toMatch(/^__dot_/);
    }
  });
});

describe('gradient on native target', () => {
  it('drops gradient (backgroundImage unsupported on RN)', () => {
    const result = dotNative('bg-gradient-to-r from-red-500 to-blue-500');
    expect(result).toEqual({});
  });

  it('dotExplain reports gradient as dropped on native', () => {
    const result = dotExplain('bg-gradient-to-r from-red-500 to-blue-500', { target: 'native' });
    expect(result.styles).toEqual({});
    expect(result.report._dropped).toContain('backgroundImage');
  });
});

describe('gradient on flutter target', () => {
  it('produces gradient recipe on flutter', () => {
    const result = dot('bg-gradient-to-r from-red-500 to-blue-500', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    expect(decoration?.gradient).toBeDefined();
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.type).toBe('linear');
    expect(gradient.begin).toBe('centerLeft');
    expect(gradient.end).toBe('centerRight');
    expect(gradient.colors).toEqual(['#ca2c22', '#0079b1']);
  });

  it('handles colors with internal commas (rgba) on flutter', () => {
    const result = dot('bg-gradient-to-r from-[rgba(255,0,0,0.5)] to-[#0000ff]', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    expect(decoration?.gradient).toBeDefined();
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.colors).toEqual(['rgba(255,0,0,0.5)', '#0000ff']);
  });

  it('fills partial stop positions on flutter', () => {
    const result = dot('bg-gradient-to-r from-red-500 via-yellow-500 via-30% to-blue-500', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    expect(decoration?.gradient).toBeDefined();
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.colors).toEqual(['#ca2c22', '#896e00', '#0079b1']);
    // via-30% → stops[1]=0.3, from/to auto-filled to 0 and 1
    expect(gradient.stops).toEqual([0, 0.3, 1]);
  });

  it('reports gradient as recipe-only on flutter', () => {
    expect(getCapability('backgroundImage', 'flutter')).toBe('recipe-only');
  });
});

describe('gradient capability', () => {
  it('reports gradient capability per target', () => {
    expect(getCapability('backgroundImage', 'web')).toBe('native');
    expect(getCapability('backgroundImage', 'native')).toBe('unsupported');
    expect(getCapability('backgroundImage', 'flutter')).toBe('recipe-only');
  });
});

describe('gradient negative / edge cases', () => {
  it('returns empty for unknown from value', () => {
    expect(dot('from-nonexistent')).toEqual({});
  });

  it('returns empty for unknown via value', () => {
    expect(dot('via-nonexistent')).toEqual({});
  });

  it('returns empty for unknown to value', () => {
    expect(dot('to-nonexistent')).toEqual({});
  });

  it('direction without color stops produces no output', () => {
    expect(dot('bg-gradient-to-r')).toEqual({});
  });
});

describe('flutter gradient edge cases', () => {
  it('handles nested parentheses in color-mix() on flutter', () => {
    // color-mix(in srgb, red 50%, blue) contains nested parens and commas
    // Verifying the parenthesis-aware splitter doesn't break
    const result = dot('bg-gradient-to-r from-[rgba(255,128,0,0.8)] via-[#00ff00] to-[rgba(0,0,255,1)]', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    expect(decoration?.gradient).toBeDefined();
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.colors).toHaveLength(3);
    expect(gradient.colors).toEqual(['rgba(255,128,0,0.8)', '#00ff00', 'rgba(0,0,255,1)']);
  });

  it('omits stops array when no stop positions specified on flutter', () => {
    const result = dot('bg-gradient-to-b from-red-500 to-blue-500', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.stops).toBeUndefined();
  });

  it('fills from/to stops when only via-% given on flutter', () => {
    const result = dot('bg-gradient-to-r from-white via-gray-500 via-60% to-black', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.stops).toEqual([0, 0.6, 1]);
  });

  it('handles from-% and to-% together on flutter', () => {
    const result = dot('bg-gradient-to-r from-red-500 from-10% to-blue-500 to-90%', { target: 'flutter' }) as Record<string, unknown>;
    const decoration = result.decoration as Record<string, unknown> | undefined;
    const gradient = decoration!.gradient as Record<string, unknown>;
    expect(gradient.stops).toEqual([0.1, 0.9]);
  });

  it('returns no gradient when direction is invalid on flutter', () => {
    // Manually craft a backgroundImage with unknown direction (45deg not in direction map)
    const recipe = adaptFlutter({ backgroundImage: 'linear-gradient(45deg, red, blue)' });
    expect(recipe.decoration?.gradient).toBeUndefined();
  });
});
