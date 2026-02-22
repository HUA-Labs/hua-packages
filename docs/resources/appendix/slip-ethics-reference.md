# HUA 감정 분석 시스템 — 논문용 기술 레퍼런스 (Part 2: Slip, Ethics, Z축, DB)

> 작성일: 2026-02-02
> Part 1: [emotion-vector-3d-reference.md](./emotion-vector-3d-reference.md) (아키텍처, 파라미터 사전)

---

## 1. Slip 시스템 상세

### 1.1 개요

Slip은 `tier_a`(감정 강도) × `tier_m`(서사 동력) 기반으로 사용자의 **심리적 위험 상태**를 판단하는 다단계 안전 시스템. 단일 일기 분석 + 7일 히스토리 에스컬레이션.

```
Slip = f(tier_a, tier_m) → ethics 보정 → AI 맥락 분석 → 히스토리 에스컬레이션
```

### 1.2 Slip 레벨

| 레벨 | 의미 | 시스템 대응 | DB |
|---|---|---|---|
| `none` | 정상 범위 | 표준 분석 응답 | `SlipLevel.none` |
| `soft` | 경고 — 주의 필요 | 관찰 모드, 어드민 표시 | `SlipLevel.soft` |
| `hard` | 위험 — 즉시 대응 | 위기 알림, 관리자 통보 | `SlipLevel.hard` |

타입: `hua-types.ts:29-32`, DB enum: `schema.prisma:60-63`

### 1.3 Stage 1: 규칙 기반 판정

**파일**: `slip-calculator-pure.ts:45-115`

순수 함수. 서버/클라이언트 양쪽 호환.

**입력**:
```typescript
export interface SlipCalculationInput {
  tier_a: number;        // 감정 강도 0.0-5.0
  tier_m: number;        // 서사 동력 0.0-5.0
  ethics: string[];      // 윤리 태그
  content?: string;      // 일기 내용 (Stage 3용)
  emotion_flow?: string[];
}
```

**출력**:
```typescript
export interface SlipCalculationResult {
  slip: 'none' | 'soft' | 'hard';
  reason: string;              // 판단 이유
  risk_factors: string[];      // 위험 요소
  suspected_pattern: string | null;  // 의심 패턴 (Stage 3 트리거)
  ai_analyzed?: boolean;
}
```

**판정 규칙 (우선순위 순)**:

| # | 조건 | Slip | 의심 패턴 | 근거 |
|---|---|---|---|---|
| 1 | tier_a <= 1.0 AND tier_m <= 1.0 | **hard** | `depression` | 감정적 무기력 + 활동 저하 = 극단적 저조 |
| 2 | tier_a >= 4.5 AND tier_m >= 4.5 | **soft** | `hypomania` | 극단적 고조 (AI 확인 필요) |
| 3 | tier_m >= 4.0 AND tier_a <= 2.0 | **soft** | `over-immersion` | 활동↑ 감정↓ = 해리적 과몰입 |
| 4 | tier_a <= 2.0 AND tier_m <= 2.0 (a>1) | **soft** | `mild-depression` | 전반적 저조 |
| 5 | tier_a <= 2.0 OR tier_m <= 2.0 | **soft** | — | 부분적 저조 |
| 6 | 그 외 | **none** | — | 정상 |

**설계 의도**:
- 규칙 2를 hard가 아닌 **soft**로 설정한 이유: 고에너지가 반드시 위험하지 않을 수 있음(creative flow). Stage 3 AI 분석에서 `healthy-flow`로 판정되면 none으로 해제됨.
- 규칙 3: 감정 없이 과활동하는 해리적 패턴. 번아웃 전조.

### 1.4 Stage 2: 윤리 태그 보정

**파일**: `slip-calculator-pure.ts:120-169`

Stage 1 결과를 ethics 태그로 **상향만** 조정. 하향 없음 (안전 우선).

