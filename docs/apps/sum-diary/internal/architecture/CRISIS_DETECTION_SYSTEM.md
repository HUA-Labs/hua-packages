# 위기 감지 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **3단계 안전망**을 통해 사용자의 위기 상황을 감지하고 대응합니다. 이 문서는 실제 구현 코드를 기반으로 위기 감지 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- Privacy-First: 위기 감지 시 자동 익명화
- 3단계 안전망: AI 감지 + 키워드 Fail-Safe + 운영자 판단
- 히스토리 기반 Escalation: 누적 위험도 자동 상승
- 비동기 처리: 사용자 응답 속도에 영향 없음

---

## 1. 시스템 구조

### 1.1 3단계 안전망

```
일기 작성 완료
    ↓
비동기 위기 감지 시작
    ↓
1단계: AI 기반 감지
    ├─ 1차 AI 분석 결과의 ethics 태그 확인
    ├─ crisis_ 태그 감지
    └─ 위험 신호 감지
    ↓
2단계: 키워드 Fail-Safe
    ├─ 자살 관련 키워드
    ├─ 자해 관련 키워드
    ├─ 약물 관련 키워드
    ├─ 아동 학대 관련 키워드
    ├─ 테러/폭력 관련 키워드
    └─ 의료 정보 관련 키워드
    ↓
3단계: 운영자 최종 판단
    ├─ CrisisAlert 생성
    ├─ 관리자 대시보드 표시
    └─ 운영자 검토 및 조치
```

### 1.2 구현 위치

**주요 파일:**
- `app/lib/crisis-detection-service.ts`: 위기 감지 메인 로직
- `app/lib/anonymizer.ts`: 익명화 및 위험 신호 감지

---

## 2. 익명화 시스템

### 2.1 개인정보 익명화

**구현 위치:** `app/lib/anonymizer.ts`

**익명화 대상:**
- 전화번호: `[전화번호]`
- 이메일: `[이메일]`
- 주소: `[주소]`
- 한글 이름: `[익명]`
- 영어 이름: `[Anonymous]`

**익명화 함수:**
```typescript
export function anonymizePersonalInfo(text: string): string
```

**프로세스:**
1. 전화번호 패턴 감지 및 익명화
2. 이메일 주소 감지 및 익명화
3. 주소 패턴 감지 및 익명화
4. 한글 이름 패턴 감지 및 익명화
5. 영어 이름 패턴 감지 및 익명화

### 2.2 민감정보 필터링

**구현:** `filterSensitiveInfo(text: string): SensitiveInfoFilterResult`

**필터링 대상:**
- 금융정보: 카드번호, 계좌정보
- 주민등록번호
- 심각한 의료정보

**위험 신호 감지:**
- 자살 관련 키워드
- 자해 관련 키워드
- 약물 관련 키워드
- 아동 학대 관련 키워드
- 테러/폭력 관련 키워드

**위험 신호 표시:**
- 위험 키워드는 `[위험신호]`로 대체
- 원문은 보존하되 표시만 변경

---

## 3. 위기 감지 프로세스

### 3.1 메인 감지 함수

**구현:** `detectCrisisAsync(input: DetectCrisisInput): Promise<void>`

**입력:**
```typescript
interface DetectCrisisInput {
  userId: string;
  diaryId: string;
  analysisResultId: string;
  diaryContent: string; // 원문
  aiEthics: string[]; // 1차 AI가 감지한 ethics 태그
  aiConfidence?: number;
}
```

**프로세스:**
1. 일기 정보 조회 (일기 날짜 확인)
2. 키워드 기반 민감정보 필터링 및 위험 신호 감지
3. AI 감지 결과와 키워드 감지 결과 병합
4. 히스토리 기반 Escalation 계산
5. 재식별 위험 평가
6. CrisisAlert 생성 (위험 수준이 0이 아니면)

### 3.2 AI 기반 감지

**감지 기준:**
- `crisis_` 태그 감지
- `danger`, `safety` 태그 감지
- `accountability`, `de-escalation` 태그 감지
- `isolation` 태그와 함께 위험 신호

**AI 감지 로직:**
```typescript
const aiDetectedCrisis = input.aiEthics.some(tag => 
  tag.startsWith('crisis_') || 
  tag === 'danger' || 
  tag === 'safety' ||
  tag === 'accountability' ||
  tag === 'de-escalation' ||
  tag.includes('danger') ||
  tag.includes('crisis')
);
```

