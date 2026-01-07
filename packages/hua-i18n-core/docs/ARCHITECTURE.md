# @hua-labs/i18n-core Architecture

## Overview

`@hua-labs/i18n-core` is a lightweight i18n library for React applications. It supports both SSR and CSR, and provides an optimized translation system that prevents flickering during language changes.

## Core Components

### 1. Translator Class

The core class responsible for translation logic.

#### Key Features
- Translation key parsing and lookup
- Multi-language fallback support
- Flickering prevention during language changes
- Caching and performance optimization

#### Translation Lookup Order
1. **Current language**: `findInNamespace(namespace, key, targetLang)`
2. **Other loaded languages**: Temporarily returns previous language translation to prevent flickering during language switch
3. **Fallback language**: `findInFallbackLanguage()`
4. **Missing key handling**: Returns key in debug mode, empty string in production

```typescript
translate(key: string, language?: string): string {
  // Step 1: Find in current language
  // Step 2: Find in other loaded languages (flickering prevention)
  // Step 3: Find in fallback language
  // Step 4: Handle missing key
}
```

### 2. I18nProvider Component

A Provider component that supplies translation state through React Context.

#### Key Features
- Translator instance management
- Language change event handling
- Translation load completion detection
- SSR translation data integration

### 3. useI18n Hook

React hook for using translation functionality.

#### Translation Lookup Priority
1. **Translator.translate()**: Main translation engine
2. **SSR translation data**: Lookup from `initialTranslations`
3. **Default translation data**: Lookup from `getDefaultTranslations()`

## Language Change Optimization

### Flickering Prevention Mechanism

When changing languages, translations for the new language may not be loaded yet. To prevent this:

1. **Temporary previous language display**: If new language translation is not available, temporarily display previous language translation
2. **Automatic update**: Automatically updates when new language translation is loaded
3. **Debouncing**: Prevents duplicate notifications when multiple translations load simultaneously

```typescript
// translator.tsx
private findInOtherLanguages(namespace: string, key: string, targetLang: string): string | null {
  // Find translation in other loaded languages
  // Prevents flickering during language change
}
```

## SSR Support

### Hydration Handling

Reuses translation data passed from SSR on the client to minimize network requests.

```typescript
// Pass translation data from SSR
initialTranslations: {
  ko: {
    common: { welcome: "환영합니다" },
    navigation: { home: "홈" }
  },
  en: {
    common: { welcome: "Welcome" },
    navigation: { home: "Home" }
  }
}
```

### Server-Side Translation

Use `ssrTranslate` and `serverTranslate` functions to perform translations on the server.

## Performance Optimization

### Caching Strategy

- **TTL Cache**: Each translation is cached for 5 minutes
- **Duplicate Request Prevention**: Reuses existing Promise if same translation is loading
- **LRU Cache**: Translator instances are cached up to 10 instances

### Re-rendering Optimization

- **Debouncing**: Translation load completion events are debounced by 50ms to prevent unnecessary re-renders
- **Memoization**: Function memoization using `useCallback` and `useMemo`

## Error Handling

### Error Classification

- **MISSING_KEY**: Translation key not found
- **LOAD_FAILED**: Translation file load failure
- **NETWORK_ERROR**: Network error
- **INITIALIZATION_ERROR**: Initialization error

### Recovery Strategy

- **Automatic retry**: Retries with exponential backoff on network errors
- **Fallback language**: Falls back to fallback language if not found in current language
- **Default translations**: Uses default translations if all steps fail

## Type Safety

### Type Definitions

```typescript
interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: LanguageConfig[];
  namespaces?: string[];
  loadTranslations: (language: string, namespace: string) => Promise<TranslationNamespace>;
  // ...
}
```

### Type Guards

- `isTranslationNamespace()`: Validates translation namespace type
- `isLanguageConfig()`: Validates language config type
- `isTranslationError()`: Validates translation error type

## Extensibility

### Custom Loader

You can implement a custom translation loader:

```typescript
createCoreI18n({
  translationLoader: 'custom',
  loadTranslations: async (language, namespace) => {
    // Load from database, CMS, or other source
    return await fetchFromDatabase(language, namespace);
  }
})
```

### Plugin System

Advanced features are provided by the `@hua-labs/i18n-advanced` package.
