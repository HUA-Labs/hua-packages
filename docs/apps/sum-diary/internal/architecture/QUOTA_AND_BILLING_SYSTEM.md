# 할당량 및 비용 관리 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **전송 단일 Quota 시스템**을 사용하여 사용자 할당량을 관리하고, **실시간 비용 집계**를 통해 AI 분석 비용을 추적합니다. 이 문서는 실제 구현 코드를 기반으로 할당량 및 비용 관리 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 전송 단일 Quota: 전송 1회 = 일기 1개 + 분석 1회
- 실시간 집계: BillingRecord를 통한 실시간 비용 추적
- 환경변수 기반 가격: 동적 가격 설정 지원
- Redis 폴백: Redis 없을 경우 메모리 캐시 사용

---

## 1. 시스템 구조

### 1.1 할당량 관리 플로우

```
일기 작성 요청
    ↓
통합 제한 체크 (checkAllLimits)
    ├─ Rate Limit 체크
    ├─ 동시 실행 제한 체크
    └─ Quota 체크
        ├─ 사용자 정보 조회 (게스트/어드민/프리미엄)
        ├─ Quota 조회 (일일/월간)
        ├─ 리셋 시간 확인
        └─ 제한 초과 여부 확인
    ↓
일기 저장 및 분석 시작
    ↓
분석 완료 시
    ├─ Quota 증가 (incrementUserQuota)
    └─ 비용 집계 (updateBillingRecord)
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/quota.ts`: Quota 체크 및 관리
- `app/lib/quota-store/db-quota-store.ts`: DB 기반 QuotaStore 구현
- `app/lib/quota-store/interface.ts`: QuotaStore 인터페이스
- `app/lib/billing.ts`: BillingRecord 관리
- `app/lib/ai-cost-calculator.ts`: AI 비용 계산
- `app/lib/quota-check.ts`: 통합 제한 체크

---

## 2. 전송 단일 Quota 시스템

### 2.1 Quota 개념

**전송 단일 Quota:**
- 전송 1회 = 일기 1개 + 분석 1회
- 일기와 분석을 분리하지 않음
- 분석 완료 시 Quota 증가

**이유:**
- 사용자 경험 단순화
- 비용 관리 용이
- 할당량 관리 간소화

### 2.2 Quota 제한

**사용자별 제한:**

**어드민:**
- 일일: 999,999회
- 월간: 999,999회

**게스트:**
- 일일: 3회
- 월간: 999,999회 (IP 기반 제한으로 대체)

**무료 사용자:**
- 일일: 3회
- 월간: 50회

**프리미엄 사용자:**
- 일일: 20회
- 월간: 500회

**구현:**
```typescript
const dailyLimit = isAdmin ? 999999 
  : (isGuest ? 3 
    : (isPremium ? 20 : 3));
const monthlyLimit = isAdmin ? 999999 
  : (isGuest ? 999999 
    : (isPremium ? 500 : 50));
```

---

## 3. QuotaStore 구현

### 3.1 인터페이스

**구현 위치:** `app/lib/quota-store/interface.ts`

**인터페이스:**
```typescript
export interface QuotaStore {
  get(userId: string, period: 'daily' | 'monthly'): Promise<QuotaData>;
  increment(userId: string, period: 'daily' | 'monthly'): Promise<void>;
  reset(userId: string, period: 'daily' | 'monthly'): Promise<void>;
}
```

**QuotaData:**
```typescript
export interface QuotaData {
  count: number;
  limit: number;
  reset_at: Date;
}
```

### 3.2 DB 기반 구현

**구현 위치:** `app/lib/quota-store/db-quota-store.ts`

**클래스:** `DBQuotaStore`

**주요 메서드:**

**get(userId, period):**
1. UserQuota 조회
2. Quota 없으면 초기화
3. 리셋 시간 확인 및 리셋
4. Quota 정보 반환

**increment(userId, period):**
1. 트랜잭션 시작
2. Quota 조회
3. 리셋 시간 확인 및 리셋
4. 카운트 증가

**reset(userId, period):**
1. 다음 리셋 시간 계산
2. 카운트 0으로 리셋
3. 리셋 시간 업데이트

**initializeQuota(userId, period):**
1. 기본 제한 수치 설정
2. UserQuota upsert
3. 초기 Quota 반환

### 3.3 리셋 시간 계산

**구현:** `getNextResetTime(period)`

**일일 리셋:**
- 한국 시간 기준 내일 자정
- UTC로 변환하여 저장

**월간 리셋:**
- 한국 시간 기준 다음 달 1일 자정
- UTC로 변환하여 저장

