# @hua-labs/i18n-core Detailed Guide

This document provides technical reference for the @hua-labs/i18n-core library.

---

### Technical Overview
@hua-labs/i18n-core is a lightweight (~2.8KB gzip) library for React applications that manages language state, hydration, and translation loading.

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

#### Interpolation (tWithParams)
Handles dynamic values within translation strings using a standard template format.
```tsx
// JSON: { "welcome": "Hello, {{name}}!" }
tWithParams('common:welcome', { name: 'John' });
```

#### Raw Value Access
Retrieves structured data (arrays or objects) directly from translation files.
```tsx
const features = getRawValue('common:features') as string[];
```

#### Server-Side Integration
Provides an interface for server-side rendering logic.
```tsx
import { Translator, ssrTranslate } from '@hua-labs/i18n-core';

// Translates on the server before client hydration
const text = ssrTranslate({ translations, key: 'common:hi', language: 'en' });
```
