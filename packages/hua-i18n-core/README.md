# @hua-labs/i18n-core

Type-safe i18n library with SSR/CSR support and zero-flicker language transitions.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

Lightweight, production-ready i18n library for React. Delivers zero-flicker language transitions through intelligent caching, SSR-first hydration handling, and built-in state management integration. ~2.8KB gzipped with zero dependencies (React only).

## Features

- **Zero-flicker** — Shows previous language during transition
- **SSR-first** — Built-in hydration handling, no mismatch issues
- **Namespace lazy loading** — Load translations on demand
- **State management** — First-class Zustand support via i18n-core-zustand
- **Automatic retry** — Exponential backoff for API loader failures
- **~2.8KB gzipped** — Zero external dependencies

## Installation

```bash
pnpm add @hua-labs/i18n-core
```

Peer dependency: `react >= 19.0.0`

## Quick Start

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

## API Overview

| Function | Description |
|----------|-------------|
| `createCoreI18n(config)` | Create an i18n Provider component |
| `useTranslation()` | Hook returning `{ t, tArray, language, setLanguage, isLoading }` |

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

**`t()` / `tArray()` functions:**
- `t('namespace:key')` — Get translation string
- `t('namespace:key', { name: 'World' })` — With interpolation
- `tArray('namespace:key')` — Get string array (type-safe, no casting needed)
- `getRawValue('namespace:key')` — Get raw value (unknown type)

## Type Safety (Opt-in)

Generate TypeScript types from your translation JSON files for build-time key validation:

```bash
# Generate types from base language (ko)
pnpm tsx node_modules/@hua-labs/i18n-core/scripts/generate-i18n-types.ts \
  --translations-dir ./translations/ko \
  --output ./types/i18n-types.generated.ts

# Validate translations across languages
pnpm tsx node_modules/@hua-labs/i18n-core/scripts/validate-translations.ts \
  --translations-dir ./translations \
  --base ko --strict ko,en,ja
```

Activate type narrowing via declaration merging:

```typescript
// types/i18n.d.ts
import type { TranslationStringKey, TranslationArrayKey } from './i18n-types.generated';

declare module '@hua-labs/i18n-core' {
  interface TypedTranslationKeys {
    stringKey: TranslationStringKey;
    arrayKey: TranslationArrayKey;
  }
}
```

Once activated:
- `t('common:savee')` — TS error (typo caught at build time)
- `tArray('analysis:metrics.guides')` — `string[]` return guaranteed
- IDE autocomplete for all translation keys

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)
- [Documentation Site](https://docs.hua-labs.com)

## CLI Scripts

| Script | Description |
|--------|-------------|
| `generate:types` | Generate TypeScript types from translation JSON files |
| `validate:translations` | Cross-language translation validation (missing keys, orphans, interpolation) |

## Related Packages

- [`@hua-labs/i18n-core-zustand`](https://www.npmjs.com/package/@hua-labs/i18n-core-zustand) — Zustand state adapter
- [`@hua-labs/eslint-plugin-i18n`](https://www.npmjs.com/package/@hua-labs/eslint-plugin-i18n) — ESLint rules for i18n (missing keys, raw text, dynamic keys)
- [`@hua-labs/i18n-loaders`](https://www.npmjs.com/package/@hua-labs/i18n-loaders) — Translation loaders and caching
- [`@hua-labs/i18n-formatters`](https://www.npmjs.com/package/@hua-labs/i18n-formatters) — Date, number, currency formatters

## Requirements

React >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
