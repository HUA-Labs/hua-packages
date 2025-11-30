# @hua-labs/i18n-core - PaysByPays 프로젝트 적용 가이드

## 📋 목차

1. [개요](#개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [설정 및 초기화](#설정-및-초기화)
4. [번역 파일 구조](#번역-파일-구조)
5. [실제 사용 사례](#실제-사용-사례)
6. [API Route 구현](#api-route-구현)
7. [베스트 프랙티스](#베스트-프랙티스)
8. [개발 플랜](#개발-플랜)

---

## 개요

이 문서는 **PaysByPays** 프로젝트에서 `@hua-labs/i18n-core` 패키지를 실제로 적용한 사례를 바탕으로 작성되었습니다. 프로덕션 환경에서 검증된 패턴과 구조를 제공합니다.

### 프로젝트 정보

- **프로젝트명**: PaysByPays Dashboard
- **프레임워크**: Next.js 16 (App Router)
- **언어 지원**: 한국어(ko), 영어(en), 일본어(ja)
- **네임스페이스**: 9개 (common, layout, dashboard, transactions, settings, settlements, analytics, merchants, health)

---

## 프로젝트 구조

```
paysbypays/
├── src/
│   ├── lib/
│   │   └── i18n-config.ts          # i18n 설정 파일
│   ├── app/
│   │   ├── api/
│   │   │   └── translations/
│   │   │       └── [language]/
│   │   │           └── [namespace]/
│   │   │               └── route.ts  # 번역 API Route
│   │   └── layout.tsx               # 루트 레이아웃
│   └── components/
│       └── providers/
│           └── AppProviders.tsx     # Provider 통합
├── translations/                     # 번역 파일 디렉토리
│   ├── ko/
│   │   ├── common.json
│   │   ├── layout.json
│   │   ├── dashboard.json
│   │   ├── transactions.json
│   │   ├── settings.json
│   │   ├── settlements.json
│   │   ├── analytics.json
│   │   ├── merchants.json
│   │   └── health.json
│   ├── en/
│   │   └── (동일한 구조)
│   └── ja/
│       └── (동일한 구조)
└── package.json
```

---

## 설정 및 초기화

### 1. 패키지 설치

```json
{
  "dependencies": {
    "@hua-labs/i18n-core": "file:./hua-labs-i18n-core-1.0.0.tgz"
  }
}
```

### 2. i18n 설정 파일 생성

**파일**: `src/lib/i18n-config.ts`

```typescript
import { createCoreI18n } from "@hua-labs/i18n-core";

// 지원 언어 정의
export const SUPPORTED_LANGUAGE_CODES = ["ko", "en", "ja"] as const;

// 네임스페이스 정의
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

type Namespace = (typeof I18N_NAMESPACES)[number];
export type LanguageCode = (typeof SUPPORTED_LANGUAGE_CODES)[number];

// 번역 캐시 및 요청 관리
const translationCache = new Map<string, Record<string, unknown>>();
const inFlightRequests = new Map<string, Promise<Record<string, unknown>>>();

const translationApiPath = "/api/translations";

// 번역 URL 빌드 함수
function buildTranslationUrl(language: string, namespace: string) {
  if (typeof window !== "undefined") {
    return `${translationApiPath}/${language}/${namespace}`;
  }

  // SSR 환경 처리
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return `${process.env.NEXT_PUBLIC_SITE_URL}${translationApiPath}/${language}/${namespace}`;
  }

  if (process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    return `${vercelUrl}${translationApiPath}/${language}/${namespace}`;
  }

  return `http://localhost:3000${translationApiPath}/${language}/${namespace}`;
}

// 번역 파일 로드 함수
async function fetchTranslation(
  language: LanguageCode,
  namespace: Namespace
): Promise<Record<string, unknown>> {
  const cacheKey = `${language}:${namespace}`;

  // 캐시 확인
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // 진행 중인 요청 확인 (중복 요청 방지)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey)!;
  }

  // API 요청
  const request = fetch(buildTranslationUrl(language, namespace), {
    cache: "force-cache",
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
      return data;
    })
    .catch((error) => {
      inFlightRequests.delete(cacheKey);
      if (process.env.NODE_ENV === "development") {
        console.warn("[i18n] translation fetch failed", { language, namespace });
      }
      throw error;
    });

  inFlightRequests.set(cacheKey, request);
  return request;
}

// 클라이언트용 Provider 생성 함수
export function createClientI18nProvider(defaultLanguage: LanguageCode = "ko") {
  const provider = createCoreI18n({
    defaultLanguage,
    fallbackLanguage: "en",
    namespaces: [...I18N_NAMESPACES],
    translationLoader: "api", // API route 사용
    translationApiPath,
    debug: process.env.NODE_ENV === "development",
  });

  // Provider 생성 시점에 모든 네임스페이스를 미리 로드 (비동기, 블로킹하지 않음)
  if (typeof window !== "undefined") {
    preloadTranslations(defaultLanguage).catch(() => {
      // 에러는 무시 (fallback 사용)
    });
  }

  return provider;
}

// 번역 프리로딩 함수
export async function preloadTranslations(
  language: LanguageCode,
  namespaces: Namespace[] = [...I18N_NAMESPACES]
): Promise<void> {
  const results = await Promise.allSettled(
    namespaces.map(async (namespace): Promise<Record<string, unknown>> => {
      try {
        const result = await fetchTranslation(language, namespace);
        if (process.env.NODE_ENV === "development") {
          console.log(`[i18n] Preloaded ${namespace} for ${language}`);
        }
        return result;
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.warn(`[i18n] Failed to preload ${namespace} for ${language}:`, error);
        }
        return {};
      }
    })
  );
  
  if (process.env.NODE_ENV === "development") {
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    console.log(`[i18n] Preloaded ${successCount}/${namespaces.length} namespaces for ${language}`);
  }
}

// Fallback 언어 워밍업 함수
export async function warmFallbackLanguage(
  excludeLanguage?: LanguageCode,
  namespaces: Namespace[] = [...I18N_NAMESPACES]
) {
  const otherLanguages = SUPPORTED_LANGUAGE_CODES.filter(
    (code) => code !== excludeLanguage
  );

  await Promise.allSettled(
    otherLanguages.map((language) =>
      preloadTranslations(language, namespaces)
    )
  );
}
```

**주요 특징**:
- ✅ 타입 안전성: `as const`를 사용한 리터럴 타입
- ✅ 캐싱: 메모리 캐시로 중복 요청 방지
- ✅ 중복 요청 방지: `inFlightRequests`로 동시 요청 관리
- ✅ 프리로딩: 초기 로딩 시 모든 네임스페이스 미리 로드
- ✅ Fallback 워밍업: 언어 전환 시 빠른 응답을 위한 사전 로드

### 3. Provider 통합

**파일**: `src/components/providers/AppProviders.tsx`

```typescript
"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import {
  createClientI18nProvider,
  preloadTranslations,
  warmFallbackLanguage,
} from "@/lib/i18n-config";
import { usePreferencesStore } from "@/store/preferences-store";

function I18nBridge({ children }: { children: ReactNode }) {
  const language = usePreferencesStore((state) => state.language);
  const I18nProvider = useMemo(
    () => createClientI18nProvider(language),
    [language]
  );

  // 초기 마운트 및 언어 변경 시 모든 네임스페이스를 미리 로드
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`[i18n] Preloading translations for language: ${language}`);
    }
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

  // Fallback 언어도 워밍업 (비동기, 블로킹하지 않음)
  useEffect(() => {
    warmFallbackLanguage(language);
  }, [language]);

  return <I18nProvider>{children}</I18nProvider>;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <I18nBridge>
      {/* 다른 Provider들... */}
      {children}
    </I18nBridge>
  );
}
```

**주요 특징**:
- ✅ Zustand store와 통합 (언어 상태 관리)
- ✅ 언어 변경 시 자동 프리로딩
- ✅ Fallback 언어 워밍업
- ✅ 메모이제이션을 통한 성능 최적화

---

## 번역 파일 구조

### 1. 네임스페이스별 구조

#### common.json (공통 번역)

```json
{
  "app": {
    "name": "PaysByPays",
    "tagline": "결제대행사 대시보드"
  },
  "actions": {
    "viewAll": "전체 보기",
    "retry": "다시 시도",
    "refresh": "새로고침",
    "close": "닫기",
    "save": "저장",
    "export": "내보내기"
  },
  "labels": {
    "language": "언어",
    "date": "날짜",
    "currency": "통화",
    "total": "총합",
    "status": "상태",
    "merchant": "가맹점"
  },
  "states": {
    "loading": "로딩 중...",
    "loadingData": "데이터를 불러오는 중...",
    "empty": "데이터가 없습니다."
  },
  "statuses": {
    "success": "승인",
    "approved": "승인",
    "failed": "실패",
    "pending": "대기"
  },
  "time": {
    "justNow": "방금 전",
    "minutesAgo": "{{minutes}}분 전",
    "hoursAgo": "{{hours}}시간 전",
    "daysAgo": "{{days}}일 전"
  }
}
```

#### dashboard.json (대시보드 전용)

```json
{
  "title": "결제 개요",
  "description": "실시간 거래 현황과 이상 징후를 추적합니다.",
  "sections": {
    "summary": {
      "title": "통계 요약",
      "metrics": {
        "totalVolume": {
          "label": "총 거래 금액",
          "description": "누적 금액"
        },
        "totalCount": {
          "label": "거래 건수",
          "description": "누적 거래"
        }
      }
    },
    "recent": {
      "title": "최근 거래",
      "empty": "거래 내역이 없습니다."
    }
  }
}
```

#### transactions.json (거래 내역)

```json
{
  "page": {
    "title": "거래 내역",
    "description": "전체 거래 내역을 조회하고 관리할 수 있습니다."
  },
  "table": {
    "headers": {
      "id": "거래 코드",
      "merchant": "가맹점",
      "amount": "금액",
      "status": "상태"
    },
    "empty": "거래 내역이 없습니다."
  },
  "payTypes": {
    "card": "신용카드",
    "mobile": "모바일",
    "online": "온라인"
  }
}
```

### 2. 번역 키 네이밍 컨벤션

#### 권장 형식: `namespace:key.path`

```typescript
// ✅ 권장
t("common:actions.viewAll")
t("dashboard:sections.summary.title")
t("transactions:table.headers.id")

