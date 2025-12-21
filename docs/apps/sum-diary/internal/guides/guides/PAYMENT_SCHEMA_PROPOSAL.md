# 결제 시스템 스키마 제안

> 작성일: 2025-12-16  
> 토스페이먼트 연동을 위한 결제/구독 테이블 구조 제안

## 개요

토스페이먼트 등 결제 시스템 연동을 위한 스키마 설계입니다. 구독 기반 결제 모델을 지원합니다.

**토스페이먼트 문서 참고:**
- [시작하기](https://docs.tosspayments.com/guides/v2/get-started)
- [자동결제(빌링)](https://docs.tosspayments.com/guides/v2/billing/integration)
- [브랜드페이](https://docs.tosspayments.com/guides/v2/brandpay/integration)
- [웹훅 연결하기](https://docs.tosspayments.com/guides/v2/webhook)

## 제안하는 테이블 구조

> **참고**: 기존 스키마 패턴을 따릅니다
> - 스키마 분리: `user` 스키마 사용 (사용자 데이터)
> - 타임스탬프: `created_at`, `updated_at` 자동 관리
> - Decimal 타입: 비용은 `Decimal(10, 2)` 사용 (기존 `BillingRecord` 패턴)
> - 인덱스: 조회 패턴에 맞춘 전략적 인덱싱

### 1. Plan (플랜 정보)

```prisma
model Plan {
  @@schema("user")
  id          String   @id @default(uuid()) @db.Uuid
  name        String   // "BASIC", "PREMIUM", "PRO" 등
  display_name String  // "베이직", "프리미엄", "프로"
  description String?  @db.Text
  
  // 할당량 (기존 UserQuota 패턴 참고)
  daily_diary_limit   Int @default(10)  // 하루 일기 작성 제한
  monthly_diary_limit Int @default(300) // 월간 일기 작성 제한
  daily_analysis_limit   Int @default(10)  // 하루 분석 제한
  monthly_analysis_limit Int @default(300) // 월간 분석 제한
  
  // 가격 정보 (기존 BillingRecord의 Decimal 패턴 참고)
  price_monthly Decimal @db.Decimal(10, 2) // 월간 가격 (KRW)
  price_yearly Decimal? @db.Decimal(10, 2) // 연간 가격 (KRW, 할인율 적용)
  
  // 기능 플래그
  features Json? // { "advanced_analysis": true, "export": true, "priority_support": true, ... }
  
  // 상태
  is_active Boolean @default(true)
  is_public Boolean @default(true) // 공개 여부
  
  // 메타데이터
  sort_order Int @default(0) // 정렬 순서
  created_at DateTime @default(now()) @db.Timestamptz(6)
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  
  // Relations
  subscriptions Subscription[]
  
  @@unique([name])
  @@index([is_active, is_public]) // 활성 플랜 조회
  @@index([sort_order]) // 정렬된 플랜 목록 조회
}
```

### 2. Subscription (구독 정보)

```prisma
model Subscription {
  @@schema("user")
  id          String   @id @default(uuid()) @db.Uuid
  user_id     String   @unique @db.Uuid // 한 사용자는 하나의 활성 구독만
  
  // 플랜 정보
  plan_id     String   @db.Uuid
  plan        Plan     @relation(fields: [plan_id], references: [id])
  
  // 토스페이먼트 정보 (토스페이먼트 API 참고)
  toss_payment_key String? // 토스페이먼트 결제 키 (paymentKey, 결제 승인 후 발급)
  toss_billing_key String? // 토스페이먼트 빌링 키 (billingKey, 자동결제용)
  toss_customer_key String? // 토스페이먼트 고객 키 (customerKey, 브랜드페이/자동결제용)
  
  // 구독 상태
  status SubscriptionStatus @default(ACTIVE)
  // ACTIVE: 활성 구독
  // CANCELLED: 취소됨 (기간 만료까지 사용 가능)
  // EXPIRED: 만료됨
  // SUSPENDED: 일시 정지 (결제 실패 등)
  
  // 구독 기간
  started_at   DateTime @db.Timestamptz(6) // 구독 시작일
  current_period_start DateTime @db.Timestamptz(6) // 현재 결제 주기 시작일
  current_period_end   DateTime @db.Timestamptz(6) // 현재 결제 주기 종료일
  cancel_at    DateTime? @db.Timestamptz(6) // 취소 예정일 (기간 만료 시 취소)
  cancelled_at DateTime? @db.Timestamptz(6) // 실제 취소일
  
  // 결제 정보
  billing_cycle String @default("monthly") // "monthly" | "yearly"
  amount        Decimal @db.Decimal(10, 2) // 현재 구독 금액 (KRW)
  
  // 취소 정보
  cancel_reason String? // 취소 사유
  cancel_requested_at DateTime? @db.Timestamptz(6)
  
  // 메타데이터
  created_at DateTime @default(now()) @db.Timestamptz(6)
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  
  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  payments Payment[]
  
  @@index([user_id])
  @@index([status])
  @@index([current_period_end]) // 만료 예정 구독 조회
  @@index([cancel_at]) // 취소 예정 구독 조회
  @@index([toss_billing_key]) // 토스페이먼트 웹훅 처리용
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  SUSPENDED
  
  @@schema("user")
}
```

### 3. Payment (결제 내역)

```prisma
model Payment {
  @@schema("user")
  id          String   @id @default(uuid()) @db.Uuid
  user_id     String   @db.Uuid
  subscription_id String? @db.Uuid
  
  // 토스페이먼트 정보 (토스페이먼트 API 참고)
  toss_payment_key String? @unique // 토스페이먼트 결제 키 (paymentKey)
  toss_order_id    String? // 주문 ID (orderId, 고유 주문번호)
  toss_method      String? // 결제 수단: "카드", "가상계좌", "계좌이체", "휴대폰", "상품권" 등
  toss_method_type String? // 결제 수단 타입: "CARD", "VIRTUAL_ACCOUNT", "ACCOUNT_TRANSFER", "MOBILE", "GIFT_CERTIFICATE" 등
  
  // 결제 정보 (기존 BillingRecord의 Decimal 패턴 참고)
  amount      Decimal @db.Decimal(10, 2) // 결제 금액 (KRW)
  currency    String  @default("KRW")
  status      PaymentStatus @default(PENDING)
  // PENDING: 결제 대기
  // SUCCESS: 결제 성공
  // FAILED: 결제 실패
  // CANCELLED: 결제 취소
  // REFUNDED: 환불됨
  
  // 결제 상세
  description String? // 결제 설명
  order_name  String? // 주문명 (orderName)
  customer_email String? // 고객 이메일
  customer_name String? // 고객명
  metadata    Json?   // 추가 메타데이터 (토스페이먼트 응답 전체 저장 가능)
  
  // 환불 정보 (기존 BillingRecord의 Decimal 패턴 참고)
  refund_amount Decimal? @db.Decimal(10, 2)
  refund_reason String?
  refunded_at   DateTime? @db.Timestamptz(6)
  
  // 메타데이터
  created_at DateTime @default(now()) @db.Timestamptz(6)
  paid_at    DateTime? @db.Timestamptz(6) // 실제 결제 완료 시각
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  
  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  subscription Subscription? @relation(fields: [subscription_id], references: [id], onDelete: SetNull)
  
  @@index([user_id, created_at])
  @@index([subscription_id])
  @@index([status])
  @@index([toss_payment_key])
  @@index([toss_order_id])
  @@index([paid_at])
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  CANCELLED
  REFUNDED
  
  @@schema("user")
}
```

### 4. PaymentMethod (결제 수단) - 선택사항

```prisma
model PaymentMethod {
  @@schema("user")
  id          String   @id @default(uuid()) @db.Uuid
  user_id     String   @db.Uuid
  
  // 토스페이먼트 정보 (토스페이먼트 API 참고)
  toss_billing_key String @unique // 토스페이먼트 빌링 키 (billingKey, 자동결제용)
  toss_customer_key String? // 토스페이먼트 고객 키 (customerKey, 브랜드페이/자동결제용)
  toss_method      String // 결제 수단: "카드", "계좌이체" 등
  toss_method_type String? // 결제 수단 타입: "CARD", "ACCOUNT_TRANSFER" 등
  
  // 카드 정보 (마스킹)
  card_company String? // "신한", "KB" 등
  card_number  String? // "1234-****-****-5678" (마스킹)
  
  // 기본 결제 수단 여부
  is_default Boolean @default(false)
  
  // 상태
  is_active Boolean @default(true)
  
  // 메타데이터
  created_at DateTime @default(now()) @db.Timestamptz(6)
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  
  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id])
  @@index([is_default])
  @@index([is_active])
}
```

## User 모델 수정

```prisma
model User {
  // ... 기존 필드 ...
  
  // Relations 추가
  subscription Subscription?
  payments     Payment[]
  payment_methods PaymentMethod[]
}
```

## UserQuota 모델 수정

기존 `UserQuota` 모델을 구독 시스템과 연동:

```prisma
model UserQuota {
  @@schema("user")
  id              String   @id @default(uuid()) @db.Uuid
  user_id         String   @unique @db.Uuid
  
  // 일기 작성 할당 (Plan에서 가져오기)
  daily_diary_limit   Int @default(10)
  monthly_diary_limit Int @default(300)
  
  // AI 분석 할당 (Plan에서 가져오기)
  daily_analysis_limit   Int @default(10)
  monthly_analysis_limit Int @default(300)
  
  // 현재 사용량
  daily_diary_count   Int @default(0)
  monthly_diary_count Int @default(0)
  daily_analysis_count   Int @default(0)
  monthly_analysis_count Int @default(0)
  
  // 리셋 시각
  daily_reset_at   DateTime @db.Timestamptz(6)
  monthly_reset_at DateTime @db.Timestamptz(6)
  
  // 구독 연동 (is_premium 대체)
  subscription_id String? @db.Uuid
  
  updated_at DateTime @updatedAt @db.Timestamptz(6)
  
  // Relations
  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  subscription Subscription? @relation(fields: [subscription_id], references: [id], onDelete: SetNull)
  
  @@index([user_id])
  @@index([daily_reset_at]) // 일일 리셋 작업용
  @@index([monthly_reset_at]) // 월간 리셋 작업용
  @@index([subscription_id]) // 구독별 할당량 조회
}
```

**변경 사항:**
- `is_premium` 필드 제거
- `subscription_id` 추가하여 구독과 직접 연결
- 할당량은 `Plan`에서 가져오거나 `Subscription`을 통해 동적으로 계산

## 마이그레이션 전략

### 1단계: 새 테이블 추가
```sql
-- Plan, Subscription, Payment, PaymentMethod 테이블 생성
-- Prisma 마이그레이션으로 생성
pnpm db:migrate:local --name add_payment_tables
```

**기존 필드 유지:**
- `UserQuota.is_premium` 필드는 일단 유지 (하위 호환성)
- 런칭 전이므로 나중에 제거 가능

### 2단계: 기본 플랜 생성
```typescript
// 시드 스크립트 또는 마이그레이션에서 실행
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

### 3단계: 기존 데이터 마이그레이션 (선택)
```typescript
// 기존 is_premium=true 사용자를 기본 플랜으로 구독 생성
const premiumUsers = await prisma.userQuota.findMany({
  where: { is_premium: true },
  include: { user: true },
});

for (const quota of premiumUsers) {
  await prisma.subscription.create({
    data: {
      user_id: quota.user_id,
      plan_id: basicPlan.id, // 또는 PREMIUM 플랜 ID
      status: 'ACTIVE',
      started_at: quota.user.created_at,
      current_period_start: new Date(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30일 후
      billing_cycle: 'monthly',
      amount: 0, // 무료 플랜
    },
  });
}
```

### 4단계: 코드 업데이트
- `is_premium` 체크를 `subscription.status === 'ACTIVE'`로 변경
- UserQuota에서 subscription 정보 참조하도록 수정
- 할당량은 Plan에서 가져오도록 수정

### 5단계: 정리 (런칭 전)
- `is_premium` 필드 제거
- 마이그레이션 실행

## 토스페이먼트 연동 포인트

### 1. 일반 결제 (일회성)
**결제 수단**: 카드, 간편결제, 퀵계좌이체, 가상계좌, 휴대폰, 상품권

**흐름:**
1. 클라이언트: 결제창 띄우기 (`TossPayments.requestPayment()`)
2. 사용자: 결제 수단 선택 및 결제
3. 서버: 결제 승인 API 호출 (`/v1/payments/confirm`)
4. 데이터베이스: `Payment` 생성 (status: SUCCESS)
5. 구독 생성 또는 갱신: `Subscription` 생성/업데이트

**필수 정보:**
- `orderId`: 고유 주문번호
- `amount`: 결제 금액
- `paymentKey`: 결제 키 (결제 승인 후 발급)

### 2. 자동결제 (빌링) - 구독형
**결제 수단**: 카드

**흐름:**
1. 첫 결제: 일반 결제로 진행하여 `billingKey` 발급
2. 구독 생성: `Subscription` 생성, `toss_billing_key` 저장
3. 자동 결제: `current_period_end` 전에 빌링 키로 자동 결제
4. 성공 시: `Payment` 생성, `Subscription` 갱신
5. 실패 시: `Subscription.status = SUSPENDED`

**필수 정보:**
- `billingKey`: 자동결제용 빌링 키
- `customerKey`: 고객 식별 키 (선택사항)

### 3. 브랜드페이 (자체 간편결제)
**결제 수단**: 카드, 계좌이체

**흐름:**
1. 클라이언트: 브랜드페이 결제창 띄우기 (`brandpay.requestPayment()`)
2. OAuth 인증: 리다이렉트 URL로 이동하여 인증
3. Access Token 발급: 인증 후 토큰 발급
4. 결제 승인: 서버에서 결제 승인 API 호출
5. 데이터베이스: `Payment` 생성

**필수 정보:**
- `customerKey`: 고객 식별 키 (필수)
- `redirectUrl`: 리다이렉트 URL
- `successUrl`, `failUrl`: 성공/실패 URL

### 4. 웹훅 처리
**웹훅 이벤트:**
- `payment.confirmed`: 결제 승인 완료
- `payment.canceled`: 결제 취소
- `billing.subscription.issued`: 구독 발급
- `billing.subscription.revoked`: 구독 해지

**처리 방법:**
- 토스페이먼트 웹훅 엔드포인트 생성
- `paymentKey` 또는 `billingKey`로 조회하여 상태 업데이트
- `Payment` 또는 `Subscription` 상태 업데이트

### 5. 구독 취소
- 사용자 요청 시 `cancel_at` 설정
- `current_period_end`까지 사용 가능
- 기간 만료 시 `status = EXPIRED`
- 필요 시 환불 처리 (`Payment.status = REFUNDED`)

## 기존 스키마 패턴 반영

### 1. 스키마 분리
- **`user` 스키마**: 사용자 관련 데이터 (Plan, Subscription, Payment, PaymentMethod)
- **`admin` 스키마**: 운영자용 데이터 (기존 BillingRecord는 admin 스키마 유지)

### 2. 타임스탬프 패턴
- `created_at`: `@default(now()) @db.Timestamptz(6)`
- `updated_at`: `@updatedAt @db.Timestamptz(6)`
- 기존 모델들과 동일한 패턴

### 3. Decimal 타입
- 비용 필드: `Decimal @db.Decimal(10, 2)` (기존 `BillingRecord` 패턴)
- 정밀도: 소수점 2자리 (원 단위)

### 4. 인덱스 전략
- 조회 패턴에 맞춘 복합 인덱스
- 외래 키 인덱스
- 날짜 범위 조회 인덱스

### 5. 관계 관리
- Cross-Schema 참조: FK 없이 참조만 유지 (기존 패턴)
- `onDelete: Cascade` 또는 `SetNull` 적절히 사용

## 토스페이먼트 API 키 구조

### 클라이언트 키 (Client Key)
- **용도**: 클라이언트(프론트엔드)에서 결제창 띄우기
- **저장 위치**: 환경 변수 (`NEXT_PUBLIC_TOSS_CLIENT_KEY`)
- **보안**: 공개되어도 안전 (시크릿 키와 분리)

### 시크릿 키 (Secret Key)
- **용도**: 서버에서 결제 승인, 취소, 환불 등
- **저장 위치**: 환경 변수 (`TOSS_SECRET_KEY`)
- **보안**: 절대 공개 금지

### 결제 키 (Payment Key)
- **용도**: 결제 승인, 조회, 취소
- **저장 위치**: `Payment.toss_payment_key`
- **발급 시점**: 결제 승인 후

### 빌링 키 (Billing Key)
- **용도**: 자동결제(구독) 결제
- **저장 위치**: `Subscription.toss_billing_key`, `PaymentMethod.toss_billing_key`
- **발급 시점**: 첫 결제 승인 후

### 고객 키 (Customer Key)
- **용도**: 브랜드페이, 자동결제 고객 식별
- **저장 위치**: `Subscription.toss_customer_key`, `PaymentMethod.toss_customer_key`
- **발급 시점**: 브랜드페이 결제수단 등록 시 또는 자동결제 등록 시

## 참고사항

1. **토스페이먼트 키 관리**
   - `toss_payment_key`: 일회성 결제 키 (paymentKey)
   - `toss_billing_key`: 자동 결제용 빌링 키 (billingKey)
   - `toss_customer_key`: 고객 식별 키 (customerKey)
   - `toss_order_id`: 주문번호 (orderId, 고유값)

2. **결제 수단 타입**
   - 카드: `CARD`
   - 가상계좌: `VIRTUAL_ACCOUNT`
   - 계좌이체: `ACCOUNT_TRANSFER`
   - 휴대폰: `MOBILE`
   - 상품권: `GIFT_CERTIFICATE`

3. **환불 처리**
   - `Payment.status = REFUNDED`
   - `refund_amount`, `refund_reason` 기록
   - 구독 취소 시 환불 정책에 따라 처리
   - 토스페이먼트 취소 API 호출 필요

4. **할인/프로모션**
   - `Plan`에 프로모션 가격 필드 추가 가능
   - 또는 별도 `Promotion` 테이블 생성

5. **다중 플랜 지원**
   - 현재는 1:1 관계 (user:subscription)
   - 향후 다중 구독 필요 시 구조 변경 필요

6. **기존 BillingRecord와의 관계**
   - `BillingRecord`: AI 사용 비용 집계 (운영자용, admin 스키마)
   - `Payment`: 사용자 결제 내역 (사용자용, user 스키마)
   - 두 테이블은 목적이 다르므로 분리 유지

7. **토스페이먼트 문서 참고**
   - [시작하기](https://docs.tosspayments.com/guides/v2/get-started)
   - [자동결제(빌링)](https://docs.tosspayments.com/guides/v2/billing/integration)
   - [브랜드페이](https://docs.tosspayments.com/guides/v2/brandpay/integration)
   - [웹훅 연결하기](https://docs.tosspayments.com/guides/v2/webhook)

## 토스페이먼트 연동 예시 코드

### 1. 일반 결제 (일회성)

```typescript
// 클라이언트 (프론트엔드)
const tossPayments = TossPayments(clientKey);
await tossPayments.requestPayment('카드', {
  amount: 10000,
  orderId: 'ORDER-123',
  orderName: '프리미엄 플랜 구독',
  successUrl: `${window.location.origin}/payment/success`,
  failUrl: `${window.location.origin}/payment/fail`,
});

// 서버 (결제 승인)
const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(secretKey + ':').toString('base64')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    paymentKey: paymentKeyFromClient,
    orderId: orderId,
    amount: amount,
  }),
});

// Payment 생성
await prisma.payment.create({
  data: {
    user_id: userId,
    subscription_id: subscriptionId,
    toss_payment_key: response.paymentKey,
    toss_order_id: response.orderId,
    toss_method: response.method,
    amount: response.totalAmount,
    status: 'SUCCESS',
    paid_at: new Date(),
  },
});
```

### 2. 자동결제 (빌링) - 구독형

```typescript
// 첫 결제로 빌링 키 발급
const firstPayment = await confirmPayment(paymentKey);
const billingKey = firstPayment.billingKey;

// Subscription 생성
await prisma.subscription.create({
  data: {
    user_id: userId,
    plan_id: planId,
    toss_billing_key: billingKey,
    toss_customer_key: customerKey, // 선택사항
    status: 'ACTIVE',
    started_at: new Date(),
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    billing_cycle: 'monthly',
    amount: plan.price_monthly,
  },
});

// 자동 결제 실행 (스케줄러)
const subscriptions = await prisma.subscription.findMany({
  where: {
    status: 'ACTIVE',
    current_period_end: { lte: new Date() },
  },
});

for (const subscription of subscriptions) {
  const payment = await requestBillingPayment({
    billingKey: subscription.toss_billing_key,
    customerKey: subscription.toss_customer_key,
    amount: subscription.amount,
    orderId: `BILLING-${subscription.id}-${Date.now()}`,
  });

  if (payment.status === 'DONE') {
    // Payment 생성 및 Subscription 갱신
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          toss_payment_key: payment.paymentKey,
          toss_order_id: payment.orderId,
          amount: payment.totalAmount,
          status: 'SUCCESS',
          paid_at: new Date(),
        },
      }),
      prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);
  } else {
    // 결제 실패 시 구독 일시 정지
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'SUSPENDED' },
    });
  }
}
```

### 3. 웹훅 처리

```typescript
// app/api/webhook/toss/route.ts
export async function POST(request: Request) {
  const webhook = await request.json();
  
  // 웹훅 검증 (토스페이먼트 시크릿으로 서명 검증)
  const isValid = verifyWebhookSignature(webhook, request.headers);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  switch (webhook.eventType) {
    case 'payment.confirmed':
      await prisma.payment.update({
        where: { toss_payment_key: webhook.data.paymentKey },
        data: {
          status: 'SUCCESS',
          paid_at: new Date(webhook.data.approvedAt),
        },
      });
      break;

    case 'payment.canceled':
      await prisma.payment.update({
        where: { toss_payment_key: webhook.data.paymentKey },
        data: {
          status: 'CANCELLED',
        },
      });
      break;

    case 'billing.subscription.issued':
      // 구독 발급 처리
      break;

    case 'billing.subscription.revoked':
      await prisma.subscription.update({
        where: { toss_billing_key: webhook.data.billingKey },
        data: { status: 'CANCELLED' },
      });
      break;
  }

  return new Response('OK', { status: 200 });
}
```

## 실제 구현 예시

### Prisma 스키마 통합 예시

```prisma
// ==============================
// 결제 시스템 (user 스키마)
// ==============================

