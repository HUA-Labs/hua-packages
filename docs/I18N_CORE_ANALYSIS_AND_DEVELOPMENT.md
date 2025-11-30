# HUA Platform - i18n-core 패키지 분석 및 개발 계획

## 📋 목차

1. [개요](#개요)
2. [현재 사용 사례 분석](#현재-사용-사례-분석)
3. [패키지 구조 분석](#패키지-구조-분석)
4. [실제 구현 패턴](#실제-구현-패턴)
5. [개선 방향 및 개발 계획](#개선-방향-및-개발-계획)

---

## 개요

### 목적

이 문서는 HUA Platform 내 `@hua-labs/i18n-core` 패키지의 실제 사용 사례를 분석하고, 대시보드(paysbypays)와 숨 API(my-api) 서비스에서의 적용 사례를 바탕으로 패키지를 정교화하기 위한 분석 및 개발 계획을 제시합니다.

### 분석 대상

- **대시보드 (paysbypays)**: 결제 대행사 대시보드에서의 i18n-core 사용 사례
- **숨 API (my-api)**: API 서비스에서의 i18n-core 사용 사례
- **hua-i18n-core 패키지**: 현재 패키지 구조 및 기능

---

## 현재 사용 사례 분석

### 1. 대시보드 (paysbypays) 사용 사례

#### 1.1 설정 구조

**파일 위치**: `src/lib/i18n-config.ts`

```typescript
import { createCoreI18n } from "@hua-labs/i18n-core";

export const SUPPORTED_LANGUAGE_CODES = ["ko", "en", "ja"] as const;
export const I18N_NAMESPACES = [
  "common",
  "layout",
  "dashboard",
  "transactions",
  "settings",
  "settlements",
  "analytics",
  "merchants",
  "health",
] as const;

export function createClientI18nProvider(defaultLanguage: LanguageCode = "ko") {
  const provider = createCoreI18n({
    defaultLanguage,
    fallbackLanguage: "en",
    namespaces: [...I18N_NAMESPACES],
    translationLoader: "api", // API route 사용
    translationApiPath: "/api/translations",
    debug: process.env.NODE_ENV === "development",
  });

  return provider;
}
```

**주요 특징**:
- ✅ API route 기반 동적 로딩 (`translationLoader: "api"`)
- ✅ 9개의 네임스페이스로 세분화된 번역 관리
- ✅ 3개 언어 지원 (ko, en, ja)
- ✅ 개발 환경에서 디버그 모드 활성화
- ✅ 번역 프리로딩 및 워밍업 함수 제공

#### 1.2 API Route 구현

**파일 위치**: `src/app/api/translations/[language]/[namespace]/route.ts`

```typescript
export async function GET(
  _request: Request,
  context: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await context.params;

  // 언어 검증
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return NextResponse.json(
      { error: "Unsupported language" },
      { status: 400 }
    );
  }

  // 파일 경로 구성
  const translationsDir = path.join(process.cwd(), "translations");
  const filePath = path.join(
    translationsDir,
    language,
    `${normalizedNamespace}.json`
  );

  // 파일 읽기 및 반환
  const fileContents = await readFile(filePath, "utf-8");
  const data = JSON.parse(fileContents);
  
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

**주요 특징**:
- ✅ Next.js App Router의 동적 라우트 활용
- ✅ 캐싱 전략 적용 (1시간 캐시, 24시간 stale-while-revalidate)
- ✅ 안전한 파일 경로 처리 (정규화)
- ✅ 에러 핸들링 (404 반환)

#### 1.3 Provider 통합

**파일 위치**: `src/components/providers/AppProviders.tsx`

```typescript
function I18nBridge({ children }: { children: ReactNode }) {
  const language = usePreferencesStore((state) => state.language);
  const I18nProvider = useMemo(
    () => createClientI18nProvider(language),
    [language]
  );

  // 초기 마운트 및 언어 변경 시 모든 네임스페이스를 미리 로드
  useEffect(() => {
    preloadTranslations(language)
      .then(() => {
        if (process.env.NODE_ENV === "development") {
          console.log(`[i18n] Preloaded all namespaces for language: ${language}`);
        }
      })
      .catch((error) => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[i18n] Failed to preload translations", error);
        }
      });
  }, [language]);

  // Fallback 언어도 워밍업
  useEffect(() => {
    warmFallbackLanguage(language);
  }, [language]);

  return <I18nProvider>{children}</I18nProvider>;
}
```

**주요 특징**:
- ✅ Zustand store와 통합 (언어 상태 관리)
- ✅ 언어 변경 시 자동 프리로딩
- ✅ Fallback 언어 워밍업으로 빠른 전환 지원
- ✅ 메모이제이션을 통한 성능 최적화

#### 1.4 실제 사용 예시

**대시보드 페이지** (`src/app/page.tsx`):

```typescript
export default function Home() {
  const { t } = useTranslation();
  
  return (
    <DashboardLayout
      title={t("layout:pages.dashboard.title")}
      description={t("layout:pages.dashboard.description")}
      activeItem="dashboard"
    >
      {/* ... */}
    </DashboardLayout>
  );
}
```

**컴포넌트 사용** (`src/components/dashboard/RecentTransactionsFeed.tsx`):

```typescript
export function RecentTransactionsFeed({ limit = 10 }: RecentTransactionsFeedProps) {
  const { t, tWithParams } = useTranslation();
  
  // 파라미터가 있는 번역
  if (diffMins < 60) {
    return tWithParams("common:time.minutesAgo", { minutes: diffMins });
  }
  
  // 단순 번역
  return <p>{t("dashboard:sections.recent.empty")}</p>;
}
```

**주요 특징**:
- ✅ 네임스페이스:키 형식 사용 (`namespace:key`)
- ✅ 파라미터 보간 지원 (`tWithParams`)
- ✅ 타입 안전성 (TypeScript)

### 2. 숨 API (my-api) 사용 사례

#### 2.1 설정 구조

**파일 위치**: `apps/my-api/lib/i18n-config.ts`

```typescript
import { createCoreI18n } from '@hua-labs/i18n-core';

// SSR용 설정 (함수 없는 순수 객체)
export const ssrConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' }
  ],
  namespaces: [
    'common', 'pages', 'auth', 'dashboard', 'errors',
    'footer', 'privacy', 'terms', 'email-policy', 'company', 'docs', 'admin', 'navigation'
  ],
};

// 클라이언트용 Provider 생성 함수
export function createClientI18nProvider(defaultLanguage: string = 'ko') {
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: 'en',
    namespaces: [
      'common', 'pages', 'auth', 'dashboard', 'errors',
      'footer', 'privacy', 'terms', 'email-policy', 'company', 'docs', 'admin', 'navigation'
    ],
    debug: false,
    translationLoader: 'api',
    translationApiPath: '/api/translations'
  });
}
```

**주요 특징**:
- ✅ SSR과 CSR 분리된 설정
- ✅ 6개 언어 지원 (다국어 서비스)
- ✅ 13개 네임스페이스로 세분화
- ✅ 프로덕션 환경에서 디버그 모드 비활성화

#### 2.2 API Route 구현

**파일 위치**: `apps/my-api/app/api/translations/[language]/[namespace]/route.ts`

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ language: string; namespace: string }> }
) {
  const { language, namespace } = await params;

  // 지원하는 언어와 네임스페이스 검증
  const supportedLanguages = ['ko', 'en', 'ja', 'fr', 'es', 'de'];
  const supportedNamespaces = [
    'common', 'pages', 'auth', 'dashboard', 'errors',
    'footer', 'privacy', 'terms', 'email-policy', 'company', 'docs', 'admin', 'navigation'
  ];

  // 검증 로직
  if (!supportedLanguages.includes(language)) {
    return NextResponse.json(
      { error: 'Unsupported language' },
      { status: 400 }
    );
  }

  // 번역 파일 경로 (루트의 translations 폴더)
  const translationPath = join(process.cwd(), 'translations', language, `${namespace}.json`);

  try {
    const fileContent = await readFile(translationPath, 'utf-8');
    const translation = JSON.parse(fileContent);

    return NextResponse.json(translation, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Type': 'application/json',
      },
    });
  } catch (fileError) {
    // 파일이 없으면 app/translations에서 시도 (폴백)
    const appTranslationPath = join(process.cwd(), 'app', 'translations', language, `${namespace}.json`);
    try {
      const fileContent = await readFile(appTranslationPath, 'utf-8');
      const translation = JSON.parse(fileContent);
      return NextResponse.json(translation, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          'Content-Type': 'application/json',
        },
      });
    } catch (appFileError) {
      // 파일이 없으면 빈 객체 반환
      console.warn(`Translation file not found: ${language}/${namespace}`);
      return NextResponse.json({}, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
          'Content-Type': 'application/json',
        },
      });
    }
  }
}
```

