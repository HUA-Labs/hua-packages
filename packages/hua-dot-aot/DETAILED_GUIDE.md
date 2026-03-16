# @hua-labs/dot-aot Detailed Guide

Build-time static extraction for @hua-labs/dot.

---

### Table of Contents

- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### Extraction Engine

The extraction engine is the central piece of `@hua-labs/dot-aot`. At its core it is a two-step pipeline:

1. **Scan** — `extractStaticCalls` walks the source string and identifies all call sites that qualify for static replacement. It returns an array of `ExtractedCall` objects sorted last-to-first by source position so that downstream replacements never shift earlier offsets.
2. **Replace** — `transformSource` iterates the extracted calls and splices each one out of the source, substituting the pre-computed object literal string produced by `styleToObjectLiteral`.

Both the Vite plugin and the Babel plugin are thin adapters that route file source text through this pipeline. The core logic lives in a single, framework-agnostic extraction module.

### Regex-Based Scanning

`extractStaticCalls` uses regular expressions to locate candidate call sites rather than a full parser. The regex approach is intentional: it is significantly faster than parsing an AST for every file and it avoids a hard compile-time dependency on any specific JS parser version.

The scanner applies the following heuristics to decide whether a call is extractable:

- The call must match one of the configured function names (default: `dot`).
- The entire argument list must be statically resolvable: string literals only, no identifiers or expressions.
- The call must not appear inside a comment (`//`, `/* */`), inside another string literal, inside a template literal `` ` `` expression, or as the target of a chained method call (e.g. `.map(dot)`).

### Static Analysis Limitations

Because the scanner does not build a full AST, there are categories of calls it deliberately skips rather than risk incorrect output:

| Pattern                                           | Behaviour       |
| ------------------------------------------------- | --------------- |
| Template literal argument: ``dot(`p-${size}`)``   | Left as runtime |
| Identifier argument: `dot(className)`             | Left as runtime |
| Dynamic options: `dot("p-4", { breakpoint: bp })` | Left as runtime |
| Chained: `tokens.map(dot)`                        | Left as runtime |
| Nested call: `dot(getClass())`                    | Left as runtime |

All unresolvable calls are silently left intact. There is no error or warning — the call simply continues to run at runtime, so the output is always correct even when extraction is partial.

### Vite Plugin Lifecycle

`dotAotVite` returns a Vite plugin with `enforce: 'pre'` so it runs before other transform plugins (such as TypeScript or JSX compilers). The transform hook:

1. Checks the file extension against the configured `include`/`exclude` lists. Files that do not match are returned unchanged immediately — this is the fast path that keeps cold-start build times low.
2. Passes the raw source to `transformSource`.
3. Returns the mutated code string if any extractions were made, or `null` to signal no change.

Because the plugin runs before JSX compilation, it operates on the original source where `dot()` calls look exactly as the developer wrote them.

### Babel Plugin AST Visitor

`dotAotBabel` returns a Babel plugin whose visitor targets `CallExpression` nodes. Unlike the regex engine, the Babel visitor has access to the fully-parsed AST, so it can precisely identify:

- The function name (callee identifier or member expression).
- Whether every argument is a `StringLiteral` node.
- Whether option arguments are object expressions with literal values.

When a qualifying node is found, the visitor replaces it with an `ObjectExpression` AST node built from the resolved style object. This makes the Babel plugin suitable for toolchains where source accuracy matters more than raw speed — Metro (React Native) and Next.js both fall into this category.

---

## Installation & Setup

### Basic Installation

```bash
pnpm add @hua-labs/dot-aot
```

Peer dependency: `vite >=5.0.0` (only required when using the Vite plugin).

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import dotAot from "@hua-labs/dot-aot/vite";

export default defineConfig({
  plugins: [dotAot()],
});
```

With options:

```ts
export default defineConfig({
  plugins: [
    dotAot({
      target: "web",
      include: [".tsx", ".ts", ".jsx", ".js"],
      exclude: [".css"],
    }),
  ],
});
```

### Babel / Metro

```js
// babel.config.js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel"]],
};
```

For React Native with Metro, pass `target: "native"`:

```js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel", { target: "native" }]],
};
```

### Next.js

Next.js uses Babel by default (Pages Router) and SWC by default (App Router). Use the Babel plugin for both setups.

