# @hua-labs/i18n-core-zustand Detailed Guide

Deep integration between Zustand and i18n-core.

---

## How It Works

The adapter captures the Zustand store's state and bridges it to the i18n engine's configuration.

### Flow

1. `createZustandI18n(store, config)` creates a Provider wrapping `I18nProvider`
2. On mount, it waits for Zustand persist rehydration to complete
3. After rehydration, it syncs the stored language to i18n-core
4. Language changes in either direction (store ↔ i18n) auto-sync bidirectionally

### Benefits

- **Persistent Language**: Syncs with `zustand/middleware/persist`.
- **SSR Ready**: Prevents hydration flickering via `defaultLanguage`.
- **Type Safety**: Full TypeScript support for store actions and translations.

## Store Setup

```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'app-storage' }  // This is the storageKey
  )
);
```

## Adapter Initialization

```tsx
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';

export const I18nProvider = createZustandI18n(useAppStore, {
  defaultLanguage: 'ko',
  namespaces: ['common'],
  storageKey: 'app-storage',       // Must match persist name
  autoUpdateHtmlLang: true,         // Auto-update <html lang="">
  debug: process.env.NODE_ENV === 'development',
});
```

## Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultLanguage` | `string` | `'ko'` | SSR initial language (must match server) |
| `fallbackLanguage` | `string` | — | Fallback for missing translations |
| `namespaces` | `string[]` | `['common']` | Namespaces to load |
| `storageKey` | `string` | `'hua-i18n-storage'` | Zustand persist key for hydration detection |
| `autoUpdateHtmlLang` | `boolean` | `false` | Auto-update `document.documentElement.lang` |
| `translationLoader` | `'api' \| 'static' \| 'custom'` | `'api'` | Loader type |
| `translationApiPath` | `string` | — | API endpoint path |
| `initialTranslations` | `Record<...>` | — | SSR pre-loaded translations |
| `supportedLanguages` | `string[] \| {code,name,nativeName}[]` | — | Supported languages |
| `debug` | `boolean` | `false` | Enable debug logging |

## useZustandI18n Hook

Lightweight hook that returns only Zustand store language state — **does NOT return `t`**.

```tsx
import { useZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { language, setLanguage } = useZustandI18n(useAppStore);
  const { t } = useTranslation();  // t comes from i18n-core

  return <h1>{t('common:welcome')}</h1>;
}
```

## Important: storageKey

`storageKey` must match the `name` in your Zustand `persist()` config. This is used to detect when rehydration completes, ensuring the stored language syncs correctly after SSR.