// ⚠️ 하위 호환 (점 구분자)
t("common.actions.viewAll")
t("dashboard.sections.summary.title")
```

**우선순위**: `:` 구분자가 `.` 구분자보다 우선

#### 중첩 키 구조

```json
{
  "sections": {
    "summary": {
      "title": "통계 요약",
      "metrics": {
        "totalVolume": {
          "label": "총 거래 금액"
        }
      }
    }
  }
}
```

```typescript
// 사용
t("dashboard:sections.summary.title")
t("dashboard:sections.summary.metrics.totalVolume.label")
```

### 3. 파라미터 보간

```json
{
  "time": {
    "minutesAgo": "{{minutes}}분 전",
    "hoursAgo": "{{hours}}시간 전"
  },
  "alerts": {
    "healthDown": {
      "title": "시스템 오류 감지",
      "message": "{{count}}개 서비스가 응답하지 않습니다"
    }
  }
}
```

```typescript
// 사용
tWithParams("common:time.minutesAgo", { minutes: 5 })
// 결과: "5분 전"

tWithParams("common:alerts.healthDown.message", { count: 3 })
// 결과: "3개 서비스가 응답하지 않습니다"
```

---

## 실제 사용 사례

### 1. 기본 컴포넌트 사용

**파일**: `src/components/dashboard/RecentTransactionsFeed.tsx`

```typescript
"use client";