```js
// .babelrc or babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [["@hua-labs/dot-aot/babel", { target: "web" }]],
};
```

> Note: Using a custom Babel config in Next.js disables the built-in SWC compiler. This is an accepted trade-off for projects that require Babel plugins.

---

## Core Concepts

### What Gets Extracted

A `dot()` call is extracted at build time when all of the following are true:

1. The function name matches (default `dot`, configurable via `functionNames`).
2. The first argument is a plain string literal — no template literals, no concatenation.
3. If a second argument (options object) is present, every value in it is a literal: string, boolean, or number.
4. The `target` option — if present — is a string literal (`"web"`, `"native"`, or `"flutter"`).

```ts
// Extracted — static string, static options
const style = dot("p-4 flex items-center bg-primary-500");
const style = dot("mt-2 text-sm", { dark: true });
const style = dot("p-4", { target: "native" });
```

### What Stays Runtime

```ts
// NOT extracted — dynamic argument
const style = dot(className);

// NOT extracted — template literal
const style = dot(`p-${size} flex`);

// NOT extracted — dynamic option value
const style = dot("p-4", { breakpoint: currentBreakpoint });

// NOT extracted — chained method
const styles = tokens.map(dot);
```

The `breakpoint` option is always left as runtime because it depends on the current viewport state, which is inherently dynamic and cannot be resolved at build time.

### How Options Are Handled Statically

When the extractor encounters an options object it inspects each key individually:

| Option key   | Static extraction       | Notes                                  |
| ------------ | ----------------------- | -------------------------------------- |
| `target`     | Yes, if string literal  | Determines output serialization format |
| `dark`       | Yes, if boolean literal | Included in resolved style             |
| `breakpoint` | Never                   | Always runtime — viewport-dependent    |

If `target` is not present in the call site options, the value from `ExtractOptions.target` (passed to the plugin) is used as the default.

---

## API Reference

### `extractStaticCalls`

Scans a source string and returns all extractable `dot()` calls sorted last-to-first by source position.

```ts
import { extractStaticCalls } from "@hua-labs/dot-aot";

const extractions = extractStaticCalls(sourceCode, {
  functionNames: ["dot", "style"],
  target: "web",
});
```

**Options (`ExtractOptions`):**

| Property        | Type                             | Default   | Description                |
| --------------- | -------------------------------- | --------- | -------------------------- |
| `functionNames` | `string[]`                       | `["dot"]` | Function names to scan for |
| `target`        | `'web' \| 'native' \| 'flutter'` | `"web"`   | Default output target      |

**Returns:** `ExtractedCall[]` sorted last-to-first (safe for sequential splice operations).

---

### `transformSource`

Applies all extractions to the source in a single pass. This is the primary entry point for custom transform pipelines.

```ts
import { transformSource } from "@hua-labs/dot-aot";

const result = transformSource(sourceCode, {
  functionNames: ["dot"],
  target: "web",
});

if (result !== null) {
  const { code, extractions } = result;
  // code: transformed source string
  // extractions: ExtractedCall[] that were applied
}
```

Returns `null` when no extractable calls are found — use this to skip unnecessary file writes in your pipeline.

---

### `styleToObjectLiteral`

Serializes a resolved style object to a JavaScript object literal string, with wrapping parentheses so it is valid as an inline expression.

```ts
import { styleToObjectLiteral } from "@hua-labs/dot-aot";

const literal = styleToObjectLiteral(
  { padding: "16px", display: "flex" },
  "web",
);
// → '({ padding: "16px", display: "flex" })'
```

Handles nested structures required by `native` and `flutter` targets:

```ts
// React Native transform arrays
styleToObjectLiteral({ transform: [{ translateX: 0 }] }, "native");
// → '({ transform: [{ translateX: 0 }] })'

// Flutter recipe objects
styleToObjectLiteral({ decoration: { color: 0xff3b82f6 } }, "flutter");
// → '({ decoration: { color: 0xff3b82f6 } })'
```

---

### `dotAotVite` (default export from `@hua-labs/dot-aot/vite`)

Vite plugin factory. Returns a plugin with `enforce: 'pre'`.

```ts
import dotAot from "@hua-labs/dot-aot/vite";

dotAot(options?: DotAotViteOptions)
```

**`DotAotViteOptions`** extends `ExtractOptions`:

