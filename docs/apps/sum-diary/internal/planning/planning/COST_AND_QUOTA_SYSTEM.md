# 비용 및 할당량 시스템

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 먼팀장 리뷰 반영 버전

## 개요

이 문서는 숨다이어리 서비스의 비용 관리 및 사용자 할당량(Quota) 시스템에 대한 통합 가이드입니다.

**핵심 원칙**: "남용 방지(Quota + Rate Limit)" + "비용 가시화" 두 축으로 동시 진행

**베타 단계 철학**:
- "일반 유저가 쓰기엔 넉넉하지만"
- "장난/스크립트 공격은 바로 걸리는" 수준

---

## 1. Quota 시스템

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

### 1.2 Quota 수치

#### 무료 사용자

| 항목 | 일일 | 월간 |
|------|------|------|
| **전송** | **10회** | **300회** |

**전송 1회 = 일기 1개 + 분석 1회**

#### 프리미엄 사용자

| 항목 | 일일 | 월간 | 비고 |
|------|------|------|------|
| **전송** | **100회** | **3000회** | 마케팅: "사실상 무제한" |

**마케팅 전략**: 프리미엄은 "무제한"으로 표기하되, 시스템 안전용 하드캡은 내부적으로 유지

#### 관리자 사용자

| 항목 | 일일 | 월간 |
|------|------|------|
| **전송** | **무제한** | **무제한** |

### 1.3 임시저장 정책

- **Quota 체크**: 없음 (상태일 뿐, 액션이 아님)
- **개수 제한**: 최대 10개 (UX/정리 목적)
- **자동 저장**: 3초마다 localStorage + 서버 저장

---

## 2. Rate Limit 및 동시 실행 제한

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

## 3. Quota 증가 시점 전략

### 3.1 결정: 분석 완료 시 증가 + 보완책

**기본 전략**: **분석 완료 시 Quota 증가**

**보완책**:
1. 동시 실행 개수 제한 (최대 2~3개)
2. Rate Limit (1분 10회)

**이유:**
- 전송 시점에 Quota 체크 (예약)
- 분석 완료 시 Quota 증가 (확정)
- 실패한 분석은 Quota에 안 들어가서 유저 경험 좋음
- 동시에 수백 개를 날리는 공격은 "동시 실행 제한"에서 막힘
- "레이트리밋"에서 한 번 더 걸림
- 구현 난이도 낮음

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

## 4. 비용 계산 및 가격 설정

### 4.1 가격 설정 방식

**결정**: **환경변수로 관리**

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

### 4.2 비용 계산 시점

**결정**: **분석 완료 시 즉시 계산**

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

## 5. BillingRecord 집계 정책

### 5.1 집계 주기

**결정**: **실시간 집계**

**구현:**
- 분석 1건 끝날 때마다
- `AnalysisResult` (개별 기록) 저장
- `BillingRecord` (일/월/유저/프로바이더별 집계) 업데이트

**확장 시:**
- 트래픽 늘어나면 나중에
- 로그만 쌓고
- 크론 or 워커에서 배치 집계로 변경 가능

### 5.2 프로바이더별 분리

**결정**: **분리 추천**

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

## 6. 토큰 수 및 비용 분석

### 6.1 프롬프트 토큰 수 변화

**기존 (v3 이전):**
- 프롬프트 토큰: 550 토큰
- 문자 수: 약 1,375자 (한국어 기준 1자 = 0.4 토큰)

**신규 (v4):**
- 프롬프트 토큰: 약 1,200 토큰
- 문자 수: 약 3,000자 (한국어 기준 1자 = 0.4 토큰)
- 증가량: **+650 토큰** (약 118% 증가)

### 6.2 비용 영향 (GPT-5-mini 기준)

**가격 정보:**
- 입력: $0.00025 per 1K tokens
- 출력: $0.002 per 1K tokens

**기존 시나리오 (5,000 토큰 기준):**
- 입력: 4,400 토큰 (프롬프트 550 + 일기 3,850)
- 출력: 600 토큰
- 총합: 5,000 토큰
- **비용 (USD)**: $0.0011 + $0.0012 = **$0.0023**
- **비용 (KRW)**: **₩3.38** (환율 1,470원 기준)

**신규 시나리오 (5,650 토큰 기준):**
- 입력: 5,050 토큰 (프롬프트 1,200 + 일기 3,850)
- 출력: 600 토큰
- 총합: 5,650 토큰
- **비용 (USD)**: $0.00126 + $0.0012 = **$0.00246**
- **비용 (KRW)**: **₩3.62**

**비용 증가**: 약 7% 증가 (토큰 증가 대비 비용 증가는 상대적으로 적음)

---

## 7. Redis 장애 시 동작

### 7.1 전략

**원칙**: **Redis 실패 시 DB 폴백 + 요청 허용**

**단, 폴백도 계속 실패하면:**
- 시스템 전체 보호를 위해 일시적으로 신규 분석 요청 막는 "세이프티 플래그" 준비

