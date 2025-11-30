# @hua-labs/i18n-core 로더 가이드

## 📋 목차

1. [개요](#개요)
2. [기본 로더](#기본-로더)
3. [커스텀 로더 구현](#커스텀-로더-구현)
4. [로더 유틸리티](#로더-유틸리티)
5. [실제 사용 사례](#실제-사용-사례)

---

## 개요

`@hua-labs/i18n-core`는 번역 파일을 로드하는 방식을 유연하게 지원합니다. 코어는 기본 로더를 제공하지만, 프로덕션 환경에서는 커스텀 로더를 구현하는 것을 권장합니다.

### 로더 타입

- **기본 로더**: 코어에 내장된 간단한 로더 (api, static)
- **커스텀 로더**: 프로젝트별 요구사항에 맞춘 로더 구현

---

## 기본 로더

### API 로더 (기본값)

`translationLoader: 'api'`를 사용하면 Next.js API Route를 통해 번역을 로드합니다.

#### 동작 방식

```typescript
const I18nProvider = createCoreI18n({
  translationLoader: 'api',
  translationApiPath: '/api/translations' // 기본값
});
```

1. 클라이언트에서 `${translationApiPath}/${language}/${namespace}` 경로로 fetch
2. 성공 시 JSON 반환
3. 실패 시 기본 번역 반환

#### API Route 구현 필요

코어는 로더만 제공하므로, 실제 API Route는 프로젝트에서 구현해야 합니다.

**예제**: `app/api/translations/[language]/[namespace]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET(
  _request: Request,
  context: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await context.params;
  
  const filePath = path.join(
    process.cwd(),
    "translations",
    language,
    `${namespace}.json`
  );
  
  try {
    const fileContents = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Translation not found" },
      { status: 404 }
    );
  }
}
```

---

### Static 로더

`translationLoader: 'static'`을 사용하면 정적 파일 경로에서 번역을 로드합니다.

#### 동작 방식

```typescript
const I18nProvider = createCoreI18n({
  translationLoader: 'static'
});
```

1. 여러 경로에서 번역 파일 시도:
   - `/translations/${language}/${namespace}.json`
   - `../translations/${language}/${namespace}.json`
   - `./translations/${language}/${namespace}.json`
   - 등등...
2. 성공 시 JSON 반환
3. 실패 시 기본 번역 반환

#### 제한사항

- 클라이언트 사이드에서만 동작
- SSR 환경에서는 동작하지 않음
- 프로덕션 환경에서는 권장하지 않음

---

## 커스텀 로더 구현

### 기본 구조

커스텀 로더는 다음 시그니처를 가진 함수입니다:

```typescript
type TranslationLoader = (
  language: string,
  namespace: string
) => Promise<Record<string, string>>;
```

### 구현 예제

#### 1. 캐싱이 있는 로더

```typescript
// lib/i18n-loader.ts
const translationCache = new Map<string, Record<string, unknown>>();
const inFlightRequests = new Map<string, Promise<Record<string, unknown>>>();

export async function createCachedLoader(
  apiPath: string = '/api/translations'
): Promise<TranslationLoader> {
  return async (language: string, namespace: string) => {
    const cacheKey = `${language}:${namespace}`;
    
    // 캐시 확인
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)! as Record<string, string>;
    }
    
    // 진행 중인 요청 확인
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)! as Promise<Record<string, string>>;
    }
    
    // API 요청
    const request = fetch(`${apiPath}/${language}/${namespace}`, {
      cache: 'force-cache',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load: ${language}/${namespace}`);
        }
        const data = await response.json();
        translationCache.set(cacheKey, data);
        inFlightRequests.delete(cacheKey);
        return data as Record<string, string>;
      })
      .catch((error) => {
        inFlightRequests.delete(cacheKey);
        throw error;
      });
    
    inFlightRequests.set(cacheKey, request);
    return request;
  };
}
```

#### 2. 프리로딩이 있는 로더

```typescript
// lib/i18n-loader.ts
export async function createPreloadLoader(
  apiPath: string = '/api/translations',
  namespaces: string[] = []
): Promise<TranslationLoader> {
  // 모든 네임스페이스를 미리 로드
  const preloaded = new Map<string, Record<string, string>>();
  
  const preloadAll = async (language: string) => {
    const results = await Promise.allSettled(
      namespaces.map(async (namespace) => {
        try {
          const response = await fetch(`${apiPath}/${language}/${namespace}`);
          if (response.ok) {
            const data = await response.json();
            preloaded.set(`${language}:${namespace}`, data);
            return data;
          }
        } catch (error) {
          console.warn(`Failed to preload ${language}/${namespace}:`, error);
        }
        return {};
      })
    );
    
    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    console.log(`Preloaded ${successCount}/${namespaces.length} namespaces`);
  };
  
  return async (language: string, namespace: string) => {
    const key = `${language}:${namespace}`;
    
    // 프리로드된 데이터 확인
    if (preloaded.has(key)) {
      return preloaded.get(key)!;
    }
    
    // 동적 로드
    const response = await fetch(`${apiPath}/${language}/${namespace}`);
    if (response.ok) {
      const data = await response.json();
      preloaded.set(key, data);
      return data;
    }
    
    return {};
  };
}
```

#### 3. 에러 복구가 있는 로더

```typescript
// lib/i18n-loader.ts
export function createResilientLoader(
  apiPath: string = '/api/translations',
  maxRetries: number = 3
): TranslationLoader {
  return async (language: string, namespace: string) => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${apiPath}/${language}/${namespace}`, {
          cache: 'force-cache',
        });
        
        if (response.ok) {
          return await response.json();
        }
        
        throw new Error(`HTTP ${response.status}`);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          // 지수 백오프
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }
    
    // 모든 재시도 실패 시 기본 번역 반환
    console.warn(`Failed to load ${language}/${namespace} after ${maxRetries} attempts`);
    return getDefaultTranslations(language, namespace);
  };
}

function getDefaultTranslations(
  language: string,
  namespace: string
): Record<string, string> {
  // 기본 번역 데이터
  const defaults: Record<string, Record<string, Record<string, string>>> = {
    ko: {
      common: {
        welcome: '환영합니다',
        loading: '로딩 중...',
        // ...
      }
    },
    en: {
      common: {
        welcome: 'Welcome',
        loading: 'Loading...',
        // ...
      }
    }
  };
  
  return defaults[language]?.[namespace] || {};
}
```

---

## 로더 유틸리티

### PaysByPays 스타일 로더

실제 프로덕션 환경에서 사용 중인 로더 패턴입니다.

```typescript
// lib/i18n-loader.ts
import type { LanguageCode, Namespace } from './i18n-config';

const translationCache = new Map<string, Record<string, unknown>>();
const inFlightRequests = new Map<string, Promise<Record<string, unknown>>>();

function buildTranslationUrl(language: string, namespace: string): string {
  if (typeof window !== 'undefined') {
    return `/api/translations/${language}/${namespace}`;
  }
  
  // SSR 환경 처리
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}/api/translations/${language}/${namespace}`;
  }
  
  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith('http')
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return `${vercelUrl}/api/translations/${language}/${namespace}`;
  }
  
  return `http://localhost:3000/api/translations/${language}/${namespace}`;
}

