# @hua-labs/dot

Cross-platform style engine that converts utility strings to Web CSSProperties objects. Tailwind-inspired syntax, zero dependencies, framework-agnostic. 387 tests, 9KB gzip.

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
- **2-layer cache — input-level + token-level FIFO caching**
- **Custom config — createDotConfig() for token overrides (colors, spacing, borderRadius, fontSize, etc.)**
- **strictMode — throws on unknown tokens**

## Installation

```bash
pnpm add @hua-labs/dot
```


## Quick Start

```tsx
import { dot, createDotConfig } from '@hua-labs/dot';

// Basic usage
const style = dot('p-4 flex items-center bg-primary-500 text-white rounded-lg');
// { padding: '16px', display: 'flex', alignItems: 'center', ... }

// Dark mode
dot('bg-white dark:bg-gray-900', { dark: true });
// { backgroundColor: '#111827' }

// Responsive (mobile-first cascade)
dot('p-4 md:p-8 lg:p-12', { breakpoint: 'lg' });
// { padding: '48px' }

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
| `StyleObject` | type |  |
| `DotToken` | type |  |
| `DotUserConfig` | type |  |
| `DotConfig` | type |  |
| `DotOptions` | type |  |
| `ResolverFn` | type |  |
| `ResolvedTokens` | type |  |
| `dot` | function | Convert utility string to CSSProperties object. Options: { dark?: boolean, breakpoint?: string } |
| `createDotConfig` | function | Set global token configuration with deep merge. Accepts theme overrides, cache settings, strictMode. |
| `clearDotCache` | function | Clear both input and token caches. Call after config changes or for memory management. |


## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)

## License

MIT — [HUA Labs](https://hua-labs.com)
