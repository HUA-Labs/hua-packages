# 악용 탐지 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **다층 방어 시스템**을 통해 API 악용을 탐지하고 제재합니다. 이 문서는 실제 구현 코드를 기반으로 악용 탐지 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- 다층 방어: 요청 빈도, 내용 패턴, 동시 실행 제한
- 지능형 필터링: 진짜 불순물만 제외, 감정 분석 가능한 "장난"은 포함
- 사용자 경험 보호: 악용 탐지해도 사용자 경험에 최소한의 영향
- 점진적 제재: 경고 → Rate Limit → 임시 차단 → 영구 차단

---

## 1. 시스템 구조

### 1.1 다층 방어 시스템

```
요청 도착
    ↓
1단계: 요청 빈도 체크
    ├─ 분당 10회 제한
    ├─ 시간당 100회 제한
    └─ IP + User-Agent 기반
    ↓
2단계: 내용 패턴 탐지
    ├─ 진짜 불순물 필터링 (분석 제외)
    ├─ 탈옥 시도 감지 (분석 포함, 태깅)
    └─ 의심스러운 패턴 감지
    ↓
3단계: 동시 실행 제한
    ├─ 사용자당 최대 3개 동시 분석
    └─ PROCESSING 상태 카운트
    ↓
4단계: Quota 체크
    ├─ 일일 전송 제한
    └─ 월간 전송 제한
    ↓
요청 허용/거부
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/abuse-detection.ts`: 악용 탐지 메인 로직
- `app/lib/rate-limit.ts`: Rate Limiting
- `app/lib/concurrent-limit.ts`: 동시 실행 제한
- `app/lib/quota-check.ts`: 통합 제한 체크
- `app/lib/jailbreak-messages.ts`: 탈옥 시도 메시지

---

## 2. 요청 빈도 체크

### 2.1 Rate Limiting

**구현 위치:** `app/lib/rate-limit.ts`

**제한:**
- 사용자별: 분당 10회
- IP별: 글로벌 Rate Limit

**구현:**
```typescript
export async function checkUserRateLimit(
  userId: string,
  limitPerMinute: number = 10
): Promise<RateLimitResult>
```

**메모리 기반:**
- 서버리스 환경: 각 인스턴스마다 별도 메모리
- 완벽한 글로벌 제한은 아님 (인스턴스별 제한)
- 프로덕션에서는 Redis 권장

**Lazy Cleanup:**
- 확률 기반 정리 (1% 확률)
- 만료된 엔트리 자동 제거
- 메모리 누수 방지

### 2.2 요청 빈도 체크

**구현:** `checkRequestFrequency(ip, userId?)`

**체크 항목:**
- 최근 1분간 요청 수
- 최근 1시간간 요청 수

**제한:**
- 분당 10회 초과 → `RATE_LIMIT`
- 시간당 100회 초과 → `TEMPORARY_BAN`

**데이터 소스:**
- `LoginLog` 테이블
- IP + User ID 기반 집계

---

## 3. 내용 패턴 탐지

### 3.1 진짜 불순물 필터링

**구현:** `shouldSkipAnalysis(content)`

**목적:**
- AI가 감정 분석할 수 없는 진짜 스팸/결함만 제외
- 감정 분석 가능한 "장난"은 포함

**필터링 기준:**

1. **너무 짧은 내용** (< 10자)
   - 패턴: `TOKEN_ABUSE`
   - 분석 제외

2. **무의미한 패턴 비율** (> 30%)
   - 긴 랜덤 문자열, base64 등
   - 패턴: `REPETITIVE_CONTENT`
   - 분석 제외

3. **순수 명령어만 있는 경우**
   - 컨텍스트 없는 탈옥 시도
   - 실제 감정/내용 없음
   - 패턴: `SUSPICIOUS_PROMPTS`
   - 분석 제외

4. **완전히 반복된 내용** (90% 이상)
   - 같은 문자/단어 반복
   - 패턴: `REPETITIVE_CONTENT`
   - 분석 제외

5. **과도한 길이** (> 10,000자)
   - 스팸 입력
   - 패턴: `TOKEN_ABUSE`
   - 분석 제외

6. **구조적으로 망가진 입력**
   - Base64 garbage
   - 패턴: `REPETITIVE_CONTENT`
   - 분석 제외

7. **탈옥용 롱프롬프트** (실제 내용 부족)
   - 탈옥 패턴 감지 + 실제 감정 내용 거의 없음
   - 패턴: `SUSPICIOUS_PROMPTS`
   - 분석 제외