| 분류 | 태그 | 효과 | 비고 |
|---|---|---|---|
| **위기** | `crisis_suicide` | → 즉시 **hard** | 자살 위기 |
| **위기** | `crisis_self_harm` | → 즉시 **hard** | 자해 위기 |
| **위기** | `crisis_drug` | → 즉시 **hard** | 약물 위기 |
| **위기** | `crisis_child_abuse` | → 즉시 **hard** | 아동학대 |
| **위기** | `crisis_terrorism` | → 즉시 **hard** | 테러 위협 |
| **위기** | `hard_slip_required` | → 즉시 **hard** | 시스템 강제 |
| **위험** | `self-harm` | → **hard** | 자해 언급 |
| **위험** | `suicide` | → **hard** | 자살 언급 |
| **위험** | `violence` | → **hard** | 폭력성 |
| **위험** | `substance-abuse` | → **hard** | 약물 남용 |
| **주의** | `isolation` | none → **soft** | 고립 패턴 |
| **주의** | `hopelessness` | none → **soft** | 절망감 |
| **주의** | `anger` | none → **soft** | 분노 |
| **주의** | `anxiety` | none → **soft** | 불안 |

로직:
```
위기 태그 → 무조건 hard
위험 태그 → hard
주의 태그 + 현재 none → soft
그 외 → 변경 없음
```

### 1.5 Stage 3: AI 맥락 분석

**파일**: `slip-calculator.ts:38-119`

`suspected_pattern` 있고 `content` 있을 때만 실행. GPT-4o-mini로 일기 원문 분석.

**AI 프롬프트 핵심**:
```
You are analyzing a diary entry for mental health patterns.
Context: tier_a, tier_m, ethics, suspected_pattern, risk_factors
Task: Analyze whether this is:
  1. hypomania — impulsivity, reduced sleep, grandiosity, risky behavior
  2. healthy-flow — normal creative/productive high-energy
  3. depression — low motivation + emotional distress
  4. over-immersion — dissociative over-work without emotional engagement
  5. normal — no concerning pattern

System instruction: "Be careful not to over-pathologize normal high-energy states."
```

**판별 결과**:
| 패턴 | Slip 변경 | 설명 |
|---|---|---|
| `hypomania` | 유지 (soft+) | 문제적 기분 고양 — 충동성, 수면 감소, 과대망상 |
| `healthy-flow` | → **none 해제** | 정상 고에너지. 핵심: 고에너지를 병리화하지 않음 |
| `depression` | 유지 (soft+) | 낮은 동기 + 감정적 고통 |
| `over-immersion` | 유지 (soft) | 감정 없는 과활동 |
| `normal` | → **none 해제** | 정상 |

**AI 응답 형식**:
```json
{
  "pattern": "hypomania|healthy-flow|depression|over-immersion|normal",
  "confidence": 0.85,
  "slip_level": "none|soft|hard",
  "reasoning": "한국어 설명",
  "key_indicators": ["indicator1", "indicator2"]
}
```

### 1.6 Stage 4: 히스토리 에스컬레이션

**파일**: `slip-calculator.ts:312-371`

최근 **7일** Slip 히스토리 기반 지속적 패턴 감지.

**히스토리 컨텍스트** (`slip-calculator.ts:147-164`):
```typescript
export interface HistoricalSlipContext {
  recentSlips: Array<{ date: Date; slip: SlipLevel; pattern: string | null }>;
  consecutiveDays: number;    // 연속 soft/hard 일수
  softDays: number;           // 7일 중 soft 일수
  hardDays: number;           // 7일 중 hard 일수
  patternSwitch: boolean;     // 경조증 ↔ 우울 전환
  lastSlipDate: Date | null;
}
```

**히스토리 조회** (`getHistoricalSlipContext`, L169-291):
- Prisma로 최근 7일 AnalysisResult.slip 조회
- 날짜별 그룹핑 (하루 여러 분석 → 가장 심각한 것 선택)
- 연속 일수: 현재 날짜부터 역순 계산

**에스컬레이션 규칙**:
| # | 조건 | 결과 | 근거 |
|---|---|---|---|
| 1 | 연속 3일+ soft/hard AND 현재 != none | → **hard** | 지속적 위험 |
| 2 | 7일 중 5일+ slip AND 현재 soft | soft → **hard** | 빈번한 위험 |
| 3 | 패턴 급전환 (경조증 ↔ 우울) AND 현재 != none | → **hard** | 양극성 의심 |
| 4 | 현재 none이지만 최근 hard 2회+ | → **soft** | 주의 유지 |