**주요 특징**:
- ✅ 다중 경로 폴백 지원 (translations → app/translations)
- ✅ 빈 객체 반환으로 에러 방지
- ✅ 상세한 검증 로직
- ✅ 동일한 캐싱 전략

### 3. 사용 패턴 비교

| 항목 | 대시보드 (paysbypays) | 숨 API (my-api) |
|------|----------------------|------------------|
| **언어 수** | 3개 (ko, en, ja) | 6개 (ko, en, ja, fr, es, de) |
| **네임스페이스 수** | 9개 | 13개 |
| **디버그 모드** | 개발 환경에서 활성화 | 프로덕션에서 비활성화 |
| **SSR 지원** | ❌ | ✅ (ssrConfig 제공) |
| **폴백 경로** | 단일 경로 | 다중 경로 (translations → app/translations) |
| **프리로딩** | ✅ (명시적) | ❌ (자동) |
| **워밍업** | ✅ (fallback 언어) | ❌ |

---

## 패키지 구조 분석

### 1. 핵심 모듈 구조

```
hua-i18n-core/
├── src/
│   ├── index.ts                    # 메인 엔트리포인트
│   ├── core/
│   │   ├── translator.tsx          # 번역 엔진 (핵심)
│   │   ├── translator-factory.ts  # Translator 팩토리
│   │   ├── i18n-resource.ts       # 리소스 관리
│   │   ├── lazy-loader.ts         # 지연 로딩
│   │   └── debug-tools.ts         # 디버깅 도구
│   ├── hooks/
│   │   ├── useI18n.tsx            # I18n Context Provider
│   │   └── useTranslation.tsx     # 번역 훅
│   ├── components/
│   │   └── MissingKeyOverlay.tsx   # 누락 키 오버레이
│   └── types/
│       └── index.ts                # TypeScript 타입 정의
└── dist/                           # 빌드 출력
```

