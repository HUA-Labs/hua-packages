# 타입 오류 패턴

**작성일**: 2025-12-06  
**목적**: 자주 발생하는 TypeScript 타입 오류와 해결 방법 정리

---

## 1. React 이벤트 핸들러 타입 오류

### 문제 상황

React 이벤트 핸들러에 타입이 지정되지 않아 TypeScript 오류 발생

```typescript
// ❌ 타입 오류
const handleChange = (e) => {
  // ...
}
```

### 원인 분석

TypeScript strict mode에서 이벤트 핸들러에 명시적 타입 지정 필요

### 해결 방법

```typescript
// ✅ 해결된 코드
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
}

const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // ...
}

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}
```

### 예방 방법

- React 이벤트 핸들러는 항상 명시적 타입 지정
- 공통 이벤트 핸들러 타입 정의 파일 생성 고려

### 관련 데브로그

- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

## 2. Supabase 쿼리 타입 추론 실패

### 문제 상황

Supabase 쿼리 결과에서 `Type 'never'` 오류 발생

```typescript
// ❌ 타입 오류
const { data } = await supabase
  .from('users')
  .select('*')
  .single();
// data의 타입이 never로 추론됨
```

### 원인 분석

TypeScript가 복잡한 Supabase 쿼리 결과 타입을 추론하지 못함

### 해결 방법

#### 명시적 타입 어노테이션

```typescript
// ✅ 해결된 코드
const { data } = await supabase
  .from('users')
  .select('*')
  .single() as { data: User | null };

// 또는
interface User {
  id: string;
  name: string;
  // ...
}

const { data } = await supabase
  .from('users')
  .select('*')
  .single() as { data: User | null };
```

#### 명시적 타입 정의 (권장 해결책) ✅

```typescript
// ✅ 권장: 명시적 타입 정의
interface ApiKey {
  id: string;
  key: string;
  user_id: string;
}

const { data: keyData } = await supabase
  .from('api_keys')
  .select('id, user_id')
  .eq('key', apiKey)
  .single() as { data: ApiKey | null };

if (keyData) {
  const apiKeyId = keyData.id; // 타입 안전
  const userId = keyData.user_id; // 타입 안전
}
```

**실제 적용 사례**:
- `apps/my-api/types/supabase.ts`: 공통 타입 정의 파일 생성
- `apps/my-api/lib/common/rate-limiter.ts`: 모든 `as any` 제거 완료
- `apps/my-api/lib/services/notification-service.ts`: Notification 타입 적용
- `apps/my-api/lib/services/credit-service.ts`: User, Transaction 타입 적용

### 예방 방법

- Supabase 타입 생성 도구 활용 검토
- 공통 타입 정의 파일 생성 (`types/supabase.ts`)
- 복잡한 쿼리는 타입을 명시적으로 정의
- `as any` 사용 금지, 항상 명시적 타입 정의 사용

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

## 3. React.cloneElement 타입 오류

### 문제 상황

`React.cloneElement`에서 스프레드 연산자 사용 시 타입 오류 발생

```typescript
// ❌ 타입 오류
React.cloneElement(child, {
  ...child.props,
  // ...
})
```

### 원인 분석

TypeScript가 `child.props`의 타입을 정확히 추론하지 못함

### 해결 방법

#### Partial 타입 사용

```typescript
// ✅ 해결된 코드
React.cloneElement(child, {
  ...(child.props as Partial<typeof child.props>),
  // ...
})
```

#### 타입 가드 사용

```typescript
// ✅ 해결된 코드
if (React.isValidElement(child)) {
  React.cloneElement(child, {
    ...child.props,
    // ...
  } as Partial<typeof child.props>)
}
```

### 예방 방법

- `React.cloneElement` 사용 시 타입을 명시적으로 정의
- 공통 유틸리티 함수로 추상화

### 관련 데브로그

- [DEVLOG_2025-12-05_UI_PACKAGE_IMPROVEMENT.md](../devlogs/DEVLOG_2025-12-05_UI_PACKAGE_IMPROVEMENT.md)

---

## 4. forwardRef 타입 오류

### 문제 상황

`React.forwardRef`와 `React.memo`를 함께 사용할 때 타입 오류 발생