**에스컬레이션 결과**:
```typescript
export interface SlipEscalationResult {
  finalSlip: 'none' | 'soft' | 'hard';
  escalated: boolean;
  reason: string;           // "히스토리 기반: 연속 3일 slip"
  baseSlip: string;         // 원래 slip
  historySummary: string;   // "최근 7일: soft 3일, hard 1일, 연속 2일"
}
```

### 1.7 전체 Slip 플로우

```
[1차 분석 완료: tier_a, tier_m, ethics, content]
    │
    ▼
[Stage 1] calculateSlip(tier_a, tier_m)
    │   규칙 기반 → slip + suspected_pattern
    │   예: (4.5, 4.5) → soft, "hypomania"
    ▼
[Stage 2] adjustSlipByEthics(baseSlip, ethics)
    │   태그로 상향 보정
    │   예: "crisis_suicide" → hard (무조건)
    ▼
[Stage 3] analyzeSlipWithAI(input, adjustedSlip)  ← 의심 패턴 있을 때만
    │   GPT-4o-mini 일기 원문 분석
    │   예: hypomania 의심 → "healthy-flow" → none 해제
    ▼
[Stage 4] calculateSlipEscalation(finalSlip, history)
    │   7일 히스토리 에스컬레이션
    │   예: 연속 3일 soft → hard
    ▼
[최종 Slip] → DB (AnalysisResult.slip)
             → 위기 알림 (hard)
```

### 1.8 위기 감지 이중 안전장치

**파일**: `api/diary/analyze/stream/route.ts:1573-1583`

Slip 판정과 별개로, 키워드 + ethics 태그로 위기를 이중 감지:

```typescript
const isCrisisDetected = keywordRiskLevel >= 4 ||
  combinedEthics.some(e => e === 'hard_slip_required' || e.startsWith('crisis_'));

if (isCrisisDetected) {
  slipResult.slip = 'hard';  // 강제 hard
}
```

### 1.9 Closer 모드 Safety Fallback

**파일**: `prompts/ko.ts:146-154`

Closer 모드(밀착 공감) 중 Ethics Slip 감지 시 자동으로 Distanced 모드(관찰자)로 전환:

```yaml
safety:
  prohibit:
    - enabling language ("그럴 수밖에 없었어")
    - 전문 상담 대체 ("이건 ~증상이야")
    - 무조건적 동의 ("네가 맞아")
  fallback: "If ethics slip detected, revert to distanced voice_style"
```

### 1.10 Crisis Tag 교차 검증 가드레일 (2026-02-02 추가)

#### 배경: "철학대로" 오탐 사건

sentiment 85, dominant_emotion "행복", 감정 흐름 "설렘→행복→직진애정→뿌듯함"인 일기가 `crisis_child_abuse` + `hard_slip_required`로 오분류된 사건.

**원인 체인**:
```
"철학대로" → substring "학대" 매칭 (키워드 탐지)
    → AI가 키워드 감지 결과를 참조하여 crisis_child_abuse 태그 생성
    → Stage 2에서 crisis 태그 → 즉시 hard-slip
    → 결과: 행복한 일기에 Level 4 아동학대 알림
```

**수정 후 동일 일기 재분석**:
```
키워드 오탐 방지 → "철학대로"에서 "학대" 매칭 안 됨
    → AI도 crisis 태그 미생성
    → Slip: none (Stage 3에서 healthy-flow 판정)
    → 결과: 정상 분석 (ethics: connection, tenderness, growth, reflection, affectionate-boldness)
```

#### 가드레일 구조 (2중)

**1단: 프롬프트 레벨** (`core.ts` crisis_tags 섹션)