export async function createPaysByPaysLoader(): Promise<TranslationLoader> {
  return async (language: LanguageCode, namespace: Namespace) => {
    const cacheKey = `${language}:${namespace}`;
    
    // 캐시 확인
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)! as Record<string, string>;
    }
    
    // 진행 중인 요청 확인
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)! as Promise<Record<string, string>>;
    }
    
    // API 요청
    const request = fetch(buildTranslationUrl(language, namespace), {
      cache: 'force-cache',
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to load translations for ${language}/${namespace}`
          );
        }
        const data = (await response.json()) as Record<string, unknown>;
        translationCache.set(cacheKey, data);
        inFlightRequests.delete(cacheKey);
        return data as Record<string, string>;
      })
      .catch((error) => {
        inFlightRequests.delete(cacheKey);
        if (process.env.NODE_ENV === 'development') {
          console.warn('[i18n] translation fetch failed', { language, namespace });
        }
        throw error;
      });
    
    inFlightRequests.set(cacheKey, request);
    return request;
  };
}
```

### 사용법

```typescript
// lib/i18n-config.ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createPaysByPaysLoader } from './i18n-loader';

export function createClientI18nProvider(defaultLanguage: LanguageCode = 'ko') {
  const loader = await createPaysByPaysLoader();
  
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: 'en',
    namespaces: [...I18N_NAMESPACES],
    translationLoader: 'custom',
    loadTranslations: loader,
    debug: process.env.NODE_ENV === 'development',
  });
}
```

---

### @hua-labs/i18n-loaders 패키지 (신규)

PaysByPays에서 사용한 API 로더, 캐싱, 프리로딩 패턴을 재사용하기 위해 전용 패키지를 추가했습니다.

- **경로**: `packages/hua-i18n-loaders/`
- **주요 기능**
  - `createApiTranslationLoader`: 환경 감지(URL 빌더) + TTL 캐시 + 중복 요청 방지
  - `preloadNamespaces`, `warmFallbackLanguages`: 네임스페이스/언어 프리로딩
  - `withDefaultTranslations`: 원격 로더 + 기본 JSON 병합
- **테스트 페이지**: `apps/i18n-test/app/test/loaders/page.tsx`

#### 설치

```bash
pnpm add @hua-labs/i18n-loaders
```

#### API 요약

```typescript
import {
  createApiTranslationLoader,
  preloadNamespaces,
  warmFallbackLanguages,
  withDefaultTranslations
} from '@hua-labs/i18n-loaders';
```

#### 사용 예제

```typescript
// apps/i18n-test/lib/loader-demo-config.ts
const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000,
  localFallbackBaseUrl: 'http://localhost:3000'
});

export function createLoaderDemoProvider(defaultLanguage: string = 'ko') {
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: 'en',
    namespaces: ['common', 'auth', 'errors'],
    translationLoader: 'custom',
    loadTranslations,
    performanceOptions: {
      preloadNamespaces: ['common'],
      warmFallbackLanguages: true
    }
  });
}
```

#### 프리로딩/워밍 유틸

```typescript
await preloadNamespaces(currentLanguage, ['common', 'auth', 'errors'], loadTranslations);
await warmFallbackLanguages(currentLanguage, ['ko', 'en'], ['common', 'auth', 'errors'], loadTranslations);
```

i18n-test 샌드박스에서 `pnpm --filter i18n-test dev` 실행 후 `http://localhost:3000/test/loaders`로 접속하면 실제 동작을 확인할 수 있습니다.

---

## 실제 사용 사례

### SUM API 프로젝트 (신규 적용)

**파일**: `apps/my-api/lib/i18n-config.ts`

새 로더 패키지를 사용하여 캐싱, 프리로딩, 기본 번역 병합 기능을 적용했습니다.

```typescript
import { createCoreI18n } from '@hua-labs/i18n-core';
import {
  createApiTranslationLoader,
  withDefaultTranslations,
  preloadNamespaces,
  warmFallbackLanguages
} from '@hua-labs/i18n-loaders';

// 기본 번역 데이터 (객체 형태)
const defaultTranslations: Record<string, Record<string, Record<string, string>>> = {
  ko: {
    pages: { /* ... */ },
    common: { /* ... */ }
  },
  en: {
    pages: { /* ... */ },
    common: { /* ... */ }
  }
};

export function createClientI18nProvider(defaultLanguage: string = 'ko') {
  // API 로더 생성 (캐싱, 중복 요청 방지 포함)
  const apiLoader = createApiTranslationLoader({
    translationApiPath: '/api/translations',
    cacheTtlMs: 5 * 60 * 1000, // 5분 캐시
    localFallbackBaseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  });

  // 기본 번역과 병합된 로더
  const loadTranslations = withDefaultTranslations(apiLoader, defaultTranslations);

  const provider = createCoreI18n({
    defaultLanguage,
    fallbackLanguage: 'en',
    namespaces: [
      'common', 'pages', 'auth', 'dashboard', 'errors',
      'footer', 'privacy', 'terms', 'email-policy', 'company', 'docs', 'admin', 'navigation'
    ],
    translationLoader: 'custom',
    loadTranslations,
    debug: process.env.NODE_ENV === 'development',
    performanceOptions: {
      preloadNamespaces: ['common', 'pages'], // 필수 네임스페이스 프리로딩
      warmFallbackLanguages: true // 폴백 언어 워밍
    }
  });

  // Provider 생성 시점에 프리로딩 (비동기, 블로킹하지 않음)
  if (typeof window !== 'undefined') {
    const namespaces = ['common', 'pages', 'auth', 'dashboard'];
    preloadNamespaces(defaultLanguage, namespaces, loadTranslations).catch(() => {
      // 에러는 무시 (fallback 사용)
    });
  }

  return provider;
}

// 프리로딩 헬퍼 함수
export async function preloadTranslations(
  language: string,
  namespaces: string[] = ['common', 'pages', 'auth', 'dashboard']
): Promise<void> {
  const apiLoader = createApiTranslationLoader({
    translationApiPath: '/api/translations',
    cacheTtlMs: 5 * 60 * 1000
  });
  const loadTranslations = withDefaultTranslations(apiLoader, defaultTranslations);
  await preloadNamespaces(language, namespaces, loadTranslations);
}

// 폴백 언어 워밍 헬퍼 함수
export async function warmFallbackTranslations(
  excludeLanguage?: string,
  namespaces: string[] = ['common', 'pages']
): Promise<void> {
  const apiLoader = createApiTranslationLoader({
    translationApiPath: '/api/translations',
    cacheTtlMs: 5 * 60 * 1000
  });
  const loadTranslations = withDefaultTranslations(apiLoader, defaultTranslations);
  const languages = ['ko', 'en', 'ja', 'fr', 'es', 'de'].filter(
    lang => lang !== excludeLanguage
  );
  await warmFallbackLanguages(excludeLanguage || 'ko', languages, namespaces, loadTranslations);
}
```

**주요 개선사항**:
- ✅ 캐싱 및 중복 요청 방지 자동 처리
- ✅ 기본 번역과 API 번역 자동 병합
- ✅ 프리로딩 및 폴백 언어 워밍 지원
- ✅ 코드 간소화 (기존 수동 캐싱 로직 제거)
- ✅ SSR에서 초기 번역을 주입해 hydration 전에 키 노출 제거

#### SSR 초기 번역 주입

```typescript
// app/layout.tsx
const translations = await loadSSRTranslations(['ko', 'en']);

return (
  <ClientLayout initialTranslations={translations}>
    {children}
  </ClientLayout>
);

// app/components/ClientLayout.tsx
const I18nProviderComponent = useMemo(() => {
  hydrateClientTranslations(initialTranslations);
  return createClientI18nProvider(language);
}, [language, initialTranslations]);
```

서버에서 주요 언어 번역을 로드한 뒤 `ClientLayout`에 전달하면, 클라이언트는 API 호출 없이 바로 번역을 사용하므로 번역 키가 깜빡이는 문제가 사라집니다.

---

### PaysByPays 프로젝트

**파일**: `src/lib/i18n-config.ts`

기존 수동 구현 방식 (참고용)

```typescript
import { createCoreI18n } from "@hua-labs/i18n-core";

const translationCache = new Map<string, Record<string, unknown>>();
const inFlightRequests = new Map<string, Promise<Record<string, unknown>>>();

async function fetchTranslation(
  language: LanguageCode,
  namespace: Namespace
): Promise<Record<string, unknown>> {
  const cacheKey = `${language}:${namespace}`;
  
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }
  
  const request = fetch(buildTranslationUrl(language, namespace), {
    cache: "force-cache",
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to load: ${language}/${namespace}`);
      }
      const data = await response.json();
      translationCache.set(cacheKey, data);
      inFlightRequests.delete(cacheKey);
      return data;
    })
    .catch((error) => {
      inFlightRequests.delete(cacheKey);
      throw error;
    });
  
  inFlightRequests.set(cacheKey, request);
  return request;
}

