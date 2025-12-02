# @hua-labs/i18n-loaders

프로덕션 환경에서 바로 사용할 수 있는 번역 로더, 캐싱, 프리로딩 유틸리티 모음입니다. `@hua-labs/i18n-core`와 함께 사용하면 PaysByPays, SUM API에서 검증된 로딩 전략을 그대로 재사용할 수 있습니다.

## 주요 기능

- ✅ API 기반 번역 로더 (`createApiTranslationLoader`)
- ✅ TTL/전역 캐시/중복 요청 방지 내장
- ✅ 네임스페이스 프리로딩 & 폴백 언어 워밍
- ✅ 기본 번역(JSON) 병합 기능 (SUM API 스타일)
- ✅ 서버/클라이언트 어디서든 동작
- ✅ **프로덕션 검증**: PaysByPays, SUM API에서 실제 사용 중

## 설치

```bash
pnpm add @hua-labs/i18n-loaders
# 또는
npm install @hua-labs/i18n-loaders
```

## 빠른 사용 예시

### 기본 사용

```ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000, // 1분
  enableGlobalCache: true
});

export const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  translationLoader: 'custom',
  loadTranslations
});
```

### 프리로딩 사용

```ts
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations'
});

// 앱 시작 시 필요한 네임스페이스를 미리 로드
preloadNamespaces('ko', ['common', 'dashboard'], loadTranslations);
```

### 기본 번역 병합 사용

```ts
import { createApiTranslationLoader, withDefaultTranslations } from '@hua-labs/i18n-loaders';

const apiLoader = createApiTranslationLoader({
  translationApiPath: '/api/translations'
});

const defaultTranslations = {
  ko: {
    common: {
      welcome: '환영합니다',
      hello: '안녕하세요'
    }
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  }
};

// API 번역이 실패하면 기본 번역 사용, 성공하면 병합
const loadTranslations = withDefaultTranslations(apiLoader, defaultTranslations);
```

## API 레퍼런스

### createApiTranslationLoader

API 기반 번역 로더를 생성합니다. TTL 캐싱, 중복 요청 방지, 전역 캐시를 내장합니다.

```ts
function createApiTranslationLoader(
  options?: ApiLoaderOptions
): TranslationLoader
```

#### 옵션

```ts
interface ApiLoaderOptions {
  // API 경로 (기본값: '/api/translations')
  translationApiPath?: string;
  
  // 기본 URL (서버 사이드에서 사용)
  baseUrl?: string;
  
  // 로컬 폴백 URL (개발 환경)
  localFallbackBaseUrl?: string;
  
  // 캐시 TTL (밀리초, 기본값: 5분)
  cacheTtlMs?: number;
  
  // 캐시 비활성화
  disableCache?: boolean;
  
  // fetch 요청 옵션
  requestInit?: RequestInit | ((language: string, namespace: string) => RequestInit | undefined);
  
  // 커스텀 fetcher (테스트용)
  fetcher?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  
  // 로거 (기본값: console)
  logger?: Pick<typeof console, 'log' | 'warn' | 'error'>;
}
```

#### 예제

```ts
// 기본 사용
const loader = createApiTranslationLoader();

// 커스텀 옵션
const loader = createApiTranslationLoader({
  translationApiPath: '/api/v2/translations',
  cacheTtlMs: 10 * 60 * 1000, // 10분
  disableCache: false,
  requestInit: {
    headers: {
      'Authorization': 'Bearer token'
    }
  }
});

// 동적 요청 옵션
const loader = createApiTranslationLoader({
  requestInit: (language, namespace) => ({
    headers: {
      'X-Language': language,
      'X-Namespace': namespace
    }
  })
});
```

### preloadNamespaces

여러 네임스페이스를 병렬로 프리로드합니다.

```ts
function preloadNamespaces(
  language: string,
  namespaces: string[],
  loader: TranslationLoader,
  options?: PreloadOptions
): Promise<{
  fulfilled: string[];
  rejected: unknown[];
}>
```

#### 옵션

```ts
interface PreloadOptions {
  // 로거 (기본값: console)
  logger?: Pick<typeof console, 'log' | 'warn'>;
  
  // 에러 억제 (기본값: false)
  suppressErrors?: boolean;
}
```

#### 예제

