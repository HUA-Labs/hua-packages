# @hua-labs/dot-lsp

LSP server for the dot style engine — autocomplete, hover, and diagnostics for dot() utility strings in any editor.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-lsp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **stdio LSP server for dot completions, hover, and diagnostics**
- **Detects dot() calls and dot attributes in editor buffers**
- **Optional target caveats for web, native, and Flutter**
- **CLI-first package surface through the dot-lsp binary**

## Installation

```bash
pnpm add @hua-labs/dot-lsp
```

## Quick Start

```bash
npm install -g @hua-labs/dot-lsp
dot-lsp --stdio

```

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/dot-mcp`](https://www.npmjs.com/package/@hua-labs/dot-mcp)

## License

MIT — [HUA Labs](https://hua-labs.com)
