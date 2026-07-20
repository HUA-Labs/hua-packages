# @hua-labs/dot-aot

Build-time static extraction for @hua-labs/dot. Replaces authorized static dot() calls with pre-computed style objects while leaving ambiguous or dynamic calls at runtime. Provides a parser-backed Vite transform and a Babel plugin for explicit Babel pipelines such as Metro. AOT output follows the @hua-labs/dot resolver and AX catalog; this package does not define independent capability truth.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-aot.svg)](https://www.npmjs.com/package/@hua-labs/dot-aot)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-aot.svg)](https://www.npmjs.com/package/@hua-labs/dot-aot)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-aot.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Build-time extraction for static dot() calls**
- **Vite and Babel plugin entrypoints**
- **Target-aware output parity with @hua-labs/dot**
- **Dynamic or unsafe calls remain at runtime**

## Installation

```bash
pnpm add @hua-labs/dot-aot
```

> Peer dependencies: vite >=5.0.0

## Quick Start

```ts
import dotAot from '@hua-labs/dot-aot/vite';

export default defineConfig({
  plugins: [dotAot()],
});

```

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)

## License

MIT — [HUA Labs](https://hua-labs.com)
