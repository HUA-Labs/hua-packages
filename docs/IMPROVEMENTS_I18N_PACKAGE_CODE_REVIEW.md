# i18n 패키지 코드 리뷰 및 개선점 (2025-12-02)

## 🔍 코드 리뷰 결과

### 현재 구현 상태

#### ✅ 잘 구현된 부분

1. **캐싱 전략 (기본)**
   - `Map<string, CacheEntry>` 기반 메모리 캐시
   - TTL 지원 (`CacheEntry`에 `ttl` 필드)
   - 전역 캐시 (`I18nResourceManager.globalCache`)
   - 중복 요청 방지 (`loadingPromises` Map)
   - 캐시 통계 (`cacheStats`)

2. **SSR/CSR 대응**
   - `initialTranslations` 지원
   - 하이드레이션 문제 해결 (`hydratedRef` 사용)
   - 언어 변경 시 깜빡임 방지 (이전 언어 번역 임시 표시)

3. **타입 안전성 (기본)**
   - `TranslationKey<T>` 타입 정의 존재
   - 하지만 실제로 사용되지 않음

#### ❌ 개선이 필요한 부분

### 1. 캐싱 전략 고도화

**현재 상태:**
- 메모리 캐시만 존재 (`Map<string, CacheEntry>`)
- TTL은 있지만 만료된 항목 자동 정리 없음
- IndexedDB 같은 L2 캐시 없음
- 사용자 우선언어 기반 프리로딩 없음

**개선 방안:**

```typescript
// packages/hua-i18n-core/src/core/persistent-cache.ts (신규)
export class PersistentCache {
  private dbName = 'i18n-cache';
  private storeName = 'translations';
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  async get(key: string): Promise<TranslationNamespace | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onsuccess = () => {
        const entry = request.result;
        if (entry && entry.expiresAt > Date.now()) {
          resolve(entry.data);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async set(key: string, data: TranslationNamespace, ttl: number = 86400000): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put({
        key,
        data,
        expiresAt: Date.now() + ttl
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}
```

**사용자 우선언어 기반 프리로딩:**

```typescript
// packages/hua-i18n-core/src/core/preloader.ts (신규)
export class TranslationPreloader {
  async preloadUserPreferredLanguage(
    userLanguage: string,
    namespaces: string[],
    loader: (lang: string, ns: string) => Promise<TranslationNamespace>
  ): Promise<void> {
    // 브라우저 언어 설정 확인
    const browserLang = navigator.language.split('-')[0];
    const preferredLang = userLanguage || browserLang;
    
    // 백그라운드에서 프리로드
    namespaces.forEach(namespace => {
      loader(preferredLang, namespace).catch(() => {
        // 실패해도 무시 (백그라운드 작업)
      });
    });
  }
}
```

### 2. 번역 키 정적 분석 및 타입 추론

**현재 상태:**
- `TranslationKey<T>` 타입은 정의되어 있지만 사용되지 않음
- `t()` 함수가 `string`만 받음
- 키 자동완성 없음

**개선 방안:**

```typescript
// packages/hua-i18n-core/src/types/index.ts
// 번역 파일에서 타입 생성

// 1. 번역 파일 타입 정의
export interface TranslationData {
  common: {
    welcome: string;
    loading: string;
    // ...
  };
  pages: {
    home: {
      title: string;
      description: string;
    };
    // ...
  };
}

// 2. 타입 안전한 t 함수
export type TranslationKey<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]: T[K] extends string
        ? K
        : T[K] extends Record<string, unknown>
          ? `${K & string}.${TranslationKey<T[K]> & string}`
          : never;
    }[keyof T]
  : never;

// 3. 타입 안전한 useTranslation
export function useTypedTranslation<T extends TranslationData>() {
  const { t: baseT } = useTranslation();
  
  const t = (key: `${string}:${TranslationKey<T>}`, language?: string): string => {
    return baseT(key, language);
  };
  
  return { t };
}
```

**빌드 타임 타입 생성 (추가 패키지):**

