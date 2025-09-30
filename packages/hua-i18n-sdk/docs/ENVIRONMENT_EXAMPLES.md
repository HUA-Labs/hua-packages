# 환경별 번역 파일 Import 예제

이 문서는 다양한 빌드 환경에서 hua-i18n-sdk를 사용하는 간단한 예제를 제공합니다.

## 🚀 초보자용 - withDefaultConfig()

모든 환경에서 가장 간단한 방법:

```tsx
// 모든 환경에서 동일하게 사용 가능
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

// 한 줄로 끝!
export const I18nProvider = withDefaultConfig();
```

## Next.js App Router

### 초보자용 (추천)

```tsx
// app/i18n-config.ts
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export const I18nProvider = withDefaultConfig();
```

### 고급자용

```tsx
// app/i18n-config.ts
import { I18nConfig } from 'hua-i18n-sdk';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'diary', 'admin'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(`@/translations/${language}/${namespace}.json`);
      return module.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
  debug: process.env.NODE_ENV === 'development',
  missingKeyHandler: (key: string) => key,
};
```

## Vite

### 초보자용 (추천)

```tsx
// lib/i18n-config.ts
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export const I18nProvider = withDefaultConfig();
```

### 고급자용

```tsx
// lib/i18n-config.ts
import { I18nConfig } from 'hua-i18n-sdk';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'diary', 'admin'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(`../translations/${language}/${namespace}.json`);
      return module.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
  debug: import.meta.env.DEV,
  missingKeyHandler: (key: string) => key,
};
```

## Webpack

### 초보자용 (추천)

```tsx
// lib/i18n-config.ts
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export const I18nProvider = withDefaultConfig();
```

### 고급자용

```tsx
// lib/i18n-config.ts
import { I18nConfig } from 'hua-i18n-sdk';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'diary', 'admin'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(`../translations/${language}/${namespace}.json`);
      return module.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
  debug: process.env.NODE_ENV === 'development',
  missingKeyHandler: (key: string) => key,
};
```

## Rollup

### 초보자용 (추천)

```tsx
// lib/i18n-config.ts
import { withDefaultConfig } from 'hua-i18n-sdk/easy';

export const I18nProvider = withDefaultConfig();
```

### 고급자용

```tsx
// lib/i18n-config.ts
import { I18nConfig } from 'hua-i18n-sdk';

export const i18nConfig: I18nConfig = {
  defaultLanguage: 'ko',
  fallbackLanguage: 'en',
  supportedLanguages: [
    { code: 'ko', name: 'Korean', nativeName: '한국어' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ],
  namespaces: ['common', 'diary', 'admin'],
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const module = await import(`../translations/${language}/${namespace}.json`);
      return module.default;
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
  debug: process.env.NODE_ENV === 'development',
  missingKeyHandler: (key: string) => key,
};
```

## 사용법

설정 후에는 모든 환경에서 동일하게 사용할 수 있습니다:

```tsx
// App.tsx 또는 layout.tsx
import { I18nProvider } from './i18n-config';

function App() {
  return (
    <I18nProvider>
      <MyComponent />
    </I18nProvider>
  );
}

// 컴포넌트에서 사용
import { useTranslation } from 'hua-i18n-sdk';

function MyComponent() {
  const { t, tWithParams } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{tWithParams('common.greeting', { name: '철수' })}</p>
    </div>
  );
}
```

## 번역 파일 구조

모든 환경에서 동일한 파일 구조를 사용합니다:

```
translations/
├── ko/
│   ├── common.json
│   ├── diary.json
│   └── admin.json
└── en/
    ├── common.json
    ├── diary.json
    └── admin.json
```
