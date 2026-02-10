# @hua-labs/hua

Ship UX faster: UI + motion + i18n + state, pre-wired.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![license](https://img.shields.io/npm/l/@hua-labs/hua.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

Batteries-included framework for React product teams. Unifies UI components, animation hooks, internationalization, state management, and utilities into a single dependency with automatic provider setup for Next.js.

## Installation

```bash
pnpm add @hua-labs/hua
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`, `server-only ^0.0.1`

Optional peer: `next >= 13.0.0`

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

## Features

- **Pre-wired** — UI, motion, i18n, state configured and ready to use
- **Framework layer** — Next.js-optimized with `defineConfig` and automatic providers
- **Accessibility** — WCAG 2.1 compliant utilities (focus management, skip-to-content)
- **Loading UX** — Built-in delayed loading, suspense wrappers
- **Error handling** — ErrorBoundary built into HuaPage
- **White-labeling** — SSR-compatible CSS variable injection via branding config
- **GEO support** — Generative Engine Optimization for AI search engines

## Entry Points

| Path | Re-exports from |
|------|-----------------|
| `@hua-labs/hua` | Root — all re-exports |
| `@hua-labs/hua/framework` | Framework layer (HuaProvider, defineConfig, HuaPage) |
| `@hua-labs/hua/framework/server` | Server-only framework utilities |
| `@hua-labs/hua/framework/config` | Configuration types and defineConfig |
| `@hua-labs/hua/framework/shared` | Shared framework utilities |
| `@hua-labs/hua/framework/seo/geo` | GEO optimization |
| `@hua-labs/hua/presets` | Preset configurations |
| `@hua-labs/hua/ui` | @hua-labs/ui |
| `@hua-labs/hua/motion` | @hua-labs/motion-core |
| `@hua-labs/hua/i18n` | @hua-labs/i18n-core + i18n-core-zustand |
| `@hua-labs/hua/state` | @hua-labs/state |
| `@hua-labs/hua/pro` | @hua-labs/pro |
| `@hua-labs/hua/formatters` | @hua-labs/i18n-formatters |
| `@hua-labs/hua/utils` | @hua-labs/utils |
| `@hua-labs/hua/hooks` | @hua-labs/hooks |
| `@hua-labs/hua/loaders` | @hua-labs/i18n-loaders |

## API Overview

**Framework:**

| Export | Description |
|--------|-------------|
| `defineConfig(config)` | Define hua configuration with presets |
| `HuaProvider` | Root layout provider with auto setup |
| `HuaPage` | Page wrapper with ErrorBoundary |

**Re-exported from sub-packages:**

| Category | Key Exports |
|----------|-------------|
| UI | 50+ components (Button, Card, Modal, Table, etc.) |
| Motion | 25+ animation hooks (useFadeIn, useSlideUp, etc.) |
| Pro | 20+ advanced hooks (useOrchestration, useAutoSlide, etc.) |
| i18n | `createCoreI18n`, `useTranslation` |
| State | `createHuaStore`, `createI18nStore` |
| Formatters | `useDateFormatter`, `useCurrencyFormatter`, `useNumberFormatter` |
| Utils | `cn`, `debounce`, `throttle`, `validateEmail`, etc. |
| Hooks | `useLoading`, `useAutoScroll`, `usePerformanceMonitor` |

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)
- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — UI component library
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core) — Animation hooks
- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — i18n engine
- [`@hua-labs/state`](https://www.npmjs.com/package/@hua-labs/state) — State management
- [`create-hua`](https://www.npmjs.com/package/create-hua) — Project scaffolding CLI

> `@hua-labs/hua-ux` has been renamed to this package. (deprecated)

## Requirements

React >= 19.0.0 · React DOM >= 19.0.0 · TypeScript >= 5.9 · server-only ^0.0.1

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