8. **감정 회피형 프롬프트** (실제 내용 부족)
   - 소설화 등
   - 패턴: `SUSPICIOUS_PROMPTS`
   - 분석 제외

9. **벡터/난수 삽입** (30% 이상)
   - 분석 회피용
   - 패턴: `REPETITIVE_CONTENT`
   - 분석 제외

10. **비정상 언어 혼합** (실제 내용 부족)
    - 다국어 탈옥 시도
    - 패턴: `SUSPICIOUS_PROMPTS`
    - 분석 제외

11. **모델 성능 테스트 데이터**
    - 벤치마크 주입
    - 패턴: `SUSPICIOUS_PROMPTS`
    - 분석 제외

12. **과도한 문장 반복** (5회 이상)
    - 노잼 장난
    - 패턴: `REPETITIVE_CONTENT`
    - 분석 제외

### 3.2 탈옥 시도 감지

**패턴:**

**탈옥용 롱프롬프트:**
- `/당신\s*(은|이)?\s*(이제|지금|바로|이후)\s*(부터|후|부터는)?/i`
- `/이?\s*구조\s*로\s*응답/i`
- `/템플릿/i`
- `/therapist|상담사|치료사/i`
- `/(감정|분석)\s*하지\s*마/i`
- `/원래\s*(지시사항|프롬프트|지시)\s*(을|를)?\s*무시/i`
- `/모든\s*(필터|제약|제한|콘텐츠\s*필터)\s*(을|를)?\s*비활성화/i`
- `/\[SYSTEM[_\s]?PROMPT[_\s]?OVERRIDE\]/i`

**감정 회피형:**
- `/이\s*일기는?\s*(감정|느낌|기분)\s*(에\s*대한\s*것이\s*)?아니/i`
- `/고양이\s*전사|소설|판타지|모험담/i`

**벡터/난수 패턴:**
- `/\[-?\d+\.\d+(\s*,\s*-?\d+\.\d+)*\s*\]/`
- `/벡터|vector|array|배열/i`
- `/^\s*\[?\s*[-+]?\d+\.\d+(\s*,\s*[-+]?\d+\.\d+){5,}\s*\]?\s*$/m`

**모델 테스트 패턴:**
- `/benchmark|벤치마크/i`
- `/모델\s*비교|모델\s*평가|성능\s*테스트/i`

**처리 전략:**
- 실제 감정 내용이 충분하면 → 분석 포함, 태깅만
- 실제 내용이 부족하면 → 분석 제외

### 3.3 의심스러운 키워드

**키워드 목록:**
- 영어: `ignore`, `forget`, `previous`, `prompt`, `system`, `as an ai`, `you are`, `pretend`, `roleplay`, `jailbreak`, `bypass`, `hack`, `exploit`
- 한국어: `무시`, `지시사항`, `원래`, `제약`, `필터`, `비활성화`, `명령`, `따르`, `자유롭게`, `제한 없이`

**감지 기준:**
- 2개 이상 키워드 감지 → 의심스러운 패턴
- 실제 감정 내용 확인 후 판단

---

## 4. 동시 실행 제한

### 4.1 동시 실행 제한

**구현 위치:** `app/lib/concurrent-limit.ts`

**제한:**
- 사용자당 최대 3개 동시 분석
- `PROCESSING` 상태 카운트

**구현:**
```typescript
export async function checkConcurrentLimit(
  userId: string,
  maxConcurrent: number = 3
): Promise<ConcurrentLimitResult>
```

**체크 로직:**
```typescript
const count = await prisma.analysisResult.count({
  where: {
    diary: { user_id: userId },
    status: 'PROCESSING',
  },
});
```

**에러:**
- `ConcurrentLimitExceededError`
- 현재 실행 중인 작업 수와 최대값 포함

---

## 5. 통합 제한 체크

### 5.1 통합 체크 함수

**구현 위치:** `app/lib/quota-check.ts`

**구현:** `checkAllLimits(userId, ip, userAgent?)`

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

## 6. 악용 패턴 타입

### 6.1 AbusePattern Enum

**패턴:**
- `RAPID_REQUESTS`: 초고속 요청
- `REPETITIVE_CONTENT`: 반복적인 내용
- `SUSPICIOUS_PROMPTS`: 의심스러운 프롬프트 (탈옥 시도 등)
- `TOKEN_ABUSE`: 토큰 남용 (과도한 길이)
- `MULTI_ACCOUNT`: 다중 계정 사용
- `API_SCRAPING`: API 스크래핑