### 2. 핵심 기능 분석

#### 2.1 createCoreI18n 함수

**위치**: `src/index.ts`

```typescript
export function createCoreI18n(options?: {
  defaultLanguage?: string;
  fallbackLanguage?: string;
  namespaces?: string[];
  debug?: boolean;
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
  translationLoader?: 'api' | 'static' | 'custom';
  translationApiPath?: string;
}) {
  // API route 기반 로더 (기본값, 권장)
  const apiRouteLoader = async (language: string, namespace: string) => {
    if (typeof window !== 'undefined') {
      const apiUrl = `${translationApiPath}/${language}/${namespace}`;
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    }
    
    // SSR 또는 API 실패 시 기본 번역 반환
    return getDefaultTranslations(language, namespace);
  };

  // 정적 파일 로더 (하위 호환성)
  const staticFileLoader = async (language: string, namespace: string) => {
    // 정적 파일 경로에서 로드
  };

  // 기본 파일 로더 선택
  const defaultFileLoader = translationLoader === 'api' 
    ? apiRouteLoader 
    : translationLoader === 'static'
    ? staticFileLoader
    : loadTranslations || apiRouteLoader;

  const config: I18nConfig = {
    defaultLanguage,
    fallbackLanguage,
    supportedLanguages: defaultLanguages,
    namespaces,
    loadTranslations: translationLoader === 'custom' && loadTranslations 
      ? loadTranslations 
      : defaultFileLoader,
    debug,
    missingKeyHandler: (key: string, language?: string, namespace?: string) => {
      if (debug) {
        console.warn(`Missing translation key: ${key}`);
        return `[MISSING: ${key}]`;
      }
      return key.split('.').pop() || key;
    },
    errorHandler: (error: unknown, language: string, namespace: string) => {
      if (debug) {
        console.error(`Translation error for ${language}:${namespace}:`, error);
      }
    },
    autoLanguageSync: true
  };

  // Provider 컴포넌트 반환
  return function CoreI18nProvider({ children }: { children: React.ReactNode }) {
    return React.createElement(I18nProvider, { config, children });
  };
}
```

