# HUA UX 프레임워크 CRA/Vite 지원 분석

**작성일**: 2025-12-29  
**목적**: Create React App (CRA) 및 Vite에서 hua-ux 사용 가능 여부 분석

---

## 📊 분석 결과 요약

### ✅ **대부분의 기능은 이미 CRA/Vite에서 사용 가능합니다!**

**핵심 결론**:
- ✅ **90% 이상의 기능이 Next.js 없이도 작동**
- ⚠️ **Next.js 특정 기능 3개만 조건부 처리 필요**
- ✅ **이미 `next`가 optional peer dependency로 설정됨**

---

## 🔍 Next.js 의존성 분석

### 1. Next.js에 의존하는 부분 (3개)

#### 1.1 `generatePageMetadata` (Next.js Metadata 타입)

**위치**: `src/framework/utils/metadata.ts`

**의존성**:
```typescript
import type { Metadata } from 'next';  // Next.js 타입
```

**영향**: Next.js가 없으면 타입 에러 발생

**해결 방안**:
- 조건부 타입 import
- 또는 일반 메타데이터 생성 함수 추가

#### 1.2 `renderJSONLD` (Next.js Script 컴포넌트)

**위치**: `src/framework/seo/geo/generateGEOMetadata.ts`

**의존성**: Next.js Script 컴포넌트 사용 예시만 있음

**실제 코드**: 일반 script 태그로도 사용 가능 ✅
```typescript
export function renderJSONLD(jsonLd: unknown, id?: string): {
  id: string;
  type: string;
  dangerouslySetInnerHTML: { __html: string };
}
```

**영향**: 없음 (이미 일반 React에서 사용 가능)

#### 1.3 `createI18nMiddleware` (Next.js Middleware)

**위치**: `src/framework/middleware/i18n.ts`

**의존성**: Next.js middleware용

**실제 코드**: 이미 폴백 구현 있음 ✅
```typescript
// Next.js가 없으면 폴백 구현 사용
try {
  const nextServer = require('next/server');
  NextResponse = nextServer.NextResponse;
} catch {
  // 폴백 구현
  NextResponse = { next: () => ({ headers: new Headers() }) };
}
```

**영향**: 없음 (이미 폴백 구현으로 작동)

---

### 2. Next.js에 의존하지 않는 부분 (대부분) ✅

#### 2.1 컴포넌트 시스템

**모든 컴포넌트가 순수 React**:
- ✅ `HuaUxLayout`: 순수 React 컴포넌트
- ✅ `HuaUxPage`: 순수 React 컴포넌트 (`'use client'`는 Next.js 지시어지만 React에서 무시됨)
- ✅ `ErrorBoundary`: 순수 React 클래스 컴포넌트
- ✅ `BrandedButton`, `BrandedCard`: 순수 React 컴포넌트
- ✅ `UnifiedProviders`: 순수 React Provider

#### 2.2 Hooks 시스템

**모든 hooks가 순수 React**:
- ✅ `useMotion`: 순수 React hook
- ✅ `useFocusManagement`: 순수 React hook
- ✅ `useFocusTrap`: 순수 React hook
- ✅ `useLiveRegion`: 순수 React hook
- ✅ `useDelayedLoading`: 순수 React hook
- ✅ `useLoadingState`: 순수 React hook

#### 2.3 설정 시스템

**Config 시스템은 Node.js 환경 체크만 함**:
- ✅ `defineConfig`: 순수 함수
- ✅ `getConfig`: 클라이언트/서버 환경 분리 (Next.js 불필요)
- ✅ `loadConfig`: Node.js 환경 체크만 (Next.js 불필요)

#### 2.4 브랜딩 시스템

**순수 React Context**:
- ✅ `BrandingProvider`: 순수 React Context
- ✅ `useBranding`, `useBrandingColor`: 순수 React hooks
- ✅ `generateCSSVariables`: 순수 함수
- ⚠️ `suppressHydrationWarning`: Next.js prop이지만 React에서도 작동 (경고만 무시)

#### 2.5 i18n 시스템

**순수 React + Zustand**:
- ✅ `createI18nStore`: Zustand 기반
- ✅ `createZustandI18n`: Zustand 기반
- ✅ `useTranslation`: 순수 React hook

#### 2.6 Motion 시스템

**순수 React hooks**:
- ✅ 모든 motion hooks: 순수 React
- ✅ `useMotion`: 순수 React hook

#### 2.7 UI 컴포넌트

**순수 React 컴포넌트**:
- ✅ `@hua-labs/ui` 패키지: 순수 React
- ✅ 모든 UI 컴포넌트: Next.js 불필요

#### 2.8 GEO 모듈

