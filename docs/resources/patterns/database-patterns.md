# 데이터베이스 패턴

**작성일**: 2025-12-24  
**목적**: 데이터베이스 관련 반복되는 패턴과 해결 방법 정리

---

## 목차

1. [Race Condition 해결 패턴 (Atomic Increment)](#race-condition-해결-패턴-atomic-increment)
2. [UUIDv7 마이그레이션 패턴](#uuidv7-마이그레이션-패턴)
3. [Prisma Lazy Initialization 패턴](#prisma-lazy-initialization-패턴)
4. [DB 조회 최적화 패턴](#db-조회-최적화-패턴)
5. [로그 테이블 TTL 전략](#로그-테이블-ttl-전략)
6. [Prisma 7.1 마이그레이션 패턴](#prisma-71-마이그레이션-패턴)

---

## Race Condition 해결 패턴 (Atomic Increment)

### 문제 상황

사용자가 동시에 일기 저장 버튼을 2번 누르면, UserQuota 체크를 동시에 통과해서 제한을 넘길 수 있음

```typescript
// ❌ Race Condition 발생 가능
const quota = await prisma.userQuota.findUnique({ where: { user_id: userId } });
if (quota.remaining > 0) {
  await prisma.userQuota.update({
    where: { user_id: userId },
    data: { remaining: { decrement: 1 } }
  });
  // 다른 요청이 동시에 체크를 통과할 수 있음
}
```

### 원인 분석

- 체크와 증가가 별도의 트랜잭션으로 실행
- 동시 요청 시 두 요청 모두 체크를 통과
- 비용 폭탄 가능성 (AI API 호출 제한 우회)

### 해결 방법

#### Atomic Increment 사용 ✅

```typescript
// ✅ Atomic Increment로 Race Condition 방지
export async function checkAndIncrement(
  userId: string,
  period: 'daily' | 'monthly',
  limit: number
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  return await prisma.$transaction(async (tx) => {
    const quota = await tx.userQuota.findUnique({
      where: { user_id: userId },
    });

    const count = period === 'daily' ? quota.daily_diary_count : quota.monthly_diary_count;
    if (count >= limit) {
      return { allowed: false, remaining: 0, resetAt };
    }

    // Atomic Increment (체크와 증가를 원자적으로 처리)
    await tx.userQuota.update({
      where: { user_id: userId },
      data: {
        [period === 'daily' ? 'daily_diary_count' : 'monthly_diary_count']: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: limit - count - 1,
      resetAt,
    };
  });
}
```

### 핵심 포인트

1. **트랜잭션 사용**: `prisma.$transaction`으로 원자적 처리
2. **Atomic Increment**: Prisma의 `increment` 연산자 활용
3. **체크와 증가 통합**: 한 번의 트랜잭션으로 처리

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## UUIDv7 마이그레이션 패턴

### 문제 상황

UUID v4는 랜덤 기반이라 시간순 정렬이 불가능하고, 인덱스 효율이 낮음

### 해결 방법

#### UUIDv7 도입

```typescript
// ✅ UUIDv7 생성 (시간 기반 + 랜덤)
import { uuidv7 } from 'uuid';

function generateUUID(): string {
  return uuidv7(); // 시간순 정렬 가능
}
```

#### Prisma 스키마 변경

```prisma
// 변경 전
id String @id @default(uuid()) @db.Uuid

// 변경 후 (Node.js에서 생성)
id String @id @default(uuidv7()) @db.Uuid
```

### 핵심 포인트

1. **시간순 정렬**: `ORDER BY id`만으로 최신순 정렬 가능
2. **인덱스 효율**: B-tree 인덱스 효율 향상
3. **생성 시간 추출**: UUID에서 직접 생성 시간 추출 가능

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## Prisma Lazy Initialization 패턴

### 문제 상황

서버리스 환경에서 Prisma Client가 빌드 타임에 초기화되어 환경 변수가 없을 때 에러 발생

### 해결 방법

#### Lazy Initialization

```typescript
// ✅ Lazy Initialization
let prismaClient: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaClient) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required');
    }
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
  }
  return prismaClient;
}

export const prisma = getPrismaClient();
```

### 핵심 포인트

1. **지연 초기화**: 실제 사용 시에만 초기화
2. **환경 변수 검증**: 초기화 시점에 검증
3. **서버리스 최적화**: Cold start 최적화

### 관련 데브로그

- [DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md](../devlogs/DEVLOG_2025-12-04_VERCEL_BUILD_ERROR_FIX.md)

---

## DB 조회 최적화 패턴

### 문제 상황

소유권 확인과 조회를 별도로 수행하여 2번의 DB 쿼리 발생

```typescript
// ❌ 비효율적 (2회 조회)
const ownership = await checkDiaryOwnership(diaryId);
const diary = await prisma.diaryEntry.findUnique({ where: { id: diaryId } });
```

### 해결 방법

#### 쿼리 레벨에서 소유권 확인

```typescript
// ✅ 최적화 (1회 조회)
const diary = await prisma.diaryEntry.findFirst({
  where: {
    id: diaryId,
    user_id: targetUserId, // 쿼리 레벨에서 소유권 확인
    deleted_at: null,
  },
});
```

### 핵심 포인트

1. **쿼리 레벨 보안**: `where` 조건에 `user_id` 포함
2. **소프트 딜리트 대응**: `deleted_at: null` 조건 포함
3. **성능과 보안 시너지**: 최적화가 보안도 강화

### 관련 데브로그

- [DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md](../devlogs/DEVLOG_2025-12-23_AUTH_AUTHORIZATION_OPTIMIZATION.md)

---

## 로그 테이블 TTL 전략

### 문제 상황

로그 테이블이 무한정 증가하여 DB 용량 문제 발생

### 해결 방법

#### TTL 기반 정리

```typescript
// ✅ TTL 기반 로그 정리
export async function cleanupOldLogs() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // ApiLog 3개월 이전 삭제
  await prisma.apiLog.deleteMany({
    where: {
      created_at: {
        lt: threeMonthsAgo,
      },
    },
  });
  
  // LoginLog 6개월 이전 삭제
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  await prisma.loginLog.deleteMany({
    where: {
      created_at: {
        lt: sixMonthsAgo,
      },
    },
  });
}
```

### 핵심 포인트

1. **TTL 설정**: ApiLog 3개월, LoginLog 6개월
2. **Cron 작업**: 정기적으로 실행
3. **DB 용량 안정화**: 무한정 증가 방지

### 관련 데브로그

- [DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md](../devlogs/DEVLOG_2025-12-14_UUIDV7_MIGRATION_AND_CRITICAL_FIXES.md)

---

## Prisma 7.1 마이그레이션 패턴

### 문제 상황

Prisma 7.0에서 7.1로 업그레이드 시 타입 변경 및 호환성 문제

### 해결 방법

#### 점진적 마이그레이션

1. **의존성 업데이트**: `package.json`에서 버전 업데이트
2. **타입 체크**: 마이그레이션 후 타입 오류 확인
3. **테스트**: 기존 기능 테스트

### 핵심 포인트

1. **점진적 업그레이드**: 단계별 마이그레이션
2. **타입 안전성**: 타입 오류 해결 필수
3. **테스트 강화**: 마이그레이션 후 테스트

### 관련 데브로그

- [DEVLOG_2025-12-15_BUILD_FIXES_AND_PRISMA_7_MIGRATION.md](../devlogs/DEVLOG_2025-12-15_BUILD_FIXES_AND_PRISMA_7_MIGRATION.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-24

