# HUA i18n 패키지 아키텍처 및 사용 가이드

**작성일**: 2026-03-13
**버전**: i18n-core 2.1.0 / i18n-core-zustand 2.1.0 / i18n-formatters 2.1.0 / i18n-loaders 2.1.0

## 📋 목차

1. [패키지 버전 및 Export 경로](#패키지-버전-및-export-경로)
2. [패키지 개요](#패키지-개요)
3. [코어만으로 사용하기](#코어만으로-사용하기)
4. [로더 패키지의 역할](#로더-패키지의-역할)
5. [상태관리 어댑터의 역할](#상태관리-어댑터의-역할)
6. [패키지 조합 가이드](#패키지-조합-가이드)

---

## 패키지 버전 및 Export 경로

| 패키지                      | 버전  | Export 경로                             | 설명                    |
| --------------------------- | ----- | --------------------------------------- | ----------------------- |
| @hua-labs/i18n-core         | 2.1.0 | `.`, `./server`                         | 코어 + 서버 전용 엔트리 |
| @hua-labs/i18n-core-zustand | 2.1.0 | `.`                                     | Zustand 상태 어댑터     |
| @hua-labs/i18n-formatters   | 2.1.0 | `.`, `./date`, `./number`, `./currency` | 포매터 + 서브패스       |
| @hua-labs/i18n-loaders      | 2.1.0 | `.`                                     | 번역 로더               |

### 의존성 그래프

```
i18n-core (독립)
  ↑
  ├── i18n-core-zustand (→ i18n-core, @hua-labs/state)
  ├── i18n-formatters (→ i18n-core)
  └── i18n-loaders (→ i18n-core)
```

### 추가 도구

- `@hua-labs/eslint-plugin-i18n` (v0.1.1) — ESLint 규칙: no-missing-key, no-unused-key, no-raw-text, no-dynamic-key
- 스크립트: `generate-i18n-types`, `validate-translations`

---

## 패키지 개요

### 핵심 질문에 대한 답변

#### 1. 코어만으로도 코드가 돌아가나요?

**네, 맞습니다!** `@hua-labs/i18n-core`는 완전히 독립적으로 작동합니다.

```tsx
// 코어만으로도 충분히 사용 가능
import { createCoreI18n, useTranslation } from "@hua-labs/i18n-core";

const I18nProvider = createCoreI18n({
  defaultLanguage: "ko",
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
  translationLoader: "api", // 기본 제공
  translationApiPath: "/api/translations",
});

// 바로 사용 가능!
function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t("common:welcome")}</h1>;
}
```

**코어가 제공하는 기능:**

- ✅ 기본 번역 기능 (translate, useTranslation)
- ✅ API/Static/Custom 로더 지원
- ✅ SSR/SSG 지원 (initialTranslations)
- ✅ 자동 폴백 처리
- ✅ 에러 핸들링
- ✅ 디버그 모드

#### 2. 로더를 쓰는 이유가 SSR 때문인가요?

**부분적으로 맞습니다.** 하지만 더 정확히는:

**로더 패키지의 목적:**

- ✅ **프로덕션 최적화**: 검증된 로딩 전략 제공
- ✅ **캐싱**: TTL 기반 캐시, 중복 요청 방지
- ✅ **프리로딩**: 필요한 번역을 미리 로드
- ✅ **SSR/클라이언트 호환**: 서버와 클라이언트 모두에서 동작
- ✅ **기본 번역 병합**: 로컬 기본값과 원격 번역 병합

**코어 vs 로더 비교:**

| 기능           | 코어                     | 로더                      |
| -------------- | ------------------------ | ------------------------- |
| 기본 번역 기능 | ✅                       | ❌ (코어 필요)            |
| API 로더       | ✅ (기본)                | ✅ (고급)                 |
| 캐싱           | ✅ (기본)                | ✅ (TTL, 전역 캐시)       |
| 중복 요청 방지 | ❌                       | ✅                        |
| 프리로딩       | ❌                       | ✅                        |
| SSR 최적화     | ✅ (initialTranslations) | ✅ (서버/클라이언트 호환) |

**언제 로더를 사용하나요?**

```tsx
// 코어만으로도 충분한 경우
import { createCoreI18n } from "@hua-labs/i18n-core";

// 간단한 프로젝트, 빠른 프로토타이핑
const I18nProvider = createCoreI18n({
  translationLoader: "api", // 코어의 기본 API 로더 사용
  // ...
});
```

```tsx
// 로더를 사용하는 경우
import { createCoreI18n } from "@hua-labs/i18n-core";
import {
  createApiTranslationLoader,
  preloadNamespaces,
} from "@hua-labs/i18n-loaders";

// 프로덕션 환경, 성능 최적화 필요
const loadTranslations = createApiTranslationLoader({
  translationApiPath: "/api/translations",
  cacheTtlMs: 60_000, // 1분 캐시
  disableCache: false, // 캐싱 활성화
});

const I18nProvider = createCoreI18n({
  loadTranslations, // 고급 로더 사용
  // ...
});

// 앱 시작 시 프리로딩
preloadNamespaces("ko", ["common", "dashboard"], loadTranslations);
```

#### 3. 상태관리 지원이 편의성을 위한 것인가요?

**네, 정확합니다!** Zustand 어댑터는 **편의성과 안정성**을 제공합니다.

**코어만 사용할 때 (수동 동기화):**

```tsx
// 수동으로 언어 동기화해야 함
import { useTranslation } from "@hua-labs/i18n-core";
import { useAppStore } from "./store/useAppStore";

function MyComponent() {
  const { t, setLanguage: setI18nLanguage, currentLanguage } = useTranslation();
  const { language: storeLanguage, setLanguage: setStoreLanguage } =
    useAppStore();

  // 수동 동기화 필요
  useEffect(() => {
    if (storeLanguage !== currentLanguage) {
      setI18nLanguage(storeLanguage);
    }
  }, [storeLanguage, currentLanguage]);

  // 언어 변경 시 양쪽 모두 업데이트 필요
  const handleLanguageChange = (lang: string) => {
    setStoreLanguage(lang);
    setI18nLanguage(lang);
  };

  return <button onClick={() => handleLanguageChange("en")}>English</button>;
}
```

**Zustand 어댑터 사용 시 (자동 동기화):**

```tsx
// 자동으로 동기화됨
import { createZustandI18n } from "@hua-labs/i18n-core-zustand";
import { useAppStore } from "./store/useAppStore";
import { useTranslation } from "@hua-labs/i18n-core";

// Provider 설정 시 자동 동기화
const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
});

function MyComponent() {
  const { t } = useTranslation(); // 번역만 사용
  const { setLanguage } = useAppStore(); // Zustand 스토어만 사용

  // 언어 변경 시 자동으로 i18n에 반영됨!
  return <button onClick={() => setLanguage("en")}>English</button>;
}
```

**Zustand 어댑터의 장점:**

1. **자동 동기화**: Zustand 스토어 변경 시 자동으로 i18n에 반영
2. **단방향 데이터 흐름**: Zustand 스토어가 source of truth
3. **순환 참조 방지**: 이벤트 기반 통신 대신 직접 구독
4. **타입 안전성**: TypeScript 완전 지원
5. **코드 간소화**: 수동 동기화 코드 불필요

---

## 코어만으로 사용하기

### 기본 사용법

```tsx
// app/layout.tsx
import { createCoreI18n } from "@hua-labs/i18n-core";

const I18nProvider = createCoreI18n({
  defaultLanguage: "ko",
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
  translationLoader: "api", // 또는 'static', 'custom'
  translationApiPath: "/api/translations",
  debug: process.env.NODE_ENV === "development",
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

```tsx
// components/MyComponent.tsx
import { useTranslation } from "@hua-labs/i18n-core";

export default function MyComponent() {
  const { t, currentLanguage, setLanguage } = useTranslation();

  return (
    <div>
      <h1>{t("common:welcome")}</h1>
      <button onClick={() => setLanguage("en")}>English</button>
    </div>
  );
}
```

### SSR 지원 (코어만으로)

```tsx
// app/layout.tsx (Next.js App Router)
import { createCoreI18n } from "@hua-labs/i18n-core";
import { loadSSRTranslations } from "./lib/ssr-translations";

export default async function RootLayout({ children }) {
  // SSR에서 번역 데이터 로드
  const ssrTranslations = await loadSSRTranslations("ko");

  const I18nProvider = createCoreI18n({
    defaultLanguage: "ko",
    fallbackLanguage: "en",
    namespaces: ["common", "pages"],
    initialTranslations: ssrTranslations, // SSR 데이터 전달
    translationLoader: "api",
  });

  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

---

## 로더 패키지의 역할

### 로더 패키지가 제공하는 기능

#### 1. 고급 API 로더

```tsx
import { createApiTranslationLoader } from "@hua-labs/i18n-loaders";

const loadTranslations = createApiTranslationLoader({
  translationApiPath: "/api/translations",
  cacheTtlMs: 5 * 60 * 1000, // 5분 캐시
  disableCache: false,
  baseUrl: "https://api.example.com", // 서버 사이드용
  fetcher: customFetch, // 커스텀 fetch 함수
  requestInit: (language, namespace) => ({
    headers: { "X-Custom-Header": "value" },
  }),
});
```

**코어의 기본 API 로더 vs 로더 패키지:**

| 기능             | 코어 기본 | 로더 패키지    |
| ---------------- | --------- | -------------- |
| 기본 API 요청    | ✅        | ✅             |
| 캐싱             | ✅ (기본) | ✅ (TTL, 전역) |
| 중복 요청 방지   | ❌        | ✅             |
| 커스텀 헤더      | ❌        | ✅             |
| 서버 사이드 지원 | ❌        | ✅             |
| 에러 핸들링      | ✅ (기본) | ✅ (고급)      |

#### 2. 프리로딩 및 워밍

```tsx
import {
  preloadNamespaces,
  warmFallbackLanguages,
} from "@hua-labs/i18n-loaders";

// 필요한 네임스페이스 미리 로드
await preloadNamespaces("ko", ["common", "dashboard"], loadTranslations);

// 폴백 언어도 미리 워밍
await warmFallbackLanguages(
  "ko",
  ["ko", "en", "ja"],
  ["common", "dashboard"],
  loadTranslations,
);
```

#### 3. 기본 번역 병합

```tsx
import { withDefaultTranslations } from "@hua-labs/i18n-loaders";

const defaultTranslations = {
  ko: {
    common: {
      welcome: "환영합니다",
      // ...
    },
  },
  en: {
    common: {
      welcome: "Welcome",
      // ...
    },
  },
};

const loadTranslations = withDefaultTranslations(
  createApiTranslationLoader(),
  defaultTranslations,
);

// API에서 번역을 가져오고, 없으면 기본값 사용
// API 번역과 기본값을 병합 (API 우선)
```

### 로더를 사용해야 하는 경우

1. **프로덕션 환경**: 성능 최적화가 중요한 경우
2. **대규모 애플리케이션**: 많은 네임스페이스와 언어를 사용하는 경우
3. **SSR 최적화**: 서버와 클라이언트 모두에서 번역 로딩이 필요한 경우
4. **캐싱 전략**: TTL 기반 캐싱이 필요한 경우
5. **중복 요청 방지**: 동시에 같은 번역을 요청하는 경우가 많은 경우

---

## 상태관리 어댑터의 역할

### Zustand 어댑터가 해결하는 문제

#### 문제: 수동 동기화의 복잡성

```tsx
// ❌ 코어만 사용 시 (복잡함)
import { useTranslation } from "@hua-labs/i18n-core";
import { useAppStore } from "./store/useAppStore";

function LanguageSwitcher() {
  const { currentLanguage, setLanguage: setI18nLanguage } = useTranslation();
  const { language: storeLanguage, setLanguage: setStoreLanguage } =
    useAppStore();

  // 1. 양방향 동기화 필요
  useEffect(() => {
    if (storeLanguage !== currentLanguage) {
      setI18nLanguage(storeLanguage);
    }
  }, [storeLanguage, currentLanguage]);

  // 2. 언어 변경 시 양쪽 모두 업데이트
  const handleChange = (lang: string) => {
    setStoreLanguage(lang);
    setI18nLanguage(lang);
  };

  // 3. 순환 참조 위험
  // 4. 타입 안전성 부족
}
```

#### 해결: 자동 동기화

```tsx
// ✅ Zustand 어댑터 사용 (간단함)
import { createZustandI18n } from "@hua-labs/i18n-core-zustand";
import { useAppStore } from "./store/useAppStore";
import { useTranslation } from "@hua-labs/i18n-core";

// Provider 설정 시 자동 동기화
const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
});

function LanguageSwitcher() {
  const { t } = useTranslation(); // 번역만 사용
  const { setLanguage } = useAppStore(); // Zustand만 사용

  // 언어 변경 시 자동으로 i18n에 반영!
  return <button onClick={() => setLanguage("en")}>English</button>;
}
```

### Zustand 어댑터의 작동 원리

```tsx
// 내부적으로 다음과 같이 동작:

// 1. Zustand 스토어 구독
store.subscribe((state) => {
  if (state.language !== i18nCurrentLanguage) {
    // 2. 자동으로 i18n 언어 변경
    setI18nLanguage(state.language);
  }
});

// 3. 단방향 데이터 흐름
// Zustand 스토어 → i18n (자동)
// i18n → Zustand 스토어 (불필요, 스토어가 source of truth)
```

### 언제 Zustand 어댑터를 사용하나요?

1. **Zustand를 이미 사용 중**: 기존 상태관리와 통합
2. **언어 설정을 전역 상태로 관리**: 다른 컴포넌트에서도 언어 접근 필요
3. **자동 동기화 필요**: 수동 동기화 코드를 피하고 싶을 때
4. **타입 안전성**: TypeScript로 완전한 타입 체크
5. **순환 참조 방지**: 이벤트 기반 통신의 복잡성 회피

---

## 패키지 조합 가이드

### 시나리오별 권장 조합

#### 1. 간단한 프로젝트 (코어만)

```tsx
// ✅ 코어만으로 충분
import { createCoreI18n, useTranslation } from "@hua-labs/i18n-core";

// 빠른 프로토타이핑, 소규모 프로젝트
const I18nProvider = createCoreI18n({
  defaultLanguage: "ko",
  namespaces: ["common"],
});
```

**장점:**

- 간단하고 빠른 설정
- 의존성 최소화
- 작은 번들 크기

**단점:**

- 고급 캐싱 없음
- 프리로딩 없음
- 수동 동기화 필요 (상태관리 사용 시)

#### 2. 프로덕션 환경 (코어 + 로더)

```tsx
// ✅ 코어 + 로더
import { createCoreI18n } from "@hua-labs/i18n-core";
import {
  createApiTranslationLoader,
  preloadNamespaces,
} from "@hua-labs/i18n-loaders";

const loadTranslations = createApiTranslationLoader({
  cacheTtlMs: 60_000,
});

const I18nProvider = createCoreI18n({
  loadTranslations,
  // ...
});

// 프리로딩
preloadNamespaces("ko", ["common", "pages"], loadTranslations);
```

**장점:**

- 프로덕션 최적화
- 캐싱 및 중복 요청 방지
- 프리로딩 지원

**단점:**

- 추가 패키지 필요
- 설정이 약간 복잡

#### 3. Zustand 통합 (코어 + Zustand 어댑터)

```tsx
// ✅ 코어 + Zustand 어댑터
import { createZustandI18n } from "@hua-labs/i18n-core-zustand";
import { useAppStore } from "./store/useAppStore";

const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
});
```

**장점:**

- 자동 동기화
- 타입 안전성
- 순환 참조 방지

**단점:**

- Zustand 필요
- 추가 패키지 필요

#### 4. 완전한 설정 (코어 + 로더 + Zustand)

```tsx
// ✅ 모든 패키지 조합
import { createZustandI18n } from "@hua-labs/i18n-core-zustand";
import {
  createApiTranslationLoader,
  preloadNamespaces,
} from "@hua-labs/i18n-loaders";
import { useAppStore } from "./store/useAppStore";

const loadTranslations = createApiTranslationLoader({
  cacheTtlMs: 60_000,
});

const I18nProvider = createZustandI18n(useAppStore, {
  loadTranslations, // 고급 로더 사용
  fallbackLanguage: "en",
  namespaces: ["common", "pages"],
});

// 프리로딩
preloadNamespaces("ko", ["common", "pages"], loadTranslations);
```

**장점:**

- 모든 최적화 기능
- 자동 동기화
- 프로덕션 준비 완료

**단점:**

- 여러 패키지 필요
- 설정 복잡도 증가

---

## 요약

### 핵심 질문에 대한 답변

1. **코어만으로도 코드가 돌아가나요?**
   - ✅ 네, 코어는 완전히 독립적으로 작동합니다.

2. **로더를 쓰는 이유가 SSR 때문인가요?**
   - 부분적으로 맞지만, 더 정확히는 **프로덕션 최적화**를 위한 것입니다.
   - SSR뿐만 아니라 캐싱, 프리로딩, 중복 요청 방지 등이 포함됩니다.

3. **상태관리 지원이 편의성을 위한 것인가요?**
   - ✅ 네, 정확합니다. Zustand 어댑터는 수동 동기화의 복잡성을 제거하고 자동 동기화를 제공합니다.

### 선택 가이드

| 프로젝트 유형     | 권장 패키지           | 이유          |
| ----------------- | --------------------- | ------------- |
| 프로토타입/소규모 | 코어만                | 간단하고 빠름 |
| 프로덕션 (단순)   | 코어 + 로더           | 성능 최적화   |
| Zustand 사용      | 코어 + Zustand        | 자동 동기화   |
| 대규모 프로덕션   | 코어 + 로더 + Zustand | 모든 최적화   |

---

## 참고 자료

- [의존성 분석 문서](./I18N_PACKAGES_DEPENDENCIES.md)
- [코어 API 레퍼런스](../packages/hua-i18n-core/README.md)
- [로더 가이드](../packages/hua-i18n-loaders/README.md)
- [Zustand 어댑터 가이드](../packages/hua-i18n-core-zustand/README.md)
