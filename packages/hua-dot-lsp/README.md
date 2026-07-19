# @hua-labs/dot-lsp

LSP server for the dot style engine — autocomplete, hover, and diagnostics for dot() utility strings in any editor.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-lsp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **stdio LSP server for dot utility completion, hover, and diagnostics**
- **Recognizes dot() calls and dot= JSX attribute forms**
- **Hand-maintained inlined completion catalog with a 500-result request cap**
- **Optional web/native/flutter target caveat diagnostics**
- **AX family/category metadata in target diagnostics**

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