### 6.2 PenaltyLevel Enum

**제재 레벨:**
- `WARNING`: 경고
- `RATE_LIMIT`: Rate limiting
- `TEMPORARY_BAN`: 임시 차단 (1시간)
- `PERMANENT_BAN`: 영구 차단

---

## 7. 악용 로깅 및 알림

### 7.1 악용 로깅

**구현:** `logAbuse(request, pattern, level, userId?, details?)`

**로깅 항목:**
- IP 주소
- User-Agent
- 악용 패턴
- 제재 레벨
- 상세 정보

**저장 위치:**
- `LoginLog` 테이블
- `action: 'diary_write'`
- `is_guest: !userId`

### 7.2 AbuseAlert 생성

**구현:** `createAbuseAlertAsync(input)`

**입력:**
```typescript
{
  userId: string;
  diaryId?: string;
  analysisResultId?: string;
  abusePatterns: AbusePattern[];
  penaltyLevel: PenaltyLevel;
  contentFlags?: string[];
  detectedPatterns?: string[];
  excludeFromAnalysis?: boolean;
  diaryExcerpt?: string;
  content?: string;
}
```

**저장 데이터:**
- 사용자 ID
- 일기 ID (선택적)
- 악용 패턴 배열
- 제재 레벨
- 내용 플래그
- 감지된 패턴
- 분석 제외 여부
- 일기 발췌

**비동기 처리:**
- 사용자 응답에 영향 없음
- Fire-and-forget 패턴

---

## 8. 통합 악용 탐지

### 8.1 통합 탐지 함수

**구현:** `detectAndCheckAbuse(request, content?, userId?, diaryId?, analysisResultId?)`

**프로세스:**
1. 요청 빈도 체크
2. 내용 기반 패턴 탐지
3. 진짜 불순물 필터링
4. 탈옥 시도 감지 (분석 포함, 태깅)
5. 결과 반환

**반환 값:**
```typescript
{
  allowed: boolean;
  pattern?: AbusePattern;
  level?: PenaltyLevel;
  message?: string;
  excludeFromAnalysis?: boolean;
  analysisTags?: string[]; // 정상 데이터 분석 시 필터링용
}
```

### 8.2 처리 전략

**진짜 불순물:**
- `allowed: true` (저장은 허용)
- `excludeFromAnalysis: true` (분석 제외)
- `level: 'WARNING'`

**탈옥 시도 (감정 내용 충분):**
- `allowed: true` (저장 및 분석 허용)
- `excludeFromAnalysis: false` (분석 포함)
- `level: 'WARNING'`
- `analysisTags: ['jailbreak_attempt', 'playful_content']` (태깅)

**요청 빈도 초과:**
- `allowed: false` (요청 거부)
- `level: 'RATE_LIMIT'` 또는 `'TEMPORARY_BAN'`

---

## 9. 탈옥 시도 메시지

### 9.1 사용자 메시지

**구현 위치:** `app/lib/jailbreak-messages.ts`

**목적:**
- 유머러스하고 교육적인 톤
- 놀랍지만 유해하지 않은 메시지
- 사용자 경험 보호

**메시지 타입:**
- `playful`: 장난스러운 톤
- `friendly`: 친근한 톤
- `surprised`: 놀란 톤

**예시:**
- "탈옥 시도 감지! 아하! 지시사항을 무시하라고 시도하는 걸 감지했어요. 하지만 걱정 마세요 - 우리는 이미 그럴 준비가 되어 있었거든요!"
- "프롬프트 인젝션 탐지! 흥미로운 시도네요! AI에게 다른 지시를 주려고 하셨나요?"

### 9.2 메시지 주입

**구현:** `injectJailbreakMessageToInterpretation(originalInterpretation, jailbreakMessage)`

**형식:**
```
[JAILBREAK_MESSAGE:{"type":"jailbreak_notice","title":"...","message":"..."}]원본 해석
```

**파싱:**
- 프론트엔드에서 특별 마커로 파싱
- 메시지와 원본 해석 분리

---

## 10. 설정 및 임계값

### 10.1 악용 감지 설정

**구현:** `ABUSE_DETECTION_CONFIG`

**Rate Limiting:**
- `MAX_REQUESTS_PER_MINUTE: 10`
- `MAX_REQUESTS_PER_HOUR: 100`

**Content Patterns:**
- `MIN_CONTENT_LENGTH: 10`
- `MAX_CONTENT_LENGTH: 10000`
- `REPETITIVE_THRESHOLD: 0.8` (80% 이상 중복)

