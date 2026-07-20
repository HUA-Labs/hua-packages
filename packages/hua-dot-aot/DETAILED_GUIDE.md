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

1. **Authorize and extract** — `extractStaticCalls` parses the source module, identifies exact named `dot` imports from `@hua-labs/dot`, and admits only statically safe calls owned by those bindings. It returns `ExtractedCall` objects sorted last-to-first so later replacements never shift earlier offsets.
2. **Replace** — `transformSource` iterates the extracted calls and splices each one out of the source, substituting the pre-computed object literal string produced by `styleToObjectLiteral`.

The Vite plugin uses the core parser-backed transform. The Babel plugin performs the same static-value checks through Babel's own AST and lexical binding authority before replacing a call with an object expression.

### Parser And Binding Authority

`extractStaticCalls` parses JavaScript/TypeScript, including JSX, before it considers a call. Matching text is never sufficient authority. A candidate local name must resolve from a runtime named import of the exact `dot` export from `@hua-labs/dot`.

Configured `functionNames` are an allowlist for local aliases, not a global function-name list. For example, `functionNames: ["s"]` can admit `import { dot as s } from "@hua-labs/dot"`; it cannot admit a local `s`, a foreign import, or `namespace.dot`.

The core/Vite path deliberately fails closed for a configured local name when the module also declares or shadows that name. Babel uses its scope binding for each call. Both paths leave namespace imports, member calls, type-only imports, constructors, bare globals, and ambiguous bindings at runtime.

### Static Analysis Limitations

Only the following bounded call shape is eligible. Everything else remains at runtime:

| Pattern                                           | Behaviour       |
| ------------------------------------------------- | --------------- |
| Template literal argument: ``dot(`p-${size}`)``   | Left as runtime |
| No-substitution template: ``dot(`p-4`)``          | Left as runtime |
| Identifier argument: `dot(className)`             | Left as runtime |
| Dynamic options: `dot("p-4", { breakpoint: bp })` | Left as runtime |
| Namespace/member call: `ns.dot("p-4")`            | Left as runtime |
| Shadowed local binding: `function f(dot) { ... }` | Left as runtime |
| Nested call: `dot(getClass())`                    | Left as runtime |

Malformed modules, unresolvable calls, unsupported option objects, and invalid plugin-level default targets are left intact. Only an absent or explicit `undefined` plugin target defaults to Web; an explicit `null` does not. Strings, comments, regular-expression literals, JSX text, and `new dot(...)` are syntax nodes rather than textual candidates, so they are never partially rewritten.

### Vite Plugin Lifecycle

`dotAotVite` returns a Vite plugin with `enforce: 'pre'` so it runs before other transform plugins (such as TypeScript or JSX compilers). The transform hook:

1. Removes a Vite query/hash suffix for extension matching, then checks the module pathname against the configured `include`/`exclude` lists. Files that do not match are returned unchanged immediately.
2. Passes the raw source to the parser-backed `transformSource`.
3. Returns the mutated code string if any extractions were made, or `null` to signal no change.

There is no raw identifier prefilter before parsing. The parser remains authoritative, so escaped aliases and valid calls separated by whitespace, comments, or newlines are not skipped. Because the plugin runs before JSX compilation, the core parser must admit the original module before any replacement occurs.

### Babel Plugin AST Visitor

`dotAotBabel` returns a Babel plugin whose visitor targets `CallExpression` nodes. It uses Babel's lexical scope to verify that each callee resolves to the exact named `dot` import from `@hua-labs/dot`, then checks:

- The callee is an allowed local identifier, not a member expression or constructor.
- The first argument is exactly one `StringLiteral`.
- The optional second argument is a flat object containing only literal `target` and/or `dark` values.

When a qualifying node is found, the visitor replaces it with an `ObjectExpression` built from the resolved style object. This entry works in Metro and other pipelines that explicitly execute Babel plugins. It is not an SWC plugin.

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

The Babel entry runs in Next.js only when the project explicitly opts into a Babel configuration. A project using the default SWC pipeline does not execute this plugin.

```js
// .babelrc or babel.config.js
module.exports = {
  presets: ["next/babel"],
  plugins: [["@hua-labs/dot-aot/babel", { target: "web" }]],
};
```

> Note: Opting into a custom Babel config changes the Next.js compiler path. Confirm that trade-off against the Next.js version used by the application; `@hua-labs/dot-aot` does not patch or emulate SWC.

---

## Core Concepts

### What Gets Extracted

A `dot()` call is extracted at build time when all of the following are true:

1. The callee is a runtime named `dot` import from exact package `@hua-labs/dot`; `functionNames` may additionally allow that import's local alias.
2. The first argument is a plain string literal — no template literals, no concatenation.
3. There are no more than two arguments.
4. If a second argument is present, it is a flat object containing only exact `target` and/or `dark` keys, without duplicates, computed keys, shorthand, or spreads.
5. `target` is one of `"web"`, `"native"`, or `"flutter"`, and `dark` is a boolean literal.

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

// NOT extracted — matching name without exact import authority
function dot(value: string) {
  return value;
}
const local = dot("p-4");
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

Parses a source module and returns binding-authorized, statically extractable `dot()` calls sorted last-to-first by source position. Parse failure or ambiguous ownership returns an empty array.

```ts
import { extractStaticCalls } from "@hua-labs/dot-aot";

const extractions = extractStaticCalls(sourceCode, {
  functionNames: ["dot", "style"],
  target: "web",
});
```

**Options (`ExtractOptions`):**

| Property        | Type                             | Default   | Description                                                      |
| --------------- | -------------------------------- | --------- | ---------------------------------------------------------------- |
| `functionNames` | `string[]`                       | `["dot"]` | Allowed local names that must alias the exact named `dot` import |
| `target`        | `'web' \| 'native' \| 'flutter'` | `"web"`   | Default output target                                            |

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
  // extractions: number of calls that were applied
}
```

Returns `null` when no extractable calls are found — use this to skip unnecessary file writes in your pipeline.

---

### `styleToObjectLiteral`

Serializes a resolved style object to a JavaScript object literal string, with wrapping parentheses so it is valid as an inline expression.

```ts
import { styleToObjectLiteral } from "@hua-labs/dot-aot";

const literal = styleToObjectLiteral({ padding: "16px", display: "flex" });
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
  input: string; // Static Dot utility string
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

If your codebase aliases the exact named `dot` import, configure that local name in `functionNames`:

```ts
// vite.config.ts
dotAot({ functionNames: ["dot", "s"] });

// application source
import { dot as s } from "@hua-labs/dot";
const style = s("p-4");

// babel.config.js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel", { functionNames: ["dot", "s"] }]],
};
```

A matching local helper, foreign import, namespace member, or shadowed alias is not extracted.

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

> This example applies only when the Next.js build actually executes the custom Babel configuration. The package does not claim extraction in the default SWC path.

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

**Check 2:** Confirm both the exact import authority and configured local name. If you aliased `dot`:

```ts
import { dot as s } from "@hua-labs/dot";

// Not extracted when "s" is not allowed
const style = s("p-4");

// Fix: add the alias to functionNames
dotAot({ functionNames: ["dot", "s"] });
```

Adding a name does not authorize arbitrary functions with that spelling. The local binding must still be the runtime named `dot` export from exact package `@hua-labs/dot`.

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

### Non-Call And Member Uses

Only a direct authorized call is transformed. Callback references, member calls, constructors, and namespace imports remain intact:

```ts
// Not extracted
const styles = classNames.map(dot);
const style = obj.dot("p-4");
const instance = new dot("p-4");
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