### 3.3 키워드 Fail-Safe

**구현:** `filterSensitiveInfo()` 함수

**키워드 카테고리:**

**자살 관련:**
- '자살', '목숨을 끊', '죽고 싶', '살고 싶지 않', '사라지고 싶'
- '세상을 떠나', '끝내고 싶', '유서', '극단적 선택'

**자해 관련:**
- '자해', '손목을 그', '칼로', '베었', '상처를 냈', '피를 봤'

**약물 관련:**
- '마약', '대마', '필로폰', '코카인', '헤로인', '엑스터시'
- '환각제', '약물 복용', '과다 복용', '약을 많이'

**아동 학대 관련:**
- '아동학대', '아이를 때렸', '아이를 때림', '애를 때렸'
- '체벌', '폭행', '성추행', '성폭행', '학대'

**테러/폭력 관련:**
- '테러', '폭탄', '폭발물', '총기', '인질', '납치', '폭파'
- '테러리스트', '테러 계획', '공격 계획', '무차별', '살상'
- '칼부림', '묻지마', '사람을 죽', '복수', '범죄 계획'

**의료 정보:**
- '암진단', '암 진단', '암환자', '항암', '말기', '중증', '입원'

### 3.4 위험 수준 계산

**구현:** `calculateRiskLevel(riskSignals)`

**위험 수준:**
- **0**: 위험 신호 없음
- **1**: 낮음 (금융정보 등)
- **2**: 중간 (심각한 의료정보)
- **3**: 높음 (위기 가능성)
- **4**: 위기 (즉시 개입 필요)

**계산 로직:**
```typescript
// 위기 상황 (즉시 개입 필요)
if (riskSignals.hasSuicideRisk) level = 4;
if (riskSignals.hasSelfHarmRisk) level = 4;
if (riskSignals.hasDrugRisk) level = 4;
if (riskSignals.hasChildAbuseRisk) level = 4;
if (riskSignals.hasTerrorismRisk) level = 4;

// 민감 정보 (주의 필요)
if (riskSignals.hasSeriousMedicalInfo) level = Math.max(level, 2);
if (riskSignals.hasFinancialInfo) level = Math.max(level, 1);
```

---

## 4. 히스토리 기반 Escalation

### 4.1 히스토리 컨텍스트

**구현:** `getHistoricalRiskContext(userId, currentDiaryDate?)`

**수집 정보:**
- 최근 7일 알림 수
- 연속 일수 (일기 날짜 기준)
- 최근 위험도 목록
- 평균 AI 신뢰도
- 마지막 알림 날짜

**연속 일수 계산:**
- 일기의 실제 날짜(`diary_date`) 기준
- `diary_date`가 없으면 `actual_written_at` 사용
- 현재 일기 날짜 기준으로 역순 확인

### 4.2 Escalation 규칙

**구현:** `calculateEscalation(baseRiskLevel, historicalContext)`

**규칙:**

1. **Level 4는 항상 유지**
   - 이미 최고 위험도이므로 더 이상 상승 불가

2. **최근 7일 3건 이상 → +1**
   - 반복적인 위기 신호 감지 시 위험도 상승

3. **연속 3일 이상 → +1**
   - 지속적인 위기 상황 시 위험도 상승

4. **평균 위험도가 높고 반복 발생 → +1**
   - 평균 위험도 ≥ 3.0이고 현재 위험도 ≥ 2.0

5. **급격한 위험도 상승 → +1**
   - 이전 위험도 ≤ 1이고 현재 위험도 ≥ 3

**최종 위험도:**
- 기본 위험도 + Escalation
- 최대 4까지 상승

---

## 5. 재식별 위험 평가

### 5.1 재식별 위험 평가

**구현:** `assessReidentificationRisk(anonymizedText, detectedPatterns)`

**평가 기준:**

1. **위치 정보 다중 조합** (10점)
   - `[주소]`, `[학교]`, `[직업]` 2개 이상 조합

2. **직업 + 지역 조합** (15점)
   - 직업과 주소가 함께 나타남

3. **연령 + 직업 조합** (10점)
   - 연령대와 직업이 함께 나타남

4. **가족 구조 + 지역 조합** (15점)
   - 가족 정보와 주소가 함께 나타남

5. **특정 패턴 반복** (10점)
   - 패턴 다양성 부족

6. **장문 내용 + 특정 조합** (20점)
   - 1000자 이상 + 위험 패턴 조합

