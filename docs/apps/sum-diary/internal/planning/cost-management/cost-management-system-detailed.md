# 💰 비용 관리 시스템 상세 분석 및 설계

> 작성일: 2025-12-06  
> 목적: 비용 관리 시스템의 문제점, 해결방안, 의사결정 포인트 상세 분석

---

## 🔴 현재 문제점

### 1. 악의적 사용자로 인한 비용 폭탄 위험

**시나리오:**
```
악의적 사용자가 스크립트를 작성하여:
- 1초에 100개의 일기 작성 요청
- 각 일기마다 AI 분석 요청
- 하루에 수만 건의 분석 요청

→ 예상 비용: $10,000+ /일 (GPT-4 기준)
```

**현재 상태:**
- ❌ 일기 작성 제한 없음
- ❌ AI 분석 제한 없음
- ❌ 비용 추적 없음
- ❌ 사용량 모니터링 없음

**리스크 레벨**: 🔴 **CRITICAL** (서비스 종료 위험)

---

### 2. 비용 추적 부재

**현재 상태:**
- ✅ `AnalysisResult`에 `input_tokens`, `output_tokens`, `cost_usd` 필드는 있음
- ❌ 실제로 값을 저장하지 않음
- ❌ 비용 계산 로직 없음
- ❌ 프로바이더별 가격 설정 없음

**문제점:**
- 얼마나 비용이 발생했는지 모름
- 어떤 사용자가 비용을 많이 쓰는지 모름
- 프로바이더별 비용 비교 불가능
- 예산 계획 수립 불가능

---

### 3. 사용량 제한 부재

**현재 상태:**
- ✅ `UserQuota` 스키마는 있음
- ❌ API 구현 없음
- ❌ 체크 로직 없음
- ❌ Redis 캐싱 없음

**문제점:**
- 무제한 일기 작성 가능
- 무제한 AI 분석 가능
- 공정한 리소스 사용 보장 불가
- 프리미엄 사용자 구분 불가

---

## 💡 해결 방안

### 1. UserQuota 시스템 구현

#### 1.1 아키텍처 설계

**의사결정 포인트 1: Redis vs DB 직접 조회**

**옵션 A: Redis 캐싱 (확장 시)**
```
장점:
- 초고속 조회 (1ms 이하)
- DB 부하 최소화
- 동시성 처리 안전 (Atomic 연산)

단점:
- Redis 인프라 필요
- 추가 복잡도

구조:
Redis Key: quota:{user_id}:{type}:{period}
Value: { count: 5, reset_at: "2025-12-07T00:00:00Z" }
TTL: 자동 만료 (리셋 시간까지)
```

**옵션 B: DB 직접 조회 (현재 단계 - 권장)**
```
장점:
- 단순한 구조
- Redis 불필요 (인프라 비용 절감)
- 베타 단계에서 충분

단점:
- 느린 조회 (10-50ms) - 베타에서는 허용 가능
- DB 부하 증가 - 베타 트래픽에서는 문제 없음
- 동시성 문제 - 트랜잭션으로 해결 가능

구조:
매번 UserQuota 테이블 조회 → 업데이트 (트랜잭션 사용)
```

**권장**: **옵션 B (DB 직접 조회)** - 베타 단계에서는 충분, 확장 시 Redis로 전환 가능하도록 추상화 레이어 설계

---

**의사결정 포인트 2: Quota 체크 시점**

**옵션 A: 일기 생성 전 체크 (권장)**
```typescript
// POST /api/diary/create
1. UserQuota 체크 (일기 작성 가능?)
2. 가능하면 일기 저장
3. Quota 증가
4. 실패하면 429 Too Many Requests
```

**옵션 B: 분석 요청 전 체크**
```typescript
// GET /api/diary/analyze/stream
1. UserQuota 체크 (분석 가능?)
2. 가능하면 분석 시작
3. Quota 증가
```

**권장**: **옵션 A + B 모두** - 이중 방어

---

**의사결정 포인트 3: Quota 증가 시점**

**옵션 A: 즉시 증가 (분석 시작 시)**
```
장점:
- 정확한 제한
- 동시 요청 시 안전

단점:
- 분석 실패해도 카운트 증가
- 부분 분석도 카운트 증가
```

