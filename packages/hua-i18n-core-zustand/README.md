# @hua-labs/i18n-core-zustand

Zustand 상태관리와 `@hua-labs/i18n-core`를 타입 안전하게 통합하는 어댑터 패키지입니다.

## 설치

```bash
pnpm add @hua-labs/i18n-core-zustand zustand
# 또는
npm install @hua-labs/i18n-core-zustand zustand
# 또는
yarn add @hua-labs/i18n-core-zustand zustand
```

## 요구사항

- Zustand 스토어에 `language: string`과 `setLanguage: (lang: string) => void`가 있어야 합니다.

## 사용법

### 1. 기본 사용 (Provider 생성)

```tsx
// lib/i18n-config.ts
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from '../store/useAppStore';

export const I18nProvider = createZustandI18n(useAppStore, {
  fallbackLanguage: 'en',
  namespaces: ['common', 'navigation', 'footer'],
  translationLoader: 'api',
  translationApiPath: '/api/translations',
  defaultLanguage: 'ko', // SSR 초기 언어 (하이드레이션 에러 방지)
  debug: process.env.NODE_ENV === 'development'
});
```

```tsx
// app/layout.tsx
import { I18nProvider } from './lib/i18n-config';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

### 2. Zustand 스토어 예시

```tsx
// store/useAppStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  language: 'ko' | 'en';
  setLanguage: (lang: 'ko' | 'en') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
```

### 3. 번역 사용

```tsx
// components/MyComponent.tsx
import { useTranslation } from '@hua-labs/i18n-core';
import { useAppStore } from '../store/useAppStore';

export default function MyComponent() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();

  return (
    <div>
      <h1>{t('common:welcome')}</h1>
      <button onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}>
        {language === 'ko' ? 'English' : '한국어'}
      </button>
    </div>
  );
}
```

### 4. SSR과 함께 사용

```tsx
// app/layout.tsx (Server Component)
import { loadSSRTranslations } from './lib/ssr-translations';
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from './store/useAppStore';

export default async function RootLayout({ children }) {
  // SSR에서 번역 로드
  const ssrTranslations = await loadSSRTranslations('ko');
  
  const I18nProvider = createZustandI18n(useAppStore, {
    fallbackLanguage: 'en',
    namespaces: ['common', 'navigation', 'footer'],
    translationLoader: 'api',
    translationApiPath: '/api/translations',
    defaultLanguage: 'ko', // SSR과 동일한 초기 언어
    initialTranslations: ssrTranslations, // SSR 번역 전달
    debug: process.env.NODE_ENV === 'development'
  });
  
  return (
    <html lang="ko">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

## API

### `createZustandI18n(store, config)`

Zustand 스토어와 i18n-core를 통합하는 Provider를 생성합니다.

**매개변수:**
- `store`: Zustand 스토어 (`language`와 `setLanguage` 메서드 필요)
- `config`: i18n 설정 (기본 `I18nConfig`에서 `defaultLanguage` 제외)

**반환값:**
- React Provider 컴포넌트

**설정 옵션:**

```ts
interface ZustandI18nConfig {
  // SSR과 일치시키기 위한 초기 언어 (하이드레이션 에러 방지)
  defaultLanguage?: string;
  
  // 폴백 언어
  fallbackLanguage?: string;
  
  // 네임스페이스 목록
  namespaces?: string[];
  
  // 디버그 모드
  debug?: boolean;
  
  // 커스텀 번역 로더
  loadTranslations?: (language: string, namespace: string) => Promise<Record<string, string>>;
  
  // 번역 로더 타입
  translationLoader?: 'api' | 'static' | 'custom';
  
  // API 경로 (translationLoader가 'api'일 때)
  translationApiPath?: string;
  
  // SSR 초기 번역 데이터
  initialTranslations?: Record<string, Record<string, Record<string, string>>>;
  
  // 자동 언어 동기화 (이 패키지에서는 항상 false)
  autoLanguageSync?: boolean;
}
```

### `useZustandI18n(store)`

Zustand 스토어와 통합된 i18n 훅을 제공합니다.

**매개변수:**
- `store`: Zustand 스토어

**반환값:**
- `{ language, setLanguage }`: 언어 상태와 변경 함수

**참고:** 실제 번역은 `useTranslation` 훅을 사용하세요:

```tsx
import { useTranslation } from '@hua-labs/i18n-core';
import { useZustandI18n } from '@hua-labs/i18n-core-zustand';
import { useAppStore } from './store/useAppStore';

function MyComponent() {
  const { t } = useTranslation(); // 번역 함수
  const { language, setLanguage } = useZustandI18n(useAppStore); // 언어 상태
  
  return (
    <div>
      <p>{t('common:welcome')}</p>
      <button onClick={() => setLanguage('en')}>English</button>
    </div>
  );
}
```

## 특징

- ✅ **타입 안전**: TypeScript 완전 지원
- ✅ **의존성 최소화**: Zustand만 peer dependency
- ✅ **자동 동기화**: Zustand 스토어 변경 시 자동으로 i18n에 반영
- ✅ **단방향 데이터 흐름**: Zustand 스토어가 source of truth
- ✅ **SSR 호환**: 하이드레이션 완료 후 언어 동기화 (하이드레이션 에러 방지)
- ✅ **순환 참조 방지**: 안전한 언어 동기화 메커니즘

## 동작 원리

1. **초기화**: `createZustandI18n`은 `createCoreI18n`을 래핑하여 기본 Provider를 생성합니다.
2. **언어 동기화**: Zustand 스토어의 언어 변경을 감지하여 i18n에 자동으로 동기화합니다.
3. **하이드레이션**: SSR과 클라이언트 간 하이드레이션 에러를 방지하기 위해 하이드레이션 완료 후에만 언어를 동기화합니다.
4. **순환 참조 방지**: `useRef`를 사용하여 무한 루프를 방지하고, 단방향 데이터 흐름을 유지합니다.

## 주의사항

1. **Zustand 스토어 구조**: 스토어에 반드시 `language`와 `setLanguage`가 있어야 합니다.
2. **autoLanguageSync**: 이 패키지는 `autoLanguageSync`를 자동으로 비활성화합니다 (Zustand 어댑터가 직접 처리).
3. **언어 변경**: 언어 변경은 Zustand 스토어의 `setLanguage`를 통해 해야 합니다.
4. **SSR 초기 언어**: `defaultLanguage` 옵션을 사용하여 SSR과 동일한 초기 언어를 설정하세요 (하이드레이션 에러 방지).
5. **하이드레이션**: 하이드레이션 완료 후에만 Zustand 스토어의 언어가 i18n에 동기화됩니다.

## 예제

전체 예제는 [examples](../../examples) 디렉토리를 참고하세요.

## 관련 패키지

- `@hua-labs/i18n-core`: 핵심 i18n 라이브러리
- `@hua-labs/i18n-loaders`: 프로덕션용 로더 및 캐싱 유틸리티

## 라이선스

MIT
