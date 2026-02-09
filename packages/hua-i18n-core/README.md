# @hua-labs/i18n-core

Type-safe i18n library with SSR/CSR support and zero-flicker language transitions.
SSR/CSR 지원 및 깜빡임 없는 언어 전환을 제공하는 타입 안전 i18n 라이브러리.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

Lightweight, production-ready i18n library for React. Delivers zero-flicker language transitions through intelligent caching, SSR-first hydration handling, and built-in state management integration. ~2.8KB gzipped with zero dependencies (React only).

React를 위한 경량 프로덕션 레디 i18n 라이브러리입니다. 지능적 캐싱, SSR 우선 hydration 처리, 내장 상태 관리 통합을 통해 깜빡임 없는 언어 전환을 제공합니다. React만 의존하며 ~2.8KB gzipped.

## Features

- **Zero-flicker** — Shows previous language during transition
- **SSR-first** — Built-in hydration handling, no mismatch issues
- **Namespace lazy loading** — Load translations on demand
- **State management** — First-class Zustand support via i18n-core-zustand
- **Automatic retry** — Exponential backoff for API loader failures
- **~2.8KB gzipped** — Zero external dependencies

## Installation | 설치

```bash
pnpm add @hua-labs/i18n-core
```

Peer dependency: `react >= 19.0.0`

## Quick Start | 빠른 시작

```tsx
import { createCoreI18n, useTranslation } from '@hua-labs/i18n-core';

// Create provider
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'pages'],
});

// Use in layout
export default function Layout({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}

// Use translations
function Welcome() {
  const { t, language, setLanguage } = useTranslation();
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

## API Overview | API 개요

| Function | Description |
|----------|-------------|
| `createCoreI18n(config)` | Create an i18n Provider component |
| `useTranslation()` | Hook returning `{ t, language, setLanguage, isLoading }` |

**Config options:**

| Option | Type | Description |
|--------|------|-------------|
| `defaultLanguage` | `string` | Default language code |
| `fallbackLanguage` | `string` | Fallback language |
| `namespaces` | `string[]` | Namespace list |
| `translationLoader` | `'api' \| 'static' \| 'custom'` | Loader strategy |
| `translationApiPath` | `string` | API endpoint for translations |
| `loadTranslations` | `(lang, ns) => Promise<Record>` | Custom loader function |
| `initialTranslations` | `Record<...>` | SSR pre-loaded data |
| `debug` | `boolean` | Enable debug logging |

**`t()` function:**
- `t('namespace:key')` — Get translation string
- `t('namespace:key', { name: 'World' })` — With interpolation
- `getRawValue('namespace:key')` — Get arrays, objects, or non-string values

## Documentation | 문서

- [Detailed Guide](./DETAILED_GUIDE.md)
- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders) — Translation loaders and caching
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters) — Date, number, currency formatters

## Requirements | 요구사항

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
