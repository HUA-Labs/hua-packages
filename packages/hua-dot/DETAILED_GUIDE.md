# @hua-labs/dot — Detailed Guide

Complete technical reference for the cross-platform style engine.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Installation & Configuration](#installation--configuration)
3. [Core API](#core-api)
4. [Resolver Modules](#resolver-modules)
5. [Adapters](#adapters)
6. [Variant System](#variant-system)
7. [Class Mode](#class-mode)
8. [Capability System](#capability-system)
9. [Advanced Features](#advanced-features)
10. [Caching](#caching)
11. [Type Reference](#type-reference)

---

## Architecture

```
Input string
    │
    ▼
 parser.ts          — tokenizes "p-4 dark:bg-gray-900 md:flex" into DotToken[]
    │
    ▼
 resolver.ts         — dispatches each token to the matching resolver module
    │
    ▼
 [25 resolver modules]  — spacing, color, typography, layout, border, flexbox,
                          grid, shadow, ring, filter, backdrop, transform,
                          animation, transition, opacity, z-index, positioning,
                          gradient, line-clamp, interactivity, divide, object-fit,
                          table, list, scroll
    │
    ▼
 index.ts (dot/dotMap)  — merges resolved layers in correct cascade order
    │                      (base → sm → md → lg → dark → dark:sm → ...)
    │
    ├─ adaptWeb()        — identity, returns merged StyleObject as-is
    ├─ adaptNative()     — px→number, transform→array, boxShadow→RN shadow props,
    │                      45+ unsupported props silently dropped
    └─ adaptFlutter()    — StyleObject → FlutterRecipe (BoxDecoration, EdgeInsets,
                           TextStyle, Matrix4, FlutterConstraints, ...)
```

The entire pipeline is synchronous and pure. No DOM access, no Dimensions API, no global state beyond the module-level config singleton and 2-layer FIFO cache.

---

## Installation & Configuration

```bash
pnpm add @hua-labs/dot
```

### Default usage (no config needed)

```ts
import { dot } from "@hua-labs/dot";

dot("p-4 flex items-center bg-primary-500 text-white rounded-lg");
```

### createDotConfig — full options

```ts
import { createDotConfig } from "@hua-labs/dot";

createDotConfig({
  // Default output target. Overridable per-call via options.target.
  // Defaults to 'web'.
  runtime: "web",

  // Token overrides — deep-merged with built-in defaults.
  theme: {
    colors: {
      brand: { 500: "#6630E6", 700: "#4A1FA8" },
    },
    spacing: {
      "18": "72px",
      "22": "88px",
    },
    borderRadius: {
      xl: "16px",
    },
    fontSize: {
      display: "3.5rem",
    },
    fontWeight: {
      black: 900,
    },
    fontFamily: {
      brand: "'Inter', sans-serif",
    },
    lineHeight: {
      relaxed: "1.75",
    },
    letterSpacing: {
      widest: "0.15em",
    },
    shadows: {
      card: "0 4px 12px rgba(0,0,0,0.08)",
    },
    gridCols: {
      "7": "repeat(7, minmax(0, 1fr))",
    },

    // Semantic color tokens — mapped to CSS variables.
    // Option 1: string[] — auto-maps to var(--color-{name})
    semanticColors: ["sidebar", "sidebar-foreground", "chart-1"],
    // Option 2: Record<string, string> — explicit variable references
    // semanticColors: { brand: 'var(--my-brand)', accent: 'var(--theme-accent)' }

    // Override CSS variable prefix for shorthand form. Defaults to '--color'.
    semanticPrefix: "--color",
  },

  // Custom breakpoint names in mobile-first order.
  // Defaults to ['sm', 'md', 'lg', 'xl', '2xl'].
  breakpoints: ["sm", "md", "lg", "xl", "2xl"],

  // Min-width values for custom breakpoints (used by class mode @media rules).
  // Merged with defaults.
  breakpointWidths: {
    tablet: "900px",
    desktop: "1280px",
  },

  // rem base for px↔rem/em conversion in native and flutter adapters.
  // Defaults to 16.
  remBase: 16,

  // Enable caching. Defaults to true.
  cache: true,

  // Input cache capacity (Layer 1). Defaults to 500.
  cacheSize: 500,

  // Throw on unknown tokens. Defaults to false.
  strictMode: false,

  // console.warn on unknown tokens. Defaults to true in NODE_ENV=development.
  warnUnknown: false,
});
```

After calling `createDotConfig`, all subsequent `dot()` / `dotMap()` calls use the new config. Call `clearDotCache()` if you change config at runtime and need the cache cleared.

---

## Core API

### dot(input, options?)

Converts a utility string to a style object.

```ts
function dot(
  input: string | undefined | null,
  options?: DotOptions,
): StyleObject;
// Overloads narrow the return type by target literal:
function dot(input, options: { target: "native" }): RNStyleObject;
function dot(input, options: { target: "flutter" }): FlutterRecipe;
```

**Options:**

| Option       | Type                             | Description                                                               |
| ------------ | -------------------------------- | ------------------------------------------------------------------------- |
| `dark`       | `boolean`                        | Apply `dark:` variant classes                                             |
| `breakpoint` | `string`                         | Active breakpoint for mobile-first cascade (`'sm'`, `'md'`, `'lg'`, etc.) |
| `target`     | `'web' \| 'native' \| 'flutter'` | Override the global runtime for this call                                 |

```ts
// Web — returns CSSProperties-compatible object
dot("p-4 flex items-center");
// { padding: '16px', display: 'flex', alignItems: 'center' }

// Native — px values become numbers
dot("p-4 rounded-lg", { target: "native" });
// { padding: 16, borderRadius: 8 }

// Flutter — returns FlutterRecipe
dot("p-4 bg-blue-500", { target: "flutter" });
// { padding: { top: 16, ... }, decoration: { color: '#3b82f6' } }

// Dark mode
dot("bg-white text-black dark:bg-gray-900 dark:text-white", { dark: true });
// { backgroundColor: '#111827', color: '#ffffff' }

// Responsive — mobile-first, cascades up to the active breakpoint
dot("p-2 sm:p-4 md:p-6 lg:p-8", { breakpoint: "md" });
// { padding: '24px' }  (base + sm + md applied)

// Null/undefined safe — returns {}
dot(null);
dot(undefined);
dot("  ");
```

### dotMap(input, options?)

Same signature and type overloads as `dot()`. Resolves state variants into separate style objects instead of ignoring them.

```ts
function dotMap(
  input: string | undefined | null,
  options?: DotOptions,
): DotStyleMap<StyleObject>;
```

State variants: `hover:`, `focus:`, `active:`, `focus-visible:`, `focus-within:`, `disabled:`

```ts
const styles = dotMap("bg-white hover:bg-gray-100 focus:ring-2 disabled:opacity-50");
// {
//   base: { backgroundColor: '#ffffff' },
//   hover: { backgroundColor: '#f3f4f6' },
//   focus: { boxShadow: '0 0 0 3px ...' },
//   disabled: { opacity: 0.5 },
// }

// React usage — attach styles via event handlers
function Button({ children }) {
  const [hovered, setHovered] = useState(false);
  const s = dotMap("bg-primary-500 hover:bg-primary-700 focus:ring-2");
  return (
    <button
      style={{ ...s.base, ...(hovered ? s.hover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
```

### dotExplain(input, options?)

Resolves styles and returns a capability report. Useful for debugging cross-platform compatibility.

```ts
interface DotExplainResult {
  styles: StyleObject | RNStyleObject | FlutterRecipe;
  report: DotCapabilityReport;
}

dotExplain("p-4 blur-md grid grid-cols-3 transition-all", { target: "native" });
// {
//   styles: { padding: 16 },
//   report: {
//     _dropped: ['filter', 'gridTemplateColumns', 'transitionProperty', ...],
//     _approximated: [],
//     _capabilities: { filter: 'unsupported', grid: 'unsupported', transition: 'unsupported' }
//   }
// }
```

For `target: 'web'`, the report is always empty `{}` — all properties are natively supported.

---

## Resolver Modules

Each module handles a specific group of Tailwind-compatible utility prefixes:

| Module          | Handles                                                                                                                                                                                         |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spacing`       | `p-`, `m-`, `px-`, `py-`, `pt-`, `pr-`, `pb-`, `pl-`, `gap-`, `gap-x-`, `gap-y-`, `space-x-`, `space-y-`                                                                                        |
| `color`         | `bg-{color}-{shade}`, `text-{color}`, `border-{color}`, opacity modifiers `/50`                                                                                                                 |
| `typography`    | `text-{size}`, `font-{weight/family}`, `leading-`, `tracking-`, `uppercase`, `italic`, `truncate`, `text-{align}`                                                                               |
| `layout`        | `flex`, `block`, `grid`, `inline`, `hidden`, `overflow-`, `aspect-ratio-`                                                                                                                       |
| `border`        | `border`, `border-{side}`, `border-{width}`, `border-{style}`, `rounded-`, `rounded-{corner}-`                                                                                                  |
| `flexbox`       | `flex-row`, `flex-col`, `flex-wrap`, `items-`, `justify-`, `self-`, `content-`, `flex-{grow/shrink}`, `flex-basis-`, `order-`                                                                   |
| `grid`          | `grid-cols-`, `grid-rows-`, `col-span-`, `row-span-`, `col-start-`, `col-end-`                                                                                                                  |
| `shadow`        | `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-none` (composes with ring into `boxShadow`)                                                                           |
| `ring`          | `ring-`, `ring-{color}`, `ring-offset-` (prepended before shadow in final `boxShadow`)                                                                                                          |
| `z-index`       | `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`, `z-auto`                                                                                                                                         |
| `positioning`   | `static`, `relative`, `absolute`, `fixed`, `sticky`, `top-`, `right-`, `bottom-`, `left-`, `inset-`                                                                                             |
| `opacity`       | `opacity-0`, `opacity-25`, `opacity-50`, `opacity-75`, `opacity-100`                                                                                                                            |
| `transform`     | `rotate-`, `scale-`, `scale-x-`, `scale-y-`, `translate-x-`, `translate-y-`, `skew-x-`, `skew-y-`, `origin-` (accumulates into single `transform` string)                                       |
| `animation`     | `animate-spin`, `animate-ping`, `animate-pulse`, `animate-bounce`                                                                                                                               |
| `transition`    | `transition-`, `duration-`, `ease-`, `delay-`                                                                                                                                                   |
| `filter`        | `blur-`, `brightness-`, `contrast-`, `grayscale-`, `hue-rotate-`, `invert-`, `saturate-`, `sepia-`, `drop-shadow-`                                                                              |
| `backdrop`      | `backdrop-blur-`, `backdrop-brightness-`, `backdrop-contrast-`, `backdrop-grayscale-`, `backdrop-hue-rotate-`, `backdrop-invert-`, `backdrop-opacity-`, `backdrop-saturate-`, `backdrop-sepia-` |
| `gradient`      | `bg-gradient-to-{r/l/t/b/tr/tl/br/bl}`, `from-`, `via-`, `to-`, position modifiers `from-10%`                                                                                                   |
| `line-clamp`    | `line-clamp-{1-6}`, `line-clamp-none`                                                                                                                                                           |
| `interactivity` | `cursor-`, `select-`, `resize-`, `pointer-events-`                                                                                                                                              |
| `divide`        | `divide-x-`, `divide-y-`, `divide-reverse` (class mode only — produces child-combinator CSS, no inline style)                                                                                   |
| `object-fit`    | `object-contain`, `object-cover`, `object-fill`, `object-none`, `object-scale-down`                                                                                                             |
| `table`         | `table`, `table-auto`, `table-fixed`, `border-collapse`, `border-separate`                                                                                                                      |
| `list`          | `list-none`, `list-disc`, `list-decimal`, `list-inside`, `list-outside`                                                                                                                         |
| `scroll`        | `scroll-smooth`, `scroll-auto`, `scroll-m-`, `scroll-p-`                                                                                                                                        |
| `outline`       | `outline-none`, `outline`, `outline-{style}`, `outline-{color}`, `outline-{width}`, `outline-offset-`                                                                                           |

> `utils.ts` is an internal helpers module, not a public resolver.

---

## Adapters

### adaptWeb

Identity adapter. Returns the input `StyleObject` unchanged. Included for structural symmetry.

```ts
import { adaptWeb } from "@hua-labs/dot";
adaptWeb({ padding: "16px" }); // → { padding: '16px' }
```

### adaptNative

Converts a web `StyleObject` to a React Native `StyleSheet`-compatible object.

```ts
import { adaptNative } from "@hua-labs/dot";

adaptNative({
  padding: "16px",
  borderRadius: "8px",
  transform: "rotate(45deg)",
});
// { padding: 16, borderRadius: 8, transform: [{ rotate: '45deg' }] }
```

**Conversion rules:**

- `px` values → plain numbers (`padding: '16px'` → `padding: 16`)
- `rem`/`em` → multiplied by `remBase` (default 16) then converted to number
- `transform` string → array of `{ fnName: value }` entries
- `boxShadow` → `{ shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }`
- `objectFit` → `resizeMode` (`cover`, `contain`, `stretch`, `center`)
- `WebkitLineClamp` → `numberOfLines`
- `display` → only `'flex'` and `'none'` pass through
- `opacity`, `flexGrow`, `flexShrink` → `parseFloat`
- `zIndex`, `order` → `parseInt`
- `lineHeight` unitless multiplier → absolute pixels (`fontSize * multiplier`)
- CSS custom properties (`--*`) → dropped
- CSS variable values (`var(...)`) → dropped
- **45+ unsupported props dropped silently** — see full list: animation, transition, backdropFilter, cursor, outline, grid\*, filter, userSelect, float, clear, isolation, table/border-collapse/list-style/scroll-\*, willChange, touchAction, textIndent, wordBreak, backgroundImage, backgroundClip, overflow-x/y, visibility

**Options:**

```ts
interface AdaptNativeOptions {
  remBase?: number; // default 16
  warnDropped?: boolean; // emit console.warn for dropped props (once per property)
}
```

The RN subpath (`@hua-labs/dot/native`) auto-sets `target: 'native'` without needing explicit options:

```ts
import { dot } from "@hua-labs/dot/native";
dot("p-4 rounded-lg"); // → RNStyleObject automatically
```

Metro resolves the `react-native` conditional export automatically.

### adaptFlutter

Converts a web `StyleObject` to a `FlutterRecipe` — a structured widget composition map that a Flutter renderer or SDUI engine maps to actual Flutter widgets.

```ts
import { adaptFlutter } from "@hua-labs/dot";
import type { FlutterRecipe } from "@hua-labs/dot";

const recipe = adaptFlutter({
  padding: "16px",
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "700",
  color: "#ffffff",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
}) as FlutterRecipe;
```

**FlutterRecipe structure:**

| Field         | Flutter equivalent             | Populated by                                                                                                                       |
| ------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `decoration`  | `BoxDecoration`                | bg color, border, borderRadius, boxShadow, gradient                                                                                |
| `padding`     | `EdgeInsets.only()`            | `padding-*`                                                                                                                        |
| `margin`      | `EdgeInsets.only()`            | `margin-*`                                                                                                                         |
| `constraints` | `SizedBox` / `ConstrainedBox`  | `width`, `height`, `min-*`, `max-*`, `w-full`→`expandWidth`                                                                        |
| `layout`      | `Row` / `Column` / `Wrap`      | `flex-direction`, `justify-content`, `align-items`, `flex-wrap`                                                                    |
| `flexChild`   | `Flexible` / `Expanded`        | `flex-grow`, `flex-shrink`, `order`                                                                                                |
| `positioning` | `Positioned` (inside `Stack`)  | `position`, `top`, `right`, `bottom`, `left`                                                                                       |
| `textStyle`   | `TextStyle`                    | `font-size`, `font-weight`, `font-family`, `color`, `letter-spacing`, `line-height`, `text-decoration`, `text-align`, `line-clamp` |
| `transform`   | `Matrix4` / `Transform` widget | `transform` — parsed into rotate/scale/translate/skew                                                                              |
| `opacity`     | `Opacity` widget               | `opacity`                                                                                                                          |
| `visible`     | `Visibility` widget            | `visibility`                                                                                                                       |
| `aspectRatio` | `AspectRatio` widget           | `aspect-ratio`                                                                                                                     |
| `zIndex`      | ordering in `Stack`            | `z-index`                                                                                                                          |
| `_dropped`    | —                              | Properties not mappable to any Flutter concept                                                                                     |

**FlutterGradient** (`decoration.gradient`): produced by gradient utilities — `bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500` → `{ type: 'linear', begin: 'centerLeft', end: 'centerRight', colors: [...], stops?: [...] }`.

**Options:**

```ts
interface AdaptFlutterOptions {
  remBase?: number; // default 16
}
```

---

## Variant System

### dotVariants

CVA-style variant factory. Returns a function that accepts variant props and produces a merged `StyleObject`.

```ts
import { dotVariants } from "@hua-labs/dot";

const badge = dotVariants({
  // Applied to all variants
  base: "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",

  variants: {
    variant: {
      default: "bg-primary-500 text-white border-transparent",
      secondary: "bg-gray-100 text-gray-900 border-transparent",
      destructive: "bg-red-500 text-white border-transparent",
      outline: "border-border text-foreground",
    },
    size: {
      sm: "text-xs px-2 py-0.5",
      md: "text-sm px-2.5 py-1",
    },
  },

  defaultVariants: {
    variant: "default",
    size: "md",
  },

  // Applied when multiple variant conditions match simultaneously
  compoundVariants: [
    {
      conditions: { variant: "destructive", size: "sm" },
      dot: "font-bold",
    },
  ],
});

badge(); // base + default + md
badge({ variant: "outline" }); // base + outline + md
badge({ variant: "destructive", size: "sm" }); // base + destructive + sm + compoundVariant
```

**Notes:**

- Variant styles are shallow-merged in order: base → variant axes → compound variants
- The underlying `dot()` function is called lazily per unique variant string and cached
- Flutter target is not supported — `FlutterRecipe` uses nested objects incompatible with shallow merge. Use `dot(input, { target: 'flutter' })` directly.

### dotCx

Filters falsy values and joins utility strings. No style resolution.

```ts
import { dotCx } from "@hua-labs/dot";

dotCx("p-4", isActive && "bg-primary-500", undefined, false, "rounded-lg");
// → "p-4 bg-primary-500 rounded-lg"
```

---

## Class Mode

Import from the `/class` subpath. Produces stable CSS class names and rulesets instead of inline style objects. Suitable for SSR and for utilities that require child combinators (like `divide-x`).

```ts
import { dotClass, dotCSS, dotFlush, dotReset } from "@hua-labs/dot/class";
```

### dotClass

Generates a stable hash-based class name and injects the CSS rule into:

- **Browser**: a shared `<style>` element in `<head>`
- **SSR**: an in-memory buffer (collect with `dotFlush()`)

```ts
const cls = dotClass("p-4 hover:bg-red-500 focus:ring-2");
// → 'dot-a3f2b1'

// Apply to element
<div className={cls} />
```

### dotCSS

Like `dotClass` but also returns the generated CSS string for inspection or manual injection.

```ts
const { className, css } = dotCSS("p-4 hover:bg-red-500 md:p-8");
// className: 'dot-a3f2b1'
// css: '.dot-a3f2b1 { padding: 1rem }\n@media (min-width:768px){.dot-a3f2b1{padding:2rem}}\n.dot-a3f2b1:hover { background-color: #ef4444 }'
```

### dotFlush

Collects all CSS generated since the last flush and resets the buffer. Call during SSR to inject styles into the `<style>` tag.

```ts
// In a Next.js layout or document
const allCSS = dotFlush();
// → full CSS string of all generated rules

// Inject:
<style dangerouslySetInnerHTML={{ __html: allCSS }} />
```

### dotReset

Clears the class cache and the CSS buffer. Use between test runs or isolated SSR renders.

```ts
dotReset();
```

### DotClassOptions

```ts
interface DotClassOptions {
  naming?: "hash" | "atomic"; // 'hash' = one class per input string (default)
  darkMode?: "class" | "media"; // how dark: variants are emitted
}
```

### divide-x / divide-y — class mode only

The `divide-x-`, `divide-y-` utilities produce child-combinator CSS (`> * + *`) which cannot be expressed as inline styles. They resolve to internal markers in inline mode and are silently stripped. Use class mode:

```ts
const cls = dotClass("divide-y divide-gray-200");
// → generates: '.dot-xyz > * + * { border-top-width: 1px; border-color: #e5e7eb }'
```

---

## Capability System

### CAPABILITY_MATRIX

Static constant mapping utility family → target → support level.

```ts
import { CAPABILITY_MATRIX } from "@hua-labs/dot";

CAPABILITY_MATRIX["gradient"];
// { web: 'native', native: 'unsupported', flutter: 'recipe-only' }

CAPABILITY_MATRIX["shadow"];
// { web: 'native', native: 'approximate', flutter: 'native' }

CAPABILITY_MATRIX["filter"];
// { web: 'native', native: 'unsupported', flutter: 'plugin-backed' }
```

Support levels:

| Level           | Meaning                                                                              |
| --------------- | ------------------------------------------------------------------------------------ |
| `native`        | Target supports the intent directly                                                  |
| `approximate`   | Target produces a similar but not identical effect (e.g., RN shadow via `elevation`) |
| `recipe-only`   | Requires a widget/component recipe, not a flat style (e.g., Flutter gradients)       |
| `plugin-backed` | Needs an ecosystem plugin/package (e.g., `BackdropFilter` on Flutter)                |
| `unsupported`   | Not available on this target                                                         |

### PROPERTY_TO_FAMILY

Maps CSS property names to utility family names for use with `CAPABILITY_MATRIX`.

```ts
import { PROPERTY_TO_FAMILY } from "@hua-labs/dot";

PROPERTY_TO_FAMILY["backgroundImage"]; // 'gradient'
PROPERTY_TO_FAMILY["gridTemplateColumns"]; // 'grid'
PROPERTY_TO_FAMILY["boxShadow"]; // 'shadow'
```

### getCapability

Programmatic per-property capability query. Checks value-level overrides first (e.g., `display: flex` is `native` on RN even though `display: grid` is `unsupported`), then falls back to family-level lookup.

```ts
import { getCapability } from "@hua-labs/dot";

getCapability("padding", "native"); // 'native'
getCapability("filter", "native"); // 'unsupported'
getCapability("backgroundImage", "flutter"); // 'recipe-only'
getCapability("display", "native", "flex"); // 'native'
getCapability("display", "native", "grid"); // 'approximate'
```

### dotExplain

Resolves a utility string and returns both styles and a full capability report. See [Core API](#core-api) section for examples.

---

## Advanced Features

### Arbitrary values

Wrap any value in square brackets to pass it through directly.

```ts
dot(
  "w-[300px] h-[calc(100vh-64px)] bg-[#ff0000] p-[2rem] text-[clamp(1rem,2.5vw,2rem)]",
);
// { width: '300px', height: 'calc(100vh-64px)', backgroundColor: '#ff0000',
//   padding: '2rem', fontSize: 'clamp(1rem,2.5vw,2rem)' }
```

### Opacity modifiers

Append `/{opacity}` to color utilities to apply alpha.

```ts
dot("bg-primary-500/50 text-gray-900/80 border-blue-500/20");
// backgroundColor: 'rgb(59 130 246 / 0.5)'
// color: 'rgb(17 24 39 / 0.8)'
// borderColor: 'rgb(59 130 246 / 0.2)'
```

### Negative values

Prefix with `-` for negative spacing, translate, rotate, and positioning values.

```ts
dot("-m-4 -translate-x-2 -top-1");
// { margin: '-16px', transform: 'translateX(-8px)', top: '-4px' }
```

### !important modifier

Prefix a utility with `!` to add `!important` to the generated value.

```ts
dot("!p-4 !bg-white !rounded-none");
// { padding: '16px !important', backgroundColor: '#ffffff !important', borderRadius: '0 !important' }
```

`!important` propagates through shadow/ring composition — if any layer is flagged, the merged `boxShadow` string gets `!important`.

### Gradient composition

Multiple gradient utilities are collected as internal markers and composed into a single `backgroundImage` at finalization.

```ts
dot("bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500");
// { backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899)' }

// With position stops
dot(
  "bg-gradient-to-b from-blue-500 from-10% via-purple-500 via-50% to-pink-500 to-90%",
);
// { backgroundImage: 'linear-gradient(to bottom, #3b82f6 10%, #a855f7 50%, #ec4899 90%)' }

// Arbitrary direction
dot("bg-gradient-to-tr from-emerald-400 to-cyan-400");
// { backgroundImage: 'linear-gradient(to top right, #34d399, #22d3ee)' }
```

On Flutter, gradient input produces a `FlutterGradient` inside `recipe.decoration.gradient` instead of `backgroundImage`.

### Ring + shadow composition

`ring-*` and `shadow-*` utilities set internal markers (`__dot_ringLayer`, `__dot_shadowLayer`) that are merged into a single `boxShadow` string at finalization. The ring layer is always prepended (Tailwind convention).

```ts
dot("ring-2 ring-blue-500 shadow-md");
// { boxShadow: '0 0 0 2px #3b82f6, 0 4px 6px -1px rgba(0,0,0,0.1)' }

dot("focus:ring-2 focus:ring-primary-500");
// via dotMap → focus: { boxShadow: '0 0 0 2px #3b82f6' }
```

### Custom breakpoints

```ts
createDotConfig({
  breakpoints: ["sm", "tablet", "md", "desktop", "lg"],
  breakpointWidths: {
    tablet: "900px",
    desktop: "1280px",
  },
});

dot("p-4 tablet:p-6 desktop:p-8", { breakpoint: "desktop" });
// { padding: '32px' }  (base + tablet + desktop applied)
```

Class mode uses `breakpointWidths` to generate `@media (min-width: ...)` rules.

### Semantic color tokens

CSS variable-backed color tokens for use with design systems.

```ts
import { semanticVars, createDotConfig } from "@hua-labs/dot";

createDotConfig({
  theme: {
    semanticColors: {
      // Built-in shadcn tokens are pre-registered:
      // background, foreground, card, card-foreground, muted, muted-foreground,
      // accent, accent-foreground, primary, primary-foreground, secondary,
      // secondary-foreground, destructive, destructive-foreground,
      // border, input, ring, popover, popover-foreground

      // Add your own:
      ...semanticVars("sidebar", "sidebar-foreground", "chart-1"),
      brand: "var(--my-brand-color)",
    },
  },
});

dot("bg-sidebar text-sidebar-foreground");
// { backgroundColor: 'var(--color-sidebar)', color: 'var(--color-sidebar-foreground)' }
```

`semanticVars()` helper generates the mapping for you:

```ts
semanticVars("sidebar", "chart-1");
// { sidebar: 'var(--color-sidebar)', 'chart-1': 'var(--color-chart-1)' }

semanticVars({ prefix: "--theme" }, "brand");
// { brand: 'var(--theme-brand)' }
```

---

## Caching

`dot()` uses a 2-layer FIFO cache:

| Layer                 | Key                                  | Capacity     | Purpose                                       |
| --------------------- | ------------------------------------ | ------------ | --------------------------------------------- |
| Layer 1 (input cache) | full input string + options encoding | 500 entries  | Skip parsing + resolving entirely             |
| Layer 2 (token cache) | individual token string              | 1000 entries | Skip resolving; still parses the input string |

Cache keys encode target, active breakpoint, and dark mode flag to avoid cross-context collisions.

FIFO eviction: when at capacity, the oldest entry is deleted before inserting the new one.

```ts
import { clearDotCache, createDotConfig } from "@hua-labs/dot";

// After a config change, clear stale entries
createDotConfig({ theme: { colors: { brand: { 500: "#new" } } } });
clearDotCache();

// Disable caching entirely (useful for SSR micro-environments)
createDotConfig({ cache: false });

// Resize the input cache
createDotConfig({ cacheSize: 1000 });
```

`dotMap()` uses the same cache with a distinct key prefix to avoid collisions with `dot()` output.

---

## Type Reference

| Type                   | Description                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `StyleObject`          | `Record<string, string \| number>` — Web CSSProperties-compatible output                                                  |
| `RNStyleObject`        | `Record<string, RNStyleValue>` — React Native StyleSheet-compatible output                                                |
| `RNStyleValue`         | `string \| number \| RNTransformEntry[] \| RNShadowOffset`                                                                |
| `RNTransformEntry`     | `Record<string, string \| number>` — single RN transform entry, e.g. `{ rotate: '45deg' }`                                |
| `RNShadowOffset`       | `{ width: number; height: number }`                                                                                       |
| `DotTarget`            | `'web' \| 'native' \| 'flutter'`                                                                                          |
| `DotOptions`           | `{ dark?: boolean; breakpoint?: string; target?: DotTarget }`                                                             |
| `DotState`             | `'hover' \| 'focus' \| 'active' \| 'focus-visible' \| 'focus-within' \| 'disabled'`                                       |
| `DotStyleMap<T>`       | `{ base: T; hover?: T; focus?: T; active?: T; 'focus-visible'?: T; 'focus-within'?: T; disabled?: T }`                    |
| `DotToken`             | Parsed token: `{ variants, prefix, value, raw, negative, important }`                                                     |
| `DotUserConfig`        | Full user-facing config shape — see [createDotConfig](#createdotconfig--full-options)                                     |
| `DotConfig`            | Resolved internal config (tokens, cache, breakpointOrder, etc.)                                                           |
| `ResolvedTokens`       | Merged token table (colors, spacing, fontSize, shadows, etc.)                                                             |
| `ResolverFn`           | `(prefix: string, value: string, config: DotConfig) => StyleObject`                                                       |
| `DotAdapterOutput`     | `StyleObject \| RNStyleObject \| FlutterRecipe`                                                                           |
| `CapabilityLevel`      | `'native' \| 'approximate' \| 'recipe-only' \| 'plugin-backed' \| 'unsupported'`                                          |
| `TargetCapability`     | `Record<DotTarget, CapabilityLevel>`                                                                                      |
| `DotCapabilityReport`  | `{ _dropped?, _approximated?, _capabilities?, _details? }`                                                                |
| `AdaptNativeOptions`   | `{ remBase?: number; warnDropped?: boolean }`                                                                             |
| `AdaptFlutterOptions`  | `{ remBase?: number }`                                                                                                    |
| `FlutterRecipe`        | Full widget recipe — see [adaptFlutter](#adaptflutter)                                                                    |
| `FlutterDecoration`    | `BoxDecoration` fields: color, gradient, borderRadius, border, boxShadow                                                  |
| `FlutterEdgeInsets`    | `{ top?, right?, bottom?, left? }` — `EdgeInsets.only()`                                                                  |
| `FlutterConstraints`   | `{ width?, height?, minWidth?, maxWidth?, ..., expandWidth?, expandHeight? }`                                             |
| `FlutterLayout`        | `{ direction?, mainAxisAlignment?, crossAxisAlignment?, wrap? }`                                                          |
| `FlutterFlexChild`     | `{ flex?, flexFit?, order? }`                                                                                             |
| `FlutterPositioning`   | `{ type?, top?, right?, bottom?, left? }`                                                                                 |
| `FlutterTextStyle`     | `{ color?, fontSize?, fontWeight?, fontFamily?, letterSpacing?, height?, decoration?, textAlign?, maxLines?, overflow? }` |
| `FlutterTransform`     | `{ rotate?, scaleX?, scaleY?, translateX?, translateY?, skewX?, skewY?, origin? }`                                        |
| `FlutterBoxShadow`     | `{ color, offset: { dx, dy }, blurRadius, spreadRadius }`                                                                 |
| `FlutterBorderSide`    | `{ width?, color?, style? }`                                                                                              |
| `FlutterBorderRadius`  | `{ topLeft?, topRight?, bottomLeft?, bottomRight? }`                                                                      |
| `FlutterGradient`      | `{ type: 'linear', begin, end, colors, stops? }`                                                                          |
| `DotVariantsConfig<V>` | `{ base?, variants?, defaultVariants?, compoundVariants? }`                                                               |
| `DotVariantsFn<V>`     | `(props?: VariantProps<V>) => StyleObject`                                                                                |
| `VariantProps<V>`      | Inferred props type for a `dotVariants` config                                                                            |
| `CompoundVariant<V>`   | `{ conditions: Partial<VariantProps<V>>, dot: string }`                                                                   |
| `VariantShape`         | `Record<string, Record<string, string>>`                                                                                  |
| `DotClassOptions`      | `{ naming?: 'hash' \| 'atomic'; darkMode?: 'class' \| 'media' }`                                                          |
| `DotClassResult`       | `{ className: string; css: string }`                                                                                      |