import { useTranslation } from "@hua-labs/i18n-core";

export function RecentTransactionsFeed({ limit = 10 }: Props) {
  const { t, tWithParams } = useTranslation();
  
  // 단순 번역
  if (recentTransactions.length === 0) {
    return (
      <p>{t("dashboard:sections.recent.empty")}</p>
    );
  }
  
  // 파라미터 보간
  const formatTime = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffMins < 1) return t("common:time.justNow");
    if (diffMins < 60) return tWithParams("common:time.minutesAgo", { minutes: diffMins });
    // ...
  };
  
  return (
    <div>
      {recentTransactions.map((tx) => (
        <div key={tx.id}>
          <span>{formatTime(tx.createdAt)}</span>
        </div>
      ))}
      <Link href="/transactions">
        {t("common:actions.viewAll")}
      </Link>
    </div>
  );
}
```

### 2. 페이지 컴포넌트 사용

**파일**: `src/app/page.tsx`

```typescript
"use client";

import { useTranslation } from "@hua-labs/i18n-core";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

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

### 3. 테이블 컴포넌트 사용

**파일**: `src/components/merchants/MerchantTransactionsTable.tsx`

```typescript
"use client";

import { useTranslation } from "@hua-labs/i18n-core";

export function MerchantTransactionsTable({ transactions, ... }: Props) {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t("merchants:transactions.title")}</h2>
      <table>
        <thead>
          <tr>
            <th>{t("merchants:transactions.headers.id")}</th>
            <th>{t("merchants:transactions.headers.amount")}</th>
            <th>{t("merchants:transactions.headers.status")}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.id}</td>
              <td>{formatCurrency(tx.amount)}</td>
              <td>{t(`common:statuses.${tx.status}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 4. 동적 키 사용

