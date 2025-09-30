# 자주 묻는 질문 (FAQ) - hua-i18n-sdk

> **v1.2.0** - 문제 해결 및 사용 가이드

## 📋 목차

- [설치 및 설정](#설치-및-설정)
- [번역 관련](#번역-관련)
- [Next.js 관련](#nextjs-관련)
- [성능 및 최적화](#성능-및-최적화)
- [에러 해결](#에러-해결)
- [고급 사용법](#고급-사용법)

---

## 설치 및 설정

### Q: hua-i18n-sdk를 어떻게 설치하나요?

**A:** npm 또는 yarn을 사용하여 설치할 수 있습니다.

```bash
# npm 사용
npm install hua-i18n-sdk

# yarn 사용
yarn add hua-i18n-sdk

# pnpm 사용
pnpm add hua-i18n-sdk
```

### Q: 가장 간단한 설정 방법은 무엇인가요?

**A:** `createI18nApp()` 함수를 사용하면 한 줄로 설정할 수 있습니다.

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

### Q: CLI 도구는 어떻게 사용하나요?

**A:** `npx hua-i18n-sdk init` 명령어로 자동 설정할 수 있습니다.

```bash
# 기본 설정
npx hua-i18n-sdk init

# Next.js 프로젝트용
npx hua-i18n-sdk init --nextjs

# 자동 모드 (모든 질문에 기본값 사용)
npx hua-i18n-sdk init --yes
```

---

## 번역 관련

### Q: 번역 파일은 어디에 저장해야 하나요?

**A:** 기본적으로 `translations/` 디렉토리에 저장합니다.

```
translations/
├── ko/
│   └── common.json    # 한국어 번역
└── en/
    └── common.json    # 영어 번역
```

### Q: 번역 키는 어떻게 사용하나요?

**A:** `useTranslation()` 훅을 사용하여 번역 키에 접근할 수 있습니다.

```tsx
import { useTranslation } from 'hua-i18n-sdk';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('common.greeting')}</p>
    </div>
  );
}
```

### Q: 번역이 나오지 않으면 어떻게 해야 하나요?

**A:** 다음 순서로 확인해보세요:

1. **번역 파일 경로 확인**
   ```tsx
   // 올바른 경로
   translations/ko/common.json
   ```

2. **번역 키 확인**
   ```json
   {
     "welcome": "환영합니다",
     "greeting": "안녕하세요"
   }
   ```

3. **Provider 설정 확인**
   ```tsx
   <I18nProvider config={i18nConfig}>
     <MyComponent />
   </I18nProvider>
   ```

4. **디버그 모드 활성화**
   ```tsx
   const config = createI18nConfig({
     debug: true, // 누락된 키 표시
     // ... 기타 설정
   });
   ```

### Q: 언어를 동적으로 변경하려면 어떻게 해야 하나요?

**A:** `useLanguageChange()` 훅을 사용합니다.

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

---

## Next.js 관련

### Q: Next.js에서 동적 임포트 경고가 나와요

**A:** `serverTranslate()` 함수를 사용하세요. 동적 임포트 없이 작동합니다.

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

### Q: App Router와 Pages Router 중 어떤 것을 사용해야 하나요?

**A:** 프로젝트 구조에 따라 자동으로 감지됩니다.

- **App Router**: `app/` 디렉토리가 있으면 자동 감지
- **Pages Router**: `pages/` 디렉토리가 있으면 자동 감지

### Q: Next.js에서 SSR을 사용하려면 어떻게 해야 하나요?

**A:** 서버 컴포넌트에서 `serverTranslate()` 함수를 사용하세요.

```tsx
// app/page.tsx (서버 컴포넌트)
import { serverTranslate } from 'hua-i18n-sdk';

export default function Page() {
  const title = serverTranslate({
    translations: { ko: { common: { welcome: "환영합니다" } } },
    key: 'common.welcome',
    language: 'ko'
  });
  
  return <h1>{title}</h1>;
}
```

---

## 성능 및 최적화

### Q: 번들 크기를 줄이려면 어떻게 해야 하나요?

**A:** Tree-shaking을 활용하고 필요한 기능만 import하세요.

```tsx
// ✅ 좋은 예: 필요한 것만 import
import { useTranslation } from 'hua-i18n-sdk';

// ❌ 나쁜 예: 전체 import
import * as huaI18n from 'hua-i18n-sdk';
```

### Q: 번역 파일을 지연 로딩하려면 어떻게 해야 하나요?

**A:** `loadTranslations` 함수에서 동적 import를 사용하세요.

```tsx
const config = createI18nConfig({
  // ... 기타 설정
  loadTranslations: async (language: string, namespace: string) => {
    // 필요한 시점에만 로드
    const module = await import(`./translations/${language}/${namespace}.json`);
    return module.default;
  },
});
```

### Q: 캐싱을 활성화하려면 어떻게 해야 하나요?

**A:** `cacheOptions`를 설정하세요.

```tsx
const config = createI18nConfig({
  // ... 기타 설정
  cacheOptions: {
    maxSize: 100,    // 최대 캐시 크기
    ttl: 300000      // 캐시 유효 시간 (5분)
  },
});
```

---

## 에러 해결

### Q: "Translation key not found" 에러가 발생해요

**A:** 다음을 확인해보세요:

1. **번역 키가 올바른지 확인**
   ```tsx
   // ✅ 올바른 키
   t('common.welcome')
   
   // ❌ 잘못된 키
   t('welcome')
   ```

2. **번역 파일에 키가 있는지 확인**
   ```json
   {
     "welcome": "환영합니다"  // 이 키가 있어야 함
   }
   ```

3. **네임스페이스가 올바른지 확인**
   ```tsx
   const config = createI18nConfig({
     namespaces: ['common'], // 이 배열에 포함되어야 함
     // ... 기타 설정
   });
   ```

### Q: "Failed to load translations" 에러가 발생해요

**A:** 번역 파일 경로를 확인해보세요:

1. **파일 경로 확인**
   ```
   translations/
   ├── ko/
   │   └── common.json  ← 이 파일이 있어야 함
   └── en/
       └── common.json
   ```

2. **파일 형식 확인**
   ```json
   {
     "welcome": "환영합니다",
     "greeting": "안녕하세요"
   }
   ```

3. **import 경로 확인**
   ```tsx
   loadTranslations: async (language: string, namespace: string) => {
     try {
       const module = await import(`../translations/${language}/${namespace}.json`);
       return module.default;
     } catch (error) {
       console.warn(`Failed to load translations for ${language}:${namespace}`, error);
       return {};
     }
   },
   ```

### Q: TypeScript 에러가 발생해요

**A:** 타입 정의를 확인해보세요:

1. **@types 패키지 설치**
   ```bash
   npm install --save-dev @types/react
   ```

2. **tsconfig.json 설정 확인**
   ```json
   {
     "compilerOptions": {
       "esModuleInterop": true,
       "allowSyntheticDefaultImports": true
     }
   }
   ```

3. **타입 가드 사용**
   ```tsx
   import { isTranslationNamespace } from 'hua-i18n-sdk';
   
   const data = await loadTranslations('ko', 'common');
   if (!isTranslationNamespace(data)) {
     throw new Error('Invalid translation data');
   }
   ```

---

## 고급 사용법

### Q: 커스텀 에러 핸들러를 만들려면 어떻게 해야 하나요?

**A:** `errorHandler` 옵션을 사용하세요.

```tsx
const config = createI18nConfig({
  // ... 기타 설정
  errorHandler: (error: Error) => {
    // 커스텀 에러 처리 로직
    console.error('Translation error:', error);
    
    // 외부 로깅 서비스로 전송
    analytics.track('translation_error', {
      message: error.message,
      timestamp: Date.now()
    });
  },
});
```

### Q: 번역 키를 동적으로 생성하려면 어떻게 해야 하나요?

**A:** 템플릿 리터럴을 사용하세요.

```tsx
function MyComponent({ section }: { section: string }) {
  const { t } = useTranslation();
  
  // 동적 키 생성
  const title = t(`${section}.title`);
  const description = t(`${section}.description`);
  
  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
```

### Q: 번역 데이터를 API에서 가져오려면 어떻게 해야 하나요?

**A:** `loadTranslations` 함수에서 API 호출을 사용하세요.

```tsx
const config = createI18nConfig({
  // ... 기타 설정
  loadTranslations: async (language: string, namespace: string) => {
    try {
      const response = await fetch(`/api/translations/${language}/${namespace}`);
      if (!response.ok) {
        throw new Error('Failed to fetch translations');
      }
      return await response.json();
    } catch (error) {
      console.warn(`Failed to load translations for ${language}:${namespace}`, error);
      return {};
    }
  },
});
```

### Q: 번역 키에 매개변수를 전달하려면 어떻게 해야 하나요?

**A:** `tWithParams` 함수를 사용하세요.

```tsx
function MyComponent({ name }: { name: string }) {
  const { tWithParams } = useTranslation();
  
  // 매개변수와 함께 번역
  const greeting = tWithParams('common.greeting', { name });
  
  return <p>{greeting}</p>;
}
```

번역 파일:
```json
{
  "greeting": "안녕하세요, {{name}}님!"
}
```

---

## 추가 도움말

### 공식 문서
- [SDK 레퍼런스](./SDK_REFERENCE.md)
- [환경별 가이드](./ENVIRONMENT_GUIDES.md)
- [변경 로그](./CHANGELOG.md)

### 커뮤니티
- [GitHub Issues](https://github.com/HUA-Labs/i18n-sdk/issues)
- [GitHub Discussions](https://github.com/HUA-Labs/i18n-sdk/discussions)

### 예제 프로젝트
- [Next.js 예제](../examples/nextjs-basic/)
- [Create React App 예제](../examples/cra-basic/)
- [Vite 예제](../examples/vite-basic/)

---

**더 많은 도움이 필요하시면 GitHub에서 이슈를 등록해주세요!** 🚀 