### 7.2 킬 스위치

**환경변수:**
```env
FORCE_ANALYSIS_DISABLED=true  # 이걸 걸면 바로 다 막힘
```

**체크리스트:**
- Redis 실패 시:
  1. 1순위: Redis → 2순위: DB 폴백
  2. 둘 다 안 되면 운영자 알림 + 임시 제한
  3. 킬 스위치로 전체 차단 가능

---

## 8. 추가 필수 사항

### 8.1 게스트 / 비로그인 방어

**전략:**
- 게스트 플로우가 있다면:
  - 아예 분석 막거나
  - 극단적으로 낮은 Quota + 강한 레이트리밋 + CAPTCHA 설정

**현재 방향성**: "게스트 거의 막는 쪽" → 문서에 기준 명시

### 8.2 모니터링 & 알림

**이상 징후 감지 기준:**
- 특정 유저/아이피가 짧은 시간에 이상하게 많은 요청
- 하루 비용이 "예산 한도"의 80%를 넘을 때

**대응:**
- 슬랙/메일/Webhook 알림
- 관리자가 직접 "일시 Quota 0으로 설정" 같은 조치 가능하게

---

## 9. 구현 액션 플랜

### Phase 1: 기본 방어 체계

1. QuotaStore 인터페이스 정의 (전송 단일 quota, type 파라미터 제거)
2. DBQuotaStore 구현 (Prisma + 트랜잭션, 전송 횟수만 관리)
3. checkQuotaOrThrow 헬퍼 (type 파라미터 제거)
4. Rate Limit 구현 (전송 1분 10회, IP 기준 글로벌)
5. 동시 실행 제한 (유저당 최대 2~3개)
6. 전송 API (`/api/diary/create`)에 통합: Rate Limit + 동시 실행 제한 + Quota 체크 (예약)
7. 분석 완료 시 (`/api/diary/analyze/stream`): Quota 증가 (확정) + 비용 계산

### Phase 2: 비용 추적

1. 가격 설정 (환경변수)
2. 비용 계산 함수 (`calcCostUSD`)
3. 분석 완료 시 비용 저장
4. BillingRecord 실시간 업데이트 (프로바이더별 분리)
5. 사용량 조회 API (`GET /api/quota`, `GET /api/billing`)

### Phase 3: 모니터링

1. 관리자 비용/사용량 대시보드
2. 이상 징후 감지 + 알림
3. Redis 준비 (확장 시, `RedisQuotaStore` 골격만)
4. 게스트 방어 (낮은 Quota + 강한 레이트리밋)

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

## 11. 핵심 문제점 및 해결 방안

### 문제점

1. **악의적 사용자로 인한 비용 폭탄 위험**
   - 현재 상태: 일기 작성/AI 분석 제한 없음
   - 시나리오: 1초에 100개 요청 → 하루 $10,000+ 비용 발생 가능
   - 리스크: 서비스 종료 위험

2. **비용 추적 부재**
   - 현재 상태: `input_tokens`, `output_tokens`, `cost_usd` 필드는 있으나 계산/저장 안 함
   - 문제: 얼마나 비용이 발생했는지 모름, 예산 계획 불가능

3. **사용량 제한 부재**
   - 현재 상태: `UserQuota` 스키마는 있으나 API 구현 없음
   - 문제: 무제한 사용 가능, 공정한 리소스 사용 보장 불가

### 해결 방안

1. **UserQuota 시스템 구현**
   - DB 직접 조회 (베타 단계에서 충분)
   - 확장 시 Redis 전환 가능하도록 추상화 레이어 설계
   - `QuotaStore` 인터페이스 → `DBQuotaStore` (현재) → `RedisQuotaStore` (확장 시)

2. **비용 추적 시스템 구현**
   - 환경변수로 가격 관리
   - 분석 완료 시 즉시 계산 및 저장

3. **Rate Limit & 동시 실행 제한**
   - Quota만으로는 폭주 공격 못 막음
   - Rate Limit: 전송 1분 10회
   - 동시 실행 제한: 유저당 최대 2~3개
   - IP 기준 글로벌 Rate Limit도 필요

---

## 참고 문서

- [비용 관리 시스템 상세](./COST_MANAGEMENT_SYSTEM_DETAILED.md)
- [비용 관리 시스템 v2](./COST_MANAGEMENT_SYSTEM_V2.md)
- [비용 관리 문제점 요약](./COST_MANAGEMENT_PROBLEMS_SUMMARY.md)
- [Quota 시스템 최종 정책](./QUOTA_SYSTEM_FINAL.md)
- [프롬프트 토큰 비용 분석](./PROMPT_TOKEN_COST_ANALYSIS.md)
- [Quota 시스템 코드 리뷰](./QUOTA_SYSTEM_CODE_REVIEW.md)
- [Quota 시스템 초안 분석](./QUOTA_DRAFT_ANALYSIS.md)

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
