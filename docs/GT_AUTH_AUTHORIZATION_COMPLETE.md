# GT: 인증/인가 시스템 완성

**작성일**: 2025-12-23  
**상태**: 진행 중  
**우선순위**: P0 (Critical)

---

## 목표

인증/인가 시스템을 완성하여 보안 취약점을 해결하고, 모든 TODO 주석을 제거합니다.

---

## 문제 상황

### 발견된 문제

1. **TODO 주석 20개 발견**
   - 관리자 권한 확인 미구현 (15개)
   - 사용자 권한 확인 미구현 (3개)
   - 일기 소유권 확인 미구현 (2개)

2. **보안 취약점**
   - 권한 없는 사용자가 다른 사용자 데이터 접근 가능
   - 관리자 API에 권한 확인 없음
   - 일기 API에 소유권 확인 없음

3. **리스크**
   - 데이터 유출 위험
   - GDPR 위반 가능성
   - 악의적 사용자 공격 가능

### 발견된 위치

**관리자 API (15개)**:
- `app/api/admin/diary/status/route.ts`
- `app/api/admin/diary/deleted/route.ts`
- `app/api/admin/diary/[id]/restore/route.ts`
- `app/api/admin/diary/[id]/delete/route.ts`
- `app/api/admin/dashboard/route.ts`
- `app/api/admin/notifications/test-data/route.ts`
- `app/admin/monitoring/errors/page.tsx`
- `app/admin/monitoring/performance/page.tsx`
- `app/admin/users/[id]/page.tsx`
- `app/admin/users/[id]/status/page.tsx`
- `app/admin/users/[id]/moderation/page.tsx`
- `app/admin/notifications/[id]/page.tsx`
- `app/admin/announcements/page.tsx`
- `app/admin/announcements/[id]/page.tsx`

**사용자 API (3개)**:
- `app/diary/write/page.tsx` - userId 전달
- 기타 일기 관련 API

---

## 해결 전략

### 단계 1: 관리자 권한 확인 구현 (우선순위 높음)

**목표**: 모든 관리자 API와 페이지에 권한 확인 추가

**작업 항목**:
1. API 라우트에 `requireAdmin()` 적용
2. 클라이언트 페이지에 권한 확인 로직 추가
3. 일관된 에러 응답 구현

**기존 유틸리티 활용**:
- `app/lib/admin.ts`의 `requireAdmin()` 함수 사용
- `checkAdminPermission()` 함수 활용

### 단계 2: 사용자 권한 확인 구현

**목표**: 일기 소유권 확인 및 사용자 권한 검증

**작업 항목**:
1. 일기 API에 소유권 확인 미들웨어 추가
2. 사용자별 데이터 접근 제어
3. 세션 기반 인증 확인

### 단계 3: TODO 주석 제거 및 문서화

**목표**: 모든 TODO 주석 제거 및 구현 완료 확인

**작업 항목**:
1. TODO 주석 제거
2. 구현 완료 확인
3. 테스트 작성

---

## 작업 항목

### 🔴 P0 - 관리자 권한 확인 (15개)

#### API 라우트 (6개)
- [ ] `app/api/admin/diary/status/route.ts`
- [ ] `app/api/admin/diary/deleted/route.ts`
- [ ] `app/api/admin/diary/[id]/restore/route.ts`
- [ ] `app/api/admin/diary/[id]/delete/route.ts`
- [ ] `app/api/admin/dashboard/route.ts`
- [ ] `app/api/admin/notifications/test-data/route.ts`

#### 클라이언트 페이지 (9개)
- [ ] `app/admin/monitoring/errors/page.tsx`
- [ ] `app/admin/monitoring/performance/page.tsx`
- [ ] `app/admin/users/[id]/page.tsx`
- [ ] `app/admin/users/[id]/status/page.tsx`
- [ ] `app/admin/users/[id]/moderation/page.tsx`
- [ ] `app/admin/notifications/[id]/page.tsx`
- [ ] `app/admin/announcements/page.tsx`
- [ ] `app/admin/announcements/[id]/page.tsx`

### 🟡 P1 - 사용자 권한 확인 (3개)

- [ ] 일기 소유권 확인 미들웨어 생성
- [ ] 일기 API에 소유권 확인 적용
- [ ] `app/diary/write/page.tsx` userId 전달 수정

### 🟢 P2 - 정리 및 문서화

- [ ] 모든 TODO 주석 제거
- [ ] 테스트 작성
- [ ] 문서 업데이트

---

## 구현 가이드

### 관리자 권한 확인 패턴

**API 라우트**:
```typescript
import { requireAdmin } from '@/app/lib/admin';

export async function GET(request: Request) {
  const { isAdmin, userId, error } = await requireAdmin();
  
  if (!isAdmin) {
    return NextResponse.json(
      { error: error || 'Forbidden' },
      { status: error === 'Unauthorized' ? 401 : 403 }
    );
  }
  
  // 관리자 권한 확인 완료, 로직 진행
  // ...
}
```

**클라이언트 페이지**:
```typescript
"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      // 관리자 권한 확인
      fetch('/api/user/admin-check')
        .then(res => res.json())
        .then(data => {
          if (!data.isAdmin) {
            router.push("/");
          }
        })
        .catch(() => router.push("/"));
    }
  }, [status, router]);

  // ...
}
```

### 일기 소유권 확인 패턴

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function checkDiaryOwnership(diaryId: string, userId: string): Promise<boolean> {
  const diary = await prisma.diaryEntry.findUnique({
    where: { id: diaryId },
    select: { user_id: true }
  });
  
  return diary?.user_id === userId;
}

// API에서 사용
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const isOwner = await checkDiaryOwnership(params.id, userId);
  
  if (!isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 소유권 확인 완료, 로직 진행
  // ...
}
```

---

## 예상 작업량

- **관리자 권한 확인**: 2-3일
- **사용자 권한 확인**: 1-2일
- **테스트 및 문서화**: 1일

**총 예상 작업량**: 4-6일

---

## 체크리스트

### 구현 전
- [x] 문제 상황 파악
- [x] Goal Tree 문서 생성
- [ ] Graphite 스택 생성

### 구현 중
- [ ] 관리자 API 권한 확인 구현
- [ ] 관리자 페이지 권한 확인 구현
- [ ] 일기 소유권 확인 구현
- [ ] 사용자 권한 확인 구현

### 구현 후
- [ ] 모든 TODO 주석 제거
- [ ] 테스트 작성
- [ ] 문서 업데이트
- [ ] 코드 리뷰

---

## 참고 문서

- `apps/my-app/docs/analysis/BETA_LAUNCH_IMPROVEMENTS.md`
- `apps/my-app/docs/architecture/AUTH_AND_AUTHORIZATION.md`
- `apps/my-app/app/lib/admin.ts`

