# 시각적 가이드 - hua-i18n-sdk

> **v1.2.0** - 스크린샷과 예제로 배우는 hua-i18n-sdk

## 📋 목차

- [빠른 시작](#빠른-시작)
- [CLI 도구 사용법](#cli-도구-사용법)
- [간단한 API 사용법](#간단한-api-사용법)
- [고급 설정](#고급-설정)
- [디버깅 도구](#디버깅-도구)
- [실제 예제](#실제-예제)

---

## 빠른 시작

### 1단계: 설치

```bash
npm install hua-i18n-sdk
```

### 2단계: 한 줄 설정

```tsx
// app/layout.tsx (Next.js App Router)
import { createI18nApp } from 'hua-i18n-sdk';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {createI18nApp()({ children })}
      </body>
    </html>
  );
}
```

### 3단계: 번역 사용

```tsx
// components/MyComponent.tsx
import { useTranslation } from 'hua-i18n-sdk';

export function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.greeting')}</p>
    </div>
  );
}
```

**결과:**
```
환영합니다
안녕하세요
```

---

## CLI 도구 사용법

### 기본 설정

```bash
npx hua-i18n-sdk init
```

**터미널 출력:**
```
🚀 Initializing hua-i18n-sdk...

? What type of project are you setting up? 
  ❯ Next.js
    Create React App
    Vite
    Other React project

? What is your default language? ko

? What is your fallback language? en

? Create sample translation files? Yes

📝 Creating configuration for nextjs...
✅ Created lib/i18n-config.ts
✅ Updated app/layout.tsx
✅ Created components/I18nProvider.tsx

📝 Creating translation files...
✅ Created translations/ko/common.json
✅ Created translations/en/common.json
✅ Created translations/README.md

✅ hua-i18n-sdk setup completed successfully!

Next steps:
1. Install the SDK: npm install hua-i18n-sdk
2. Import and use in your components
3. Check the generated configuration files

For more information, visit: https://github.com/HUA-Labs/i18n-sdk
```

### 자동 모드

```bash
npx hua-i18n-sdk init --yes
```

**터미널 출력:**
```
🚀 Initializing hua-i18n-sdk...

Auto-detected project type: nextjs

📝 Creating configuration for nextjs...
✅ Created lib/i18n-config.ts
✅ Updated app/layout.tsx
✅ Created components/I18nProvider.tsx

📝 Creating translation files...
✅ Created translations/ko/common.json
✅ Created translations/en/common.json
✅ Created translations/README.md

✅ hua-i18n-sdk setup completed successfully!
```

### 프로젝트별 설정

```bash
# Next.js 프로젝트
npx hua-i18n-sdk init --nextjs

# Create React App 프로젝트
npx hua-i18n-sdk init --cra

# Vite 프로젝트
npx hua-i18n-sdk init --vite
```

---

## 간단한 API 사용법

### 기본 사용법

```tsx
import { createI18nApp } from 'hua-i18n-sdk';

// 기본 설정 (한국어 기본, 영어 폴백)
const I18nApp = createI18nApp();

export default function Layout({ children }) {
  return <I18nApp>{children}</I18nApp>;
}
```

### 언어 지정

```tsx
import { createI18nApp } from 'hua-i18n-sdk';

// 영어를 기본 언어로 설정
const I18nApp = createI18nApp({ defaultLanguage: 'en' });

export default function Layout({ children }) {
  return <I18nApp>{children}</I18nApp>;
}
```

### 디버그 모드

```tsx
import { createI18nApp } from 'hua-i18n-sdk';

// 디버그 모드 활성화
const I18nApp = createI18nApp({ debug: true });

export default function Layout({ children }) {
  return <I18nApp>{children}</I18nApp>;
}
```

**디버그 모드에서 누락된 키:**
```
[MISSING: common.unknown_key]
```

---

## 고급 설정

### 커스텀 설정

```tsx
import { createI18nConfig, I18nProvider } from 'hua-i18n-sdk';

const config = createI18nConfig({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  ],
  namespaces: ['common', 'auth', 'dashboard'],
  loadTranslations: async (language: string, namespace: string) => {
    const module = await import(`../translations/${language}/${namespace}.json`);
    return module.default;
  },
  debug: process.env.NODE_ENV === 'development',
  cacheOptions: {
    maxSize: 100,
    ttl: 300000, // 5분
  },
});

export default function Layout({ children }) {
  return <I18nProvider config={config}>{children}</I18nProvider>;
}
```

### 언어 전환기

```tsx
import { useLanguageChange } from 'hua-i18n-sdk';

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
      className="language-selector"
    >
      {supportedLanguages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}
```

**UI 예시:**
```
[한국어 ▼]
├── 한국어
├── English
└── 日本語
```

---

## 디버깅 도구

### 시각적 디버깅

개발 모드에서 번역된 텍스트가 하이라이트됩니다:

```tsx
// 개발 모드에서만 활성화
<div className="i18n-debug-highlight">
  환영합니다  {/* 하이라이트 표시 */}
</div>
```

### 개발자 패널

개발 모드에서 브라우저 하단에 디버그 패널이 표시됩니다:

```
[I18n Debug Panel]
├── Current Language: ko
├── Loaded Namespaces: common, auth
├── Cache Size: 15/100
├── Missing Keys: 2
└── Performance: 12ms avg
```

### 콘솔 로그

```javascript
// 누락된 키 경고
[I18n] Missing translation key: common.unknown_key

// 성능 정보
[I18n] Translation loaded: ko:common in 45ms

// 에러 정보
[I18n] Failed to load translations for ja:common
```

---

## 실제 예제

### Next.js App Router

**파일 구조:**
```
app/
├── layout.tsx
├── page.tsx
└── globals.css
components/
├── Header.tsx
├── Footer.tsx
└── LanguageSwitcher.tsx
lib/
└── i18n-config.ts
translations/
├── ko/
│   └── common.json
└── en/
    └── common.json
```

**app/layout.tsx:**
```tsx
import { createI18nApp } from 'hua-i18n-sdk';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {createI18nApp()({ children })}
      </body>
    </html>
  );
}
```

**app/page.tsx:**
```tsx
import { useTranslation } from 'hua-i18n-sdk';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="app">
      <Header />
      <main>
        <h1>{t('common.welcome')}</h1>
        <p>{t('common.description')}</p>
      </main>
      <Footer />
    </div>
  );
}
```

**components/Header.tsx:**
```tsx
import { useTranslation } from 'hua-i18n-sdk';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  const { t } = useTranslation();
  
  return (
    <header className="header">
      <div className="logo">
        <h2>{t('common.app_name')}</h2>
      </div>
      <nav>
        <a href="/">{t('common.home')}</a>
        <a href="/about">{t('common.about')}</a>
        <a href="/contact">{t('common.contact')}</a>
      </nav>
      <LanguageSwitcher />
    </header>
  );
}
```

### Create React App

**src/App.tsx:**
```tsx
import React from 'react';
import { createI18nApp } from 'hua-i18n-sdk';
import { Header } from './components/Header';
import { Main } from './components/Main';
import './App.css';

const I18nApp = createI18nApp();

function App() {
  return (
    <I18nApp>
      <div className="App">
        <Header />
        <Main />
      </div>
    </I18nApp>
  );
}

export default App;
```

**src/components/Main.tsx:**
```tsx
import React from 'react';
import { useTranslation } from 'hua-i18n-sdk';

export function Main() {
  const { t } = useTranslation();
  
  return (
    <main className="main">
      <section className="hero">
        <h1>{t('common.welcome')}</h1>
        <p>{t('common.subtitle')}</p>
        <button>{t('common.get_started')}</button>
      </section>
      
      <section className="features">
        <h2>{t('common.features')}</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>{t('common.feature_1_title')}</h3>
            <p>{t('common.feature_1_desc')}</p>
          </div>
          <div className="feature">
            <h3>{t('common.feature_2_title')}</h3>
            <p>{t('common.feature_2_desc')}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### Vite

**src/main.tsx:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createI18nApp } from 'hua-i18n-sdk';
import App from './App.tsx';
import './index.css';

const I18nApp = createI18nApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nApp>
      <App />
    </I18nApp>
  </React.StrictMode>,
);
```

---

## 번역 파일 예제

### 기본 번역 파일

**translations/ko/common.json:**
```json
{
  "welcome": "환영합니다",
  "greeting": "안녕하세요",
  "goodbye": "안녕히 가세요",
  "app_name": "HUA i18n SDK",
  "home": "홈",
  "about": "소개",
  "contact": "연락처",
  "description": "React와 Next.js를 위한 강력한 국제화 SDK",
  "subtitle": "간단하고 빠른 다국어 지원",
  "get_started": "시작하기",
  "features": "주요 기능",
  "feature_1_title": "간단한 설정",
  "feature_1_desc": "한 줄로 완벽한 i18n 설정",
  "feature_2_title": "타입 안전성",
  "feature_2_desc": "TypeScript로 완벽한 타입 지원",
  "loading": "로딩 중...",
  "error": "오류가 발생했습니다",
  "success": "성공했습니다"
}
```

**translations/en/common.json:**
```json
{
  "welcome": "Welcome",
  "greeting": "Hello",
  "goodbye": "Goodbye",
  "app_name": "HUA i18n SDK",
  "home": "Home",
  "about": "About",
  "contact": "Contact",
  "description": "Powerful internationalization SDK for React and Next.js",
  "subtitle": "Simple and fast multi-language support",
  "get_started": "Get Started",
  "features": "Key Features",
  "feature_1_title": "Simple Setup",
  "feature_1_desc": "Perfect i18n setup in one line",
  "feature_2_title": "Type Safety",
  "feature_2_desc": "Perfect TypeScript support",
  "loading": "Loading...",
  "error": "An error occurred",
  "success": "Success"
}
```

### 네임스페이스 분리

**translations/ko/auth.json:**
```json
{
  "login": "로그인",
  "logout": "로그아웃",
  "register": "회원가입",
  "email": "이메일",
  "password": "비밀번호",
  "forgot_password": "비밀번호 찾기",
  "remember_me": "로그인 상태 유지",
  "login_success": "로그인되었습니다",
  "login_error": "로그인에 실패했습니다"
}
```

**translations/en/auth.json:**
```json
{
  "login": "Login",
  "logout": "Logout",
  "register": "Register",
  "email": "Email",
  "password": "Password",
  "forgot_password": "Forgot Password",
  "remember_me": "Remember Me",
  "login_success": "Successfully logged in",
  "login_error": "Login failed"
}
```

---

## 성능 최적화

### 번들 크기 비교

```
hua-i18n-sdk (전체): ~45KB
├── Core: ~15KB
├── Hooks: ~8KB
├── Utils: ~5KB
└── Types: ~2KB

Tree-shaking 후: ~20KB
```

### 캐싱 효과

```
첫 번째 로드: 150ms
캐시된 로드: 5ms
성능 향상: 97%
```

### 메모리 사용량

```
기본 설정: ~2MB
캐시 활성화: ~5MB
대용량 번역: ~15MB
```

---

## 문제 해결

### 일반적인 문제들

1. **번역이 나오지 않음**
   - Provider가 올바르게 설정되었는지 확인
   - 번역 파일 경로 확인
   - 디버그 모드 활성화

2. **TypeScript 에러**
   - 타입 정의 설치 확인
   - tsconfig.json 설정 확인

3. **성능 문제**
   - 캐싱 활성화
   - 불필요한 리렌더링 확인
   - 번들 크기 최적화

### 디버그 모드 활용

```tsx
// 개발 모드에서만 활성화
const config = createI18nConfig({
  debug: process.env.NODE_ENV === 'development',
  // ... 기타 설정
});
```

**디버그 정보:**
```
[I18n Debug]
├── Current Language: ko
├── Loaded Namespaces: common, auth
├── Cache Hit Rate: 85%
├── Missing Keys: 3
└── Performance: 8ms avg
```

---

## 추가 리소스

### 공식 문서
- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [FAQ](./FAQ.md)
- [환경별 가이드](./ENVIRONMENT_GUIDES.md)

### 예제 프로젝트
- [Next.js 예제](../examples/nextjs-basic/)
- [Create React App 예제](../examples/cra-basic/)
- [Vite 예제](../examples/vite-basic/)

### 커뮤니티
- [GitHub Issues](https://github.com/HUA-Labs/i18n-sdk/issues)
- [GitHub Discussions](https://github.com/HUA-Labs/i18n-sdk/discussions)

---

**더 많은 예제와 도움이 필요하시면 GitHub를 방문해주세요!** 🚀 