**Penalty Durations:**
- `TEMPORARY_BAN_DURATION: 60` (1시간)
- `RATE_LIMIT_DURATION: 15` (15분)

### 10.2 동시 실행 제한

**기본값:**
- `maxConcurrent: 3` (사용자당 최대 3개)

---

## 11. 구현 상세

### 11.1 주요 함수

**악용 탐지:**
- `shouldSkipAnalysis(content)`: 진짜 불순물 필터링
- `detectAndCheckAbuse(...)`: 통합 악용 탐지
- `checkRequestFrequency(ip, userId?)`: 요청 빈도 체크
- `logAbuse(...)`: 악용 로깅
- `createAbuseAlertAsync(...)`: AbuseAlert 생성

**Rate Limiting:**
- `checkUserRateLimit(userId, limitPerMinute?)`: 사용자별 Rate Limit
- `checkIPRateLimit(ip, limitPerMinute?)`: IP별 Rate Limit

**동시 실행 제한:**
- `checkConcurrentLimit(userId, maxConcurrent?)`: 동시 실행 제한
- `getInProgressAnalysisCount(userId)`: 진행 중인 분석 수

**통합 체크:**
- `checkAllLimits(userId, ip, userAgent?)`: 모든 제한 통합 체크

**탈옥 메시지:**
- `getJailbreakMessage(analysisTags)`: 탈옥 시도 메시지
- `injectJailbreakMessageToInterpretation(...)`: 메시지 주입
- `extractJailbreakMessage(interpretation)`: 메시지 추출

### 11.2 데이터 구조

**AbuseAlert:**
```typescript
{
  id: string;
  user_id: string;
  diary_id?: string;
  analysis_result_id?: string;
  alert_type: 'ABUSE';
  abuse_patterns: AbusePattern[];
  penalty_level: PenaltyLevel;
  status: AbuseAlertStatus;
  content_flags: string[];
  detected_patterns: string[];
  exclude_from_analysis: boolean;
  diary_excerpt?: string;
}
```

---

## 12. 보안 고려사항

### 12.1 다층 방어

**전략:**
- 요청 빈도 → 내용 패턴 → 동시 실행 → Quota
- 각 단계에서 차단 가능
- 완전한 방어 불가능하지만 다층으로 위험 최소화

### 12.2 사용자 경험 보호

**원칙:**
- 진짜 불순물만 제외
- 감정 분석 가능한 "장난"은 포함
- 유머러스한 메시지로 사용자 교육

### 12.3 점진적 제재

**단계:**
1. 경고 (WARNING)
2. Rate Limiting (RATE_LIMIT)
3. 임시 차단 (TEMPORARY_BAN)
4. 영구 차단 (PERMANENT_BAN)

---

## 13. 성능 고려사항

### 13.1 병렬 체크

**최적화:**
- 모든 제한 체크를 `Promise.all()`로 병렬 실행
- 응답 시간 최소화

### 13.2 메모리 기반 Rate Limit

**제한:**
- 서버리스 환경에서는 인스턴스별 제한
- 완벽한 글로벌 제한은 아님
- 프로덕션에서는 Redis 권장

### 13.3 Lazy Cleanup

**전략:**
- 확률 기반 정리 (1% 확률)
- 메모리 누수 방지
- 서버리스 환경에 적합

---

## 14. 참고 자료

### 관련 코드 파일
- `app/lib/abuse-detection.ts`: 악용 탐지 메인 로직
- `app/lib/rate-limit.ts`: Rate Limiting
- `app/lib/concurrent-limit.ts`: 동시 실행 제한
- `app/lib/quota-check.ts`: 통합 제한 체크
- `app/lib/jailbreak-messages.ts`: 탈옥 시도 메시지

### 관련 문서
- [악용 방지 가이드](../security/ABUSE_PREVENTION_GUIDE.md)
- [악용 vs 위기 비교](../security/ABUSE_VS_CRISIS_COMPARISON.md)
- [할당량 및 비용 관리](./QUOTA_AND_BILLING_SYSTEM.md)

---

## 15. 향후 개선 계획

### 15.1 계획된 개선사항

1. **Redis 기반 Rate Limit**
   - 글로벌 Rate Limit 구현
   - 서버리스 환경 대응

2. **머신러닝 기반 탐지**
   - 패턴 학습
   - 정확도 향상

3. **실시간 모니터링**
   - 악용 패턴 대시보드
   - 자동 알림

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
