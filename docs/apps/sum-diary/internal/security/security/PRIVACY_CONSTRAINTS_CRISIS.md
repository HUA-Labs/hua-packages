# 위기 감지 시스템의 프라이버시 제약사항

> 최종 업데이트: 2025-12-16

## 핵심 원칙

**관리자는 사용자의 일기 원문을 절대 볼 수 없습니다.**

### 관리자가 볼 수 있는 정보

- **AI 생성 발췌**: 익명화된 일기 발췌 (`diary_excerpt`)
- **AI 메타데이터**: AI 분석 결과 (ethics tags, confidence, mode, tone 등)
- **감지된 패턴**: 위험 신호 패턴 (`detected_patterns`)
- **위험도 레벨**: 계산된 위험도 레벨

### 관리자가 볼 수 없는 정보

- **일기 원문**: 암호화된 원본 일기 내용
- **개인정보**: 이름, 주소, 전화번호 등
- **상세 맥락**: 원문의 전체 맥락

---

## 프라이버시 제약사항의 의미

### 1. AI 판단이 유일한 판단 근거

관리자는 원문을 직접 검증할 수 없으므로, AI가 생성한 익명화된 발췌와 메타데이터만을 기반으로 판단해야 합니다.

**영향:**
- AI의 정확도가 매우 중요
- False Positive 최소화가 필수
- AI Confidence 정보가 필수적

### 2. 히스토리 기반 판단의 중요성

단일 익명화 발췌만으로는 판단이 어렵기 때문에, 여러 일기의 패턴을 종합적으로 분석해야 합니다.

**예시:**
```
Day 1: "오늘 기분이 안 좋았어" (위험도: Level 1)
  → AI 분석: 낮은 위험도 (confidence: 0.4)
  
Day 2: "모든 게 힘들어" (위험도: Level 2)
  → AI 분석: 중간 위험도 (confidence: 0.6)
  
Day 3: "더 이상 견딜 수 없어" (위험도: Level 3)
  → 히스토리 분석: 3일 연속 위험 신호
  → 자동 Level 4 escalation
  → 관리자 알림
```

**장점:**
- 단일 일기만으로는 판단 어려움
- 3일 이상 연속 패턴 필요
- 시간 경과에 따른 위험도 추적

### 3. AI Confidence의 중요성

원문을 본 유일한 주체가 AI이므로, AI의 신뢰도 정보가 매우 중요합니다.

**예시:**
```typescript
// Low Confidence (0.4)
"오늘 날씨가 좋았어"
→ AI: "낮은 위험도 (confidence: 0.4)"
→ 관리자: 관찰, 추가 정보 대기

// High Confidence (0.9)
"자살하고 싶어"
→ AI: "높은 위험도 (confidence: 0.9)"
→ 관리자: 즉시 조치

// 낮은 위험도 + Low Confidence
Low Confidence 위험 신호
→ "관찰" 상태로 분류
→ 추가 일기 대기
```

### 4. False Positive 최소화의 필수성

관리자가 원문을 확인할 수 없으므로, AI의 오판에 의존적입니다. 따라서 False Positive를 최소화하는 것이 매우 중요합니다.

**False Positive 예시:**
```
원문: "오늘 영화를 봤는데 정말 재미있었어"
→ 키워드: "정말" (오탐)
→ AI 분석: Level 3 (오탐)
→ 관리자: "관찰" 상태로 분류
```

**개선 방안:**
- 키워드 필터링 강화
- Confidence 기반 필터링
- 히스토리 + Confidence 조합: "관찰" 상태로 분류

---

## 익명화 프로세스 (구현)

### 1. 익명화 컨텍스트

**인터페이스:**
```typescript
interface CrisisAlertContext {
  // 현재 일기 (익명화됨)
  diaryExcerpt: string;
  aiConfidence: number;
  detectedPatterns: string[];
  
  // 히스토리 컨텍스트 (익명화됨)
  recentAlertsCount: number; // 최근 7일 알림 수
  consecutiveDays: number;   // 연속 일수
  riskLevelTrend: number[];  // 위험도 추이 [1, 2, 3, ...]
  avgConfidence: number;      // 평균 신뢰도
  
  // 패턴 분석
  hasEscalatedRisk: boolean;  // 위험도 상승 여부
  similarPatternsCount: number; // 유사 패턴 수
}
```

### 2. 자동 Escalation

**프로세스:**
- 히스토리 기반 자동 escalation
- 관리자 개입 최소화
- 익명화된 정보만 사용

### 3. AI Confidence 기반 필터링

**규칙:**
- Low Confidence + 낮은 위험도 → 관찰
- High Confidence + 높은 위험도 → 즉시 조치
- Low Confidence + 높은 위험도 → 추가 확인
- High Confidence + 낮은 위험도 → 관찰

---

## 관리자 UI 제약사항

### CrisisAlert 데이터 구조
```typescript
{
  // 익명화된 정보
  diary_excerpt: string,  // 최대 500자, 익명화됨
  detected_patterns: string[], // 감지된 패턴
  ai_ethics_tags: string[], // AI 생성 태그
  ai_confidence: number, // AI 신뢰도
  
  // 히스토리 컨텍스트 (익명화됨)
  historical_context?: {
    recentAlertsCount: number,
    consecutiveDays: number,
    avgRiskLevel: number,
  }
}
```

### 관리자 UI 표시 정보
```
표시되는 정보:
- 익명화된 발췌
- AI 메타데이터 (위험도, confidence)
- 감지된 패턴
- 히스토리 컨텍스트 (연속 일수, 평균 위험도)
- AI 분석 태그 (mode, tone, tier)

표시되지 않는 정보:
- 일기 원문
- 개인정보
- 상세 맥락
```

---

## 향후 개선 사항

**현재 구현:**
1. **익명화 필터링**
   - 개인정보 자동 익명화
   - 키워드 기반 필터링

2. **AI Confidence 강화**
   - 신뢰도 기반 필터링
   - Confidence 임계값 조정

3. **히스토리 분석**
   - 연속 일수 추적
   - 위험도 추이 분석
   - 패턴 유사도 계산

4. **False Positive 최소화**
   - 키워드 필터링 강화
   - Confidence 기반 필터링
   - 히스토리 + Confidence 조합

**개선 방향:**
- 익명화 → 재식별 위험 평가 (구현 예정)
- AI Confidence 강화 → 신뢰도 임계값 조정 (구현 예정)
- 히스토리 분석 → 패턴 유사도 계산 (구현 예정)

---

**최종 업데이트**: 2025-11-07
