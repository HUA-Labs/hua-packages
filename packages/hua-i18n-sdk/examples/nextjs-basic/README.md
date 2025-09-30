# Next.js Basic Example

이 예제는 `hua-i18n-sdk`를 Next.js 프로젝트에 통합하는 방법을 보여줍니다.

## 🚀 빠른 시작

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 📁 프로젝트 구조

```text
├── app/
│   ├── layout.tsx          # I18nProvider 설정
│   ├── page.tsx            # 메인 페이지 (SSR 예제)
│   ├── client-page.tsx     # 클라이언트 컴포넌트 예제
│   └── globals.css
├── components/
│   ├── LanguageSwitcher.tsx    # 언어 전환 컴포넌트
│   └── TranslationDemo.tsx     # 번역 데모 컴포넌트
├── translations/           # 번역 파일들
│   ├── ko/
│   │   ├── common.json
│   │   └── demo.json
│   └── en/
│       ├── common.json
│       └── demo.json
└── lib/
    └── i18n-config.ts     # i18n 설정
```

## 🎯 주요 기능

### 1. SSR/CSR 지원

- **서버 컴포넌트**: `ssrTranslate()` 사용
- **클라이언트 컴포넌트**: `useTranslation()` 훅 사용

### 2. 언어 전환

- 실시간 언어 변경
- URL 파라미터 기반 언어 감지
- 브라우저 언어 자동 감지

### 3. Fallback 지원

- 번역 키가 없을 때 fallback 언어 사용
- 네임스페이스별 fallback

### 4. 타입 안전성

- TypeScript로 번역 키 자동완성
- 타입 체크 지원

## 🔧 설정 방법

### 1. I18nProvider 설정

```tsx
// app/layout.tsx
import { I18nProvider } from 'hua-i18n-sdk';
import { i18nConfig } from '@/lib/i18n-config';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <I18nProvider config={i18nConfig}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
```

### 2. 번역 파일 구조

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "language": "언어",
  "switchLanguage": "언어 변경"
}

// translations/en/common.json
{
  "welcome": "Welcome",
  "language": "Language",
  "switchLanguage": "Switch Language"
}
```

### 3. 사용 예제

#### 서버 컴포넌트 (SSR)

```tsx
import { ssrTranslate } from 'hua-i18n-sdk';
import translations from '@/translations';

export default function ServerPage() {
  const title = ssrTranslate({
    translations,
    key: 'common.welcome',
    language: 'ko',
  });

  return <h1>{title}</h1>;
}
```

#### 클라이언트 컴포넌트 (CSR)

```tsx
'use client';
import { useTranslation } from 'hua-i18n-sdk';

export default function ClientPage() {
  const { t } = useTranslation();

  return <h1>{t('common.welcome')}</h1>;
}
```

## 🧪 테스트

```bash
# 타입 체크
npm run type-check

# 빌드 테스트
npm run build
```

## 📚 추가 학습

- [SDK 문서](../../README.md)
- [API Reference](../../README.md#api-참조)
- [고급 사용법](../../README.md#고급-사용법)
