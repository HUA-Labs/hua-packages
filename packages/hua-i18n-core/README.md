# @hua-labs/i18n-core

핵심 번역 기능만 필요한 경우 사용하는 가벼운 i18n 라이브러리입니다.

## 🚀 설치

```bash
pnpm add @hua-labs/i18n-core
```

## 📁 파일 구조

i18n-core는 다음 경로에서 번역 파일을 찾습니다:

```
your-app/
├── lib/
│   └── i18n-config.ts
├── translations/
│   ├── ko/
│   │   ├── common.json
│   │   ├── pages.json
│   │   └── footer.json
│   └── en/
│       ├── common.json
│       ├── pages.json
│       └── footer.json
└── app/
    └── layout.tsx
```

## 🔧 기본 설정

### 1. i18n 설정 파일 생성

```typescript
// lib/i18n-config.ts
import { createCoreI18n } from '@hua-labs/i18n-core';

export function createClientI18nProvider(defaultLanguage: string = 'ko') {
  return createCoreI18n({
    defaultLanguage,
    fallbackLanguage: 'en',
    namespaces: ['common', 'pages', 'footer'],
    debug: true
  });
}
```

### 2. 번역 파일 생성

```json
// translations/ko/common.json
{
  "welcome": "환영합니다",
  "hello": "안녕하세요",
  "goodbye": "안녕히 가세요"
}
```

```json
// translations/ko/footer.json
{
  "brand_name": "SUM API",
  "brand_tagline": "감정 기반 AI 미들웨어",
  "copyright": "© 2024 SUM API. All rights reserved."
}
```

### 3. Provider 설정

```tsx
// app/components/ClientLayout.tsx
import { I18nProvider } from '@hua-labs/i18n-core';
import { createClientI18nProvider } from '../../lib/i18n-config';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { language } = useAppStore();
  
  const i18nConfig = useMemo(() => {
    const createProvider = createClientI18nProvider(language);
    const providerComponent = createProvider({ children: null });
    return providerComponent.props.config;
  }, [language]);

  return (
    <I18nProvider config={i18nConfig}>
      {children}
    </I18nProvider>
  );
}
```

## 🎯 사용법

### 기본 번역

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('footer.brand_name')}</p>
    </div>
  );
}
```

### 네임스페이스별 번역

```tsx
import { useTranslation } from '@hua-labs/i18n-core';

function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer>
      <h3>{t('footer.brand_name')}</h3>
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}
```

## 🔑 키 규칙

### 1. 네임스페이스 포함 키
```typescript
t('footer.brand_name')     // footer.json의 brand_name
t('pages.home.title')      // pages.json의 home.title
t('common.welcome')        // common.json의 welcome
```

### 2. 단일 키 (common 네임스페이스)
```typescript
t('welcome')               // common.json의 welcome
t('hello')                 // common.json의 hello
```

## 🌐 SSR 지원

### 서버 사이드 번역

```typescript
// lib/ssr-translations.ts
import { ssrTranslate } from '@hua-labs/i18n-core';

export function getServerTranslations(language: string) {
  return {
    welcome: ssrTranslate({
      translations: await loadTranslations(language),
      key: 'common.welcome',
      language
    })
  };
}
```

## 🐛 디버깅

### 디버그 모드 활성화

```typescript
createCoreI18n({
  debug: true,  // 콘솔에 로그 출력
  // ... 기타 설정
});
```

### 누락된 키 처리

```typescript
createCoreI18n({
  missingKeyHandler: (key: string) => {
    console.warn(`Missing translation key: ${key}`);
    return `[MISSING: ${key}]`;
  }
});
```

## 📋 지원 언어

기본적으로 다음 언어를 지원합니다:

- 🇰🇷 Korean (ko)
- 🇺🇸 English (en)

추가 언어는 설정에서 지정할 수 있습니다.

## 🔄 언어 변경

```tsx
import { useLanguageChange } from '@hua-labs/i18n-core';

function LanguageSwitcher() {
  const { changeLanguage } = useLanguageChange();
  
  return (
    <button onClick={() => changeLanguage('en')}>
      English
    </button>
  );
}
```

## 📦 번들 크기

- **gzipped**: ~5KB
- **minified**: ~15KB
- **zero dependencies** (React 제외)

## 🚨 주의사항

1. **파일 경로**: 번역 파일은 반드시 `translations/` 폴더에 위치해야 합니다.
2. **JSON 형식**: 번역 파일은 JSON 형식이어야 합니다 (TypeScript 파일 불가).
3. **네임스페이스**: 키에 네임스페이스를 포함하거나 common 네임스페이스를 사용하세요.
4. **동적 import**: Next.js의 동적 import를 사용하므로 빌드 시 경고가 발생할 수 있습니다.

## 🔧 문제 해결

### 번역이 로드되지 않는 경우

1. **파일 경로 확인**
   ```
   ✅ translations/ko/footer.json
   ❌ translations/footer.json
   ```

2. **JSON 형식 확인**
   ```json
   ✅ { "key": "value" }
   ❌ export default { key: "value" }
   ```

3. **네임스페이스 확인**
   ```typescript
   ✅ t('footer.brand_name')
   ❌ t('brand_name')  // common 네임스페이스에 없으면 실패
   ```

4. **디버그 모드 활성화**
   ```typescript
   createCoreI18n({ debug: true })
   ```

## 📄 라이선스

MIT License 