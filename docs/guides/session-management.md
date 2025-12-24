# Session Management 가이드

## 개요

이 가이드는 HUA Platform의 세션 관리 시스템을 사용하는 방법을 설명합니다. NextAuth를 기반으로 한 타입 안전한 세션 헬퍼 함수들을 제공하여, API 라우트와 서버 컴포넌트에서 일관된 방식으로 세션 데이터에 접근할 수 있습니다.

## 주요 헬퍼 함수

### 서버 사이드 (`app/lib/session-utils-server.ts`)

#### `getSessionUserId(session: Session | null): string | null`

세션에서 사용자 ID를 안전하게 추출합니다.

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getSessionUserId } from '@/app/lib/session-utils-server';

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // userId 사용
}
```

**반환값:**
- 사용자 ID가 있으면: `string`
- 세션이 없거나 사용자 ID가 없으면: `null`

#### `requireAuth(session: Session | null): string`

인증이 필수인 경우 사용자 ID를 반환합니다. 인증되지 않은 경우 401 에러 응답을 throw합니다.

```typescript
import { requireAuth } from '@/app/lib/session-utils-server';

export async function POST() {
  const session = await getServerSession(authOptions);
  
  try {
    const userId = requireAuth(session);
    // userId 사용 (항상 string 보장)
  } catch (error) {
    // error는 NextResponse (401 Unauthorized)
    return error;
  }
}
```

**주의:** 이 함수는 `NextResponse`를 throw하므로, try-catch로 처리하거나 함수에서 직접 return해야 합니다.

#### `getSessionProvider(session: Session | null): AuthProvider | undefined`

세션에서 인증 제공자를 가져옵니다.

```typescript
import { getSessionProvider } from '@/app/lib/session-utils-server';

const provider = getSessionProvider(session);
// 'kakao' | 'google' | 'credentials' | undefined
```

#### `isSocialLogin(session: Session | null): boolean`

소셜 로그인 여부를 확인합니다.

```typescript
import { isSocialLogin } from '@/app/lib/session-utils-server';

const isSocial = isSocialLogin(session);
// true: kakao 또는 google 로그인
// false: credentials 로그인 또는 세션 없음
```

#### `getSessionUser(session: Session | null)`

세션에서 사용자 정보를 안전하게 추출합니다.

```typescript
import { getSessionUser } from '@/app/lib/session-utils-server';

const user = getSessionUser(session);
// {
//   id: string;
//   email?: string | null;
//   name?: string | null;
//   image?: string | null;
//   provider?: AuthProvider;
// } | null
```

### 클라이언트 사이드 (`app/lib/session-utils.ts`)

클라이언트 컴포넌트에서는 `useSession` 훅과 함께 사용합니다.

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { getSessionUserId, getSessionProvider } from '@/app/lib/session-utils';

export function MyComponent() {
  const { data: session } = useSession();
  const userId = getSessionUserId(session);
  const provider = getSessionProvider(session);
  
  // ...
}
```

## API 라우트 작성 시 체크리스트

### 1. 세션 확인

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { getSessionUserId, requireAuth } from '@/app/lib/session-utils-server';

export async function GET() {
  // 옵션 1: 선택적 인증 (게스트 허용)
  const session = await getServerSession(authOptions);
  const userId = getSessionUserId(session);
  
  if (!userId) {
    // 게스트 모드 처리 또는 에러 반환
  }
  
  // 옵션 2: 필수 인증
  try {
    const userId = requireAuth(session);
    // userId 사용
  } catch (error) {
    return error; // NextResponse (401)
  }
}
```

### 2. 게스트 모드 지원

게스트 모드를 지원하는 API는 다음과 같이 작성합니다:

```typescript
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  let userId = getSessionUserId(session);
  let isGuest = false;
  
  if (!userId) {
    // 게스트 사용자 생성/조회
    const { getOrCreateGuestUser } = await import('@/app/lib/guest-utils');
    const guestUser = await getOrCreateGuestUser(request, 'diary_write');
    userId = guestUser.id;
    isGuest = true;
  }
  
  // userId 사용
}
```

### 3. 소셜 로그인 구분

소셜 로그인 사용자에게만 특별한 처리가 필요한 경우:

```typescript
import { isSocialLogin } from '@/app/lib/session-utils-server';

const isSocial = isSocialLogin(session);
if (isSocial) {
  // 소셜 로그인 전용 로직
}
```

## 마이그레이션 가이드

### 기존 코드에서 마이그레이션

**Before:**
```typescript
const userId = session?.user?.id;
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

**After:**
```typescript
import { requireAuth } from '@/app/lib/session-utils-server';

try {
  const userId = requireAuth(session);
  // userId 사용
} catch (error) {
  return error;
}
```

또는:

```typescript
import { getSessionUserId } from '@/app/lib/session-utils-server';

const userId = getSessionUserId(session);
if (!userId) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Graphite 스택 분리 예시

Session Utils 관련 작업을 Graphite 스택으로 분리할 때:

```bash
# 스택 1: Session Utils 헬퍼 함수 추가
gt create -m "feat(my-app): add session utils helper functions"

# 스택 2: API 라우트에 적용
gt create -m "refactor(my-app): use session utils in API routes"

# 스택 3: 테스트 작성
gt create -m "test(my-app): add session utils tests"

# 스택 4: 문서화
gt create -m "docs: add session management guide"
```

## 베스트 프랙티스

1. **타입 안전성**: 항상 헬퍼 함수를 사용하여 타입 안전하게 세션 데이터에 접근
2. **에러 처리**: `requireAuth()` 사용 시 try-catch로 처리
3. **게스트 모드**: 게스트 사용자를 지원하는 API는 명시적으로 처리
4. **일관성**: 프로젝트 전체에서 동일한 헬퍼 함수 사용

## 테스트

Session Utils는 Vitest를 사용하여 테스트됩니다:

```bash
pnpm --filter=my-app test
```

테스트 파일: `apps/my-app/app/lib/__tests__/session-utils-server.test.ts`

## 참고 자료

- [NextAuth 문서](https://next-auth.js.org/)
- [Session Utils 소스 코드](../../apps/my-app/app/lib/session-utils-server.ts)
- [Session Utils 테스트](../../apps/my-app/app/lib/__tests__/session-utils-server.test.ts)

