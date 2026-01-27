# 소프트 딜리트(Soft Delete) 기능 구현 계획

## 📅 작성일
2025-12-15

## 🎯 목적

일기 삭제를 소프트 딜리트로 전환하여 **실수 방지**와 **악의적 삭제 방지**를 동시에 달성합니다.

### 핵심 가치
- **사용자 보호**: 감정적 충동으로 인한 삭제 후 후회 방지
- **보안 강화**: 타인에 의한 악의적 삭제로부터 데이터 보호
- **CS 효율성**: 복구 요청 시 빠른 대응 가능

---

## 🔒 보안 전략: "보이지 않는 안전망"

### 핵심 원칙
**"사용자 눈에는 '삭제'로 보이지만, 시스템은 '유예'로 처리한다."**

### 왜 휴지통 UI를 노출하지 않는가?
- **보안상 위험**: 악의적인 접근자가 휴지통까지 비워서 완전 삭제 가능
- **프라이버시**: 삭제된 데이터가 보관 중임을 노출하지 않음
- **심리적 안심**: 사용자는 완전히 삭제되었다고 믿고 안심

### Ghost Backup 전략
1. **앱 화면**: 즉시 리스트에서 사라짐 (완전 삭제된 것처럼 보임)
2. **DB 내부**: `deleted_at` 타임스탬프만 찍히고 데이터는 30일간 보존
3. **암호화 유지**: 삭제된 데이터도 암호화 상태 유지 (프라이버시 보장)

---

## 📋 구현 계획

### 1. 데이터베이스 스키마 변경

#### 1.1 DiaryEntry 모델 수정
```prisma
model DiaryEntry {
  id          String    @id @db.Uuid
  // ... 기존 필드들
  
  deleted_at  DateTime? @db.Timestamptz(6)  // 소프트 딜리트 타임스탬프
  deleted_by  String?  @db.Uuid             // 삭제한 사용자 ID (타인 삭제 추적용)
  
  // 인덱스 추가 (삭제된 일기 조회 성능)
  @@index([user_id, deleted_at])
  @@index([deleted_at])  // 자동 정리 작업용
}
```

#### 1.2 마이그레이션 전략
- 기존 `deleted_at`이 없는 데이터는 `null`로 처리
- 기존 삭제된 일기는 복구 불가 (Hard Delete로 처리됨)

---

### 2. 삭제 API 수정

#### 2.1 소프트 딜리트로 변경
**파일**: `app/api/diary/[id]/route.ts` (DELETE 메서드)

**변경 전**:
```typescript
await prisma.diaryEntry.delete({
  where: { id: diaryId }
});
```

**변경 후**:
```typescript
// 소프트 딜리트: deleted_at만 설정
await prisma.diaryEntry.update({
  where: { id: diaryId },
  data: {
    deleted_at: new Date(),
    deleted_by: currentUserId,  // 삭제한 사용자 추적
  }
});
```

#### 2.2 삭제 시 보안 강화 (선택사항)
**생체인증/비밀번호 요구**:
- 일기 작성: 자유롭게 작성
- 일기 삭제: Face ID / 비밀번호 추가 인증 요구
- 효과: 타인에 의한 삭제 99% 방지

**구현 위치**: `app/diary/[id]/page.tsx` (삭제 버튼 클릭 시)

```typescript
const handleDelete = async () => {
  // 생체인증 요구
  const authenticated = await requestBiometricAuth();
  if (!authenticated) {
    return; // 인증 실패 시 삭제 중단
  }
  
  // 소프트 딜리트 실행
  await deleteDiary(diaryId);
};
```

---

### 3. 조회 쿼리 수정

#### 3.1 삭제된 일기 제외
**모든 조회 쿼리에 `deleted_at IS NULL` 조건 추가**

**파일들**:
- `app/api/diary/route.ts` (일기 목록 조회)
- `app/api/diary/[id]/route.ts` (단일 일기 조회)
- `app/lib/analysis-query-helpers.ts` (분석 결과 조회)

**변경 예시**:
```typescript
// 변경 전
const diaries = await prisma.diaryEntry.findMany({
  where: { user_id: userId }
});

// 변경 후
const diaries = await prisma.diaryEntry.findMany({
  where: {
    user_id: userId,
    deleted_at: null  // 삭제되지 않은 일기만 조회
  }
});
```

