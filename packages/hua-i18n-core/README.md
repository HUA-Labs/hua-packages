# @hua-labs/i18n-core

HUA Labs - Core Internationalization Library

Lightweight i18n library for React applications with essential translation features only.

## Installation

```bash
npm install @hua-labs/i18n-core
# or
yarn add @hua-labs/i18n-core
# or
pnpm add @hua-labs/i18n-core
```

## Features

- Lightweight core translation functionality
- Multiple translation loader strategies (API, static files, custom)
- Lazy loading support for namespaces
- SSR/SSG support
- TypeScript support
- Zero external dependencies (except React)
- Built-in caching
- Error handling and fallback support
- Debug mode for development

## Quick Start

### Basic Setup

```tsx
// app/layout.tsx (Next.js App Router)
import { createCoreI18n } from '@hua-labs/i18n-core';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createCoreI18n({
          defaultLanguage: 'ko',
          fallbackLanguage: 'en',
          namespaces: ['common', 'pages']
        })({ children })}
      </body>
    </html>
  );
}
```

### Using Translations

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('pages.home.title')}</p>
    </div>
  );
}
```

## Translation Loaders

The library supports three translation loading strategies:

### 1. API Loader (Default, Recommended)

Loads translations through API routes. Best for production environments.

```tsx
createCoreI18n({
  translationLoader: 'api',
  translationApiPath: '/api/translations', // default
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

**API Route Example (Next.js):**

```tsx
// app/api/translations/[language]/[namespace]/route.ts
import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await params;
  const translationPath = join(
    process.cwd(),
    'translations',
    language,
    `${namespace}.json`
  );
  
  try {
    const fileContent = await readFile(translationPath, 'utf-8');
    return NextResponse.json(JSON.parse(fileContent), {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Translation not found' }, { status: 404 });
  }
}
```

### 2. Static File Loader

Loads translations from static JSON files in the public directory.

```tsx
createCoreI18n({
  translationLoader: 'static',
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

The loader will try these paths:
- `/translations/{language}/{namespace}.json`
- `../translations/{language}/{namespace}.json`
- `./translations/{language}/{namespace}.json`
- `translations/{language}/{namespace}.json`
- `../../translations/{language}/{namespace}.json`

### 3. Custom Loader

Use your own translation loading function.

```tsx
createCoreI18n({
  translationLoader: 'custom',
  loadTranslations: async (language, namespace) => {
    // Load from database, CMS, or any other source
    const response = await fetch(`https://api.example.com/translations/${language}/${namespace}`);
    return response.json();
  },
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

## File Structure

Recommended file structure for translations:

```
your-app/
├── translations/
│   ├── ko/
│   │   ├── common.json
│   │   ├── pages.json
│   │   └── footer.json
│   └── en/
│       ├── common.json
│       ├── pages.json
│       └── footer.json
└── app/
    └── layout.tsx
```

## Translation File Format

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요",
  "goodbye": "안녕히 가세요",
  "loading": "로딩 중...",
  "error": "오류가 발생했습니다"
}
```

```json
// translations/ko/pages.json
{
  "home": {
    "title": "홈",
    "description": "홈 페이지입니다"
  },
  "about": {
    "title": "소개",
    "description": "소개 페이지입니다"
  }
}
```

## Usage

### Basic Translation

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('pages.home.title')}</p>
    </div>
  );
}
```

### Translation with Parameters

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { tWithParams } = useTranslation();
  
  return (
    <div>
      <p>{tWithParams('common.greeting', { name: 'John' })}</p>
    </div>
  );
}
```

Translation file:
```json
{
  "greeting": "Hello, {{name}}!"
}
```

### Language Switching

```tsx
import { useLanguageChange } from '@hua-labs/i18n-core';

function LanguageSwitcher() {
  const { changeLanguage, supportedLanguages, currentLanguage } = useLanguageChange();
  
  return (
    <div>
      {supportedLanguages.map(lang => (
        <button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          disabled={lang.code === currentLanguage}
        >
          {lang.nativeName}
        </button>
      ))}
    </div>
  );
}
```

### Advanced Hook Usage

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const {
    t,
    tWithParams,
    currentLanguage,
    setLanguage,
    isLoading,
    error,
    supportedLanguages,
    isInitialized,
    debug
  } = useTranslation();
  
  if (isLoading) {
    return <div>Loading translations...</div>;
  }
  
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>Current language: {currentLanguage}</p>
      <p>Loaded namespaces: {debug.getLoadedNamespaces().join(', ')}</p>
    </div>
  );
}
```

## SSR Support

### Server-Side Translation

```tsx
import { Translator, ssrTranslate, serverTranslate } from '@hua-labs/i18n-core';

// Using Translator class
export async function getServerTranslations(language: string) {
  const translator = await Translator.create({
    defaultLanguage: language,
    namespaces: ['common', 'pages'],
    loadTranslations: async (lang, namespace) => {
      const path = `./translations/${lang}/${namespace}.json`;
      return (await import(path)).default;
    }
  });
  
  return {
    welcome: translator.translate('common.welcome'),
    title: translator.translate('pages.home.title')
  };
}

// Using helper functions
export function getStaticTranslations(language: string) {
  const translations = require(`./translations/${language}/common.json`);
  
  return {
    welcome: ssrTranslate({
      translations,
      key: 'common.welcome',
      language
    })
  };
}
```

## Key Rules

### Namespace Keys

Always include namespace in the key:

```tsx
t('common.welcome')      // common.json -> welcome
t('pages.home.title')    // pages.json -> home.title
t('footer.brand_name')   // footer.json -> brand_name
```

### Common Namespace Shortcut

If the key doesn't include a namespace, it defaults to 'common':

```tsx
t('welcome')    // same as t('common.welcome')
t('hello')      // same as t('common.hello')
```

## Configuration Options

```tsx
createCoreI18n({
  // Required
  defaultLanguage: 'ko',
  
  // Optional
  fallbackLanguage: 'en',
  namespaces: ['common', 'pages'],
  debug: false,
  
  // Loader options
  translationLoader: 'api' | 'static' | 'custom',
  translationApiPath: '/api/translations',
  loadTranslations: async (language, namespace) => {
    // Custom loader function
  }
})
```

## Debug Mode

Enable debug mode to see translation loading and missing keys:

```tsx
createCoreI18n({
  debug: true,
  // ... other options
})
```

### Missing Key Overlay (Development)

Display missing translation keys in development:

```tsx
import { MissingKeyOverlay } from '@hua-labs/i18n-core/components/MissingKeyOverlay';

function DebugBar() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return <MissingKeyOverlay />;
}
```

## Error Handling

The library includes built-in error handling:

- Automatic fallback to default language
- Missing key handling
- Network error recovery
- Cache invalidation on errors

### Custom Error Handler

```tsx
createCoreI18n({
  errorHandler: (error, language, namespace) => {
    console.error(`Translation error: ${error.message}`);
    // Custom error handling logic
  },
  missingKeyHandler: (key, language, namespace) => {
    console.warn(`Missing key: ${key}`);
    return `[MISSING: ${key}]`;
  }
})
```

## Supported Languages

Default supported languages:
- Korean (ko)
- English (en)

Additional languages can be configured through the `supportedLanguages` option in the config.

## Performance

- Lazy loading: Namespaces are loaded on-demand
- Caching: Translations are cached after first load
- Deduplication: Multiple requests for the same translation are deduplicated
- SSR optimization: Server-side translations are pre-loaded

## API Reference

### createCoreI18n

Main configuration function that returns a Provider component.

```tsx
function createCoreI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  translationLoader?: 'api' | 'static' | 'custom';
  translationApiPath?: string;
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
}): (props: { children: React.ReactNode }) => JSX.Element
```

### useTranslation

Hook for accessing translation functions and state.

```tsx
function useTranslation(): {
  t: (key: string, language?: string) => string;
  tWithParams: (key: string, params?: Record<string, string | number>, language?: string) => string;
  tAsync: (key: string, params?: Record<string, string | number>) => Promise<string>;
  tSync: (key: string, namespace?: string, params?: Record<string, string | number>) => string;
  currentLanguage: string;
  setLanguage: (language: string) => void;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
  isLoading: boolean;
  isInitialized: boolean;
  error: TranslationError | null;
  debug: {
    getCurrentLanguage: () => string;
    getSupportedLanguages: () => string[];
    getLoadedNamespaces: () => string[];
    getAllTranslations: () => Record<string, Record<string, unknown>>;
    isReady: () => boolean;
    getInitializationError: () => TranslationError | null;
    clearCache: () => void;
    reloadTranslations: () => Promise<void>;
    getCacheStats: () => { size: number; hits: number; misses: number };
  };
}
```

### useLanguageChange

Hook for language switching functionality.

```tsx
function useLanguageChange(): {
  currentLanguage: string;
  changeLanguage: (language: string) => void;
  supportedLanguages: Array<{ code: string; name: string; nativeName: string }>;
}
```

### Translator

Server-side translation class.

```tsx
class Translator {
  static create(config: I18nConfig): Promise<Translator>;
  translate(key: string, language?: string): string;
  setLanguage(language: string): void;
  getCurrentLanguage(): string;
  initialize(): Promise<void>;
  isReady(): boolean;
  clearCache(): void;
  debug(): unknown;
}
```

### ssrTranslate

Server-side translation helper function.

```tsx
function ssrTranslate(options: {
  translations: Record<string, string>;
  key: string;
  language: string;
}): string
```

### serverTranslate

Alias for `ssrTranslate`.

## Bundle Size

- Gzipped: ~5KB
- Minified: ~15KB
- Zero dependencies (React only)

## Requirements

- React >= 16.8.0
- TypeScript (recommended)

## Development

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Type Check

```bash
pnpm type-check
```

### Test

```bash
pnpm test
```

## Troubleshooting

### Translations Not Loading

1. Check file paths match the expected structure
2. Verify JSON format is valid
3. Check network requests in browser DevTools
4. Enable debug mode to see loading logs

### Missing Keys

1. Ensure namespace is included in key: `t('namespace.key')`
2. Check translation files contain the key
3. Verify namespace is included in config: `namespaces: ['namespace']`

### API Loader Not Working

1. Verify API route is accessible
2. Check API route returns valid JSON
3. Ensure API route handles 404 errors gracefully
4. Check CORS settings if loading from different domain

## License

MIT License

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