**코드:**
```typescript
private getNextResetTime(period: 'daily' | 'monthly'): Date {
  const now = new Date();
  const koreanOffset = 9 * 60 * 60 * 1000; // 9시간
  
  const koreanNow = new Date(now.getTime() + koreanOffset);
  
  if (period === 'daily') {
    // 내일 자정 (한국 시간)
    const koreanTomorrowMidnight = Date.UTC(
      koreanNow.getUTCFullYear(),
      koreanNow.getUTCMonth(),
      koreanNow.getUTCDate() + 1,
      0, 0, 0, 0
    );
    // UTC로 변환
    return new Date(koreanTomorrowMidnight - koreanOffset);
  } else {
    // 다음 달 1일 자정 (한국 시간)
    const koreanNextMonthMidnight = Date.UTC(
      koreanNow.getUTCFullYear(),
      koreanNow.getUTCMonth() + 1,
      1, 0, 0, 0, 0
    );
    return new Date(koreanNextMonthMidnight - koreanOffset);
  }
}
```

---

## 4. Quota 체크 및 관리

### 4.1 Quota 체크 함수

**구현 위치:** `app/lib/quota.ts`

**checkUserQuota(userId, period):**
- 예외 없이 결과 반환
- `allowed`, `remaining`, `resetAt` 반환

**checkQuotaOrThrow(userId, period):**
- 초과 시 `QuotaExceededError` 발생
- 에러에 Quota 정보 포함

**getUserQuotaLimits(userId):**
- 사용자 정보 조회 (게스트/어드민/프리미엄)
- 일일/월간 Quota 조회
- 제한 수치 반환

### 4.2 Quota 증가

**구현:** `incrementUserQuota(userId, period)`

**프로세스:**
1. QuotaStore를 통한 증가
2. 트랜잭션으로 동시성 보장
3. 리셋 시간 확인 및 리셋

**호출 시점:**
- 분석 완료 시 (성공한 경우만)
- 실패 시 증가하지 않음

### 4.3 Quota 초과 에러

**구현:** `QuotaExceededError`

**특징:**
- Quota 정보 포함
- 리셋 시간 포함
- 사용자 친화적 메시지

---

## 5. 비용 관리 시스템

### 5.1 AI 비용 계산

**구현 위치:** `app/lib/ai-cost-calculator.ts`

**함수:** `calculateCostUSD({ provider, model, inputTokens, outputTokens })`

**프로세스:**
1. 환경변수 키 생성
2. 입력/출력 가격 조회
3. 비용 계산 (1K 토큰당 가격)

**환경변수 형식:**
- `OPENAI_GPT_5_MINI_INPUT_PER_1K_USD`
- `OPENAI_GPT_5_MINI_OUTPUT_PER_1K_USD`
- `GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD`
- `GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD`

**모델명 변환:**
- `gpt-5-mini` → `GPT_5_MINI`
- `gemini-2.5-flash` → `GEMINI_2_5_FLASH`
- 하이픈(`-`)과 점(`.`)을 언더스코어(`_`)로 변환

**계산:**
```typescript
const inputCost = (inputTokens / 1000) * inputRate;
const outputCost = (outputTokens / 1000) * outputRate;
const totalCost = inputCost + outputCost;
```

### 5.2 BillingRecord 집계

**구현 위치:** `app/lib/billing.ts`

**함수:** `updateBillingRecord(userId, period, data)`

**프로세스:**
1. 현재 기간 조회 (YYYY-MM 형식, 한국 시간 기준)
2. BillingRecord upsert
3. 실시간 집계 (increment)

**집계 데이터:**
- `total_analyses`: 총 분석 수
- `total_tokens`: 총 토큰 수
- `total_cost_usd`: 총 비용 (USD)
- 프로바이더별 비용 (openai_cost, gemini_cost, hua_cost)

**기간 형식:**
- `YYYY-MM` (예: "2025-12")
- 한국 시간 기준

**코드:**
```typescript
await prisma.billingRecord.upsert({
  where: {
    user_id_period: {
      user_id: userId,
      period,
    },
  },
  create: {
    user_id: userId,
    period,
    total_analyses: data.total_analyses,
    total_tokens: data.total_tokens,
    total_cost_usd: data.total_cost_usd,
    openai_cost: provider === 'openai' ? data.total_cost_usd : 0,
    gemini_cost: provider === 'gemini' ? data.total_cost_usd : 0,
  },
  update: {
    total_analyses: { increment: data.total_analyses },
    total_tokens: { increment: data.total_tokens },
    total_cost_usd: { increment: data.total_cost_usd },
    // 프로바이더별 비용 증가
  },
});
```

### 5.3 비용 조회

**getUserBillingRecords(userId, period?):**
- 사용자의 BillingRecord 조회
- 기간별 집계 데이터 반환

**getUserTotalCost(userId, period?):**
- 사용자의 총 비용 조회
- 기간별 집계

---

## 6. 통합 제한 체크

### 6.1 통합 체크 함수

**구현 위치:** `app/lib/quota-check.ts`

**함수:** `checkAllLimits(userId, ip, userAgent?)`

**체크 순서:**
1. 어드민 체크 (어드민은 모든 제한 건너뛰기)
2. Rate Limit 체크
3. 동시 실행 제한 체크
4. Quota 체크 (일일/월간)

