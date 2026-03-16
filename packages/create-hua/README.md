# @hua-labs/create-hua

Interactive scaffolding CLI for creating Next.js + hua projects. Generates a pre-wired project with UI, motion, i18n, state, and AI context files.

[![npm version](https://img.shields.io/npm/v/@hua-labs/create-hua.svg)](https://www.npmjs.com/package/@hua-labs/create-hua)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/create-hua.svg)](https://www.npmjs.com/package/@hua-labs/create-hua)
[![license](https://img.shields.io/npm/l/@hua-labs/create-hua.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Interactive prompts — Choose AI context files and documentation language**
- **Pre-wired stack — Next.js 16, React 19, Tailwind 4, Zustand 5, hua i18n**
- **Doctor command — Diagnose existing project health**
- **Monorepo aware — Detects pnpm workspace, uses workspace:\* versions**
- **AI context — Optional .cursorrules, ai-context.md, .claude/ generation**

## Quick Start

```bash
npx create-hua my-app
cd my-app
pnpm install
pnpm dev

```

## API

| Export               | Type     | Description                                                                                                                                                                           |
| -------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createProject`      | function | Scaffold a new Next.js + hua project with interactive prompts                                                                                                                         |
| `resolveProjectPath` | function | Resolve the output directory for a project name. When run from within the monorepo (packages/create-hua), resolves relative to the monorepo root; otherwise resolves relative to cwd. |

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)

## License

MIT — [HUA Labs](https://hua-labs.com)
