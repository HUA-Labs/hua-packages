# Next.js 16 런타임 에러 패턴

**작성일**: 2025-12-23  
**최종 업데이트**: 2025-12-23  
**목적**: Next.js 16에서 발생하는 런타임 에러 패턴을 정리하여 개발 효율성 향상  
**프로젝트 버전**: Next.js 16.0.10

---

## 문제 상황

### 1. 함수 전달 에러

```
Runtime Error
Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server".
```

**발생 위치**:
- Server Component에서 Client Component로 함수를 전달할 때
- 예: `createApiTranslationLoader`로 생성한 함수를 `loadTranslations` prop으로 전달

### 2. 모듈 객체 전달 에러

```
Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
```

**발생 위치**:
- `import * as` 형태로 JSON을 import한 경우
- 모듈 객체를 Client Component로 전달할 때

### 3. useTranslation 서버 호출 에러

```
Attempted to call useTranslation() from the server but useTranslation is on the client.
```

**발생 위치**:
- Server Component에서 `useTranslation()` 훅을 호출할 때
- Provider가 클라이언트 컴포넌트로 마크되지 않은 경우

---

## 원인 분석

### 1. 함수 전달 문제

- **Next.js 16의 제한**: Server Component에서 Client Component로 함수를 직접 전달할 수 없음
- **예외**: Server Action은 `"use server"`로 표시하면 전달 가능
- **일반 함수**: 설정 옵션으로 전달하거나 내부적으로 처리해야 함

### 2. 모듈 객체 문제

- **JSON import 방식**: `import * as` 형태로 import하면 모듈 네임스페이스 객체가 됨
- **Next.js 요구사항**: Client Component로 전달되는 props는 순수 객체(plain object)여야 함
- **모듈 객체 특징**: `constructor`가 `Object`가 아니거나 `default` 속성을 가질 수 있음

### 3. useTranslation 서버 호출 문제

- **훅의 제한**: React 훅은 클라이언트 컴포넌트에서만 사용 가능
- **Provider 위치**: Provider가 Server Component에서 사용되면 내부 훅 호출 불가
- **해결**: Provider를 클라이언트 컴포넌트로 마크하거나 별도 클라이언트 컴포넌트로 분리

---

## 해결 방법

### 방법 1: 함수 전달 문제 해결

#### ❌ 잘못된 방법

```typescript
// Server Component (layout.tsx)
import { createApiTranslationLoader } from '@hua-labs/i18n-loaders';

const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
});

export const I18nProvider = createZustandI18n(useAppStore, {
  translationLoader: 'custom',
  loadTranslations, // ❌ 함수 전달 불가
});
```

#### ✅ 올바른 방법

```typescript
// translationLoader: 'api' 사용 (내부적으로 처리)
export const I18nProvider = createZustandI18n(useAppStore, {
  translationLoader: 'api', // ✅ 설정 옵션으로 전달
  translationApiPath: '/api/translations',
});
```

**또는 클라이언트 컴포넌트에서 함수 생성**:

```typescript
"use client";

// 클라이언트 컴포넌트 내부에서 함수 생성
const loadTranslations = createApiTranslationLoader({
  translationApiPath: '/api/translations',
});

export const I18nProvider = createZustandI18n(useAppStore, {
  translationLoader: 'custom',
  loadTranslations, // ✅ 클라이언트 컴포넌트 내부에서는 가능
});
```

---

### 방법 2: 모듈 객체 → 순수 객체 변환

#### ❌ 잘못된 방법

```typescript
// translations/index.ts
import * as commonKo from './ko/common.json';

export async function getTranslations(language: string, namespace: string) {
  return commonKo; // ❌ 모듈 객체 반환
}
```

#### ✅ 올바른 방법

```typescript
// translations/index.ts
import * as commonKo from './ko/common.json';

function toPlainObject(obj: unknown): Record<string, string> {
  // 이미 순수 객체인 경우
  if (obj && typeof obj === 'object' && !Array.isArray(obj) && obj.constructor === Object) {
    return obj as Record<string, string>;
  }
  
  // 모듈 객체인 경우 (default 또는 직접 값)
  if (obj && typeof obj === 'object') {
    const moduleObj = obj as { default?: unknown; [key: string]: unknown };
    if (moduleObj.default && typeof moduleObj.default === 'object') {
      return toPlainObject(moduleObj.default);
    }
    // default가 없으면 직접 변환 시도
    return Object.fromEntries(
      Object.entries(moduleObj).filter(([key]) => key !== 'default')
    ) as Record<string, string>;
  }
  
  return {};
}

export async function getTranslations(language: string, namespace: string) {
  const moduleObj = commonKo;
  return toPlainObject(moduleObj); // ✅ 순수 객체로 변환
}
```

