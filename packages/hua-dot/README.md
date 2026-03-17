# @hua-labs/dot

Cross-platform style engine. Parses Tailwind-inspired utility strings into flat style objects for Web (CSSProperties), React Native (StyleSheet), and Flutter (widget recipes). Zero dependencies, 2335+ tests.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **`dot()` utility string → flat style objects** — CSSProperties, RN StyleSheet, or Flutter widget recipes from the same input
- **25 resolver modules** — ~90% Tailwind parity across spacing, color, typography, layout, border, flexbox, grid, shadow, ring, filter, backdrop, transform, animation, transition, and more
- **Cross-platform adapters** — `adaptWeb` (identity), `adaptNative` (px→number, transform→array, 45+ dropped props), `adaptFlutter` (BoxDecoration, EdgeInsets, TextStyle, Matrix4)
- **Arbitrary values, opacity modifiers, negative values** — `w-[300px]`, `bg-primary-500/50`, `-m-4`
- **dark: and responsive variants** — `dark:bg-gray-900`, `md:p-8 lg:p-12` mobile-first cascade
- **`dotMap()` state variants** — returns `{ base, hover, focus, active, focus-visible, focus-within, disabled }` for event-driven styling
- **`dotVariants()` variant system** — CVA-style factory with base, variants, defaultVariants, and compoundVariants
- **Class mode** — `dotClass` / `dotCSS` / `dotFlush` for SSR-safe CSS ruleset generation via `@hua-labs/dot/class`
- **Capability matrix + diagnostics** — `CAPABILITY_MATRIX`, `getCapability()`, `dotExplain()` report dropped/approximated properties per target
- **Zero dependencies** — framework-agnostic, works in any JS environment

## Installation

```bash
pnpm add @hua-labs/dot
```

## Quick Start

```ts
import { dot, dotMap, dotVariants } from "@hua-labs/dot";

// Basic — returns CSSProperties
const style = dot("p-4 flex items-center bg-primary-500 text-white rounded-lg");
// { padding: '16px', display: 'flex', alignItems: 'center', ... }

// React Native
import { dot } from "@hua-labs/dot/native"; // auto-sets target: 'native'
dot("p-4 rounded-lg shadow-lg rotate-45");
// { padding: 16, borderRadius: 8, shadowColor: '#000', transform: [{ rotate: '45deg' }] }

// Flutter
import type { FlutterRecipe } from "@hua-labs/dot";
const recipe = dot("p-4 bg-blue-500 rounded-lg", {
  target: "flutter",
}) as FlutterRecipe;
// { padding: { top: 16, right: 16, bottom: 16, left: 16 },
//   decoration: { color: '#3b82f6', borderRadius: { topLeft: 8, ... } } }

// Dark mode + responsive
dot("bg-white dark:bg-gray-900 p-4 md:p-8", { dark: true, breakpoint: "md" });
// { backgroundColor: '#111827', padding: '32px' }

// State variants
const styles = dotMap("bg-white hover:bg-gray-100 focus:ring-2");
// { base: { backgroundColor: '#fff' }, hover: { backgroundColor: '#f3f4f6' }, focus: { boxShadow: '...' } }
// Apply: <div style={styles.base} onMouseEnter={() => applyStyle(styles.hover)} />

// CVA-style variant system
const button = dotVariants({
  base: "inline-flex items-center rounded-md font-medium",
  variants: {
    intent: {
      primary: "bg-primary-500 text-white",
      ghost: "bg-transparent border border-border",
    },
    size: { sm: "text-sm px-3 py-1.5", md: "text-base px-4 py-2" },
  },
  defaultVariants: { intent: "primary", size: "md" },
});
button({ intent: "ghost", size: "sm" }); // → StyleObject
```

## API

| Export                                    | Description                                                                                                     |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `dot(input, options?)`                    | Utility string → StyleObject / RNStyleObject / FlutterRecipe. Overloads narrow return type by `target` literal. |
| `dotMap(input, options?)`                 | Same as `dot()` but returns `{ base, hover?, focus?, active?, ... }` for state-driven styling.                  |
| `dotExplain(input, options?)`             | Returns `{ styles, report }`. Report lists `_dropped`, `_approximated`, `_capabilities` per target.             |
| `dotVariants(config)`                     | CVA-style variant factory. Accepts `base`, `variants`, `defaultVariants`, `compoundVariants`.                   |
| `dotCx(...inputs)`                        | Filters falsy values and joins utility strings. No style computation.                                           |
| `createDotConfig(config?)`                | Set global token overrides (colors, spacing, fontSize, breakpoints, remBase, strictMode, etc.).                 |
| `clearDotCache()`                         | Reset the 2-layer FIFO cache. Call after config changes or for memory management.                               |
| `semanticVars(...names)`                  | Generate CSS variable mappings — `'background'` → `'var(--color-background)'`.                                  |
| `adaptNative(style, options?)`            | Convert CSSProperties to RN StyleSheet format directly.                                                         |
| `adaptWeb(style)`                         | Identity adapter — returns input as-is.                                                                         |
| `adaptFlutter(style, options?)`           | Convert CSSProperties to FlutterRecipe.                                                                         |
| `CAPABILITY_MATRIX`                       | Static map of utility family → target → support level.                                                          |
| `PROPERTY_TO_FAMILY`                      | Static map of CSS property → utility family for capability lookup.                                              |
| `getCapability(property, target, value?)` | Programmatic per-property capability query.                                                                     |
| **`@hua-labs/dot/class` subpath**         |                                                                                                                 |
| `dotClass(input, options?)`               | Generate stable class name, inject CSS into shared stylesheet (browser) or buffer (SSR).                        |
| `dotCSS(input, options?)`                 | Like `dotClass` but also returns the generated CSS string as `{ className, css }`.                              |
| `dotFlush()`                              | Collect all buffered CSS for SSR `<style>` injection. Resets the buffer.                                        |
| `dotReset()`                              | Reset class cache and CSS buffer — useful between test runs or SSR renders.                                     |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — framework layer built on dot
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — component library using the dot style system
- [`@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/dot-aot) — ahead-of-time CSS extraction for dot

## License

MIT — [HUA Labs](https://hua-labs.com)