crisis 태그 달기 전 4단계 교차 검증 필수:
1. sentiment < 30 (distressed state)이어야 함
2. emotion_flow에 distress/fear/pain 패턴이어야 함 (joy/warmth/connection 아님)
3. 감지된 행동이 literal이어야 함 (비유, 인용, 뉴스 언급 제외)
4. 의심 키워드를 제거해도 맥락이 여전히 위험해야 함

한국어 오탐 사례:
- "철학대로" → "학대" (복합어 substring)
- "피곤해서 죽겠다" → "죽겠다" (구어체 과장)
- 뉴스 기사 인용 → 경험이 아닌 보도

**2단: 코드 레벨 safety net** (`ai-response-types.ts`)

AI가 프롬프트 규칙을 무시하더라도 코드에서 최종 필터링:
```typescript
// crisis 태그가 있을 때 다른 지표와 모순 검사
const isPositiveDominant = positiveCount > negativeCount && positiveCount >= 2;
const isNonCrisisTone = ['warm', 'cheerful', 'quirky'].includes(tone);

if (isPositiveDominant && isNonCrisisTone) {
  // crisis 태그 제거 + 로그
}
```

조건: 긍정 태그(growth, reflection, connection, stability, resilience, tenderness) 2개 이상이 부정 태그보다 많고, tone이 warm/cheerful/quirky면 → crisis 태그 자동 제거.

#### 논문 활용

이 사건은 다음을 실증:
1. **키워드 기반 탐지의 한국어 특수성**: 교착어(agglutinative language)에서 substring 매칭의 구조적 한계
2. **키워드→AI 연쇄 오탐(cascading false positive)**: 키워드 탐지 결과가 AI 판단을 오염시키는 현상
3. **교차 검증의 필요성**: 단일 지표(키워드)가 아닌 다중 지표(sentiment, emotion_flow, ethics 구성, tone) 교차 검증으로 false positive 제거

### 1.11 고밀도 유저와 Hypomania 구분

#### 문제

감정 표현이 풍부한(고밀도) 유저는 tier_a, tier_m이 습관적으로 높게 나옴. 이 경우 Stage 1에서 매번 hypomania `suspected_pattern`으로 잡히고 Stage 3 AI가 해제하는 비효율 발생.

#### 구분 지표

동일한 (tier_a=4.5, tier_m=4.5)에서 hypomania vs healthy flow를 구분하는 보조 지표:

| 지표 | Healthy Flow (고밀도 유저) | Hypomania |
|------|--------------------------|-----------|
| **entropy** | 0.75-0.85 (다층적 감정) | 0.2-0.4 (단일 고양) |
| **emotion_flow** | 4-5단계, 다양한 전환 | 1-2단계, 단조로운 고양 |
| **transitions** | 4-5회 (활발한 전환) | 0-1회 (고정 상태) |
| **ethics 구성** | 긍정 다수 (connection, tenderness) | overwhelm, grandiosity 경향 |
| **Z축 (approach)** | 0.6-0.8 (건강한 접근) | 0.9+ (과도한 접근) 또는 불안정 |
| **tone** | warm, delicate | — (극단적 cheerful 또는 부조화) |

#### 실제 사례

```
유저 #203a2c1c — 2건 비교 (동일인, tier_a=4.5, tier_m=4.5)

12/07 일기:
  entropy: 0.80, transitions: 5, flow: 당황→짜증→유쾌→서운함→안도
  ethics: connection, tenderness, vulnerability, self-expression, empathy
  → Stage 3: healthy-flow → Slip: none

12/25 일기 (수정 후):
  entropy: 0.75, transitions: 4, flow: 설렘→행복→직진애정→뿌듯함
  ethics: connection, tenderness, growth, reflection, affectionate-boldness
  → Stage 3: healthy-flow → Slip: none
```

두 일기 모두 entropy > 0.7, transitions >= 4, ethics에 긍정 태그 다수 → 전형적 고밀도 유저 패턴.

#### 향후 과제

- 유저별 baseline tier 보정 (평소 tier 평균 대비 이탈 감지)
- Stage 1에서 entropy/transitions 보조 지표 활용하여 불필요한 Stage 3 호출 감소

---

## 2. Ethics 태그 시스템 상세

