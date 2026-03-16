# @hua-labs/dot-aot

Build-time static extraction for @hua-labs/dot. Replaces static dot() calls with pre-computed style objects at build time, eliminating runtime parsing overhead. Provides a Vite plugin and a Babel plugin (Metro, Next.js compatible).

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-aot.svg)](https://www.npmjs.com/package/@hua-labs/dot-aot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-aot.svg)](https://www.npmjs.com/package/@hua-labs/dot-aot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-aot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Zero-runtime CSS — static dot() calls replaced with inline object literals at build time**
- **Vite plugin — enforce: 'pre' transform hook, fast path skips files with no dot calls**
- **Babel plugin — AST-accurate CallExpression visitor, works with Metro and Next.js**
- **Regex-based extraction engine — skips calls in strings, comments, template literals, and chained methods**
- **Static options support — extracts target and dark when literal values; skips breakpoint (dynamic)**
- **Cross-platform output — correct serialization for web, native, and flutter targets**
- **Graceful fallback — malformed or unresolvable calls silently left as runtime**
- **styleToObjectLiteral — handles nested structures (RN transform arrays, Flutter recipe objects)**

## Installation

```bash
pnpm add @hua-labs/dot-aot
```

> Peer dependencies: vite >=5.0.0

## Quick Start

```tsx
// Vite
import dotAot from "@hua-labs/dot-aot/vite";
export default defineConfig({ plugins: [dotAot()] });

// Babel / Metro / Next.js
module.exports = {
  plugins: [["@hua-labs/dot-aot/babel", { target: "native" }]],
};

// Before build:
const style = dot("p-4 flex items-center bg-primary-500");

// After build (inlined by plugin):
const style = {
  padding: "16px",
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--color-primary-500)",
};
```

## API

| Export                                | Type     | Description                                                                                                                                                    |
| ------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extractStaticCalls`                  | function | Scan source string and return all extractable dot() calls sorted last-to-first. Options: { functionNames?: string[], target?: 'web' \| 'native' \| 'flutter' } |
| `transformSource`                     | function | Apply all extractions in a single pass. Returns { code, extractions } or null if no changes. Safe for use in any transform pipeline.                           |
| `styleToObjectLiteral`                | function | Serialize a resolved style object to a JS object literal string (with wrapping parentheses). Handles nested arrays and objects for RN/Flutter targets.         |
| `ExtractedCall`                       | type     | { start: number; end: number; input: string; options?: DotOptions; result: Record<string, unknown> }                                                           |
| `ExtractOptions`                      | type     | { functionNames?: string[]; target?: 'web' \| 'native' \| 'flutter' }                                                                                          |
| **`@hua-labs/dot-aot/vite` subpath**  |          |                                                                                                                                                                |
| `dotAotVite` (default)                | function | Vite plugin factory. Returns a Vite plugin with enforce: 'pre'. Options: DotAotViteOptions.                                                                    |
| `DotAotViteOptions`                   | type     | Extends ExtractOptions. { include?: string[]; exclude?: string[] } — file extensions to include/exclude.                                                       |
| **`@hua-labs/dot-aot/babel` subpath** |          |                                                                                                                                                                |
| `dotAotBabel` (default)               | function | Babel plugin factory. Returns a Babel plugin with CallExpression visitor. Options: DotAotBabelOptions.                                                         |
| `DotAotBabelOptions`                  | type     | { functionNames?: string[]; target?: DotTarget }                                                                                                               |

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)

## License

MIT — [HUA Labs](https://hua-labs.com)