**병렬 실행:**
- 모든 체크를 `Promise.all()`로 병렬 실행
- 성능 최적화

**에러 처리:**
- `RateLimitExceededError`
- `ConcurrentLimitExceededError`
- `QuotaExceededError`

---

## 7. Redis 폴백 전략

### 7.1 Redis 클라이언트

**구현 위치:** `app/lib/redis.ts`

**특징:**
- 싱글톤 패턴
- 자동 재연결
- 연결 실패 시 null 반환

**설정:**
- `maxRetriesPerRequest: 3`
- `retryStrategy`: 지수 백오프
- `reconnectOnError`: READONLY 에러 시 재연결

### 7.2 메모리 캐시 폴백

**구현 위치:** `app/lib/cache.ts`

**전략:**
- Redis 사용 가능 시 Redis 사용
- Redis 없을 경우 메모리 캐시 사용
- 서버리스 환경에 적합

**캐시 TTL:**
- USER_PROFILE: 5분
- DIARY_LIST: 1분
- ANALYSIS_RESULT: 30분
- NOTIFICATIONS: 30초
- API_RESPONSE: 5분

---

## 8. 프리미엄 시스템

### 8.1 프리미엄 확인

**구현:** `isPremiumUser(userId)`

**프로세스:**
1. UserQuota 조회
2. `is_premium` 필드 확인

**프리미엄 혜택:**
- 일일 제한: 3회 → 20회
- 월간 제한: 50회 → 500회

### 8.2 프리미엄 업그레이드

**향후 구현:**
- 결제 시스템 연동
- `is_premium` 필드 업데이트
- 즉시 적용

---

## 9. 구현 상세

### 9.1 주요 함수

**Quota 관리:**
- `checkUserQuota(userId, period)`: Quota 체크
- `checkQuotaOrThrow(userId, period)`: Quota 체크 (예외 발생)
- `incrementUserQuota(userId, period)`: Quota 증가
- `getUserQuotaLimits(userId)`: 사용자별 제한 조회
- `isPremiumUser(userId)`: 프리미엄 여부 확인

**비용 관리:**
- `calculateCostUSD({ provider, model, inputTokens, outputTokens })`: 비용 계산
- `updateBillingRecord(userId, period, data)`: BillingRecord 업데이트
- `getUserBillingRecords(userId, period?)`: 비용 기록 조회
- `getUserTotalCost(userId, period?)`: 총 비용 조회

**통합 체크:**
- `checkAllLimits(userId, ip, userAgent?)`: 모든 제한 통합 체크

### 9.2 데이터 구조

**QuotaData:**
```typescript
{
  count: number;
  limit: number;
  reset_at: Date;
}
```

**QuotaCheckResult:**
```typescript
{
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}
```

**BillingRecord:**
```typescript
{
  user_id: string;
  period: string; // "2025-12"
  total_analyses: number;
  total_tokens: number;
  total_cost_usd: Decimal;
  openai_cost: Decimal;
  gemini_cost: Decimal;
  hua_cost: Decimal;
}
```

---

## 10. 성능 고려사항

### 10.1 트랜잭션 사용

**Quota 증가:**
- 트랜잭션으로 동시성 보장
- Race condition 방지

### 10.2 병렬 체크

**통합 체크:**
- 모든 제한 체크를 병렬 실행
- 응답 시간 최소화

### 10.3 캐싱

**Quota 조회:**
- Redis 캐싱 (선택적)
- 메모리 캐시 폴백

---

## 11. 보안 고려사항

### 11.1 동시성 보장

**전략:**
- 트랜잭션 사용
- Advisory Lock (향후)

### 11.2 비용 폭탄 방지

**전략:**
- Quota 제한
- Rate Limiting
- 동시 실행 제한

---

## 12. 참고 자료

### 관련 코드 파일
- `app/lib/quota.ts`: Quota 체크 및 관리
- `app/lib/quota-store/db-quota-store.ts`: DB 기반 QuotaStore
- `app/lib/billing.ts`: BillingRecord 관리
- `app/lib/ai-cost-calculator.ts`: AI 비용 계산
- `app/lib/quota-check.ts`: 통합 제한 체크
- `app/lib/redis.ts`: Redis 클라이언트
- `app/lib/cache.ts`: 캐싱 시스템

### 관련 문서
- [할당량 및 비용 관리 시스템](../planning/COST_AND_QUOTA_SYSTEM.md)
- [Rate Limiting](./ABUSE_DETECTION_SYSTEM.md#rate-limiting)

---

## 13. 향후 개선 계획

### 13.1 계획된 개선사항

1. **Redis 기반 QuotaStore**
   - 글로벌 Quota 관리
   - 서버리스 환경 대응

2. **프리미엄 결제 시스템**
   - 결제 연동
   - 자동 업그레이드

3. **비용 예측**
   - 사용자별 비용 예측
   - 알림 시스템

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
