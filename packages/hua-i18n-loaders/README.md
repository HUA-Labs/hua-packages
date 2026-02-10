# @hua-labs/i18n-loaders

Translation loaders with caching and preloading for @hua-labs/i18n-core.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-loaders.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

Production-ready translation loaders with built-in TTL caching, duplicate request prevention, and namespace preloading. Designed to work seamlessly with @hua-labs/i18n-core. Supports both server and client environments.

## Features

- **API loader** — `createApiTranslationLoader` with configurable endpoints
- **TTL caching** — Time-based cache with global cache support
- **Duplicate prevention** — Deduplicates concurrent requests for the same resource
- **Preloading** — Warm up namespaces and fallback languages at startup
- **Default merging** — Merge API translations with bundled defaults

## Installation

```bash
pnpm add @hua-labs/i18n-loaders
```

Peer dependency: `react >= 19.0.0`

## Quick Start

```tsx
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000,
  enableGlobalCache: true,
});

// Preload at startup
preloadNamespaces('ko', ['common', 'dashboard'], loadTranslations);

// Use with i18n-core
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  translationLoader: 'custom',
  loadTranslations,
});
```

## API Overview

| Function | Description |
|----------|-------------|
| `createApiTranslationLoader(config)` | Create an API-based translation loader |
| `preloadNamespaces(lang, namespaces, loader)` | Preload translation namespaces |
| `withDefaultTranslations(loader, defaults)` | Merge API results with bundled defaults |

**Loader config:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `translationApiPath` | `string` | — | API endpoint path |
| `cacheTtlMs` | `number` | `300000` | Cache TTL in ms |
| `enableGlobalCache` | `boolean` | `true` | Enable global cache |

## Documentation

- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — Core i18n library
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters) — Date, number, currency formatters

## Requirements

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
