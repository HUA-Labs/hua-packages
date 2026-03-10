# @hua-labs/dot

Cross-platform utility style engine for Web and React Native. Parses Tailwind-inspired utility strings into flat style objects via a shared resolver pipeline and target-specific adapters. Zero dependencies, framework-agnostic, 800+ tests.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **dot() — utility string → CSSProperties (or RN StyleSheet via adapter)**
- **21 resolver categories — spacing, colors, typography, layout, sizing, border, flexbox, z-index, shadow, opacity, transform, transition, animation, backdrop, positioning, grid, ring, filter, interactivity, line-clamp, mix-blend**
- **Arbitrary values — w-[300px], bg-[#ff0000], p-[2rem]**
- **Opacity modifier — bg-primary-500/50, text-gray-900/80**
- **Negative values — -m-4, -top-2, -translate-x-4**
- **!important modifier — !p-4, !bg-white**
- **dark: variant — conditional dark mode via DotOptions**
- **Responsive variants — sm:/md:/lg:/xl:/2xl: mobile-first cascade**
- **State variants — dotMap() → { base, hover, focus, active, focus-visible, focus-within, disabled }**
- **dotVariants() — CVA-style variant factory (base, variants, defaultVariants, compoundVariants)**
- **dotCx() — clsx replacement for filtering falsy values and joining utility strings**
- **Shared resolver pipeline — one resolver, target-specific adapters (adaptNative / adaptWeb)**
- **adaptNative() — px→number, transform→array, boxShadow→RN shadow props, 45 unsupported props silently dropped**
- **RN native subpath — import from '@hua-labs/dot/native' (auto target: 'native')**
- **RN conditional export — Metro resolves 'react-native' condition automatically**
- **createDotConfig() — token overrides (colors, spacing, borderRadius, fontSize, gridCols, etc.)**
- **CSS variable bridge — 17 semantic color tokens (background, foreground, card, muted, accent, etc.)**
- **strictMode — throws on unknown tokens; warnUnknown — dev console.warn**
- **2-layer FIFO cache — input-level (500) + token-level (1000) caching**
- **clearDotCache() — reset after config changes or for memory management**

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
| `CAPABILITY_MATRIX` | component |  |
| `PROPERTY_TO_FAMILY` | component |  |
| `getCapability` | function |  |
| `adaptNative` | function | Convert web CSSProperties to RN StyleSheet format. Supports warnDropped option for dev warnings on unsupported properties. |
| `_resetNativeWarnings` | function | Reset native adapter warning dedup set. For testing only. |
| `adaptWeb` | function | Identity adapter for web — returns input as-is. Used for symmetry with adaptNative. |
| `adaptFlutter` | function |  |
| `dotCx` | function | clsx replacement — filters falsy values and joins utility strings. No style computation. |
| `dotVariants` | function | CVA-style variant system. Accepts base, variants, defaultVariants, compoundVariants. Returns function that produces StyleObject. |
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
| `CapabilityLevel` | type |  |
| `TargetCapability` | type |  |
| `DotCapabilityReport` | type |  |
| `AdaptNativeOptions` | type |  |
| `AdaptFlutterOptions` | type |  |
| `FlutterRecipe` | type |  |
| `FlutterDecoration` | type |  |
| `FlutterEdgeInsets` | type |  |
| `FlutterConstraints` | type |  |
| `FlutterLayout` | type |  |
| `FlutterFlexChild` | type |  |
| `FlutterPositioning` | type |  |
| `FlutterTextStyle` | type |  |
| `FlutterTransform` | type |  |
| `FlutterBoxShadow` | type |  |
| `FlutterBorderSide` | type |  |
| `FlutterBorderRadius` | type |  |
| `VariantProps` | type |  |
| `DotVariantsConfig` | type |  |
| `DotVariantsFn` | type |  |
| `CompoundVariant` | type |  |
| `VariantShape` | type |  |
| `dot` | function | Convert utility string to flat style object. Options: { dark?: boolean, breakpoint?: string, target?: 'web' | 'native' } |
| `dotExplain` | function |  |
| `createDotConfig` | function | Set global token configuration with deep merge. Accepts theme overrides, runtime target, cache settings, strictMode. |
| `clearDotCache` | function | Clear both input and token caches. Call after config changes or for memory management. |
| `dotMap` | function | Convert utility string to style map with state variants. Returns { base, hover?, focus?, active?, 'focus-visible'?, 'focus-within'?, disabled? } |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)

## License

MIT — [HUA Labs](https://hua-labs.com)
