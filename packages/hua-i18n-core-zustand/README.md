# @hua-labs/i18n-core-zustand

Type-safe adapter package for integrating Zustand state management with `@hua-labs/i18n-core`.

## Installation

```bash
pnpm add @hua-labs/i18n-core-zustand zustand
# or
npm install @hua-labs/i18n-core-zustand zustand
# or
yarn add @hua-labs/i18n-core-zustand zustand
```

## Requirements

- Your Zustand store must have `language: string` and `setLanguage: (lang: string) => void`.

## Usage

### 1. Basic Usage (Create Provider)

```tsx
// lib/i18n-config.ts
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from '../store/useAppStore';

export const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation', 'footer'],
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  defaultLanguage: 'ko', // SSR initial language (prevents hydration errors)
  debug: process.env.NODE_ENV === 'development'
});
```

```tsx
// app/layout.tsx
import { I18nProvider } from './lib/i18n-config';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Zustand Store Example

```tsx
// store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
```

### 3. Using Translations

```tsx
// components/MyComponent.tsx
import { useTranslation } from '@hua-labs/i18n-core';
import { useAppStore } from '../store/useAppStore';

export default function MyComponent() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();

  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <button onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}>
        {language === 'ko' ? 'English' : '한국어'}
      </button>
    </div>
  );
}
```

### 4. Using with SSR

```tsx
// app/layout.tsx (Server Component)
import { loadSSRTranslations } from './lib/ssr-translations';
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from './store/useAppStore';

export default async function RootLayout({ children }) {
  // Load translations from SSR
  const ssrTranslations = await loadSSRTranslations('ko');
  
  const I18nProvider = createZustandI18n(useAppStore, {
    fallbackLanguage: 'en',
    namespaces: ['common', 'navigation', 'footer'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
    defaultLanguage: 'ko', // Same initial language as SSR
    initialTranslations: ssrTranslations, // Pass SSR translations
    debug: process.env.NODE_ENV === 'development'
  });
  
  return (
    <html lang="ko">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

## API

### `createZustandI18n(store, config)`

Creates a Provider that integrates Zustand store with i18n-core.

**Parameters:**
- `store`: Zustand store (must have `language` and `setLanguage` methods)
- `config`: i18n configuration (same as `I18nConfig` except `defaultLanguage`)

**Returns:**
- React Provider component

**Configuration Options:**

```ts
interface ZustandI18nConfig {
  // Initial language to match SSR (prevents hydration errors)
  defaultLanguage?: string;
  
  // Fallback language
  fallbackLanguage?: string;
  
  // Namespace list
  namespaces?: string[];
  
  // Debug mode
  debug?: boolean;
  
  // Custom translation loader
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
  
  // Translation loader type
  translationLoader?: 'api' | 'static' | 'custom';
  
  // API path (when translationLoader is 'api')
  translationApiPath?: string;
  
  // SSR initial translation data
  initialTranslations?: Record<string, Record<string, Record<string, string>>>;
  
  // Auto language sync (always false in this package)
  autoLanguageSync?: boolean;
}
```

### `useZustandI18n(store)`

Provides i18n hook integrated with Zustand store.

**Parameters:**
- `store`: Zustand store

**Returns:**
- `{ language, setLanguage }`: Language state and change function

**Note:** Use `useTranslation` hook for actual translations:

```tsx
import { useTranslation } from '@hua-labs/i18n-core';
import { useZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const { t } = useTranslation(); // Translation function
  const { language, setLanguage } = useZustandI18n(useAppStore); // Language state
  
  return (
    <div>
      <p>{t('common:welcome')}</p>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

## Features

- ✅ **Type-safe**: Full TypeScript support
- ✅ **Minimal dependencies**: Only Zustand as peer dependency
- ✅ **Auto synchronization**: Automatically syncs Zustand store changes to i18n
- ✅ **Unidirectional data flow**: Zustand store is the source of truth
- ✅ **SSR compatible**: Language syncs after hydration completes (prevents hydration errors)
- ✅ **Circular reference prevention**: Safe language synchronization mechanism

## How It Works

1. **Initialization**: `createZustandI18n` wraps `createCoreI18n` to create the base Provider.
2. **Language synchronization**: Detects Zustand store language changes and automatically syncs to i18n.
3. **Hydration**: Only syncs language after hydration completes to prevent SSR/client hydration errors.
4. **Circular reference prevention**: Uses `useRef` to prevent infinite loops and maintains unidirectional data flow.

## Caveats

1. **Zustand store structure**: Store must have `language` and `setLanguage`.
2. **autoLanguageSync**: This package automatically disables `autoLanguageSync` (Zustand adapter handles it directly).
3. **Language changes**: Language changes must be made through Zustand store's `setLanguage`.
4. **SSR initial language**: Use `defaultLanguage` option to set the same initial language as SSR (prevents hydration errors).
5. **Hydration**: Zustand store language only syncs to i18n after hydration completes.

## Examples

See the [examples](../../examples) directory for full examples.

## Related Packages

- `@hua-labs/i18n-core`: Core i18n library
- `@hua-labs/i18n-loaders`: Production-ready loaders and caching utilities

## License

MIT
