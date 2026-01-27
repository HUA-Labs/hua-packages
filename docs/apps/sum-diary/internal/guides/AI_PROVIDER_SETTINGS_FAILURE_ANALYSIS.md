# AI 프로바이더 설정 실패 분석 로그

## 문제 상황
- 사용자가 제미니(gemini)를 선택했는데도 openai로 저장됨
- 새로고침 후 설정이 유지되지 않음

## 로그 분석

### 서버 로그 (실패 케이스)
```
[DEBUG] API 요청 본문: {"aiProvider":"openai"}
[DEBUG] body.aiProvider 원본 값: openai
[DEBUG] 변환된 provider 값: openai
[DEBUG] 프로바이더 설정 저장 시작: 7e70893a-04e9-4097-8675-187659e69d96 -> openai
[DEBUG] setUserAiProvider 호출: userId=7e70893a-04e9-4097-8675-187659e69d96, provider="openai" (타입: string)
[DEBUG] 변환된 dbProvider: OPENAI
[DEBUG] 사용자 7e70893a-04e9-4097-8675-187659e69d96의 AI 프로바이더가 openai로 설정되었습니다. (DB: OPENAI, 캐시: openai)
[DEBUG] 프로바이더 설정 저장 완료: 7e70893a-04e9-4097-8675-187659e69d96 -> openai
```

**문제점**: 클라이언트에서 `{"aiProvider":"openai"}`를 전송하고 있음

## 전체 로직 플로우 분석

### 1. 클라이언트 측 (ProviderSettingsModal.tsx)

#### 초기 로드 (useEffect)
```typescript
useEffect(() => {
  if (isOpen && !hasLoadedRef.current) {
    // 서버 DB에서 값 가져오기
    // → openai 반환
    setSelectedProvider('openai'); // ⚠️ 문제: 사용자 선택 전에 openai로 설정
    hasLoadedRef.current = true;
  }
}, [isOpen, userId]);
```

**문제점**:
- 모달이 열릴 때 서버에서 `openai`를 가져와서 `selectedProvider`를 덮어씀
- 사용자가 제미니를 선택하기 전에 이미 `openai`로 설정됨

#### 프로바이더 선택 (handleProviderSelect)
```typescript
const handleProviderSelect = (providerId: string) => {
  console.log('[DEBUG] 프로바이더 선택:', { providerId, 이전값: selectedProvider });
  setSelectedProvider(providerId); // ⚠️ React 상태 업데이트는 비동기
};
```

**문제점**:
- React 상태 업데이트는 비동기이므로 즉시 반영되지 않을 수 있음
- `setTimeout`으로 확인하지만, 저장 버튼을 빠르게 누르면 이전 값이 사용될 수 있음

#### 저장 (handleSave)
```typescript
const handleSave = async () => {
  const currentProvider = selectedProvider; // ⚠️ 클로저 문제 가능성
  // ...
  body: JSON.stringify({ aiProvider: currentProvider })
};
```

**문제점**:
- `selectedProvider`가 클로저로 인해 이전 값을 참조할 수 있음
- 상태 업데이트가 완료되기 전에 저장 버튼을 누르면 이전 값 사용

### 2. 서버 측 (route.ts)

#### POST 핸들러
```typescript
const body = await request.json();
const provider = String(body?.aiProvider || '').toLowerCase();
// → "openai" 받음
```

**정상 작동**: 클라이언트가 보낸 값을 그대로 처리

### 3. 서버 측 (user-settings-server.ts)

#### setUserAiProvider
```typescript
switch (provider) {
  case 'gemini':
    dbProvider = 'GEMINI';
    break;
  // ...
}
// → OPENAI로 저장됨 (provider가 "openai"이므로)
```

**정상 작동**: 받은 값에 따라 올바르게 변환

## 근본 원인 분석

### 원인 1: 클라이언트 상태 동기화 문제
1. 모달 열림 → 서버에서 `openai` 로드 → `selectedProvider = 'openai'`
2. 사용자가 제미니 클릭 → `setSelectedProvider('gemini')` 호출
3. **하지만** 상태 업데이트가 완료되기 전에 저장 버튼 클릭
4. → `selectedProvider`가 여전히 `'openai'` → `openai` 전송

### 원인 2: 새로고침 시 설정 유지 안 됨
1. 새로고침 → 모달 열림 → 서버에서 값 가져오기
2. 서버 DB에 `OPENAI` 저장되어 있음 (이전에 잘못 저장됨)
3. → `openai`로 다시 설정됨

## 해결 방안

### 방안 1: 상태 업데이트 완료 대기
```typescript
const handleProviderSelect = async (providerId: string) => {
  await new Promise(resolve => {
    setSelectedProvider(providerId);
    // 상태 업데이트 완료 대기
    setTimeout(resolve, 0);
  });
};
```

### 방안 2: useRef로 최신 값 추적
```typescript
const selectedProviderRef = useRef('openai');

const handleProviderSelect = (providerId: string) => {
  selectedProviderRef.current = providerId; // 즉시 업데이트
  setSelectedProvider(providerId);
};

const handleSave = () => {
  const currentProvider = selectedProviderRef.current; // 최신 값 보장
  // ...
};
```

### 방안 3: 모달 열릴 때 사용자 선택 우선
```typescript
useEffect(() => {
  if (isOpen && !hasLoadedRef.current) {
    // 서버 값 로드하되, 사용자가 이미 선택한 값이 있으면 덮어쓰지 않음
    const loadProvider = async () => {
      // ...
      // 사용자 선택이 없을 때만 서버 값 사용
      if (!userHasSelected) {
        setSelectedProvider(serverProvider);
      }
    };
  }
}, [isOpen, userId]);
```