**주요 특징**:
- ✅ 3가지 로더 모드 지원 (api, static, custom)
- ✅ 기본 번역 데이터 내장
- ✅ 디버그 모드 지원
- ✅ 누락 키 핸들러 커스터마이징 가능
- ✅ 자동 언어 동기화 지원

#### 2.2 Translator 클래스

**위치**: `src/core/translator.tsx`

**핵심 메서드**:
- `initialize()`: 모든 번역 데이터 미리 로드
- `translate(key, language?)`: 번역 키를 번역된 텍스트로 변환
- `translateWithParams(key, params, language?)`: 파라미터 보간
- `setLanguage(language)`: 언어 변경
- `isReady()`: 초기화 완료 여부 확인

**주요 특징**:
- ✅ 비동기 초기화 지원
- ✅ 캐싱 메커니즘 (TTL 기반)
- ✅ 폴백 언어 자동 처리
- ✅ 중첩 키 지원 (`namespace.key.subkey`)
- ✅ 네임스페이스:키 형식 지원 (`namespace:key`)

#### 2.3 useI18n 훅

**위치**: `src/hooks/useI18n.tsx`

**제공하는 기능**:
- `t(key, language?)`: 기본 번역 함수
- `tWithParams(key, params, language?)`: 파라미터 보간
- `currentLanguage`: 현재 언어
- `setLanguage(language)`: 언어 변경
- `isLoading`: 로딩 상태
- `isInitialized`: 초기화 상태
- `error`: 에러 상태
- `debug`: 디버깅 도구

**주요 특징**:
- ✅ React Context 기반 상태 관리
- ✅ 초기화 전에도 기본 번역 제공
- ✅ 자동 언어 동기화 이벤트 처리
- ✅ 메모이제이션을 통한 성능 최적화

---

## 실제 구현 패턴

### 1. 번역 파일 구조

**대시보드 (paysbypays)**:
```
translations/
├── ko/
│   ├── common.json
│   ├── layout.json
│   ├── dashboard.json
│   ├── transactions.json
│   ├── settings.json
│   ├── settlements.json
│   ├── analytics.json
│   ├── merchants.json
│   └── health.json
├── en/
│   └── (동일한 구조)
└── ja/
    └── (동일한 구조)
```

**숨 API (my-api)**:
```
translations/
├── ko/
│   ├── common.json
│   ├── pages.json
│   ├── auth.json
│   ├── dashboard.json
│   ├── errors.json
│   ├── footer.json
│   ├── privacy.json
│   ├── terms.json
│   ├── email-policy.json
│   ├── company.json
│   ├── docs.json
│   ├── admin.json
│   └── navigation.json
└── (다른 언어들...)
```

### 2. 번역 키 네이밍 컨벤션

#### 2.1 네임스페이스:키 형식 (권장)

```typescript
// 사용 예시
t("common:welcome")
t("dashboard:stats.totalVolume")
t("transactions:table.columns.amount")
```

#### 2.2 네임스페이스.키 형식 (하위 호환)

```typescript
// 사용 예시
t("common.welcome")
t("dashboard.stats.totalVolume")
```

**우선순위**: `:` 구분자가 `.` 구분자보다 우선

### 3. 파라미터 보간

```typescript
// 번역 파일
{
  "time": {
    "minutesAgo": "{{minutes}}분 전",
    "hoursAgo": "{{hours}}시간 전"
  }
}

// 사용
tWithParams("common:time.minutesAgo", { minutes: 5 })
// 결과: "5분 전"
```

### 4. 중첩 키 지원