```typescript
// packages/hua-i18n-typegen/ (신규 패키지)
// 번역 JSON 파일을 스캔하여 TypeScript 타입 생성

// scripts/generate-i18n-types.ts
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

function generateTypes(translationsDir: string, outputFile: string) {
  const files = glob.sync(`${translationsDir}/**/*.json`);
  const types: Record<string, any> = {};
  
  files.forEach(file => {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    // 타입 구조 생성
  });
  
  const typeDefinition = `export interface TranslationData { ... }`;
  writeFileSync(outputFile, typeDefinition);
}
```

### 3. 국제화 복잡도 대응

**현재 상태:**
- 기본 번역만 지원
- 복수형, 날짜/시간 형식화, RTL 지원 없음

**개선 방안 (상위 패키지로 분리):**

```typescript
// packages/hua-i18n-advanced/ (신규 패키지)
import { useTranslation } from '@hua-labs/i18n-core';

// 복수형 지원
export function usePluralization() {
  const { t } = useTranslation();
  
  const plural = (key: string, count: number, params?: Record<string, any>) => {
    const pluralKey = count === 1 ? `${key}.one` : `${key}.other`;
    return t(pluralKey, params);
  };
  
  return { plural };
}

// 날짜/시간 형식화
export function useIntlFormatting() {
  const { currentLanguage } = useTranslation();
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat(currentLanguage, options).format(date);
  };
  
  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(currentLanguage, options).format(num);
  };
  
  return { formatDate, formatNumber };
}

// RTL 지원
export function useRTL() {
  const { currentLanguage } = useTranslation();
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  const isRTL = rtlLanguages.includes(currentLanguage);
  
  return { isRTL, dir: isRTL ? 'rtl' : 'ltr' };
}
```

### 4. README 개선 - 차별점 명확화

**현재 문제:**
- 다른 i18n 라이브러리와의 차별점이 불명확

**개선 방안:**

```markdown
## Why @hua-labs/i18n-core?

### vs i18next
- ✅ **Zero flickering**: Automatically shows previous language translation during switch
- ✅ **SSR-first**: Built-in hydration handling, no mismatch issues
- ✅ **State management integration**: First-class Zustand support
- ✅ **Smaller bundle**: No unnecessary features, tree-shakeable

### vs next-intl
- ✅ **Framework agnostic**: Works with any React framework
- ✅ **Flexible state management**: Not tied to Next.js App Router
- ✅ **Adapter pattern**: Easy to integrate with any state management

### vs react-i18next
- ✅ **Better SSR support**: No hydration mismatches
- ✅ **Modern architecture**: Built for React 18+ and modern bundlers
- ✅ **Type-safe adapters**: Zustand adapter with full type safety
```

### 5. 예제 프로젝트 및 문서화

**필요한 것들:**

1. **예제 리포지토리:**
   - `hua-i18n-examples/next-app-router-example`
   - `hua-i18n-examples/zustand-integration-example`
   - `hua-i18n-examples/ssr-demo`

2. **Live Playground:**
   - CodeSandbox/StackBlitz 템플릿
   - 실제 동작하는 데모

3. **아키텍처 다이어그램:**
   - 패키지 구조 시각화
   - 데이터 흐름도
   - 캐싱 전략 다이어그램

## 📋 우선순위별 개선 계획

### Phase 1: 즉시 개선 (High Priority)
1. ✅ README에 차별점 명확히 추가
2. ✅ 1문장 컨셉 정리
3. ✅ 비교 문서 작성

### Phase 2: 단기 개선 (Medium Priority)
1. L2 캐시 (IndexedDB) 구현
2. 사용자 우선언어 프리로딩
3. 예제 프로젝트 생성

### Phase 3: 중기 개선 (Low Priority)
1. 번역 키 타입 추론 (빌드 타임 생성)
2. 복수형, 날짜/시간 형식화 (상위 패키지)
3. RTL 지원 (상위 패키지)

## 🎯 다음 액션 아이템

- [ ] README 개선 (차별점, 비교표 추가)
- [ ] 비교 문서 작성 (`docs/COMPARISON.md`)
- [ ] 1문장 컨셉 정리 및 README 상단에 추가
- [ ] 예제 프로젝트 리포지토리 생성
- [ ] 아키텍처 다이어그램 생성
- [ ] L2 캐시 구현 (IndexedDB)
- [ ] 타입 추론 개선 (빌드 타임 생성 도구)