```typescript
// ❌ 타입 오류
export const Icon = React.memo(
  React.forwardRef<SVGSVGElement, IconProps>((props, ref) => {
    // ...
  })
);
```

### 원인 분석

`React.memo`와 `React.forwardRef`의 타입 시그니처가 충돌

### 해결 방법

#### 내부 컴포넌트 분리

```typescript
// ✅ 해결된 코드
const IconComponent = React.forwardRef<SVGSVGElement, IconProps>(
  (props, ref) => {
    // ...
  }
);

IconComponent.displayName = 'Icon';

export const Icon = React.memo(IconComponent, (prevProps, nextProps) => {
  // 커스텀 비교 함수
  return prevProps.name === nextProps.name && prevProps.size === nextProps.size;
}) as typeof IconComponent;
```

### 예방 방법

- `forwardRef`와 `memo`를 함께 사용할 때는 내부 컴포넌트를 분리
- 타입 단언을 사용하여 타입 시그니처 보존

### 관련 데브로그

- [DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md](../devlogs/DEVLOG_2025-12-06_UI_PACKAGE_IMPROVEMENT.md)

---

## 5. 사용하지 않는 변수 타입 오류

### 문제 상황

사용하지 않는 변수나 파라미터로 인한 TypeScript/ESLint 경고

### 원인 분석

TypeScript strict mode에서 사용하지 않는 변수는 오류로 처리됨

### 해결 방법

#### 언더스코어 접두사 사용

```typescript
// ✅ 해결된 코드
function handleEvent(_event: Event) {
  // event를 사용하지 않지만 타입은 필요
}

// 또는
const { unused, ...rest } = data;
```

#### 주석 처리 (향후 사용 예정)

```typescript
// ✅ 해결된 코드
// const language = 'ko'; // 향후 사용 예정
```

### 예방 방법

- 사용하지 않는 변수는 즉시 제거
- 향후 사용 예정인 경우 주석으로 명시
- ESLint 규칙으로 일관된 처리

### 관련 데브로그

- [DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md](../devlogs/DEVLOG_2025-11-30_BUILD_AND_LINT_FIXES.md)

---

## 6. NextAuth 타입 확장 모듈 해석 충돌

### 문제 상황

`next-auth.d.ts` 파일명으로 인해 TypeScript가 모듈 자체로 인식하여 `NextAuth()` 함수가 호출 불가능

```
Type error: This expression is not callable.
  Type 'typeof import("D:/HUA/hua-platform/apps/my-app/next-auth")' has no call signatures.
```

### 원인 분석

- `next-auth.d.ts` 파일명이 모듈 이름과 동일하여 TypeScript가 실제 패키지 대신 이 파일을 모듈로 인식
- `declare module "next-auth"`가 모듈 전체를 확장하는 것으로 해석될 수 있음

### 해결 방법

#### 파일명 변경

```typescript
// ❌ 위험: next-auth.d.ts
declare module "next-auth" { ... }

// ✅ 안전: auth.d.ts
declare module "next-auth" { ... }
```

#### Interface만 확장 확인

```typescript
// ✅ 올바른 확장 (Interface만 확장)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
  
  interface User {
    id?: string;
  }
}
```

### 예방 방법

- 타입 확장 파일은 모듈 이름과 다른 이름 사용 (`auth.d.ts`, `types.d.ts` 등)
- Interface만 확장하고 함수/변수 타입은 변경하지 않음
- 타입 확장 후 실제 사용 코드에서 타입 추론 확인

### 관련 데브로그

- [DEVLOG_2025-12-24_NEXTAUTH_TYPE_AUGMENTATION_ISSUE.md](../../apps/my-app/docs/DEVLOG_2025-12-24_NEXTAUTH_TYPE_AUGMENTATION_ISSUE.md)

---

## 7. NextAuth Session 타입 확장 충돌

### 문제 상황

Session 타입 확장 시 `AdapterUser`와 호환되지 않는 타입 오류

```
Type '{ id: string; provider?: AuthProvider; name?: string | null; email: string | null; ... }' is not assignable to type 'AdapterUser & { id: string; provider?: AuthProvider; } & User'.
  Types of property 'email' are incompatible. Type 'string | null' is not assignable to type 'string'.
```

### 원인 분석

- `AdapterUser`의 `email`은 `string`이지만, 확장된 타입은 `string | null`
- 타입 호환성 문제 발생

