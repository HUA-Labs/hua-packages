# 결제 시스템 스키마 검토

> 작성일: 2025-12-16  
> 결제 시스템 스키마 추가 후 검토 결과

## 검토 항목

### 1. 기존 스키마 패턴 일관성 ✅

#### Decimal 타입
- ✅ **일관성**: `Decimal(10, 2)` 패턴 사용
  - `BillingRecord`: `Decimal(10, 2)` (USD)
  - `Plan.price_monthly`, `Plan.price_yearly`: `Decimal(10, 2)` (KRW)
  - `Subscription.amount`: `Decimal(10, 2)` (KRW)
  - `Payment.amount`, `Payment.refund_amount`: `Decimal(10, 2)` (KRW)

#### 타임스탬프 패턴
- ✅ **일관성**: `@db.Timestamptz(6)` 사용
  - 모든 모델에서 `created_at`, `updated_at` 동일 패턴
  - `@default(now())`, `@updatedAt` 자동 관리

#### 인덱스 전략
- ✅ **일관성**: 기존 패턴 준수
  - `[user_id, created_at]`: 사용자별 시간순 조회
  - `[status, created_at]`: 상태별 시간순 조회
  - 외래 키 인덱스: 조회 성능 최적화

#### 스키마 분리
- ✅ **일관성**: `user` 스키마 사용
  - `Plan`, `Subscription`, `Payment`, `PaymentMethod` 모두 `user` 스키마
  - `BillingRecord`는 `admin` 스키마 유지 (목적 분리)

### 2. 제안 문서와의 일치 여부 ✅

#### 추가된 개선사항
- ✅ `PaymentMethod`에 `@@index([toss_billing_key])` 추가 (웹훅 처리용)
- ✅ `Subscription`에 `quotas` relation 추가 (`UserQuota`와 연결)

#### 제안 문서와 동일한 부분
- ✅ Enum 타입 정의 (`SubscriptionStatus`, `PaymentStatus`)
- ✅ 모델 구조 및 필드명
- ✅ 토스페이먼트 키 필드명
- ✅ Relations 구조

### 3. 잠재적 문제점 및 개선 제안

#### ⚠️ Subscription.user_id @unique 제약

**현재 상태:**
```prisma
model Subscription {
  user_id String @unique @db.Uuid // 한 사용자는 하나의 활성 구독만
}
```

**검토 결과:**
- ✅ **의도한 대로**: 제안 문서에서 "한 사용자는 하나의 활성 구독만" 명시
- ✅ **비즈니스 로직**: 현재는 1:1 관계로 충분
- ⚠️ **향후 확장성**: 다중 구독 필요 시 제약 해제 필요

**권장사항:**
- 현재는 유지 (1:1 관계)
- 향후 다중 구독 필요 시 `@unique` 제거하고 `status = 'ACTIVE'` 조건으로 필터링

#### ⚠️ PaymentMethod.toss_billing_key @unique 제약

**현재 상태:**
```prisma
model PaymentMethod {
  toss_billing_key String @unique // 토스페이먼트 빌링 키
}
```

**검토 결과:**
- ✅ **의도한 대로**: 토스페이먼트에서 빌링 키는 고유값
- ✅ **데이터 무결성**: 중복 방지

**권장사항:**
- 현재 구조 유지

#### ⚠️ UserQuota.subscription_id 추가

**현재 상태:**
```prisma
model UserQuota {
  subscription_id String? @db.Uuid
  is_premium Boolean @default(false) // 런칭 전까지 유지
  subscription Subscription? @relation(...)
}
```

**검토 결과:**
- ✅ **마이그레이션 전략**: `is_premium`은 런칭 전까지 유지
- ✅ **관계 설정**: `Subscription`과 연결 완료
- ⚠️ **할당량 동기화**: `Plan`에서 할당량을 가져오는 로직 필요

**권장사항:**
- 런칭 전에 `is_premium` 제거
- 할당량은 `Subscription.plan`을 통해 `Plan`에서 가져오도록 구현

### 4. 인덱스 최적화 검토 ✅

#### 조회 패턴별 인덱스

**사용자별 결제 내역 조회:**
```prisma
@@index([user_id, created_at]) // ✅ 적절함
```

**구독별 결제 내역 조회:**
```prisma
@@index([subscription_id]) // ✅ 적절함
```

**상태별 결제 조회:**
```prisma
@@index([status]) // ✅ 적절함
```

**토스페이먼트 웹훅 처리:**
```prisma
@@index([toss_payment_key]) // ✅ unique이지만 인덱스 명시적 추가 좋음
@@index([toss_billing_key]) // ✅ PaymentMethod에도 추가됨
```

**만료 예정 구독 조회:**
```prisma
@@index([current_period_end]) // ✅ 스케줄러 작업용
@@index([cancel_at]) // ✅ 취소 예정 구독 조회용
```

**활성 플랜 조회:**
```prisma
@@index([is_active, is_public]) // ✅ 복합 인덱스 적절함
```

### 5. Relations 검토 ✅

#### User 모델
```prisma
subscription Subscription?
payments Payment[]
payment_methods PaymentMethod[]
```
- ✅ **1:1 관계**: `subscription` (한 사용자는 하나의 활성 구독)
- ✅ **1:N 관계**: `payments`, `payment_methods`

#### Subscription 모델
```prisma
user User @relation(...)
plan Plan @relation(...)
payments Payment[]
quotas UserQuota[]
```
- ✅ **N:1 관계**: `user`, `plan`
- ✅ **1:N 관계**: `payments`, `quotas`

#### Payment 모델
```prisma
user User @relation(...)
subscription Subscription? @relation(...)
```
- ✅ **N:1 관계**: `user` (필수)
- ✅ **N:1 관계**: `subscription` (선택, 일반 결제는 구독 없을 수 있음)

