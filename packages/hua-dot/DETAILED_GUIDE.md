# @hua-labs/dot Detailed Guide

Cross-platform utility style engine that parses Tailwind-inspired utility strings into flat style objects for Web, React Native, and Flutter via a shared resolver pipeline and target-specific adapters.

---

## Table of Contents

- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### Resolver Pipeline

Every call to `dot()` or `dotMap()` passes through a multi-stage pipeline:

1. **Parser** — tokenizes the input string into `DotToken[]`, splitting on whitespace and extracting variants (prefixes before `:`), the `!important` flag, and arbitrary value brackets.
2. **Variant categorizer** — classifies each token's variants as `dark`, `breakpoint`, `state`, or unsupported. Tokens with unsupported variants are silently skipped.
3. **Token resolver** — maps each raw utility (e.g. `p-4`, `bg-blue-500`) to a partial `StyleObject` using one of 25 resolver modules. Results are stored in the token-level cache.
4. **Layer merger** — places resolved objects into four buckets (`base`, `bpLayers`, `darkBase`, `darkBpLayers`) and cascades them in mobile-first order: `base → sm → md → lg → xl → 2xl → dark → dark:sm → ...`
5. **Finalizer** — collapses internal accumulation keys: shadow/ring layers → `boxShadow`, gradient direction/stops → `backgroundImage`, divide keys are stripped.
6. **Target adapter** — passes the finalized `StyleObject` to `adaptNative()`, `adaptFlutter()`, or returns as-is for web.

```
Input string
    │
    ▼
  parse()  →  DotToken[]
    │
    ▼
  resolveToken()  →  StyleObject per token   (token-level FIFO cache: 1000 entries)
    │
    ▼
  mergeStyle()  →  layered buckets
    │
    ▼
  cascade + finalizeStyle()  →  clean StyleObject
    │
    ▼
  adaptNative() / adaptFlutter() / identity
    │
    ▼
  Final result  (input-level FIFO cache: 500 entries)
```

### Adapter System

Three adapters translate the web `StyleObject` into target-native formats:

| Adapter        | Target      | Behavior                                                                                                                                                                                                                |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adaptWeb`     | `'web'`     | Identity — returns the object unchanged                                                                                                                                                                                 |
| `adaptNative`  | `'native'`  | `px → number`, `transform → array`, `boxShadow → RN shadow props`, 45+ unsupported CSS properties silently dropped                                                                                                      |
| `adaptFlutter` | `'flutter'` | Structured `FlutterRecipe` map — groups properties into `decoration`, `padding`, `margin`, `constraints`, `layout`, `flexChild`, `positioning`, `textStyle`, `transform`, `opacity`, `visible`, `aspectRatio`, `zIndex` |

### Cache Layers

dot uses a two-layer FIFO cache scoped to the module-level singleton:

- **Input cache** — keyed on full context `(target, breakpoint, dark, input string)`. Capacity: 500 entries. A cache hit returns the final adapted result directly, skipping all pipeline stages.
- **Token cache** — keyed on the raw utility string after variant stripping (e.g. `p-4`). Capacity: 1000 entries. Avoids re-resolving the same token within a batch.

Both caches are reset by `clearDotCache()` or by calling `createDotConfig()` (which replaces the cache instance entirely).

Cache can be disabled globally:

```ts
createDotConfig({ cache: false });
```

### Config System

`createDotConfig()` applies a `DotUserConfig` deep-merge on top of the built-in token defaults and stores it as a module-level singleton. All subsequent calls to `dot()`, `dotMap()`, and `dotExplain()` read from this singleton.

The config controls:

| Field                  | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `theme.colors`         | Custom color palette (deep-merged into defaults)     |
| `theme.spacing`        | Custom spacing scale                                 |
| `theme.borderRadius`   | Custom radius tokens                                 |
| `theme.fontSize`       | Custom font size tokens                              |
| `theme.gridCols`       | Custom grid column tokens                            |
| `theme.semanticColors` | CSS variable color bridge                            |
| `breakpoints`          | Custom breakpoint name array                         |
| `remBase`              | px-per-rem for `rem` conversion (default: 16)        |
| `runtime`              | Default target: `'web'` \| `'native'` \| `'flutter'` |
| `cache`                | Enable/disable caching (default: `true`)             |
| `cacheSize`            | Override FIFO capacity                               |
| `strictMode`           | Throw on unknown tokens                              |
| `warnUnknown`          | `console.warn` on unknown tokens in dev              |

---

## Installation & Setup

### Basic (Web / Node)

```bash
pnpm add @hua-labs/dot
# or
npm install @hua-labs/dot
```

No peer dependencies. Zero runtime dependencies.

```ts
import { dot, dotMap, createDotConfig } from "@hua-labs/dot";

const style = dot("p-4 flex items-center bg-primary-500 text-white rounded-lg");
// { padding: '16px', display: 'flex', alignItems: 'center', ... }
```

### With React Native

The package ships a `react-native` conditional export. Metro resolves it automatically, so no extra config is needed in most setups.

```ts
// Explicit native subpath — always returns RNStyleObject
import { dot } from "@hua-labs/dot/native";

