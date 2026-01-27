# 💰 비용 관리 시스템 - 문제점 및 해결방안 요약 (v2)

> 먼팀장 리뷰 반영 버전  
> 작성일: 2025-12-06

---

## 🔴 핵심 문제점

### 1. 악의적 사용자로 인한 비용 폭탄 위험
- **현재 상태**: 일기 작성/AI 분석 제한 없음
- **시나리오**: 1초에 100개 요청 → 하루 $10,000+ 비용 발생 가능
- **리스크**: 서비스 종료 위험
- **우선순위**: 🔴 **CRITICAL**

### 2. 비용 추적 부재
- **현재 상태**: `input_tokens`, `output_tokens`, `cost_usd` 필드는 있으나 계산/저장 안 함
- **문제**: 얼마나 비용이 발생했는지 모름, 예산 계획 불가능
- **우선순위**: 🔴 **CRITICAL**

### 3. 사용량 제한 부재
- **현재 상태**: `UserQuota` 스키마는 있으나 API 구현 없음
- **문제**: 무제한 사용 가능, 공정한 리소스 사용 보장 불가
- **우선순위**: 🔴 **CRITICAL**

---

## 💡 해결 방안

### 1. UserQuota 시스템 구현

**아키텍처 결정:**
- ✅ **현재**: DB 직접 조회 (베타 단계에서 충분)
- ✅ **확장 시**: Redis 전환 가능하도록 추상화 레이어 설계
- ✅ **구현**: `QuotaStore` 인터페이스 → `DBQuotaStore` (현재) → `RedisQuotaStore` (확장 시)

**Quota 증가 시점 ✅ 확정:**
- **전송 시점**: Quota 체크 (예약)
- **분석 완료 시점**: Quota 증가 (확정)
- **보완책**:
  1. 동시 실행 개수 제한 (유저당 최대 2~3개)
  2. Rate Limit (전송 1분 10회)
- **이유**: 실패한 분석은 Quota에 안 들어가서 유저 경험 좋음 + 공격은 동시 실행 제한과 Rate Limit에서 막힘

**Quota 제한 수치 ✅ 확정:**
- **전송 단일 Quota 시스템** (일기/분석 분리 없음)
- **전송 1회 = 일기 1개 + 분석 1회**
- **무료 사용자**:
  - 일일 전송: **10회**
  - 월간 전송: **300회**
- **프리미엄 사용자**:
  - 일일 전송: **100회** (마케팅: "사실상 무제한")
  - 월간 전송: **3000회**
- **임시저장**: Quota 체크 없음, 최대 10개 제한 (UX/정리 목적)

---

### 2. 비용 추적 시스템 구현

**가격 설정 방식 ✅ 확정:**
- **환경변수로 관리** (옵션 A 채택)
- **환경변수 키 구조**: `{PROVIDER}_{MODEL}_INPUT_PER_1K_USD`, `{PROVIDER}_{MODEL}_OUTPUT_PER_1K_USD`
- **예시**: `OPENAI_GPT4O_INPUT_PER_1K_USD=0.0025`, `OPENAI_GPT4O_OUTPUT_PER_1K_USD=0.0100`
- **실제 숫자는 나중에 가격표 보고 채우면 됨, 패턴/키 구조만 먼저 고정**

**비용 계산 시점:**
- ✅ 확정: 분석 완료 시 즉시 계산

---

### 3. BillingRecord 집계

**집계 주기 ✅ 확정:**
- **실시간 집계** 채택 (옵션 A)
- 분석 1건 끝날 때마다 `BillingRecord` upsert

**프로바이더별 분리 ✅ 확정:**
- **분리 추천** 채택
- 필드: `date`, `userId`, `provider`, `model`, `total_input_tokens`, `total_output_tokens`, `total_cost_usd`

---

## 🎯 의사결정 체크리스트

### 필수 결정 사항

1. **Quota 제한 수치**
   - [ ] 일일 일기 작성: ?개
   - [ ] 월간 일기 작성: ?개
   - [ ] 일일 분석: ?개
   - [ ] 월간 분석: ?개
   - [ ] 프리미엄 사용자: 제한 없음? 증가된 제한?

2. **Quota 증가 시점**
   - [ ] 즉시? 완료 시? 하이브리드? (권장: 하이브리드)

3. **비용 계산 방식**
   - [ ] 가격 설정: 환경변수? 설정 파일? DB? (권장: 환경변수)
   - [ ] 프로바이더별 가격: 각각 설정?

4. **BillingRecord 집계**
   - [ ] 집계 주기: 실시간? 배치? (권장: 실시간)
   - [ ] 프로바이더별 분리: 필요?

5. **Redis 장애 시 동작 ✅ 확정**
   - [x] Redis 실패 시: DB 폴백 + 요청 허용
   - [x] 폴백도 실패 시: 킬 스위치 (`FORCE_ANALYSIS_DISABLED=true`)로 전체 차단

---

## 📊 구현 우선순위

