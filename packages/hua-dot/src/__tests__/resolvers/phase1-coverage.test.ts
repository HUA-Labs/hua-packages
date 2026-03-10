import { describe, it, expect } from 'vitest';
import { dot } from '../../index';

// ==========================================
// Typography extended tests
// ==========================================
describe('typography extended', () => {
  // Font sizes 7xl-9xl
  it('text-7xl → fontSize 72px', () => {
    expect(dot('text-7xl')).toEqual({ fontSize: '72px' });
  });
  it('text-8xl → fontSize 96px', () => {
    expect(dot('text-8xl')).toEqual({ fontSize: '96px' });
  });
  it('text-9xl → fontSize 128px', () => {
    expect(dot('text-9xl')).toEqual({ fontSize: '128px' });
  });

  // Text wrap
  it('text-wrap → textWrap wrap', () => {
    expect(dot('text-wrap')).toEqual({ textWrap: 'wrap' });
  });
  it('text-nowrap → textWrap nowrap', () => {
    expect(dot('text-nowrap')).toEqual({ textWrap: 'nowrap' });
  });
  it('text-balance → textWrap balance', () => {
    expect(dot('text-balance')).toEqual({ textWrap: 'balance' });
  });
  it('text-pretty → textWrap pretty', () => {
    expect(dot('text-pretty')).toEqual({ textWrap: 'pretty' });
  });

  // All font weights
  it('font-thin → 100', () => {
    expect(dot('font-thin')).toEqual({ fontWeight: '100' });
  });
  it('font-extralight → 200', () => {
    expect(dot('font-extralight')).toEqual({ fontWeight: '200' });
  });
  it('font-light → 300', () => {
    expect(dot('font-light')).toEqual({ fontWeight: '300' });
  });
  it('font-normal → 400', () => {
    expect(dot('font-normal')).toEqual({ fontWeight: '400' });
  });
  it('font-medium → 500', () => {
    expect(dot('font-medium')).toEqual({ fontWeight: '500' });
  });
  it('font-semibold → 600', () => {
    expect(dot('font-semibold')).toEqual({ fontWeight: '600' });
  });
  it('font-bold → 700', () => {
    expect(dot('font-bold')).toEqual({ fontWeight: '700' });
  });
  it('font-extrabold → 800', () => {
    expect(dot('font-extrabold')).toEqual({ fontWeight: '800' });
  });
  it('font-black → 900', () => {
    expect(dot('font-black')).toEqual({ fontWeight: '900' });
  });

  // Font families
  it('font-sans → fontFamily', () => {
    const r = dot('font-sans');
    expect(r.fontFamily).toContain('sans-serif');
  });
  it('font-serif → fontFamily', () => {
    const r = dot('font-serif');
    expect(r.fontFamily).toContain('serif');
  });
  it('font-mono → fontFamily', () => {
    const r = dot('font-mono');
    expect(r.fontFamily).toContain('monospace');
  });

  // Leading (line height)
  it('leading-none → 1', () => {
    expect(dot('leading-none')).toEqual({ lineHeight: '1' });
  });
  it('leading-tight → 1.25', () => {
    expect(dot('leading-tight')).toEqual({ lineHeight: '1.25' });
  });
  it('leading-relaxed → 1.625', () => {
    expect(dot('leading-relaxed')).toEqual({ lineHeight: '1.625' });
  });
  it('leading-loose → 2', () => {
    expect(dot('leading-loose')).toEqual({ lineHeight: '2' });
  });

  // Tracking (letter spacing)
  it('tracking-tighter → -0.05em', () => {
    expect(dot('tracking-tighter')).toEqual({ letterSpacing: '-0.05em' });
  });
  it('tracking-wide → 0.025em', () => {
    expect(dot('tracking-wide')).toEqual({ letterSpacing: '0.025em' });
  });
  it('tracking-widest → 0.1em', () => {
    expect(dot('tracking-widest')).toEqual({ letterSpacing: '0.1em' });
  });

  // Text decoration
  it('decoration-solid → textDecorationStyle', () => {
    expect(dot('decoration-solid')).toEqual({ textDecorationStyle: 'solid' });
  });
  it('decoration-wavy → textDecorationStyle', () => {
    expect(dot('decoration-wavy')).toEqual({ textDecorationStyle: 'wavy' });
  });
  it('decoration-2 → textDecorationThickness', () => {
    expect(dot('decoration-2')).toEqual({ textDecorationThickness: '2px' });
  });

  // Underline offset
  it('underline-offset-2 → textUnderlineOffset', () => {
    expect(dot('underline-offset-2')).toEqual({ textUnderlineOffset: '2px' });
  });
  it('underline-offset-auto → auto', () => {
    expect(dot('underline-offset-auto')).toEqual({ textUnderlineOffset: 'auto' });
  });

  // Text indent
  it('indent-4 → textIndent 16px', () => {
    expect(dot('indent-4')).toEqual({ textIndent: '16px' });
  });
});

