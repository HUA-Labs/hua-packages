# React 훅의 순환 의존성 해결

> **작성일**: 2025-11-11  
> **문제**: `useNetworkSync`와 `useDraftManagement` 간의 순환 의존성  
> **해결**: `useRef`를 활용한 지연 바인딩 (Lazy Binding)

---

## 📋 목차

1. [문제 상황](#문제-상황)
2. [왜 발생했나?](#왜-발생했나)
3. [해결 방법](#해결-방법)
4. [실제 코드](#실제-코드)
5. [배운 점](#배운-점)
6. [참고 자료](#참고-자료)

---

## 🔴 문제 상황

### 발생한 에러

```
Block-scoped variable 'isOnline' used before its declaration.
Variable 'isOnline' is used before being assigned.
Cannot find name 'setOfflineDiaryCount'.
```

### 의존성 구조

```
┌──────────────────────┐
│  useNetworkSync      │
│  (isOnline 제공)     │◄───────┐
└──────────────────────┘         │
          │                       │
          │ 필요: fetchDraftCount │
          │      setShowDraftModal│
          ↓                       │
┌──────────────────────────────┐ │
│  useDraftManagement          │ │
│  (fetchDraftCount 제공)      │ │
│  (setShowDraftModal 제공)    │ │
└──────────────────────────────┘ │
          │                       │
          │ 필요: isOnline        │
          └───────────────────────┘

⚠️ 순환 의존성 (Circular Dependency)
```

---

## 🤔 왜 발생했나?

### 1. **코드 분리 과정에서의 의존성**

대규모 컴포넌트(`page.tsx`, ~1947줄)를 여러 커스텀 훅으로 분리하는 과정에서:

- `useNetworkSync`: 네트워크 상태 관리 및 동기화
  - **제공**: `isOnline`, `offlineDiaryCount`, `syncOfflineDrafts`, etc.
  - **필요**: `fetchDraftCount()`, `setShowDraftModal()`

- `useDraftManagement`: 임시저장 관리
  - **제공**: `fetchDraftCount`, `setShowDraftModal`, etc.
  - **필요**: `isOnline`

### 2. **React 훅의 규칙 제약**

```typescript
// ❌ 불가능: 훅의 호출 순서를 조건부로 변경할 수 없음
if (someCondition) {
  const hook1 = useCustomHook1(); // 규칙 위반!
} else {
  const hook2 = useCustomHook2();
}

// ❌ 불가능: 훅을 나중에 호출할 수 없음
const value = someFunction();
const hook = useCustomHook(value); // value가 훅에서 나와야 한다면?
```

### 3. **순환 의존성의 본질**

```typescript
// page.tsx
function DiaryWritePage() {
  // 1단계: useNetworkSync가 먼저 필요 (isOnline 제공)
  const { isOnline } = useNetworkSync({
    fetchDraftCount, // ❌ 아직 정의되지 않음!
  });
  
  // 2단계: useDraftManagement가 필요 (fetchDraftCount 제공)
  const { fetchDraftCount } = useDraftManagement({
    isOnline, // ✅ 이미 정의됨
  });
  
  // ⚠️ 문제: fetchDraftCount는 여기서 정의되지만,
  // useNetworkSync는 이미 실행되었음!
}
```

---

## ✅ 해결 방법

### 핵심 아이디어: **Ref를 사용한 지연 바인딩**

`useRef`를 사용하여 함수를 **나중에 업데이트**할 수 있도록 합니다.

```typescript
// useNetworkSync.ts
export function useNetworkSync({
  fetchDraftCount, // 초기에는 undefined일 수 있음
  setShowDraftModal,
  // ... other props
}: UseNetworkSyncProps) {
  // 1️⃣ Ref로 저장
  const fetchDraftCountRef = useRef(fetchDraftCount);
  const setShowDraftModalRef = useRef(setShowDraftModal);
  
  // 2️⃣ 값이 변경되면 ref 업데이트
  useEffect(() => {
    fetchDraftCountRef.current = fetchDraftCount;
    setShowDraftModalRef.current = setShowDraftModal;
  }, [fetchDraftCount, setShowDraftModal]);
  
  // 3️⃣ 사용할 때는 ref를 통해 호출 (옵셔널 체이닝)
  const someFunction = () => {
    fetchDraftCountRef.current?.(); // ✅ 안전하게 호출
    setShowDraftModalRef.current?.(true);
  };
  
  // ... rest of the hook
}
```

### 실행 흐름

```
렌더링 1:
  useNetworkSync 호출
    → fetchDraftCountRef.current = undefined
  useDraftManagement 호출
    → fetchDraftCount 함수 생성됨
  useEffect 실행
    → fetchDraftCountRef.current = fetchDraftCount (✅ 업데이트!)

이후:
  네트워크 상태 변경
    → fetchDraftCountRef.current?.() 호출
    → ✅ 정상 작동!
```

---

## 💻 실제 코드

### Before (문제가 있던 코드)

```typescript
// ❌ page.tsx - 순환 의존성 발생
function DiaryWritePage() {
  // fetchDraftCount가 아직 정의되지 않음
  const { isOnline } = useNetworkSync({
    fetchDraftCount, // ❌ undefined!
    setShowDraftModal,
  });
  
  const { fetchDraftCount, setShowDraftModal } = useDraftManagement({
    isOnline,
  });
}
```

### After (해결된 코드)

#### 1. useNetworkSync.ts

```typescript
interface UseNetworkSyncProps {
  fetchDraftCount?: () => void; // optional로 변경
  setShowDraftModal?: (show: boolean) => void;
  // ... other props
}

export function useNetworkSync({
  fetchDraftCount,
  setShowDraftModal,
  // ...
}: UseNetworkSyncProps) {
  // Ref로 저장
  const fetchDraftCountRef = useRef(fetchDraftCount);
  const setShowDraftModalRef = useRef(setShowDraftModal);
  
  // 값이 변경되면 ref 업데이트
  useEffect(() => {
    fetchDraftCountRef.current = fetchDraftCount;
    setShowDraftModalRef.current = setShowDraftModal;
  }, [fetchDraftCount, setShowDraftModal]);
  
  // 네트워크 상태 변경 리스너
  useEffect(() => {
    const removeListener = networkStatus.addListener(async (online) => {
      if (online) {
        // Ref를 통해 안전하게 호출
        fetchDraftCountRef.current?.(); // ✅
      }
    });
    
    return removeListener;
  }, [/* fetchDraftCount를 의존성에서 제거 */]);
  
  // Service Worker 메시지 리스너
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'DIARY_SYNC_COMPLETE') {
        // Ref를 통해 안전하게 호출
        setShowDraftModalRef.current?.(true); // ✅
      }
    };
    
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [/* setShowDraftModal을 의존성에서 제거 */]);
  
  return {
    isOnline,
    offlineDiaryCount,
    syncOfflineDrafts,
    checkOfflineDiaries,
  };
}
```

#### 2. page.tsx

```typescript
function DiaryWritePage() {
  // 1️⃣ useNetworkSync를 먼저 호출 (초기에는 함수들이 undefined)
  const { isOnline, offlineDiaryCount, checkOfflineDiaries } = useNetworkSync({
    setContent,
    setDiaryDate,
    setAutoSaveStatus,
    content,
    // fetchDraftCount와 setShowDraftModal은 나중에 전달됨
  });
  
  // 2️⃣ useDraftManagement 호출 (isOnline 사용)
  const {
    fetchDraftCount,
    setShowDraftModal,
    // ... other values
  } = useDraftManagement({
    isOnline, // ✅ 이미 정의됨
    setContent,
    setDiaryDate,
    // ...
  });
  
  // 3️⃣ useNetworkSync에 함수들을 전달하기 위한 두 번째 호출
  // useNetworkSync 내부의 ref가 자동으로 업데이트됨
  useNetworkSync({
    fetchDraftCount, // ✅ 이제 정의됨
    setShowDraftModal, // ✅ 이제 정의됨
    setContent,
    setDiaryDate,
    setAutoSaveStatus,
    content,
  });
  
  // ... rest of component
}
```

> **주의**: 실제로는 같은 훅을 두 번 호출하지 않고, useNetworkSync 내부의 useEffect가 자동으로 ref를 업데이트하도록 구현했습니다.

---

## 🎓 배운 점

### 1. **`useRef`의 활용**

- **불변성**: `ref.current`는 변경해도 리렌더링을 트리거하지 않음
- **지속성**: 컴포넌트 생명주기 동안 값이 유지됨
- **지연 바인딩**: 나중에 값을 업데이트할 수 있음

```typescript
// ✅ ref는 리렌더링 없이 업데이트 가능
const functionRef = useRef<(() => void) | undefined>();

useEffect(() => {
  functionRef.current = newFunction; // 리렌더링 없음
}, [newFunction]);

// 나중에 호출
functionRef.current?.(); // 최신 함수가 호출됨
```

### 2. **옵셔널 체이닝의 중요성**

```typescript
// ❌ 위험: undefined일 수 있음
fetchDraftCountRef.current();

// ✅ 안전: undefined 체크
fetchDraftCountRef.current?.();
```

### 3. **의존성 배열 최적화**

```typescript
// Before: fetchDraftCount가 의존성에 포함됨
useEffect(() => {
  // ...
  fetchDraftCount();
}, [fetchDraftCount]); // ⚠️ 무한 루프 가능성

// After: ref를 사용하면 의존성에서 제거 가능
useEffect(() => {
  // ...
  fetchDraftCountRef.current?.();
}, []); // ✅ fetchDraftCount 제거
```

### 4. **커스텀 훅 설계 원칙**

- **단일 책임 원칙**: 각 훅은 하나의 책임만 가져야 함
- **의존성 최소화**: 훅 간의 의존성을 최소화
- **유연성**: 선택적 props를 활용하여 다양한 상황에 대응

---

## ⚠️ 주의사항

### 1. **초기 렌더링에서의 undefined**

```typescript
// 첫 렌더링에서는 undefined일 수 있음
fetchDraftCountRef.current?.(); // 항상 옵셔널 체이닝 사용!
```

### 2. **의존성 배열에서 ref 제외**

```typescript
// ❌ ref를 의존성에 포함하지 말 것
useEffect(() => {
  // ...
}, [fetchDraftCountRef]); // ref 객체 자체는 변하지 않음

// ✅ ref.current가 참조하는 함수를 의존성에 포함
useEffect(() => {
  fetchDraftCountRef.current = fetchDraftCount;
}, [fetchDraftCount]);
```

### 3. **같은 훅을 두 번 호출하지 않기**

```typescript
// ❌ 같은 훅을 두 번 호출하면 상태가 중복됨
const result1 = useNetworkSync({ /* ... */ });
const result2 = useNetworkSync({ /* ... */ }); // 별도의 상태 생성!

// ✅ 한 번만 호출하고, ref 업데이트는 useEffect로
const result = useNetworkSync({ /* ... */ });
```

---

## 🔍 대안적 해결 방법

### 방법 1: Context API 사용

```typescript
// NetworkContext.tsx
const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  // ...
  return (
    <NetworkContext.Provider value={{ isOnline, ... }}>
      {children}
    </NetworkContext.Provider>
  );
}

// 사용
function SomeComponent() {
  const { isOnline } = useContext(NetworkContext);
}
```

**장점**: 전역 상태로 관리되어 어디서든 접근 가능  
**단점**: Context 추가로 구조가 복잡해질 수 있음

### 방법 2: 의존성 역전 (Dependency Inversion)

```typescript
// 공통 상태를 상위로 올리기
function DiaryWritePage() {
  const [isOnline, setIsOnline] = useState(true);
  
  const networkSync = useNetworkSync({ isOnline, setIsOnline });
  const draftManagement = useDraftManagement({ isOnline });
}
```

**장점**: 순환 의존성 제거  
**단점**: 상위 컴포넌트가 복잡해질 수 있음

### 방법 3: 이벤트 기반 아키텍처

```typescript
// EventBus 패턴
eventBus.on('network-status-changed', (online) => {
  fetchDraftCount();
});
```

**장점**: 느슨한 결합  
**단점**: 디버깅이 어려워질 수 있음

---

## 📚 참고 자료

### React 공식 문서

- [Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [useRef](https://react.dev/reference/react/useRef)
- [useEffect](https://react.dev/reference/react/useEffect)

### 관련 아티클

- [React Hook 순환 의존성 해결하기](https://kentcdodds.com/blog/breaking-up-circular-dependencies-in-react)
- [useRef의 올바른 사용법](https://blog.logrocket.com/useref-vs-usestate/)

### 우리 프로젝트

- [`useNetworkSync.ts`](../../app/diary/write/hooks/useNetworkSync.ts)
- [`useDraftManagement.ts`](../../app/diary/write/hooks/useDraftManagement.ts)
- [`page.tsx`](../../app/diary/write/page.tsx)

---

## 📊 적용 결과

### 코드 메트릭

| 항목 | Before | After | 개선 |
|------|--------|-------|------|
| `page.tsx` 라인 수 | ~1947줄 | ~1340줄 | -31% |
| 커스텀 훅 | 2개 | 6개 | +300% |
| 에러 | 3개 | 0개 | ✅ |
| 순환 의존성 | 있음 | 없음 | ✅ |

### 생성된 파일

1. `useNetworkSync.ts` (338줄)
2. `useDraftManagement.ts` (308줄)
3. `useSpecialMessage.ts` (137줄)
4. `useAutoSave.ts` (151줄)
5. `draftUtils.ts` (유틸리티)

---

## 💡 결론

React 훅 간의 순환 의존성은 대규모 컴포넌트를 리팩토링할 때 자주 마주치는 문제입니다. **`useRef`를 활용한 지연 바인딩** 패턴은:

✅ **React의 훅 규칙을 준수**하면서  
✅ **순환 의존성을 깔끔하게 해결**하고  
✅ **코드의 가독성과 유지보수성**을 높입니다

이 패턴은 다른 프로젝트에서도 유사한 상황에 적용할 수 있는 범용적인 해결책입니다!

---

**Created**: 2025-11-11  
**Last Updated**: 2025-11-11  
**Author**: HUA Team

