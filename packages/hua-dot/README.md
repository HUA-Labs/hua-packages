# @hua-labs/dot

Cross-platform utility style engine for Web, React Native, and Flutter. Parses Tailwind-inspired utility strings into flat style objects via a shared resolver pipeline and target-specific adapters. Zero dependencies, framework-agnostic, 1176+ tests. ~90% Tailwind parity across 33 resolver families.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **dot() — utility string → CSSProperties (or RN StyleSheet / FlutterRecipe via adapter)**
- **33 resolver families — spacing, colors, typography, layout, sizing, border, flexbox, z-index, shadow, opacity, transform, transition, animation, backdrop, positioning, grid, ring, filter, interactivity, line-clamp, mix-blend, gradient, object-fit, float, table, list, scroll, touch-action, will-change, word-break, isolation, bg-clip, font-smoothing, divide**
- **Arbitrary values — w-[300px], bg-[#ff0000], p-[2rem]**
- **Opacity modifier — bg-primary-500/50, text-gray-900/80**
- **Negative values — -m-4, -top-2, -translate-x-4**
- **!important modifier — !p-4, !bg-white**
- **Gradient support — bg-gradient-to-{r,l,t,b,tr,tl,br,bl} direction + from-/via-/to- color stops**
- **Gradient position modifiers — from-10%, via-50%, to-90%**
- **Gradient composes into backgroundImage: linear-gradient(...)**
- **Flutter adapter maps gradient to FlutterGradient (recipe-only target)**
- **Multi-layer shadow composition — shadow-* and ring-* merge into a single boxShadow string**
- **Ring + shadow combined — ring layer always prepended before shadow layer (Tailwind convention)**
- **!important propagation through shadow/ring composition**
- **dark: variant — conditional dark mode via DotOptions**
- **Responsive variants — sm:/md:/lg:/xl:/2xl: mobile-first cascade**
- **Custom breakpoints — createDotConfig({ breakpoints: ['tablet', 'desktop'] })**
- **State variants — dotMap() → { base, hover, focus, active, focus-visible, focus-within, disabled }**
- **dotVariants() — CVA-style variant factory (base, variants, defaultVariants, compoundVariants)**
- **dotCx() — clsx replacement for filtering falsy values and joining utility strings**
- **Shared resolver pipeline — one resolver, target-specific adapters (adaptNative / adaptWeb / adaptFlutter)**
- **adaptNative() — px→number, transform→array, boxShadow→RN shadow props, 45+ unsupported props silently dropped**
- **RN native subpath — import from '@hua-labs/dot/native' (auto target: 'native')**
- **RN conditional export — Metro resolves 'react-native' condition automatically**
- **adaptFlutter() — CSSProperties → FlutterRecipe (structured widget composition map)**
- **FlutterRecipe fields — decoration (BoxDecoration), padding/margin (EdgeInsets), constraints (SizedBox), layout (Row/Column), flexChild (Flexible/Expanded), positioning (Positioned), textStyle (TextStyle), transform (Matrix4), opacity, visible, aspectRatio, zIndex**
- **FlutterGradient — bg-gradient-to-* + from/via/to stops → LinearGradient recipe**
- **Flutter target: 'flutter' — dot('p-4', { target: 'flutter' }) → FlutterRecipe**
- **dotExplain() — resolves styles + returns DotCapabilityReport (dropped, approximated, capabilities per property)**
- **CAPABILITY_MATRIX — static map of utility family → target → support level (native/approximate/recipe-only/plugin-backed/unsupported)**
- **PROPERTY_TO_FAMILY — static map of CSS property → utility family for capability lookup**
- **getCapability(property, target, value?) — programmatic per-property capability query**
- **createDotConfig() — token overrides (colors, spacing, borderRadius, fontSize, gridCols, breakpoints, remBase, etc.)**
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
import { dot, dotMap, dotExplain, createDotConfig, adaptFlutter,
         CAPABILITY_MATRIX, PROPERTY_TO_FAMILY } from '@hua-labs/dot';
import type { FlutterRecipe } from '@hua-labs/dot';

// Basic usage
const style = dot('p-4 flex items-center bg-primary-500 text-white rounded-lg');
// { padding: '16px', display: 'flex', alignItems: 'center', ... }

// React Native target (explicit)
dot('p-4 rounded-lg shadow-lg rotate-45', { target: 'native' });
// { padding: 16, borderRadius: 8, shadowColor: '#000000', ..., transform: [{ rotate: '45deg' }] }

// React Native via native subpath (auto target)
// import { dot } from '@hua-labs/dot/native';
// dot('p-4 rounded-lg') → { padding: 16, borderRadius: 8 }

// Flutter target → FlutterRecipe
const recipe = dot('p-4 bg-blue-500 rounded-lg', { target: 'flutter' }) as FlutterRecipe;
// { padding: { top: 16, right: 16, bottom: 16, left: 16 },
//   decoration: { color: '#3b82f6', borderRadius: { topLeft: 8, ... } } }

// adaptFlutter() directly
adaptFlutter({ padding: '16px', backgroundColor: '#3b82f6', borderRadius: '8px' });
// → FlutterRecipe

// Gradient
dot('bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500');
// { backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899)' }

// Dark mode
dot('bg-white dark:bg-gray-900', { dark: true });
// { backgroundColor: '#111827' }

// Responsive (mobile-first cascade)
dot('p-4 md:p-8 lg:p-12', { breakpoint: 'lg' });
// { padding: '48px' }

// Custom breakpoints
createDotConfig({ breakpoints: ['tablet', 'desktop'] });
dot('p-4 tablet:p-8', { breakpoint: 'tablet' });
// { padding: '32px' }

// State variants (hover/focus/active)
dotMap('bg-white hover:bg-gray-100 focus:bg-gray-200');
// { base: { backgroundColor: '#ffffff' }, hover: { backgroundColor: '#f3f4f6' }, focus: { backgroundColor: '#e5e7eb' } }

// Ring + shadow composition (merged into one boxShadow string)
dot('ring-2 shadow-md');
// { boxShadow: '0 0 0 2px ..., 0 4px 6px -1px rgba(0,0,0,0.1)' }

// Capability reporting
dotExplain('p-4 blur-md grid grid-cols-3', { target: 'native' });
// { styles: { padding: 16 }, report: { _dropped: ['filter','gridTemplateColumns'], _capabilities: {...} } }

// Capability matrix lookup
CAPABILITY_MATRIX['gradient'];  // { web: 'native', native: 'unsupported', flutter: 'recipe-only' }
PROPERTY_TO_FAMILY['backgroundImage'];  // 'gradient'

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

// !important modifier
dot('!p-4 !bg-white');
// { padding: '16px !important', backgroundColor: '#ffffff !important' }

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
| `CAPABILITY_MATRIX` | component | Static constant: Record<string, Partial<Record<DotTarget, CapabilityLevel>>>. Maps utility family name (e.g. 'gradient', 'filter') to support level per target. Support levels: 'native' | 'approximate' | 'recipe-only' | 'plugin-backed' | 'unsupported'. |
| `PROPERTY_TO_FAMILY` | component | Static constant: Record<string, string>. Maps CSS property name (e.g. 'backgroundImage') to utility family name (e.g. 'gradient') for use with CAPABILITY_MATRIX. |
| `getCapability` | function | getCapability(property, target, value?) → CapabilityLevel. Programmatic per-property capability query. Checks value-level overrides first (e.g. display:flex is 'native' on RN), then family-level lookup. |
| `adaptNative` | function | Convert web CSSProperties to RN StyleSheet format. px→number, transform→array, boxShadow→RN shadow props, 45+ unsupported props silently dropped. Supports warnDropped option for dev warnings. |
| `_resetNativeWarnings` | function | Reset native adapter warning dedup set. For testing only. |
| `adaptWeb` | function | Identity adapter for web — returns input as-is. Used for symmetry with adaptNative. |
| `adaptFlutter` | function | Convert web CSSProperties to FlutterRecipe — structured output mapping to Flutter widget composition (BoxDecoration, EdgeInsets, TextStyle, Matrix4, etc.). Options: { remBase?: number }. Gradient backgroundImage is mapped to FlutterGradient inside decoration. |
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
| `dot` | function | Convert utility string to flat style object. Type-safe overloads narrow return type by target literal: dot(input, { target: 'native' }) → RNStyleObject, dot(input, { target: 'flutter' }) → FlutterRecipe, dot(input) → StyleObject. Options: { dark?: boolean, breakpoint?: string, target?: 'web' | 'native' | 'flutter' } |
| `dotExplain` | function | Resolve a utility string and return both styles and a capability report. Returns DotExplainResult { styles, report: { _dropped?, _approximated?, _capabilities?, _details? } }. For web target returns empty report. Useful for debugging cross-platform compatibility. |
| `createDotConfig` | function | Set global token configuration with deep merge. Accepts theme overrides (colors, spacing, borderRadius, fontSize, gridCols), runtime target, breakpoints (custom array), remBase, cache settings, strictMode, warnUnknown. |
| `clearDotCache` | function | Clear both input and token caches. Call after config changes or for memory management. |
| `dotMap` | function | Convert utility string to style map with state variants. Same type-safe overloads as dot(). Returns { base, hover?, focus?, active?, 'focus-visible'?, 'focus-within'?, disabled? } |
| `semanticVars` | function | Generate semantic color token mappings for use with createDotConfig. Maps token names to CSS variable references (e.g. 'background' → 'var(--color-background)'). Accepts an optional { prefix } object as the first argument to override the default '--color' prefix. |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)
- [`@hua-labs/@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/@hua-labs/dot-aot)

## License

MIT — [HUA Labs](https://hua-labs.com)
