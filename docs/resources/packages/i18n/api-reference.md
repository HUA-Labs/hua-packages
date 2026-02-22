# @hua-labs/i18n-core API 레퍼런스

## 📋 목차

1. [개요](#개요)
2. [핵심 API](#핵심-api)
3. [훅 (Hooks)](#훅-hooks)
4. [타입 정의](#타입-정의)
5. [유틸리티 함수](#유틸리티-함수)
6. [컴포넌트](#컴포넌트)

---

## 개요

`@hua-labs/i18n-core`는 핵심 번역 기능만 제공하는 가벼운 i18n 라이브러리입니다. 번역 엔진, React 훅, Provider 컴포넌트 등 핵심 기능을 포함합니다.

### 패키지 구조

```
@hua-labs/i18n-core/
├── createCoreI18n()      # Provider 생성 함수
├── useTranslation()       # 번역 훅
├── useI18n()             # I18n Context 훅
├── useLanguageChange()    # 언어 변경 훅
├── Translator            # 번역 엔진 클래스
├── ssrTranslate()        # SSR 번역 함수
├── serverTranslate()     # 서버 번역 함수
└── MissingKeyOverlay     # 디버깅 컴포넌트
```

---

## 핵심 API

### createCoreI18n

Provider 컴포넌트를 생성하는 함수입니다.

#### 시그니처

```typescript
function createCoreI18n(options?: I18nCoreOptions): I18nProvider
```

#### 옵션

```typescript
interface I18nCoreOptions {
  /** 기본 언어 (기본값: 'ko') */
  defaultLanguage?: string;
  
  /** 폴백 언어 (기본값: 'en') */
  fallbackLanguage?: string;
  
  /** 네임스페이스 배열 (기본값: ['common']) */
  namespaces?: string[];
  
  /** 디버그 모드 (기본값: false) */
  debug?: boolean;
  
  /** 커스텀 번역 로더 함수 */
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
  
  /** 번역 로더 타입 */
  translationLoader?: 'api' | 'static' | 'custom';
  
  /** API 경로 (translationLoader가 'api'일 때 사용) */
  translationApiPath?: string;
}
```

#### 기본 동작

- `translationLoader`가 지정되지 않으면 `'api'`를 사용
- `translationApiPath`는 기본값 `'/api/translations'`
- `translationLoader: 'api'`일 때: `${translationApiPath}/${language}/${namespace}` 경로로 fetch
- `translationLoader: 'static'`일 때: 여러 경로에서 정적 파일 시도
- `translationLoader: 'custom'`일 때: `loadTranslations` 함수 사용

#### 반환값

React Provider 컴포넌트를 반환합니다.

```typescript
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard'],
  debug: true
});

// 사용
<I18nProvider>
  {children}
</I18nProvider>
```

#### 예제

```typescript
import { createCoreI18n } from '@hua-labs/i18n-core';

// 기본 사용
const I18nProvider = createCoreI18n();

// 옵션 지정
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'dashboard', 'transactions'],
  debug: process.env.NODE_ENV === 'development',
  translationLoader: 'api',
  translationApiPath: '/api/translations'
});

// 커스텀 로더 사용
const I18nProvider = createCoreI18n({
  defaultLanguage: 'ko',
  namespaces: ['common'],
  translationLoader: 'custom',
  loadTranslations: async (language, namespace) => {
    // 커스텀 로딩 로직
    const response = await fetch(`/custom-api/${language}/${namespace}`);
    return response.json();
  }
});
```

---

### Translator

번역 엔진 클래스입니다. 직접 인스턴스를 생성하여 사용할 수 있습니다.

#### 생성자

```typescript
constructor(config: I18nConfig)
```

#### 주요 메서드

##### initialize()

모든 번역 데이터를 미리 로드합니다.

```typescript
async initialize(): Promise<void>
```

**예제**:
```typescript
const translator = new Translator(config);
await translator.initialize();
```

##### translate()

번역 키를 번역된 텍스트로 변환합니다.

```typescript
translate(key: string, language?: string): string
```

**예제**:
```typescript
translator.translate('common:welcome');
translator.translate('dashboard:title', 'en');
```

##### translateWithParams()

파라미터가 있는 번역을 수행합니다.

```typescript
translateWithParams(
  key: string, 
  params?: Record<string, unknown>, 
  language?: string
): string
```

**예제**:
```typescript
translator.translateWithParams('common:time.minutesAgo', { minutes: 5 });
```

##### setLanguage()

언어를 변경합니다.

```typescript
setLanguage(language: string): void
```

##### getCurrentLanguage()

현재 언어를 가져옵니다.

```typescript
getCurrentLanguage(): string
```

##### isReady()

초기화 완료 여부를 확인합니다.

```typescript
isReady(): boolean
```

##### debug()

디버그 정보를 반환합니다.

```typescript
debug(): {
  isInitialized: boolean;
  currentLanguage: string;
  loadedNamespaces: string[];
  cacheStats: { hits: number; misses: number };
  cacheSize: number;
  allTranslations: Record<string, Record<string, unknown>>;
  initializationError: TranslationError | null;
  config: I18nConfig;
}
```

---

## 훅 (Hooks)

### useTranslation

가장 간단한 번역 훅입니다.

#### 시그니처

```typescript
function useTranslation(): TranslationHookResult
```

#### 반환값

```typescript
interface TranslationHookResult {
  /** 통합 번역 함수 - t(key), t(key, language), t(key, params), t(key, params, language) */
  t: (key: string, paramsOrLanguage?: TranslationParams | string, language?: string) => string;

  /** @deprecated t(key, params, language?)를 사용하세요. 내부적으로 t()를 호출합니다. */
  tWithParams: (key: string, params?: TranslationParams, language?: string) => string;
  
  /** 현재 언어 */
  currentLanguage: string;
  
  /** 언어 변경 함수 */
  setLanguage: (language: string) => Promise<void>;
  
  /** 로딩 상태 */
  isLoading: boolean;
  
  /** 에러 상태 */
  error: TranslationError | null;
  
  /** 지원 언어 목록 */
  supportedLanguages: LanguageConfig[];
  
  /** 초기화 상태 */
  isInitialized: boolean;
  
  /** 디버그 도구 */
  debug: DebugTools;
}
```

#### 예제

```typescript
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { t, currentLanguage, setLanguage } = useTranslation();

  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <p>{t('common:time.minutesAgo', { minutes: 5 })}</p>
      <p>{t('common:welcome', 'en')}</p> {/* 특정 언어로 번역 */}
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
}
```

> **통합 API**: `t()` 함수는 두 번째 인자의 타입으로 동작을 결정합니다:
> - `string` → 언어 코드로 인식
> - `object` → 파라미터로 인식

---

### useI18n

I18n Context에 직접 접근하는 훅입니다. `useTranslation`보다 더 많은 기능을 제공합니다.

#### 시그니처

```typescript
function useI18n(): I18nContextType
```

#### 반환값

`useTranslation`과 동일하지만, 추가로 다음을 제공합니다:

- `tAsync`: 비동기 번역 함수
- `tSync`: 동기 번역 함수
- 더 상세한 `debug` 도구

#### 예제

```typescript
import { useI18n } from '@hua-labs/i18n-core';

function AdvancedComponent() {
  const { t, tAsync, debug } = useI18n();
  
  // 디버그 정보 확인
  const debugInfo = debug.getAllTranslations();
  
  return (
    <div>
      <p>{t('common:welcome')}</p>
    </div>
  );
}
```

#### 배열 타입 번역 키 접근

번역 파일에 배열 타입의 데이터가 있을 때 (예: `month_names`, `day_names`), `t()` 함수는 문자열만 반환하므로 `debug.getAllTranslations()`를 사용해야 합니다.

**번역 파일 예시**:
```json
{
  "month_names": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  "day_names": ["월", "화", "수", "목", "금", "토", "일"]
}
```

**사용 예시**:
```typescript
import { useI18n } from '@hua-labs/i18n-core';

function CalendarComponent() {
  const { debug, currentLanguage } = useI18n();
  
  // 모든 번역 데이터 가져오기
  const allTranslations = debug.getAllTranslations();
  const commonTranslations = (allTranslations[currentLanguage]?.common || allTranslations['ko']?.common || {}) as Record<string, unknown>;
  
  // 배열 데이터 접근
  const monthNames = (Array.isArray(commonTranslations.month_names) 
    ? commonTranslations.month_names 
    : []) as string[];
  const dayNames = (Array.isArray(commonTranslations.day_names) 
    ? commonTranslations.day_names 
    : []) as string[];
  
  return (
    <div>
      {monthNames.map((month, index) => (
        <span key={index}>{month}</span>
      ))}
    </div>
  );
}
```

> **참고**: 배열 타입 번역 키 접근에 대한 자세한 가이드는 [배열 타입 번역 키 접근 가이드](./ARRAY_TRANSLATION_KEYS.md)를 참고하세요.

---

### useLanguageChange

언어 변경 전용 훅입니다.

#### 시그니처

```typescript
function useLanguageChange(): LanguageChangeResult
```

#### 반환값

```typescript
interface LanguageChangeResult {
  /** 현재 언어 */
  currentLanguage: string;
  
  /** 언어 변경 함수 (지원 언어만 허용) */
  changeLanguage: (language: string) => void;
  
  /** 지원 언어 목록 */
  supportedLanguages: LanguageConfig[];
}
```

#### 예제

```typescript
import { useLanguageChange } from '@hua-labs/i18n-core';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  
  return (
    <select value={currentLanguage} onChange={(e) => changeLanguage(e.target.value)}>
      {supportedLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

---

## 타입 정의

### I18nConfig

I18n 설정 타입입니다.

```typescript
interface I18nConfig {
  defaultLanguage: string;
  fallbackLanguage?: string;
  supportedLanguages: LanguageConfig[];
  namespaces?: string[];
  loadTranslations: (language: string, namespace: string) => Promise<TranslationNamespace>;
  debug?: boolean;
  missingKeyHandler?: (key: string, language?: string, namespace?: string) => string;
  errorHandler?: (error: Error, language: string, namespace: string) => void;
  autoLanguageSync?: boolean;
  cacheOptions?: {
    maxSize?: number;
    ttl?: number;
    scope?: 'local' | 'global';
    strategy?: 'lru' | 'fifo';
  };
  performanceOptions?: {
    preloadAll?: boolean;
    lazyLoad?: boolean;
    preloadNamespaces?: string[];
    warmFallbackLanguages?: boolean;
  };
}
```

#### cacheOptions

| 필드 | 설명 | 기본값 |
| --- | --- | --- |
| `ttl` | 캐시 TTL(ms) | 300000 (5분) |
| `maxSize` | 캐시 최대 크기 | 200 |
| `scope` | 캐시 범위 (`global` \| `local`) | `global` |
| `strategy` | 캐시 제거 전략 (`lru` \| `fifo`) | `lru` |

#### performanceOptions

| 필드 | 설명 |
| --- | --- |
| `preloadAll` | 모든 네임스페이스를 초기화 시 프리로딩 |
| `preloadNamespaces` | 지정한 네임스페이스만 프리로딩 |
| `warmFallbackLanguages` | 폴백 언어도 함께 프리로딩 |
| `lazyLoad` | 필요 시 로딩 (기본값: true) |

### LanguageConfig

언어 설정 타입입니다.

```typescript
interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  tone?: 'emotional' | 'encouraging' | 'calm' | 'gentle' | 'formal' | 'technical' | 'informal';
  formality?: 'informal' | 'casual' | 'formal' | 'polite';
}
```

### TranslationNamespace

번역 네임스페이스 타입입니다.

```typescript
interface TranslationNamespace {
  [key: string]: string | TranslationNamespace;
}
```

### TranslationError

번역 에러 타입입니다.

```typescript
interface TranslationError extends Error {
  code: 'MISSING_KEY' | 'LOAD_FAILED' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'INITIALIZATION_ERROR' | 'VALIDATION_ERROR' | 'CACHE_ERROR' | 'FALLBACK_LOAD_FAILED' | 'INITIALIZATION_FAILED' | 'RETRY_FAILED';
  language?: string;
  namespace?: string;
  key?: string;
  originalError?: Error;
  retryCount?: number;
  maxRetries?: number;
  timestamp: number;
  context?: Record<string, unknown>;
}
```

### TranslationParams

번역 파라미터 타입입니다.

```typescript
interface TranslationParams {
  [key: string]: string | number;
}
```

---

## 성능 최적화 기능

### I18nResourceManager

전역 번역 리소스 관리자입니다. 캐싱 및 중복 요청 방지를 제공합니다.

#### 주요 기능

- **전역 캐시**: 모든 번역 데이터를 메모리에 캐싱
- **중복 요청 방지**: 동시에 같은 번역을 요청하는 경우 하나의 요청만 수행
- **캐시 통계**: 히트율, 미스율 등 통계 제공
- **캐시 무효화**: 특정 언어/네임스페이스 또는 전체 캐시 무효화

#### 사용법

```typescript
import { i18nResourceManager } from '@hua-labs/i18n-core/core/i18n-resource';

// 캐시된 번역 가져오기
const translations = await i18nResourceManager.getCachedTranslations(
  'ko',
  'common',
  async (lang, ns) => {
    // 로더 함수
    const response = await fetch(`/api/translations/${lang}/${ns}`);
    return response.json();
  }
);

// 캐시 통계 확인
const stats = i18nResourceManager.getCacheStats();
console.log(`Hit rate: ${stats.hitRate}`);

// 캐시 무효화
i18nResourceManager.invalidateCache('ko', 'common');
```

### LazyLoader

지연 로딩 및 프리로딩 기능을 제공합니다.

#### 주요 기능

- **지연 로딩**: 필요할 때만 번역 로드
- **프리로딩**: 미리 번역 데이터 로드
- **자동 프리로딩**: 사용 패턴 기반 자동 프리로딩
- **로딩 통계**: 로딩 히스토리 및 사용 패턴 분석

#### 사용법

```typescript
import { lazyLoader, preloadNamespace, preloadMultipleNamespaces } from '@hua-labs/i18n-core/core/lazy-loader';

// 필요할 때 로딩
const translations = await lazyLoader.loadOnDemand(
  'ko',
  'dashboard',
  async (lang, ns) => {
    const response = await fetch(`/api/translations/${lang}/${ns}`);
    return response.json();
  }
);

// 단일 네임스페이스 프리로딩
await preloadNamespace('ko', 'common', loader);

// 여러 네임스페이스 동시 프리로딩
await preloadMultipleNamespaces('ko', ['common', 'dashboard', 'transactions'], loader);

// 로딩 통계
const stats = lazyLoader.getLoadStats();
console.log(`Preloaded: ${stats.preloadedCount} namespaces`);
```

#### 편의 함수

```typescript
import { 
  loadOnDemand, 
  preloadNamespace, 
  autoPreload 
} from '@hua-labs/i18n-core/core/lazy-loader';

// 간단한 사용
await loadOnDemand('ko', 'common', loader);
await preloadNamespace('ko', 'dashboard', loader);
await autoPreload('ko', 'dashboard', loader); // 관련 네임스페이스 자동 프리로딩
```

---

## 유틸리티 함수

### ssrTranslate

SSR 환경에서 번역을 수행하는 함수입니다.

#### 시그니처

```typescript
function ssrTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key
}: {
  translations: Record<string, Record<string, TranslationNamespace>>;
  key: string;
  language?: string;
  fallbackLanguage?: string;
  missingKeyHandler?: (key: string) => string;
}): string
```

#### 예제

```typescript
import { ssrTranslate } from '@hua-labs/i18n-core';
import translations from '@/translations/ko/common.json';

// 서버 컴포넌트에서 사용
export default function ServerComponent() {
  const welcome = ssrTranslate({
    translations: { ko: { common: translations } },
    key: 'common:welcome',
    language: 'ko'
  });
  
  return <h1>{welcome}</h1>;
}
```

---

### serverTranslate

서버 환경에서 번역을 수행하는 함수입니다. 캐싱 및 메트릭 지원이 포함됩니다.

#### 시그니처

```typescript
function serverTranslate({
  translations,
  key,
  language = 'ko',
  fallbackLanguage = 'en',
  missingKeyHandler = (key: string) => key,
  options = {}
}: {
  translations: Record<string, unknown>;
  key: string;
  language?: string;
  fallbackLanguage?: string;
  missingKeyHandler?: (key: string) => string;
  options?: {
    cache?: Map<string, string>;
    metrics?: { hits: number; misses: number };
    debug?: boolean;
  };
}): string
```

#### 예제

```typescript
import { serverTranslate } from '@hua-labs/i18n-core';

const cache = new Map<string, string>();
const metrics = { hits: 0, misses: 0 };

const result = serverTranslate({
  translations: allTranslations,
  key: 'common:welcome',
  language: 'ko',
  options: { cache, metrics, debug: true }
});
```

---

## 컴포넌트

### MissingKeyOverlay

개발 중 누락된 번역 키를 화면에 표시하는 컴포넌트입니다.

#### 사용법

```typescript
import { MissingKeyOverlay } from '@hua-labs/i18n-core/components/MissingKeyOverlay';

function DebugBar() {
  if (process.env.NODE_ENV !== 'development') return null;
  
  return <MissingKeyOverlay />;
}
```

#### 기능

- `debug: true`일 때 자동으로 누락된 키 추적
- `window.__I18N_DEBUG_MISSING_KEYS__`에 누락 키 저장
- 화면에 오버레이로 표시

---

## 번역 키 형식

### 네임스페이스:키 형식 (권장)

```typescript
t('common:welcome')
t('dashboard:sections.summary.title')
t('transactions:table.headers.id')
```

### 네임스페이스.키 형식 (하위 호환)

```typescript
t('common.welcome')
t('dashboard.sections.summary.title')
```

**우선순위**: `:` 구분자가 `.` 구분자보다 우선

### 중첩 키

```typescript
// 번역 파일
{
  "sections": {
    "summary": {
      "title": "통계 요약"
    }
  }
}

// 사용
t('dashboard:sections.summary.title')
```

---

## 파라미터 보간

### 기본 사용

```typescript
// 번역 파일
{
  "time": {
    "minutesAgo": "{{minutes}}분 전"
  }
}

// 사용 (통합 t() API)
t('common:time.minutesAgo', { minutes: 5 })
// 결과: "5분 전"

// 특정 언어로 파라미터 보간
t('common:time.minutesAgo', { minutes: 5 }, 'en')
// 결과: "5 minutes ago"
```

### 여러 파라미터

```typescript
// 번역 파일
{
  "alerts": {
    "healthDown": {
      "message": "{{count}}개 서비스가 응답하지 않습니다"
    }
  }
}

// 사용
t('common:alerts.healthDown.message', { count: 3 })
// 결과: "3개 서비스가 응답하지 않습니다"
```

> **참고**: `tWithParams(key, params, language?)`는 deprecated되었습니다. `t(key, params, language?)`를 사용하세요.

---

## 에러 처리

### missingKeyHandler

번역 키가 없을 때의 동작을 정의합니다.

```typescript
const I18nProvider = createCoreI18n({
  missingKeyHandler: (key: string, language?: string, namespace?: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: ${key} in ${language}/${namespace}`);
    }
    return `[MISSING: ${key}]`;
  }
});
```

### errorHandler

번역 로딩 실패 시의 동작을 정의합니다.

```typescript
const I18nProvider = createCoreI18n({
  errorHandler: (error: Error, language: string, namespace: string) => {
    console.error(`Translation error for ${language}:${namespace}:`, error);
    // 에러 리포팅 서비스에 전송
  }
});
```

---

## 자동 언어 동기화

`autoLanguageSync: true`일 때, 다른 SDK에서 언어 변경 이벤트를 발생시키면 자동으로 동기화됩니다.

```typescript
// 다른 SDK에서
window.dispatchEvent(new CustomEvent('huaI18nLanguageChange', { detail: 'en' }));

// i18n-core가 자동으로 언어 변경
```

---

## 성능 최적화 가이드

### 캐싱 활용

코어는 자동으로 번역 데이터를 캐싱합니다. `I18nResourceManager`를 통해 전역 캐시를 관리할 수 있습니다.

```typescript
// 캐시 통계 확인
const stats = i18nResourceManager.getCacheStats();
if (stats.hitRate < 0.8) {
  // 캐시 히트율이 낮으면 프리로딩 고려
  await preloadMultipleNamespaces('ko', ['common', 'dashboard'], loader);
}
```

### 프리로딩 전략

초기 로딩 시 필요한 네임스페이스를 미리 로드하면 사용자 경험이 개선됩니다.

```typescript
// 앱 시작 시 프리로딩
useEffect(() => {
  preloadMultipleNamespaces(
    currentLanguage,
    ['common', 'layout', 'dashboard'],
    loader
  );
}, [currentLanguage]);
```

### 중복 요청 방지

코어는 자동으로 중복 요청을 방지합니다. 같은 번역을 동시에 요청해도 하나의 요청만 수행됩니다.

## 주의사항

1. **로더 구현**: 코어는 기본 로더(api, static)를 제공하지만, 프로덕션 환경에서는 커스텀 로더를 구현하는 것을 권장합니다.
2. **SSR**: SSR 환경에서는 `ssrTranslate` 또는 `serverTranslate`를 사용하세요.
3. **타입 안전성**: 현재는 번역 키에 대한 타입 체크가 없습니다. (개선 예정)
4. **성능**: 대량의 번역 파일은 프리로딩 전략을 고려하세요. 코어의 `LazyLoader`를 활용하세요.
5. **캐시 관리**: 메모리 사용량이 걱정되면 `i18nResourceManager.setCacheLimit()`으로 캐시 크기를 제한하세요.

---

**작성일**: 2025년 11월
**버전**: 1.0.0
**상태**: 코어 구현 기준 문서화 완료 ✅

