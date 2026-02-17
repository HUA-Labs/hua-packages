# @hua-labs/hua

Batteries-included framework for React product teams. Unifies UI components, animation hooks, internationalization, state management, and utilities into a single dependency with automatic provider setup for Next.js.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![license](https://img.shields.io/npm/l/@hua-labs/hua.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Pre-wired — UI, motion, i18n, state configured and ready to use**
- **Framework layer — Next.js-optimized with defineConfig and automatic providers**
- **Accessibility — WCAG 2.1 compliant utilities (focus management, skip-to-content)**
- **Loading UX — Built-in delayed loading, suspense wrappers**
- **Error handling — ErrorBoundary built into HuaPage**
- **White-labeling — SSR-compatible CSS variable injection via branding config**
- **GEO support — Generative Engine Optimization for AI search engines**

## Installation

```bash
pnpm add @hua-labs/hua
```

> Peer dependencies: next >=13.0.0, react >=19.0.0, react-dom >=19.0.0, server-only ^0.0.1

## Quick Start

```tsx
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework/config';

export default defineConfig({
  preset: 'product',
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
});

// app/layout.tsx
import { HuaProvider } from '@hua-labs/hua/framework';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <HuaProvider>{children}</HuaProvider>
      </body>
    </html>
  );
}

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `Button` | component | Branded button — auto-applies branding colors when configured |
| `Card` | component | Branded card — auto-applies branding colors when configured |
| `defineConfig` | function | Define hua configuration with presets (product, landing, docs) |
| `HuaProvider` | component | Root layout provider — auto-wires theme, i18n, motion, branding |
| `HuaPage` | component | Page wrapper with ErrorBoundary and loading states |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Architecture

`@hua-labs/hua` is a **meta-framework** that re-exports from sub-packages and adds a framework layer on top.

```
@hua-labs/hua
├── /framework     ← HuaProvider, defineConfig, HuaPage (framework-only)
├── /ui             ← re-export @hua-labs/ui (100+ components)
├── /motion          ← re-export @hua-labs/motion-core
├── /i18n            ← re-export @hua-labs/i18n-core
├── /state           ← re-export @hua-labs/state
├── /formatters      ← re-export @hua-labs/i18n-formatters
├── /hooks           ← re-export @hua-labs/hooks
├── /utils           ← re-export @hua-labs/utils
└── /loaders         ← re-export @hua-labs/i18n-loaders
```

The main entry (`@hua-labs/hua`) exports everything flat for convenience. Use subpath imports for tree-shaking.


## Configuration Presets

| Preset | Use Case | Includes |
|--------|----------|----------|
| `product` | Full-featured product app | UI + i18n + state + motion + branding |
| `landing` | Marketing/landing pages | UI + motion + GEO |
| `docs` | Documentation sites | UI + i18n + code blocks |

```tsx
// Minimal config — preset handles defaults
export default defineConfig({ preset: 'product' });
```


## Related Packages

- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui)
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core)
- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/state`](https://www.npmjs.com/package/@hua-labs/state)

## License

MIT — [HUA Labs](https://hua-labs.com)