**옵션 B: 분석 완료 시 증가**
```
장점:
- 성공한 분석만 카운트
- 정확한 사용량 측정

단점:
- 분석 중에는 제한 없음
- 동시 요청 시 초과 가능
```

**옵션 C: 하이브리드 (권장)**
```
1. 분석 시작 시 "예약" (임시 카운트)
2. 분석 완료 시 "확정" (실제 카운트)
3. 분석 실패 시 "취소" (임시 카운트 제거)

구현:
- Redis에 pending:{user_id} 키로 임시 카운트
- 완료 시 pending 제거, actual 증가
- 실패 시 pending만 제거
```

**권장**: **옵션 C (하이브리드)** - 정확성과 안전성 균형

---

#### 1.2 구현 상세

**필요한 API:**

```typescript
// 1. Quota 체크 API
GET /api/quota/check?type=diary|analysis&period=daily|monthly
Response: { 
  allowed: boolean, 
  remaining: number, 
  resetAt: string 
}

// 2. Quota 조회 API
GET /api/quota
Response: {
  diary: { daily: { used: 5, limit: 10 }, monthly: { used: 50, limit: 300 } },
  analysis: { daily: { used: 3, limit: 10 }, monthly: { used: 30, limit: 300 } }
}

// 3. Quota 증가 API (내부용)
POST /api/quota/increment
Body: { type: 'diary'|'analysis', period: 'daily'|'monthly' }
```

**현재 구현 (DB 기반):**

```typescript
// UserQuota 테이블 직접 사용
// 트랜잭션으로 동시성 문제 해결
await prisma.$transaction(async (tx) => {
  const quota = await tx.userQuota.findUnique({
    where: { user_id: userId }
  });
  
  if (quota.daily_diary_count >= quota.daily_diary_limit) {
    throw new Error('일일 제한 초과');
  }
  
  await tx.userQuota.update({
    where: { user_id: userId },
    data: { daily_diary_count: { increment: 1 } }
  });
});
```

**확장 시 (Redis 전환 가능한 구조):**

```typescript
// 추상화 레이어 설계
interface QuotaStore {
  get(userId: string, type: string, period: string): Promise<QuotaData>;
  increment(userId: string, type: string, period: string): Promise<void>;
}

// 현재: DB 구현
class DBQuotaStore implements QuotaStore { ... }

// 확장 시: Redis 구현
class RedisQuotaStore implements QuotaStore { ... }

// 사용: 구현체 교체만 하면 됨
const quotaStore: QuotaStore = process.env.USE_REDIS 
  ? new RedisQuotaStore() 
  : new DBQuotaStore();
```

**Redis 구조 (확장 시):**

```typescript
// 일일 일기 작성 카운트
Key: quota:{user_id}:diary:daily
Value: { count: 5, reset_at: "2025-12-07T00:00:00Z" }
TTL: 자동 (리셋 시간까지)

// 월간 일기 작성 카운트
Key: quota:{user_id}:diary:monthly
Value: { count: 50, reset_at: "2026-01-01T00:00:00Z" }
TTL: 자동

// 일일 분석 카운트
Key: quota:{user_id}:analysis:daily
Value: { count: 3, reset_at: "2025-12-07T00:00:00Z" }
TTL: 자동

// 분석 예약 (하이브리드 방식)
Key: quota:{user_id}:analysis:pending
Value: Set of analysis IDs
TTL: 5분 (분석 타임아웃)
```

---

### 2. 비용 추적 시스템 구현

#### 2.1 프로바이더별 가격 설정

**의사결정 포인트 4: 가격 설정 방식**

**옵션 A: 환경변수 (권장)**
```env
# .env
OPENAI_GPT4_INPUT_PRICE=0.03    # $0.03 per 1K tokens
OPENAI_GPT4_OUTPUT_PRICE=0.06   # $0.06 per 1K tokens
OPENAI_GPT5_MINI_INPUT_PRICE=0.001
OPENAI_GPT5_MINI_OUTPUT_PRICE=0.002
GEMINI_PRO_INPUT_PRICE=0.0005
GEMINI_PRO_OUTPUT_PRICE=0.0015
```

**옵션 B: 설정 파일**
```typescript
// app/lib/ai-pricing.ts
export const AI_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-5-mini': { input: 0.001, output: 0.002 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
};
```

