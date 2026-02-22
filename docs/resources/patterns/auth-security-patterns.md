# 인증/인가 보안 패턴

**작성일**: 2025-12-23  
**목적**: 인증/인가 시스템의 보안 패턴 및 최적화 기법 정리

---

## 목차

1. [일기 소유권 확인 패턴](#일기-소유권-확인-패턴)
2. [관리자 권한 확인 패턴](#관리자-권한-확인-패턴)
3. [DB 조회 최적화 패턴](#db-조회-최적화-패턴)
4. [Higher-Order Function 패턴](#higher-order-function-패턴)
5. [테스트 환경 지원 패턴](#테스트-환경-지원-패턴)

---

## 일기 소유권 확인 패턴

### 문제 상황

일기 API에서 사용자가 다른 사용자의 일기를 조회/수정/삭제할 수 있는 보안 취약점이 있었습니다.

### 해결 방법

**유틸리티 함수 생성**: `apps/my-app/app/lib/diary-auth.ts`

```typescript
// 소유권 확인과 조회를 한 번에 수행 (성능 최적화)
export async function getDiaryWithOwnershipCheck<T>(
  diaryId: string,
  request: NextRequest,
  includeOptions?: T
) {
  const targetUserId = await getUserId(request);
  
  if (!targetUserId) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      ),
      diary: null
    };
  }

  // 소유권 확인과 일기 조회를 한 번에 수행
  const diary = await prisma.diaryEntry.findFirst({
    where: {
      id: diaryId,
      user_id: targetUserId, // 쿼리 레벨에서 소유권 확인
      deleted_at: null, // 삭제된 일기 제외
    },
    include: includeOptions,
  });

  if (!diary) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "일기를 찾을 수 없거나 접근 권한이 없습니다." },
        { status: 404 }
      ),
      diary: null
    };
  }

  return {
    authorized: true,
    userId: targetUserId,
    diary
  };
}
```

**사용 예시**:
```typescript
// GET /api/diary/[id]
const result = await getDiaryWithOwnershipCheck(id, request, {
  analysis_results: { /* ... */ },
  user: { /* ... */ },
});

if (!result.authorized || !result.diary) {
  return result.response!;
}

const diary = result.diary;
// ... 일기 처리 로직
```

### 핵심 포인트

1. **쿼리 레벨 보안**: `where: { id, user_id, deleted_at: null }` 조건으로 DB 레벨에서 소유권 확인
2. **성능 최적화**: 소유권 확인과 일기 조회를 한 번의 쿼리로 처리
3. **게스트 사용자 지원**: IP 기반 게스트 사용자도 지원

### 예방 방법

- 모든 리소스 접근 API에 소유권 확인 적용
- 쿼리 레벨에서 소유권 확인 (애플리케이션 레벨보다 안전)
- 테스트로 검증 (보안 검증 테스트 작성)

---

## 관리자 권한 확인 패턴

### 문제 상황

관리자 API에 권한 확인이 없어 일반 사용자도 접근할 수 있는 보안 취약점이 있었습니다.

### 해결 방법

**유틸리티 함수**: `apps/my-app/app/lib/admin.ts`

```typescript
// 기본 패턴
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    return { isAdmin: false, error: "Unauthorized" };
  }

  const isAdmin = await checkAdminPermission((session.user as any).id);
  
  if (!isAdmin) {
    return { isAdmin: false, userId: (session.user as any).id, error: "Forbidden" };
  }

  return { isAdmin: true, userId: (session.user as any).id };
}
```

**사용 예시**:
```typescript
// API 라우트
export async function GET() {
  const { isAdmin, userId, error } = await requireAdmin();
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: error === 'Unauthorized' ? '인증이 필요합니다.' : '관리자 권한이 필요합니다.' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }
  
  // 관리자 로직...
}
```

### 핵심 포인트

1. **일관된 에러 처리**: Unauthorized(401) vs Forbidden(403) 구분
2. **DB 레벨 확인**: 세션만으로 판단하지 않고 DB에서 role 확인
3. **재사용 가능**: 모든 관리자 API에서 동일한 패턴 사용

---

## DB 조회 최적화 패턴

### 문제 상황

소유권 확인을 위해 DB를 2번 조회하는 비효율적인 패턴이 있었습니다:
1. 소유권 확인 (1회)
2. 일기 조회 (1회)

### 해결 방법

**쿼리 레벨에서 소유권 확인**:

```typescript
// ❌ 비효율적 (2회 조회)
const ownership = await checkDiaryOwnership(diaryId);
const diary = await prisma.diaryEntry.findUnique({ where: { id: diaryId } });

// ✅ 최적화 (1회 조회)
const diary = await prisma.diaryEntry.findFirst({
  where: {
    id: diaryId,
    user_id: targetUserId, // 쿼리 레벨에서 소유권 확인
    deleted_at: null,
  },
});
```

### 성능 개선 효과

- **DB 쿼리 수**: 50% 감소 (2회 → 1회)
- **응답 시간**: 20-30% 개선 예상
- **보안**: 쿼리 레벨 보안으로 더 안전

### 핵심 포인트

1. **쿼리 레벨 보안**: `where` 조건에 `user_id` 포함
2. **소프트 딜리트 대응**: `deleted_at: null` 조건 포함
3. **성능과 보안의 시너지**: 최적화가 보안도 강화

---

## Higher-Order Function 패턴

### 문제 상황

관리자 API마다 동일한 권한 확인 코드가 반복되어 중복이 발생했습니다.

### 해결 방법

**Higher-Order Function 패턴**:

```typescript
// apps/my-app/app/lib/admin.ts
export function withAdmin(
  handler: (request: Request, context: { userId: string }) => Promise<Response> | Response
) {
  return async (request: Request): Promise<Response> => {
    const { isAdmin, userId, error } = await requireAdmin();
    
    if (!isAdmin) {
      const status = error === "Unauthorized" ? 401 : 403;
      return NextResponse.json(
        { 
          error: error === "Unauthorized" ? "인증이 필요합니다." : "관리자 권한이 필요합니다." 
        },
        { status }
      );
    }
    
    // 관리자 권한 확인 완료, 핸들러 실행
    return handler(request, { userId: userId! });
  };
}
```

**사용 예시**:
```typescript
// ❌ 기존 방식 (중복)
export async function GET() {
  const { isAdmin, userId, error } = await requireAdmin();
  if (!isAdmin) { return ... }
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

### 주의사항

- Next.js Route Handler와의 호환성 고려 필요
- 과도한 사용은 오히려 복잡도를 높일 수 있음
- 테스트 환경에서의 동작 확인 필요

---

## 테스트 환경 지원 패턴

### 문제 상황

테스트 환경에서 `getServerSession`이 Next.js request context 밖에서 호출되어 에러가 발생했습니다.

### 해결 방법

**테스트 환경 감지 및 처리**:

```typescript
export async function getUserId(
  request?: NextRequest,
  userId?: string
): Promise<string | null> {
  // userId가 직접 전달되면 세션 확인 없이 사용 (테스트 환경 지원)
  if (userId) {
    return userId;
  }
  
  // Next.js request context가 없는 경우 (테스트 환경 등)
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user && (session.user as any).id) {
      return (session.user as any).id;
    }
  } catch (error) {
    // request context가 없는 경우 (테스트 환경) - 무시하고 계속 진행
    if (error instanceof Error && error.message.includes('request scope')) {
      // 테스트 환경에서는 세션 없이 진행
    } else {
      throw error;
    }
  }
  
  // 게스트 사용자 확인...
  return null;
}
```

### 핵심 포인트

1. **테스트 친화적**: `userId` 직접 전달 시 세션 확인 건너뛰기
2. **에러 처리**: request context 없는 경우 graceful handling
3. **프로덕션 안전**: 실제 환경에서는 정상 작동 보장

---

## UUID 형식 검증 패턴

### 문제 상황

잘못된 UUID 형식으로 인해 Prisma가 에러를 발생시켰습니다.

### 해결 방법

**UUID 형식 검증 추가**:

```typescript
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function checkDiaryOwnership(
  diaryId: string,
  request?: NextRequest,
  userId?: string
) {
  // UUID 형식 검증 (잘못된 형식이면 Not Found로 처리)
  if (!isValidUUID(diaryId)) {
    return { isOwner: false, userId: targetUserId, error: "Not Found" };
  }
  
  // ... 소유권 확인 로직
}
```

### 핵심 포인트

1. **사전 검증**: DB 쿼리 전에 형식 검증
2. **보안**: 잘못된 입력에 대한 적절한 응답
3. **성능**: 불필요한 DB 쿼리 방지

---

## 보안 검증 테스트 패턴

### 테스트 시나리오

제미나이 제안에 따라 다음 시나리오를 테스트합니다:

1. **시나리오 A**: 본인의 일기 ID로 조회 시 정상 응답 (200 OK)
2. **시나리오 B**: 타인의 일기 ID로 조회 시 차단 (403 Forbidden)
3. **시나리오 C**: 존재하지 않는 일기 ID 조회 시 (404 Not Found)
4. **시나리오 D**: 삭제된 일기 ID 조회 시 (404 Not Found)

### 테스트 파일

`apps/my-app/scripts/tests/test-diary-ownership-security.ts`

**실행 방법**:
```bash
# 로컬
pnpm test:diary-ownership-security:local

# Doppler
pnpm test:diary-ownership-security
```

### 핵심 포인트

1. **Happy Path & Edge Case**: 정상 케이스와 예외 케이스 모두 테스트
2. **자동화**: CI/CD에 통합 가능
3. **검증**: 보안 취약점 조기 발견

---

## 관련 데브로그

- [2025-12-23 - 인증/인가 시스템 최적화 및 보안 강화](../devlogs/DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md)

---

## 참고 문서

- [Goal Tree: 인증/인가 시스템 완성](../GT_AUTH_AUTHORIZATION_COMPLETE.md)
- [diary-auth.ts](../../../apps/my-app/app/lib/diary-auth.ts)
- [admin.ts](../../../apps/my-app/app/lib/admin.ts)

---

**작성자**: AI Assistant  
**최종 업데이트**: 2025-12-23

