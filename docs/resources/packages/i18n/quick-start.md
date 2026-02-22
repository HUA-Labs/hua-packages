# @hua-labs/i18n-core 빠른 시작 가이드

## 📋 목차

1. [설치](#설치)
2. [5분 안에 시작하기](#5분-안에-시작하기)
3. [기본 사용법](#기본-사용법)
4. [다음 단계](#다음-단계)

---

## 설치

```bash
npm install @hua-labs/i18n-core
# 또는
pnpm add @hua-labs/i18n-core
# 또는
yarn add @hua-labs/i18n-core
```

---

## 5분 안에 시작하기

### 1단계: 번역 파일 생성

프로젝트 루트에 `translations` 폴더를 만들고 번역 파일을 추가합니다.

```
your-project/
├── translations/
│   ├── ko/
│   │   └── common.json
│   └── en/
│       └── common.json
└── app/
    └── layout.tsx
```

**translations/ko/common.json**:
```json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요",
  "goodbye": "안녕히 가세요"
}
```

**translations/en/common.json**:
```json
{
  "welcome": "Welcome",
  "hello": "Hello",
  "goodbye": "Goodbye"
}
```

### 2단계: API Route 생성 (Next.js)

**app/api/translations/[language]/[namespace]/route.ts**:
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

### 3단계: i18n 설정

**lib/i18n-config.ts**:
```typescript
import { createCoreI18n } from "@hua-labs/i18n-core";

export function createClientI18nProvider(defaultLanguage: string = "ko") {
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: "en",
    namespaces: ["common"],
    translationLoader: "api",
    translationApiPath: "/api/translations",
    debug: process.env.NODE_ENV === "development",
  });
}
```

### 4단계: Provider 설정

**app/layout.tsx** (Next.js App Router):
```typescript
import { createClientI18nProvider } from "@/lib/i18n-config";

const I18nProvider = createClientI18nProvider("ko");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

### 5단계: 사용하기

**app/page.tsx**:
```typescript
"use client";

import { useTranslation } from "@hua-labs/i18n-core";

export default function Home() {
  const { t, currentLanguage, setLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t("common:welcome")}</h1>
      <p>{t("common:hello")}</p>
      
      <div>
        <p>Current language: {currentLanguage}</p>
        <button onClick={() => setLanguage("en")}>English</button>
        <button onClick={() => setLanguage("ko")}>한국어</button>
      </div>
    </div>
  );
}
```

완료! 이제 번역이 작동합니다. 🎉

---

## 기본 사용법

### 번역 키 형식

#### 네임스페이스:키 형식 (권장)

```typescript
t("common:welcome")
t("dashboard:title")
t("transactions:table.headers.id")
```

#### 네임스페이스.키 형식 (하위 호환)

```typescript
t("common.welcome")
t("dashboard.title")
```

**우선순위**: `:` 구분자가 `.` 구분자보다 우선

### 파라미터 보간

**번역 파일**:
```json
{
  "time": {
    "minutesAgo": "{{minutes}}분 전"
  }
}
```

**사용**:
```typescript
const { t } = useTranslation();

// 통합 t() API - 두 번째 인자가 object이면 params로 인식
t("common:time.minutesAgo", { minutes: 5 });
// 결과: "5분 전"

// 특정 언어로 파라미터 보간
t("common:time.minutesAgo", { minutes: 5 }, "en");
```

> **참고**: `tWithParams()`는 deprecated되었습니다. `t(key, params, language?)`를 사용하세요.

### 중첩 키

**번역 파일**:
```json
{
  "sections": {
    "summary": {
      "title": "통계 요약"
    }
  }
}
```

**사용**:
```typescript
t("dashboard:sections.summary.title");
// 결과: "통계 요약"
```

### 언어 변경

```typescript
const { currentLanguage, setLanguage, supportedLanguages } = useTranslation();

// 언어 변경
setLanguage("en");

// 지원 언어 목록
supportedLanguages.forEach(lang => {
  console.log(`${lang.code}: ${lang.nativeName}`);
});
```

---

## 성능 최적화 (선택)

### 프리로딩

초기 로딩 시 필요한 네임스페이스를 미리 로드합니다.

```typescript
import { preloadMultipleNamespaces } from "@hua-labs/i18n-core/core/lazy-loader";

useEffect(() => {
  preloadMultipleNamespaces(
    currentLanguage,
    ["common", "dashboard", "transactions"],
    async (lang, ns) => {
      const response = await fetch(`/api/translations/${lang}/${ns}`);
      return response.json();
    }
  );
}, [currentLanguage]);
```

### 캐시 확인

```typescript
import { i18nResourceManager } from "@hua-labs/i18n-core/core/i18n-resource";

// 캐시 통계
const stats = i18nResourceManager.getCacheStats();
console.log(`Hit rate: ${stats.hitRate}`);
```

---

## 다음 단계

1. **더 많은 네임스페이스 추가**: [로더 가이드](./I18N_CORE_LOADERS.md) 참고
2. **고급 사용법**: [API 레퍼런스](./I18N_CORE_API_REFERENCE.md) 참고
3. **성능 최적화**: [성능 최적화 가이드](#성능-최적화-선택) 참고
4. **실제 사용 사례**: [PaysByPays 적용 가이드](./I18N_CORE_PAYSBYPAYS_DOCUMENTATION.md) 참고

---

**작성일**: 2025년 11월
**버전**: 1.0.0