**옵션 C: DB 테이블 (동적 변경 가능)**
```prisma
model AiPricing {
  provider String
  model    String
  input_price  Decimal
  output_price Decimal
  effective_from DateTime
  effective_to   DateTime?
}
```

**권장**: **옵션 A (환경변수)** - 단순하고 빠름, 필요시 옵션 C로 확장

---

#### 2.2 비용 계산 로직

**의사결정 포인트 5: 비용 계산 시점**

**옵션 A: 분석 완료 시 즉시 계산 (권장)**
```typescript
// analyze/stream/route.ts
// OpenAI 응답에서 usage 정보 추출
const usage = response.usage;
const cost = calculateCost(usage.input_tokens, usage.output_tokens, 'gpt-5-mini');

await prisma.analysisResult.update({
  data: {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: cost,
  }
});
```

**옵션 B: 배치 작업으로 계산**
```typescript
// 매 시간마다 실행
// AnalysisResult에서 tokens 조회
// 비용 계산 후 업데이트
```

**권장**: **옵션 A (즉시 계산)** - 정확성과 실시간성

---

**비용 계산 함수:**

```typescript
// app/lib/ai-cost-calculator.ts
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const pricing = getPricing(model);
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
}
```

---

#### 2.3 BillingRecord 집계

**의사결정 포인트 6: 집계 주기**

**옵션 A: 실시간 집계 (권장)**
```typescript
// 분석 완료 시마다
await updateBillingRecord(userId, period, {
  total_analyses: +1,
  total_tokens: +tokens,
  total_cost_usd: +cost,
});
```

**옵션 B: 배치 집계 (매일 자정)**
```typescript
// Cron Job으로 매일 실행
// AnalysisResult에서 집계
// BillingRecord 업데이트
```

**권장**: **옵션 A (실시간)** - 정확성, 옵션 B는 백업용

---

**BillingRecord 업데이트 로직:**

```typescript
// app/lib/billing.ts
export async function updateBillingRecord(
  userId: string,
  period: string, // "2025-12"
  data: {
    total_analyses: number;
    total_tokens: number;
    total_cost_usd: number;
    provider?: string;
  }
) {
  await prisma.billingRecord.upsert({
    where: { user_id_period: { user_id: userId, period } },
    create: {
      user_id: userId,
      period,
      total_analyses: data.total_analyses,
      total_tokens: data.total_tokens,
      total_cost_usd: data.total_cost_usd,
      // 프로바이더별 비용도 업데이트
    },
    update: {
      total_analyses: { increment: data.total_analyses },
      total_tokens: { increment: data.total_tokens },
      total_cost_usd: { increment: data.total_cost_usd },
    },
  });
}
```

---

### 3. 통합 구현 전략

#### 3.1 일기 생성 API 수정

**현재 코드:**
```typescript
// app/api/diary/create/route.ts
export async function POST(request: NextRequest) {
  // ... 검증 ...
  
  // ❌ Quota 체크 없음
  
  // 일기 저장
  const diary = await prisma.diaryEntry.create({ ... });
  
  return NextResponse.json({ diaryId: diary.id });
}
```

**수정 후:**
```typescript
export async function POST(request: NextRequest) {
  // ... 검증 ...
  
  // ✅ Quota 체크
  const quota = await checkUserQuota(userId, 'diary');
  if (!quota.allowed) {
    return NextResponse.json(
      { error: '일일 작성 제한을 초과했습니다.', resetAt: quota.resetAt },
      { status: 429 }
    );
  }
  
  // 일기 저장
  const diary = await prisma.diaryEntry.create({ ... });
  
  // ✅ Quota 증가
  await incrementUserQuota(userId, 'diary');
  
  return NextResponse.json({ diaryId: diary.id });
}
```

---

#### 3.2 분석 API 수정

**현재 코드:**
```typescript
// app/api/diary/analyze/stream/route.ts
export async function GET(request: NextRequest) {
  // ... 분석 시작 ...
  
  // ❌ Quota 체크 없음
  // ❌ 비용 계산 없음
  
  const openaiStream = await openai.chat.completions.create({ ... });
  
  // ... 분석 완료 ...
  
  // ❌ 비용 저장 없음
  await prisma.analysisResult.update({ ... });
}
```