### 2.1 구조 개요

1차 분석 시 AI가 3-5개 윤리/심리 태그 부여. **라벨이 아닌 신호(signals, not labels)**.

선택 규칙 (`core.ts:127-131`):
- 총 3-5개
- 정의 태그에서 선택 + AI 생성 1-2개
- **구체적 텍스트 근거 필수**

### 2.2 Positive 태그 (긍정적 신호)

**파일**: `core.ts:133-139`

| 태그 | 정의 | 설명 | 예시 |
|---|---|---|---|
| `growth` | learning/progress/forward movement | 학습, 진전, 전진 | "새로운 걸 배웠다" |
| `reflection` | self-awareness/introspection | 자기인식, 내성 | "왜 그랬는지 생각해봤다" |
| `connection` | relationships/emotional bonds | 관계, 감정적 유대 | "친구를 만나서 좋았다" |
| `stability` | groundedness/secure footing | 안정감, 확고한 기반 | "루틴이 잡혔다" |
| `resilience` | endurance/recovery capacity | 인내, 회복력 | "힘들었지만 버텼다" |
| `tenderness` | emotional softness/gentle sensitivity | 부드러움, 섬세한 민감성 | "작은 것에 감동" |

### 2.3 Negative 태그 (주의 신호)

**파일**: `core.ts:141-147`

| 태그 | 정의 | 설명 | 예시 |
|---|---|---|---|
| `loneliness` | isolation/disconnection | 고립감, 단절감 | "아무도 없는 느낌" |
| `anxiety` | worry/unease/nervous tension | 걱정, 불안, 긴장 | "자꾸 걱정이 된다" |
| `conflict` | internal/external friction | 내적/외적 마찰 | "싸웠다", "마음이 갈린다" |
| `exhaustion` | depletion of energy/motivation | 에너지/동기 고갈 | "너무 지쳤다" |
| `uncertainty` | doubt/unclear direction | 의심, 방향 불분명 | "모르겠다" |
| `overwhelm` | too much to process | 처리 과부하 | "감당이 안 된다" |

### 2.4 Custom 태그 (AI 생성)

**파일**: `core.ts:149-153`

- 1-2개 필수 생성
- 영어만 (`'self-care'` not `'자기돌봄'`)
- 한 단어 또는 하이픈 연결
- 해당 일기 고유 뉘앙스 포착, 모호한 태그 금지
- 예: `self-care`, `micro-joy`, `quiet-grief`, `boundary-setting`, `creative-spark`

### 2.5 EthicsLabel 타입 (시스템 레벨)

**파일**: `hua-types.ts:35-41`

프롬프트 태그와 별도로 시스템이 정의한 윤리적 경계:

```typescript
export type EthicsLabel =
  | "self_harm"       // 자해 위험
  | "violence"        // 폭력성
  | "discrimination"  // 차별
  | "privacy"         // 프라이버시 침해
  | "manipulation"    // 조작
  | "inappropriate";  // 부적절
```

### 2.6 EthicsThreshold (임계값)

**파일**: `hua-config.ts:8-15`

```typescript
export const DEFAULT_ETHICS_THRESHOLD: EthicsThreshold = {
  self_harm: 0.7,       // 자해 — 높은 임계값 (신중한 판단)
  violence: 0.6,        // 폭력성
  discrimination: 0.5,  // 차별 — 중간
  privacy: 0.4,         // 프라이버시 — 낮은 임계값 (민감하게)
  manipulation: 0.5,    // 조작
  inappropriate: 0.6    // 부적절함
};
```

`AiPolicyVersion`/`AiPolicyActive`/`AiPolicyOverride` 테이블로 런타임 변경 가능.

### 2.7 탈옥 감지 (Jailbreak Detection)

**파일**: `ai-response-types.ts:140-154`, `jailbreak-messages.ts`

Ethics 태그에 `jailbreak_attempt`/`prompt_injection` 포함 시:
- 우선순위 태그로 처리 (위기 > 탈옥 > 의료 > 일반)
- 최대 10개 제한 시 탈옥 태그 우선 유지
- 탈옥 감지 메시지 사용자 표시

