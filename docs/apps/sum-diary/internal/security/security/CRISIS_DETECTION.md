# 위기 감지 시스템 문서

> 최종 업데이트: 2025-12-16

## 개요

숨다이어리의 위기 감지 시스템은 사용자의 일기에서 자살, 자해, 약물 오남용 등 위험 신호를 감지하여 적절한 조치를 취할 수 있도록 합니다.

## 핵심 정책

### 프라이버시 제약사항

- 관리자는 유저의 일기 **원문을 볼 수 없음**
- AI가 생성한 **익명화된 발췌(`diary_excerpt`)만 확인 가능**
- 모든 개인정보는 `filterSensitiveInfo()`로 익명화됨

**이것이 의미하는 바:**
1. **AI의 판단이 유일한 판단 근거** - 관리자는 원문을 직접 검증할 수 없음
2. **히스토리 기반 판단이 더욱 중요** - 단일 익명화 발췌만으로는 판단 어려움, 여러 일기 패턴 필요
3. **AI Confidence가 중요** - 원문을 본 유일한 주체이므로 신뢰도 정보 필수
4. **False Positive 최소화가 필수** - 관리자가 원문 확인 불가하므로 AI 오판에 의존적

## 위기 감지 시스템 구조

### 3단계 안전망

1. **AI 감지**: GPT-5-mini/Gemini가 위험 신호 감지
2. **키워드 Fail-Safe**: AI 감지 실패 시 보완하는 추가 안전장치 (자살, 자해, 약물 등)
3. **운영자 최종 판단**: 관리자 대시보드에서 검토

### 위기 타입

- `SUICIDE`: 자살 위험
- `SELF_HARM`: 자해 위험
- `DRUG`: 약물 남용
- `CHILD_ABUSE`: 아동 학대
- `SERIOUS_MEDICAL`: 심각한 의료 정보
- `TERRORISM`: 테러/폭력 위험

### 위험도 레벨

- 0: 없음
- 1: 낮음
- 2: 중간
- 3: 높음
- 4: 위기 (즉시 개입 필요)

### Escalation 시스템

히스토리 기반 위험도 상승:
- 최근 7일 3건 이상 → +1
- 연속 3일 이상 → +1
- 평균 위험도 높고 반복 발생 → +1

## 구현 우선순위

### Phase 1: 최우선 구현 (HIGH ROI)

#### 1. 히스토리 기반 누적 Risk Level

**왜 가장 중요한가?**
- 단편적 판단 → 누적 징후 감지로 정확도 급상승
- 정신건강 분야 핵심 요구사항 충족
- False positive 자동 감소 효과
- **프라이버시 제약 하에서 필수** - 관리자는 원문 못 보므로 패턴 분석 필수

**구현 방식:**
- 건당 카운팅 + 누적 Escalation
- AI 요청에 히스토리 전달 불필요 (비용 절감)
- 시스템 레벨에서 빠르게 판단
- DB에서 최근 7일 CrisisAlert 조회
- 누적 기준 체크 (연속 3일, 누적 3회, Level 3가 2회 이상)

**핵심 로직:**
```typescript
- 일기 분석 (독립적, 히스토리 불필요)
- DB에서 최근 7일 CrisisAlert 조회
- 연속 일수 계산 (3일 이상 → 자동 +1 레벨)
- 누적 횟수 계산 (3회 이상 → 자동 +1 레벨)
- Level 3가 2회 이상 → 즉시 Level 4
- 기본 risk level + 히스토리 보정 = 최종 레벨
```

#### 2. 자동 Escalation 및 알림

**왜 중요한가?**
- "감지했는데 아무도 몰랐다" 최악 시나리오 방지
- 생명 위협 대응의 핵심 (Level 4 즉시 알림)
- 히스토리와 연동 시 폭발적 시너지

**핵심 로직:**
```typescript
- Level 4: 즉시 알림 (푸시, 이메일, SMS)
- Level 3: 누적 2회 이상 시 알림
- Level 2: 주간 리포트 (크론 작업)
- SLA 기반 자동 escalation
```

#### 3. CrisisAlertLog 테이블

**왜 중요한가?**
- 책임 추적 (IRB/기관 협업 필수)
- Audit 가능 → 내부 리스크 방지
- "누가? 언제? 왜?" 기록 필요

**핵심 구조:**
```prisma
- 모든 관리자 행동 로깅 (viewed, updated, escalated)
- 접근 이력 완전 추적
- 이유 및 상태 변경 기록
```

### Phase 2: 데이터 축적 후 (MEDIUM)

#### 4. AI Confidence 가중치 계산
- 히스토리/알림 기반 평가 다음 단계
- 정밀화 작업 (2차 보조)