**순수 함수들**:
- ✅ `generateGEOMetadata`: 순수 함수
- ✅ `generateSoftwareApplicationLD`: 순수 함수
- ✅ `generateFAQPageLD`: 순수 함수
- ✅ `renderJSONLD`: 순수 함수 (Next.js Script 불필요)

#### 2.9 Loading 모듈

**순수 React**:
- ✅ `Skeleton`, `SkeletonGroup`: 순수 React 컴포넌트
- ✅ `SuspenseWrapper`: 순수 React (React Suspense 사용)
- ✅ `withSuspense`: 순수 React HOC

---

## 🛠️ CRA/Vite 지원을 위한 수정 사항

### 필수 수정 (1개)

#### 1. `generatePageMetadata` 조건부 처리

**현재 코드**:
```typescript
import type { Metadata } from 'next';

export function generatePageMetadata(options: {
  title: string;
  description?: string;
  seo?: SEOConfig;
}): Metadata {
  // ...
}
```

**수정 방안 1: 조건부 타입** (권장)
```typescript
// Next.js가 있으면 Metadata 타입 사용, 없으면 일반 객체
type MetadataType = 
  typeof import('next') extends { Metadata: infer T } ? T
  : {
      title?: string;
      description?: string;
      keywords?: string[];
      openGraph?: any;
      twitter?: any;
    };

export function generatePageMetadata(options: {
  title: string;
  description?: string;
  seo?: SEOConfig;
}): MetadataType {
  // ...
}
```

**수정 방안 2: 별도 함수 추가**
```typescript
// Next.js용
export function generatePageMetadata(options: {...}): Metadata { ... }

// 일반 React용
export function generatePageMetadataForReact(options: {...}): {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: any;
  twitter?: any;
} { ... }
```

---

## 📝 CRA/Vite 사용 가이드 (초안)

### 1. 설치

```bash
# CRA
npx create-react-app my-app --template typescript
cd my-app
npm install @hua-labs/hua-ux zustand

# Vite
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm install @hua-labs/hua-ux zustand
```

### 2. 설정

```tsx
// hua-ux.config.ts
import { defineConfig } from '@hua-labs/hua-ux/framework';

export default defineConfig({
  preset: 'product',
  i18n: {
    defaultLanguage: 'ko',
    supportedLanguages: ['ko', 'en'],
    namespaces: ['common'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
  },
});
```

### 3. App.tsx (CRA) 또는 main.tsx (Vite)

```tsx
// App.tsx (CRA) 또는 main.tsx (Vite)
import { HuaUxLayout } from '@hua-labs/hua-ux/framework';
import { setConfig } from '@hua-labs/hua-ux/framework';
import config from './hua-ux.config';

// 설정 명시적으로 로드
setConfig(config);

function App() {
  return (
    <HuaUxLayout>
      <div className="App">
        <h1>My App</h1>
      </div>
    </HuaUxLayout>
  );
}

export default App;
```

### 4. 페이지 컴포넌트

```tsx
// HomePage.tsx
import { HuaUxPage } from '@hua-labs/hua-ux/framework';
import { Button, Card } from '@hua-labs/hua-ux';
import { useTranslation } from '@hua-labs/i18n-core';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <HuaUxPage title="Home" description="Welcome">
      <Card>
        <h1>{t('common:welcome')}</h1>
        <Button>Get Started</Button>
      </Card>
    </HuaUxPage>
  );
}
```

### 5. SEO 메타데이터 (CRA/Vite)

**CRA/Vite에서는 React Helmet 사용**:
```tsx
import { Helmet } from 'react-helmet-async';
import { generateGEOMetadata, renderJSONLD } from '@hua-labs/hua-ux/framework';

export default function HomePage() {
  const geoMeta = generateGEOMetadata({
    name: 'My App',
    description: 'Built with hua-ux',
  });

  return (
    <>
      <Helmet>
        {geoMeta.meta.map((meta) => (
          <meta key={meta.name} name={meta.name} content={meta.content} />
        ))}
        {geoMeta.openGraph?.map((og) => (
          <meta key={og.property} property={og.property} content={og.content} />
        ))}
      </Helmet>
      <script
        {...renderJSONLD(geoMeta.jsonLd[0])}
      />
      <main>...</main>
    </>
  );
}
```

---

## ✅ 지원 가능한 기능 목록

### 완전 지원 (Next.js 불필요)

1. ✅ **컴포넌트 시스템**
   - `HuaUxLayout`
   - `HuaUxPage`
   - `ErrorBoundary`
   - `BrandedButton`, `BrandedCard`
   - 모든 UI 컴포넌트

