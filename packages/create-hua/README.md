# create-hua

Interactive scaffolding CLI for creating Next.js + hua projects. Generates a pre-wired project with UI, motion, i18n, state, and AI context files.

[![npm version](https://img.shields.io/npm/v/create-hua.svg)](https://www.npmjs.com/package/create-hua)
[![npm downloads](https://img.shields.io/npm/dm/create-hua.svg)](https://www.npmjs.com/package/create-hua)
[![license](https://img.shields.io/npm/l/create-hua.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

## Features

- **Interactive prompts — Choose AI context files and documentation language**
- **Pre-wired stack — Next.js 16, React 19, Tailwind 4, Zustand 5, hua i18n**
- **Doctor command — Diagnose existing project health**
- **Monorepo aware — Detects pnpm workspace, uses workspace:* versions**
- **AI context — Optional .cursorrules, ai-context.md, .claude/ generation**

## Installation

```bash
npx create-hua my-app
```


## Quick Start

```bash
npx create-hua my-app
cd my-app
pnpm install
pnpm dev

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `createProject` | function | Scaffold a new Next.js + hua project with interactive prompts |


## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)
- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)

## License

MIT — [HUA Labs](https://hua-labs.com)