const style = dot("p-4 rounded-lg shadow-lg");
// { padding: 16, borderRadius: 8, shadowColor: '#000000', ... }
```

Alternatively, pass `target: 'native'` from the main entry:

```ts
import { dot } from "@hua-labs/dot";

const style = dot("p-4 rounded-lg", { target: "native" });
// { padding: 16, borderRadius: 8 }
```

#### Metro resolver config (if needed)

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.unstable_conditionNames = [
  "react-native",
  "require",
  "default",
];

module.exports = config;
```

### With Flutter (Dart bridge)

dot generates `FlutterRecipe` objects that a Dart FFI or JSON bridge can consume to drive widget composition on the Flutter side.

```ts
import { dot, adaptFlutter } from "@hua-labs/dot";
import type { FlutterRecipe } from "@hua-labs/dot";

// Via dot() directly
const recipe = dot("p-4 bg-blue-500 rounded-lg", {
  target: "flutter",
}) as FlutterRecipe;

// Via adaptFlutter() from an existing style object
const recipe2 = adaptFlutter({
  padding: "16px",
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
});
```

Send the recipe to Flutter via `jsonEncode` and reconstruct widgets based on the structured fields. See the [Flutter recipe section](#flutter-recipe-interpretation) for field details.

---

## Core Concepts

### Utility Resolution

dot resolves utility strings token by token. Each whitespace-separated token maps to one or more CSS properties via one of 25 resolver modules:

`spacing` · `color` · `typography` · `layout` · `border` · `flexbox` · `z-index` · `shadow` · `opacity` · `transform` · `transition` · `animation` · `backdrop` · `positioning` · `grid` · `ring` · `filter` · `interactivity` · `line-clamp` · `gradient` · `object-fit` · `table` · `list` · `scroll` · `divide` (+ word-break, outline within shared resolvers)

```ts
dot("p-4 flex items-center gap-2 text-sm font-medium");
// {
//   padding: '16px',
//   display: 'flex',
//   alignItems: 'center',
//   gap: '8px',
//   fontSize: '14px',
//   fontWeight: '500',
// }
```

### Targets

The `target` option (or `createDotConfig({ runtime })`) selects the output format:

```ts
// Web (default) — CSSProperties
dot("p-4 rounded-lg");
// { padding: '16px', borderRadius: '8px' }

// React Native — RNStyleObject
dot("p-4 rounded-lg rotate-45", { target: "native" });
// { padding: 16, borderRadius: 8, transform: [{ rotate: '45deg' }] }

// Flutter — FlutterRecipe
dot("p-4 bg-blue-500 rounded-lg", { target: "flutter" });
// { padding: { top: 16, right: 16, bottom: 16, left: 16 },
//   decoration: { color: '#3b82f6', borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 } } }
```

TypeScript overloads narrow the return type when `target` is a string literal:

```ts
const s1 = dot("p-4"); // StyleObject
const s2 = dot("p-4", { target: "native" }); // RNStyleObject
const s3 = dot("p-4", { target: "flutter" }); // FlutterRecipe
```

### Dark Mode

Pass `dark: true` to activate `dark:` prefixed utilities. Without this flag, dark-prefixed tokens are silently skipped, so you can always pass the app's current color scheme:

```ts
dot("bg-white text-gray-900 dark:bg-gray-900 dark:text-white", {
  dark: isDarkMode,
});
```

In class mode, dark mode behavior is controlled by the `darkMode` option on `dotClass()`:

```ts
dotClass("bg-white dark:bg-gray-900", { darkMode: "class" });
// Emits: .dot-xxx { background-color: #fff } .dark .dot-xxx { background-color: #111827 }

dotClass("bg-white dark:bg-gray-900", { darkMode: "media" });
// Emits: .dot-xxx { background-color: #fff } @media (prefers-color-scheme: dark) { .dot-xxx { ... } }
```

### Responsive Variants

dot uses a mobile-first cascade. Breakpoints are applied only when `breakpoint` is set and only tokens at or below that breakpoint are included:

```ts
// Default breakpoints: sm (640px) | md (768px) | lg (1024px) | xl (1280px) | 2xl (1536px)
dot("p-4 md:p-8 lg:p-12", { breakpoint: "lg" });
// Mobile-first: base (p-4) → md (p-8) → lg (p-12)
// { padding: '48px' }

dot("p-4 md:p-8 lg:p-12", { breakpoint: "md" });
// { padding: '32px' }

dot("p-4 md:p-8 lg:p-12");
// No active breakpoint → only base styles
// { padding: '16px' }
```

### Arbitrary Values

Square brackets escape arbitrary values, bypassing the token lookup:

```ts
dot("w-[300px] h-[calc(100vh-64px)] bg-[#ff0000] p-[2rem]");
// { width: '300px', height: 'calc(100vh-64px)', backgroundColor: '#ff0000', padding: '2rem' }
```

Arbitrary values are also supported for colors with opacity modifier:

```ts
dot("bg-[#6630E6]/50");
// { backgroundColor: 'rgb(102 48 230 / 0.5)' }
```

### Opacity Modifier

Append `/N` to color utilities to set opacity (0–100):

```ts
dot("bg-primary-500/50 text-gray-900/80 border-blue-500/25");
// backgroundColor: 'rgb(59 130 246 / 0.5)'
// color: 'rgb(17 24 39 / 0.8)'
// borderColor: 'rgb(59 130 246 / 0.25)'
```

### Negative Values

Prefix utilities with `-` for negative values:

```ts
dot("-m-4 -top-2 -translate-x-4");
// { margin: '-16px', top: '-8px', transform: 'translateX(-16px)' }
```

### !important Modifier

Prefix a utility with `!` to mark all its output values as `!important`:

```ts
dot("!p-4 !bg-white");
// { padding: '16px !important', backgroundColor: '#ffffff !important' }
```

`!important` propagates correctly through shadow and ring composition — if any layer has `!important`, the final `boxShadow` string is also marked.

---

## API Reference

### `dot(input, options?)`

Converts a utility string into a style object. Returns `StyleObject` (web), `RNStyleObject` (native), or `FlutterRecipe` (flutter) based on the `target` option.

```ts
function dot(
  input: string | undefined | null,
  options?: DotOptions,
): StyleObject;
function dot(
  input: string | undefined | null,
  options: DotOptions & { target: "native" },
): RNStyleObject;
function dot(
  input: string | undefined | null,
  options: DotOptions & { target: "flutter" },
): FlutterRecipe;
```

**DotOptions:**

| Property     | Type                             | Default          | Description                                   |
| ------------ | -------------------------------- | ---------------- | --------------------------------------------- |
| `dark`       | `boolean`                        | `false`          | Activate `dark:` variant utilities            |
| `breakpoint` | `string`                         | —                | Active breakpoint name for responsive cascade |
| `target`     | `'web' \| 'native' \| 'flutter'` | config `runtime` | Output target adapter                         |

```ts
dot("bg-white dark:bg-gray-900 md:p-8", {
  dark: true,
  breakpoint: "md",
  target: "web",
});
```

If `input` is `null`, `undefined`, or empty string, `dot()` returns `{}`.

---

### `dotMap(input, options?)`

Like `dot()`, but also resolves state variants (`hover:`, `focus:`, `active:`, `focus-visible:`, `focus-within:`, `disabled:`) into separate style objects.

```ts
function dotMap(
  input: string | undefined | null,
  options?: DotOptions,
): DotStyleMap<StyleObject>;
```

**Return type — DotStyleMap:**

```ts
interface DotStyleMap<T = StyleObject> {
  base: T;
  hover?: T;
  focus?: T;
  active?: T;
  "focus-visible"?: T;
  "focus-within"?: T;
  disabled?: T;
}
```

```ts
const styles = dotMap('bg-white hover:bg-gray-100 focus:ring-2 disabled:opacity-50');
// {
//   base: { backgroundColor: '#ffffff' },
//   hover: { backgroundColor: '#f3f4f6' },
//   focus: { boxShadow: '0 0 0 2px ...' },
//   disabled: { opacity: '0.5' },
// }

// React usage — apply handlers manually:
<div
  style={styles.base}
  onMouseEnter={e => Object.assign(e.currentTarget.style, styles.hover)}
  onMouseLeave={e => Object.assign(e.currentTarget.style, styles.base)}
/>
```

Same type-safe overloads as `dot()` apply for `native` and `flutter` targets.

---

### `dotExplain(input, options?)`

Resolves a utility string and returns both the style result and a capability report for the active target. On `'web'` target, the report is always empty (`{}`).

```ts
function dotExplain(
  input: string | undefined | null,
  options?: DotOptions,
): DotExplainResult;

interface DotExplainResult {
  styles: StyleObject | RNStyleObject | FlutterRecipe;
  report: DotCapabilityReport;
}

interface DotCapabilityReport {
  _dropped?: string[]; // CSS properties with no equivalent on target
  _approximated?: string[]; // Properties mapped with loss of fidelity
  _capabilities?: Record<string, CapabilityLevel>; // Level per property
  _details?: Record<string, string[]>; // Human-readable approximation notes
}
```

```ts
const result = dotExplain("p-4 blur-md grid grid-cols-3 transition-all", {
  target: "native",
});

// result.styles → { padding: 16 }  (only what native supports)
// result.report → {
//   _dropped: ['filter', 'gridTemplateColumns', 'transitionProperty'],
//   _capabilities: {
//     filter: 'unsupported',
//     gridTemplateColumns: 'unsupported',
//     transitionProperty: 'unsupported',
//   }
// }
```

Use `dotExplain()` during development to audit cross-platform compatibility before shipping a utility string to a non-web target.

---

### `dotVariants(config)`

CVA-style variant factory. Returns a callable function that resolves the correct dot utility string based on provided props.

```ts
function dotVariants<V extends VariantShape>(
  config: DotVariantsConfig<V>,
): DotVariantsFn<V>;

interface DotVariantsConfig<V> {
  base?: string;
  variants?: V;
  defaultVariants?: Partial<VariantProps<V>>;
  compoundVariants?: CompoundVariant<V>[];
}
```

```ts
const button = dotVariants({
  base: "inline-flex items-center font-medium rounded-lg transition-colors",
  variants: {
    intent: {
      primary: "bg-primary-500 text-white hover:bg-primary-600",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      danger: "bg-red-500 text-white hover:bg-red-600",
    },
    size: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "md",
  },
  compoundVariants: [
    {
      conditions: { intent: "primary", size: "lg" },
      dot: "shadow-lg",
    },
  ],
});

const style = button({ intent: "secondary", size: "sm" });
// Resolves to merged StyleObject for secondary + sm

// With TypeScript — VariantProps extracts the prop types:
type ButtonProps = VariantProps<typeof button>;
```

---

### `dotCx(...inputs)`

clsx replacement — filters falsy values and joins utility strings. Performs no style computation; useful for conditional string building before passing to `dot()`.

```ts
function dotCx(...inputs: (string | false | null | undefined | 0)[]): string;
```

```ts
const input = dotCx(
  "p-4 flex",
  isActive && "bg-primary-500",
  isDisabled && "opacity-50 cursor-not-allowed",
  hasError ? "border-red-500" : "border-gray-300",
);
// 'p-4 flex bg-primary-500 border-gray-300'  (if isActive=true, isDisabled=false, hasError=false)

const style = dot(input);
```

---

### `adaptNative(cssProps, options?)`

Directly convert a web `CSSProperties` object to `RNStyleObject`. Useful when you already have a plain style object from another source.

```ts
function adaptNative(
  style: StyleObject,
  options?: AdaptNativeOptions,
): RNStyleObject;

interface AdaptNativeOptions {
  remBase?: number; // px-per-rem (default: 16)
  warnDropped?: boolean; // console.warn dropped properties in dev
}
```

Conversions performed:

- `'16px'` → `16` (numeric)
- `'1rem'` → `16` (rem → px using remBase)
- `transform: 'rotate(45deg) scale(1.1)'` → `[{ rotate: '45deg' }, { scale: 1.1 }]`
- `boxShadow` → `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` (first non-inset layer only)
- 45+ CSS properties with no RN equivalent are silently dropped (e.g. `filter`, `transition`, `cursor`, `gridTemplateColumns`)

```ts
adaptNative(
  {
    padding: "16px",
    transform: "rotate(45deg)",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
    filter: "blur(4px)", // dropped
  },
  { warnDropped: true },
);

// {
//   padding: 16,
//   transform: [{ rotate: '45deg' }],
//   shadowColor: '#000000',
//   shadowOffset: { width: 0, height: 4 },
//   shadowOpacity: 0.1,
//   shadowRadius: 3,
// }
```

---

### `adaptFlutter(cssProps, options?)`

Convert a web `CSSProperties` object to a `FlutterRecipe`. The recipe is a structured map that a Flutter Dart bridge or codegen tool uses to drive widget composition.

```ts
function adaptFlutter(
  style: StyleObject,
  options?: AdaptFlutterOptions,
): FlutterRecipe;

interface AdaptFlutterOptions {
  remBase?: number; // default: 16
}
```

**FlutterRecipe fields:**

| Field                 | Flutter widget concept        | CSS source                                                  |
| --------------------- | ----------------------------- | ----------------------------------------------------------- |
| `decoration`          | `BoxDecoration`               | `backgroundColor`, `borderRadius`, `border`, `boxShadow`    |
| `decoration.gradient` | `LinearGradient`              | `backgroundImage: linear-gradient(...)`                     |
| `padding`             | `EdgeInsets`                  | `padding*`                                                  |
| `margin`              | `EdgeInsets`                  | `margin*`                                                   |
| `constraints`         | `SizedBox` / `BoxConstraints` | `width`, `height`, `minWidth`, `maxWidth`, etc.             |
| `layout`              | `Row` / `Column` layout hints | `flexDirection`, `justifyContent`, `alignItems`, `flexWrap` |
| `flexChild`           | `Flexible` / `Expanded`       | `flexGrow`, `flexShrink`, `flexBasis`                       |
| `positioning`         | `Positioned`                  | `position: absolute`, `top`, `right`, `bottom`, `left`      |
| `textStyle`           | `TextStyle`                   | `color`, `fontSize`, `fontWeight`, `letterSpacing`, etc.    |
| `transform`           | `Matrix4` hint                | `transform`                                                 |
| `opacity`             | `Opacity.opacity`             | `opacity`                                                   |
| `visible`             | `Visibility.visible`          | `visibility`                                                |
| `aspectRatio`         | `AspectRatio.aspectRatio`     | `aspectRatio`                                               |
| `zIndex`              | `Stack` z-ordering            | `zIndex`                                                    |

```ts
const recipe = adaptFlutter({
  padding: "16px",
  backgroundColor: "#3b82f6",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: "600",
  color: "#ffffff",
});

// {
//   padding: { top: 16, right: 16, bottom: 16, left: 16 },
//   decoration: {
//     color: '#3b82f6',
//     borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 },
//   },
//   textStyle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
// }
```

---

### `createDotConfig(userConfig?)`

Set the global token configuration. Deep-merges `userConfig.theme` into the built-in token defaults, rebuilds the config singleton, and resets caches.

```ts
function createDotConfig(userConfig?: DotUserConfig): DotConfig;
```

```ts
createDotConfig({
  theme: {
    colors: {
      brand: { 500: "#6630E6", 600: "#5520D0" },
      surface: "#1c1c1e",
    },
    spacing: { "18": "72px", "22": "88px" },
    borderRadius: { pill: "9999px" },
    fontSize: { "2xs": "10px" },
  },
  breakpoints: ["mobile", "tablet", "desktop"],
  remBase: 16,
  runtime: "web",
  strictMode: false,
  warnUnknown: true,
});

dot("bg-brand-500 p-18 rounded-pill");
// { backgroundColor: '#6630E6', padding: '72px', borderRadius: '9999px' }

dot("p-4 tablet:p-8", { breakpoint: "tablet" });
// { padding: '32px' }
```

Calling `createDotConfig()` always resets both cache layers.

---

### `clearDotCache()`

Clear both input and token caches without changing config. Use after config changes performed outside of `createDotConfig()`, or to free memory in long-running processes.

```ts
function clearDotCache(): void;
```

```ts
clearDotCache();
// Next dot() call will resolve fresh from scratch
```

---

### `semanticVars(...names)` / `semanticVars(options, ...names)`

Generate semantic color token mappings that point to CSS variables. Pass the result to `createDotConfig({ theme: { semanticColors: ... } })` to enable `bg-background`, `text-foreground`, etc. in utility strings.

```ts
function semanticVars(...names: string[]): Record<string, string>;
function semanticVars(
  options: { prefix: string },
  ...names: string[]
): Record<string, string>;
```

Default prefix is `--color`, producing `var(--color-<name>)`.

```ts
import { semanticVars, createDotConfig } from "@hua-labs/dot";

createDotConfig({
  theme: {
    semanticColors: {
      // Default --color prefix
      ...semanticVars(
        "background",
        "foreground",
        "card",
        "muted",
        "accent",
        "border",
      ),
      // Custom prefix
      ...semanticVars({ prefix: "--ui" }, "primary", "secondary"),
      // Explicit mapping
      brand: "var(--my-brand-color)",
    },
  },
});

dot("bg-background text-foreground border-border");
// { backgroundColor: 'var(--color-background)',
//   color: 'var(--color-foreground)',
//   borderColor: 'var(--color-border)' }
```

The 17 built-in semantic token names (always available without config): `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `border`, `ring`.

---

### `CAPABILITY_MATRIX`

Static constant mapping utility family names to per-target support levels.

```ts
const CAPABILITY_MATRIX: Record<
  string,
  Partial<Record<DotTarget, CapabilityLevel>>
>;

type CapabilityLevel =
  | "native"
  | "approximate"
  | "recipe-only"
  | "plugin-backed"
  | "unsupported";
```

Support levels:

| Level             | Meaning                                                      |
| ----------------- | ------------------------------------------------------------ |
| `'native'`        | Full, lossless support                                       |
| `'approximate'`   | Supported with caveats (e.g. RN shadow drops inset / spread) |
| `'recipe-only'`   | Flutter recipe output only — not applied as an inline style  |
| `'plugin-backed'` | Requires a Flutter plugin (e.g. `flutter_blur`)              |
| `'unsupported'`   | No equivalent on the target — property is dropped            |

```ts
import { CAPABILITY_MATRIX } from "@hua-labs/dot";

CAPABILITY_MATRIX["gradient"];
// { web: 'native', native: 'unsupported', flutter: 'recipe-only' }

CAPABILITY_MATRIX["shadow"];
// { web: 'native', native: 'approximate', flutter: 'native' }

CAPABILITY_MATRIX["filter"];
// { web: 'native', native: 'unsupported', flutter: 'plugin-backed' }
```

---

### `PROPERTY_TO_FAMILY`

Static constant mapping CSS property names to utility family names for use with `CAPABILITY_MATRIX`.

```ts
const PROPERTY_TO_FAMILY: Record<string, string>;
```

```ts
import { PROPERTY_TO_FAMILY, CAPABILITY_MATRIX } from "@hua-labs/dot";

const family = PROPERTY_TO_FAMILY["backgroundImage"]; // 'gradient'
const level = CAPABILITY_MATRIX[family]?.["native"]; // 'unsupported'

// Programmatic audit of a style object:
function auditForNative(style: Record<string, unknown>) {
  for (const prop of Object.keys(style)) {
    const family = PROPERTY_TO_FAMILY[prop];
    const level = family ? CAPABILITY_MATRIX[family]?.["native"] : undefined;
    if (level === "unsupported") console.warn(`Drop: ${prop} (${family})`);
    if (level === "approximate") console.warn(`Approx: ${prop} (${family})`);
  }
}
```

---

### `getCapability(property, target, value?)`

Programmatic per-property capability query. Checks value-level overrides first (e.g. `display: 'flex'` is `'native'` on RN even though `display` family is `'approximate'`), then falls back to family-level lookup.

```ts
function getCapability(
  property: string,
  target: DotTarget,
  value?: string,
): CapabilityLevel;
```

```ts
import { getCapability } from "@hua-labs/dot";

getCapability("padding", "native"); // 'native'
getCapability("filter", "native"); // 'unsupported'
getCapability("filter", "flutter"); // 'plugin-backed'
getCapability("display", "native", "flex"); // 'native'  (value-level override)
getCapability("display", "native", "grid"); // 'approximate'
getCapability("backgroundImage", "flutter"); // 'recipe-only'
```

---

### `dotClass(input, options?)` — `/class` subpath

Generate a stable, hash-based class name for a utility string. In browser environments, CSS rules are injected into a shared `<style>` element. In SSR environments, rules are collected for `dotFlush()`.

```ts
import { dotClass } from "@hua-labs/dot/class";

function dotClass(
  input: string | undefined | null,
  options?: DotClassOptions,
): string;

interface DotClassOptions {
  naming?: "hash" | "atomic";
  darkMode?: "class" | "media";
}
```

```ts
const cls = dotClass("p-4 flex items-center hover:bg-gray-100");
// → 'dot-a3f2b1'

// With dark mode via .dark class on <html>:
const cls2 = dotClass("bg-white dark:bg-gray-900", { darkMode: "class" });
// Emits: .dot-xxx { background-color: #fff } .dark .dot-xxx { background-color: #111827 }
```

---

### `dotCSS(input, options?)` — `/class` subpath

Like `dotClass()` but also returns the generated CSS string.

```ts
import { dotCSS } from "@hua-labs/dot/class";

function dotCSS(
  input: string | undefined | null,
  options?: DotClassOptions,
): DotClassResult;

interface DotClassResult {
  className: string;
  css: string;
}
```

```ts
const { className, css } = dotCSS("p-4 hover:bg-red-500 dark:text-white");

// className: 'dot-a3f2b1'
// css:
// '.dot-a3f2b1 { padding: 1rem }\n
//  .dot-a3f2b1:hover { background-color: #ef4444 }\n
//  .dark .dot-a3f2b1 { color: #ffffff }'
```

---

### `dotFlush()` — `/class` subpath

Collect all generated CSS rules accumulated since the last flush (SSR). Returns the CSS string and resets the collection buffer.

```ts
import { dotFlush } from "@hua-labs/dot/class";

function dotFlush(): string;
```

```ts
// In your SSR render function:
const html = renderToString(<App />);
const collectedCSS = dotFlush();

// Inject into the HTML response:
const fullHTML = `
  <!doctype html>
  <html>
    <head>
      <style id="dot-ssr">${collectedCSS}</style>
    </head>
    <body>${html}</body>
  </html>
`;
```

---

## Advanced Usage

### Custom Tokens

Override the built-in token scale with `createDotConfig()`. Deep merge means you only need to specify what changes — defaults remain in place:

```ts
createDotConfig({
  theme: {
    colors: {
      brand: {
        50: "#f0ebff",
        100: "#ddd4ff",
        500: "#6630E6",
        600: "#5520D0",
        900: "#2a0a6b",
      },
      // Flat color (no scale)
      overlay: "rgba(0,0,0,0.5)",
    },
    spacing: {
      "13": "52px",
      "15": "60px",
      "18": "72px",
    },
    borderRadius: {
      pill: "9999px",
      card: "12px",
    },
    fontSize: {
      "2xs": "10px",
      "3xl": "30px",
    },
  },
});

dot("bg-brand-500 p-18 rounded-pill text-2xs");
// { backgroundColor: '#6630E6', padding: '72px', borderRadius: '9999px', fontSize: '10px' }

// Flat color works too
dot("bg-overlay");
// { backgroundColor: 'rgba(0,0,0,0.5)' }
```

### strictMode and warnUnknown

During development you can surface unknown tokens instead of silently ignoring them:

```ts
// Throw on any unrecognized token
createDotConfig({ strictMode: true });
dot("p-4 bogus-token"); // throws Error('Unknown token: bogus-token')

// Warn in console (non-throwing, good for CI canary)
createDotConfig({ strictMode: false, warnUnknown: true });
dot("p-4 bogus-token"); // console.warn('Unknown token: bogus-token')
```

`warnUnknown` is also passed through to `adaptNative()` to warn about dropped properties.

### Gradient Composition

Gradients are composed from three independent token groups that dot merges in `finalizeStyle()`:

```ts
// Direction + from/via/to stops → backgroundImage
dot("bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500");
// { backgroundImage: 'linear-gradient(to right, #3b82f6, #a855f7, #ec4899)' }

// With position modifiers
dot(
  "bg-gradient-to-b from-blue-500 from-10% via-purple-500 via-50% to-pink-500 to-90%",
);
// { backgroundImage: 'linear-gradient(to bottom, #3b82f6 10%, #a855f7 50%, #ec4899 90%)' }

// Diagonal
dot("bg-gradient-to-tr from-cyan-400 to-blue-600");
// { backgroundImage: 'linear-gradient(to top right, #22d3ee, #2563eb)' }

// With arbitrary colors
dot("bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4]");
// { backgroundImage: 'linear-gradient(to right, #ff6b6b, #4ecdc4)' }
```

Available gradient directions: `to-r` `to-l` `to-t` `to-b` `to-tr` `to-tl` `to-br` `to-bl`.

### Ring + Shadow Merging

Ring and shadow utilities use internal accumulation keys that get merged into a single `boxShadow` string. The ring layer is always prepended before the shadow layer (Tailwind convention):

```ts
// Ring only
dot("ring-2");
// { boxShadow: '0 0 0 2px #3b82f6' }

// Ring with color
dot("ring-2 ring-red-500");
// { boxShadow: '0 0 0 2px #ef4444' }

// Shadow only
dot("shadow-md");
// { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)' }

// Ring + shadow — ring is prepended
dot("ring-2 ring-blue-500 shadow-lg");
// { boxShadow: '0 0 0 2px #3b82f6, 0 10px 15px -3px rgba(0,0,0,0.1), ...' }

// !important propagates through composition
dot("!ring-2 !shadow-md");
// { boxShadow: '0 0 0 2px #3b82f6, 0 4px 6px -1px rgba(0,0,0,0.1) !important' }
```

### Flutter Recipe Interpretation

When targeting Flutter, the recipe fields map directly to Flutter widget construction arguments. Here is a practical Dart usage pattern:

```ts
// TypeScript side — produce a recipe
import { dot } from "@hua-labs/dot";
import type { FlutterRecipe } from "@hua-labs/dot";

const recipe: FlutterRecipe = dot(
  "p-4 bg-blue-500/80 rounded-lg shadow-md text-white text-base font-bold",
  {
    target: "flutter",
  },
) as FlutterRecipe;

// Serialize for Dart bridge
const json = JSON.stringify(recipe);
```

```dart
// Dart side — consume the recipe
import 'dart:convert';

Widget buildFromRecipe(Map<String, dynamic> recipe) {
  final deco = recipe['decoration'] as Map<String, dynamic>?;
  final padding = recipe['padding'] as Map<String, dynamic>?;
  final textStyle = recipe['textStyle'] as Map<String, dynamic>?;

  return Container(
    padding: padding != null ? EdgeInsets.only(
      top: (padding['top'] as num).toDouble(),
      right: (padding['right'] as num).toDouble(),
      bottom: (padding['bottom'] as num).toDouble(),
      left: (padding['left'] as num).toDouble(),
    ) : null,
    decoration: deco != null ? BoxDecoration(
      color: Color(int.parse((deco['color'] as String).replaceFirst('#', '0xFF'))),
      borderRadius: BorderRadius.circular(
        (deco['borderRadius']?['topLeft'] as num? ?? 0).toDouble()
      ),
    ) : null,
    child: Text('Hello', style: TextStyle(
      fontSize: (textStyle?['fontSize'] as num?)?.toDouble(),
      fontWeight: textStyle?['fontWeight'] == '700' ? FontWeight.bold : FontWeight.normal,
      color: Colors.white,
    )),
  );
}
```

### Capability Reporting for Production Audits

Use `dotExplain()` together with `CAPABILITY_MATRIX` to build automated cross-platform compatibility audits:

```ts
import { dotExplain, CAPABILITY_MATRIX } from "@hua-labs/dot";

function auditUtilityString(input: string) {
  const rnResult = dotExplain(input, { target: "native" });
  const flutterResult = dotExplain(input, { target: "flutter" });

  return {
    input,
    nativeDropped: rnResult.report._dropped ?? [],
    nativeApproximate: rnResult.report._approximated ?? [],
    flutterDropped: flutterResult.report._dropped ?? [],
    flutterRecipeOnly: Object.entries(flutterResult.report._capabilities ?? {})
      .filter(([, v]) => v === "recipe-only")
      .map(([k]) => k),
  };
}

auditUtilityString(
  "p-4 flex rounded-lg shadow-md transition-all filter blur-sm",
);
// {
//   nativeDropped: ['transitionProperty', 'filter'],
//   nativeApproximate: ['shadowColor', 'shadowOffset', ...],
//   flutterDropped: ['transitionProperty'],
//   flutterRecipeOnly: ['backgroundImage'],
// }
```

---

## Integration Examples

### Next.js App Router

```tsx
// app/components/card.tsx
"use client";

import { dot, dotMap } from "@hua-labs/dot";
import { useState } from "react";

export function Card({ dark }: { dark: boolean }) {
  const [hovered, setHovered] = useState(false);

  const styles = dotMap(
    "rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800",
    { dark },
  );

  return (
    <div
      style={hovered ? { ...styles.base, ...styles.hover } : styles.base}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      Content
    </div>
  );
}
```

#### SSR with class mode

```tsx
// app/layout.tsx (server component)
import { dotClass, dotFlush } from "@hua-labs/dot/class";

// Generate class names during render
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const bodyClass = dotClass("min-h-screen bg-background text-foreground");

  // Collect all CSS generated during this render pass
  const css = dotFlush();

  return (
    <html>
      <head>
        <style id="dot-styles" dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className={bodyClass}>{children}</body>
    </html>
  );
}
```

#### Theme-aware setup

```ts
// lib/dot-config.ts
import { createDotConfig, semanticVars } from "@hua-labs/dot";