// ==========================================
// Backdrop extended tests
// ==========================================
describe('backdrop extended', () => {
  // Existing backdrop tests to ensure no regression
  it('backdrop-blur → 8px', () => {
    expect(dot('backdrop-blur')).toEqual({ backdropFilter: 'blur(8px)' });
  });
  it('backdrop-blur-sm → 4px', () => {
    expect(dot('backdrop-blur-sm')).toEqual({ backdropFilter: 'blur(4px)' });
  });
  it('backdrop-blur-lg → 16px', () => {
    expect(dot('backdrop-blur-lg')).toEqual({ backdropFilter: 'blur(16px)' });
  });
  it('backdrop-brightness-75 → .75', () => {
    expect(dot('backdrop-brightness-75')).toEqual({ backdropFilter: 'brightness(.75)' });
  });
  it('backdrop-contrast-125', () => {
    expect(dot('backdrop-contrast-125')).toEqual({ backdropFilter: 'contrast(1.25)' });
  });
  it('backdrop-saturate-150', () => {
    expect(dot('backdrop-saturate-150')).toEqual({ backdropFilter: 'saturate(1.5)' });
  });

  // New backdrop filters
  it('backdrop-grayscale → 100%', () => {
    expect(dot('backdrop-grayscale')).toEqual({ backdropFilter: 'grayscale(100%)' });
  });
  it('backdrop-grayscale-0 → 0', () => {
    expect(dot('backdrop-grayscale-0')).toEqual({ backdropFilter: 'grayscale(0)' });
  });
  it('backdrop-sepia → 100%', () => {
    expect(dot('backdrop-sepia')).toEqual({ backdropFilter: 'sepia(100%)' });
  });
  it('backdrop-sepia-0 → 0', () => {
    expect(dot('backdrop-sepia-0')).toEqual({ backdropFilter: 'sepia(0)' });
  });
  it('backdrop-invert → 100%', () => {
    expect(dot('backdrop-invert')).toEqual({ backdropFilter: 'invert(100%)' });
  });
  it('backdrop-invert-0 → 0', () => {
    expect(dot('backdrop-invert-0')).toEqual({ backdropFilter: 'invert(0)' });
  });
  it('backdrop-hue-rotate-90 → 90deg', () => {
    expect(dot('backdrop-hue-rotate-90')).toEqual({ backdropFilter: 'hue-rotate(90deg)' });
  });
  it('backdrop-hue-rotate-180 → 180deg', () => {
    expect(dot('backdrop-hue-rotate-180')).toEqual({ backdropFilter: 'hue-rotate(180deg)' });
  });
  it('backdrop-opacity-50 → 0.5', () => {
    expect(dot('backdrop-opacity-50')).toEqual({ backdropFilter: 'opacity(0.5)' });
  });
  it('backdrop-opacity-0 → 0', () => {
    expect(dot('backdrop-opacity-0')).toEqual({ backdropFilter: 'opacity(0)' });
  });
});

