# @hua-labs/state

Unified state management for the hua ecosystem with SSR support.
hua 생태계를 위한 SSR 지원 통합 상태 관리 솔루션.

[![npm version](https://img.shields.io/npm/v/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![license](https://img.shields.io/npm/l/@hua-labs/state.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

Zustand-based state management wrapper optimized for the hua ecosystem. Provides built-in SSR hydration handling, localStorage persistence with partialize support, and seamless i18n integration for React and Next.js applications.

hua 생태계에 최적화된 Zustand 기반 상태 관리 래퍼입니다. SSR hydration 자동 처리, partialize를 지원하는 localStorage 영속성, React 및 Next.js를 위한 i18n 통합을 제공합니다.

## Features

- **Zustand-based** — Lightweight, performant state management
- **SSR support** — Automatic hydration handling for Next.js App Router
- **Persistence** — Built-in localStorage with partialize support
- **i18n integration** — Pre-configured store for language management
- **Type-safe** — Full TypeScript support with strict typing

## Installation | 설치

```bash
pnpm add @hua-labs/state
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`, `zustand >= 5.0.0`

## Quick Start | 빠른 시작

```tsx
import { createHuaStore } from '@hua-labs/state';

interface AppState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const useAppStore = createHuaStore<AppState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}), {
  persist: true,
  persistKey: 'app-storage',
  ssr: true,
});

function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  return <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</button>;
}
```

## Entry Points | 진입점

| Path | Description |
|------|-------------|
| `@hua-labs/state` | `createHuaStore` and core state utilities |
| `@hua-labs/state/integrations/i18n` | `createI18nStore` for language management |

## API Overview | API 개요

| Function | Description |
|----------|-------------|
| `createHuaStore(creator, config?)` | Create a Zustand store with SSR/persistence |
| `createI18nStore(config)` | Create a pre-configured i18n language store |

**StoreConfig:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `persist` | `boolean` | `false` | Enable localStorage persistence |
| `persistKey` | `string` | `'hua-state-storage'` | Storage key |
| `ssr` | `boolean` | `false` | Enable SSR hydration handling |
| `partialize` | `(state) => Partial` | — | Select state to persist |

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand i18n adapter
- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UX framework (uses this for state)

## Requirements | 요구사항

React >= 19.0.0 · React DOM >= 19.0.0 · Zustand >= 5.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
