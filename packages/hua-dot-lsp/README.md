# @hua-labs/dot-lsp

LSP server for the dot style engine — autocomplete, hover, and diagnostics for dot() utility strings in any editor.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-lsp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Autocomplete — real-time suggestions for all dot utility tokens + variant prefixes (hover:, dark:, md:, etc.)**
- **Hover Preview — shows resolved CSS property values (e.g., p-4 → padding: 16px)**
- **Diagnostics — flags unrecognized utility tokens as warnings on file open and change**
- **Target Caveats — optional web/native/flutter diagnostics for dropped, approximated, and recipe-only output, annotated with package-owned AX family/category metadata**
- **Pattern Detection — works inside dot(), dot='', dot={''}, and template literal forms**
- **500+ built-in token suggestions across 15 categories (spacing, color, sizing, typography, layout, flexbox, grid, border, shadow, background, transition, animation, transform, filter, interactivity)**

## Installation

```bash
pnpm add @hua-labs/dot-lsp
```

## Quick Start

```bash
# Install globally or in your project
npm install -g @hua-labs/dot-lsp

# Run as stdio LSP server (used by editor extensions)
dot-lsp --stdio

# For VS Code, install the hua-labs.dot-vscode extension (VSIX) which auto-resolves this server.
# For other editors, configure your LSP client to use `dot-lsp --stdio`.

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `dot-lsp` | variable | CLI binary — starts the LSP server via stdio transport. Provides completion, hover, and diagnostic capabilities for dot utility strings. |

## Package Surface

`@hua-labs/dot-lsp` is installed and executed as a CLI/LSP server package.
Its public package surface is the `dot-lsp` binary, normally started with
`dot-lsp --stdio` by an editor client or by the VS Code extension. The
package does not publish a stable JavaScript import API or TypeScript type
surface; editor integrations should treat the stdio LSP protocol as the
contract.

## Target Configuration

Clients may pass an optional target at initialization:

```json
{
  "initializationOptions": {
    "dot": {
      "target": "native"
    }
  }
}
```

When no target is configured, diagnostics keep the default token-recognition
behavior and do not emit target capability caveats.

Target caveat messages are sourced from `dotExplain()` and annotated with
`@hua-labs/dot` AX catalog family/category metadata, including composed
family metadata for `ring` and class-mode `divide` markers. The metadata
is diagnostic context only; it does not change resolver output, target
adapters, VS Code behavior, or runtime support.

## Supported Patterns

The LSP detects dot utility strings in these forms:

```tsx
dot("p-4 flex items-center")
dot('bg-primary-500')
dot={`hover:bg-gray-100`}
dot="p-4 rounded-lg"
dot={'shadow-md'}
```

## Editor Integration

- **VS Code**: Install `hua-labs.dot-vscode` extension from VSIX (auto-resolves this server and forwards `dot.target`)
- **Neovim**: Configure `nvim-lspconfig` with `cmd = {"dot-lsp", "--stdio"}`
- **Other editors**: Any LSP client can connect via `dot-lsp --stdio`

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/dot-mcp`](https://www.npmjs.com/package/@hua-labs/dot-mcp)

## License

MIT — [HUA Labs](https://hua-labs.com)
