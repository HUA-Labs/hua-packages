import { describe, it, expect, beforeEach } from 'vitest';
import { dot, dotMap, clearDotCache, createDotConfig } from '../index';

// ==========================================
// State variants via dotMap
// ==========================================
describe('state variants via dotMap', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('hover:bg-blue-500 → hover state', () => {
    const r = dotMap('hover:bg-blue-500');
    expect(r.hover?.backgroundColor).toBe('#0079b1');
  });

  it('focus:outline-none → focus state', () => {
    const r = dotMap('focus:outline-none');
    // outline-none resolves to outline: '2px solid transparent' + outlineOffset
    expect(r.focus?.outline).toBe('2px solid transparent');
  });

  it('active:bg-blue-700 → active state', () => {
    const r = dotMap('active:bg-blue-700');
    expect(r.active?.backgroundColor).toBe('#004565');
  });

  it('disabled:opacity-50 → disabled state', () => {
    const r = dotMap('disabled:opacity-50');
    expect(r.disabled?.opacity).toBe('0.5');
  });

  it('focus-visible:ring-2 → focus-visible state (hyphenated key)', () => {
    const r = dotMap('focus-visible:ring-2');
    // dotMap uses the raw state string as key: 'focus-visible'
    expect(r['focus-visible']?.boxShadow).toBeDefined();
  });

  it('focus-within:border-blue-500 → focus-within state (hyphenated key)', () => {
    const r = dotMap('focus-within:border-blue-500');
    // dotMap uses the raw state string as key: 'focus-within'
    expect(r['focus-within']?.borderColor).toBe('#0079b1');
  });

  it('base + hover combined', () => {
    const r = dotMap('bg-white hover:bg-gray-100');
    expect(r.base?.backgroundColor).toBe('#ffffff');
    expect(r.hover?.backgroundColor).toBe('#dee1e4');
  });

  it('multiple state variants', () => {
    const r = dotMap('bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300');
    expect(r.base?.backgroundColor).toBe('#0079b1');
    expect(r.hover?.backgroundColor).toBe('#005e8a');
    expect(r.active?.backgroundColor).toBe('#004565');
    expect(r.disabled?.backgroundColor).toBe('#a3a7ae');
  });
});

// ==========================================
// dark: variant via dotMap
// ==========================================
describe('dark: variant via dotMap', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('dark:bg-gray-900 without dark option → skipped (not in output)', () => {
    // Without { dark: true }, dark: tokens are skipped entirely
    const r = dotMap('dark:bg-gray-900');
    expect(r.base).toEqual({});
    expect((r as Record<string, unknown>).dark).toBeUndefined();
  });

  it('bg-white dark:bg-gray-900 with { dark: true } → dark overrides base', () => {
    // dark: tokens merge into base when isDark=true
    const r = dotMap('bg-white dark:bg-gray-900', { dark: true });
    expect(r.base?.backgroundColor).toBe('#121418');
  });

  it('text-gray-900 dark:text-white with { dark: true } → dark color in base', () => {
    const r = dotMap('text-gray-900 dark:text-white', { dark: true });
    expect(r.base?.color).toBe('#ffffff');
  });

  it('bg-white dark:bg-gray-900 without dark option → light color only', () => {
    const r = dotMap('bg-white dark:bg-gray-900');
    expect(r.base?.backgroundColor).toBe('#ffffff');
  });
});

// ==========================================
// dark: + state combinations via dotMap
// ==========================================
describe('dark: + state combinations', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('dark:hover:bg-gray-800 with { dark: true } → goes to hover bucket', () => {
    // dark+state token: when isDark=true, routes to stateLayers['hover']
    const r = dotMap('dark:hover:bg-gray-800', { dark: true });
    expect(r.hover?.backgroundColor).toBe('#26292d');
  });

  it('dark:hover:bg-gray-800 without dark option → skipped entirely', () => {
    const r = dotMap('dark:hover:bg-gray-800');
    // dark tokens are skipped when isDark=false
    expect(r.base).toEqual({});
    expect(r.hover).toBeUndefined();
  });

  it('base + dark:hover combined with { dark: true }', () => {
    const r = dotMap('bg-white hover:bg-gray-100 dark:hover:bg-gray-800', { dark: true });
    // bg-white goes to base, hover:bg-gray-100 goes to hover, dark:hover:bg-gray-800 goes to hover (overrides)
    expect(r.base?.backgroundColor).toBe('#ffffff');
    // hover bucket: dark:hover overrides hover since dark mode is active
    expect(r.hover?.backgroundColor).toBe('#26292d');
  });
});