### Phase 1: 오늘 ~ 내일 (기본 방어 체계)
1. QuotaStore 인터페이스 정의 (전송 단일 quota, type 파라미터 제거)
2. DBQuotaStore 구현 (Prisma + 트랜잭션, 전송 횟수만 관리)
3. checkQuotaOrThrow 헬퍼 (type 파라미터 제거)
4. **Rate Limit 구현** (전송 1분 10회, IP 기준 글로벌)
5. **동시 실행 제한** (유저당 최대 2~3개)
6. **전송 API (`/api/diary/create`)에 통합**: Rate Limit + 동시 실행 제한 + Quota 체크 (예약)
7. **분석 완료 시 (`/api/diary/analyze/stream`)**: Quota 증가 (확정) + 비용 계산

### Phase 2: 이번 주 (비용 추적)
1. 가격 설정 (환경변수)
2. 비용 계산 함수 (`calcCostUSD`)
3. 분석 완료 시 비용 저장
4. BillingRecord 실시간 업데이트 (프로바이더별 분리)
5. 사용량 조회 API (`GET /api/quota`, `GET /api/billing`)

### Phase 3: 다음 단계 (모니터링)
1. 관리자 비용/사용량 대시보드
2. 이상 징후 감지 + 알림
3. Redis 준비 (확장 시, `RedisQuotaStore` 골격만)
4. 게스트 방어 (낮은 Quota + 강한 레이트리밋)

---

## ⚠️ 주의사항

### 1. 동시성 문제
- DB 트랜잭션 사용 필수 (`prisma.$transaction`)
- 확장 시 Redis Atomic 연산 사용

### 2. 리셋 시간 처리
- 일일: 매일 자정 (UTC 기준)
- 월간: 매월 1일 자정 (UTC 기준)
- 타임존 고려 필요

### 3. 프리미엄 사용자 처리
- `is_premium` 플래그 확인
- 프리미엄은 증가된 제한 (일기 100/3000, 분석 50/1500)
- 마케팅: "사실상 무제한"으로 표기

### 4. Rate Limit & 동시 실행 제한 (필수)
- **Quota만으로는 폭주 공격 못 막음**
- Rate Limit: 분석 1분 10회, 일기 1분 20회
- 동시 실행 제한: 유저당 최대 2~3개
- IP 기준 글로벌 Rate Limit도 필요

### 5. 게스트 방어
- 게스트는 아예 분석 막거나
- 극단적으로 낮은 Quota + 강한 레이트리밋 + CAPTCHA

### 6. 모니터링 & 알림
- 이상 징후 감지: 특정 유저/IP가 짧은 시간에 많은 요청
- 비용 알림: 하루 비용이 예산의 80% 넘을 때
- 대응: 슬랙/메일/Webhook 알림 + 관리자 직접 Quota 0 설정 가능

---

## 🔧 기술 스택

### 현재 (베타 단계)
- **Quota 저장**: PostgreSQL (UserQuota 테이블)
- **동시성 보장**: Prisma 트랜잭션
- **확장성**: 추상화 레이어로 Redis 전환 가능

### 확장 시 (트래픽 증가)
- **Quota 저장**: Redis (Atomic 연산)
- **동시성 보장**: Redis INCR
- **DB 동기화**: 배치 작업 (백업용)

---

## 📝 구현 예시 코드 구조

```typescript
// 추상화 레이어
interface QuotaStore {
  get(userId, type, period): Promise<QuotaData>;
  increment(userId, type, period): Promise<void>;
}

// 현재: DB 구현
class DBQuotaStore implements QuotaStore { ... }

// 확장 시: Redis 구현
class RedisQuotaStore implements QuotaStore { ... }

// 사용: 환경변수로 선택
const quotaStore = process.env.USE_REDIS 
  ? new RedisQuotaStore() 
  : new DBQuotaStore();
```

---

## 🎯 최종 권장사항 (먼팀장 리뷰 반영)

### 즉시 구현 (오늘/내일)
1. ✅ QuotaStore 인터페이스 및 DB 구현체
2. ✅ **Rate Limit 구현** (사용자별 + IP 기준)
3. ✅ **동시 실행 제한** (유저당 최대 2~3개)
4. ✅ 기본 Quota 체크 함수
5. ✅ 일기 생성 API에 통합 (Rate Limit + Quota)
6. ✅ 분석 API에 통합 (Rate Limit + 동시 실행 제한 + Quota)

### 이번 주 내
7. ✅ 비용 계산 로직 (환경변수 기반)
8. ✅ BillingRecord 실시간 업데이트 (프로바이더별 분리)
9. ✅ 사용량 조회 API

### 다음 주
10. ✅ 모니터링 및 알림
11. ✅ 관리자 대시보드 연동
12. ✅ Redis 준비 (확장 시)

---

**상세 문서**: 
- `COST_MANAGEMENT_SYSTEM_DETAILED.md` - 전체 상세 분석
- `COST_MANAGEMENT_SYSTEM_V2.md` - 먼팀장 리뷰 반영 버전 (권장)