```typescript
// 상태에 따른 동적 번역
const status = "approved";
t(`common:statuses.${status}`); // "승인"

// 조건부 번역
const statusKey = status === "success" ? "approved" : status;
t(`common:statuses.${statusKey}`);
```

---

## API Route 구현

**파일**: `src/app/api/translations/[language]/[namespace]/route.ts`

```typescript
import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const SUPPORTED_LANGUAGES = new Set(["ko", "en", "ja"]);

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

  // 네임스페이스 정규화 (보안)
  const normalizedNamespace = namespace.replace(/[^a-zA-Z0-9-_]/g, "");
  
  // 번역 파일 경로 구성
  const translationsDir = path.join(process.cwd(), "translations");
  const filePath = path.join(
    translationsDir,
    language,
    `${normalizedNamespace}.json`
  );

  try {
    // 파일 읽기
    const fileContents = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContents);
    
    // 캐싱 헤더 설정
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // 파일이 없으면 404 반환
    return NextResponse.json(
      { error: "Translation not found" },
      { status: 404 }
    );
  }
}
```

**주요 특징**:
- ✅ Next.js App Router 동적 라우트 활용
- ✅ 언어 및 네임스페이스 검증
- ✅ 보안: 네임스페이스 정규화 (경로 탐색 공격 방지)
- ✅ 캐싱 전략: 1시간 캐시, 24시간 stale-while-revalidate
- ✅ 에러 핸들링: 404 반환

---

## 베스트 프랙티스

### 1. 네임스페이스 분리 원칙

- **common**: 모든 페이지에서 공통으로 사용하는 번역
- **layout**: 레이아웃 관련 (사이드바, 헤더 등)
- **페이지별 네임스페이스**: 각 페이지/기능별로 분리
  - `dashboard`: 대시보드 전용
  - `transactions`: 거래 내역
  - `merchants`: 가맹점 관리
  - `settlements`: 정산
  - `analytics`: 분석/통계
  - `settings`: 설정
  - `health`: 시스템 상태

### 2. 번역 키 구조화

```json
{
  "page": {
    "title": "페이지 제목",
    "description": "페이지 설명"
  },
  "sections": {
    "sectionName": {
      "title": "섹션 제목",
      "description": "섹션 설명"
    }
  },
  "actions": {
    "actionName": "액션 텍스트"
  }
}
```

### 3. 파라미터 사용 가이드

```typescript
// ✅ 좋은 예: 명확한 파라미터명
tWithParams("common:time.minutesAgo", { minutes: 5 })
tWithParams("common:alerts.healthDown.message", { count: 3 })

// ❌ 나쁜 예: 모호한 파라미터명
tWithParams("common:time.ago", { value: 5 })
```

### 4. 타입 안전성

```typescript
// 타입 정의
export const I18N_NAMESPACES = [
  "common",
  "layout",
  "dashboard",
  // ...
] as const;

type Namespace = (typeof I18N_NAMESPACES)[number];

// 사용 시 타입 체크
const namespace: Namespace = "common"; // ✅
const invalid: Namespace = "invalid"; // ❌ TypeScript 에러
```

### 5. 성능 최적화

- ✅ **프리로딩**: 초기 로딩 시 모든 네임스페이스 미리 로드
- ✅ **캐싱**: 메모리 캐시로 중복 요청 방지
- ✅ **중복 요청 방지**: `inFlightRequests`로 동시 요청 관리
- ✅ **Fallback 워밍업**: 언어 전환 시 빠른 응답

### 6. 에러 처리

