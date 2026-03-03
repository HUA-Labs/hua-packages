# @hua-labs/dot

Cross-platform style engine that converts utility strings to Web CSSProperties / React Native StyleSheet objects. Tailwind-inspired syntax, zero dependencies, framework-agnostic. 603 tests.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **dot() — utility string to CSSProperties with dark/responsive options**
- **Spacing — p/m/gap with directional variants (px, py, pt, pr, pb, pl, mx, my, mt, mr, mb, ml)**
- **Colors — bg/text/border with 11 palettes × 10 shades + special colors**
- **Typography — font-size, font-weight, line-height, letter-spacing, text-align**
- **Layout — display, position, width, height, min/max sizing**
- **Border — width, style, radius with directional variants**
- **Flexbox — direction, wrap, align, justify, flex, grow, shrink, order**
- **Z-index — 7 predefined layers**
- **Shadow — sm, md, lg, xl, 2xl, inner, none**
- **Opacity — 0-100 scale (16 values)**
- **Transform — rotate, scale, scale-x/y, translate-x/y, skew-x/y with accumulation**
- **Transition — property, duration, timing, delay**
- **Animation — spin, ping, pulse, bounce**
- **Backdrop — blur filters**
- **Positioning — top/right/bottom/left/inset/inset-x/inset-y/start/end**
- **Grid — grid-cols/rows, col/row-span, col/row-start/end, auto-cols/rows, grid-flow**
- **dark: variant — conditional dark mode styles via DotOptions**
- **Responsive variants — sm:/md:/lg:/xl:/2xl: mobile-first cascade**
- **Negative values — -m-4, -top-2, -translate-x-4**
- **React Native adapter — dot('p-4', { target: 'native' }) → { padding: 16 }**
- **RN native subpath — import { dot } from '@hua-labs/dot/native' (auto target: 'native')**
- **RN conditional export — Metro resolves 'react-native' condition automatically**
- **RN dropped property warnings — dev console.warn for unsupported CSS props (transition, grid, cursor, etc.)**
- **RN transform — CSS transform string → RN transform array**
- **RN shadow — boxShadow → shadowColor/Offset/Opacity/Radius/elevation**
- **Interactivity — cursor-*, select-*, resize-*, pointer-events-***
- **State variants — dotMap('hover:bg-gray-100') → { base, hover, focus, active, ... }**
- **Arbitrary values — w-[300px], bg-[#ff0000], p-[2rem], shadow-[0_4px_6px_rgba(0,0,0,0.1)]**
- **Opacity modifier — bg-primary-500/50, text-gray-900/80, border-red-500/25**
- **Ring — ring-2, ring-blue-500, ring-offset-2 for focus ring styling**
- **Space — space-x-4, space-y-4 mapped to columnGap/rowGap**
- **Line clamp — line-clamp-3 for text truncation**
- **2-layer cache — input-level + token-level FIFO caching**
- **Custom config — createDotConfig() for token overrides (colors, spacing, borderRadius, fontSize, etc.)**
- **strictMode — throws on unknown tokens**

## Installation

```bash
pnpm add @hua-labs/dot
```

## Quick Start

```tsx
import { dot, dotMap, createDotConfig } from '@hua-labs/dot';

// Basic usage
const style = dot('p-4 flex items-center bg-primary-500 text-white rounded-lg');
// { padding: '16px', display: 'flex', alignItems: 'center', ... }

// React Native target (explicit)
dot('p-4 rounded-lg shadow-lg rotate-45', { target: 'native' });
// { padding: 16, borderRadius: 8, shadowColor: '#000000', ..., transform: [{ rotate: '45deg' }] }

// React Native via native subpath (auto target)
// import { dot } from '@hua-labs/dot/native';
// dot('p-4 rounded-lg') → { padding: 16, borderRadius: 8 }

// Dark mode
dot('bg-white dark:bg-gray-900', { dark: true });
// { backgroundColor: '#111827' }

// Responsive (mobile-first cascade)
dot('p-4 md:p-8 lg:p-12', { breakpoint: 'lg' });
// { padding: '48px' }

// State variants (hover/focus/active)
dotMap('bg-white hover:bg-gray-100 focus:bg-gray-200');
// { base: { backgroundColor: '#ffffff' }, hover: { backgroundColor: '#f3f4f6' }, focus: { backgroundColor: '#e5e7eb' } }

// Interactivity
dot('cursor-pointer select-none pointer-events-auto');
// { cursor: 'pointer', userSelect: 'none', pointerEvents: 'auto' }

// Arbitrary values
dot('w-[300px] bg-[#ff0000] p-[2rem]');
// { width: '300px', backgroundColor: '#ff0000', padding: '2rem' }

// Opacity modifier
dot('bg-primary-500/50 text-gray-900/80');
// { backgroundColor: 'rgb(59 130 246 / 0.5)', color: 'rgb(17 24 39 / 0.8)' }

// Ring (focus ring styling)
dotMap('ring-2 focus:ring-blue-500');
// { base: { boxShadow: '0 0 0 2px #3b82f6' }, focus: { boxShadow: '0 0 0 3px #3b82f6' } }

// Space + line-clamp
dot('flex flex-col space-y-4 line-clamp-3');
// { display: 'flex', flexDirection: 'column', rowGap: '16px', overflow: 'hidden', ... }

// Negative values + transform accumulation
dot('-m-4 rotate-45 scale-110');
// { margin: '-16px', transform: 'rotate(45deg) scale(1.1)' }

// Custom tokens
createDotConfig({
  theme: { colors: { brand: { 500: '#6630E6' } }, spacing: { '18': '72px' } },
});
dot('bg-brand-500 p-18');
// { backgroundColor: '#6630E6', padding: '72px' }

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `adaptNative` | function | Convert web CSSProperties to RN StyleSheet format. Supports warnDropped option for dev warnings on unsupported properties. |
| `_resetNativeWarnings` | function | Reset native adapter warning dedup set. For testing only. |
| `adaptWeb` | function |  |
| `dotCx` | function |  |
| `dotVariants` | function |  |
| `StyleObject` | type |  |
| `DotToken` | type |  |
| `DotUserConfig` | type |  |
| `DotConfig` | type |  |
| `DotOptions` | type |  |
| `DotTarget` | type |  |
| `DotState` | type |  |
| `DotStyleMap` | type |  |
| `ResolverFn` | type |  |
| `ResolvedTokens` | type |  |
| `RNStyleObject` | type |  |
| `RNStyleValue` | type |  |
| `RNTransformEntry` | type |  |
| `RNShadowOffset` | type |  |
| `AdaptNativeOptions` | type |  |
| `VariantProps` | type |  |
| `DotVariantsConfig` | type |  |
| `DotVariantsFn` | type |  |
| `CompoundVariant` | type |  |
| `VariantShape` | type |  |
| `dot` | function | Convert utility string to flat style object. Options: { dark?: boolean, breakpoint?: string, target?: 'web' | 'native' } |
| `createDotConfig` | function | Set global token configuration with deep merge. Accepts theme overrides, runtime target, cache settings, strictMode. |
| `clearDotCache` | function | Clear both input and token caches. Call after config changes or for memory management. |
| `dotMap` | function | Convert utility string to style map with state variants. Returns { base, hover?, focus?, active?, 'focus-visible'?, 'focus-within'?, disabled? } |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)

## License

MIT — [HUA Labs](https://hua-labs.com)
