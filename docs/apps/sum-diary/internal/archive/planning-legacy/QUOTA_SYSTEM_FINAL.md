# 📝 Quota 시스템 최종 정책 (전송 단일 기준)

> 작성일: 2025-12-06  
> 최종 결정: 전송 단일 Quota 시스템

---

## 🎯 핵심 정책

### 전송 단일 Quota 시스템

**기본 원칙:**
- **전송 1회 = 일기 1개 + AI 분석 1회**
- 일기 작성 quota와 분석 quota를 분리하지 않음
- 전송(complete) 시점에만 quota 체크 및 비용 계산
- 임시저장(Draft)은 quota 체크 없음

---

## 📊 Quota 수치

### 어드민 사용자
- **일일 전송**: 무제한 (관리 목적)
- **월간 전송**: 무제한 (관리 목적)

### 무료 사용자
- **일일 전송**: 3회 (체험 목적, 프리미엄 전환 유도)
- **월간 전송**: 50회 (일반적인 사용 패턴 내에서 충분)

### 프리미엄 사용자
- **일일 전송**: 20회 (일반적인 사용 패턴 내에서 충분)
- **월간 전송**: 500회 (현실적인 사용량 기준)

**전송 1회 = 일기 1개 + 분석 1회**

---

## 🔧 임시저장 정책

### Quota 체크
- ❌ **없음** (상태일 뿐, 액션이 아님)

### 개수 제한
- ✅ **최대 10개** (UX/정리 목적)

### 자동 저장
- localStorage: 3초마다 자동 저장
- 서버: `/api/diary/draft` API로 저장

---

## 💡 결정 사유

### 1. UX 보호
작성은 자동 임시저장으로 처리되며, 유저가 쓰는 동안 임시저장 횟수에 제한을 두면 UX가 파괴됨.

### 2. 비용 구조 일치
전송 버튼을 누르는 순간, "일기 확정 + AI 분석"이 동시에 발생하는 구조이므로 전송 1회 = 비용발생 1회로 정의됨.

### 3. 아키텍처 단순화
일기 작성 quota와 분석 quota를 분리하는 것이 오히려 모순이며, 전송 단위로만 quota를 관리하는 것이 가장 직관적이고 안전함.

### 4. 상태 vs 액션
임시저장은 상태(state)일 뿐, 액션(action)이 아니므로 quota 체크 대상이 아님.

### 5. 운영 안전성
실제 서비스 플로우와 비용 구조가 "전송 = 분석"에 종속되어 있으므로 전송 단일 quota가 아키텍처적으로 가장 단순하고 운영에 안전함.

---

## 🔄 구현 로직

### 전송 시점 (`/api/diary/create`)

```typescript
// 1. Rate Limit 체크 (전송 1분 10회)
const rateLimit = await checkRateLimit(userId, ip);
if (!rateLimit.allowed) {
  throw new RateLimitExceededError(rateLimit.resetAt);
}

// 2. 동시 실행 제한 체크 (최대 3개)
const concurrent = await checkConcurrentLimit(userId);
if (!concurrent.allowed) {
  throw new ConcurrentLimitExceededError(concurrent.current);
}

// 3. Quota 체크 (일일/월간 전송 횟수)
await checkQuotaOrThrow(userId, 'daily');
await checkQuotaOrThrow(userId, 'monthly');

// 4. 일기 저장 + AnalysisResult PENDING 생성
const diary = await prisma.diaryEntry.create({ ... });
await prisma.analysisResult.create({
  data: {
    diary_id: diary.id,
    status: 'PENDING',
    provider: 'OPENAI',
  },
});

// Quota는 아직 증가하지 않음 (예약 상태)
```

### 분석 완료 시점 (`/api/diary/analyze/stream`)

```typescript
// 분석 완료 후

// 1. Quota 증가 (확정)
await incrementUserQuota(userId, 'daily');
await incrementUserQuota(userId, 'monthly');

// 2. 비용 계산 및 저장
const usage = response.usage;
const cost = calculateCost(usage.input_tokens, usage.output_tokens, 'gpt-5-mini');

await prisma.analysisResult.update({
  data: {
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: cost,
    status: 'COMPLETED',
  },
});

// 3. BillingRecord 업데이트
await updateBillingRecord(userId, getCurrentPeriod(), {
  total_analyses: 1,
  total_tokens: usage.input_tokens + usage.output_tokens,
  total_cost_usd: cost,
});
```

