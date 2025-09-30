# 환경별 가이드 - hua-i18n-sdk

> **v1.2.0** - 지원 환경 및 설정 가이드

## 📋 목차

- [지원 환경 개요](#지원-환경-개요)
- [Next.js 가이드](#nextjs-가이드)
- [Create React App 가이드](#create-react-app-가이드)
- [Vite 가이드](#vite-가이드)
- [Webpack 가이드](#webpack-가이드)
- [기타 환경](#기타-환경)
- [지원 범위](#지원-범위)

---

## 지원 환경 개요

### ✅ 완전 지원

| 환경 | 클라이언트 | 서버 | SSR | SSG | 정적 사이트 |
|------|------------|------|-----|-----|-------------|
| **Next.js** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create React App** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Vite** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Webpack** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gatsby** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Remix** | ✅ | ✅ | ✅ | ✅ | ✅ |

### ⚠️ 부분 지원

| 환경 | 클라이언트 | 서버 | SSR | SSG | 정적 사이트 |
|------|------------|------|-----|-----|-------------|
| **React Native** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Electron** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Deno** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ |

### ❌ 미지원

| 환경 | 클라이언트 | 서버 | SSR | SSG | 정적 사이트 |
|------|------------|------|-----|-----|-------------|
| **Vue.js** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Angular** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Svelte** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Next.js 가이드

### 지원 버전
- **Next.js 13+** (App Router)
- **Next.js 12+** (Pages Router)
- **Next.js 11+** (기본 지원)

### 기능별 지원

#### ✅ 완전 지원
- **클라이언트 컴포넌트** - 모든 기능
- **서버 컴포넌트** - `serverTranslate()` 사용
- **정적 생성 (SSG)** - 빌드 타임 번역
- **서버 사이드 렌더링 (SSR)** - 런타임 번역
- **API 라우트** - 서버에서 번역
- **미들웨어** - 언어 감지

#### ⚠️ 제한사항
- **동적 임포트** - `serverTranslate()` 사용 권장
- **번들 크기** - Tree-shaking으로 최적화

### 설정 예제

```tsx
// app/layout.tsx (App Router)
import { I18nProvider } from 'hua-i18n-sdk';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx (서버 컴포넌트)
import { serverTranslate } from 'hua-i18n-sdk';

export default function Page() {
  const translations = {
    ko: { common: { welcome: "환영합니다" } },
    en: { common: { welcome: "Welcome" } }
  };
  
  const title = serverTranslate({
    translations,
    key: 'common.welcome',
    language: 'ko'
  });
  
  return <h1>{title}</h1>;
}
```

---

## Create React App 가이드

### 지원 버전
- **CRA 5+** (React 18+)
- **CRA 4+** (React 17+)

### 기능별 지원

#### ✅ 완전 지원
- **클라이언트 컴포넌트** - 모든 기능
- **React Hooks** - 완벽 지원
- **TypeScript** - 완벽 지원

#### ❌ 미지원
- **서버 컴포넌트** - CRA는 클라이언트 전용
- **SSR** - CRA는 SPA
- **SSG** - CRA는 동적 렌더링

### 설정 예제

```tsx
// src/App.tsx
import { I18nProvider } from 'hua-i18n-sdk';

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}
```

---

## Vite 가이드

### 지원 버전
- **Vite 4+** (React 18+)
- **Vite 3+** (React 17+)

### 기능별 지원

#### ✅ 완전 지원
- **클라이언트 컴포넌트** - 모든 기능
- **서버 컴포넌트** - `serverTranslate()` 사용
- **SSR** - Vite SSR 플러그인과 함께
- **SSG** - 정적 사이트 생성

### 설정 예제

```tsx
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  ssr: {
    // SSR 설정
  }
});
```

---

## Webpack 가이드

### 지원 버전
- **Webpack 5+** (권장)
- **Webpack 4+** (기본 지원)

### 기능별 지원

#### ✅ 완전 지원
- **클라이언트 번들링** - 모든 기능
- **서버 번들링** - Node.js 환경
- **Tree-shaking** - 최적화 지원

### 설정 예제

```js
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  }
};
```

---

## 기타 환경

### Gatsby
- **완전 지원** - 모든 기능
- **SSG** - 빌드 타임 번역
- **SSR** - 런타임 번역

### Remix
- **완전 지원** - 모든 기능
- **서버 컴포넌트** - `serverTranslate()` 사용
- **SSR** - 완벽 지원

### React Native
- **클라이언트만 지원** - 서버 기능 없음
- **네이티브 환경** - 일부 제한사항

---

## 지원 범위

### 🌍 언어 지원
- **한국어 (ko)** - 기본 지원
- **영어 (en)** - 기본 지원
- **기타 언어** - 사용자 정의 가능

### 🔧 기능 지원

#### 클라이언트 기능
- ✅ 언어 전환
- ✅ 동적 번역
- ✅ 타입 안전성
- ✅ 에러 처리
- ✅ 캐싱

#### 서버 기능
- ✅ 서버 컴포넌트
- ✅ SSR
- ✅ SSG
- ✅ API 라우트

#### 개발 도구
- ✅ TypeScript 지원
- ✅ 디버깅 모드
- ✅ 성능 모니터링
- ✅ 에러 로깅

### 📦 번들 크기

| 환경 | 기본 번들 | Tree-shaking 후 |
|------|-----------|-----------------|
| **클라이언트** | ~15KB | ~8KB |
| **서버** | ~12KB | ~6KB |
| **전체** | ~25KB | ~12KB |

### ⚡ 성능

| 기능 | 로딩 시간 | 메모리 사용량 |
|------|-----------|---------------|
| **초기 로딩** | < 50ms | < 1MB |
| **언어 전환** | < 10ms | < 0.1MB |
| **캐시 히트** | < 1ms | - |

---

## 마이그레이션 가이드

### 다른 i18n 라이브러리에서

#### react-i18next → hua-i18n-sdk
```tsx
// 기존
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();

// 변경
import { useTranslation } from 'hua-i18n-sdk';
const { t } = useTranslation();
```

#### next-intl → hua-i18n-sdk
```tsx
// 기존
import { useTranslations } from 'next-intl';
const t = useTranslations('common');

// 변경
import { useTranslation } from 'hua-i18n-sdk';
const { t } = useTranslation();
```

### 환경별 마이그레이션

#### Next.js Pages → App Router
```tsx
// 기존 (Pages Router)
// pages/_app.tsx
export default function App({ Component, pageProps }) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  );
}

// 변경 (App Router)
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

---

## 문제 해결

### 자주 발생하는 문제

#### Q: Next.js에서 동적 임포트 경고가 나와요
A: `serverTranslate()` 함수를 사용하세요. 동적 임포트 없이 작동합니다.

#### Q: CRA에서 서버 컴포넌트를 사용할 수 있나요?
A: CRA는 클라이언트 전용이므로 서버 컴포넌트를 지원하지 않습니다.

#### Q: 번들 크기가 너무 커요
A: Tree-shaking을 활용하고 필요한 기능만 import하세요.

#### Q: 타입 에러가 발생해요
A: TypeScript 설정을 확인하고 타입 정의를 업데이트하세요.

---

## 추가 리소스

- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [개선 계획](./IMPROVEMENT_PLAN.md)
- [변경 로그](./CHANGELOG.md)
- [GitHub 저장소](https://github.com/HUA-Labs/i18n-sdk)