createDotConfig({
  theme: {
    semanticColors: semanticVars(
      "background",
      "foreground",
      "card",
      "card-foreground",
      "primary",
      "primary-foreground",
      "muted",
      "muted-foreground",
      "border",
      "ring",
      "accent",
      "accent-foreground",
    ),
  },
  warnUnknown: process.env.NODE_ENV === "development",
});
```

### React Native with Metro

```tsx
// components/Button.tsx
import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { dotMap } from "@hua-labs/dot/native";

export function Button({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  const styles = dotMap(
    "px-4 py-2 rounded-lg bg-blue-500 active:bg-blue-700 disabled:opacity-50",
    { target: "native" },
  );

  return (
    <TouchableOpacity
      style={pressed ? { ...styles.base, ...styles.active } : styles.base}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
    >
      <Text
        style={dot("text-white font-semibold text-base", { target: "native" })}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
```

#### Capability-safe utility hook

```tsx
// hooks/useDotStyle.ts
import { dotExplain, DotOptions } from "@hua-labs/dot";

export function useDotStyle(input: string, options?: DotOptions) {
  const { styles, report } = dotExplain(input, {
    ...options,
    target: "native",
  });

  if (__DEV__ && report._dropped?.length) {
    console.warn("[dot] Dropped on native:", report._dropped.join(", "));
  }

  return styles;
}
```

### Flutter Bridge

```ts
// scripts/generate-flutter-styles.ts
import { dot, dotExplain } from "@hua-labs/dot";
import type { FlutterRecipe } from "@hua-labs/dot";
import * as fs from "fs";

const componentStyles: Record<string, string> = {
  card: "p-4 bg-white rounded-xl shadow-md",
  button: "px-4 py-2 bg-primary-500 rounded-lg",
  badge: "px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium",
};

const output: Record<string, FlutterRecipe> = {};

for (const [name, utilities] of Object.entries(componentStyles)) {
  const { styles, report } = dotExplain(utilities, { target: "flutter" });
  if (report._dropped?.length) {
    console.warn(`${name}: dropped ${report._dropped.join(", ")}`);
  }
  output[name] = styles as FlutterRecipe;
}

fs.writeFileSync(
  "flutter_bridge/dot_styles.json",
  JSON.stringify(output, null, 2),
);
```

---

## Troubleshooting

### Unknown tokens silently produce empty objects

**Issue:** A utility like `p-18` or `bg-brand-500` resolves to `{}`.

**Cause:** The token does not exist in the built-in scale.

**Solution:** Add it via `createDotConfig()`:

```ts
createDotConfig({
  theme: {
    spacing: { "18": "72px" },
    colors: { brand: { 500: "#6630E6" } },
  },
});

// Or enable warnUnknown to surface the issue without throwing:
createDotConfig({ warnUnknown: true });
dot("p-18 bg-brand-500"); // console.warn logs the unknown tokens
```

---

### Cache stale after config change

**Issue:** Calling `createDotConfig()` then `dot()` returns the old result.

**Cause:** Cache is keyed by input string. If `createDotConfig()` was called with the same config shape previously, the input cache still holds the old result.

**Solution:** `createDotConfig()` always resets the cache automatically — this should not happen. If you mutate config outside of `createDotConfig()` (which is not supported), call `clearDotCache()` manually:

```ts
// Correct pattern — always use createDotConfig for changes
createDotConfig({ theme: { colors: { brand: { 500: "#new" } } } });
// Cache is reset automatically ✓

// If you somehow need a manual reset:
clearDotCache();
```

---

### React Native — unsupported CSS properties

**Issue:** `dot('flex-col transition-all blur-sm', { target: 'native' })` drops `transition` and `filter` silently.

**Cause:** `adaptNative()` drops ~45 CSS properties that have no React Native equivalent.

**Solution:** Use `dotExplain()` to audit before shipping, or enable `warnDropped`:

```ts
import { dotExplain } from "@hua-labs/dot";

const { styles, report } = dotExplain("flex-col transition-all blur-sm", {
  target: "native",
});
console.log(report._dropped); // ['transitionProperty', 'filter']

// Or at the adapter level:
import { adaptNative } from "@hua-labs/dot";

adaptNative(myStyles, { warnDropped: true });
// Logs: [dot/native] Dropped unsupported property: transitionProperty
```

Avoid using web-only utilities (`transition-*`, `animate-*`, `filter`, `backdrop-*`, `cursor-*`, `select-*`, `grid-*`) in strings intended for the native target.

---

### Flutter — recipe-only fields not applied inline

**Issue:** `dot('bg-gradient-to-r from-blue-500 to-pink-500', { target: 'flutter' })` does not include `backgroundImage` in the recipe output.

**Cause:** `backgroundImage` is `'recipe-only'` on Flutter — gradients map to `FlutterGradient` inside `decoration.gradient`, not as a CSS string.

**Solution:** Read from `decoration.gradient` in the recipe:

```ts
import type { FlutterRecipe } from "@hua-labs/dot";

const recipe = dot("bg-gradient-to-r from-blue-500 to-pink-500", {
  target: "flutter",
}) as FlutterRecipe;

// recipe.decoration.gradient →
// {
//   type: 'linear',
//   direction: 'to right',
//   stops: [{ color: '#3b82f6', offset: 0 }, { color: '#ec4899', offset: 1 }]
// }
```

Use `CAPABILITY_MATRIX['gradient'].flutter` (`'recipe-only'`) to programmatically check this before passing a utility string to the Flutter target.