---

## 🏗️ QuotaStore 인터페이스

### 변경 전 (일기/분석 분리)
```typescript
interface QuotaStore {
  get(userId, type: 'diary' | 'analysis', period): Promise<QuotaData>;
  increment(userId, type: 'diary' | 'analysis', period): Promise<void>;
}
```

### 변경 후 (전송 단일)
```typescript
interface QuotaStore {
  get(userId: string, period: 'daily' | 'monthly'): Promise<QuotaData>;
  increment(userId: string, period: 'daily' | 'monthly'): Promise<void>;
  reset(userId: string, period: 'daily' | 'monthly'): Promise<void>;
}

interface QuotaData {
  count: number;
  limit: number;
  reset_at: Date;
}
```

**변경사항:**
- `type: 'diary' | 'analysis'` 파라미터 제거
- 전송 횟수만 관리

---

## 📋 UserQuota 스키마 변경 필요

### 현재 스키마
```prisma
model UserQuota {
  daily_diary_limit   Int @default(10)
  monthly_diary_limit Int @default(300)
  daily_analysis_limit   Int @default(10)
  monthly_analysis_limit Int @default(300)
  
  daily_diary_count   Int @default(0)
  monthly_diary_count Int @default(0)
  daily_analysis_count   Int @default(0)
  monthly_analysis_count Int @default(0)
}
```

### 변경 후 스키마
```prisma
model UserQuota {
  // 전송 단일 quota
  daily_submission_limit   Int @default(10)   // 무료: 10, 프리미엄: 100
  monthly_submission_limit Int @default(300)  // 무료: 300, 프리미엄: 3000
  
  daily_submission_count   Int @default(0)
  monthly_submission_count Int @default(0)
  
  // 기존 필드는 deprecated (마이그레이션 후 제거)
  // daily_diary_limit, monthly_diary_limit 등
}
```

**또는 기존 필드 재활용:**
- `daily_diary_limit` → `daily_submission_limit`
- `daily_diary_count` → `daily_submission_count`
- `daily_analysis_limit`, `daily_analysis_count` 제거

---

## 🎯 API 변경 사항

### 1. `/api/diary/create` (전송)
```typescript
// 변경 전
await checkQuotaOrThrow(userId, 'diary', 'daily');
await checkQuotaOrThrow(userId, 'analysis', 'daily');

// 변경 후
await checkQuotaOrThrow(userId, 'daily');
await checkQuotaOrThrow(userId, 'monthly');
```

### 2. `/api/diary/analyze/stream` (분석 완료)
```typescript
// 변경 전
await incrementUserQuota(userId, 'diary', 'daily');
await incrementUserQuota(userId, 'analysis', 'daily');

// 변경 후
await incrementUserQuota(userId, 'daily');
await incrementUserQuota(userId, 'monthly');
```

### 3. `/api/quota` (조회)
```typescript
// 변경 전
{
  diary: { daily: { used: 5, limit: 10 }, monthly: { used: 50, limit: 300 } },
  analysis: { daily: { used: 3, limit: 10 }, monthly: { used: 30, limit: 300 } }
}

// 변경 후
{
  submission: { 
    daily: { used: 5, limit: 10 }, 
    monthly: { used: 50, limit: 300 } 
  }
}
```

---

## ✅ 체크리스트

### 문서 업데이트
- [x] COST_MANAGEMENT_SYSTEM_V2.md 업데이트
- [x] COST_MANAGEMENT_PROBLEMS_SUMMARY.md 업데이트
- [x] QUOTA_SYSTEM_FINAL.md 생성

### 구현 필요
- [ ] UserQuota 스키마 변경 (전송 단일 quota)
- [ ] QuotaStore 인터페이스 수정 (type 파라미터 제거)
- [ ] DBQuotaStore 구현 수정
- [ ] checkQuotaOrThrow 헬퍼 수정
- [ ] `/api/diary/create` 수정 (전송 시 Quota 체크)
- [ ] `/api/diary/analyze/stream` 수정 (분석 완료 시 Quota 증가)
- [ ] `/api/quota` 수정 (조회 API)

---

**작성자**: Auto (AI Assistant)  
**태그**: #quota #submission #final-policy