2. ✅ **Hooks 시스템**
   - 모든 Motion hooks
   - 모든 Accessibility hooks
   - 모든 Loading hooks
   - i18n hooks

3. ✅ **설정 시스템**
   - `defineConfig`
   - `getConfig`
   - `setConfig`
   - `loadConfig` (Node.js 환경에서만)

4. ✅ **브랜딩 시스템**
   - `BrandingProvider`
   - `useBranding`, `useBrandingColor`
   - CSS 변수 생성

5. ✅ **i18n 시스템**
   - `createI18nStore`
   - `createZustandI18n`
   - `useTranslation`

6. ✅ **GEO 모듈**
   - `generateGEOMetadata`
   - 모든 구조화된 데이터 생성기
   - `renderJSONLD` (일반 script 태그로 사용)

7. ✅ **Loading 모듈**
   - `useDelayedLoading`
   - `useLoadingState`
   - `Skeleton`, `SkeletonGroup`
   - `SuspenseWrapper`

### 조건부 지원 (Next.js 있으면 더 나은 기능)

1. ⚠️ **`generatePageMetadata`**
   - Next.js 없이도 사용 가능하지만 타입 에러 발생
   - 수정 필요

2. ✅ **`createI18nMiddleware`**
   - Next.js 없이도 폴백 구현으로 작동
   - CRA/Vite에서는 사용하지 않음 (클라이언트에서 처리)

3. ✅ **`renderJSONLD`**
   - Next.js Script 컴포넌트 없이도 일반 script 태그로 사용 가능

---

## 🎯 구현 우선순위

### Phase 1: 즉시 가능 (수정 없음)

**90% 이상의 기능이 이미 작동**:
- ✅ 모든 컴포넌트
- ✅ 모든 hooks
- ✅ 설정 시스템
- ✅ 브랜딩 시스템
- ✅ i18n 시스템
- ✅ Motion 시스템
- ✅ Loading 모듈
- ✅ Accessibility 모듈

**사용 방법**:
- `generatePageMetadata`만 제외하고 모든 기능 사용 가능
- SEO는 React Helmet 등으로 직접 처리

### Phase 2: 타입 안전성 개선 (권장)

**`generatePageMetadata` 조건부 처리**:
- 조건부 타입으로 Next.js 없이도 타입 에러 없이 사용 가능
- 예상 작업 시간: 1-2시간

### Phase 3: 문서화 (권장)

**CRA/Vite 사용 가이드 추가**:
- README에 CRA/Vite 섹션 추가
- 예제 코드 추가
- 예상 작업 시간: 2-3시간

---

## 📊 지원 현황 요약

| 기능 | Next.js 필요 | CRA/Vite 지원 | 비고 |
|------|-------------|--------------|------|
| 컴포넌트 시스템 | ❌ | ✅ | 완전 지원 |
| Hooks 시스템 | ❌ | ✅ | 완전 지원 |
| 설정 시스템 | ❌ | ✅ | 완전 지원 |
| 브랜딩 시스템 | ❌ | ✅ | 완전 지원 |
| i18n 시스템 | ❌ | ✅ | 완전 지원 |
| Motion 시스템 | ❌ | ✅ | 완전 지원 |
| Loading 모듈 | ❌ | ✅ | 완전 지원 |
| Accessibility 모듈 | ❌ | ✅ | 완전 지원 |
| GEO 모듈 | ❌ | ✅ | 완전 지원 |
| `generatePageMetadata` | ⚠️ | ⚠️ | 타입 수정 필요 |
| `createI18nMiddleware` | ⚠️ | ✅ | 폴백 구현 있음 |
| `renderJSONLD` | ❌ | ✅ | 일반 script로 사용 가능 |

---

## 🚀 결론

### ✅ **CRA/Vite 지원 가능!**

**현재 상태**:
- ✅ **90% 이상의 기능이 이미 작동**
- ⚠️ **1개 기능만 타입 수정 필요** (`generatePageMetadata`)
- ✅ **`next`가 이미 optional peer dependency**

**권장 사항**:
1. ✅ **즉시 사용 가능**: `generatePageMetadata` 제외하고 모든 기능 사용
2. 🥇 **타입 안전성 개선**: `generatePageMetadata` 조건부 타입 처리 (1-2시간)
3. 🥈 **문서화**: CRA/Vite 사용 가이드 추가 (2-3시간)

**시장 확장 가능성**:
- CRA/Vite 지원으로 시장 확장 가능
- Next.js 사용자뿐만 아니라 일반 React 사용자도 타겟 가능
- 더 넓은 사용자 기반 확보

---

**작성일**: 2025-12-29  
**작성자**: HUA Platform 개발팀
