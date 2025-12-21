# 💰 비용 관리 시스템 설계 v2 (먼팀장 리뷰 반영)

> 작성일: 2025-12-06  
> 먼팀장 리뷰 반영 버전

---

## 🎯 전체 전략

### 핵심 원칙
**"남용 방지(Quota + Rate Limit)" + "비용 가시화" 두 축으로 동시 진행**

베타 단계 철학:
- "일반 유저가 쓰기엔 넉넉하지만"
- "장난/스크립트 공격은 바로 걸리는" 수준

---

## 1. Quota 설계 - 수치 확정 ✅

### 1.1 기본 철학

**전송 단일 Quota 시스템**

- **전송 1회 = 일기 1개 + AI 분석 1회**
- 일기 작성 quota와 분석 quota를 분리하지 않음
- 전송(complete) 시점에만 quota 체크 및 비용 계산
- 임시저장(Draft)은 quota 체크 없음 (상태일 뿐, 액션이 아님)

**이유:**
1. 작성은 자동 임시저장으로 처리되며, 임시저장 횟수에 제한을 두면 UX 파괴
2. 전송 버튼을 누르는 순간 "일기 확정 + AI 분석"이 동시 발생
3. 전송 1회 = 비용 발생 1회로 정의됨
4. 실제 서비스 플로우와 비용 구조가 "전송 = 분석"에 종속
5. 아키텍처적으로 가장 단순하고 운영에 안전

### 1.2 수치 (무료 사용자)

| 항목 | 일일 | 월간 |
|------|------|------|
| **전송** | **10회** | **300회** |

**전송 1회 = 일기 1개 + 분석 1회**

### 1.3 수치 (프리미엄 사용자)

| 항목 | 일일 | 월간 | 비고 |
|------|------|------|------|
| **전송** | **100회** | **3000회** | 마케팅: "사실상 무제한" |

**마케팅 전략**: 프리미엄은 "무제한"으로 표기하되, 시스템 안전용 하드캡은 내부적으로 유지

### 1.4 임시저장 정책

- **Quota 체크**: 없음 (상태일 뿐, 액션이 아님)
- **개수 제한**: 최대 10개 (UX/정리 목적)
- **자동 저장**: 3초마다 localStorage + 서버 저장

---

## 2. Rate Limit & 동시 실행 제한 (필수 추가) ⚠️

### 2.1 왜 필요한가?

**문제**: "일일/월간 Quota"만으로는 **1초 100번 같은 폭주는 못 막음**

**해결**: **"초/분 단위 Rate Limit + 동시 실행 개수 제한"** 필수

### 2.2 Rate Limit 전략

**사용자별 Rate Limit:**
- 전송 요청: **1분에 10회**

**IP 기준 글로벌 Rate Limit:**
- 전체 서비스 보호용
- 예: IP당 1분에 100회 (전체 요청 합산)

### 2.3 동시 실행 제한

**유저당 동시 실행 중인 분석 작업 수: 최대 2~3개**

```typescript
// 전송(분석 시작) 전 체크
const inProgressCount = await getInProgressAnalysisCount(userId);
if (inProgressCount >= 3) {
  throw new Error('동시 실행 제한 초과');
}
```

### 2.4 통합 방어 전략

```
공격 시나리오: 1초에 100개 전송 요청

1차 방어: Rate Limit (1분 10회) → 대부분 차단
2차 방어: 동시 실행 제한 (최대 3개) → 남은 것도 차단
3차 방어: Quota (일일 10회) → 최종 방어
```

---

## 3. Quota 증가 시점 전략 ✅

### 3.1 결정: 분석 완료 시 증가 + 보완책

**기본 전략**: **분석 완료 시 Quota 증가**

**보완책**:
1. 동시 실행 개수 제한 (최대 2~3개)
2. Rate Limit (1분 10회)

**이유:**
- ✅ 전송 시점에 Quota 체크 (예약)
- ✅ 분석 완료 시 Quota 증가 (확정)
- ✅ 실패한 분석은 Quota에 안 들어가서 유저 경험 좋음
- ✅ 동시에 수백 개를 날리는 공격은 "동시 실행 제한"에서 막힘
- ✅ "레이트리밋"에서 한 번 더 걸림
- ✅ 구현 난이도 낮음