export function createClientI18nProvider(defaultLanguage: LanguageCode = "ko") {
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: "en",
    namespaces: [...I18N_NAMESPACES],
    translationLoader: 'custom',
    loadTranslations: fetchTranslation,
    debug: process.env.NODE_ENV === "development",
  });
}
```

---

## 베스트 프랙티스

### 1. 캐싱 사용

번역 파일은 자주 변경되지 않으므로 캐싱을 적극 활용하세요.

```typescript
const cache = new Map<string, Record<string, string>>();

const loader: TranslationLoader = async (language, namespace) => {
  const key = `${language}:${namespace}`;
  if (cache.has(key)) {
    return cache.get(key)!;
  }
  
  const data = await fetch(...);
  cache.set(key, data);
  return data;
};
```

### 2. 중복 요청 방지

동시에 같은 번역을 요청하는 경우를 방지하세요.

```typescript
const inFlight = new Map<string, Promise<Record<string, string>>>();

const loader: TranslationLoader = async (language, namespace) => {
  const key = `${language}:${namespace}`;
  
  if (inFlight.has(key)) {
    return inFlight.get(key)!;
  }
  
  const promise = fetch(...).then(data => {
    inFlight.delete(key);
    return data;
  });
  
  inFlight.set(key, promise);
  return promise;
};
```

### 3. 에러 처리

로더에서 에러가 발생해도 앱이 크래시하지 않도록 처리하세요.

```typescript
const loader: TranslationLoader = async (language, namespace) => {
  try {
    const response = await fetch(...);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`Failed to load ${language}/${namespace}:`, error);
  }
  
  // 기본 번역 반환
  return getDefaultTranslations(language, namespace);
};
```

### 4. SSR 지원

SSR 환경을 고려하여 URL 빌드 로직을 구현하세요.

```typescript
function buildUrl(language: string, namespace: string): string {
  if (typeof window !== 'undefined') {
    return `/api/translations/${language}/${namespace}`;
  }
  
  // SSR 환경
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${baseUrl}/api/translations/${language}/${namespace}`;
}
```

---

## 결론

- **코어**: 핵심 번역 기능만 제공
- **로더 패키지**: 프로덕션 환경에서 바로 사용할 수 있는 로더, 캐싱, 프리로딩 유틸리티 제공
- **커스텀 로더**: 프로젝트별 특수 요구사항이 있을 때 직접 구현

`@hua-labs/i18n-loaders` 패키지를 사용하면 PaysByPays, SUM API에서 검증된 로딩 전략을 그대로 재사용할 수 있습니다. 특수한 요구사항이 있는 경우에만 커스텀 로더를 구현하면 됩니다.

---

**작성일**: 2025년 11월
**버전**: 1.0.0