```typescript
// 개발 환경에서만 경고 출력
if (process.env.NODE_ENV === "development") {
  console.warn("[i18n] translation fetch failed", { language, namespace });
}

// Fallback 처리
try {
  const result = await fetchTranslation(language, namespace);
  return result;
} catch (error) {
  // 에러 발생 시 빈 객체 반환 (앱 크래시 방지)
  return {};
}
```

---

## 개발 플랜

### Phase 1: 문서화 완성 (1주)

#### 1.1 API 레퍼런스 작성
- [ ] 모든 함수 및 훅 문서화
- [ ] 타입 정의 문서화
- [ ] 옵션 설명 추가

#### 1.2 사용 가이드 작성
- [ ] 초보자용 빠른 시작 가이드
- [ ] 고급 사용법 가이드
- [ ] 마이그레이션 가이드

#### 1.3 예제 코드 추가
- [ ] 기본 사용 예제
- [ ] 고급 패턴 예제
- [ ] 통합 예제 (Next.js, React 등)

### Phase 2: 타입 안전성 개선 (1주)

#### 2.1 번역 키 타입 생성
- [ ] 번역 파일에서 타입 자동 생성
- [ ] 네임스페이스별 타입 추론
- [ ] 타입 안전한 번역 함수

#### 2.2 타입 유틸리티 추가
```typescript
// 예시
type TranslationKeys = GenerateKeys<typeof translations>;
t<TranslationKeys>("common:actions.viewAll"); // ✅ 타입 체크
t<TranslationKeys>("invalid:key"); // ❌ 타입 에러
```

### Phase 3: 성능 최적화 (1주)

#### 3.1 프리로딩 전략 개선
- [ ] 우선순위 기반 프리로딩
- [ ] 지연 로딩 옵션 추가
- [ ] 프리로딩 진행률 표시

#### 3.2 캐싱 전략 고도화
- [ ] LRU 캐시 구현
- [ ] 캐시 크기 제한
- [ ] 캐시 무효화 전략

#### 3.3 번들 크기 최적화
- [ ] Tree-shaking 최적화
- [ ] 코드 스플리팅
- [ ] 번들 크기 분석

### Phase 4: 개발자 경험 개선 (1주)

#### 4.1 에러 메시지 개선
- [ ] 사용자 친화적 에러 메시지
- [ ] 에러 복구 제안
- [ ] 에러 로깅 개선

#### 4.2 디버깅 도구 강화
- [ ] MissingKeyOverlay 개선
- [ ] 번역 키 검색 기능
- [ ] 번역 상태 모니터링

#### 4.3 개발 모드 개선
- [ ] 핫 리로드 지원
- [ ] 번역 파일 변경 감지
- [ ] 개발 서버 통합

### Phase 5: 테스트 및 안정화 (1주)

#### 5.1 통합 테스트 작성
- [ ] Provider 테스트
- [ ] 훅 테스트
- [ ] API Route 테스트

#### 5.2 E2E 테스트
- [ ] 언어 전환 테스트
- [ ] 번역 로딩 테스트
- [ ] 에러 처리 테스트

#### 5.3 버그 수정 및 안정화
- [ ] 버그 수정
- [ ] 성능 개선
- [ ] 문서 업데이트

---

## 우선순위

### 높음 (즉시 시작)
1. ✅ **문서화 완성** - 현재 문서 작성 완료
2. **API 레퍼런스** - 모든 함수 문서화
3. **타입 안전성** - 번역 키 타입 체크

### 중간 (단기 계획)
4. **성능 최적화** - 프리로딩 및 캐싱 개선
5. **개발자 경험** - 에러 메시지 및 디버깅 도구

### 낮음 (중기 계획)
6. **고급 기능** - 플러그인 시스템
7. **AI 번역** - 자동 번역 제안

---

## 결론

PaysByPays 프로젝트에서 `@hua-labs/i18n-core` 패키지를 성공적으로 적용한 사례를 바탕으로:

1. ✅ **실제 사용 사례 문서화 완료**
2. ✅ **베스트 프랙티스 정리**
3. ✅ **개발 플랜 수립**

다음 단계로 API 레퍼런스 작성 및 타입 안전성 개선을 진행할 예정입니다.

---

**작성일**: 2025년 11월
**기준 프로젝트**: PaysByPays Dashboard
**버전**: 1.0.0