### 3.2 구현 로직

```typescript
// 전송 시점 (/api/diary/create)
1. Rate Limit 체크 (1분 10회)
2. 동시 실행 제한 체크 (최대 3개)
3. Quota 체크 (일일 10회) - 예약
4. 일기 저장 + AnalysisResult PENDING 생성

// 분석 완료 시 (/api/diary/analyze/stream)
5. Quota 증가 (성공한 것만) - 확정
6. 비용 계산 및 저장
```

---

## 4. 비용 계산 / 가격 설정 ✅

### 4.1 가격 설정 방식

**결정**: **환경변수로 관리** (권장안 채택)

**환경변수 키 구조:**
```env
# OpenAI
OPENAI_GPT4O_INPUT_PER_1K_USD=0.0025
OPENAI_GPT4O_OUTPUT_PER_1K_USD=0.0100

OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.00060

# Gemini
GEMINI_PRO_INPUT_PER_1K_USD=0.0005
GEMINI_PRO_OUTPUT_PER_1K_USD=0.0015
```

**실제 숫자는 나중에 가격표 보고 채우면 됨, 패턴/키 구조만 먼저 고정**

### 4.2 비용 계산 시점

**결정**: **분석 완료 시 즉시 계산** (문서 권장안 채택)

### 4.3 비용 계산 함수

```typescript
function calcCostUSD({
  provider,
  model,
  inputTokens,
  outputTokens,
}: {
  provider: "openai" | "gemini";
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const inputRate =
    getEnvNumber(`${provider.toUpperCase()}_${model.toUpperCase()}_INPUT_PER_1K_USD`) ?? 0;
  const outputRate =
    getEnvNumber(`${provider.toUpperCase()}_${model.toUpperCase()}_OUTPUT_PER_1K_USD`) ?? 0;

  const inputCost = (inputTokens / 1000) * inputRate;
  const outputCost = (outputTokens / 1000) * outputRate;

  return Number((inputCost + outputCost).toFixed(6));
}
```

### 4.4 저장 위치

**AnalysisResult 테이블:**
- `input_tokens`
- `output_tokens`
- `cost_usd`

**BillingRecord 테이블:**
- 실시간 upsert로 합산

---

## 5. BillingRecord 집계 정책 ✅

### 5.1 집계 주기

**결정**: **실시간 집계** 채택

**구현:**
- 분석 1건 끝날 때마다
- `AnalysisResult` (개별 기록) 저장
- `BillingRecord` (일/월/유저/프로바이더별 집계) 업데이트

**확장 시:**
- 트래픽 늘어나면 나중에
- 로그만 쌓고
- 크론 or 워커에서 배치 집계로 변경 가능

### 5.2 프로바이더별 분리

**결정**: **분리 추천** ✅

**필드 구조:**
```typescript
{
  date: string,           // "2025-12-06"
  userId: string | null,  // null이면 시스템 전체 합계
  provider: string,       // "openai", "gemini"
  model: string,          // "gpt-4o", "gpt-5-mini"
  total_input_tokens: number,
  total_output_tokens: number,
  total_cost_usd: number,
}
```

**장점:**
- "이번 달 OpenAI에 얼마 썼지?" 쿼리 쉬움
- "이 유저가 GPT-4 계열로만 얼마나 썼지?" 쿼리 쉬움

---

## 6. Redis 장애 시 동작 ✅

### 6.1 전략

**원칙**: **Redis 실패 시 DB 폴백 + 요청 허용**

**단, 폴백도 계속 실패하면:**
- 시스템 전체 보호를 위해 일시적으로 신규 분석 요청 막는 "세이프티 플래그" 준비

### 6.2 킬 스위치

**환경변수:**
```env
FORCE_ANALYSIS_DISABLED=true  # 이걸 걸면 바로 다 막힘
```

**체크리스트:**
- [ ] Redis 실패 시:
  1. 1순위: Redis → 2순위: DB 폴백
  2. 둘 다 안 되면 운영자 알림 + 임시 제한
  3. 킬 스위치로 전체 차단 가능