```typescript
// 번역 파일
{
  "dashboard": {
    "stats": {
      "totalVolume": "총 거래액",
      "totalCount": "총 거래 건수"
    }
  }
}

// 사용
t("dashboard:stats.totalVolume")
t("dashboard.stats.totalCount")
```

---

## 개선 방향 및 개발 계획

### 1. 현재 문제점 분석

#### 1.1 문서화 부족
- ❌ README.md가 기본적인 사용법만 제공
- ❌ 실제 사용 사례 부족
- ❌ API 레퍼런스 불완전

#### 1.2 타입 안전성 개선 필요
- ⚠️ 번역 키에 대한 타입 체크 미흡
- ⚠️ 네임스페이스 타입 추론 부족

#### 1.3 성능 최적화 여지
- ⚠️ 프리로딩 전략 개선 가능
- ⚠️ 캐싱 전략 고도화 필요

#### 1.4 개발자 경험 개선
- ⚠️ 에러 메시지 개선 필요
- ⚠️ 디버깅 도구 강화 필요

### 2. 개선 계획

#### 2.1 문서화 강화

**목표**: 실제 사용 사례를 포함한 완전한 문서 작성

**작업 항목**:
- [ ] API 레퍼런스 완성
- [ ] 실제 사용 사례 추가 (대시보드, 숨 API)
- [ ] 마이그레이션 가이드 작성
- [ ] 베스트 프랙티스 문서 작성
- [ ] 트러블슈팅 가이드 작성

**예상 기간**: 1주

#### 2.2 타입 안전성 개선

**목표**: TypeScript를 활용한 번역 키 타입 체크

**작업 항목**:
- [ ] 번역 키 타입 생성 유틸리티 추가
- [ ] 네임스페이스별 타입 추론 개선
- [ ] 타입 안전한 번역 함수 제공

**예상 기간**: 1주

#### 2.3 성능 최적화

**목표**: 번역 로딩 및 캐싱 성능 개선

**작업 항목**:
- [ ] 프리로딩 전략 개선 (우선순위 기반)
- [ ] 캐싱 전략 고도화 (LRU 캐시)
- [ ] 번들 크기 최적화

**예상 기간**: 1주

#### 2.4 개발자 경험 개선

**목표**: 더 나은 개발자 경험 제공

**작업 항목**:
- [ ] 에러 메시지 개선 (사용자 친화적)
- [ ] 디버깅 도구 강화 (MissingKeyOverlay 개선)
- [ ] 개발 모드 개선 (핫 리로드 지원)

**예상 기간**: 1주

### 3. 우선순위

1. **높음**: 문서화 강화, 타입 안전성 개선
2. **중간**: 성능 최적화, 개발자 경험 개선
3. **낮음**: 고급 기능 추가

### 4. 개발 로드맵

#### Phase 1: 문서화 및 타입 안전성 (2주)
- 문서화 강화
- 타입 안전성 개선

#### Phase 2: 성능 및 개발자 경험 (2주)
- 성능 최적화
- 개발자 경험 개선

#### Phase 3: 테스트 및 안정화 (1주)
- 통합 테스트 작성
- 버그 수정
- 안정화

---

## 결론

### 현재 상태

- ✅ **기본 기능 완성**: 번역, 언어 전환, 네임스페이스 지원
- ✅ **실제 사용 사례**: 대시보드와 숨 API에서 성공적으로 사용 중
- ✅ **유연한 설정**: API, Static, Custom 로더 지원

### 개선 필요 사항

- 📝 **문서화**: 실제 사용 사례를 포함한 완전한 문서 필요
- 🔒 **타입 안전성**: 번역 키에 대한 타입 체크 강화 필요
- ⚡ **성능**: 프리로딩 및 캐싱 전략 개선 필요
- 🛠️ **개발자 경험**: 에러 메시지 및 디버깅 도구 개선 필요

### 다음 단계

1. **즉시 시작**: 문서화 강화 (실제 사용 사례 포함)
2. **단기 계획**: 타입 안전성 개선
3. **중기 계획**: 성능 최적화 및 개발자 경험 개선

---

**작성일**: 2025년 11월
**작성자**: HUA Platform 개발팀
**버전**: 1.0.0

