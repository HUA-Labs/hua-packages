# @hua-labs/i18n-loaders

Translation loaders with caching and preloading for @hua-labs/i18n-core.
캐싱 및 프리로딩 기능을 갖춘 번역 로더.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-loaders.svg)](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-loaders.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

Production-ready translation loaders with built-in TTL caching, duplicate request prevention, and namespace preloading. Designed to work seamlessly with @hua-labs/i18n-core. Supports both server and client environments.

TTL 캐싱, 중복 요청 방지, 네임스페이스 프리로딩이 내장된 프로덕션 레디 번역 로더입니다. @hua-labs/i18n-core와 원활하게 작동하도록 설계되었습니다. 서버/클라이언트 환경 모두 지원합니다.

## Features

- **API loader** — `createApiTranslationLoader` with configurable endpoints
- **TTL caching** — Time-based cache with global cache support
- **Duplicate prevention** — Deduplicates concurrent requests for the same resource
- **Preloading** — Warm up namespaces and fallback languages at startup
- **Default merging** — Merge API translations with bundled defaults

## Installation | 설치

```bash
pnpm add @hua-labs/i18n-loaders
```

Peer dependency: `react >= 19.0.0`

## Quick Start | 빠른 시작

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

## API Overview | API 개요

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

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/i18n-core`](https://www.npmjs.com/package/@hua-labs/i18n-core) — Core i18n library
- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters) — Date, number, currency formatters

## Requirements | 요구사항

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