// ==========================================
// Responsive variants
// ==========================================
describe('responsive variants', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('sm:flex without breakpoint option → skipped (not in base or sm bucket)', () => {
    // Without { breakpoint: ... }, responsive tokens are skipped entirely
    const r = dotMap('sm:flex');
    expect(r.base).toEqual({});
  });

  it('sm:flex with { breakpoint: "sm" } → cascades into base', () => {
    const r = dotMap('sm:flex', { breakpoint: 'sm' });
    expect(r.base?.display).toBe('flex');
  });

  it('md:grid-cols-2 with { breakpoint: "md" } → cascades into base', () => {
    const r = dotMap('md:grid-cols-2', { breakpoint: 'md' });
    expect(r.base?.gridTemplateColumns).toBeDefined();
  });

  it('lg:px-8 with { breakpoint: "lg" } → cascades into base', () => {
    const r = dotMap('lg:px-8', { breakpoint: 'lg' });
    expect(r.base?.paddingLeft).toBe('32px');
    expect(r.base?.paddingRight).toBe('32px');
  });

  it('responsive + base combined (mobile-first cascade)', () => {
    const r = dotMap('px-4 md:px-8 lg:px-12', { breakpoint: 'md' });
    // base px-4 → 16px, md:px-8 → 32px cascades over it
    expect(r.base?.paddingLeft).toBe('32px');
  });

  it('responsive state variant: md:p-8 + hover with breakpoint option', () => {
    // State variants still route to their own bucket
    const r = dotMap('p-4 md:p-8 hover:bg-gray-100', { breakpoint: 'md' });
    expect(r.base?.padding).toBe('32px'); // md:p-8 cascades into base
    expect(r.hover?.backgroundColor).toBe('#dee1e4');
  });
});

// ==========================================
// !important modifier
// ==========================================
describe('!important modifier', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('!p-4 → padding with !important', () => {
    const r = dot('!p-4');
    expect(r.padding).toBe('16px !important');
  });

  it('!bg-red-500 → backgroundColor with !important', () => {
    const r = dot('!bg-red-500');
    expect(r.backgroundColor).toBe('#ca2c22 !important');
  });

  it('!flex → display with !important', () => {
    const r = dot('!flex');
    expect(r.display).toBe('flex !important');
  });

  it('mix of !important and normal', () => {
    const r = dot('p-4 !m-2');
    expect(r.padding).toBe('16px');
    expect(r.margin).toBe('8px !important');
  });
});

// ==========================================
// Negative values
// ==========================================
describe('negative values', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('-m-4 → -16px', () => {
    expect(dot('-m-4')).toEqual({ margin: '-16px' });
  });

  it('-mt-2 → -8px', () => {
    expect(dot('-mt-2')).toEqual({ marginTop: '-8px' });
  });

  it('-top-4 → -16px', () => {
    expect(dot('-top-4')).toEqual({ top: '-16px' });
  });

  it('-translate-x-1/2 → transform contains negative translateX', () => {
    const r = dot('-translate-x-1/2');
    expect(r.transform).toContain('-');
    // translateX(-50%) or translateX(--50%)
    expect(r.transform).toContain('translateX(');
  });

  it('-z-10 → unknown (z-10 is not in z-index scale, only 0/10/20/30/40/50/auto)', () => {
    // Note: z-index token table only has '0','10','20','30','40','50','auto'
    // '-z-10' would try to resolve 'z' prefix with value '10', then negate
    // z-10 resolves to { zIndex: '10' }, negated → { zIndex: '-10' }
    const r = dot('-z-10');
    // zIndex: '-10' (negated from '10')
    expect(r.zIndex).toBe('-10');
  });

  it('-rotate-45 → transform contains negative rotation', () => {
    const r = dot('-rotate-45');
    expect(r.transform).toContain('-');
    expect(r.transform).toContain('rotate(');
  });
});