| Property        | Type                             | Default                          | Description                  |
| --------------- | -------------------------------- | -------------------------------- | ---------------------------- |
| `functionNames` | `string[]`                       | `["dot"]`                        | Function names to scan for   |
| `target`        | `'web' \| 'native' \| 'flutter'` | `"web"`                          | Default output target        |
| `include`       | `string[]`                       | `[".ts", ".tsx", ".js", ".jsx"]` | File extensions to transform |
| `exclude`       | `string[]`                       | `[]`                             | File extensions to skip      |

---

### `dotAotBabel` (default export from `@hua-labs/dot-aot/babel`)

Babel plugin factory. Returns a plugin with a `CallExpression` visitor.

```ts
// babel.config.js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel", options]],
};
```

**`DotAotBabelOptions`:**

| Property        | Type                             | Default   | Description                 |
| --------------- | -------------------------------- | --------- | --------------------------- |
| `functionNames` | `string[]`                       | `["dot"]` | Function names to visit     |
| `target`        | `'web' \| 'native' \| 'flutter'` | `"web"`   | Output serialization target |

---

### Types

```ts
import type {
  ExtractedCall,
  ExtractOptions,
  DotAotViteOptions,
  DotAotBabelOptions,
} from "@hua-labs/dot-aot";

// A single resolved extraction
type ExtractedCall = {
  start: number; // Start offset in source string
  end: number; // End offset in source string
  input: string; // Original call site source text
  options?: DotOptions; // Resolved options from the call
  result: Record<string, unknown>; // Pre-computed style object
};

// Options accepted by extractStaticCalls and transformSource
type ExtractOptions = {
  functionNames?: string[];
  target?: "web" | "native" | "flutter";
};
```

---

## Advanced Usage

### Custom Function Names

If your codebase aliases `dot` to a different name, configure `functionNames`:

```ts
// vite.config.ts
dotAot({ functionNames: ["dot", "s", "style"] })[
  // babel.config.js
  ("@hua-labs/dot-aot/babel", { functionNames: ["dot", "css"] })
];
```

Any call matching one of the names and satisfying static-resolvability will be extracted.

### Include / Exclude Patterns

The Vite plugin accepts file extension lists to narrow or widen the transform scope:

```ts
dotAot({
  include: [".tsx", ".ts"], // Only TypeScript files
  exclude: [".test.ts"], // Skip test files
});
```

Files not matching the `include` list are returned from the transform hook immediately — they never enter the extraction pipeline, keeping build performance predictable.

### Cross-Platform Targets

The `target` option controls how the resolved style object is serialized:

```ts
// Web — CSS variable references preserved
dot("bg-primary-500");
// → { backgroundColor: "var(--color-primary-500)" }

// Native — React Native camelCase, numeric values
dot("bg-primary-500", { target: "native" });
// → { backgroundColor: "#3b82f6" }  (resolved hex)

// Flutter — Recipe objects with Flutter-specific structure
dot("bg-primary-500", { target: "flutter" });
// → { decoration: { color: 0xff3b82f6 } }
```

Set the default target in the plugin options to avoid repeating it at each call site:

```ts
// vite.config.ts — all extractions default to native
dotAot({ target: "native" });
```

A `target` literal at the call site overrides the plugin default.

### Debugging Extractions

Use `extractStaticCalls` or `transformSource` directly in a script to inspect what would be extracted from a given file:

```ts
import { readFileSync } from "node:fs";
import { extractStaticCalls } from "@hua-labs/dot-aot";

const source = readFileSync("./src/components/Card.tsx", "utf-8");
const calls = extractStaticCalls(source, { target: "web" });

console.log(`Found ${calls.length} extractable calls:`);
for (const call of calls) {
  console.log(`  [${call.start}:${call.end}] ${call.input}`);
  console.log("  →", call.result);
}
```

To see exactly what the transformed source looks like without writing to disk:

```ts
import { transformSource } from "@hua-labs/dot-aot";

const result = transformSource(source, { target: "web" });
if (result) {
  console.log(result.code);
}
```

---

## Integration Examples

### Vite + React

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotAot from "@hua-labs/dot-aot/vite";

export default defineConfig({
  plugins: [dotAot({ target: "web" }), react()],
});
```

```tsx
// src/components/Card.tsx
import { dot } from "@hua-labs/dot";