7. **시간 정보 + 위치 조합** (10점)
   - 시간대와 주소가 함께 나타남

**위험 수준:**
- **CRITICAL**: 60점 이상
- **HIGH**: 40점 이상
- **MEDIUM**: 20점 이상
- **LOW**: 20점 미만

### 5.2 익명화 전략

**재식별 위험이 높은 경우:**
- 발췌만 저장 (위험 신호 주변 컨텍스트만)
- 전문 저장하지 않음

**재식별 위험이 낮은 경우:**
- 익명화된 전문 저장
- 더 많은 컨텍스트 제공

---

## 6. CrisisAlert 생성

### 6.1 알림 데이터 구조

**주요 필드:**
```typescript
{
  user_id: string;
  diary_id: string;
  analysis_result_id: string;
  crisis_types: CrisisType[]; // SUICIDE, SELF_HARM, DRUG 등
  risk_level: number; // 0-4
  status: CrisisAlertStatus; // PENDING, CONFIRMED, FALSE_POSITIVE 등
  
  // 감지 정보
  ai_detected: boolean;
  ai_ethics_tags: string[];
  ai_confidence: number;
  keyword_detected: boolean;
  detected_patterns: string[];
  
  // 익명화된 내용
  diary_excerpt: string; // 발췌
  diary_full_anonymized: string; // 전문 또는 발췌
  
  // 재식별 위험
  reidentification_risk: ReidentificationRisk;
  reidentification_reason: string;
  
  // 히스토리 컨텍스트
  historical_context: Json;
}
```

### 6.2 일기 발췌 생성

**전략:**
- 위험 신호 위치 기준으로 앞뒤 150자 추출
- 위험 신호가 없으면 앞 200자만 추출
- 앞뒤에 더 많은 내용이 있으면 `...` 표시

**코드:**
```typescript
const firstMatchIndex = riskSignalMatches[0].index || 0;
const contextBefore = 150;
const contextAfter = 150;

const startIndex = Math.max(0, firstMatchIndex - contextBefore);
const endIndex = Math.min(filteredText.length, firstMatchIndex + contextAfter);

diaryExcerpt = filteredText.substring(startIndex, endIndex);
```

---

## 7. 운영자 검토 시스템

### 7.1 알림 상태 관리

**상태:**
- `PENDING`: 검토 대기
- `CONFIRMED`: 위기 상황 확인
- `FALSE_POSITIVE`: 오탐
- `HANDLED`: 조치 완료
- `DISMISSED`: 기각

### 7.2 관리자 행동 로깅

**구현:** `logCrisisAlertAction(input: LogActionInput)`

**로깅 항목:**
- `VIEW`: 알림 조회
- `STATUS_CHANGE`: 상태 변경
- `NOTE_ADDED`: 메모 추가
- `DECRYPT_REQUEST`: 복호화 요청
- `ESCALATION`: 위험도 상승

**로그 저장:**
- `CrisisAlertLog` 테이블
- 관리자 ID, IP, User-Agent 저장
- 감사 추적 가능

### 7.3 상태 업데이트

**구현:** `updateCrisisAlertStatus(alertId, status, reviewedBy, adminNotes?, actionTaken?)`

**업데이트 항목:**
- 상태 변경
- 검토자 정보
- 검토 시간
- 관리자 메모
- 조치 내용

---

## 8. 위기 타입

### 8.1 위기 타입 정의

**CrisisType Enum:**
- `SUICIDE`: 자살 위험
- `SELF_HARM`: 자해 위험
- `DRUG`: 약물 남용
- `CHILD_ABUSE`: 아동 학대
- `SERIOUS_MEDICAL`: 심각한 의료 상황
- `TERRORISM`: 테러/폭력 위험

### 8.2 타입별 대응

**자살/자해:**
- 즉시 개입 필요
- 전문가 상담 안내
- 위험도 4로 설정

**약물:**
- 전문가 상담 안내
- 위험도 4로 설정

**아동 학대:**
- 법적 대응 필요
- 위험도 4로 설정

**테러/폭력:**
- 즉시 대응 필요
- 법적 조치 검토
- 위험도 4로 설정

---

## 9. 비동기 처리

### 9.1 Fire-and-Forget 패턴

