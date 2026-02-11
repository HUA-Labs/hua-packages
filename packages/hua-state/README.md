# @hua-labs/state

Zustand-based state management wrapper optimized for the hua ecosystem. Provides built-in SSR hydration handling, localStorage persistence with partialize support, and seamless i18n integration for React and Next.js applications.

[![npm version](https://img.shields.io/npm/v/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![license](https://img.shields.io/npm/l/@hua-labs/state.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Zustand-based — Lightweight, performant state management**
- **SSR support — Automatic hydration handling for Next.js App Router**
- **Persistence — Built-in localStorage with partialize support**
- **i18n integration — Pre-configured store for language management**
- **Type-safe — Full TypeScript support with strict typing**

## Installation

```bash
pnpm add @hua-labs/state
```

> Peer dependencies: react >=19.0.0, react-dom >=19.0.0, zustand >=5.0.0

## Quick Start

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

## API

| Export | Type | Description |
|--------|------|-------------|
| `createHuaStore` | function | Create a Zustand store with SSR/persistence support |
| `isStoreRehydrated` | function |  |
| `onStoreRehydrated` | function |  |
| `markStoreRehydrated` | function |  |
| `createI18nStore` | function | Create a pre-configured i18n language store |
| `StoreCreator` | type |  |
| `StoreConfig` | type |  |
| `HuaStore` | type |  |
| `BaseStoreState` | type |  |
| `UseBoundStore` | type |  |
| `StoreApi` | type |  |
| `I18nStoreState` | type |  |
| `I18nStoreConfig` | type |  |
| `UseStoreHook` | type |  |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
