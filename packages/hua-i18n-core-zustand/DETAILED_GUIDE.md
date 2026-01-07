# @hua-labs/i18n-core-zustand Detailed Guide

Deep integration between Zustand and i18n-core.
Zustand와 i18n-core 간의 심층 통합 가이드.

---

## English

### How It Works
The adapter captures the Zustand store's state and bridges it to the i18n engine's configuration.

#### Benefits
- **Persistent Language**: Syncs with `zustand/middleware/persist`.
- **SSR Ready**: Prevents hydration flickering.
- **Type Safety**: Full TypeScript support for store actions and translations.

### Usage in Detail

#### Store Setup
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set) => ({
      language: 'ko',
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'app-storage' }
  )
);
```

#### Adapter Initialization
```tsx
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';

export const I18nProvider = createZustandI18n(useAppStore, {
  defaultLanguage: 'ko',
  namespaces: ['common']
});
```

---

## Korean

### 작동 원리
이 어댑터는 Zustand 스토어의 상태를 포착하여 i18n 엔진의 설정과 연결해주는 가교 역할을 합니다.

#### 주요 장점
- **언어 상태 유지**: Zustand의 `persist` 미들웨어와 완벽히 연동됩니다.
- **SSR 지원**: 서버와 클라이언트 간의 하이드레이션 깜빡임을 방지합니다.
- **타입 안전성**: 스토어 액션 및 번역 키에 대한 완전한 TypeScript 지원을 제공합니다.

### 상세 사용법

#### 스토어 설정
위와 같이 Zustand 스토어를 정의하고 언어 설정 상태를 포함시킵니다.

#### 어댑터 초기화
`createZustandI18n` 함수를 사용하여 스토어와 i18n 설정을 결합한 프로바이더를 생성합니다.
