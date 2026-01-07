# @hua-labs/i18n-loaders

Translation loaders with caching and preloading for @hua-labs/i18n-core.
캐싱 및 프리로딩 기능을 갖춘 번역 로더.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-loaders.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **⚠️ Alpha Release**: This package is currently in alpha. APIs may change before the stable release.

---

[English](#english) | [한국어](#korean)

## English

### Overview
Production-ready translation loaders with built-in caching and preloading. Designed to work seamlessly with @hua-labs/i18n-core.

## Key Features

- API-based translation loader (`createApiTranslationLoader`)
- Built-in TTL/global cache/duplicate request prevention
- Namespace preloading & fallback language warming
- Default translation (JSON) merging (SUM API style)
- Works on both server and client
- **Production tested**: Currently used in SUM API

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
  
  // Retry configuration for network errors
  retryCount?: number; // Number of retry attempts (default: 0, no retry)
  retryDelay?: number; // Base delay in milliseconds (default: 1000), uses exponential backoff
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
  retryCount: 3,              // Retry 3 times on network errors
  retryDelay: 1000,            // 1 second base delay (exponential backoff)
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

- **Automatic retry**: Network errors are automatically retried with exponential backoff (configurable via `retryCount` and `retryDelay`)
- Throws error on API request failure after all retries are exhausted
- Falls back to default translations when using `withDefaultTranslations`
- `preloadNamespaces` uses `Promise.allSettled` to continue even if some fail

### Retry Configuration

```ts
const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  retryCount: 3,        // Retry up to 3 times on network errors (default: 0, no retry)
  retryDelay: 1000,    // Start with 1 second delay, doubles on each retry (exponential backoff)
});
```

The retry mechanism uses exponential backoff:
- 1st retry: waits `retryDelay` ms (e.g., 1000ms)
- 2nd retry: waits `retryDelay * 2` ms (e.g., 2000ms)
- 3rd retry: waits `retryDelay * 4` ms (e.g., 4000ms)

## Examples

- **[Next.js Example](../../examples/next-app-router-example/)** - Complete example using API loader with caching

## Error Handling Improvements

The API loader now includes enhanced error detection:

- **Network error detection**: Improved detection of network failures
- **HTTP status code handling**: Automatic retry for 5xx errors and 408 timeouts
- **Exponential backoff**: Smart retry strategy with configurable delays
- **Error type classification**: Better distinction between retryable and non-retryable errors

See [API Loader Guide](./docs/API_LOADER.md) for detailed error handling documentation.

## Documentation

- [API Loader Guide](./docs/API_LOADER.md) - Detailed API loader documentation and error handling

### Requirements

- React >= 19.0.0
- React DOM >= 19.0.0

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public

## Korean

### 개요
내장 캐싱 및 프리로딩 기능을 갖춘 프로덕션 레디 번역 로더입니다. @hua-labs/i18n-core와 원활하게 작동하도록 설계되었습니다.

### 주요 기능

- API 기반 번역 로더 (`createApiTranslationLoader`)
- 내장 TTL/전역 캐시/중복 요청 방지
- 네임스페이스 프리로딩 및 폴백 언어 워밍업
- 기본 번역 (JSON) 병합 (SUM API 스타일)
- 서버 및 클라이언트 모두에서 작동
- **프로덕션 테스트 완료**: 현재 SUM API에서 사용 중

### 설치

```bash
pnpm add @hua-labs/i18n-loaders
# 또는
npm install @hua-labs/i18n-loaders
```

### 빠른 시작

```ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000, // 1분
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

### API 레퍼런스

#### createApiTranslationLoader

API 기반 번역 로더를 생성합니다. TTL 캐싱, 중복 요청 방지, 전역 캐시를 포함합니다.

#### preloadNamespaces

여러 네임스페이스를 병렬로 프리로드합니다.

#### warmFallbackLanguages

폴백 언어를 미리 워밍업합니다.

#### withDefaultTranslations

기본 번역을 API 번역과 병합합니다. API가 실패하면 기본 번역을 사용합니다.

### 캐싱 동작

- **TTL 캐시**: 각 번역은 `cacheTtlMs` 기간 동안 캐시됩니다
- **중복 요청 방지**: 동일한 번역이 로딩 중이면 기존 Promise를 재사용합니다
- **전역 캐시**: 동일한 로더 인스턴스가 모든 컴포넌트에서 캐시를 공유합니다

### 에러 처리

- **자동 재시도**: 네트워크 오류는 지수 백오프로 자동 재시도됩니다 (`retryCount` 및 `retryDelay`로 구성 가능)
- 모든 재시도가 소진된 후 API 요청 실패 시 오류를 throw합니다
- `withDefaultTranslations`를 사용할 때 기본 번역으로 폴백합니다

자세한 내용은 [API 로더 가이드](./docs/API_LOADER.md)를 참고하세요.

### 요구사항

- React >= 19.0.0
- React DOM >= 19.0.0

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
