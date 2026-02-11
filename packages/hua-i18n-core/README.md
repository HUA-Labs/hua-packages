# @hua-labs/i18n-core

Lightweight, production-ready i18n library for React. Delivers zero-flicker language transitions through intelligent caching, SSR-first hydration handling, and built-in state management integration. ~6.5KB gzipped with zero dependencies (React only).

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Zero-flicker — Shows previous language during transition**
- **SSR-first — Built-in hydration handling, no mismatch issues**
- **Namespace lazy loading — Load translations on demand**
- **Pluralization — ICU-compliant plural support via Intl.PluralRules (zero bundle cost)**
- **Type-safe arrays — tArray() returns string[] without casting**
- **State management — First-class Zustand support via i18n-core-zustand**
- **Automatic retry — Exponential backoff for API loader failures**
- **~6.5KB gzipped — Zero external dependencies**

## Installation

```bash
pnpm add @hua-labs/i18n-core
```

> Peer dependencies: react >=19.0.0

## Quick Start

```tsx
import { createCoreI18n, useTranslation } from '@hua-labs/i18n-core';

const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'pages'],
});

export default function Layout({ children }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function Welcome() {
  const { t, tPlural } = useTranslation();
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{tPlural('common:total_count', 5)}</p>
    </div>
  );
}

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `useTranslation` | hook | Main translation hook — returns t, tPlural, tArray, getRawValue and state |
| `useLanguageChange` | hook | Language change hook with validation against supported languages |
| `useI18n` | hook | Full context hook — all translation functions plus language management |
| `I18nProvider` | component | Direct Provider component (for advanced use) |
| `Translator` | class | Core translator class (for manual instantiation) |
| `ssrTranslate` | function | Server-side translation function (no React needed) |
| `serverTranslate` | function | Server-side translate with full config |
| `I18nConfig` | type |  |
| `I18nContextType` | type |  |
| `TranslationParams` | type |  |
| `TypedTranslationKeys` | type |  |
| `ResolveStringKey` | type |  |
| `ResolveArrayKey` | type |  |
| `ResolvePluralKey` | type |  |
| `PluralValue` | type |  |
| `PluralCategory` | type |  |
| `createCoreI18n` | function | Create an i18n Provider component with configuration |
| `CoreProvider` | function | Minimal Provider with zero config |
| `createLanguageProvider` | function | Create a Provider with just a language setting |
| `createNamespaceProvider` | function | Create a Provider with just namespace settings |
| `createCustomLoaderProvider` | function | Create a Provider with custom translation loader |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand)
- [`@hua-labs/eslint-plugin-i18n`](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n)
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders)
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters)

## License

MIT — [HUA Labs](https://hua-labs.com)
