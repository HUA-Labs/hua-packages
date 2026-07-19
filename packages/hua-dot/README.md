# @hua-labs/dot

Cross-platform utility style engine for Web, React Native, and Flutter. Parses Tailwind-inspired utility strings into flat style objects via a shared resolver pipeline and target-specific adapters. Zero runtime dependencies and framework-agnostic APIs. Target support is explicit through the capability matrix and dotExplain().

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **dot() resolves Tailwind-inspired utility strings to Web CSSProperties, React Native style objects, or FlutterRecipe output**
- **dotExplain() reports target caveats for dropped, approximated, recipe-only, and unsupported properties**
- **Native subpath, AOT/codegen, and AX catalog exports support app and tooling integrations**

## Installation

```bash
pnpm add @hua-labs/dot
```

## Quick Start

```ts
import { dot, dotExplain } from "@hua-labs/dot";

const web = dot("p-4 flex items-center bg-primary-500 text-white rounded-lg");
const native = dot("p-4 rounded-lg shadow-lg", { target: "native" });
const report = dotExplain("grid grid-cols-3 gap-4", { target: "native" });

console.log(web, native, report.report._dropped);
```

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)

## Related Packages

- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)
- [`@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/dot-aot)

## License

MIT — [HUA Labs](https://hua-labs.com)