// ==========================================
// Phase 0 tokens — regression tests
// ==========================================
describe('Phase 0 standalone tokens', () => {
  // italic
  it('italic → fontStyle italic', () => {
    expect(dot('italic')).toEqual({ fontStyle: 'italic' });
  });
  it('not-italic → fontStyle normal', () => {
    expect(dot('not-italic')).toEqual({ fontStyle: 'normal' });
  });

  // underline
  it('underline → textDecorationLine', () => {
    expect(dot('underline')).toEqual({ textDecorationLine: 'underline' });
  });
  it('line-through → textDecorationLine', () => {
    expect(dot('line-through')).toEqual({ textDecorationLine: 'line-through' });
  });
  it('no-underline → none', () => {
    expect(dot('no-underline')).toEqual({ textDecorationLine: 'none' });
  });

  // overflow directional
  it('overflow-x-auto', () => {
    expect(dot('overflow-x-auto')).toEqual({ overflowX: 'auto' });
  });
  it('overflow-y-hidden', () => {
    expect(dot('overflow-y-hidden')).toEqual({ overflowY: 'hidden' });
  });
  it('overflow-x-scroll', () => {
    expect(dot('overflow-x-scroll')).toEqual({ overflowX: 'scroll' });
  });
  it('overflow-y-visible', () => {
    expect(dot('overflow-y-visible')).toEqual({ overflowY: 'visible' });
  });

  // bg-clip
  it('bg-clip-text', () => {
    expect(dot('bg-clip-text')).toEqual({ backgroundClip: 'text', WebkitBackgroundClip: 'text' });
  });
  it('bg-clip-border', () => {
    expect(dot('bg-clip-border')).toEqual({ backgroundClip: 'border-box' });
  });
  it('bg-clip-padding', () => {
    expect(dot('bg-clip-padding')).toEqual({ backgroundClip: 'padding-box' });
  });

  // antialiased
  it('antialiased', () => {
    const r = dot('antialiased');
    expect(r.WebkitFontSmoothing).toBe('antialiased');
    expect(r.MozOsxFontSmoothing).toBe('grayscale');
  });
  it('subpixel-antialiased', () => {
    const r = dot('subpixel-antialiased');
    expect(r.WebkitFontSmoothing).toBe('auto');
  });

  // outline prefix
  it('outline-none', () => {
    expect(dot('outline-none')).toEqual({ outline: '2px solid transparent', outlineOffset: '2px' });
  });
  it('outline-2 → width', () => {
    expect(dot('outline-2')).toEqual({ outlineWidth: '2px' });
  });
  it('outline-dashed → style', () => {
    expect(dot('outline-dashed')).toEqual({ outlineStyle: 'dashed' });
  });
  it('outline-offset-2', () => {
    expect(dot('outline-offset-2')).toEqual({ outlineOffset: '2px' });
  });

  // divide — width unsupported (requires child combinator selector)
  it('divide-y → {} (child selector required)', () => {
    expect(dot('divide-y')).toEqual({});
  });
  it('divide-x-2 → {} (child selector required)', () => {
    expect(dot('divide-x-2')).toEqual({});
  });
  it('divide-gray-200 → borderColor', () => {
    expect(dot('divide-gray-200')).toEqual({ borderColor: '#c1c4c8' });
  });

  // flat color with semantic → CSS variable takes priority
  it('bg-primary → semantic CSS variable', () => {
    expect(dot('bg-primary')).toEqual({ backgroundColor: 'var(--color-primary)' });
  });
  it('text-red → color red-500', () => {
    expect(dot('text-red')).toEqual({ color: '#ca2c22' });
  });
});

