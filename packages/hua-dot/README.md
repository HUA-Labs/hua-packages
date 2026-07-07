# @hua-labs/dot

Cross-platform utility style engine for Web, React Native, and Flutter. Parses Tailwind-inspired utility strings into flat style objects via a shared resolver pipeline and target-specific adapters. Zero dependencies, framework-agnostic, 2,400+ tests. ~90% Tailwind parity across 33 resolver families.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot.svg)](https://www.npmjs.com/package/@hua-labs/dot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **dot() converts utility strings into web, React Native, or Flutter style data**
- **dotExplain() reports dropped, approximated, and unsupported target properties**
- **getDotAxCatalog() exposes package-owned capability metadata for tools**
- **dotMap(), dotCx(), and dotVariants() cover state maps and composition helpers**
- **dot-codegen emits Swift or Compose style code from dot style definitions**

## Installation

```bash
pnpm add @hua-labs/dot
```

## Quick Start

```tsx
import { dot, dotExplain } from '@hua-labs/dot';

const web = dot('flex items-center gap-3 rounded-lg bg-white p-4');
const native = dotExplain('p-4 grid grid-cols-3', { target: 'native' });

console.log(web);
console.log(native.report);

```

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)
- [`@hua-labs/dot-aot`](https://www.npmjs.com/package/@hua-labs/dot-aot)

## License

MIT — [HUA Labs](https://hua-labs.com)
