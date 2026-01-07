# @hua-labs/i18n-loaders Detailed Guide

Production-ready loading and caching strategies.
운영 환경을 위한 로딩 및 캐싱 전략 가이드.

---

## English

### API Translation Loader
The `createApiTranslationLoader` provides high-performance fetching with built-in optimizations.

#### Configuration
```ts
const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 300_000, // 5 minutes cache
  retryCount: 3,        // Retry on network errors
  retryDelay: 1000      // Exponential backoff start
});
```

### Optimization Techniques

#### 1. Preloading Namespaces
Fetch data before the user navigates.
```ts
preloadNamespaces('ko', ['dashboard', 'profile'], loader);
```

#### 2. Warming Fallback Languages
Pre-fetch fallback languages to prevent delays.
```ts
warmFallbackLanguages('ko', ['ko', 'en'], ['common'], loader);
```

#### 3. Default Translation Merging
Merge static defaults with dynamic API data.
```ts
const loader = withDefaultTranslations(apiLoader, {
  ko: { common: { welcome: '환영' } }
});
```

---

## Korean

### API 번역 로더(API Translation Loader)
`createApiTranslationLoader`는 고성능 데이터 가져오기와 최적화 기능을 제공합니다.

#### 주요 설정 옵션
```ts
const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
  cacheTtlMs: 300_000, // 5분 캐시 유지
  retryCount: 3,        // 네트워크 에러 시 3회 재시도
  retryDelay: 1000      // 지수 백오프 시작 시간
});
```

### 최적화 기술

#### 1. 네임스페이스 프리로딩
사용자가 이동하기 전에 데이터를 미리 로드합니다.
```ts
preloadNamespaces('ko', ['dashboard', 'profile'], loader);
```

#### 2. 폴백 언어 워밍 (Warming)
딜레이를 방지하기 위해 폴백 언어 데이터를 미리 준비합니다.

#### 3. 기본 번역 병합 (Merge)
정적 기본값과 API 데이터를 병합하여 유연성을 확보합니다.