```typescript
const priorityTags = ethicsArray.filter(tag =>
  tag.startsWith('crisis_') ||
  tag === 'jailbreak_attempt' ||
  tag === 'prompt_injection' ||
  tag === 'medical_sensitive'
);
```

---

## 3. Z축(접근-회피) 2-Phase 산출 상세

### 3.1 Phase 1: 텍스트 근거 추출 (1차 분석)

**프롬프트**: `core.ts:88-91`
```yaml
motivation_cues:
  description: "Textual evidence of approach vs avoidance motivation"
  format: "approach: phrase1, phrase2 | avoidance: phrase1, phrase2"
  note: "Extract 1-3 phrases per direction from actual diary text"
```

**METADATA 출력**: `core.ts:189`
```
motivation_cues: approach: 새로운 프로젝트 시작, 내일 면접 준비 | avoidance: 그냥 참자, 모르겠다
```

**파싱**: `parsers.ts:101-112`
```typescript
const parts = valueTrimmed.split('|').map(p => p.trim());
const cues = { approach: [], avoidance: [] };
// "approach:" → cues.approach, "avoidance:" → cues.avoidance
```

저장: `AnalysisResult.motivation_cues` (JSONB)

### 3.2 Phase 2: 정량 수치 산출 (2차 분석)

**프롬프트**: `hua-ai-prompt.ts:39-44`
```
approach_avoidance: Motivational direction (0.000-1.000)
  0.0 = strong avoidance (escape, withdraw)
  0.5 = neutral / ambivalent
  1.0 = strong approach (engage, pursue)
  Based on: action-oriented language, goal references, withdrawal cues
  Also use motivation_cues from primary analysis if provided
```

**1차 → 2차 전달**: `stream/route.ts:2012-2016`
```typescript
const motivationCues = finalMetadata.motivation_cues || undefined;
const huaAIResult = await analyzeWithHUAAI({
  content: anonymizedContent,
  aiEmotionFlow, aiMetadata, userId,
  motivationCues,  // Phase 1 → Phase 2
});
```

**검증**: `hua-ai-service.ts:460-468`
```typescript
if (typeof data.approach_avoidance === 'number') {
  if (data.approach_avoidance < 0 || data.approach_avoidance > 1) return false;
}
```

**정규화**: `hua-ai-service.ts:418-420` (문자열 → 숫자 변환)

저장: `HuaEmotionAnalysis.approach_avoidance` (Float, nullable)

### 3.3 학술적 의의

```
Phase 1 (정성): "왜 접근/회피인가" — 텍스트 근거 (해석 가능)
Phase 2 (정량): "얼마나 접근/회피인가" — 0~1 수치 (통계 가능)
```

Evidence-Based Quantification: 단순히 "0~1 줘"가 아니라, 텍스트 근거 추출 → 근거 기반 수치 산출. 해석가능성(interpretability) 보장.

---

## 4. Slip × Z축 교차 분석

### 4.1 핵심 관계

- **tier_m**: 에너지의 크기 (direction-agnostic)
- **Slip**: 이 에너지 수준이 위험한가? (강도 판단)
- **Z축**: 이 에너지가 어디로 향하는가? (방향 판단)

### 4.2 교차 해석 매트릭스

| tier_a | tier_m | Slip | Z축 | 해석 |
|---|---|---|---|---|
| 4.5 | 4.5 | soft (hypomania?) | **0.9** | 고에너지 + 접근 → 창작적 몰입. AI가 healthy-flow로 해제 가능 |
| 4.5 | 4.5 | soft (hypomania?) | **0.2** | 고에너지 + 회피 → 도피적 과몰입. hypomania 가능성↑ |
| 1.5 | 1.5 | soft (mild-depression) | **0.8** | 저에너지 + 접근 의지 → 회복 가능성 |
| 1.5 | 1.5 | soft (mild-depression) | **0.1** | 저에너지 + 회피 → 고립/악화 위험 |
| 4.0 | 1.5 | soft (부분 저조) | **0.6** | 감정↑ 행동↓ → 감정적 반추(rumination) |
| 1.5 | 4.0 | soft (over-immersion) | **0.3** | 감정 없이 일만 함 + 회피 → 번아웃 전조 |
| 3.0 | 3.0 | none | **0.5** | 정상 + 중립 → 균형 |
| 3.0 | 3.0 | none | **0.9** | 정상 + 접근 → 목표 지향적 |
| 3.0 | 3.0 | none | **0.1** | 정상이지만 회피 경향 → 동기 저하 추적 필요 |