```ts
import { preloadNamespaces } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader();

// 여러 네임스페이스 프리로드
const result = await preloadNamespaces(
  'ko',
  ['common', 'navigation', 'footer'],
  loader
);

console.log(`로드 성공: ${result.fulfilled.length}개`);
console.log(`로드 실패: ${result.rejected.length}개`);
```

### warmFallbackLanguages

폴백 언어들을 미리 워밍업합니다.

```ts
function warmFallbackLanguages(
  currentLanguage: string,
  languages: string[],
  namespaces: string[],
  loader: TranslationLoader,
  options?: PreloadOptions
): Promise<Array<{
  fulfilled: string[];
  rejected: unknown[];
}>>
```

#### 예제

```ts
import { warmFallbackLanguages } from '@hua-labs/i18n-loaders';

const loader = createApiTranslationLoader();

// 현재 언어가 'ko'일 때, 'en', 'ja'를 미리 로드
await warmFallbackLanguages(
  'ko',
  ['ko', 'en', 'ja'],
  ['common', 'navigation'],
  loader
);
```

### withDefaultTranslations

기본 번역과 API 번역을 병합합니다. API가 실패하면 기본 번역을 사용합니다.

```ts
function withDefaultTranslations(
  loader: TranslationLoader,
  defaults: DefaultTranslations
): TranslationLoader
```

#### 타입

```ts
type DefaultTranslations = Record<
  string, // language
  Record<string, TranslationRecord> // namespace -> translations
>;
```

#### 예제

```ts
import { withDefaultTranslations } from '@hua-labs/i18n-loaders';

const apiLoader = createApiTranslationLoader();

const defaults = {
  ko: {
    common: {
      welcome: '환영합니다',
      hello: '안녕하세요'
    }
  },
  en: {
    common: {
      welcome: 'Welcome',
      hello: 'Hello'
    }
  }
};

const loader = withDefaultTranslations(apiLoader, defaults);

// API가 성공하면 기본 번역과 병합
// API가 실패하면 기본 번역만 사용
const translations = await loader('ko', 'common');
```

## 사용 시나리오

### Next.js App Router

```tsx
// lib/i18n-config.ts
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader, preloadNamespaces } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 60_000
});

export const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation', 'footer'],
  translationLoader: 'custom',
  loadTranslations
});

// app/layout.tsx에서 사용
export default function RootLayout({ children }) {
  // 클라이언트에서 프리로드
  if (typeof window !== 'undefined') {
    preloadNamespaces('ko', ['common', 'navigation'], loadTranslations);
  }
  
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### SSR과 함께 사용

```tsx
// app/layout.tsx (Server Component)
import { loadSSRTranslations } from './lib/ssr-translations';
import { createCoreI18n } from '@hua-labs/i18n-core';
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

export default async function RootLayout({ children }) {
  // SSR에서 번역 로드
  const ssrTranslations = await loadSSRTranslations('ko');
  
  // 클라이언트용 로더
  const loadTranslations = createApiTranslationLoader({
    translationApiPath: '/api/translations'
  });
  
  const I18nProvider = createCoreI18n({
    defaultLanguage: 'ko',
    fallbackLanguage: 'en',
    namespaces: ['common', 'navigation', 'footer'],
    translationLoader: 'custom',
    loadTranslations,
    initialTranslations: ssrTranslations // SSR 번역 전달
  });
  
  return (
    <html lang="ko">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

## 캐싱 동작

- **TTL 캐시**: 각 번역은 `cacheTtlMs` 동안 캐시됩니다
- **중복 요청 방지**: 동일한 번역이 로딩 중이면 기존 Promise를 재사용합니다
- **전역 캐시**: 같은 로더 인스턴스는 모든 컴포넌트에서 캐시를 공유합니다

## 에러 처리

- API 요청 실패 시 에러를 throw합니다
- `withDefaultTranslations`를 사용하면 기본 번역으로 폴백합니다
- `preloadNamespaces`는 `Promise.allSettled`를 사용하여 일부 실패해도 계속 진행합니다

## 문서

- [API 레퍼런스](../../docs/I18N_CORE_API_REFERENCE.md)
- [로더 가이드](../../docs/I18N_CORE_LOADERS.md)
- [성능 최적화 가이드](../../docs/I18N_CORE_PERFORMANCE_GUIDE.md)
- [PaysByPays 적용 사례](../../docs/I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md)

## 라이선스

MIT License