### 해결 방법

#### 타입 단언 사용

```typescript
// ✅ 타입 단언으로 해결
if (token.user) {
  session.user = {
    ...session.user,
    ...token.user,
  } as typeof session.user;
}
```

### 예방 방법

- 타입 확장 시 기존 타입과의 호환성 확인
- 필요한 경우 타입 단언 사용
- `AdapterUser` 타입과의 호환성 고려

### 관련 데브로그

- [DEVLOG_2025-12-24_NEXTAUTH_TYPE_AUGMENTATION_ISSUE.md](../../apps/my-app/docs/DEVLOG_2025-12-24_NEXTAUTH_TYPE_AUGMENTATION_ISSUE.md)

---

## 8. any 타입 제거 및 unknown 타입 가드 패턴

### 문제 상황

`any` 타입 사용으로 타입 안전성 손실

```typescript
// ❌ 타입 안전하지 않음
const NextAuth = NextAuthLib as any;
```

### 해결 방법

#### unknown 타입 + 타입 가드

```typescript
// ✅ unknown 타입 + 타입 가드
function isValidConfig(config: unknown): config is NextAuthConfig {
  return (
    typeof config === 'object' &&
    config !== null &&
    'providers' in config
  );
}

const config: unknown = getConfig();
if (isValidConfig(config)) {
  // config는 NextAuthConfig 타입으로 보장됨
}
```

### 핵심 포인트

1. **any 제거**: `any` 대신 `unknown` 사용
2. **타입 가드**: 타입 가드로 안전하게 타입 좁히기
3. **런타임 검증**: Zod 등으로 런타임 검증

### 관련 데브로그

- [DEVLOG_2025-12-24_NEXTAUTH_V5_TYPE_SAFETY_IMPROVEMENTS.md](../devlogs/DEVLOG_2025-12-24_NEXTAUTH_V5_TYPE_SAFETY_IMPROVEMENTS.md)

---

## 9. React 19 forwardRef JSX 타입 호환성 문제

### 문제 상황

React 19 + Next.js 15 환경에서 `forwardRef` 컴포넌트가 JSX로 사용 불가

```
Type error: 'Icon' cannot be used as a JSX component.
  Its type 'ForwardRefExoticComponent<...>' is not a valid JSX element type.
```

### 원인 분석

React 19에서 JSX 타입 시스템이 변경되어 `forwardRef`로 생성된 컴포넌트가 JSX 요소로 인식 안됨

```typescript
// React 18에서는 정상 작동
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <button ref={ref} {...props} />
})

// React 19에서는 JSX 타입 에러 발생
<Button>Click me</Button> // ❌ 타입 에러
```

### 해결 방법

#### 1. 명시적 반환 타입 (부분적 해결)

```typescript
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref): React.ReactElement => {
    return <button ref={ref} {...props} />
  }
)
```

#### 2. 빌드 시 타입 체크 우회 (임시 해결)

```javascript
// next.config.js
const nextConfig = {
  typescript: {
    // ⚠️ 타입 안전성 포기 - 임시 해결책
    ignoreBuildErrors: true,
  },
}
```

### 리스크 완화 전략

#### 개발 시 타입 체크 유지

```bash
# 개발 환경에서는 타입 체크 유지
npm run type-check
```

#### CI/CD에서 타입 검증

```yaml
# .github/workflows/type-check.yml
- name: Type Check
  run: npm run type-check
```

#### 런타임 타입 검증 추가

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// 런타임에서 타입 검증
const validateUser = (data: unknown) => UserSchema.parse(data);
```

### 롤백 계획

```bash
# React 18로 다운그레이드
npm install react@18.2.0 react-dom@18.2.0

# next.config.js에서 ignoreBuildErrors 제거
```

### 예방 방법

- React 19 마이그레이션 전 충분한 테스트
- `forwardRef` 컴포넌트 목록 파악
- UI 라이브러리 React 19 지원 확인
- 롤백 계획 준비

### 관련 데브로그

- [DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY.md](../archive/devlogs/2025-07/DEVLOG_2025-07-23_REACT_19_JSX_TYPE_COMPATIBILITY.md)

---

**작성자**: Auto (AI Assistant)
**최종 업데이트**: 2026-02-06

