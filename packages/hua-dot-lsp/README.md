# @hua-labs/dot-lsp

LSP server for the dot style engine — autocomplete, hover, and diagnostics for dot() utility strings in any editor.

[![npm version](https://img.shields.io/npm/v/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/dot-lsp.svg)](https://www.npmjs.com/package/@hua-labs/dot-lsp)
[![license](https://img.shields.io/npm/l/@hua-labs/dot-lsp.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Autocomplete — package-local bounded hand-maintained completion catalog with fixed utility entries and variant prefixes; each response is capped at 500 items and is not complete engine coverage or resolver/support authority**
- **Hover Preview — shows resolved CSS property values (e.g., p-4 → padding: 16px)**
- **Diagnostics — flags unrecognized utility tokens as warnings on file open and change**
- **Target Caveats — optional web/native/flutter diagnostics for dropped, approximated, and recipe-only output, annotated with package-owned AX family/category metadata**
- **Pattern Detection — works inside dot(), dot='', dot={''}, and template literal forms**
- **Dependency Boundary — @hua-labs/dot is a direct runtime dependency used for hover fallback and diagnostics; consumers do not supply it as a peer**
- **Initialize Identity — manifest-derived initialize server identity reports dot-lsp with the exact build-manifest version and does not create a JavaScript import API**
- **Editor Distribution — the repository contains first-party VSIX source, but its release channel is channel-pending and this package does not claim Marketplace availability or a prebuilt VSIX**

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

# Configure any LSP client to use `dot-lsp --stdio`.
# First-party VSIX source exists in the platform workspace, but its distribution channel is pending.

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `dot-lsp` | variable | CLI binary — starts the LSP server via stdio transport. Provides completion, hover, and diagnostic capabilities for dot utility strings. |

## Detailed Guide

[Detailed Guide](./DETAILED_GUIDE.md) — CLI protocol, completion-catalog boundaries, editor distribution, and initialize identity.

The Detailed Guide is included in the package tarball.

## Package Surface

`@hua-labs/dot-lsp` is installed and executed as a CLI/LSP server package.
Its public package surface is the `dot-lsp` binary, normally started with
`dot-lsp --stdio` by an editor client or a locally built first-party VSIX.
The package does not publish a stable JavaScript import API or TypeScript
type surface; editor integrations should treat the stdio LSP protocol as
the contract.

`@hua-labs/dot` is a direct runtime dependency used by hover fallback and
diagnostics. The manifest-derived initialize server identity reports the
exact build-manifest version and does not create a JavaScript import API.

## Completion Catalog Boundary

Completion suggestions come from a package-local bounded hand-maintained
completion catalog in the LSP source. Each request returns at most 500
matching entries. The catalog is not generated from the current Dot
engine, does not represent complete engine coverage, and is not resolver
or platform-support authority. Hover and diagnostics may consult the
direct `@hua-labs/dot` runtime dependency for tokens outside the catalog.

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

- **VS Code**: Use a compatible LSP client with `dot-lsp --stdio`, or build the first-party VSIX source from this repository.
- **Neovim**: Configure `nvim-lspconfig` with `cmd = {"dot-lsp", "--stdio"}`
- **Other editors**: Any LSP client can connect via `dot-lsp --stdio`

The first-party VSIX source is release-classified as channel-pending with
unresolved distribution authority. This package does not claim Marketplace
availability or a prebuilt VSIX. Source/build presence alone is not an
installation or publication claim.

## Related Packages

- [`@hua-labs/dot`](https://www.npmjs.com/package/@hua-labs/dot)
- [`@hua-labs/dot-mcp`](https://www.npmjs.com/package/@hua-labs/dot-mcp)

## License

MIT — [HUA Labs](https://hua-labs.com)
