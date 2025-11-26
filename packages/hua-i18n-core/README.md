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
  "copyright": "© 2025 SUM API. All rights reserved."
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

## ⚙️ 번역 로더 구성

`createCoreI18n`은 실제 서비스 환경에 맞춰 번역을 불러오는 방식을 고를 수 있습니다. `apps/my-api/lib/i18n-config.ts`처럼 옵션을 조합하면 됩니다.

| 옵션 | 설명 | 기본값 | 실제 사용 예 |
| --- | --- | --- | --- |
| `translationLoader` | `'api' \| 'static' \| 'custom'` 중 선택 | `'api'` | my-api는 `'api'`로 설정해 `/api/translations` 경유 |
| `translationApiPath` | `translationLoader === 'api'`일 때 호출할 API 경로 | `/api/translations` | `/api/translations/[language]/[namespace]` |
| `loadTranslations` | `translationLoader === 'custom'`일 때 실행할 비동기 로더 함수 | 없음 | 사내 CMS/DB에서 직접 JSON을 구성할 때 사용 |

### API 로더 응답 형식

`apps/my-api/app/api/translations/[language]/[namespace]/route.ts`처럼 Next.js Route Handler를 구성하면 됩니다.

```ts
export async function GET(_, { params }) {
  const { language, namespace } = await params
  const translationPath = join(process.cwd(), 'translations', language, `${namespace}.json`)
  const fileContent = await readFile(translationPath, 'utf-8')

  return NextResponse.json(JSON.parse(fileContent), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
  })
}
```

- API에서 404/500이 발생하면 `i18n-core`가 자동으로 프로젝트 내 `translations/` 혹은 내장 기본 번역을 순서대로 시도합니다.
- `translationLoader: 'static'`인 경우 브라우저에서 `/translations/{lang}/{namespace}.json`을 직접 요청합니다.
- `translationLoader: 'custom'`이면 `loadTranslations(language, namespace)`에서 원하는 방식으로 JSON을 반환하면 됩니다.

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

### 서버/엣지에서 번역 미리 불러오기

`Translator`, `ssrTranslate`, `serverTranslate`를 이용하면 서버 렌더링 단계에서 JSON을 미리 주입할 수 있습니다.

```ts
// lib/ssr-translations.ts
import { ssrTranslate, Translator } from '@hua-labs/i18n-core'
import translations from '@/translations/ko/common.json'

export async function getServerTranslations(language: string) {
  // 직접 Translator 생성
  const translator = await Translator.create({
    defaultLanguage: language,
    namespaces: ['common', 'pages'],
    loadTranslations: async (_lang, namespace) => {
      return (await import(`@/translations/${language}/${namespace}.json`)).default
    }
  })

  return {
    welcome: translator.translate('common.welcome'),
    footer: ssrTranslate({
      translations,
      key: 'common.goodbye',
      language
    })
  }
}
```

- `Translator.create`는 서버/엣지 런타임에서도 동작하도록 `loadTranslations`만 제공하면 됩니다.
- `ssrTranslate`/`serverTranslate`는 번역 JSON을 직접 넘기고 결과 문자열만 반환받는 간단한 헬퍼입니다.
- my-api는 CSR에서 API 로더를 사용하고, SSR 페이지에서는 기본 fallback 번역으로 초기 화면을 채운 뒤 클라이언트에서 최신 데이터를 로드합니다.

## 🪝 훅 레퍼런스

`useTranslation()`은 단순한 `t` 함수 외에도 다음 상태를 제공합니다.

| 필드 | 설명 |
| --- | --- |
| `t(key)` | 기본 번역 함수 (네임스페이스 생략 시 `common`) |
| `tWithParams(key, params)` | 템플릿 파라미터 치환 |
| `tAsync`, `tSync` | 기존 SDK 호환용 비동기/동기 번역 |
| `currentLanguage`, `setLanguage` | 현재 언어, 전환 함수 |
| `supportedLanguages` | `{ code, name, nativeName }[]` |
| `isLoading`, `isInitialized`, `error` | 로딩/초기화 상태 |
| `debug` | `translator.debug()` 래핑 (로딩된 네임스페이스 확인 등) |

언어만 바꾸고 싶다면 `useLanguageChange()`를 사용하세요.

```tsx
const { changeLanguage, supportedLanguages } = useLanguageChange()

return supportedLanguages.map(lang => (
  <button key={lang.code} onClick={() => changeLanguage(lang.code)}>
    {lang.nativeName}
  </button>
))
```

`autoLanguageSync: true`일 때는 다른 SDK에서 `window.dispatchEvent(new CustomEvent('huaI18nLanguageChange', { detail: 'en' }))`를 호출하면 모든 Provider가 이벤트를 받아 언어를 동기화합니다.

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

### MissingKeyOverlay 사용

개발 중 누락된 키를 화면에 표시하려면 `components/MissingKeyOverlay.tsx`를 활용할 수 있습니다.

```tsx
import { MissingKeyOverlay } from '@hua-labs/i18n-core/components/MissingKeyOverlay'

function DebugBar() {
  if (process.env.NODE_ENV !== 'development') return null
  return <MissingKeyOverlay />
}
```

`debug: true`일 때 `window.__I18N_DEBUG_MISSING_KEYS__`에 누락된 키가 누적되며, Overlay가 이를 시각화합니다.

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