**또는 default import 사용**:

```typescript
// translations/index.ts
import commonKo from './ko/common.json'; // ✅ default import

export async function getTranslations(language: string, namespace: string) {
  return commonKo; // ✅ 이미 순수 객체
}
```

---

### 방법 3: useTranslation 서버 호출 문제 해결

#### ❌ 잘못된 방법

```typescript
// i18n-config.ts (Server Component에서 사용)
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';

export const I18nProvider = createZustandI18n(useAppStore, {
  // ...
});
// ❌ 내부에서 useTranslation() 호출 시 서버에서 실행됨
```

#### ✅ 올바른 방법

```typescript
"use client"; // ✅ 클라이언트 컴포넌트로 마크

// i18n-config.ts
import { createZustandI18n } from '@hua-labs/i18n-core-zustand';

export function createI18nProvider(initialTranslations?: InitialTranslations) {
  return createZustandI18n(useAppStore, {
    initialTranslations, // SSR 데이터 전달
    // ...
  });
}
```

**또는 클라이언트 컴포넌트 래퍼 사용**:

```typescript
// ClientI18nProvider.tsx
"use client";

export function ClientI18nProvider({ children, initialTranslations }) {
  const I18nProvider = createI18nProvider(initialTranslations);
  return <I18nProvider>{children}</I18nProvider>;
}

// layout.tsx (Server Component)
export default async function RootLayout({ children }) {
  const initialTranslations = await loadSSRTranslations();
  
  return (
    <ClientI18nProvider initialTranslations={initialTranslations}>
      {children}
    </ClientI18nProvider>
  );
}
```

---

## 예방 방법

1. **함수 전달 방지**
   - Server Component에서 함수를 직접 전달하지 않기
   - 설정 옵션으로 전달하거나 내부적으로 처리
   - 필요시 클라이언트 컴포넌트 내부에서 함수 생성

2. **모듈 객체 변환**
   - JSON import 시 `import` 대신 `import default` 사용 고려
   - 또는 `toPlainObject` 함수로 변환
   - Client Component로 전달 전 순수 객체인지 확인

3. **훅 사용 주의**
   - React 훅은 클라이언트 컴포넌트에서만 사용
   - Provider가 훅을 사용하면 `"use client"` 추가
   - 또는 클라이언트 컴포넌트 래퍼로 분리

4. **SSR 데이터 전달**
   - `initialTranslations` 옵션 사용
   - `window.__SSR_TRANSLATIONS__`에 저장하여 하이드레이션 시 사용
   - 플리커링 방지를 위해 SSR 데이터 필수

---

## 관련 데브로그

- [2025-12-23 - i18n SSR 함수 전달 문제 해결](./../devlogs/DEVLOG_2025-12-23_I18N_SSR_FUNCTION_PASSING_FIX.md)

---

## 체크리스트

이 패턴을 만났을 때 확인할 사항:

- [ ] Server Component에서 Client Component로 함수를 전달하고 있는가?
- [ ] `translationLoader: 'api'` 같은 설정 옵션을 사용할 수 있는가?
- [ ] JSON import가 모듈 객체를 반환하는가?
- [ ] `toPlainObject` 함수로 변환이 필요한가?
- [ ] Provider가 `"use client"`로 마크되어 있는가?
- [ ] `useTranslation()` 같은 훅이 서버에서 호출되는가?
- [ ] SSR 데이터를 `initialTranslations`로 전달하고 있는가?
- [ ] `window.__SSR_TRANSLATIONS__`에 저장하고 있는가?

---

## 참고 자료

- [Next.js 16 Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js 16 Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Server Components](https://react.dev/reference/rsc/server-components)

---

**프로젝트 버전**: Next.js 16.0.10  
**작성자**: AI Assistant  
**최종 업데이트**: 2025-12-23

