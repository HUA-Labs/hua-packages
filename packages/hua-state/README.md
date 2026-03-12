# @hua-labs/state

Zustand-based state management wrapper optimized for the hua ecosystem. Provides built-in SSR hydration handling, localStorage persistence with partialize support, and seamless i18n integration for React and Next.js applications.

[![npm version](https://img.shields.io/npm/v/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![license](https://img.shields.io/npm/l/@hua-labs/state.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
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
| `isStoreRehydrated` | function | Check if a persisted store has completed rehydration from localStorage. Returns false while hydration is pending (SSR safe). |
| `onStoreRehydrated` | function | Subscribe to a store's rehydration completion event. Calls the callback immediately if the store is already rehydrated. Returns an unsubscribe function. |
| `markStoreRehydrated` | function | Manually mark a store as rehydrated and fire all pending listeners. Use when integrating a Zustand store created outside of createHuaStore. |
| `createI18nStore` | function | Create a pre-configured i18n language store |
| `StoreCreator` | type | Type alias for the Zustand state creator function passed to createHuaStore. |
| `StoreConfig` | type | Configuration object for createHuaStore — persist, persistKey, ssr, partialize. |
| `HuaStore` | type | Return type of createHuaStore — a bound Zustand store hook. |
| `BaseStoreState` | type | Base constraint for store state — requires an object type. |
| `UseBoundStore` | type | Re-exported Zustand UseBoundStore type for typed store hooks. |
| `StoreApi` | type | Re-exported Zustand StoreApi type for direct store access. |
| `I18nStoreState` | type | State shape for the i18n store — language, setLanguage, etc. |
| `I18nStoreConfig` | type | Configuration for createI18nStore — default language, supported languages. |
| `UseStoreHook` | type | Generic type helper for typed store selector hooks. |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