### 4.3 시계열 활용

Slip × Z축 시계열 조합:
- **Slip soft + Z축 하락 추세**: 위험↑ + 회피 심화 → 에스컬레이션 위험
- **Slip soft + Z축 상승 추세**: 위험 있지만 접근 회복 → 자연 회복 가능
- **Slip none + Z축 지속 하락**: Slip 정상이지만 동기 악화 → 선제적 주의

---

## 5. 어드민 모니터링

### 5.1 Slip Analytics API

**파일**: `api/admin/slip-analytics/route.ts`
**엔드포인트**: `GET /api/admin/slip-analytics?period=7d|30d|90d`

| 데이터 | 설명 |
|---|---|
| `distribution` | none/soft/hard 건수 + 비율 |
| `dailyTrend` | 일별 none/soft/hard 건수 |
| `tierCorrelation` | tier_a × tier_m × slip 상관관계 (0.5 단위) |
| `patternFrequency` | 패턴 빈도 (hypomania, depression, over-immersion 등) |
| `escalationStats` | 에스컬레이션 건수, 비율, 이유 |

감지 패턴: `hypomania`, `depression`, `over-immersion`, `exhaustion`, `self-destructive`, `emotional-numbing`, `anxiety`, `isolation`

### 5.2 클라이언트 훅

**파일**: `hooks/admin/useSlipAnalytics.ts`

```typescript
export function useSlipAnalytics(period: '7d'|'30d'|'90d'): {
  data, loading, error, period, setPeriod, refresh
}
```

### 5.3 HUA Analysis Card

**파일**: `admin/diaries/[id]/components/HUAAnalysisCard.tsx`

| 표시 항목 | 라벨 | 소스 |
|---|---|---|
| 복잡도 | `ai_entropy` | entropy |
| 강도 | `ai_density` | density |
| 변화 | `ai_transitions회` | transitions |
| 방향성 | `approach_avoidance` | Z축 |
| 주요 감정 | `ai_dominant_emotion` | dominant_emotion |

---

## 6. DB 스키마

### 6.1 AnalysisResult (1차 분석)

```prisma
model AnalysisResult {
  mode, tone                    // 응답 모드/어조
  affect_tier, momentum_tier    // tier_a, tier_m (Float)
  confidence                    // 신뢰도 (Float)
  ethics          String[]      // 윤리 태그 배열
  sentiment       Int?          // 1-100
  slip            SlipLevel?    // none/soft/hard
  motivation_cues Json?         // { approach: [], avoidance: [] }
  primary_emotions EmotionTag[]
  // 암호화 필드: title_enc, summary_enc, emotion_flow_enc, question_enc, interpretation_enc
  hua_analysis    HuaEmotionAnalysis?  // 2차 분석 관계
}
```

### 6.2 HuaEmotionAnalysis (2차 분석)

```prisma
model HuaEmotionAnalysis {
  coordinates        Json?     // { valence, arousal }
  ai_entropy         Float?
  ai_density         Float?
  ai_transitions     Int?
  ai_dominant_ratio  Float?
  ai_dominant_emotion String?
  approach_avoidance Float?    // Z축 (0=회피, 1=접근)
  motivation_cues    Json?     // 1차에서 전달
  sentiment_score    Float?    // 1차 sentiment 저장
  reasoning          String?
  engine_version     String?
  analysis_parameters Json?
}
```

### 6.3 UserDiaryAnalysisView (집계 뷰)

```prisma
valence Float?, arousal Float?, entropy Float?, density Float?, transitions Int?
```

### 6.4 정책 관리

