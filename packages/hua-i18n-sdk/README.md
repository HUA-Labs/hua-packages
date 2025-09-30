# @hua-labs/i18n-sdk

> **🚨 DEPRECATED: This package is deprecated and will be removed in v2.0.0**

## 🔄 Migration Required

This package has been split into domain-specific packages for better maintainability and flexibility.

### 📦 New Packages

| Use Case | New Package | Installation |
|----------|-------------|--------------|
| **Beginner** | `@hua-labs/i18n-beginner` | `npm install @hua-labs/i18n-beginner` |
| **Advanced** | `@hua-labs/i18n-advanced` | `npm install @hua-labs/i18n-advanced` |
| **Core** | `@hua-labs/i18n-core` | `npm install @hua-labs/i18n-core` |
| **AI Features** | `@hua-labs/i18n-ai` | `npm install @hua-labs/i18n-ai` |
| **Debug Tools** | `@hua-labs/i18n-debug` | `npm install @hua-labs/i18n-debug` |
| **Plugins** | `@hua-labs/i18n-plugins` | `npm install @hua-labs/i18n-plugins` |

### 🔄 Quick Migration

**Before:**
```typescript
import { useTranslation } from '@hua-labs/i18n-sdk'
```

**After:**
```typescript
// For beginners
import { useTranslation } from '@hua-labs/i18n-beginner'

// For advanced users
import { useTranslation } from '@hua-labs/i18n-advanced'

// For core functionality
import { useTranslation } from '@hua-labs/i18n-core'
```

### 📚 Migration Guide

- [Complete Migration Guide](./docs/MIGRATION_GUIDE.md)
- [Migration Examples](./docs/MIGRATION_EXAMPLES.md)
- [FAQ](./docs/MIGRATION_FAQ.md)

### ⏰ Timeline

- **v1.2.x**: Deprecation warnings (current)
- **v1.3.x**: Enhanced warnings + migration tools
- **v2.0.0**: Package removal (estimated: Q2 2025)

### 🆘 Need Help?