// ==========================================
// Arbitrary values
// ==========================================
describe('arbitrary values', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('w-[300px]', () => {
    expect(dot('w-[300px]')).toEqual({ width: '300px' });
  });

  it('h-[50vh]', () => {
    expect(dot('h-[50vh]')).toEqual({ height: '50vh' });
  });

  it('p-[10px]', () => {
    expect(dot('p-[10px]')).toEqual({ padding: '10px' });
  });

  it('bg-[#ff0000]', () => {
    expect(dot('bg-[#ff0000]')).toEqual({ backgroundColor: '#ff0000' });
  });

  it('text-[14px] → falls through to color resolver (color: "14px", not fontSize)', () => {
    // text-[...] arbitrary values fall through to resolveColor, not resolveTypography fontSize.
    // text-sm uses fontSize token lookup; text-[14px] ends up as color:'14px' (known limitation).
    const r = dot('text-[14px]');
    expect(r.color).toBe('14px');
  });

  it('z-[9999] → zIndex 9999 (arbitrary z-index supported)', () => {
    expect(dot('z-[9999]')).toEqual({ zIndex: '9999' });
  });

  it('top-[50%] → top 50% (arbitrary positioning supported)', () => {
    expect(dot('top-[50%]')).toEqual({ top: '50%' });
  });

  it('rounded-[12px] → empty (border-radius resolver has no arbitrary value support)', () => {
    // resolveBorderRadius only handles token table; arbitrary [12px] not supported yet.
    expect(dot('rounded-[12px]')).toEqual({});
  });

  it('gap-[20px]', () => {
    expect(dot('gap-[20px]')).toEqual({ gap: '20px' });
  });

  it('translate-x-[50%] → empty (transform resolver has no arbitrary value support)', () => {
    // resolveTransform only handles spacing tokens and keyword fractions; arbitrary [50%] not supported.
    expect(dot('translate-x-[50%]')).toEqual({});
  });
});

// ==========================================
// Edge cases
// ==========================================
describe('edge cases', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('empty string → empty object', () => {
    expect(dot('')).toEqual({});
  });

  it('whitespace only → empty object', () => {
    expect(dot('   ')).toEqual({});
  });

  it('unknown token → empty (no crash)', () => {
    expect(dot('completely-unknown-token')).toEqual({});
  });

  it('duplicate tokens → last wins', () => {
    const r = dot('p-4 p-8');
    expect(r.padding).toBe('32px');
  });

  it('conflicting tokens → last wins', () => {
    const r = dot('text-red-500 text-blue-500');
    expect(r.color).toBe('#0079b1');
  });

  it('many tokens at once', () => {
    const r = dot('flex items-center justify-center p-4 m-2 bg-white text-black rounded-lg shadow-md border border-gray-200');
    expect(Object.keys(r).length).toBeGreaterThan(5);
  });

  it('dotMap empty string → { base: {} }', () => {
    expect(dotMap('')).toEqual({ base: {} });
    expect(dotMap('   ')).toEqual({ base: {} });
  });

  it('dot() ignores state variants (backward compat)', () => {
    const r = dot('p-4 hover:p-8');
    expect(r.padding).toBe('16px');
  });

  it('dot() ignores all state variants', () => {
    const r = dot('bg-white focus:bg-gray-100 active:bg-gray-200');
    expect(r).toEqual({ backgroundColor: '#ffffff' });
  });

  it('dotMap omits state keys with no styles', () => {
    const r = dotMap('p-4 hover:bg-gray-100');
    expect(r.focus).toBeUndefined();
    expect(r.active).toBeUndefined();
  });
});

// ==========================================
// Cache behavior
// ==========================================
describe('cache behavior', () => {
  beforeEach(() => {
    createDotConfig();
    clearDotCache();
  });

  it('same input returns same result', () => {
    clearDotCache();
    const r1 = dot('p-4 bg-red-500');
    const r2 = dot('p-4 bg-red-500');
    expect(r1).toEqual(r2);
  });

  it('clearDotCache resets and still works after', () => {
    dot('p-4');
    clearDotCache();
    const r = dot('p-4');
    expect(r.padding).toBe('16px');
  });

  it('dotMap results are cached', () => {
    const r1 = dotMap('p-4 hover:bg-gray-100');
    const r2 = dotMap('p-4 hover:bg-gray-100');
    expect(r1).toEqual(r2);
  });

  it('cache is keyed by full input including options context', () => {
    // dot() without dark option vs with dark option should return different results
    const light = dot('bg-white dark:bg-gray-900');
    const dark = dot('bg-white dark:bg-gray-900', { dark: true });
    expect(light.backgroundColor).toBe('#ffffff');
    expect(dark.backgroundColor).toBe('#121418');
  });
});