#### 3.2 Prisma Client 확장 (선택사항)
**자동으로 `deleted_at IS NULL` 필터링**:
```typescript
// app/lib/prisma.ts
const prisma = new PrismaClient().$extends({
  query: {
    diaryEntry: {
      findMany({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      },
      findUnique({ args, query }) {
        args.where = { ...args.where, deleted_at: null };
        return query(args);
      }
    }
  }
});
```

---

### 4. 자동 정리 작업 (Cron Job)

#### 4.1 30일 경과 데이터 영구 삭제
**목적**: 저장 공간 절약, 프라이버시 보장

**구현 위치**: `app/api/admin/cleanup-deleted-diaries/route.ts` (또는 별도 스크립트)

**로직**:
```typescript
// 30일 이상 지난 삭제된 일기 영구 삭제
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const deletedDiaries = await prisma.diaryEntry.findMany({
  where: {
    deleted_at: {
      not: null,
      lte: thirtyDaysAgo
    }
  },
  select: { id: true }
});

// 관련 데이터도 함께 삭제
await prisma.$transaction(async (tx) => {
  for (const diary of deletedDiaries) {
    // AnalysisResult 삭제
    await tx.analysisResult.deleteMany({
      where: { diary_id: diary.id }
    });
    
    // DiaryEntry 영구 삭제
    await tx.diaryEntry.delete({
      where: { id: diary.id }
    });
  }
});
```

**실행 주기**: 매일 새벽 2시 (Vercel Cron Jobs 또는 별도 스케줄러)

---

### 5. 복구 기능 (Admin Only)

#### 5.1 복구 API 엔드포인트
**파일**: `app/api/admin/diary/[id]/restore/route.ts`

**권한**: Admin만 접근 가능

**로직**:
```typescript
// POST /api/admin/diary/[id]/restore
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin 권한 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 본인 확인 (UUID 해시값 대조 등)
  const { userId } = await request.json();
  const diary = await prisma.diaryEntry.findUnique({
    where: { id: params.id },
    select: { user_id: true, deleted_at: true }
  });
  
  if (!diary || diary.user_id !== userId) {
    return NextResponse.json({ error: 'Not found or user mismatch' }, { status: 404 });
  }
  
  if (!diary.deleted_at) {
    return NextResponse.json({ error: 'Not deleted' }, { status: 400 });
  }
  
  // 복구: deleted_at을 null로 변경
  await prisma.diaryEntry.update({
    where: { id: params.id },
    data: {
      deleted_at: null,
      deleted_by: null
    }
  });
  
  return NextResponse.json({ success: true });
}
```

#### 5.2 복구 프로세스
1. **사용자 요청**: "일기가 삭제되었어요. 복구 가능한가요?"
2. **본인 확인**: 가입 계정 UUID 해시값 대조
3. **Admin 조회**: `deleted_at IS NOT NULL`인 일기 목록 확인
4. **복구 실행**: `deleted_at = null`로 업데이트
5. **결과**: 사용자가 앱을 다시 켜면 일기가 복구되어 있음

---

### 6. 프론트엔드 변경사항

#### 6.1 삭제 버튼 동작
**변경 없음**: 사용자 경험은 동일하게 유지
- 삭제 버튼 클릭 → 확인 다이얼로그 → 삭제 완료
- 일기는 즉시 리스트에서 사라짐

#### 6.2 생체인증 추가 (선택사항)
**파일**: `app/diary/[id]/page.tsx`

```typescript
import { useBiometricAuth } from '@/app/hooks/useBiometricAuth';

const handleDelete = async () => {
  // 생체인증 요구
  const authenticated = await requestBiometricAuth();
  if (!authenticated) {
    toast.error('인증에 실패했습니다. 삭제가 취소되었습니다.');
    return;
  }
  
  // 삭제 실행
  await deleteDiary(diaryId);
};
```

---

## 🔐 보안 고려사항

### 1. 암호화 유지
- **원칙**: 삭제된 데이터도 암호화 상태 유지
- **이유**: 프라이버시 보장, 데이터 유출 방지

### 2. 삭제 추적
- **`deleted_by` 필드**: 누가 삭제했는지 추적
- **용도**: 타인 삭제 케이스 확인, 보안 감사

### 3. 즉시 완전 삭제 옵션 (선택사항)
- **시나리오**: 사용자가 "정말 완전히 지우고 싶다"고 요청
- **구현**: Admin에서 Hard Delete 옵션 제공
- **경고**: "이 작업은 복구 불가능합니다" 명시

