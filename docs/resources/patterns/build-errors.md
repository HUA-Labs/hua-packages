# 빌드 오류 패턴

**작성일**: 2025-12-06  
**목적**: 자주 발생하는 빌드 오류와 해결 방법 정리

---

## 1. Vercel 빌드 오류

### 문제 상황

Vercel 빌드 시 다음과 같은 오류가 발생:

- `Error: supabaseUrl is required`
- `ERR_PNPM_UNSUPPORTED_ENGINE`
- 환경 변수 관련 오류

### 원인 분석

#### Supabase 클라이언트 빌드 타임 초기화

**문제**: 모듈 레벨에서 `createClient`를 직접 호출하면 Next.js 빌드 시점에 실행되어 환경 변수가 없어 오류 발생

```typescript
// ❌ 문제가 있는 코드
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

#### Vercel pnpm 버전 불일치

**문제**: Vercel이 기본적으로 오래된 pnpm 버전(6.35.1)을 사용하지만, 프로젝트는 pnpm >=10.17.0 요구

### 해결 방법

#### Lazy Initialization 패턴

```typescript
// ✅ 해결된 코드
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClient;
}
```

또는 클래스에서 getter 사용:

```typescript
// ✅ 해결된 코드
class NotificationService {
  private _supabase: SupabaseClient | null = null;

  get supabase() {
    if (!this._supabase) {
      this._supabase = createClient(/* ... */);
    }
    return this._supabase;
  }
}
```

#### Dynamic Import 사용

```typescript
// ✅ 해결된 코드
export async function GET() {
  const { default: creditScheduler } = await import('../../lib/credit-scheduler');
  // ...
}
```

#### Vercel pnpm 버전 설정

`vercel.json`에 명시적으로 설정:

```json
{
  "installCommand": "corepack enable && corepack use pnpm@10.24.0 && cd ../.. && corepack pnpm install --frozen-lockfile --ignore-scripts=false"
}
```

### 예방 방법

1. **모듈 레벨 초기화 피하기**: 환경 변수를 사용하는 클라이언트는 함수나 getter로 lazy 초기화
2. **Dynamic Import 활용**: 빌드 타임에 실행되지 않아야 하는 모듈은 dynamic import 사용
3. **Vercel 설정 문서화**: 각 앱의 `vercel.json`에 pnpm 버전 명시

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

## 2. Next.js 빌드 타임 실행 문제

### 문제 상황

Next.js 빌드 시 "Collecting page data" 단계에서 모듈이 로드되면서 환경 변수에 접근하려고 시도하여 오류 발생

### 원인 분석

Next.js는 빌드 시점에 모든 API 라우트를 분석하며, 모듈 레벨에서 실행되는 코드는 빌드 타임에 실행됨

### 해결 방법

1. **Lazy Initialization**: 필요할 때만 초기화
2. **Dynamic Import**: 빌드 타임 실행 방지
3. **환경 변수 검증 분리**: 빌드 타임과 런타임 구분

### 예방 방법

- 빌드 타임에 실행되지 않아야 하는 코드는 함수 내부로 이동
- 환경 변수 검증은 런타임에만 수행

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

## 3. React 19 JSX 타입 호환성 문제

### 문제 상황

React 19에서 `React.forwardRef` 컴포넌트들이 JSX 요소로 인식되지 않는 타입 에러 발생

```typescript
Type error: 'Icon' cannot be used as a JSX component.
  Its type 'ForwardRefExoticComponent<...>' is not a valid JSX element type.
```

### 원인 분석

React 19에서 JSX 타입 시스템이 변경되어 `React.forwardRef`로 생성된 컴포넌트들이 JSX 요소로 인식되지 않음

### 해결 방법

#### 임시 해결책: 타입 체크 우회 (현재 사용 중)

```javascript
// next.config.js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}
```

**주의**: 타입 안전성을 포기하는 대신 빌드를 성공시킴

**현재 상태**:
- `apps/hua-ui`: 타입 에러 해결 완료, `ignoreBuildErrors` 제거 완료 ✅
- `apps/hua-motion`: 타입 에러 없음 확인, `ignoreBuildErrors` 제거 완료 ✅

#### 실제 해결 방법 (hua-ui 앱 적용 완료) ✅

1. **누락된 export 추가**
```typescript
// packages/hua-ui/src/index.ts
export { ComponentLayout } from './components/ComponentLayout';
```

2. **타입 정의 수정**
```typescript
// AccordionTrigger의 value prop을 optional로 변경
interface AccordionTriggerProps {
  value?: string; // Optional: AccordionItem에서 자동으로 전달됨
  // ...
}
```

3. **Icon name 타입 수정**
```typescript
// "x" → "close"로 변경 (IconName 타입에 맞춤)
<Icon name="close" className="w-4 h-4" />
```

#### 대안: 명시적 반환 타입 지정

```typescript
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref): React.ReactElement => {
    return <button ref={ref} {...props} />
  }
)
```

### 예방 방법

1. **React 19 마이그레이션 전 충분한 테스트**
2. **UI 라이브러리 호환성 확인**
3. **롤백 계획 준비**

### 관련 데브로그

- [DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY.md](../devlogs/DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY.md)

---

## 4. 네이티브 모듈 빌드 오류

### 문제 상황

Windows에서 `bcrypt` 같은 네이티브 모듈 빌드 실패

### 원인 분석

네이티브 모듈은 C++ 컴파일러가 필요하며, Windows에서는 Visual Studio Build Tools가 필요

### 해결 방법

#### 로컬 환경

`.npmrc`에 설정 추가:

```
ignore-scripts=false
```

#### CI/CD 환경

GitHub Actions에 빌드 도구 설치:

```yaml
- name: Install build tools
  run: |
    sudo apt-get update
    sudo apt-get install -y build-essential python3
```

#### Vercel

자동으로 네이티브 모듈 빌드 지원 (설정 완료)

### 예방 방법

- 네이티브 모듈 사용 시 빌드 환경 문서화
- CI/CD 파이프라인에 빌드 도구 설치 단계 추가

### 관련 데브로그

- [DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md](../devlogs/DEVLOG_2025-12-04_DEPENDENCY_UPDATE_AND_CLEANUP.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