#### 5. False Positive 학습 메커니즘
- 운영자 피로 생기기 시작할 때
- 장기적 지속 가능성 필수

### Phase 3: 성숙기 (LOW)

#### 6. 키워드 패턴 확장성
- NLP 엔진 수준 필요
- 문제 생기기 시작하면 검토

#### 7. 법적 대응 메타데이터
- 기관/보건 협업 준비할 때
- 신고 프로세스 필요할 때

## 데이터 구조

### CrisisAlert

```prisma
model CrisisAlert {
  id                 String  @id @default(uuid()) @db.Uuid
  user_id            String  @db.Uuid
  diary_id           String? @db.Uuid
  analysis_result_id String? @db.Uuid

  // 위기 감지 정보
  crisis_types CrisisType[] // 감지된 위기 타입 (복수 가능)
  risk_level   Int               @default(0) // 0-4
  status       CrisisAlertStatus @default(PENDING)

  // AI 감지 결과
  ai_detected    Boolean  @default(false)
  ai_ethics_tags String[] // AI가 생성한 ethics 태그
  ai_confidence  Float? // AI 감지 신뢰도

  // 키워드 감지 결과
  keyword_detected  Boolean  @default(false)
  detected_patterns String[] // 감지된 패턴 목록

  // 익명화된 일기 내용
  diary_excerpt         String? @db.Text // 위험 신호 포함 부분 (익명화)
  diary_full_anonymized String? @db.Text // 익명화된 전체 일기

  // 재식별 위험 평가
  reidentification_risk   String? // LOW, MEDIUM, HIGH, CRITICAL
  reidentification_reason String? @db.Text

  // 히스토리 컨텍스트
  historical_context Json? // 누적 위험도, 평균 신뢰도, escalation 정보

  // 운영자 검토
  reviewed_by  String?   @db.Uuid
  reviewed_at  DateTime? @db.Timestamptz(6)
  admin_notes  String?   @db.Text
  action_taken String?

  created_at DateTime @default(now()) @db.Timestamptz(6)
  updated_at DateTime @updatedAt @db.Timestamptz(6)
}
```

### CrisisAlertLog

```prisma
model CrisisAlertLog {
  id              String   @id @default(uuid()) @db.Uuid
  crisis_alert_id String   @db.Uuid
  admin_id        String   @db.Uuid // 행동을 취한 관리자 ID
  action_type     String // VIEW, STATUS_CHANGE, NOTE_ADDED, ESCALATION 등
  action_details  Json? // 행동 상세 정보
  ip_address      String? // 관리자 IP
  user_agent      String? // 관리자 User-Agent
  created_at      DateTime @default(now()) @db.Timestamptz(6)
}
```

## 익명화 가이드라인

### 개인 식별 정보 완전 제거
- 이름 → [익명]
- 전화번호 → [전화번호]
- 이메일 → [이메일]
- 주소 → [주소]

### 재식별 위험 요소 검사
- 단어 조합 (특정 표현 패턴)
- 행동 패턴 (특정 일과, 직업 특성)
- 위치 정보 (동네, 학교, 회사 특정)

### 위험 평가 기준
- 낮음: 일반적인 일기 내용, 특정 불가
- 중간: 부분적 특정 가능하지만 불확실
- 높음: 특정 가능성 높음 → 추가 익명화 또는 전문 저장 제한

## 관리자 대시보드 UX

### 우선순위 정렬
- Level 4 (escalated) → Level 4 → Level 3 (escalated) → Level 3 → ...
- 최신순 내림차순

### 히스토리 정보 표시
- "참고용 정보 (최종 판단은 운영자 주관)" 라벨
- 평균 신뢰도, 위험도 추이 등을 보조 정보로 표시
- 강조하지 않음

### "지금 확인 필요" 필터
- Level 4 모든 항목
- Escalated Level 3
- 24시간 이내 생성

## 성공 지표

### Phase 1 목표
- 위험 탐지 정확도: +30-50%
- 위기 대응 시간: -80%
- False Positive 비율: -40%
- 관리자 로그 커버리지: 100%

### Phase 2 목표
- AI Confidence 활용도: 100%
- FP 학습 정확도: +20%
- 운영자 피로도: -30%

### Phase 3 목표
- 키워드 커버리지: +15%
- 법적 대응 준비도: 100%

## 참고 문서

- [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터베이스 스키마
- [ANONYMIZATION_GUIDELINES.md](./ANONYMIZATION_GUIDELINES.md) - 익명화 가이드라인
- [PRIVACY_CONSTRAINTS_CRISIS.md](./PRIVACY_CONSTRAINTS_CRISIS.md) - 프라이버시 제약사항

---

**최종 업데이트**: 2025-11-07

