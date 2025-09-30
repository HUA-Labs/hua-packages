# 🚀 HUA i18n SDK - 초보자 가이드

> **"복사해서 붙여넣기만 하면 바로 사용할 수 있는"** 초보자 친화적 i18n SDK

## 📋 목차

- [빠른 시작](#-빠른-시작)
- [프레임워크별 설정](#-프레임워크별-설정)
- [번역 파일 구조](#-번역-파일-구조)
- [사용법](#-사용법)
- [문제 해결](#-문제-해결)
- [예제](#-예제)

---

## ⚡ 빠른 시작

### 1단계: 설치

```bash
npm install @hua-labs/i18n-sdk
# 또는
yarn add @hua-labs/i18n-sdk
# 또는
pnpm add @hua-labs/i18n-sdk
```

### 2단계: 번역 파일 생성

**기본 구조 (권장)**
```
your-project/
├── translations/          # 기본 경로
│   ├── ko/
│   │   ├── common.json
│   │   └── home.json
│   └── en/
│       ├── common.json
│       └── home.json
```

**`translations/ko/common.json`**
```json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요",
  "goodbye": "안녕히 가세요"
}
```

**`translations/en/common.json`**
```json
{
  "welcome": "Welcome",
  "hello": "Hello",
  "goodbye": "Goodbye"
}
```

### 3단계: Provider 설정

**가장 간단한 방법 (translations/ 폴더 사용)**
```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home']
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

### 4단계: 번역 사용

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

**1. 번역 파일 위치 변경**
```
your-project/
├── src/
│   └── app/
│       └── translations/    # Next.js App Router 경로
│           ├── ko/
│           │   └── common.json
│           └── en/
│               └── common.json
```

**2. 커스텀 로더 설정**
```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

// Next.js App Router에 맞는 커스텀 로더
const customLoader = async (language: string, namespace: string) => {
  try {
    // src/app/translations/ 경로에서 번역 파일 로드
    const module = await import(`../translations/${language}/${namespace}.json`)
    return module.default || module
  } catch (error) {
    console.warn(`Failed to load translation: ${language}/${namespace}`, error)
    return {}
  }
}

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  loadTranslations: customLoader  // 커스텀 로더 사용
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

### Create React App (CRA)

**CRA**에서는 `public/locales/` 폴더를 사용하는 것이 일반적입니다.

**1. 번역 파일 위치**
```
your-project/
├── public/
│   └── locales/
│       ├── ko/
│       │   └── common.json
│       └── en/
│           └── common.json
```

**2. 커스텀 로더 설정**
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

**1. 번역 파일 위치**
```
your-project/
├── public/
│   └── locales/
│       ├── ko/
│       │   └── common.json
│       └── en/
│           └── common.json
```

**2. 커스텀 로더 설정**
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

---

## 📁 번역 파일 구조

### 기본 구조 (권장)
```
translations/
├── ko/                    # 한국어
│   ├── common.json       # 공통 번역
│   ├── home.json         # 홈페이지 번역
│   └── auth.json         # 인증 관련 번역
└── en/                    # 영어
    ├── common.json
    ├── home.json
    └── auth.json
```

### JSON 파일 예시

**`ko/common.json`**
```json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요",
  "buttons": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제"
  },
  "messages": {
    "loading": "로딩 중...",
    "success": "성공했습니다",
    "error": "오류가 발생했습니다"
  }
}
```

**`en/common.json`**
```json
{
  "welcome": "Welcome",
  "hello": "Hello",
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "messages": {
    "loading": "Loading...",
    "success": "Success",
    "error": "An error occurred"
  }
}
```

---

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
      <button onClick={() => changeLanguage('ko')}>
        한국어
      </button>
      <button onClick={() => changeLanguage('en')}>
        English
      </button>
      <p>현재 언어: {currentLanguage}</p>
    </div>
  )
}
```

### 파라미터가 있는 번역

**번역 파일:**
```json
{
  "greeting": "안녕하세요, {{name}}님!",
  "items": "{{count}}개의 항목이 있습니다."
}
```

**사용법:**
```tsx
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

---

## 🔧 문제 해결

### 1. 번역 파일을 찾을 수 없습니다

**콘솔 메시지:**
```
🌍 번역 파일을 찾을 수 없습니다: ko/common.json
📁 다음 경로들을 확인해주세요:
   - src/app/translations/ko/common.json
   - translations/ko/common.json
   - public/locales/ko/common.json
```

**해결 방법:**
1. 번역 파일이 올바른 위치에 있는지 확인
2. 파일명이 정확한지 확인 (소문자, .json 확장자)
3. JSON 형식이 올바른지 확인

### 2. 번역 키가 없습니다

**콘솔 메시지:**
```
🔑 번역 키가 없습니다: common.welcome
💡 번역 파일에 해당 키를 추가하거나, 기본값을 사용합니다.
```

**해결 방법:**
1. 번역 파일에 해당 키 추가
2. 키 이름이 정확한지 확인 (대소문자 구분)

### 3. 프레임워크 자동 감지가 안 됩니다

**해결 방법:**
```tsx
const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  framework: 'nextjs' // 명시적으로 지정
})
```

### 4. 커스텀 경로 사용

```tsx
const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  namespaces: ['common', 'home'],
  loadTranslations: async (language, namespace) => {
    // 커스텀 로더
    const module = await import(`./my-custom-path/${language}/${namespace}.json`)
    return module.default
  }
})
```

---

## 📚 예제

### 완전한 Next.js 예제

**`src/app/layout.tsx`**
```tsx
import { createBeginnerI18n } from '@hua-labs/i18n-sdk/beginner'

const I18nProvider = createBeginnerI18n({
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  namespaces: ['common', 'home', 'auth'],
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

**`src/app/page.tsx`**
```tsx
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
            className={`px-3 py-1 rounded ${currentLanguage === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            한국어
          </button>
          <button 
            onClick={() => changeLanguage('en')}
            className={`px-3 py-1 rounded ${currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            English
          </button>
        </div>
      </header>
      
      <main>
        <p className="text-lg mb-4">{t('home.welcome')}</p>
        <p className="text-gray-600">{t('home.description')}</p>
        
        <div className="mt-8 space-y-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            {t('common.buttons.getStarted')}
          </button>
          <button className="px-4 py-2 bg-gray-500 text-white rounded ml-2">
            {t('common.buttons.learnMore')}
          </button>
        </div>
      </main>
    </div>
  )
}
```

**`src/app/translations/ko/home.json`**
```json
{
  "title": "🦋 HUA i18n SDK",
  "welcome": "다국어 지원을 쉽게 만들어보세요!",
  "description": "복사해서 붙여넣기만 하면 바로 사용할 수 있는 초보자 친화적 i18n SDK입니다.",
  "features": {
    "simple": "간단한 설정",
    "auto": "자동 프레임워크 감지",
    "smart": "스마트 에러 메시지"
  }
}
```

**`src/app/translations/en/home.json`**
```json
{
  "title": "🦋 HUA i18n SDK",
  "welcome": "Make internationalization easy!",
  "description": "A beginner-friendly i18n SDK that you can use right away with just copy and paste.",
  "features": {
    "simple": "Simple setup",
    "auto": "Auto framework detection",
    "smart": "Smart error messages"
  }
}
```

---

## 🎯 다음 단계

초보자 가이드를 마스터했다면:

1. **[고급 가이드](../advanced/README.md)** - 성능 최적화, 플러그인 등
2. **[API 문서](../api/README.md)** - 모든 API 상세 설명
3. **[예제 모음](../examples/README.md)** - 다양한 사용 사례

---

## 💬 도움이 필요하세요?

- **GitHub Issues**: [이슈 등록](https://github.com/hua-labs/i18n-sdk/issues)
- **Discord**: [커뮤니티 참여](https://discord.gg/hua-labs)
- **문서**: [전체 문서 보기](https://docs.hua-labs.dev)

---

**🎉 이제 당신도 i18n 마스터!** 

복사해서 붙여넣기만 하면 바로 사용할 수 있는 HUA i18n SDK로 멋진 다국어 앱을 만들어보세요! 🚀 