export function Card({ children }: { children: React.ReactNode }) {
  // This call is replaced at build time — zero runtime overhead
  const style = dot("rounded-xl p-6 bg-surface shadow-md");

  return <div style={style}>{children}</div>;
}
```

After build, the component becomes:

```tsx
export function Card({ children }: { children: React.ReactNode }) {
  const style = {
    borderRadius: "12px",
    padding: "24px",
    backgroundColor: "var(--color-surface)",
    boxShadow: "var(--shadow-md)",
  };

  return <div style={style}>{children}</div>;
}
```

### Next.js with Babel

```js
// babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [["@hua-labs/dot-aot/babel", { target: "web" }]],
};
```

```tsx
// app/page.tsx
import { dot } from "@hua-labs/dot";

export default function Page() {
  // Extracted at build time by the Babel plugin
  const heroStyle = dot("flex flex-col items-center py-24");

  return (
    <main style={heroStyle}>
      <h1>Hello</h1>
    </main>
  );
}
```

> Because this extraction happens in the Babel transform step, it works with both Pages Router and App Router. Server Components are fully supported — there is no runtime import to tree-shake.

### React Native with Metro

```js
// babel.config.js
module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [["@hua-labs/dot-aot/babel", { target: "native" }]],
};
```

```tsx
// components/Button.tsx
import { dot } from "@hua-labs/dot";
import { TouchableOpacity, Text } from "react-native";

export function Button({ label }: { label: string }) {
  const containerStyle = dot("px-4 py-2 bg-primary-500 rounded-lg");
  const textStyle = dot("text-white text-sm font-semibold");

  return (
    <TouchableOpacity style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}
```

Metro resolves the Babel plugin per-file. The `target: "native"` option ensures all serialized values are React Native-compatible (numeric pixel values, no CSS variables).

---

## Troubleshooting

### Calls Not Extracted

**Symptom:** A `dot()` call remains in the output bundle unchanged.

**Check 1:** Verify the argument is a plain string literal, not a variable or template literal.

```ts
// Not extracted — dynamic
const cls = "p-4 flex";
const style = dot(cls);

// Extracted — static literal
const style = dot("p-4 flex");
```

**Check 2:** Confirm the function name matches `functionNames`. If you aliased `dot`:

```ts
import { dot as s } from "@hua-labs/dot";

// Not extracted with default config
const style = s("p-4");

// Fix: add the alias to functionNames
dotAot({ functionNames: ["dot", "s"] });
```

**Check 3:** Ensure the file extension is in the `include` list for the Vite plugin.

---

### Template Literals

Template literals are intentionally not extracted because their values cannot be statically determined.

```ts
// Never extracted
const style = dot(`p-${padding} flex`);
```

Refactor static portions into a separate plain-string call and keep dynamic composition at runtime:

```ts
// The static base is extracted; the spread merges at runtime
const base = dot("flex items-center");
const dynamic = dot(`p-${padding}`); // still runtime
const style = { ...base, ...dynamic };
```

---

### Dynamic Options

The `breakpoint` option is always left as runtime because it depends on viewport state:

```ts
// Not extracted — breakpoint is dynamic
const style = dot("p-4", { breakpoint: currentBp });
```

Use the `dot` runtime API for responsive styles, or define separate static calls per breakpoint and select between them at runtime:

```ts
const mobile = dot("p-2"); // extracted
const desktop = dot("p-6"); // extracted
const style = isMobile ? mobile : desktop;
```

---

### Chained Methods

The scanner explicitly skips `dot` when used as a callback or in a method chain:

```ts
// Not extracted
const styles = classNames.map(dot);
const style = obj.dot("p-4");
```

Extract calls explicitly instead:

```ts
// Extracted individually
const styles = [dot("p-2"), dot("p-4"), dot("p-6")];
```

---

### Malformed or Unresolvable Calls

When `dot()` is called with arguments the extractor cannot resolve — wrong arity, unexpected node types, or an option value it cannot serialize — the call is silently left as runtime. There is no build error. This is intentional: graceful fallback means a single unresolvable call never blocks the build.

If you suspect a specific call is not being extracted when it should be, use `extractStaticCalls` in a debug script (see [Debugging Extractions](#debugging-extractions)) to inspect the extractor's view of that source file.