**수정 후:**
```typescript
export async function GET(request: NextRequest) {
  // ... 분석 시작 ...
  
  // ✅ Quota 체크
  const quota = await checkUserQuota(userId, 'analysis');
  if (!quota.allowed) {
    send({ type: 'error', data: { message: '일일 분석 제한을 초과했습니다.' } });
    controller.close();
    return;
  }
  
  // ✅ 분석 예약 (하이브리드 방식)
  const analysisId = existingAnalysis?.id || 'new';
  await reserveAnalysisQuota(userId, analysisId);
  
  const openaiStream = await openai.chat.completions.create({ ... });
  
  // ... 분석 완료 ...
  
  // ✅ 비용 계산 및 저장
  const usage = response.usage; // OpenAI에서 제공
  const cost = calculateCost(usage.input_tokens, usage.output_tokens, 'gpt-5-mini');
  
  await prisma.analysisResult.update({
    data: {
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
      cost_usd: cost,
      // ...
    }
  });
  
  // ✅ Quota 확정 (예약 해제 + 실제 증가)
  await confirmAnalysisQuota(userId, analysisId);
  
  // ✅ BillingRecord 업데이트
  await updateBillingRecord(userId, getCurrentPeriod(), {
    total_analyses: 1,
    total_tokens: usage.input_tokens + usage.output_tokens,
    total_cost_usd: cost,
  });
}
```

---

## 🎯 의사결정 체크리스트

### 필수 결정 사항

#### 1. Redis 사용 여부
- [x] **결정**: 현재는 DB 직접 조회, 확장 시 Redis 전환 가능하도록 추상화 레이어 설계
- [x] **이유**: 베타 단계에서는 DB로 충분, 트래픽 증가 시 Redis로 전환
- [x] **구현**: QuotaStore 인터페이스로 추상화하여 나중에 구현체만 교체

#### 2. Quota 제한 수치
- [ ] **일일 일기 작성**: 몇 개? (현재 스키마: 10개)
- [ ] **월간 일기 작성**: 몇 개? (현재 스키마: 300개)
- [ ] **일일 분석**: 몇 개? (현재 스키마: 10개)
- [ ] **월간 분석**: 몇 개? (현재 스키마: 300개)
- [ ] **프리미엄 사용자**: 제한 없음? 증가된 제한?

#### 3. Quota 증가 시점
- [ ] **결정**: 즉시? 완료 시? 하이브리드? (권장: 하이브리드)
- [ ] **이유**: 정확성과 안전성 균형

#### 4. 비용 계산 방식
- [ ] **가격 설정**: 환경변수? 설정 파일? DB? (권장: 환경변수)
- [ ] **계산 시점**: 즉시? 배치? (권장: 즉시)
- [ ] **프로바이더별 가격**: 각각 설정?

#### 5. BillingRecord 집계
- [ ] **집계 주기**: 실시간? 배치? (권장: 실시간)
- [ ] **프로바이더별 분리**: 필요?

---

## 📊 구현 우선순위

### Phase 1: 기본 Quota 시스템 (2-3일)
1. Redis 설정 및 연결
2. Quota 체크 함수 구현
3. Quota 증가 함수 구현
4. 일기 생성 API에 통합
5. 분석 API에 통합

### Phase 2: 비용 추적 (1-2일)
1. 가격 설정 (환경변수)
2. 비용 계산 함수
3. 분석 완료 시 비용 저장
4. BillingRecord 업데이트

### Phase 3: 모니터링 및 알림 (1일)
1. Quota 조회 API
2. 비용 조회 API
3. 관리자 대시보드 연동

---

## 🔧 기술 스택 결정

### 확장 시 Redis 클라이언트 (현재는 미사용)
**옵션 A: ioredis (확장 시 권장)**
```typescript
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);
```

**옵션 B: @vercel/kv**
```typescript
import { kv } from '@vercel/kv';
```

**확장 시 권장**: **ioredis** - 더 많은 기능, 프로덕션 검증

---

### 추상화 레이어 설계 (현재 구현)

