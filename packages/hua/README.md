# @hua-labs/hua

Ship UX faster: UI + Motion + i18n, pre-wired.
더 빠른 UX 개발을 위한 UI, Motion, i18n 통합 프레임워크.

[![npm version](https://img.shields.io/npm/v/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/hua.svg)](https://www.npmjs.com/package/@hua-labs/hua)
[![license](https://img.shields.io/npm/l/@hua-labs/hua.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

High-level, batteries-included framework for React product teams. Unifies UI components, animation hooks, internationalization, state management, and utilities into a cohesive ecosystem with automatic provider setup for Next.js.

React 제품 팀을 위한 올인원 프레임워크입니다. UI 컴포넌트, 애니메이션 훅, 국제화, 상태 관리, 유틸리티를 Next.js 자동 프로바이더 설정과 함께 하나의 생태계로 통합합니다.

## Features

- **Pre-wired** — UI, Motion, i18n, State configured and ready to use
- **Framework layer** — Next.js-optimized with `defineConfig` and automatic providers
- **Accessibility** — WCAG 2.1 compliant utilities (focus management, skip-to-content)
- **Loading UX** — Built-in delayed loading, suspense wrappers
- **Error handling** — ErrorBoundary built into HuaUxPage
- **White-labeling** — SSR-compatible CSS variable injection
- **GEO support** — Generative Engine Optimization for AI search engines

## Installation | 설치

```bash
pnpm add @hua-labs/hua
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`, `server-only ^0.0.1`

Optional peer: `next >= 13.0.0`

## Quick Start | 빠른 시작

```tsx
// hua.config.ts
import { defineConfig } from '@hua-labs/hua/framework';

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
import { HuaUxLayout } from '@hua-labs/hua/framework';

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <HuaUxLayout>{children}</HuaUxLayout>
      </body>
    </html>
  );
}
```

## Entry Points | 진입점

| Path | Re-exports from |
|------|-----------------|
| `@hua-labs/hua` | Root — all re-exports |
| `@hua-labs/hua/framework` | Framework layer (HuaUxLayout, defineConfig, HuaUxPage) |
| `@hua-labs/hua/framework/server` | Server-only framework utilities |
| `@hua-labs/hua/framework/config` | Configuration types |
| `@hua-labs/hua/framework/shared` | Shared framework utilities |
| `@hua-labs/hua/framework/seo/geo` | GEO optimization |
| `@hua-labs/hua/presets` | Preset configurations |
| `@hua-labs/hua/ui` | @hua-labs/ui |
| `@hua-labs/hua/motion` | @hua-labs/motion-core |
| `@hua-labs/hua/pro` | @hua-labs/pro |
| `@hua-labs/hua/i18n` | @hua-labs/i18n-core |
| `@hua-labs/hua/state` | @hua-labs/state |
| `@hua-labs/hua/formatters` | @hua-labs/i18n-formatters |
| `@hua-labs/hua/utils` | @hua-labs/utils |
| `@hua-labs/hua/hooks` | @hua-labs/hooks |
| `@hua-labs/hua/loaders` | @hua-labs/i18n-loaders |

## API Overview | API 개요

**Framework:**

| Export | Description |
|--------|-------------|
| `defineConfig(config)` | Define hua configuration |
| `HuaUxLayout` | Root layout with auto provider setup |
| `HuaUxPage` | Page wrapper with ErrorBoundary |

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

## Documentation | 문서

- [Detailed Guide](./DETAILED_GUIDE.md)
- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/ui`](https://www.npmjs.com/package/@hua-labs/ui) — UI component library
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core) — Animation hooks
- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — i18n engine
- [`@hua-labs/state`](https://www.npmjs.com/package/@hua-labs/state) — State management
- [`@hua-labs/pro`](https://www.npmjs.com/package/@hua-labs/pro) — Advanced motion hooks
- [`create-hua`](https://www.npmjs.com/package/create-hua) — Project scaffolding CLI

## Requirements | 요구사항

React >= 19.0.0 · React DOM >= 19.0.0 · TypeScript >= 5.9 · server-only ^0.0.1

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