```prisma
AiPolicyVersion  { policy_name, version, scope, config }  // slip/ethics/tone/mode 버전
AiPolicyActive   { policy_name @unique, config }           // 현재 활성
AiPolicyOverride { target, key, value, expires_at }        // 오버라이드
```

### 6.5 마이그레이션

`migrations/20260201000000_add_approach_avoidance_and_empathy_mode`:
```sql
ALTER TABLE "user"."HuaEmotionAnalysis" ADD COLUMN "approach_avoidance" DOUBLE PRECISION;
ALTER TABLE "user"."HuaEmotionAnalysis" ADD COLUMN "motivation_cues" JSONB;
ALTER TABLE "user"."AnalysisResult" ADD COLUMN "motivation_cues" JSONB;
ALTER TABLE "user"."UserSettings" ADD COLUMN "empathy_mode" TEXT NOT NULL DEFAULT 'distanced';
```

---

## 7. 파일 인덱스

### Slip
| 파일 | 핵심 |
|---|---|
| `lib/slip-calculator-pure.ts` | `calculateSlip()`, `adjustSlipByEthics()` — 순수 함수, 규칙+태그 |
| `lib/slip-calculator.ts` | `analyzeSlipWithAI()`, `getHistoricalSlipContext()`, `calculateSlipEscalation()` — AI+히스토리 |
| `lib/hua-types.ts` | `SlipStatus`, `SlipCondition` 타입 |
| `api/admin/slip-analytics/route.ts` | Slip 통계 API |
| `hooks/admin/useSlipAnalytics.ts` | Slip 통계 훅 |

### Ethics
| 파일 | 핵심 |
|---|---|
| `lib/prompts/core.ts` | positive/negative/custom 태그 정의, motivation_cues |
| `lib/hua-types.ts` | `EthicsLabel`, `EthicsThreshold` 타입 |
| `lib/hua-config.ts` | `DEFAULT_ETHICS_THRESHOLD` 임계값 |
| `lib/slip-calculator-pure.ts` | `adjustSlipByEthics()` — 태그→Slip 보정 |
| `lib/ai-response-types.ts` | 태그 우선순위, 탈옥 감지, 최대 10개 제한 |
| `lib/jailbreak-messages.ts` | 탈옥 대응 메시지 |

### Z축 (XYZ)
| 파일 | 핵심 |
|---|---|
| `lib/hua-ai-prompt.ts` | 2차 프롬프트 + `HUA_AI_RESPONSE` (valence, arousal, approach_avoidance) |
| `lib/hua-ai-service.ts` | `analyzeWithHUAAI()`, 검증, 정규화, DB 변환 |
| `lib/analyze/parsers.ts` | motivation_cues 파싱 |
| `components/hua-analysis/types.ts` | `HUAAnalysisData` 타입 |

### 프롬프트
| 파일 | 핵심 |
|---|---|
| `lib/prompts/core.ts` | Layer 1 (metrics/format/ethics) + Layer 2 (distanced/closer) |
| `lib/prompts/ko.ts` | Layer 3 한국어 (voice_style, safety guardrails) |
| `lib/prompts/en.ts` | Layer 3 영어 |
| `lib/prompts/ja.ts` | Layer 3 일본어 |
| `lib/prompts/index.ts` | 3레이어 조합, `createAnalysisPrompt()` |

### API
| 파일 | 핵심 |
|---|---|
| `api/diary/analyze/stream/route.ts` | 1차 분석 SSE. Slip 판정 + motivation_cues + 위기 감지 + 2차 트리거 |
| `api/hua-emotion-analysis/route.ts` | 2차 분석 REST. 3D 벡터 산출 |
| `api/admin/slip-analytics/route.ts` | Slip 통계 |

### 프론트엔드
| 파일 | 핵심 |
|---|---|
| `admin/.../HUAAnalysisCard.tsx` | 2차 분석 결과 + 방향성 |
| `components/hua-analysis/SentimentScoreCard.tsx` | valence → 1-100 변환 |
| `components/diary/emotion-analysis.tsx` | 사용자 대면 감정 분석 |
