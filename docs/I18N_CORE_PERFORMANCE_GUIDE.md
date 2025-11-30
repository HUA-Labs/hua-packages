# @hua-labs/i18n-core 성능 최적화 가이드

## 📋 목차

1. [개요](#개요)
2. [캐싱 전략](#캐싱-전략)
3. [프리로딩 전략](#프리로딩-전략)
4. [메모리 관리](#메모리-관리)
5. [베스트 프랙티스](#베스트-프랙티스)

---

## 개요

`@hua-labs/i18n-core`는 성능 최적화를 위한 여러 기능을 제공합니다:

- **전역 캐싱**: I18nResourceManager를 통한 메모리 캐싱
- **중복 요청 방지**: 동시에 같은 번역을 요청해도 하나의 요청만 수행
- **프리로딩**: 필요한 번역을 미리 로드
- **지연 로딩**: 필요할 때만 번역 로드

## 설정 옵션 요약

### cacheOptions

```typescript
createCoreI18n({
  cacheOptions: {
    ttl: 5 * 60 * 1000,
    maxSize: 200,
    scope: 'global', // 'local' 사용 시 인스턴스 별 캐시
    strategy: 'lru'
  }
});
```

### performanceOptions

```typescript
createCoreI18n({
  performanceOptions: {
    preloadAll: true,
    preloadNamespaces: ['common', 'layout'],
    warmFallbackLanguages: true
  }
});
```

---

## 캐싱 전략

### I18nResourceManager

코어는 자동으로 번역 데이터를 캐싱합니다. `I18nResourceManager`를 통해 캐시를 관리할 수 있습니다.

#### 기본 사용

```typescript
import { i18nResourceManager } from "@hua-labs/i18n-core/core/i18n-resource";

// 캐시된 번역 가져오기 (자동 캐싱)
const translations = await i18nResourceManager.getCachedTranslations(
  "ko",
  "common",
  async (lang, ns) => {
    const response = await fetch(`/api/translations/${lang}/${ns}`);
    return response.json();
  }
);
```

#### 캐시 통계 확인

```typescript
const stats = i18nResourceManager.getCacheStats();
console.log({
  hits: stats.hits,        // 캐시 히트 수
  misses: stats.misses,     // 캐시 미스 수
  hitRate: stats.hitRate,   // 히트율 (0-1)
  size: stats.size          // 캐시 크기
});

// 히트율이 낮으면 프리로딩 고려
if (stats.hitRate < 0.8) {
  await preloadMultipleNamespaces("ko", ["common", "dashboard"], loader);
}
```

#### 캐시 무효화

```typescript
// 특정 언어/네임스페이스 무효화
i18nResourceManager.invalidateCache("ko", "common");

// 특정 언어의 모든 네임스페이스 무효화
i18nResourceManager.invalidateCache("ko");

// 전체 캐시 무효화
i18nResourceManager.invalidateCache();
```

#### 캐시 크기 제한

```typescript
// 캐시 크기를 100개로 제한 (LRU 방식)
i18nResourceManager.setCacheLimit(100);
```

---

## 프리로딩 전략

### LazyLoader

`LazyLoader`를 사용하여 필요한 번역을 미리 로드할 수 있습니다.

#### 단일 네임스페이스 프리로딩

```typescript
import { preloadNamespace } from "@hua-labs/i18n-core/core/lazy-loader";

// 앱 시작 시 공통 번역 프리로딩
useEffect(() => {
  preloadNamespace("ko", "common", loader);
}, []);
```

#### 여러 네임스페이스 동시 프리로딩

```typescript
import { preloadMultipleNamespaces } from "@hua-labs/i18n-core/core/lazy-loader";

// 초기 로딩 시 필요한 모든 네임스페이스 프리로딩
useEffect(() => {
  preloadMultipleNamespaces(
    currentLanguage,
    ["common", "layout", "dashboard"],
    loader
  );
}, [currentLanguage]);
```

#### 자동 프리로딩

현재 사용 중인 네임스페이스와 관련된 네임스페이스를 자동으로 프리로딩합니다.

```typescript
import { autoPreload } from "@hua-labs/i18n-core/core/lazy-loader";

// dashboard 네임스페이스 사용 시 관련 네임스페이스 자동 프리로딩
useEffect(() => {
  autoPreload("ko", "dashboard", loader);
}, []);
```

#### 우선순위 기반 프리로딩

```typescript
import { lazyLoader } from "@hua-labs/i18n-core/core/lazy-loader";

// 우선순위 설정
lazyLoader.setLoadPriority(["common", "layout", "dashboard"]);

// 우선순위대로 프리로딩
await preloadMultipleNamespaces("ko", ["common", "layout", "dashboard"], loader);
```

---

## 메모리 관리

### 캐시 크기 모니터링

```typescript
const stats = i18nResourceManager.getCacheStats();

if (stats.size > 100) {
  // 캐시 크기가 너무 크면 제한 설정
  i18nResourceManager.setCacheLimit(50);
}
```

### 메모리 최적화

```typescript
import { lazyLoader } from "@hua-labs/i18n-core/core/lazy-loader";

// 주기적으로 메모리 최적화
setInterval(() => {
  lazyLoader.optimizeMemory();
  i18nResourceManager.optimizeMemory();
}, 60 * 60 * 1000); // 1시간마다
```

### 사용 패턴 분석

```typescript
const usage = lazyLoader.analyzeUsagePatterns();
console.log(usage);
// { common: 150, dashboard: 80, transactions: 45 }

// 자주 사용되는 네임스페이스를 우선 프리로딩
const topNamespaces = Object.entries(usage)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([ns]) => ns);

await preloadMultipleNamespaces("ko", topNamespaces, loader);
```

---

## 베스트 프랙티스

### 1. 초기 로딩 시 프리로딩

```typescript
// app/layout.tsx 또는 최상위 컴포넌트
useEffect(() => {
  const preload = async () => {
    // 필수 네임스페이스 먼저 로드
    await preloadMultipleNamespaces(
      currentLanguage,
      ["common", "layout"], // 필수
      loader
    );
    
    // 나머지는 백그라운드에서 로드
    preloadMultipleNamespaces(
      currentLanguage,
      ["dashboard", "transactions", "settings"], // 선택적
      loader
    ).catch(() => {}); // 에러 무시
  };
  
  preload();
}, [currentLanguage]);
```

### 2. 언어 변경 시 프리로딩

```typescript
const handleLanguageChange = async (newLanguage: string) => {
  // 언어 변경 전에 새 언어의 번역 프리로딩
  await preloadMultipleNamespaces(
    newLanguage,
    ["common", "layout"],
    loader
  );
  
  // 언어 변경
  setLanguage(newLanguage);
};
```

### 3. 페이지별 프리로딩

```typescript
// dashboard 페이지
useEffect(() => {
  // dashboard 관련 네임스페이스만 프리로딩
  preloadMultipleNamespaces(
    currentLanguage,
    ["dashboard", "common", "layout"],
    loader
  );
}, []);
```

### 4. 캐시 히트율 모니터링

```typescript
// 개발 환경에서만
if (process.env.NODE_ENV === "development") {
  setInterval(() => {
    const stats = i18nResourceManager.getCacheStats();
    if (stats.hitRate < 0.7) {
      console.warn("Low cache hit rate:", stats.hitRate);
      // 프리로딩 전략 재검토 필요
    }
  }, 60000); // 1분마다
}
```

### 5. 에러 복구

```typescript
const loader = async (language: string, namespace: string) => {
  try {
    const response = await fetch(`/api/translations/${language}/${namespace}`);
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

---

## 성능 벤치마크

### 캐싱 효과

- **캐시 없음**: 평균 50-100ms
- **캐시 있음**: 평균 0-1ms (메모리에서 직접 읽기)

### 프리로딩 효과

- **프리로딩 없음**: 첫 사용 시 50-100ms 지연
- **프리로딩 있음**: 즉시 사용 가능 (0ms)

### 메모리 사용량

- **네임스페이스당**: 약 5-20KB (JSON 크기에 따라)
- **10개 네임스페이스, 3개 언어**: 약 150-600KB

---

## 트러블슈팅

### 캐시 히트율이 낮은 경우

1. 프리로딩 전략 재검토
2. 자주 사용하는 네임스페이스 우선 프리로딩
3. 캐시 크기 제한 확인

### 메모리 사용량이 높은 경우

1. 캐시 크기 제한 설정
2. 주기적으로 메모리 최적화
3. 사용하지 않는 언어의 캐시 무효화

### 프리로딩이 느린 경우

1. 우선순위 기반 프리로딩 사용
2. 필수 네임스페이스만 먼저 로드
3. 나머지는 백그라운드에서 로드

---

**작성일**: 2025년 11월
**버전**: 1.0.0

