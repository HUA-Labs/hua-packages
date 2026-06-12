# HUA Packages

Public package workspace for HUA Labs React, motion, i18n, dot style, and
utility packages.

This repository is the package distribution surface. The root package is
private; publishable packages live under [`packages/`](./packages). For usage
details, start with the package README and, when present, its
`DETAILED_GUIDE.md`.

## Quick Start

Create a new HUA project:

```bash
npx create-hua my-app
cd my-app
pnpm dev
```

Or add the umbrella package to an existing React project:

```bash
pnpm add @hua-labs/hua
```

Install focused packages directly when you only need one surface:

```bash
pnpm add @hua-labs/motion-core
pnpm add @hua-labs/i18n-core @hua-labs/i18n-formatters
pnpm add @hua-labs/dot
```

## Packages

### Framework

| Package                               | Version                                                                                           | Purpose                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`@hua-labs/hua`](./packages/hua)     | [![npm](https://img.shields.io/npm/v/@hua-labs/hua)](https://www.npmjs.com/package/@hua-labs/hua) | Umbrella framework package for UI, motion, and i18n. |
| [`@hua-labs/ui`](./packages/hua-ui)   | [![npm](https://img.shields.io/npm/v/@hua-labs/ui)](https://www.npmjs.com/package/@hua-labs/ui)   | React UI component package.                          |
| [`create-hua`](./packages/create-hua) | [![npm](https://img.shields.io/npm/v/create-hua)](https://www.npmjs.com/package/create-hua)       | Project scaffolding CLI.                             |

### Motion

| Package                                               | Version                                                                                                           | Purpose                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [`@hua-labs/motion-core`](./packages/hua-motion-core) | [![npm](https://img.shields.io/npm/v/@hua-labs/motion-core)](https://www.npmjs.com/package/@hua-labs/motion-core) | React motion hooks and timeline orchestration primitives. |

### i18n

| Package                                                           | Version                                                                                                                         | Purpose                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`@hua-labs/i18n-core`](./packages/hua-i18n-core)                 | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-core)](https://www.npmjs.com/package/@hua-labs/i18n-core)                   | SSR/CSR translation core.                                  |
| [`@hua-labs/i18n-core-zustand`](./packages/hua-i18n-core-zustand) | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-core-zustand)](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)   | Zustand adapter for `@hua-labs/i18n-core`.                 |
| [`@hua-labs/i18n-loaders`](./packages/hua-i18n-loaders)           | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-loaders)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)             | Translation loaders, cache helpers, and preload utilities. |
| [`@hua-labs/i18n-formatters`](./packages/hua-i18n-formatters)     | [![npm](https://img.shields.io/npm/v/@hua-labs/i18n-formatters)](https://www.npmjs.com/package/@hua-labs/i18n-formatters)       | Date, number, currency, and relative-time formatters.      |
| [`@hua-labs/eslint-plugin-i18n`](./packages/eslint-plugin-i18n)   | [![npm](https://img.shields.io/npm/v/@hua-labs/eslint-plugin-i18n)](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n) | ESLint rules for i18n key and raw-text hygiene.            |

### Dot Style Engine

| Package                                       | Version                                                                                                   | Purpose                                                       |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [`@hua-labs/dot`](./packages/hua-dot)         | [![npm](https://img.shields.io/npm/v/@hua-labs/dot)](https://www.npmjs.com/package/@hua-labs/dot)         | Utility-string style engine for web and React Native targets. |
| [`@hua-labs/dot-aot`](./packages/hua-dot-aot) | [![npm](https://img.shields.io/npm/v/@hua-labs/dot-aot)](https://www.npmjs.com/package/@hua-labs/dot-aot) | Build-time extraction helpers for dot styles.                 |
| [`@hua-labs/dot-lsp`](./packages/hua-dot-lsp) | [![npm](https://img.shields.io/npm/v/@hua-labs/dot-lsp)](https://www.npmjs.com/package/@hua-labs/dot-lsp) | Language-server support for dot styles.                       |
| [`@hua-labs/dot-mcp`](./packages/hua-dot-mcp) | [![npm](https://img.shields.io/npm/v/@hua-labs/dot-mcp)](https://www.npmjs.com/package/@hua-labs/dot-mcp) | MCP server support for dot style tooling.                     |

### Support Packages

| Package                                         | Version                                                                                                     | Purpose                                 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| [`@hua-labs/hooks`](./packages/hua-hooks)       | [![npm](https://img.shields.io/npm/v/@hua-labs/hooks)](https://www.npmjs.com/package/@hua-labs/hooks)       | Shared React hooks.                     |
| [`@hua-labs/state`](./packages/hua-state)       | [![npm](https://img.shields.io/npm/v/@hua-labs/state)](https://www.npmjs.com/package/@hua-labs/state)       | Zustand-based state helpers.            |
| [`@hua-labs/utils`](./packages/hua-utils)       | [![npm](https://img.shields.io/npm/v/@hua-labs/utils)](https://www.npmjs.com/package/@hua-labs/utils)       | Shared utility functions.               |
| [`@hua-labs/security`](./packages/hua-security) | [![npm](https://img.shields.io/npm/v/@hua-labs/security)](https://www.npmjs.com/package/@hua-labs/security) | Alpha security helpers and experiments. |

## Repository Development

### Requirements

- Node.js 24.x
- pnpm 10.17.0+

### Commands

```bash
pnpm install
pnpm build
pnpm type-check
pnpm lint
pnpm test
pnpm generate:docs:validate
```

Package documentation is generated from `doc.yaml` where present. The generator
updates package README files and `ai-docs/*.ai.yaml`. If you edit a generated
package README, update the corresponding `doc.yaml` and run:

```bash
pnpm generate:docs
pnpm generate:docs:validate
```

## Release Notes

This repository uses Changesets for package versioning and publishing. Do not
publish from an unreviewed local state. Use package-level README files,
changelogs, and generated docs validation as the public-facing release surface.

## Links

- [HUA Docs](https://docs.hua-labs.com)
- [HUA Labs](https://hua-labs.com)
- [npm packages](https://www.npmjs.com/org/hua-labs)
- [GitHub Issues](https://github.com/HUA-Labs/hua-packages/issues)

## License

MIT License. See [LICENSE](./LICENSE).
