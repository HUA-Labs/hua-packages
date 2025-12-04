# @hua-labs/i18n-loaders

Production-ready translation loaders, caching, and preloading utilities. Use with `@hua-labs/i18n-core` to reuse proven loading strategies from PaysByPays and SUM API.

## Key Features

- ✅ API-based translation loader (`createApiTranslationLoader`)
- ✅ Built-in TTL/global cache/duplicate request prevention
- ✅ Namespace preloading & fallback language warming
- ✅ Default translation (JSON) merging (SUM API style)
- ✅ Works on both server and client
- ✅ **Production tested**: Currently used in PaysByPays and SUM API

## Installation

```bash
pnpm add @hua-labs/i18n-loaders
# or
npm install @hua-labs/i18n-loaders
```

## Quick Start

### Basic Usage

```ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000, // 1 minute
  enableGlobalCache: true
});

export const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  translationLoader: 'custom',
  loadTranslations
});
```

### Preloading

```ts
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations'
});

// Preload required namespaces at app startup
preloadNamespaces('ko', ['common', 'dashboard'], loadTranslations);
```

### Using Default Translation Merging

```ts
import { createApiTranslationLoader, withDefaultTranslations } from '@hua-labs/i18n-loaders';

const apiLoader = createApiTranslationLoader({
  translationApiPath: '/api/translations'
});

const defaultTranslations = {
  ko: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  }
};

// Use default translations if API fails, merge if API succeeds
const loadTranslations = withDefaultTranslations(apiLoader, defaultTranslations);
```

## API Reference

### createApiTranslationLoader

Creates an API-based translation loader. Includes TTL caching, duplicate request prevention, and global cache.

```ts
function createApiTranslationLoader(
  options?: ApiLoaderOptions
): TranslationLoader
```

#### Options

```ts
interface ApiLoaderOptions {
  // API path (default: '/api/translations')
  translationApiPath?: string;
  
  // Base URL (for server-side use)
  baseUrl?: string;
  
  // Local fallback URL (for development)
  localFallbackBaseUrl?: string;
  
  // Cache TTL (milliseconds, default: 5 minutes)
  cacheTtlMs?: number;
  
  // Disable cache
  disableCache?: boolean;
  
  // Fetch request options
  requestInit?: RequestInit | ((language: string, namespace: string) => RequestInit | undefined);
  
  // Custom fetcher (for testing)
  fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  
  // Logger (default: console)
  logger?: Pick<typeof console, 'log' | 'warn' | 'error'>;
}
```

#### Examples

```ts
// Basic usage
const loader = createApiTranslationLoader();

// Custom options
const loader = createApiTranslationLoader({
  translationApiPath: '/api/v2/translations',
  cacheTtlMs: 10 * 60 * 1000, // 10 minutes
  disableCache: false,
  requestInit: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
});

// Dynamic request options
const loader = createApiTranslationLoader({
  requestInit: (language, namespace) => ({
    headers: {
      'X-Language': language,
      'X-Namespace': namespace
    }
  })
});
```

### preloadNamespaces

Preloads multiple namespaces in parallel.

```ts
function preloadNamespaces(
  language: string,
  namespaces: string[],
  loader: TranslationLoader,
  options?: PreloadOptions
): Promise<{
  fulfilled: string[];
  rejected: unknown[];
}>
```

#### Options

```ts
interface PreloadOptions {
  // Logger (default: console)
  logger?: Pick<typeof console, 'log' | 'warn'>;
  
  // Suppress errors (default: false)
  suppressErrors?: boolean;
}
```

#### Examples

```ts
import { preloadNamespaces } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader();

// Preload multiple namespaces
const result = await preloadNamespaces(
  'ko',
  ['common', 'navigation', 'footer'],
  loader
);

console.log(`Loaded: ${result.fulfilled.length}`);
console.log(`Failed: ${result.rejected.length}`);
```

### warmFallbackLanguages

Pre-warms fallback languages.

```ts
function warmFallbackLanguages(
  currentLanguage: string,
  languages: string[],
  namespaces: string[],
  loader: TranslationLoader,
  options?: PreloadOptions
): Promise<Array<{
  fulfilled: string[];
  rejected: unknown[];
}>>
```

#### Examples

```ts
import { warmFallbackLanguages } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader();

// When current language is 'ko', preload 'en', 'ja'
await warmFallbackLanguages(
  'ko',
  ['ko', 'en', 'ja'],
  ['common', 'navigation'],
  loader
);
```

### withDefaultTranslations

Merges default translations with API translations. Uses default translations if API fails.

```ts
function withDefaultTranslations(
  loader: TranslationLoader,
  defaults: DefaultTranslations
): TranslationLoader
```

#### Types

```ts
type DefaultTranslations = Record<
  string, // language
  Record<string, TranslationRecord> // namespace -> translations
>;
```

#### Examples

```ts
import { withDefaultTranslations } from '@hua-labs/i18n-loaders';

const apiLoader = createApiTranslationLoader();

const defaults = {
  ko: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  }
};

const loader = withDefaultTranslations(apiLoader, defaults);

// Merges with default translations if API succeeds
// Uses only default translations if API fails
const translations = await loader('ko', 'common');
```

## Usage Scenarios

### Next.js App Router

```tsx
// lib/i18n-config.ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000
});

export const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation', 'footer'],
  translationLoader: 'custom',
  loadTranslations
});

// Use in app/layout.tsx
export default function RootLayout({ children }) {
  // Preload on client
  if (typeof window !== 'undefined') {
    preloadNamespaces('ko', ['common', 'navigation'], loadTranslations);
  }
  
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### Using with SSR

```tsx
// app/layout.tsx (Server Component)
import { loadSSRTranslations } from './lib/ssr-translations';
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

export default async function RootLayout({ children }) {
  // Load translations from SSR
  const ssrTranslations = await loadSSRTranslations('ko');
  
  // Client loader
  const loadTranslations = createApiTranslationLoader({
    translationApiPath: '/api/translations'
  });
  
  const I18nProvider = createCoreI18n({
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    namespaces: ['common', 'navigation', 'footer'],
    translationLoader: 'custom',
    loadTranslations,
    initialTranslations: ssrTranslations // Pass SSR translations
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

## Caching Behavior

- **TTL Cache**: Each translation is cached for `cacheTtlMs` duration
- **Duplicate Request Prevention**: Reuses existing Promise if same translation is loading
- **Global Cache**: Same loader instance shares cache across all components

## Error Handling

- Throws error on API request failure
- Falls back to default translations when using `withDefaultTranslations`
- `preloadNamespaces` uses `Promise.allSettled` to continue even if some fail

## Documentation

- [API Reference](../../docs/I18N_CORE_API_REFERENCE.md)
- [Loader Guide](../../docs/I18N_CORE_LOADERS.md)
- [Performance Optimization Guide](../../docs/I18N_CORE_PERFORMANCE_GUIDE.md)
- [PaysByPays Use Case](../../docs/I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md)

## License

MIT License