## 권장 해결책

**useRef를 사용한 최신 값 보장**이 가장 확실한 방법입니다.

## 구현된 해결책

### 1. useRef로 최신 값 보장
```typescript
const selectedProviderRef = useRef<string>('openai');

const handleProviderSelect = (providerId: string) => {
  selectedProviderRef.current = providerId; // ⭐ 즉시 업데이트 (동기)
  setSelectedProvider(providerId); // 비동기 업데이트
};

const handleSave = () => {
  const currentProvider = selectedProviderRef.current; // ✅ 최신 값 보장
  // ...
};
```

### 2. 새로고침 시 설정 유지
- 서버 DB에서 값을 가져와서 설정
- localStorage와 동기화
- `useAISettings` 훅에서도 동일한 로직 적용

## 테스트 시나리오

### 시나리오 1: 제미니 선택 및 저장
1. 모달 열기 → 서버에서 현재 값 로드
2. 제미니 클릭 → `selectedProviderRef.current = 'gemini'` (즉시)
3. 저장 버튼 클릭 → `selectedProviderRef.current` 사용 → `'gemini'` 전송 ✅

### 시나리오 2: 새로고침 후 설정 유지
1. 제미니로 저장 완료 → DB에 `GEMINI` 저장
2. 새로고침 → 모달 열기 → 서버에서 `'gemini'` 로드 ✅
3. 설정 유지됨 ✅

## 예상 로그 (성공 케이스)

### 클라이언트
```
[DEBUG] 프로바이더 선택: { providerId: 'gemini', 이전값: 'openai', 이전ref값: 'openai' }
[DEBUG] 선택 후 즉시 확인: { providerId: 'gemini', ref값: 'gemini', state값: 'openai' }
[DEBUG] 클라이언트 저장 시도: { selectedProvider: 'gemini', userId: '...' }
[DEBUG] API 요청 본문: {"aiProvider":"gemini"}
```

### 서버
```
[DEBUG] API 요청 본문: {"aiProvider":"gemini"}
[DEBUG] body.aiProvider 원본 값: gemini
[DEBUG] 변환된 provider 값: gemini
[DEBUG] 프로바이더 설정 저장 시작: ... -> gemini
[DEBUG] setUserAiProvider 호출: userId=..., provider="gemini"
[DEBUG] 변환된 dbProvider: GEMINI
[DEBUG] 사용자 ...의 AI 프로바이더가 gemini로 설정되었습니다. (DB: GEMINI, 캐시: gemini)
```

## 추가 개선 사항

1. ✅ useRef로 최신 값 보장
2. ✅ 디버깅 로그 강화
3. ✅ 새로고침 시 설정 유지 확인
4. ✅ 모달 닫힐 때 초기화 플래그 관리 개선
5. ✅ **서버 DB를 단일 소스 오브 트루스로 명확히 정의**

## 아키텍처 원칙

### 서버 DB 우선 원칙
- **서버 DB = 단일 소스 오브 트루스 (Single Source of Truth)**
- 모든 설정은 서버 DB에 저장
- 새로고침 시 서버 DB에서 값을 가져옴
- localStorage는 클라이언트 편의용 캐시로만 사용 (선택적)

### 데이터 흐름
```
사용자 선택 → 서버 DB 저장 → localStorage 동기화 (캐시)
새로고침 → 서버 DB 조회 → localStorage 동기화 (캐시)
```

### localStorage의 역할
- 서버 값이 없을 때 임시로 사용하는 기본값
- 클라이언트 편의를 위한 캐시 (오프라인 지원 등)
- **절대 서버 DB를 대체하지 않음**

### 기본값 정책
- **기본값 = 'openai' (GPT)**
- 사용자가 특별히 선택하기 전에는 GPT가 기본값
- 서버 DB에 값이 없을 때 기본값 'openai' 반환
- localStorage에도 기본값 'openai' 사용
- 이는 의도된 동작이며, 사용자 경험을 위한 설계

## 발견된 추가 문제

### 문제: 두 곳에서 useAISettings() 호출
**원인**: `settings/page.tsx`와 `AISettingsTab`이 각각 `useAISettings()`를 호출하여 서로 다른 상태 인스턴스를 가짐

```typescript
// settings/page.tsx
const { handleSave } = useAISettings(); // 인스턴스 1

// AISettingsTab.tsx
const { selectedProvider, handleProviderChange } = useAISettings(); // 인스턴스 2 (다름!)
```

**결과**:
1. `AISettingsTab`에서 제미니 선택 → 인스턴스 2의 `selectedProvider`만 업데이트
2. 저장 버튼 클릭 → 인스턴스 1의 `handleSave` 호출 → 인스턴스 1의 `selectedProvider`는 여전히 'openai'
3. → 'openai' 전송됨

### 해결책: 상태 공유
```typescript
// settings/page.tsx
const aiSettings = useAISettings(); // 한 번만 호출
const { handleSave } = aiSettings;

// AISettingsTab에 props로 전달
<AISettingsTab aiSettings={aiSettings} />

// AISettingsTab.tsx
export function AISettingsTab({ aiSettings }: AISettingsTabProps) {
  const { selectedProvider, handleProviderChange } = aiSettings; // 동일한 인스턴스 사용
}
```

### 추가 수정 사항
1. ✅ `useAISettings`에 `useRef` 추가 (최신 값 보장)
2. ✅ `settings/page.tsx`에서 한 번만 호출하고 props로 전달
3. ✅ `AISettingsTab`이 props를 필수로 받도록 수정
4. ✅ 디버깅 로그 강화