---

## 📊 운영 정책

### 1. 보관 기간
- **기본**: 30일
- **변경 가능**: 환경 변수로 설정 (`SOFT_DELETE_RETENTION_DAYS=30`)

### 2. 복구 정책
- **CS 채널**: 이메일, 문의하기 폼
- **본인 확인**: 계정 UUID 해시값 대조
- **처리 시간**: 영업일 기준 24시간 이내

### 3. 자동 정리
- **실행 주기**: 매일 새벽 2시
- **대상**: 30일 이상 지난 삭제된 일기
- **알림**: 정리된 일기 수 로깅 (모니터링용)

---

## 🧪 테스트 계획

### 1. 단위 테스트
- 소프트 딜리트 실행 테스트
- 조회 쿼리에서 삭제된 일기 제외 테스트
- 복구 기능 테스트

### 2. 통합 테스트
- 삭제 → 조회 (사라짐 확인)
- 삭제 → 복구 → 조회 (복구 확인)
- 30일 경과 → 자동 정리 확인

### 3. 보안 테스트
- 타인 삭제 시나리오 테스트
- 생체인증 우회 시도 테스트
- Admin 권한 없는 복구 시도 테스트

---

## 📝 구현 체크리스트

### Phase 1: 기본 구현
- [ ] Prisma 스키마에 `deleted_at`, `deleted_by` 필드 추가
- [ ] 마이그레이션 생성 및 실행
- [ ] 삭제 API를 소프트 딜리트로 변경
- [ ] 모든 조회 쿼리에 `deleted_at IS NULL` 조건 추가
- [ ] 프론트엔드 삭제 버튼 동작 확인 (변경 없음)

### Phase 2: 보안 강화
- [ ] 삭제 시 생체인증 요구 기능 추가 (선택사항)
- [ ] `deleted_by` 필드로 삭제 추적 구현
- [ ] Admin 복구 API 구현
- [ ] 본인 확인 프로세스 구현

### Phase 3: 자동화
- [ ] 자동 정리 Cron Job 구현
- [ ] 보관 기간 환경 변수화
- [ ] 정리 작업 모니터링 로깅

### Phase 4: 문서화
- [ ] Admin 가이드 작성 (복구 프로세스)
- [ ] CS 대응 매뉴얼 작성
- [ ] 사용자 FAQ 업데이트 (필요 시)

---

## 🚨 주의사항

### 1. 마이그레이션 시 주의
- 기존 삭제된 일기는 복구 불가 (Hard Delete로 처리됨)
- 프로덕션 배포 전 백업 필수

### 2. 성능 고려
- `deleted_at` 인덱스 필수 (조회 성능)
- 자동 정리 작업은 트랜잭션으로 처리 (원자성 보장)

### 3. 프라이버시
- 삭제된 데이터 보관 사실을 사용자에게 노출하지 않음
- CS 대응 시에도 "백업이 있을 수 있다"는 식으로만 언급

---

## 💡 향후 개선 가능 사항

### 1. 사용자 직접 복구 (선택사항)
- **조건**: 보안이 강화된 후 (생체인증 필수 등)
- **구현**: 숨겨진 복구 메뉴 또는 특정 제스처로 접근
- **장점**: CS 부담 감소

### 2. 보관 기간 사용자 선택
- **옵션**: 7일, 14일, 30일, 90일
- **기본값**: 30일
- **프리미엄**: 더 긴 보관 기간 제공

### 3. 삭제 이력 관리
- **목적**: 누가 언제 삭제했는지 추적
- **구현**: 별도 `DeletionLog` 테이블
- **용도**: 보안 감사, 이상 패턴 탐지

---

## 📚 참고 자료

- [Prisma Soft Delete Pattern](https://www.prisma.io/docs/guides/performance-and-optimization/soft-deletes)
- [Database Soft Delete Best Practices](https://www.postgresql.org/docs/current/ddl-partitioning.html)
- [Security: Biometric Authentication](https://developer.apple.com/documentation/localauthentication)

---

**작성자**: HUA Platform 개발팀  
**태그**: `#soft-delete` `#security` `#data-protection` `#future-feature` `#privacy` `#backup` `#recovery` `#biometric-auth` `#ghost-backup`
