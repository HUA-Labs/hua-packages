# @hua-labs/i18n-core Detailed Guide

This document provides technical reference for the @hua-labs/i18n-core library.

---

### Technical Overview
@hua-labs/i18n-core is a lightweight (~6.5KB gzip) library for React applications that manages language state, hydration, and translation loading.

### Capabilities and Implementation
- **Flicker Reduction**: Maintains the previous language translation state until new data is fully loaded during a language switch.
- **Hydration Support**: Designed for SSR environments (Next.js, etc.) to prevent data mismatch errors between server and client.
- **State Management**: Supports external state stores via a dedicated Zustand adapter.
- **Memory Management**: Implements an LRU (Least Recently Used) cache for Translator instances to limit memory consumption.
- **Error Handling**: Uses exponential backoff for network request retries when using the API loader.

---

### Translation Loaders

#### 1. API Loader
Fetches translations via HTTP requests. Recommended for server-side managed translations.
```tsx
createCoreI18n({
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  baseUrl: 'https://example.com', 
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

#### 2. Static and Custom Loaders
Loaders for local storage or external data sources.

---

### Implementation Details

#### Interpolation
Handles dynamic values within translation strings. Supports both `{key}` and `{{key}}` syntax.
```tsx
// JSON: { "welcome": "Hello, {name}!" }
const { t } = useTranslation();
t('common:welcome', { name: 'John' }); // "Hello, John!"
```

#### Array Values (tArray)
Type-safe array access — returns `string[]` without casting.
```tsx
const { tArray } = useTranslation();
const features = tArray('common:features'); // string[]
```

#### Raw Value Access
Retrieves structured data (arrays or objects) directly from translation files.
```tsx
const { getRawValue } = useTranslation();
const raw = getRawValue('common:features'); // unknown
```

#### Plural Support (tPlural)
ICU-compliant plural handling powered by the browser-native `Intl.PluralRules` API (zero bundle cost).

```tsx
// JSON structure — each language defines the categories it needs
// en: { "total_count": { "one": "{count} item", "other": "{count} items" } }
// ko: { "total_count": { "other": "총 {count}개" } }
// ru: { "total_count": { "one": "...", "few": "...", "many": "...", "other": "..." } }

const { tPlural } = useTranslation();

tPlural('common:total_count', 1);           // en → "1 item"   / ko → "총 1개"
tPlural('common:total_count', 5);           // en → "5 items"  / ko → "총 5개"
tPlural('dashboard:heatmap.tooltip', 3, { date: '2026-02-11' });
// en → "2026-02-11: 3 entries"
```

**Supported plural categories** (per CLDR/ICU): `zero`, `one`, `two`, `few`, `many`, `other` (required).

**Fallback behavior:**
- If the value is a plain string (not a plural object), `tPlural` interpolates `{count}` and returns it.
- If the resolved category has no entry, falls back to `other`.

**Type safety:** The type generator (`generate-i18n-types.ts`) automatically detects plural objects and emits `TranslationPluralKey`. Activate via `pluralKey` in the augmentation interface.

---

#### Server-Side Integration
Provides an interface for server-side rendering logic.
```tsx
import { Translator, ssrTranslate } from '@hua-labs/i18n-core';

// Translates on the server before client hydration
const text = ssrTranslate({ translations, key: 'common:hi', language: 'en' });
```
