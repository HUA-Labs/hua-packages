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

The Vite plugin routes source text through this regex-based pipeline. The Babel
plugin is a separate adapter with its own `CallExpression` AST visitor; it does
not route parsed source back through `extractStaticCalls`.

### Regex-Based Scanning

`extractStaticCalls` uses regular expressions plus string/comment heuristics to
locate candidate call sites rather than a full parser. It avoids a hard
compile-time dependency on a JavaScript parser, but it must not be treated as
an AST-equivalent correctness boundary.

The scanner applies the following heuristics to decide whether a call is extractable:

- The call must match one of the configured function names (default: `dot`).
- The first argument must match the scanner's plain single- or double-quoted
  string grammar.
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

Calls that do not match the scanner, include `breakpoint`, or throw during Dot
resolution are left intact without a warning. That fallback is not proof that
every arbitrary options object is safely classified: use only the documented
literal shapes and inspect transformed output before enabling the Vite plugin
in a release build.

### Vite Plugin Lifecycle

`dotAotVite` returns a Vite plugin with `enforce: 'pre'` so it runs before other transform plugins (such as TypeScript or JSX compilers). The transform hook:

1. Checks the file extension against the configured `include`/`exclude` lists. Files that do not match are returned unchanged immediately — this is the fast path that keeps cold-start build times low.
2. Passes the raw source to `transformSource`.
3. Returns the mutated code string if any extractions were made, or `null` to signal no change.

Because the plugin runs before JSX compilation, it operates on the original source where `dot()` calls look exactly as the developer wrote them.

### Babel Plugin AST Visitor

`dotAotBabel` returns a Babel plugin whose visitor targets `CallExpression` nodes. Unlike the regex engine, the Babel visitor has access to the fully-parsed AST, so it can precisely identify:

- The configured callee identifier.
- Whether every argument is a `StringLiteral` node.
- Whether the second argument is an object expression and whether supported
  `target`/`dark` properties use recognized literal nodes.

When a qualifying node is found, the visitor replaces it with an
`ObjectExpression` AST node built from the resolved style object. This entry is
for toolchains that actually execute Babel, including Metro. It does not run
inside the Next.js SWC compiler.

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

The Babel plugin runs only when Next.js is configured to execute a custom Babel
pipeline. It does not run inside Next.js SWC. If a project chooses this route,
configure `next/babel` explicitly:

```js
// .babelrc or babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [["@hua-labs/dot-aot/babel", { target: "web" }]],
};
```

> Adding a custom Babel config makes Next.js use Babel for affected compilation
> instead of the built-in SWC path. Confirm that trade-off against the exact
> Next.js version and build mode used by your application.

---

## Core Concepts

### What Gets Extracted

A `dot()` call is within the documented extraction contract when all of the
following are true:

1. The function name matches (default `dot`, configurable via `functionNames`).
2. The first argument is a plain string literal — no template literals, no concatenation.
3. If a second argument is present, it uses only the supported `target` and
   `dark` keys with literal values.
4. `target` is one of `"web"`, `"native"`, or `"flutter"`; `dark` is a boolean
   literal. Any `breakpoint` key keeps the call at runtime.

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

The `breakpoint` option is always left at runtime. Other dynamic, computed,
spread, unknown, or otherwise unsupported option shapes are outside the
regex/Vite extraction contract; do not rely on the heuristic scanner to
classify them safely.

### How Options Are Handled Statically

For supported literal option shapes, the extractor handles these keys:

| Option key   | Static extraction       | Notes                                  |
| ------------ | ----------------------- | -------------------------------------- |
| `target`     | Yes, if string literal  | Determines output serialization format |
| `dark`       | Yes, if boolean literal | Included in resolved style             |
| `breakpoint` | Never                   | Always runtime — viewport-dependent    |

If `target` is not present in the call site options, the value from `ExtractOptions.target` (passed to the plugin) is used as the default.

The current regex scanner is not a general object-literal parser. A project
that needs broader option syntax should leave that call on the runtime path or
use a separately verified AST transform.

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
  // extractions: number of replacements that were applied
}
```

Returns `null` when no extractable calls are found — use this to skip unnecessary file writes in your pipeline.

---

### `styleToObjectLiteral`

Serializes a resolved style object to a JavaScript object literal string, with wrapping parentheses so it is valid as an inline expression.

```ts
import { styleToObjectLiteral } from "@hua-labs/dot-aot";

const literal = styleToObjectLiteral({ padding: "16px", display: "flex" });
// → '({padding: "16px", display: "flex"})'
```

Handles nested structures required by `native` and `flutter` targets:

```ts
// React Native transform arrays
styleToObjectLiteral({ transform: [{ translateX: 0 }] });
// → '({transform: [{translateX: 0}]})'

// Flutter recipe objects
styleToObjectLiteral({ decoration: { color: 0xff3b82f6 } });
// → '({decoration: {color: 4282090230}})'
```

---

### `dotAotVite` (default export from `@hua-labs/dot-aot/vite`)

Vite plugin factory. Returns a plugin with `enforce: 'pre'`.

```ts
import dotAot, { type DotAotViteOptions } from "@hua-labs/dot-aot/vite";

const options: DotAotViteOptions = { target: "web" };
const plugin = dotAot(options); // Vite Plugin
```

**`DotAotViteOptions`** extends `ExtractOptions`:

| Property        | Type                             | Default                          | Description                  |
| --------------- | -------------------------------- | -------------------------------- | ---------------------------- |
| `functionNames` | `string[]`                       | `["dot"]`                        | Function names to scan for   |
| `target`        | `'web' \| 'native' \| 'flutter'` | `"web"`                          | Default output target        |
| `include`       | `string[]`                       | `[".ts", ".tsx", ".js", ".jsx"]` | File extensions to transform |
| `exclude`       | `string[]`                       | `["node_modules"]`               | Path substrings to skip      |

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
import type { ExtractedCall, ExtractOptions } from "@hua-labs/dot-aot";
import type { DotAotViteOptions } from "@hua-labs/dot-aot/vite";
import type { DotAotBabelOptions } from "@hua-labs/dot-aot/babel";

// A single resolved extraction
type ExtractedCall = {
  start: number; // Start offset in source string
  end: number; // End offset in source string
  input: string; // Original utility string argument
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
dotAot({ functionNames: ["dot", "s", "style"] });
```

```js
// babel.config.js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel", { functionNames: ["dot", "css"] }]],
};
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

Files not matching the `include` list, or whose path contains an `exclude`
substring, return `null` before extraction. Supplying `exclude` replaces the
default `["node_modules"]`; include that value yourself if it should remain
excluded.

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
  // This admitted call is replaced at build time by this plugin.
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

> This example is valid only when the Next.js build actually runs the custom
> Babel configuration. It does not prove SWC execution, React Server Component
> compatibility, import removal, tree-shaking, or browser/runtime parity.

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

Calls that fail the documented literal grammar, contain `breakpoint`, or throw
during resolution may remain at runtime without a build error. The regex path
does not validate every JavaScript options shape. Dynamic values, spreads,
computed or unknown keys, nested objects, and extra arguments are outside the
supported AOT contract; keep those calls at runtime and inspect emitted code.

If you suspect a specific call is not being extracted when it should be, use `extractStaticCalls` in a debug script (see [Debugging Extractions](#debugging-extractions)) to inspect the extractor's view of that source file.