---

## 7. 추가 필수 사항

### 7.1 게스트 / 비로그인 방어

**전략:**
- 게스트 플로우가 있다면:
  - 아예 분석 막거나
  - 극단적으로 낮은 Quota + 강한 레이트리밋 + CAPTCHA 설정

**현재 방향성**: "게스트 거의 막는 쪽" → 문서에 기준 명시

### 7.2 모니터링 & 알림

**이상 징후 감지 기준:**
- 특정 유저/아이피가 짧은 시간에 이상하게 많은 요청
- 하루 비용이 "예산 한도"의 80%를 넘을 때

**대응:**
- 슬랙/메일/Webhook 알림
- 관리자가 직접 "일시 Quota 0으로 설정" 같은 조치 가능하게

---

## 8. 구현 액션 플랜

### Phase 1: 오늘 ~ 내일 (기본 방어 체계)

**1. QuotaStore 인터페이스 정의**
```typescript
interface QuotaStore {
  get(userId, period): Promise<QuotaData>;
  increment(userId, period): Promise<void>;
  reset(userId, period): Promise<void>;
}
```

**변경사항:** `type` 파라미터 제거 (전송 단일 quota)

**2. DBQuotaStore 구현**
- Prisma + 트랜잭션
- 동시성 보장
- UserQuota 테이블에서 전송 횟수만 관리

**3. checkQuotaOrThrow 헬퍼**
```typescript
async function checkQuotaOrThrow(
  userId: string,
  period: 'daily' | 'monthly' = 'daily'
): Promise<void> {
  const quota = await checkUserQuota(userId, period);
  if (!quota.allowed) {
    throw new QuotaExceededError(quota);
  }
}
```

**변경사항:** `type` 파라미터 제거

**4. Rate Limit 구현**
- 사용자별: 전송 1분 10회
- IP 기준: 글로벌 레이트리밋

**5. 동시 실행 제한**
- 유저당 최대 2~3개 분석 동시 실행

**6. API 통합**
- **전송 API (`/api/diary/create`)**: Rate Limit + 동시 실행 제한 + Quota 체크 (예약)
- **분석 완료 시 (`/api/diary/analyze/stream`)**: Quota 증가 (확정) + 비용 계산

---

### Phase 2: 이번 주 (비용 추적)

**1. 비용 계산 로직**
- 환경변수에서 가격 읽기
- `calcCostUSD` 함수 구현

**2. 분석 완료 시 저장**
- `input_tokens`, `output_tokens`, `cost_usd` 저장
- `AnalysisResult` 업데이트

**3. BillingRecord 실시간 업데이트**
- 분석 완료 시마다 upsert
- 프로바이더별 분리 저장

**4. 사용량 조회 API**
- `GET /api/quota` - 나의 오늘/이번 달 사용량
- `GET /api/billing` - 나의 비용 내역

---

### Phase 3: 다음 단계 (모니터링)

**1. 관리자 대시보드**
- 비용/사용량 대시보드
- 이상 징후 알림

**2. Redis 준비 (확장 시)**
- `USE_REDIS` 플래그
- `RedisQuotaStore` 골격만 먼저 만들어두기

**3. 게스트 방어**
- 게스트 Quota 설정
- CAPTCHA 연동 (필요 시)

---

## 9. 의사결정 체크리스트 (최종)

### ✅ 확정된 사항

- [x] **Quota 수치**: 무료 (일기 10/300, 분석 5/150), 프리미엄 (일기 100/3000, 분석 50/1500)
- [x] **Quota 증가 시점**: 완료 시 증가 + 동시 실행 제한 + Rate Limit
- [x] **비용 계산**: 환경변수 기반, 즉시 계산
- [x] **BillingRecord**: 실시간 집계, 프로바이더별 분리
- [x] **Redis 장애**: DB 폴백 + 킬 스위치

### 📋 추가 구현 필요

- [ ] **Rate Limit**: 사용자별 + IP 기준
- [ ] **동시 실행 제한**: 유저당 최대 2~3개
- [ ] **게스트 방어**: 낮은 Quota + 강한 레이트리밋
- [ ] **모니터링**: 이상 징후 감지 + 알림