**구현:**
```typescript
// 일기 저장 후 비동기로 위기 감지 시작
detectCrisisAsync({
  userId,
  diaryId,
  analysisResultId,
  diaryContent,
  aiEthics,
  aiConfidence
}).catch(error => {
  console.error('위기 감지 실패:', error);
  // 에러가 발생해도 사용자 경험에는 영향 없음
});
```

**이점:**
- 사용자 응답 속도에 영향 없음
- 시스템 부하 분산
- 에러가 발생해도 주요 플로우에 영향 없음

### 9.2 에러 처리

**전략:**
- Silent Fail: 에러 발생 시 로그만 기록
- 사용자 경험 보호: 위기 감지 실패해도 일기 저장은 정상 완료
- 재시도: 필요 시 별도 작업으로 재시도

---

## 10. 구현 상세

### 10.1 주요 함수

**위기 감지:**
- `detectCrisisAsync(input)`: 메인 위기 감지 함수
- `getHistoricalRiskContext(userId, diaryDate?)`: 히스토리 컨텍스트 조회
- `calculateEscalation(baseRiskLevel, historicalContext)`: Escalation 계산
- `assessReidentificationRisk(anonymizedText, detectedPatterns)`: 재식별 위험 평가

**익명화:**
- `anonymizePersonalInfo(text)`: 개인정보 익명화
- `filterSensitiveInfo(text)`: 민감정보 필터링 및 위험 신호 감지
- `generateEthicsFromRiskSignals(riskSignals)`: Ethics 태그 생성
- `calculateRiskLevel(riskSignals)`: 위험 수준 계산

**관리:**
- `updateCrisisAlertStatus(alertId, status, reviewedBy, ...)`: 상태 업데이트
- `logCrisisAlertAction(input)`: 관리자 행동 로깅

### 10.2 데이터 구조

**CrisisAlert:**
```typescript
{
  id: string;
  user_id: string;
  diary_id: string;
  analysis_result_id: string;
  crisis_types: CrisisType[];
  risk_level: number; // 0-4
  status: CrisisAlertStatus;
  
  // 감지 정보
  ai_detected: boolean;
  keyword_detected: boolean;
  detected_patterns: string[];
  
  // 익명화된 내용
  diary_excerpt: string;
  diary_full_anonymized: string;
  
  // 재식별 위험
  reidentification_risk: ReidentificationRisk;
  reidentification_reason: string;
  
  // 히스토리
  historical_context: Json;
}
```

---

## 11. 보안 고려사항

### 11.1 프라이버시 보호

**익명화:**
- 위기 감지 시 자동 익명화
- 관리자는 원문 확인 불가
- 재식별 위험 평가 후 저장 전략 결정

**재식별 방지:**
- 위험이 높으면 발췌만 저장
- 위험이 낮으면 전문 저장
- 패턴 조합 분석으로 위험 평가

### 11.2 접근 제어

**관리자 전용:**
- CrisisAlert는 관리자만 조회 가능
- 일반 사용자는 자신의 위기 알림 확인 불가

**감사 추적:**
- 모든 관리자 행동 로깅
- IP, User-Agent 저장
- 행동 타입별 추적

---

## 12. 성능 고려사항

### 12.1 비동기 처리

**이점:**
- 사용자 응답 시간에 영향 없음
- 시스템 부하 분산
- 확장성 향상

### 12.2 쿼리 최적화

**히스토리 조회:**
- 최근 50개만 조회
- 인덱스 활용 (`user_id`, `created_at`)

**일기 조회:**
- 필요한 필드만 선택
- 관계 데이터 선택적 포함

---

## 13. 참고 자료

### 관련 코드 파일
- `app/lib/crisis-detection-service.ts`: 위기 감지 메인 로직
- `app/lib/anonymizer.ts`: 익명화 및 위험 신호 감지

### 관련 문서
- [위기 감지 시스템](../security/CRISIS_DETECTION.md)
- [익명화 가이드라인](../security/ANONYMIZATION_GUIDELINES.md)
- [프라이버시 제약사항](../security/PRIVACY_CONSTRAINTS_CRISIS.md)

---

## 14. 향후 개선 계획

### 14.1 계획된 개선사항

1. **AI 감지 정확도 향상**
   - 프롬프트 최적화
   - 후처리 로직 강화

2. **실시간 알림**
   - WebSocket을 통한 실시간 알림
   - 관리자 대시보드 실시간 업데이트

3. **자동 대응 시스템**
   - 위험도 4일 경우 자동 알림
   - 전문가 상담 자동 연결

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