// ==========================================
// Spacing comprehensive
// ==========================================
describe('spacing comprehensive', () => {
  it('p-0', () => { expect(dot('p-0')).toEqual({ padding: '0px' }); });
  it('p-px', () => { expect(dot('p-px')).toEqual({ padding: '1px' }); });
  it('p-0.5', () => { expect(dot('p-0.5')).toEqual({ padding: '2px' }); });
  it('p-1', () => { expect(dot('p-1')).toEqual({ padding: '4px' }); });
  it('p-2', () => { expect(dot('p-2')).toEqual({ padding: '8px' }); });
  it('p-4', () => { expect(dot('p-4')).toEqual({ padding: '16px' }); });
  it('p-8', () => { expect(dot('p-8')).toEqual({ padding: '32px' }); });
  it('p-12', () => { expect(dot('p-12')).toEqual({ padding: '48px' }); });
  it('p-16', () => { expect(dot('p-16')).toEqual({ padding: '64px' }); });
  it('m-auto', () => { expect(dot('m-auto')).toEqual({ margin: 'auto' }); });
  it('-m-4 → negative margin', () => { expect(dot('-m-4')).toEqual({ margin: '-16px' }); });
  it('mx-auto', () => { expect(dot('mx-auto')).toEqual({ marginLeft: 'auto', marginRight: 'auto' }); });
  it('px-4 py-2', () => {
    expect(dot('px-4 py-2')).toEqual({ paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px', paddingBottom: '8px' });
  });
  // space-x maps to columnGap (not marginLeft)
  it('space-x-4', () => {
    const r = dot('space-x-4');
    expect(r).toHaveProperty('columnGap', '16px');
  });
});

// ==========================================
// Border comprehensive
// ==========================================
describe('border comprehensive', () => {
  it('border → 1px', () => { expect(dot('border')).toEqual({ borderWidth: '1px' }); });
  it('border-0 → 0px', () => { expect(dot('border-0')).toEqual({ borderWidth: '0px' }); });
  it('border-2 → 2px', () => { expect(dot('border-2')).toEqual({ borderWidth: '2px' }); });
  it('border-t → 1px', () => { expect(dot('border-t')).toEqual({ borderTopWidth: '1px' }); });
  it('border-t-2', () => { expect(dot('border-t-2')).toEqual({ borderTopWidth: '2px' }); });
  it('border-solid → style', () => { expect(dot('border-solid')).toEqual({ borderStyle: 'solid' }); });
  it('border-dashed → style', () => { expect(dot('border-dashed')).toEqual({ borderStyle: 'dashed' }); });
  it('border-gray-200 → color', () => { expect(dot('border-gray-200')).toEqual({ borderColor: '#c1c4c8' }); });
  it('border-transparent', () => { expect(dot('border-transparent')).toEqual({ borderColor: 'transparent' }); });
  it('rounded → borderRadius', () => { expect(dot('rounded')).toHaveProperty('borderRadius'); });
  it('rounded-lg', () => { expect(dot('rounded-lg')).toHaveProperty('borderRadius'); });
  it('rounded-full', () => { expect(dot('rounded-full')).toEqual({ borderRadius: '9999px' }); });
  it('rounded-none', () => { expect(dot('rounded-none')).toEqual({ borderRadius: '0px' }); });
  it('rounded-t-lg', () => {
    const r = dot('rounded-t-lg');
    expect(r).toHaveProperty('borderTopLeftRadius');
    expect(r).toHaveProperty('borderTopRightRadius');
  });
});

// ==========================================
// Sizing comprehensive
// ==========================================
describe('sizing comprehensive', () => {
  it('w-full', () => { expect(dot('w-full')).toEqual({ width: '100%' }); });
  it('w-screen', () => { expect(dot('w-screen')).toEqual({ width: '100vw' }); });
  it('w-auto', () => { expect(dot('w-auto')).toEqual({ width: 'auto' }); });
  it('w-1/2', () => { expect(dot('w-1/2')).toEqual({ width: '50%' }); });
  it('w-1/3', () => { expect(dot('w-1/3')).toEqual({ width: '33.333333%' }); });
  it('h-screen', () => { expect(dot('h-screen')).toEqual({ height: '100vh' }); });
  it('h-full', () => { expect(dot('h-full')).toEqual({ height: '100%' }); });
  it('min-h-screen', () => { expect(dot('min-h-screen')).toEqual({ minHeight: '100vh' }); });
  it('max-w-md', () => { expect(dot('max-w-md')).toHaveProperty('maxWidth'); });
  it('max-w-none', () => { expect(dot('max-w-none')).toEqual({ maxWidth: 'none' }); });
  it('w-[300px] arbitrary', () => { expect(dot('w-[300px]')).toEqual({ width: '300px' }); });
});

// ==========================================
// Flexbox comprehensive
// ==========================================
describe('flexbox comprehensive', () => {
  it('flex', () => { expect(dot('flex')).toEqual({ display: 'flex' }); });
  it('inline-flex', () => { expect(dot('inline-flex')).toEqual({ display: 'inline-flex' }); });
  it('flex-row', () => { expect(dot('flex-row')).toEqual({ flexDirection: 'row' }); });
  it('flex-col', () => { expect(dot('flex-col')).toEqual({ flexDirection: 'column' }); });
  it('flex-wrap', () => { expect(dot('flex-wrap')).toEqual({ flexWrap: 'wrap' }); });
  it('flex-nowrap', () => { expect(dot('flex-nowrap')).toEqual({ flexWrap: 'nowrap' }); });
  it('items-center', () => { expect(dot('items-center')).toEqual({ alignItems: 'center' }); });
  it('items-start', () => { expect(dot('items-start')).toEqual({ alignItems: 'flex-start' }); });
  it('justify-center', () => { expect(dot('justify-center')).toEqual({ justifyContent: 'center' }); });
  it('justify-between', () => { expect(dot('justify-between')).toEqual({ justifyContent: 'space-between' }); });
  it('flex-1', () => { expect(dot('flex-1')).toEqual({ flex: '1 1 0%' }); });
  it('flex-auto', () => { expect(dot('flex-auto')).toEqual({ flex: '1 1 auto' }); });
  it('flex-none', () => { expect(dot('flex-none')).toEqual({ flex: 'none' }); });
  it('grow', () => { expect(dot('grow')).toEqual({ flexGrow: '1' }); });
  it('grow-0', () => { expect(dot('grow-0')).toEqual({ flexGrow: '0' }); });
  it('shrink', () => { expect(dot('shrink')).toEqual({ flexShrink: '1' }); });
  it('shrink-0', () => { expect(dot('shrink-0')).toEqual({ flexShrink: '0' }); });
  it('gap-4', () => { expect(dot('gap-4')).toEqual({ gap: '16px' }); });
  it('gap-x-4', () => { expect(dot('gap-x-4')).toEqual({ columnGap: '16px' }); });
  it('gap-y-2', () => { expect(dot('gap-y-2')).toEqual({ rowGap: '8px' }); });
  it('order-1', () => { expect(dot('order-1')).toHaveProperty('order'); });
});

// ==========================================
// Grid comprehensive
// ==========================================
describe('grid comprehensive', () => {
  it('grid', () => { expect(dot('grid')).toEqual({ display: 'grid' }); });
  it('grid-cols-3', () => { expect(dot('grid-cols-3')).toEqual({ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }); });
  it('grid-cols-12', () => { expect(dot('grid-cols-12')).toEqual({ gridTemplateColumns: 'repeat(12, minmax(0, 1fr))' }); });
  it('grid-rows-2', () => { expect(dot('grid-rows-2')).toEqual({ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }); });
  it('col-span-2', () => { expect(dot('col-span-2')).toEqual({ gridColumn: 'span 2 / span 2' }); });
  it('col-span-full', () => { expect(dot('col-span-full')).toEqual({ gridColumn: '1 / -1' }); });
  it('row-span-2', () => { expect(dot('row-span-2')).toEqual({ gridRow: 'span 2 / span 2' }); });
});

// ==========================================
// Color comprehensive
// ==========================================
describe('color comprehensive', () => {
  it('bg-white', () => { expect(dot('bg-white')).toEqual({ backgroundColor: '#ffffff' }); });
  it('bg-black', () => { expect(dot('bg-black')).toEqual({ backgroundColor: '#000000' }); });
  it('bg-transparent', () => { expect(dot('bg-transparent')).toEqual({ backgroundColor: 'transparent' }); });
  it('bg-current', () => { expect(dot('bg-current')).toEqual({ backgroundColor: 'currentColor' }); });
  it('bg-red-500', () => { expect(dot('bg-red-500')).toEqual({ backgroundColor: '#ca2c22' }); });
  it('bg-blue-100', () => { expect(dot('bg-blue-100')).toEqual({ backgroundColor: '#c4e6ff' }); });
  it('text-white', () => { expect(dot('text-white')).toEqual({ color: '#ffffff' }); });
  it('text-gray-500', () => { expect(dot('text-gray-500')).toEqual({ color: '#6d7178' }); });
  it('bg-[#ff0000] arbitrary', () => { expect(dot('bg-[#ff0000]')).toEqual({ backgroundColor: '#ff0000' }); });
  it('bg-red-500/50 opacity', () => {
    const r = dot('bg-red-500/50');
    expect(r.backgroundColor).toContain('rgb');
  });
  it('text-transparent', () => { expect(dot('text-transparent')).toEqual({ color: 'transparent' }); });
});

// ==========================================
// Transform comprehensive
// ==========================================
describe('transform comprehensive', () => {
  it('rotate-45', () => { expect(dot('rotate-45')).toHaveProperty('transform'); });
  it('rotate-90', () => { expect(dot('rotate-90')).toHaveProperty('transform'); });
  it('-rotate-45', () => {
    const r = dot('-rotate-45');
    expect(r.transform).toContain('-');
  });
  it('scale-75', () => { expect(dot('scale-75')).toHaveProperty('transform'); });
  it('scale-100', () => { expect(dot('scale-100')).toHaveProperty('transform'); });
  it('scale-150', () => { expect(dot('scale-150')).toHaveProperty('transform'); });
  it('translate-x-4', () => { expect(dot('translate-x-4')).toHaveProperty('transform'); });
  it('translate-y-4', () => { expect(dot('translate-y-4')).toHaveProperty('transform'); });
  it('-translate-x-1/2', () => { expect(dot('-translate-x-1/2')).toHaveProperty('transform'); });
});

// ==========================================
// Transition + Animation
// ==========================================
describe('transition and animation', () => {
  it('transition', () => { expect(dot('transition')).toHaveProperty('transitionProperty'); });
  it('transition-all', () => { expect(dot('transition-all')).toHaveProperty('transitionProperty'); });
  it('transition-colors', () => { expect(dot('transition-colors')).toHaveProperty('transitionProperty'); });
  it('transition-none', () => { expect(dot('transition-none')).toEqual({ transitionProperty: 'none' }); });
  it('duration-300', () => { expect(dot('duration-300')).toEqual({ transitionDuration: '300ms' }); });
  it('duration-150', () => { expect(dot('duration-150')).toEqual({ transitionDuration: '150ms' }); });
  it('ease-in', () => { expect(dot('ease-in')).toHaveProperty('transitionTimingFunction'); });
  it('ease-out', () => { expect(dot('ease-out')).toHaveProperty('transitionTimingFunction'); });
  it('ease-in-out', () => { expect(dot('ease-in-out')).toHaveProperty('transitionTimingFunction'); });
  it('delay-100', () => { expect(dot('delay-100')).toEqual({ transitionDelay: '100ms' }); });
  it('animate-spin', () => { expect(dot('animate-spin')).toHaveProperty('animation'); });
  it('animate-ping', () => { expect(dot('animate-ping')).toHaveProperty('animation'); });
  it('animate-bounce', () => { expect(dot('animate-bounce')).toHaveProperty('animation'); });
  it('animate-pulse', () => { expect(dot('animate-pulse')).toHaveProperty('animation'); });
  it('animate-none', () => { expect(dot('animate-none')).toEqual({ animation: 'none' }); });
});

// ==========================================
// Shadow + Ring
// ==========================================
describe('shadow and ring', () => {
  it('shadow', () => { expect(dot('shadow')).toHaveProperty('boxShadow'); });
  it('shadow-sm', () => { expect(dot('shadow-sm')).toHaveProperty('boxShadow'); });
  it('shadow-md', () => { expect(dot('shadow-md')).toHaveProperty('boxShadow'); });
  it('shadow-lg', () => { expect(dot('shadow-lg')).toHaveProperty('boxShadow'); });
  it('shadow-xl', () => { expect(dot('shadow-xl')).toHaveProperty('boxShadow'); });
  it('shadow-2xl', () => { expect(dot('shadow-2xl')).toHaveProperty('boxShadow'); });
  it('shadow-none', () => { expect(dot('shadow-none')).toHaveProperty('boxShadow'); });
  it('ring-2', () => { expect(dot('ring-2')).toHaveProperty('boxShadow'); });
  it('ring-0', () => { expect(dot('ring-0')).toHaveProperty('boxShadow'); });
  it('shadow + ring composition', () => {
    const r = dot('shadow-md ring-2');
    expect(r.boxShadow).toBeDefined();
  });
});

// ==========================================
// Positioning
// ==========================================
describe('positioning', () => {
  it('top-0', () => { expect(dot('top-0')).toEqual({ top: '0px' }); });
  it('right-0', () => { expect(dot('right-0')).toEqual({ right: '0px' }); });
  it('bottom-0', () => { expect(dot('bottom-0')).toEqual({ bottom: '0px' }); });
  it('left-0', () => { expect(dot('left-0')).toEqual({ left: '0px' }); });
  it('inset-0', () => { expect(dot('inset-0')).toEqual({ top: '0px', right: '0px', bottom: '0px', left: '0px' }); });
  it('inset-x-0', () => { expect(dot('inset-x-0')).toEqual({ left: '0px', right: '0px' }); });
  it('inset-y-0', () => { expect(dot('inset-y-0')).toEqual({ top: '0px', bottom: '0px' }); });
  it('top-4', () => { expect(dot('top-4')).toEqual({ top: '16px' }); });
  it('-top-4', () => { expect(dot('-top-4')).toEqual({ top: '-16px' }); });
  it('top-1/2', () => { expect(dot('top-1/2')).toEqual({ top: '50%' }); });
  it('top-full', () => { expect(dot('top-full')).toEqual({ top: '100%' }); });
});

// ==========================================
// Interactivity comprehensive
// ==========================================
describe('interactivity comprehensive', () => {
  it('cursor-pointer', () => { expect(dot('cursor-pointer')).toEqual({ cursor: 'pointer' }); });
  it('cursor-default', () => { expect(dot('cursor-default')).toEqual({ cursor: 'default' }); });
  it('cursor-not-allowed', () => { expect(dot('cursor-not-allowed')).toEqual({ cursor: 'not-allowed' }); });
  it('select-none', () => { expect(dot('select-none')).toEqual({ userSelect: 'none' }); });
  it('select-text', () => { expect(dot('select-text')).toEqual({ userSelect: 'text' }); });
  it('pointer-events-none', () => { expect(dot('pointer-events-none')).toEqual({ pointerEvents: 'none' }); });
  it('pointer-events-auto', () => { expect(dot('pointer-events-auto')).toEqual({ pointerEvents: 'auto' }); });
});

// ==========================================
// Gradient
// ==========================================
describe('gradient comprehensive', () => {
  it('bg-gradient-to-r from-blue-500 to-purple-500', () => {
    const r = dot('bg-gradient-to-r from-blue-500 to-purple-500');
    expect(r.backgroundImage).toContain('linear-gradient');
    expect(r.backgroundImage).toContain('to right');
  });
  it('bg-gradient-to-b from-red-500 via-yellow-500 to-green-500', () => {
    const r = dot('bg-gradient-to-b from-red-500 via-yellow-500 to-green-500');
    expect(r.backgroundImage).toContain('to bottom');
  });
});

// ==========================================
// Filter comprehensive
// ==========================================
describe('filter comprehensive', () => {
  it('blur', () => { expect(dot('blur')).toHaveProperty('filter'); });
  it('blur-sm', () => { expect(dot('blur-sm')).toHaveProperty('filter'); });
  it('blur-none', () => { expect(dot('blur-none')).toHaveProperty('filter'); });
  it('brightness-75', () => { expect(dot('brightness-75')).toHaveProperty('filter'); });
  it('contrast-125', () => { expect(dot('contrast-125')).toHaveProperty('filter'); });
  it('grayscale', () => { expect(dot('grayscale')).toHaveProperty('filter'); });
  it('sepia', () => { expect(dot('sepia')).toHaveProperty('filter'); });
  it('invert', () => { expect(dot('invert')).toHaveProperty('filter'); });
  it('hue-rotate-90', () => { expect(dot('hue-rotate-90')).toHaveProperty('filter'); });
  it('drop-shadow-md', () => { expect(dot('drop-shadow-md')).toHaveProperty('filter'); });
  it('saturate-150', () => { expect(dot('saturate-150')).toHaveProperty('filter'); });
});

// ==========================================
// z-index
// ==========================================
describe('z-index', () => {
  it('z-0', () => { expect(dot('z-0')).toEqual({ zIndex: '0' }); });
  it('z-10', () => { expect(dot('z-10')).toEqual({ zIndex: '10' }); });
  it('z-50', () => { expect(dot('z-50')).toEqual({ zIndex: '50' }); });
  it('z-auto', () => { expect(dot('z-auto')).toEqual({ zIndex: 'auto' }); });
  // z-index arbitrary values are not supported (no parseArbitrary in z-index resolver)
  it('z-[999] returns empty (arbitrary not supported)', () => { expect(dot('z-[999]')).toEqual({}); });
});

// ==========================================
// Aspect ratio
// ==========================================
describe('aspect ratio', () => {
  it('aspect-auto', () => { expect(dot('aspect-auto')).toEqual({ aspectRatio: 'auto' }); });
  it('aspect-square', () => { expect(dot('aspect-square')).toEqual({ aspectRatio: '1 / 1' }); });
  it('aspect-video', () => { expect(dot('aspect-video')).toEqual({ aspectRatio: '16 / 9' }); });
});

// ==========================================
// Combined utility strings (integration)
// ==========================================
describe('combined utility strings', () => {
  it('common card pattern', () => {
    const r = dot('p-4 rounded-lg bg-white shadow-md');
    expect(r.padding).toBe('16px');
    expect(r.borderRadius).toBeDefined();
    expect(r.backgroundColor).toBe('#ffffff');
    expect(r.boxShadow).toBeDefined();
  });
  it('common button pattern', () => {
    const r = dot('px-4 py-2 rounded-md bg-blue-500 text-white font-semibold');
    expect(r.paddingLeft).toBe('16px');
    expect(r.paddingTop).toBe('8px');
    expect(r.backgroundColor).toBe('#0079b1');
    expect(r.color).toBe('#ffffff');
    expect(r.fontWeight).toBe('600');
  });
  it('flex layout', () => {
    const r = dot('flex items-center justify-between gap-4');
    expect(r.display).toBe('flex');
    expect(r.alignItems).toBe('center');
    expect(r.justifyContent).toBe('space-between');
    expect(r.gap).toBe('16px');
  });
  it('absolute positioning', () => {
    const r = dot('absolute inset-0 z-10');
    expect(r.position).toBe('absolute');
    expect(r.top).toBe('0px');
    expect(r.zIndex).toBe('10');
  });
  it('gradient text', () => {
    const r = dot('bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent');
    expect(r.backgroundImage).toContain('linear-gradient');
    expect(r.backgroundClip).toBe('text');
    expect(r.color).toBe('transparent');
  });
  it('truncate + line-clamp override', () => {
    const r = dot('truncate');
    expect(r.overflow).toBe('hidden');
    expect(r.textOverflow).toBe('ellipsis');
    expect(r.whiteSpace).toBe('nowrap');
  });
});