- [GitHub Issues](https://github.com/HUA-Labs/hua-platform/issues)
- [Migration Support](https://github.com/HUA-Labs/hua-platform/discussions)
- [Community Discord](https://discord.gg/hua-labs)

---

## 📚 문서

각 패키지의 상세한 사용법과 API 문서를 확인하세요:

- [📖 SDK 레퍼런스](./docs/SDK_REFERENCE.md) - 완전한 API 문서
- [🌍 환경별 가이드](./docs/ENVIRONMENT_GUIDES.md) - Next.js, Vite, Webpack 등
- [📋 개선 계획](./docs/IMPROVEMENT_PLAN.md) - 초보자/중급자 개선 및 플러그인 개발
- [📝 변경사항](./docs/CHANGELOG.md) - 버전별 변경사항

## 주요 특징

- **간단한 API**: 직관적이고 사용하기 쉬운 인터페이스
- **초보자 친화적**: `withDefaultConfig()`로 한 줄 설정
- **타입 안전성**: TypeScript로 완전한 타입 지원
- **범용 SSR 지원**: 모든 React 환경에서 서버 컴포넌트 지원
- **강력한 에러 처리**: 자동 재시도, 복구 전략, 사용자 친화적 메시지
- **가벼운 번들**: Tree-shaking 지원으로 최적화된 크기
- **실시간 언어 변경**: 동적 언어 전환 지원
- **개발자 친화적**: 디버그 모드, 누락 키 표시, 상세한 로깅

## 지원 환경

### ✅ 완전 지원
- **Next.js** (App Router, Pages Router) - 모든 기능
- **Create React App** - 클라이언트 기능
- **Vite** - 모든 기능
- **Webpack** - 모든 기능
- **Gatsby** - 모든 기능
- **Remix** - 모든 기능

### ⚠️ 부분 지원
- **React Native** - 클라이언트만
- **Electron** - 클라이언트 + 기본 서버
- **Deno** - 제한적 SSR

### ❌ 미지원
- **Vue.js**, **Angular**, **Svelte** - React 전용

## 서버 컴포넌트 (SSR) - 모든 환경 지원

```tsx
import { serverTranslate } from 'hua-i18n-sdk';

// 🌍 통합 서버 함수 (모든 환경 지원)
export default function ServerComponent() {
  const translations = {
    ko: { common: { welcome: "환영합니다" } },
    en: { common: { welcome: "Welcome" } }
  };
  
  const title = serverTranslate({
    translations,
    key: 'common.welcome',
    language: 'ko',
    // 선택적 옵션들
    options: {
      cache: new Map(), // 캐싱
      metrics: { hits: 0, misses: 0 }, // 성능 메트릭
      debug: true // 디버그 모드
    }
  });
  
  return <h1>{title}</h1>;
}
```

**📝 서버 함수 지원 범위:**

| 환경 | `serverTranslate()` | 특징 |
|------|-------------------|------|
| **Next.js** | ✅ 완벽 | App Router, Pages Router 모두 지원 |
| **Vite** | ✅ 완벽 | SSR, SSG 완벽 지원 |
| **Webpack** | ✅ 완벽 | Node.js 환경 완벽 지원 |
| **CRA** | ❌ 미지원 | 클라이언트 전용 환경 |
| **React Native** | ❌ 미지원 | 서버 환경 없음 |

## 🚀 빠른 시작

### 1. 설치

```bash
npm install @hua-labs/i18n-sdk
# 또는
yarn add @hua-labs/i18n-sdk
# 또는
pnpm add @hua-labs/i18n-sdk
```

### 2. 번역 파일 생성

**기본 구조 (권장)**
```
your-project/
├── translations/          # 기본 경로
│   ├── ko/
│   │   └── common.json
│   └── en/
│       └── common.json
```

**`translations/ko/common.json`**
```json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요"
}
```

### 3. Provider 설정

**가장 간단한 방법**
```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common']
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
```

### 4. 번역 사용

```tsx
import { useTranslation } from '@hua-labs/i18n-sdk/beginner'

export default function HomePage() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.hello')}</p>
    </div>
  )
}
```

**🎉 완료!** 이제 한국어/영어 번역이 자동으로 작동합니다!

---

## 🎯 프레임워크별 설정

### Next.js (App Router)

**Next.js App Router**를 사용하는 경우, 번역 파일을 `src/app/translations/`에 두고 싶다면 커스텀 로더가 필요합니다.

```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

// Next.js App Router에 맞는 커스텀 로더
const customLoader = async (language: string, namespace: string) => {
  try {
    const module = await import(`../translations/${language}/${namespace}.json`)
    return module.default || module
  } catch (error) {
    return {}
  }
}

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  loadTranslations: customLoader  // 커스텀 로더 사용
})
```

### Create React App (CRA)

**CRA**에서는 `public/locales/` 폴더를 사용하는 것이 일반적입니다.

```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

// CRA에 맞는 커스텀 로더
const customLoader = async (language: string, namespace: string) => {
  try {
    const module = await import(`/locales/${language}/${namespace}.json`)
    return module.default || module
  } catch (error) {
    return {}
  }
}

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  loadTranslations: customLoader
})
```

### Vite

**Vite**에서도 `public/locales/` 폴더를 사용할 수 있습니다.

```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

// Vite에 맞는 커스텀 로더
const customLoader = async (language: string, namespace: string) => {
  try {
    const module = await import(`/locales/${language}/${namespace}.json`)
    return module.default || module
  } catch (error) {
    return {}
  }
}

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  loadTranslations: customLoader
})
```

## 번역 파일 구조

```text
translations/
├── ko/
│   ├── common.json
│   └── auth.json
└── en/
    ├── common.json
    └── auth.json
```

### 번역 파일 예시

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "greeting": "안녕하세요, {{name}}님!",
  "buttons": {
    "save": "저장",
    "cancel": "취소"
  }
}
```

```json
// translations/en/common.json
{
  "welcome": "Welcome",
  "greeting": "Hello, {{name}}!",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel"
  }
}
```

## withDefaultConfig() 옵션

```tsx
export const I18nProvider = withDefaultConfig({
  // 기본 언어 (기본값: 'ko')
  defaultLanguage: 'en',
  
  // 폴백 언어 (기본값: 'en')
  fallbackLanguage: 'ko',
  
  // 네임스페이스 (기본값: ['common'])
  namespaces: ['common', 'auth', 'dashboard'],
  
  // 디버그 모드 (기본값: NODE_ENV === 'development')
  debug: true,
  
  // 자동 언어 전환 이벤트 처리 (기본값: true)
  // 이벤트 리스너 자동 등록: huaI18nLanguageChange, i18nLanguageChanged
  // 브라우저 언어 변경이나 외부 언어 전환 이벤트를 자동으로 감지
  autoLanguageSync: true,
});
```

### autoLanguageSync 옵션 상세 설명

`autoLanguageSync` 옵션은 언어 전환 이벤트를 자동으로 감지하고 처리합니다:

```tsx
// 자동으로 감지하는 이벤트들
window.addEventListener('huaI18nLanguageChange', (event) => {
  // SDK 내부 언어 변경 이벤트
  const newLanguage = event.detail;
});

window.addEventListener('i18nLanguageChanged', (event) => {
  // 일반적인 언어 변경 이벤트
  const newLanguage = event.detail;
});
```

**사용 예시:**

```tsx
// 다른 컴포넌트에서 언어 변경 시
const changeLanguage = (language) => {
  // 이벤트 발생 → withDefaultConfig()가 자동으로 감지
  window.dispatchEvent(new CustomEvent('i18nLanguageChanged', { 
    detail: language 
  }));
};
```

## 고급 기능

### 언어 변경

```tsx
import { useLanguageChange } from 'hua-i18n-sdk';

function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageChange();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value)}
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