```typescript
// app/lib/quota-store.ts

// 인터페이스 정의 (확장 시 Redis 구현 가능)
export interface QuotaStore {
  get(userId: string, type: 'diary' | 'analysis', period: 'daily' | 'monthly'): Promise<QuotaData>;
  increment(userId: string, type: 'diary' | 'analysis', period: 'daily' | 'monthly'): Promise<void>;
  reset(userId: string, type: 'diary' | 'analysis', period: 'daily' | 'monthly'): Promise<void>;
}

// 현재: DB 구현
export class DBQuotaStore implements QuotaStore {
  async get(userId: string, type: string, period: string) {
    // Prisma로 UserQuota 조회
  }
  
  async increment(userId: string, type: string, period: string) {
    // Prisma 트랜잭션으로 증가
  }
}

// 확장 시: Redis 구현 (나중에 추가)
export class RedisQuotaStore implements QuotaStore {
  async get(userId: string, type: string, period: string) {
    // Redis 조회
  }
  
  async increment(userId: string, type: string, period: string) {
    // Redis INCR
  }
}

// 사용: 환경변수로 구현체 선택
export const quotaStore: QuotaStore = process.env.USE_REDIS === 'true'
  ? new RedisQuotaStore()
  : new DBQuotaStore();
```

---

## 📝 구현 예시 코드

### Quota 체크 함수
```typescript
// app/lib/quota.ts
export async function checkUserQuota(
  userId: string,
  type: 'diary' | 'analysis',
  period: 'daily' | 'monthly' = 'daily'
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const redis = getRedis();
  const key = `quota:${userId}:${type}:${period}`;
  
  // Redis에서 조회
  const data = await redis.get(key);
  if (!data) {
    // DB에서 조회 또는 초기화
    const quota = await initializeQuota(userId, type, period);
    return {
      allowed: quota.count < quota.limit,
      remaining: quota.limit - quota.count,
      resetAt: quota.reset_at.toISOString(),
    };
  }
  
  const { count, limit, reset_at } = JSON.parse(data);
  const resetAt = new Date(reset_at);
  
  // 리셋 시간 지났으면 초기화
  if (resetAt < new Date()) {
    await resetQuota(userId, type, period);
    return {
      allowed: true,
      remaining: limit,
      resetAt: getNextResetTime(period).toISOString(),
    };
  }
  
  return {
    allowed: count < limit,
    remaining: limit - count,
    resetAt: resetAt.toISOString(),
  };
}
```

### Quota 증가 함수
```typescript
export async function incrementUserQuota(
  userId: string,
  type: 'diary' | 'analysis',
  period: 'daily' | 'monthly' = 'daily'
): Promise<void> {
  const redis = getRedis();
  const key = `quota:${userId}:${type}:${period}`;
  
  // Atomic 증가
  const count = await redis.incr(key);
  
  // TTL 설정 (리셋 시간까지)
  const resetAt = getNextResetTime(period);
  const ttl = Math.floor((resetAt.getTime() - Date.now()) / 1000);
  await redis.expire(key, ttl);
  
  // DB 동기화 (비동기, 실패해도 계속 진행)
  syncQuotaToDB(userId, type, period, count).catch(console.error);
}
```

---

## ⚠️ 주의사항

### 1. 동시성 문제
- Redis Atomic 연산 사용 필수 (`INCR`, `SETNX`)
- DB 업데이트는 비동기로 (성능 영향 최소화)

### 2. Redis 장애 대응
- Redis 실패 시 DB로 폴백
- Quota 체크 실패 시 허용? 거부? (의사결정 필요)

### 3. 프리미엄 사용자 처리
- `is_premium` 플래그 확인
- 프리미엄은 제한 없음 또는 증가된 제한

### 4. 리셋 시간 처리
- 일일: 매일 자정 (UTC 기준)
- 월간: 매월 1일 자정 (UTC 기준)
- 타임존 고려 필요

---

## 🎯 최종 권장사항

### 즉시 구현 (오늘/내일)
1. ✅ Redis 설정 및 연결
2. ✅ 기본 Quota 체크 함수
3. ✅ 일기 생성 API에 통합

### 이번 주 내
4. ✅ 분석 API에 통합
5. ✅ 비용 계산 로직
6. ✅ BillingRecord 업데이트

### 다음 주
7. ✅ 모니터링 API
8. ✅ 관리자 대시보드 연동

---

**작성자**: Auto (AI Assistant)  
**태그**: #cost-management #quota #billing #redis #beta-launch