enum PlanName {
  BASIC
  PREMIUM
  PRO
  
  @@schema("user")
}

enum SubscriptionStatus {
  ACTIVE
  CANCELLED
  EXPIRED
  SUSPENDED
  
  @@schema("user")
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  CANCELLED
  REFUNDED
  
  @@schema("user")
}

// Plan 모델 (위 참고)
// Subscription 모델 (위 참고)
// Payment 모델 (위 참고)
// PaymentMethod 모델 (위 참고)

// User 모델에 Relations 추가
model User {
  // ... 기존 필드 ...
  
  subscription Subscription?
  payments     Payment[]
  payment_methods PaymentMethod[]
}

// UserQuota 모델 수정 (위 참고)
```

### 마이그레이션 SQL 예시

```sql
-- Enum 타입 생성
CREATE TYPE "user"."PlanName" AS ENUM ('BASIC', 'PREMIUM', 'PRO');
CREATE TYPE "user"."SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED');
CREATE TYPE "user"."PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED');

-- Plan 테이블 생성
CREATE TABLE "user"."Plan" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "daily_diary_limit" INTEGER NOT NULL DEFAULT 10,
    "monthly_diary_limit" INTEGER NOT NULL DEFAULT 300,
    "daily_analysis_limit" INTEGER NOT NULL DEFAULT 10,
    "monthly_analysis_limit" INTEGER NOT NULL DEFAULT 300,
    "price_monthly" DECIMAL(10, 2) NOT NULL,
    "price_yearly" DECIMAL(10, 2),
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- 인덱스 생성
CREATE UNIQUE INDEX "Plan_name_key" ON "user"."Plan"("name");
CREATE INDEX "Plan_is_active_is_public_idx" ON "user"."Plan"("is_active", "is_public");
CREATE INDEX "Plan_sort_order_idx" ON "user"."Plan"("sort_order");

-- Subscription, Payment, PaymentMethod 테이블도 유사한 패턴으로 생성
```

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
