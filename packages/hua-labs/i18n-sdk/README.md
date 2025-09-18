# 🦋 HUA i18n SDK

> **"복사해서 붙여넣기만 하면 바로 사용할 수 있는"** 초보자 친화적 React i18n SDK

[![npm version](https://badge.fury.io/js/@hua-labs%2Fi18n-sdk.svg)](https://badge.fury.io/js/@hua-labs%2Fi18n-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## ✨ 특징

- 🚀 **초보자 친화적** - 복사해서 붙여넣기만 하면 바로 사용
- 🎯 **프레임워크 자동 감지** - Next.js, CRA, Vite 등 자동 인식
- 🧠 **스마트 로더** - 번역 파일 경로 자동 탐색
- 💬 **개발자 친화적 에러** - 문제 해결 가이드 제공
- 📱 **모드별 진입점** - 초보자부터 전문가까지
- 🔧 **TypeScript 지원** - 완전한 타입 안전성

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

```
your-project/
├── src/
│   └── app/
│       └── translations/
│           ├── ko/
│           │   └── common.json
│           └── en/
│               └── common.json
```

**`src/app/translations/ko/common.json`**
```json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요"
}
```

### 3. Provider 설정

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

## 🎯 모드별 진입점

### 🌱 초보자 모드 (Beginner)

**가장 간단한 시작점**

```tsx
import { createBeginnerI18n, useTranslation } from '@hua-labs/i18n-sdk/beginner'

// 프레임워크 자동 감지 + 스마트 로더
const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home']
})
```

**특징:**
- ✅ 프레임워크 자동 감지 (Next.js, CRA, Vite 등)
- ✅ 스마트 번역 파일 탐색
- ✅ 개발자 친화적 에러 메시지
- ✅ 기본 번역 제공

### 🚀 고급 모드 (Advanced)

**성능 최적화 + 모니터링**

```tsx
import { createAdvancedI18n } from '@hua-labs/i18n-sdk/advanced'

const I18nProvider = createAdvancedI18n({
  enablePerformanceMonitoring: true,
  enableAutoOptimization: true,
  enableAnalytics: true
})
```

### 🔧 코어 모드 (Core)

**완전한 제어권**

```tsx
import { createCoreI18n } from '@hua-labs/i18n-sdk/core'

const I18nProvider = createCoreI18n({
  loadTranslations: customLoader,
  cacheOptions: { maxSize: 1000 },
  performanceOptions: { preloadAll: true }
})
```

### 🐛 디버그 모드 (Debug)

**개발 도구**

```tsx
import { createDebugI18n } from '@hua-labs/i18n-sdk/debug'

const I18nProvider = createDebugI18n({
  enableTranslationInspector: true,
  enablePerformanceProfiling: true
})
```

### 🔌 플러그인 모드 (Plugins)

**확장 가능한 구조**

```tsx
import { createPluginI18n } from '@hua-labs/i18n-sdk/plugins'

const I18nProvider = createPluginI18n({
  plugins: [analyticsPlugin, cachePlugin, customPlugin]
})
```

### 🤖 AI 모드 (AI)

**AI 기반 번역**

```tsx
import { createAII18n } from '@hua-labs/i18n-sdk/ai'

const I18nProvider = createAII18n({
  aiProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  autoTranslate: true
})
```

## 🎯 프레임워크 지원

### Next.js (App Router)

**자동 감지** - 별도 설정 불필요!

```tsx
const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home']
})
```

**번역 파일 위치:**
- `src/app/translations/` (권장)
- `translations/`
- `public/locales/`

### Create React App (CRA)

**자동 감지** - 별도 설정 불필요!

**번역 파일 위치:**
- `public/locales/` (권장)
- `src/locales/`
- `translations/`

### Vite

**자동 감지** - 별도 설정 불필요!

**번역 파일 위치:**
- `public/locales/` (권장)
- `src/locales/`
- `translations/`

## 🛠️ 사용법

### 기본 번역

```tsx
import { useTranslation } from '@hua-labs/i18n-sdk/beginner'

function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.buttons.save')}</button>
    </div>
  )
}
```

### 언어 변경

```tsx
import { useTranslation, useLanguageChange } from '@hua-labs/i18n-sdk/beginner'

function LanguageSwitcher() {
  const { t } = useTranslation()
  const { changeLanguage, currentLanguage } = useLanguageChange()
  
  return (
    <div>
      <button onClick={() => changeLanguage('ko')}>한국어</button>
      <button onClick={() => changeLanguage('en')}>English</button>
      <p>현재 언어: {currentLanguage}</p>
    </div>
  )
}
```

### 파라미터가 있는 번역

```tsx
// 번역 파일
{
  "greeting": "안녕하세요, {{name}}님!",
  "items": "{{count}}개의 항목이 있습니다."
}

// 사용법
function MyComponent() {
  const { t } = useTranslation()
  
  return (
    <div>
      <p>{t('common.greeting', { name: '리듬이' })}</p>
      <p>{t('common.items', { count: 5 })}</p>
    </div>
  )
}
```

## 🔧 문제 해결

### 번역 파일을 찾을 수 없습니다

**개발자 친화적 에러 메시지:**
```
🌍 번역 파일을 찾을 수 없습니다: ko/common.json
📁 다음 경로들을 확인해주세요:
   - src/app/translations/ko/common.json
   - translations/ko/common.json
   - public/locales/ko/common.json
💡 해결 방법:
   1. 번역 파일을 생성하세요
   2. 또는 framework 옵션을 명시적으로 지정하세요
   3. 또는 loadTranslations 옵션으로 커스텀 로더를 제공하세요
```

### 프레임워크 자동 감지가 안 됩니다

```tsx
const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  framework: 'nextjs' // 명시적으로 지정
})
```

## 📚 문서

- **[초보자 가이드](docs/BEGINNER_GUIDE.md)** - 완벽한 시작 가이드
- **[모드별 가이드](docs/MODE_GUIDE.md)** - 각 모드 상세 설명
- **[API 문서](docs/API.md)** - 모든 API 상세 설명
- **[예제 모음](docs/EXAMPLES.md)** - 다양한 사용 사례

## 🎯 예제

### 완전한 Next.js 예제

```tsx
// src/app/layout.tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'home'],
  debug: process.env.NODE_ENV === 'development'
})

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
```

```tsx
// src/app/page.tsx
import { useTranslation, useLanguageChange } from '@hua-labs/i18n-sdk/beginner'

export default function HomePage() {
  const { t } = useTranslation()
  const { changeLanguage, currentLanguage } = useLanguageChange()
  
  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('home.title')}</h1>
        <div className="space-x-2">
          <button 
            onClick={() => changeLanguage('ko')}
            className={currentLanguage === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-200'}
          >
            한국어
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className={currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}
          >
            English
          </button>
        </div>
      </header>
      
      <main>
        <p className="text-lg mb-4">{t('home.welcome')}</p>
        <p className="text-gray-600">{t('home.description')}</p>
      </main>
    </div>
  )
}
```

## 🤝 기여하기

기여를 환영합니다! 

1. [Fork](https://github.com/hua-labs/i18n-sdk/fork) 하기
2. Feature branch 생성 (`git checkout -b feature/amazing-feature`)
3. Commit 하기 (`git commit -m 'Add amazing feature'`)
4. Push 하기 (`git push origin feature/amazing-feature`)
5. [Pull Request](https://github.com/hua-labs/i18n-sdk/pulls) 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 💬 커뮤니티

- **GitHub Issues**: [이슈 등록](https://github.com/hua-labs/i18n-sdk/issues)
- **Discord**: [커뮤니티 참여](https://discord.gg/hua-labs)
- **문서**: [전체 문서 보기](https://docs.hua-labs.dev)

---

**🎉 이제 당신도 i18n 마스터!** 

복사해서 붙여넣기만 하면 바로 사용할 수 있는 HUA i18n SDK로 멋진 다국어 앱을 만들어보세요! 🚀 