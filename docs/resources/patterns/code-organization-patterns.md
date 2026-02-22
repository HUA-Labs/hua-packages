# 코드 구조 패턴

**작성일**: 2025-12-24  
**목적**: 코드 구조 및 재사용성 관련 반복되는 패턴과 해결 방법 정리

---

## 목차

1. [Higher-Order Function 패턴 (HOC)](#higher-order-function-패턴-hoc)
2. [Session Utils 전역 적용 패턴](#session-utils-전역-적용-패턴)

---

## Higher-Order Function 패턴 (HOC)

### 문제 상황

관리자 API마다 동일한 권한 확인 코드가 반복되어 중복 발생

### 해결 방법

#### Higher-Order Function 패턴

```typescript
// ✅ Higher-Order Function 패턴
export function withAdmin(
  handler: (request: NextRequest, context: { userId: string }) => Promise<Response> | Response,
  options?: {
    userLimitPerMinute?: number;
    ipLimitPerMinute?: number;
    enableRateLimit?: boolean;
  }
) {
  return async (request: NextRequest): Promise<Response> => {
    const { isAdmin, userId, error } = await requireAdmin();
    
    if (!isAdmin) {
      const status = error === "Unauthorized" ? 401 : 403;
      return NextResponse.json(
        { error: error === "Unauthorized" ? "인증이 필요합니다." : "관리자 권한이 필요합니다." },
        { status }
      );
    }
    
    // Rate Limiting 체크 (옵션이 활성화된 경우)
    if (options?.enableRateLimit) {
      const rateLimitResponse = await checkRateLimitMiddleware(request, {
        userLimitPerMinute: options.userLimitPerMinute || 100,
        ipLimitPerMinute: options.ipLimitPerMinute || 200,
        userId: userId!,
        ip: getClientIp(request),
      });

      if (rateLimitResponse) {
        return rateLimitResponse;
      }
    }
    
    // 관리자 권한 확인 완료, 핸들러 실행
    return handler(request, { userId: userId! });
  };
}
```

#### 사용 예시

```typescript
// ❌ 기존 방식 (중복)
export async function GET() {
  const { isAdmin, userId, error } = await requireAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  // 관리자 로직...
}

// ✅ Higher-Order Function 패턴
export const GET = withAdmin(async (request: NextRequest, { userId }) => {
  // userId는 관리자 ID로 보장됨
  // 관리자 로직...
});
```

### 핵심 포인트

1. **코드 중복 제거**: 권한 확인 로직을 한 곳에 집중
2. **타입 안전성**: `userId`가 보장된 상태로 핸들러 실행
3. **일관된 에러 처리**: 모든 관리자 API에서 동일한 에러 응답

### 관련 데브로그

- [DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md](../devlogs/DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md)

---

## Session Utils 전역 적용 패턴

### 문제 상황

`(session.user as any).id` 패턴이 여러 곳에 반복되어 타입 안전성 부족

### 해결 방법

#### Session Utils 헬퍼 함수 생성

```typescript
// ✅ Session Utils 헬퍼 함수
// apps/my-app/app/lib/session-utils-server.ts
export function getSessionUserId(session: Session | null): string | null {
  if (!session?.user) {
    return null;
  }
  return (session.user as { id?: string }).id ?? null;
}

export function requireAuth(session: Session | null): { userId: string; response?: never } | { userId?: never; response: NextResponse } {
  const userId = getSessionUserId(session);
  if (!userId) {
    return {
      response: NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      ),
    };
  }
  return { userId };
}
```

#### 전역 적용

```typescript
// ✅ 모든 API 라우트에서 사용
export async function GET(request: NextRequest) {
  const session = await auth();
  const result = requireAuth(session);
  
  if (result.response) {
    return result.response;
  }
  
  const userId = result.userId; // 타입 안전
  // ...
}
```

### 핵심 포인트

1. **타입 안전성**: `(session.user as any).id` 패턴 제거
2. **일관된 패턴**: 모든 API 라우트에서 동일한 패턴 사용
3. **유지보수성**: 세션 접근 로직이 한 곳에 집중

### 관련 데브로그

- [DEVLOG_2025-12-24_SESSION_UTILS_GLOBAL_APPLICATION.md](../devlogs/DEVLOG_2025-12-24_SESSION_UTILS_GLOBAL_APPLICATION.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

