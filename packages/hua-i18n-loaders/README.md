# @hua-labs/i18n-loaders

Production-ready translation loaders with built-in TTL caching, duplicate request prevention, and namespace preloading. Designed to work seamlessly with @hua-labs/i18n-core. Supports both server and client environments.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-loaders.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **API loader — createApiTranslationLoader with configurable endpoints**
- **TTL caching — Time-based cache with global cache support**
- **Duplicate prevention — Deduplicates concurrent requests for the same resource**
- **Preloading — Warm up namespaces and fallback languages at startup**
- **Default merging — Merge API translations with bundled defaults**

## Installation

```bash
pnpm add @hua-labs/i18n-loaders
```

> Peer dependencies: react >=19.0.0

## Quick Start

```tsx
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000,
  retryCount: 2,
});

// Preload at startup
preloadNamespaces('ko', ['common', 'dashboard'], loader);

// Use with i18n-core
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  translationLoader: 'custom',
  loadTranslations: loader,
});

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `createApiTranslationLoader` | function | Create API-based loader with caching and retry |
| `preloadNamespaces` | function | Preload translation namespaces |
| `warmFallbackLanguages` | function | Warm up fallback language caches |
| `withDefaultTranslations` | function | Merge API results with bundled defaults |
| `ApiLoaderOptions` | type |  |
| `CacheInvalidation` | type |  |
| `DefaultTranslations` | type |  |
| `PreloadOptions` | type |  |
| `TranslationLoader` | type |  |
| `TranslationRecord` | type |  |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core)
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters)

## License

MIT — [HUA Labs](https://hua-labs.com)