#### PaymentMethod 모델
```prisma
user User @relation(...)
```
- ✅ **N:1 관계**: `user`

### 6. 데이터 무결성 검토 ✅

#### Foreign Key 제약
- ✅ `onDelete: Cascade`: 사용자 삭제 시 관련 데이터 자동 삭제
- ✅ `onDelete: SetNull`: 구독 삭제 시 결제 내역은 유지 (선택적)

#### Unique 제약
- ✅ `Plan.name`: 플랜 이름 중복 방지
- ✅ `Subscription.user_id`: 한 사용자당 하나의 구독
- ✅ `Payment.toss_payment_key`: 토스페이먼트 결제 키 중복 방지
- ✅ `PaymentMethod.toss_billing_key`: 토스페이먼트 빌링 키 중복 방지

### 7. 토스페이먼트 연동 준비도 ✅

#### 필수 필드 확인
- ✅ `toss_payment_key`: 결제 승인 후 저장
- ✅ `toss_billing_key`: 자동결제용 빌링 키
- ✅ `toss_customer_key`: 브랜드페이/자동결제 고객 식별
- ✅ `toss_order_id`: 주문번호 (고유값)
- ✅ `toss_method`, `toss_method_type`: 결제 수단 정보

#### 웹훅 처리 준비
- ✅ `toss_payment_key` 인덱스: 결제 웹훅 처리용
- ✅ `toss_billing_key` 인덱스: 구독 웹훅 처리용
- ✅ `metadata` Json 필드: 토스페이먼트 응답 전체 저장 가능

### 8. 마이그레이션 전략 검토 ✅

#### 1단계: 새 테이블 추가
- ✅ Enum 타입 생성 (`SubscriptionStatus`, `PaymentStatus`)
- ✅ 4개 테이블 생성 (`Plan`, `Subscription`, `Payment`, `PaymentMethod`)
- ✅ Relations 설정

#### 2단계: 기존 모델 수정
- ✅ `User` 모델에 Relations 추가
- ✅ `UserQuota` 모델에 `subscription_id` 추가
- ✅ `is_premium` 필드는 런칭 전까지 유지

#### 3단계: 기본 플랜 생성
- ⚠️ **필요**: 시드 스크립트 또는 마이그레이션에서 기본 플랜 생성
- ⚠️ **권장**: `BASIC` (무료), `PREMIUM` (유료) 플랜 생성

### 9. 개선 제안

#### 1. 기본 플랜 시드 데이터 추가
```typescript
// prisma/seed.ts 또는 마이그레이션에서
const basicPlan = await prisma.plan.create({
  data: {
    name: 'BASIC',
    display_name: '베이직',
    description: '무료 플랜',
    daily_diary_limit: 10,
    monthly_diary_limit: 300,
    daily_analysis_limit: 10,
    monthly_analysis_limit: 300,
    price_monthly: 0,
    price_yearly: 0,
    is_active: true,
    is_public: true,
    sort_order: 0,
  },
});
```

#### 2. 할당량 동기화 로직
```typescript
// UserQuota에서 Subscription을 통해 Plan 할당량 가져오기
async function getQuotaLimits(userId: string) {
  const quota = await prisma.userQuota.findUnique({
    where: { user_id: userId },
    include: {
      subscription: {
        include: { plan: true },
      },
    },
  });

  if (quota?.subscription?.plan) {
    return {
      daily_diary_limit: quota.subscription.plan.daily_diary_limit,
      monthly_diary_limit: quota.subscription.plan.monthly_diary_limit,
      daily_analysis_limit: quota.subscription.plan.daily_analysis_limit,
      monthly_analysis_limit: quota.subscription.plan.monthly_analysis_limit,
    };
  }

  // 기본값 (구독 없을 때)
  return {
    daily_diary_limit: 10,
    monthly_diary_limit: 300,
    daily_analysis_limit: 10,
    monthly_analysis_limit: 300,
  };
}
```

#### 3. 인덱스 추가 검토 (선택사항)
```prisma
// Payment 모델에 추가 고려
@@index([status, created_at]) // 상태별 시간순 조회 (대시보드용)
@@index([paid_at]) // 이미 있음 ✅
```

### 10. 최종 검토 결과

#### ✅ 통과 항목
1. 기존 스키마 패턴 일관성
2. 제안 문서와의 일치 여부
3. 인덱스 최적화
4. Relations 구조
5. 데이터 무결성
6. 토스페이먼트 연동 준비도

#### ⚠️ 주의사항
1. `Subscription.user_id @unique`: 향후 다중 구독 필요 시 제약 해제
2. `UserQuota.is_premium`: 런칭 전에 제거 필요
3. 기본 플랜 시드 데이터 생성 필요
4. 할당량 동기화 로직 구현 필요

#### 📝 권장사항
1. 마이그레이션 전에 기본 플랜 시드 데이터 준비
2. 할당량 동기화 로직 구현 (구독 생성/변경 시)
3. 런칭 전에 `is_premium` 필드 제거
4. 토스페이먼트 웹훅 엔드포인트 구현

## 결론

**스키마 검토 결과: ✅ 통과**

현재 스키마는 기존 패턴과 일관성을 유지하며, 토스페이먼트 연동을 위한 필수 필드와 인덱스가 모두 준비되어 있습니다. 

**다음 단계:**
1. 마이그레이션 생성 및 적용
2. 기본 플랜 시드 데이터 생성
3. 할당량 동기화 로직 구현
4. 토스페이먼트 연동 코드 구현

---

**작성일**: 2025-12-16  
**검토자**: AI Assistant  
**상태**: ✅ 검토 완료, 마이그레이션 준비 완료