---

## 10. 기술 스택

### 현재 (베타 단계)
- **Quota 저장**: PostgreSQL (UserQuota 테이블)
- **동시성 보장**: Prisma 트랜잭션
- **Rate Limit**: 메모리 기반 (또는 간단한 DB 카운터)
- **확장성**: 추상화 레이어로 Redis 전환 가능

### 확장 시 (트래픽 증가)
- **Quota 저장**: Redis (Atomic 연산)
- **Rate Limit**: Redis (Atomic 연산)
- **DB 동기화**: 배치 작업 (백업용)

---

## 📝 구현 예시 코드 구조

### QuotaStore 인터페이스
```typescript
// app/lib/quota-store/interface.ts
export interface QuotaStore {
  get(userId: string, period: 'daily' | 'monthly'): Promise<QuotaData>;
  increment(userId: string, period: 'daily' | 'monthly'): Promise<void>;
  reset(userId: string, period: 'daily' | 'monthly'): Promise<void>;
}

export interface QuotaData {
  count: number;
  limit: number;
  reset_at: Date;
}
```

**변경사항:**
- `type: 'diary' | 'analysis'` 파라미터 제거
- 전송 단일 quota로 통합

### DB 구현체
```typescript
// app/lib/quota-store/db-quota-store.ts
export class DBQuotaStore implements QuotaStore {
  async get(userId: string, period: 'daily' | 'monthly') {
    // Prisma 트랜잭션으로 조회
    // UserQuota 테이블에서 전송 횟수 조회
  }
  
  async increment(userId: string, period: 'daily' | 'monthly') {
    // Prisma 트랜잭션으로 증가
    // UserQuota 테이블에서 전송 횟수 증가
  }
}
```

### Rate Limit 헬퍼
```typescript
// app/lib/rate-limit.ts
export async function checkRateLimit(
  userId: string | null,
  ip: string
): Promise<{ allowed: boolean; resetAt: Date }> {
  // 사용자별 Rate Limit 체크 (전송 1분 10회)
  // IP 기준 글로벌 Rate Limit 체크
}
```

### 동시 실행 제한
```typescript
// app/lib/concurrent-limit.ts
export async function checkConcurrentLimit(
  userId: string,
  maxConcurrent: number = 3
): Promise<{ allowed: boolean; current: number }> {
  const inProgress = await getInProgressAnalysisCount(userId);
  return {
    allowed: inProgress < maxConcurrent,
    current: inProgress,
  };
}
```

### 통합 체크 함수
```typescript
// app/lib/quota-check.ts
export async function checkAllLimits(
  userId: string,
  ip: string
): Promise<void> {
  // 1. Rate Limit 체크 (전송 1분 10회)
  const rateLimit = await checkRateLimit(userId, ip);
  if (!rateLimit.allowed) {
    throw new RateLimitExceededError(rateLimit.resetAt);
  }
  
  // 2. 동시 실행 제한 (최대 3개)
  const concurrent = await checkConcurrentLimit(userId);
  if (!concurrent.allowed) {
    throw new ConcurrentLimitExceededError(concurrent.current);
  }
  
  // 3. Quota 체크 (전송 일일/월간)
  await checkQuotaOrThrow(userId);
}
```

---

## 🎯 최종 권장사항

### 즉시 구현 (오늘/내일)
1. ✅ QuotaStore 인터페이스 및 DB 구현체
2. ✅ Rate Limit 기본 구현
3. ✅ 동시 실행 제한
4. ✅ 일기 생성 API에 통합
5. ✅ 분석 API에 통합

### 이번 주 내
6. ✅ 비용 계산 로직
7. ✅ BillingRecord 실시간 업데이트
8. ✅ 사용량 조회 API

### 다음 주
9. ✅ 모니터링 및 알림
10. ✅ 관리자 대시보드
11. ✅ Redis 준비 (확장 시)

---

**작성자**: Auto (AI Assistant)  
**리뷰**: 먼팀장  
**태그**: #cost-management #quota #rate-limit #billing #beta-launch

