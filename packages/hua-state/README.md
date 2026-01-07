# @hua-labs/state

Unified state management for the hua-ux ecosystem with SSR support.
hua-ux 생태계를 위한 SSR 지원 통합 상태 관리 솔루션입니다.

[![npm version](https://img.shields.io/npm/v/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/state.svg)](https://www.npmjs.com/package/@hua-labs/state)
[![license](https://img.shields.io/npm/l/@hua-labs/state.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **⚠️ Alpha Release**: This package is currently in alpha. APIs may change before the stable release.

---

[English](#english) | [한국어](#korean)

## English

### Overview
Zustand-based state management wrapper optimized for the hua-ux ecosystem. Provides built-in SSR hydration handling, localStorage persistence, and seamless i18n integration for React and Next.js applications.

### Features

- ✅ **Zustand-based**: Built on Zustand for lightweight, performant state management
- ✅ **SSR Support**: Automatic hydration handling for Next.js App Router
- ✅ **Persistence**: Built-in localStorage persistence with partialize support
- ✅ **i18n Integration**: Pre-configured store for language management
- ✅ **Type Safe**: Full TypeScript support with strict typing
- ✅ **Framework Optimized**: Designed specifically for hua-ux ecosystem

### Installation

```bash
pnpm add @hua-labs/state zustand
# or
npm install @hua-labs/state zustand
# or
yarn add @hua-labs/state zustand
```

### Quick Start

### Basic Store

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

// Usage
function MyComponent() {
  const theme = useAppStore((state) => state.theme);
  const setTheme = useAppStore((state) => state.setTheme);
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current theme: {theme}
    </button>
  );
}
```

### i18n Store

```tsx
import { createI18nStore } from '@hua-labs/state/integrations/i18n';

const useI18nStore = createI18nStore({
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en'],
  persist: true,
  ssr: true,
});

// Usage
function LanguageSwitcher() {
  const language = useI18nStore((state) => state.language);
  const setLanguage = useI18nStore((state) => state.setLanguage);
  
  return (
    <button onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}>
      {language === 'ko' ? 'English' : '한국어'}
    </button>
  );
}
```

## API

### `createHuaStore<T>(storeCreator, config?)`

Creates a Zustand store with hua-ux optimizations.

**Parameters:**
- `storeCreator`: Zustand state creator function
- `config`: Optional store configuration

**Configuration Options:**
```typescript
interface StoreConfig {
  persist?: boolean;        // Enable persistence (default: false)
  persistKey?: string;      // Storage key (default: 'hua-state-storage')
  ssr?: boolean;           // Enable SSR support (default: false)
  partialize?: <T>(state: T) => Partial<T>; // Select state to persist
}
```

### `createI18nStore(config)`

Creates a pre-configured store for i18n language management.

**Configuration Options:**
```typescript
interface I18nStoreConfig {
  defaultLanguage: string;      // Default language code
  supportedLanguages: string[]; // Array of supported language codes
  persist?: boolean;            // Enable persistence (default: true)
  persistKey?: string;          // Storage key (default: 'hua-i18n-storage')
  ssr?: boolean;               // Enable SSR support (default: true)
}
```

## SSR Support

The store automatically handles SSR hydration when `ssr: true` is enabled. This prevents hydration mismatches in Next.js App Router.

```tsx
// Server-side: Store initializes with default state
// Client-side: Store hydrates from persisted state (if persist is enabled)
// No hydration errors!
```

## Persistence

When `persist: true` is enabled, the store automatically syncs with localStorage. Use `partialize` to select which state to persist:

```tsx
const useAppStore = createHuaStore((set) => ({
  theme: 'light',
  user: { id: 1, name: 'John' },
  temporaryData: '...',
}), {
  persist: true,
  partialize: (state) => ({ 
    theme: state.theme,
    // Only persist theme, not user or temporaryData
  }),
});
```

## Integration with hua-ux

This package is designed to work seamlessly with other hua-ux packages:

- **@hua-labs/i18n-core-zustand**: Use `createI18nStore` for language management
- **@hua-labs/hua-ux/framework**: Framework layer uses this for state management

### Requirements

- React >= 19.0.0
- React DOM >= 19.0.0
- Zustand (peer dependency)

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public

## Korean

### 개요
hua-ux 생태계를 위한 SSR 지원 통합 상태 관리 솔루션입니다. Next.js App Router를 위한 자동 hydration 처리, localStorage 지속성, React 및 Next.js 애플리케이션을 위한 원활한 i18n 통합을 제공합니다.

### 설치

```bash
pnpm add @hua-labs/state zustand
# 또는
npm install @hua-labs/state zustand
# 또는
yarn add @hua-labs/state zustand
```

### 주요 기능

- ✅ **Zustand 기반**: 경량, 고성능 상태 관리를 위한 Zustand 기반
- ✅ **SSR 지원**: Next.js App Router를 위한 자동 hydration 처리
- ✅ **지속성**: partialize 지원이 있는 내장 localStorage 지속성
- ✅ **i18n 통합**: 언어 관리를 위한 사전 구성된 스토어
- ✅ **타입 안전**: 엄격한 타이핑을 통한 완전한 TypeScript 지원
- ✅ **프레임워크 최적화**: hua-ux 생태계를 위해 특별히 설계됨

### 빠른 시작

#### 기본 스토어

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
```

#### i18n 스토어

```tsx
import { createI18nStore } from '@hua-labs/state/integrations/i18n';

const useI18nStore = createI18nStore({
  defaultLanguage: 'ko',
  supportedLanguages: ['ko', 'en'],
  persist: true,
  ssr: true,
});
```

### SSR 지원

`ssr: true`가 활성화되면 스토어가 자동으로 SSR hydration을 처리합니다. 이는 Next.js App Router에서 hydration 불일치를 방지합니다.

### 지속성

`persist: true`가 활성화되면 스토어가 자동으로 localStorage와 동기화됩니다. `partialize`를 사용하여 지속할 상태를 선택하세요.

### hua-ux와의 통합

이 패키지는 다른 hua-ux 패키지와 원활하게 작동하도록 설계되었습니다:

- **@hua-labs/i18n-core-zustand**: 언어 관리를 위해 `createI18nStore` 사용
- **@hua-labs/hua-ux/framework**: 프레임워크 레이어가 상태 관리를 위해 이를 사용

### 요구사항

- React >= 19.0.0
- React DOM >= 19.0.0
- Zustand (peer dependency)

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
