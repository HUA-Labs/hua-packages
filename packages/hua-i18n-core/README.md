# @hua-labs/i18n-core

Type-safe i18n library with SSR/CSR support and state management integration.
SSR/CSR 지원 및 상태 관리 통합 기능을 갖춘 타입 안전 i18n 라이브러리.

[![npm version](https://img.shields.io/npm/v/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/i18n-core.svg)](https://www.npmjs.com/package/@hua-labs/i18n-core)
[![license](https://img.shields.io/npm/l/@hua-labs/i18n-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **⚠️ Alpha Release**: This package is currently in alpha. APIs may change before the stable release.

---

[English](#english) | [한국어](#korean)

## English

### Overview
Lightweight, production-ready i18n library for React applications. Delivers zero-flicker language transitions through intelligent caching and provides seamless SSR/CSR support with built-in state management integration.

### Why i18n-core?

Built to address common challenges in React internationalization: language transition flickers and SSR hydration mismatches. Provides a focused solution for these specific problems.

**Key advantages:**
- **Zero flickering**: Automatically shows previous language translation during switch
- **SSR-first**: Built-in hydration handling, no mismatch issues
- **State management integration**: First-class Zustand support
- **Small bundle**: ~2.8KB gzipped, zero dependencies (React only)
- **Framework agnostic**: Works with Next.js, Remix, Vite, and more

### Installation

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
- SSR/SSG support with initial translations
- TypeScript support
- Zero external dependencies (except React)
- Built-in caching
- Error handling and fallback support
- Debug mode for development
- **Language change flickering prevention**: Automatically shows previous language translation during language switch
- **State management integration**: Works seamlessly with Zustand via `@hua-labs/i18n-core-zustand`
- **Raw value access**: Get arrays, objects, or any non-string values from translations via `getRawValue`
- **Automatic retry**: Network errors are automatically retried with exponential backoff (when using API loader)
- **Memory leak prevention**: LRU cache for Translator instances to prevent memory accumulation
- **Production-optimized**: Console logs are automatically suppressed in production mode

### Examples

- **[CodeSandbox Template](../../examples/codesandbox-template/)** - Quick start template
- **[Next.js Example](../../examples/next-app-router-example/)** - Complete Next.js App Router example

### Quick Start

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
      <h1>{t('common:welcome')}</h1>
      <p>{t('pages:home.title')}</p>
    </div>
  );
}
```

## Translation Loaders

The library supports three translation loading strategies:

| Loader | File Location | SSR Support | Best For |
|--------|--------------|-------------|----------|
| `api` | `lib/translations/` | ✅ Yes (with `initialTranslations`) | Production apps with SSR |
| `static` | `public/translations/` | ❌ No | Simple SPAs, prototypes |
| `custom` | Any | ✅ Yes (manual implementation) | CMS, database, external API |

> **💡 Recommendation**: Use `api` loader with `initialTranslations` for SSR apps to prevent language flickering.

### 1. API Loader (Recommended for SSR)

Loads translations through API routes. **Supports SSR** when combined with `initialTranslations`.

**File Location**: `lib/translations/{language}/{namespace}.json`

```tsx
createCoreI18n({
  translationLoader: 'api',
  translationApiPath: '/api/translations', // default
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages'],
  // SSR: Pre-load translations to prevent flickering
  initialTranslations: ssrTranslations,
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
    'lib',
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

Loads translations from static JSON files in the public directory. **Does not support SSR** (files in `public/` cannot be read server-side).

**File Location**: `public/translations/{language}/{namespace}.json`

> **⚠️ Warning**: Static loader may cause language flickering on page load because translations are fetched client-side after hydration.

```tsx
createCoreI18n({
  translationLoader: 'static',
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages']
})
```

The loader will try these paths:
- `/translations/{language}/{namespace}.json`
- `../public/translations/{language}/{namespace}.json`
- `./public/translations/{language}/${namespace}.json`
- `public/translations/{language}/${namespace}.json`

### 3. Custom Loader

Use your own translation loading function. **Supports SSR** if you implement `initialTranslations` manually.

```tsx
createCoreI18n({
  translationLoader: 'custom',
  loadTranslations: async (language, namespace) => {
    // Load from database, CMS, or any other source
    const response = await fetch(`https://api.example.com/translations/${language}/${namespace}`);
    return response.json();
  },
  defaultLanguage: 'ko',
  namespaces: ['common', 'pages'],
  // SSR: You can still use initialTranslations with custom loader
  initialTranslations: ssrTranslations,
})

## File Structure

Choose your file structure based on SSR requirements:

### Option 1: Lib Directory (API Loader) - Recommended for SSR

**Best for**: Production apps with SSR, Next.js App Router

Place translations in `lib/translations/` (server-only, not publicly accessible). This enables SSR with `initialTranslations`.

```
your-app/
├── lib/
│   └── translations/           ← Server reads directly for SSR
│       ├── ko/
│       │   ├── common.json
│       │   └── pages.json
│       └── en/
│           ├── common.json
│           └── pages.json
└── app/
    ├── api/
    │   └── translations/       ← API route for client-side loading
    │       └── [language]/
    │           └── [namespace]/
    │               └── route.ts
    └── layout.tsx              ← Load initialTranslations here
```

**SSR Setup (Next.js App Router)**:

```tsx
// app/layout.tsx
import { loadSSRTranslations } from '@/lib/ssr-translations';

export default async function RootLayout({ children }) {
  // Load translations server-side
  const initialTranslations = await loadSSRTranslations('ko');

  return (
    <html lang="ko">
      <body>
        <I18nProvider initialTranslations={initialTranslations}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### Option 2: Public Directory (Static Loader) - SPA Only

**Best for**: Simple SPAs, prototypes, no SSR needed

Place translations in `public/translations/`. Client fetches directly via HTTP.

> **⚠️ Warning**: Cannot read `public/` files server-side. Language may flicker on page load.

```
your-app/
├── public/
│   └── translations/           ← Client fetches via HTTP
│       ├── ko/
│       │   ├── common.json
│       │   └── pages.json
│       └── en/
│           ├── common.json
│           └── pages.json
└── app/
    └── layout.tsx
```

### Option 3: Custom Location (Custom Loader)

**Best for**: CMS integration, database storage, external APIs

Use `loadTranslations` function to load from any source. Combine with `initialTranslations` for SSR support.

```tsx
createCoreI18n({
  translationLoader: 'custom',
  loadTranslations: async (lang, ns) => {
    // Load from CMS, database, or external API
    return await cms.getTranslations(lang, ns);
  },
  // SSR: Pre-load translations server-side
  initialTranslations: await preloadTranslations(),
})
```

## Translation File Format

```json
// translations/en/common.json
{
  "welcome": "Welcome",
  "hello": "Hello",
  "goodbye": "Goodbye",
  "loading": "Loading...",
  "error": "An error occurred"
}
```

```json
// translations/en/pages.json
{
  "home": {
    "title": "Home",
    "description": "Home page"
  },
  "about": {
    "title": "About",
    "description": "About page"
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
      <h1>{t('common:welcome')}</h1>
      <p>{t('pages:home.title')}</p>
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
      <p>{tWithParams('common:greeting', { name: 'John' })}</p>
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

### Getting Raw Values (Arrays and Objects)

Use `getRawValue` to access arrays, objects, or any non-string values from translation files:

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { getRawValue } = useTranslation();
  
  // Get an array
  const features = getRawValue('common:features') as string[];
  
  // Get an object
  const metadata = getRawValue('common:metadata') as Record<string, string>;
  
  return (
    <div>
      <ul>
        {features?.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <div>
        <p>Version: {metadata?.version}</p>
        <p>Author: {metadata?.author}</p>
      </div>
    </div>
  );
}
```

Translation file:
```json
{
  "features": ["Fast", "Lightweight", "Type-safe"],
  "metadata": {
    "version": "1.0.0",
    "author": "HUA Labs"
  }
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
      <h1>{t('common:welcome')}</h1>
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
      const path = `./lib/translations/${lang}/${namespace}.json`;
      return (await import(path)).default;
    }
  });
  
  return {
    welcome: translator.translate('common:welcome'),
    title: translator.translate('pages:home.title')
  };
}

// Using helper functions
export function getStaticTranslations(language: string) {
  const translations = require(`./lib/translations/${language}/common.json`);
  
  return {
    welcome: ssrTranslate({
      translations,
      key: 'common:welcome',
      language
    })
  };
}
```

### SSR with Initial Translations (Recommended)

```tsx
// app/layout.tsx (Server Component)
import { loadSSRTranslations } from './lib/ssr-translations';
import { createCoreI18n } from '@hua-labs/i18n-core';

export default async function RootLayout({ children }) {
  // Load translation data from SSR
  const ssrTranslations = await loadSSRTranslations('ko');
  
  const I18nProvider = createCoreI18n({
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    namespaces: ['common', 'navigation', 'footer'],
    initialTranslations: ssrTranslations, // Pass SSR translation data
    translationLoader: 'api'
  });
  
  return (
    <html lang="ko">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

## Key Rules

### Namespace Keys

Always include namespace in the key:

```tsx
t('common:welcome')      // common.json -> welcome
t('pages:home.title')   // pages.json -> home.title
t('footer:brand_name')   // footer.json -> brand_name
```

### Common Namespace Shortcut

If the key doesn't include a namespace, it defaults to 'common':

```tsx
t('welcome')    // same as t('common:welcome')
t('hello')      // same as t('common:hello')
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
  },
  
  // SSR optimization: Pre-loaded translations (no network requests)
  // Prevents missing key exposure during initial load
  initialTranslations: {
    ko: {
      common: { /* ... */ },
      navigation: { /* ... */ }
    },
    en: {
      common: { /* ... */ },
      navigation: { /* ... */ }
    }
  },
  
  // Auto language sync (disabled by default when using Zustand adapter)
  autoLanguageSync: false
})
```

## State Management Integration

### Zustand Integration

For Zustand users, use the dedicated adapter package:

```bash
pnpm add @hua-labs/i18n-core-zustand zustand
```

```tsx
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from './store/useAppStore';

export const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation'],
  defaultLanguage: 'ko', // SSR initial language
  initialTranslations: ssrTranslations // Optional: SSR translations
});
```

See [@hua-labs/i18n-core-zustand README](../hua-i18n-core-zustand/README.md) for full documentation.

## Language Change Optimization

The library automatically prevents flickering during language changes by temporarily showing translations from the previous language while new translations are loading.

**How it works:**
1. When language changes, `translator.setLanguage()` is called
2. If a translation key is not found in the new language yet, the library checks other loaded languages
3. If found, it temporarily returns the previous language's translation
4. Once the new language's translation is loaded, it automatically updates

This ensures a smooth user experience without showing translation keys or empty strings.

## Debug Mode

Enable debug mode to see translation loading and missing keys:

```tsx
createCoreI18n({
  debug: true,
  // ... other options
})
```

**Note**: In production (`debug: false`), console logs are automatically suppressed to improve performance and prevent information leakage.

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

- **Automatic fallback**: Falls back to default language when translations are missing
- **Missing key handling**: Returns key in debug mode, empty string in production
- **Network error recovery**: Automatic retry with exponential backoff (when using API loader)
- **Cache invalidation**: Automatically clears cache on errors
- **Error classification**: Distinguishes between recoverable and non-recoverable errors
- **Memory leak prevention**: LRU cache for Translator instances (max 10 instances)

## API Reference

### Main Exports

- `createCoreI18n(options?)` - Creates i18n Provider component
- `useTranslation()` - Hook for translations and language state
- `useLanguageChange()` - Hook for language switching
- `Translator` - Core translation class (for SSR)
- `ssrTranslate()` / `serverTranslate()` - Server-side translation helpers

## Requirements

- React >= 19.0.0
- React DOM >= 19.0.0
- TypeScript (recommended)

## Bundle Size

- **~2.8 KB** gzipped
- Zero dependencies (React only as peer dependency)

## Troubleshooting

### Translations Not Loading

1. Check file paths match the expected structure
2. Verify JSON format is valid
3. Check network requests in browser DevTools
4. Enable debug mode to see loading logs

### Missing Keys

1. Ensure namespace is included in key: `t('namespace:key')`
2. Check translation files contain the key
3. Verify namespace is included in config: `namespaces: ['namespace']`

### API Loader Not Working

1. Verify API route is accessible
2. Check API route returns valid JSON
3. Ensure API route handles 404 errors gracefully
4. Check CORS settings if loading from different domain

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Core architecture and design patterns

## Code Quality

This package has been refactored for better maintainability:

- **Modular functions**: Translation logic split into focused helper methods
- **Type safety**: Improved type guards and error handling
- **Performance**: Optimized translation lookup with proper memoization
- **Code clarity**: Removed commented code and improved function organization

## Related Packages

- `@hua-labs/i18n-core-zustand`: Zustand state management integration adapter
- `@hua-labs/i18n-loaders` (Coming Soon): Production-ready loaders, caching, and preloading helpers
- `@hua-labs/i18n-advanced` (Coming Soon): Advanced features like pluralization, date formatting, etc.
- `@hua-labs/i18n-debug` (Coming Soon): Debug tools and development helpers

## License

MIT

## Korean

### 개요
React 애플리케이션을 위한 경량 프로덕션 레디 i18n 라이브러리입니다. 지능형 캐싱을 통해 깜빡임 없는 언어 전환을 제공하고, 내장된 상태 관리 통합과 함께 원활한 SSR/CSR 지원을 제공합니다.

### 왜 i18n-core인가?

React 국제화에서 흔히 발생하는 문제인 언어 전환 시 깜빡임과 SSR hydration 불일치를 해결하기 위해 구축되었습니다.

**주요 장점:**
- **깜빡임 없음**: 언어 전환 중 이전 언어 번역을 자동으로 표시
- **SSR 우선**: 내장 hydration 처리, 불일치 문제 없음
- **상태 관리 통합**: Zustand 일급 지원
- **작은 번들**: ~2.8KB gzipped, 의존성 없음 (React만)
- **프레임워크 독립적**: Next.js, Remix, Vite 등과 작동

### 설치

```bash
npm install @hua-labs/i18n-core
# 또는
yarn add @hua-labs/i18n-core
# 또는
pnpm add @hua-labs/i18n-core
```

### 주요 기능

- 경량 핵심 번역 기능
- 여러 번역 로더 전략 (API, 정적 파일, 커스텀)
- 네임스페이스 지연 로딩 지원
- 초기 번역을 통한 SSR/SSG 지원
- TypeScript 지원
- 외부 의존성 없음 (React 제외)
- 내장 캐싱
- 에러 처리 및 폴백 지원
- 개발용 디버그 모드
- **언어 변경 깜빡임 방지**: 언어 전환 중 이전 언어 번역을 자동으로 표시
- **상태 관리 통합**: `@hua-labs/i18n-core-zustand`를 통해 Zustand와 원활하게 작동
- **원시 값 접근**: `getRawValue`를 통해 번역에서 배열, 객체 또는 모든 비문자열 값 가져오기

### 빠른 시작

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

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('pages:home.title')}</p>
    </div>
  );
}
```

### 관련 패키지

- `@hua-labs/i18n-core-zustand`: Zustand 상태 관리 통합 어댑터
- `@hua-labs/i18n-loaders` (Coming Soon): 프로덕션 레디 로더, 캐싱 및 프리로딩 헬퍼
- `@hua-labs/i18n-advanced` (Coming Soon): 복수형, 날짜 포맷팅 등의 고급 기능
- `@hua-labs/i18n-debug` (Coming Soon): 디버그 도구 및 개발 헬퍼

자세한 내용은 [상세 가이드](./DETAILED_GUIDE.md)를 참고하세요.