### 타입 안전한 번역

```tsx
interface MyTranslations {
  common: {
    welcome: string;
    greeting: string;
  };
  auth: {
    login: string;
    logout: string;
  };
}

const { t } = useI18n<MyTranslations>();

// 자동완성 지원
t('common.welcome'); // ✅ 타입 안전
t('common.invalid'); // ❌ 타입 에러
```

## 에러 처리 (v1.1.0)

### 자동 재시도 및 복구

```tsx
const config = {
  // ... 기본 설정
  errorHandling: {
    recoveryStrategy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
      shouldRetry: (error) => ['NETWORK_ERROR', 'LOAD_FAILED'].includes(error.code),
      onRetry: (error, attempt) => console.log(`재시도 ${attempt}회:`, error.message),
      onMaxRetriesExceeded: (error) => alert('번역 데이터를 불러올 수 없습니다')
    },
    logging: {
      enabled: true,
      level: 'error',
      includeStack: true,
      includeContext: true
    },
    userFriendlyMessages: true
  }
};
```

### 커스텀 에러 처리

```tsx
import { createTranslationError, logTranslationError } from 'hua-i18n-sdk';

try {
  // 번역 로딩
} catch (error) {
  const translationError = createTranslationError(
    'LOAD_FAILED',
    error.message,
    error,
    { language: 'ko', namespace: 'common' }
  );
  
  logTranslationError(translationError);
}
```

## 마이그레이션 (v1.0.x → v1.1.0)

**✅ 기존 코드는 변경 없이 동작합니다**

```tsx
// v1.0.x 코드 (그대로 동작)
const config: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common'],
  loadTranslations: async (language, namespace) => {
    const module = await import(`./translations/${language}/${namespace}.json`);
    return module.default;
  },
};

// v1.1.0에서도 동일하게 동작
```

### 새로운 기능 활용 (선택사항)

```tsx
// v1.1.0: 에러 처리 강화 (선택적)
const config: I18nConfig = {
  // ... 기존 설정
  errorHandling: {
    recoveryStrategy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2
    },
    logging: { enabled: true, level: 'error' },
    userFriendlyMessages: true
  }
};
```

## 문서

- [SDK 레퍼런스](./docs/SDK_REFERENCE.md) - 완전한 API 문서
- [변경 로그](./docs/CHANGELOG.md) - 버전별 변경사항
- [환경 설정 가이드](./docs/ENVIRONMENT_GUIDES.md) - 다양한 환경 설정
- [환경별 예제](./docs/ENVIRONMENT_EXAMPLES.md) - 환경별 설정 예제
- [기여 가이드](./CONTRIBUTING.md) - 프로젝트 기여 방법

## 테스트

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 빌드

```bash
npm run build
```

## 기여하기

프로젝트에 기여하고 싶으시다면 [기여 가이드](./CONTRIBUTING.md)를 참고해주세요.

### 개발 환경 설정

```bash
git clone https://github.com/HUA-Labs/i18n-sdk.git
cd hua-i18n-sdk
npm install
npm run dev
```

## 라이선스

이 프로젝트는 [MIT 라이선스](./LICENSE) 하에 배포됩니다.

## 감사의 말

- [React](https://reactjs.org/) - 멋진 UI 라이브러리
- [TypeScript](https://www.typescriptlang.org/) - 타입 안전성
- [Next.js](https://nextjs.org/) - SSR 지원
- 모든 기여자분들께 감사드립니다!

---

> **Made with ❤️ by the hua-i18n-sdk team**
