# HUA 감정 분석 시스템 레퍼런스

> 작성일: 2026-02-02
> 목적: 논문용 — Slip & Ethics 시스템 중심, 3D 감정 벡터(XYZ) 보조 자료
> 코드베이스 전수 조사 결과

---

## 1. 시스템 개요

HUA(Human-AI Resonance Architecture)의 일기 감정 분석은 **2-Phase 구조**로 동작:

```
[일기] → [1차 분석: 정성+Slip+Ethics] → [2차 분석: 정량 3D 벡터]
```

---

## 2. 전체 파라미터 사전

### 2.1 1차 분석 파라미터 (정성 지표)

| 파라미터 | 범위 | 설명 |
|---|---|---|
| `tier_a` | 1.0-5.0 | **감정 강도(Emotional Intensity)**: 일기에서 감정이 얼마나 직접적이고 선명하게 표현되었는지. 1=사실 나열, 5=감정 중심 서술 |
| `tier_m` | 1.0-5.0 | **서사 동력(Narrative Dynamism)**: 일기의 서사적 흐름과 내적 추진력. 방향과 무관하게 강도만 측정. 1=정적/단편적, 5=강렬한 응집 흐름 |
| `mode` | enum | **응답 모드**: empathy(공감), analysis(분석), suggestion(제안), praise(격려), playful(장난) — 일기 내용 유형에 따라 선택 |
| `tone` | enum | **어조**: gentle(부드러운), warm(따뜻한), cheerful(명랑한), quirky(기발한), delicate(섬세한) — 감정 분위기에 따라 선택 |
| `confidence` | 0.0-1.0 | **분석 신뢰도**: 텍스트의 명확성과 구조에 기반한 분석 확신 정도 |
| `sentiment` | 1-100 | **감정 톤 점수**: 전반적 감정 밸런스. 중위값 50(평범한 날), 70%가 35-65 구간. 30 이하=힘든 상태, 75 이상=좋은 상태 |
| `ethics` | string[] | **윤리 태그**: 일기 내용에서 감지된 심리/윤리적 신호 3-5개 (positive + negative + custom 태그) |
| `slip` | none/soft/hard | **슬립 상태**: tier_a × tier_m + ethics + 히스토리 기반 심리적 위험도 판정 |
| `motivation_cues` | JSON | **동기 단서**: 일기 원문에서 추출한 접근/회피 동기의 텍스트 근거 (`approach: [...], avoidance: [...]`) |
| `emotion_flow` | string[] | **감정 흐름**: "감정1 → 감정2: 원인" 형태의 감정 전환 시퀀스 2-5개 |

### 2.2 2차 분석 파라미터 (정량 지표 — 3D 벡터)

| 파라미터 | 범위 | 설명 |
|---|---|---|
| `valence` | -1.0 ~ 1.0 | **X축 — 쾌-불쾌(Valence)**: Russell Circumplex의 수평축. -1=매우 부정, 0=중립, 1=매우 긍정 |
| `arousal` | 0.0 ~ 1.0 | **Y축 — 각성도(Arousal)**: Russell Circumplex의 수직축. 0=차분/이완, 1=각성/격앙 |
| `approach_avoidance` | 0.0 ~ 1.0 | **Z축 — 접근-회피(Approach-Avoidance)**: HUA 확장축. 0=강한 회피(도망/위축), 0.5=중립/양가, 1=강한 접근(참여/추진). 행동-지향 언어, 목표 언급, 위축 단서 등으로 산출 |
| `entropy` | 0.0 ~ 1.0 | **감정 복잡도**: 표현된 감정의 다양성. 0=단일 감정, 1=고도로 복잡한 감정 혼합 |
| `density` | 0.0 ~ 1.0 | **감정 밀도**: 전체 내용 대비 감정 표현의 비율. 0=감정 최소, 1=감정 표현 집중 |
| `transitions` | 0+ (정수) | **감정 전환 횟수**: 뚜렷한 감정 상태 변화의 수. 안정성 분석에 사용 |
| `dominant_emotion` | 한국어 단어 | **주요 감정**: 가장 두드러진 감정 상태. 예: "기쁨", "슬픔", "불안", "평온", "분노" |

### 2.3 3D 벡터 도식

```
           arousal (Y)
           1.0 |  각성/격앙
               |
               |       * (-0.25, 0.6, 0.35)
               |         "불안+각성+회피경향"
               |
           0.0 +------------------→ valence (X)
          -1.0        0.0       1.0
         불쾌                   쾌

           approach_avoidance (Z)
           1.0 = 강한 접근 (engage)
           0.5 = 중립
           0.0 = 강한 회피 (withdraw)

Russell 2D에서는 동일 좌표인 두 상태:
  A: (-0.25, 0.60, 0.80) = 불안하지만 맞서려 함
  B: (-0.25, 0.60, 0.20) = 불안해서 도망치려 함
→ Z축으로만 구분 가능
```

---

## 3. Slip 시스템 상세

### 3.1 개요

Slip은 AI가 분석한 tier_a(감정 강도)와 tier_m(서사 동력)을 기반으로 사용자의 **심리적 위험 상태**를 판단하는 다단계 시스템.

```
Slip = f(tier_a, tier_m) → ethics 보정 → AI 맥락 분석 → 히스토리 에스컬레이션
```

### 3.2 Slip 레벨

| 레벨 | 의미 | 대응 |
|---|---|---|
| `none` | 정상 범위 | 표준 분석 응답 |
| `soft` | 경고 — 주의 필요 | 관찰 모드, 어드민 알림 |
| `hard` | 위험 — 즉시 대응 필요 | 위기 알림, 에스컬레이션 |

### 3.3 판정 단계

#### Stage 1: 규칙 기반 판정 (`calculateSlip`)

**파일**: `app/lib/slip-calculator-pure.ts:45-115`

| 조건 | 결과 | 의심 패턴 | 설명 |
|---|---|---|---|
| tier_a <= 1.0 AND tier_m <= 1.0 | **hard** | `depression` | 감정/활동 모두 극단적 저하 |
| tier_a >= 4.5 AND tier_m >= 4.5 | **soft** | `hypomania` | 감정/활동 모두 극단적 고조 (AI 확인 필요) |
| tier_m >= 4.0 AND tier_a <= 2.0 | **soft** | `over-immersion` | 활동↑ 감정↓ (해리적 과몰입) |
| tier_a <= 2.0 AND tier_m <= 2.0 (a>1) | **soft** | `mild-depression` | 전반적 저조 |
| tier_a <= 2.0 OR tier_m <= 2.0 | **soft** | — | 부분적 저조 |
| 그 외 | **none** | — | 정상 |

```typescript
export interface SlipCalculationInput {
  tier_a: number;      // 감정 강도 0.0-5.0
  tier_m: number;      // 서사 동력 0.0-5.0
  ethics: string[];    // 윤리 태그
  content?: string;    // 일기 내용 (AI 분석용)
  emotion_flow?: string[];
}

export interface SlipCalculationResult {
  slip: 'none' | 'soft' | 'hard';
  reason: string;
  risk_factors: string[];
  suspected_pattern: string | null;  // depression, hypomania, over-immersion 등
  ai_analyzed?: boolean;
}
```

#### Stage 2: 윤리 태그 보정 (`adjustSlipByEthics`)

**파일**: `app/lib/slip-calculator-pure.ts:120-169`

| 태그 분류 | 태그 예시 | 효과 |
|---|---|---|
| **위기 태그** | `crisis_suicide`, `crisis_self_harm`, `crisis_drug`, `crisis_child_abuse` | 즉시 **hard** |
| **위험 태그** | `self-harm`, `suicide`, `violence`, `substance-abuse` | → **hard** |
| **주의 태그** | `isolation`, `hopelessness`, `anger`, `anxiety` | none → **soft** |

#### Stage 3: AI 맥락 분석 (`analyzeSlipWithAI`)

**파일**: `app/lib/slip-calculator.ts:38-119`

의심 패턴이 있을 때 GPT-4o-mini로 일기 원문을 분석하여 5가지 패턴 판별:

| 패턴 | 설명 |
|---|---|
| `hypomania` | 문제적 고양 (충동성, 수면 감소, 과대망상, 위험 행동) |
| `healthy-flow` | 정상적 고에너지 창작/생산 상태 → **none으로 해제** |
| `depression` | 낮은 동기 + 감정적 고통 |
| `over-immersion` | 해리적 과몰입 (감정 없는 과활동) |
| `normal` | 정상 → **none으로 해제** |

핵심: `tier_a >= 4.5 AND tier_m >= 4.5`일 때 **hypomania vs healthy-flow**를 AI가 구분. 고에너지를 무조건 병리화하지 않음.

#### Stage 4: 히스토리 에스컬레이션 (`calculateSlipEscalation`)

**파일**: `app/lib/slip-calculator.ts:312-371`

최근 7일 Slip 기록 기반:

| 규칙 | 조건 | 결과 |
|---|---|---|
| 규칙 1 | 연속 3일+ soft/hard | → **hard** |
| 규칙 2 | 7일 중 5일+ slip | soft → **hard** |
| 규칙 3 | 패턴 급전환 (경조증 ↔ 우울) | → **hard** |
| 규칙 4 | none이지만 최근 hard 2회+ | → **soft** (주의 유지) |

```typescript
export interface HistoricalSlipContext {
  recentSlips: Array<{ date: Date; slip: SlipLevel; pattern: string | null }>;
  consecutiveDays: number;    // 연속 slip 일수
  softDays: number;           // 7일 중 soft 일수
  hardDays: number;           // 7일 중 hard 일수
  patternSwitch: boolean;     // 경조증 ↔ 우울 전환 감지
  lastSlipDate: Date | null;
}
```

### 3.4 Slip 판정 플로우

```
[1차 분석 완료: tier_a, tier_m, ethics 추출]
    │
    ▼
[Stage 1] calculateSlip(tier_a, tier_m)
    │        규칙 기반 판정
    ▼
[Stage 2] adjustSlipByEthics(baseSlip, ethics)
    │        위기/위험/주의 태그로 보정
    ▼
[Stage 3] analyzeSlipWithAI(input, adjustedSlip)  ← 의심 패턴 있을 때만
    │        GPT-4o-mini 맥락 분석
    ▼
[Stage 4] calculateSlipEscalation(finalSlip, history)
    │        최근 7일 히스토리 기반 에스컬레이션
    ▼
[최종 Slip] → DB 저장 (AnalysisResult.slip)
```

---

## 4. Ethics 태그 시스템 상세

### 4.1 태그 구조

**파일**: `app/lib/prompts/core.ts:125-153`

1차 분석 시 AI가 일기에서 3-5개 태그를 선택/생성:

#### Positive 태그 (긍정적 신호)
| 태그 | 설명 |
|---|---|
| `growth` | 학습/진전/전진하는 움직임 |
| `reflection` | 자기인식/내성 |
| `connection` | 관계/감정적 유대 |
| `stability` | 안정감/확고한 기반 |
| `resilience` | 인내/회복력 |
| `tenderness` | 감정적 부드러움/섬세한 민감성 |

#### Negative 태그 (주의 신호)
| 태그 | 설명 |
|---|---|
| `loneliness` | 고립감/단절감 |
| `anxiety` | 걱정/불안/긴장 |
| `conflict` | 내적/외적 마찰 |
| `exhaustion` | 에너지/동기 고갈 |
| `uncertainty` | 의심/불분명한 방향 |
| `overwhelm` | 처리 과부하 |

#### Custom 태그 (AI 생성)
- 1-2개 필수 생성
- 영어, 한 단어 또는 하이픈 연결
- 해당 일기만의 고유한 뉘앙스 포착
- 예: `self-care`, `micro-joy`, `quiet-grief`

### 4.2 위기/위험 태그 (Slip 연동)

**파일**: `app/lib/slip-calculator-pure.ts:124-133`

일반 ethics 태그와 별도로, Slip 시스템이 감지하는 위기/위험 태그:

| 분류 | 태그 | Slip 효과 |
|---|---|---|
| 위기 | `crisis_suicide` | → hard |
| 위기 | `crisis_self_harm` | → hard |
| 위기 | `crisis_drug` | → hard |
| 위기 | `crisis_child_abuse` | → hard |
| 위기 | `crisis_terrorism` | → hard |
| 위험 | `self-harm` | → hard |
| 위험 | `suicide` | → hard |
| 위험 | `violence` | → hard |
| 위험 | `substance-abuse` | → hard |
| 주의 | `isolation` | none→soft |
| 주의 | `hopelessness` | none→soft |
| 주의 | `anger` | none→soft |
| 주의 | `anxiety` | none→soft |

### 4.3 Ethics Threshold (임계값)

**파일**: `app/lib/hua-types.ts:107-114`, `app/lib/hua-config.ts:8-15`

```typescript
// 기본 윤리적 경계 임계값
export const DEFAULT_ETHICS_THRESHOLD: EthicsThreshold = {
  self_harm: 0.7,       // 자해 위험
  violence: 0.6,        // 폭력성
  discrimination: 0.5,  // 차별
  privacy: 0.4,         // 프라이버시
  manipulation: 0.5,    // 조작
  inappropriate: 0.6    // 부적절함
};
```

### 4.4 Ethics Label 타입

**파일**: `app/lib/hua-types.ts:35-41`

```typescript
export type EthicsLabel =
  | "self_harm"       // 자해 위험
  | "violence"        // 폭력성
  | "discrimination"  // 차별
  | "privacy"         // 프라이버시 침해
  | "manipulation"    // 조작
  | "inappropriate";  // 부적절
```

---

## 5. Z축(접근-회피)의 2-Phase 산출

### Phase 1: 텍스트 근거 추출 (1차 분석)

**프롬프트**: `app/lib/prompts/core.ts:88-91`
```yaml
motivation_cues:
  format: "approach: phrase1, phrase2 | avoidance: phrase1, phrase2"
```

1차 분석 AI가 일기에서 접근/회피 동기를 시사하는 **원문 구절**을 추출.

**파싱**: `app/lib/analyze/parsers.ts:101-112`
```
입력: "approach: 새로운 시도, 계획 세우기 | avoidance: 그냥 참자, 모르겠다"
출력: { approach: ["새로운 시도", "계획 세우기"], avoidance: ["그냥 참자", "모르겠다"] }
```

### Phase 2: 정량 수치 산출 (2차 분석)

**프롬프트**: `app/lib/hua-ai-prompt.ts:39-44`

2차 분석(GPT-4o-mini)이 1차의 motivation_cues를 참조하여 0.0~1.0 수치로 산출.

```
approach_avoidance:
  0.0 = strong avoidance (wanting to escape, withdraw)
  0.5 = neutral / ambivalent
  1.0 = strong approach (wanting to engage, pursue)
  Based on: action-oriented language, goal references, withdrawal cues
```

---

## 6. Slip × Z축 교차 분석

### tier_m의 방향성 한계

**파일**: `app/lib/prompts/core.ts:64-68`

```yaml
tier_m:
  key_insight: |
    High tier_m = INTENSITY of dynamism (direction-agnostic)
    POSITIVE: creative emergence, deep flow, productive momentum
    NEGATIVE: over-involvement, obsessive circling, compulsive energy
  note: evaluate intensity NOT valence
```

tier_m은 **방향 없이 강도만** 측정 → Slip은 "얼마나 위험한 강도인가"를 판단하지만, "그 에너지가 어디로 향하는가"는 Z축이 담당.

### 교차 해석 예시

| tier_a | tier_m | Slip | Z축 | 해석 |
|---|---|---|---|---|
| 4.5 | 4.5 | soft (hypomania?) | 0.9 | 고에너지 + 강한 접근 → 창작적 몰입 가능성 높음 |
| 4.5 | 4.5 | soft (hypomania?) | 0.2 | 고에너지 + 강한 회피 → 도피적 과몰입 위험 |
| 1.5 | 1.5 | soft (mild-depression) | 0.8 | 저에너지지만 접근 의지 → 회복 가능성 |
| 1.5 | 1.5 | soft (mild-depression) | 0.1 | 저에너지 + 강한 회피 → 고립/악화 위험 |
| 3.0 | 3.0 | none | 0.5 | 정상 범위 + 중립 방향 → 안정적 |

---

## 7. 전체 데이터 플로우

```
[일기 작성]
    │
    ▼
[1차 분석] (GPT-5-mini / Gemini 2.5 Flash)
    ├── 정성 지표: title, summary, emotion_flow, interpretation, question
    ├── 파라미터: mode, tone, tier_a, tier_m, confidence, sentiment
    ├── Ethics 태그: ethics[] (positive + negative + custom)
    ├── 동기 단서: motivation_cues { approach: [], avoidance: [] }
    └── Slip 판정: 규칙→ethics 보정→AI 분석→히스토리 에스컬레이션
    │
    ▼
[2차 분석] (GPT-4o-mini 고정)
    ├── X축: valence (-1~1)     ← Russell
    ├── Y축: arousal (0~1)      ← Russell
    ├── Z축: approach_avoidance (0~1) ← HUA 확장
    ├── 보조 메트릭: entropy, density, transitions, dominant_emotion
    └── reasoning
    │
    ▼
[DB 저장]
    ├── AnalysisResult: slip, tier_a, tier_m, ethics, sentiment, motivation_cues
    └── HuaEmotionAnalysis: valence, arousal, approach_avoidance, entropy, density, transitions
    │
    ▼
[어드민 모니터링]
    ├── Slip Analytics: 분포/트렌드/tier 상관관계/에스컬레이션
    └── HUA Analysis Card: 3D 벡터 + 정량 메트릭 + 방향성
```

---

## 8. 어드민 모니터링

### Slip Analytics API
- **엔드포인트**: `GET /api/admin/slip-analytics?period=7d|30d|90d`
- **파일**: `app/api/admin/slip-analytics/route.ts`
- **데이터**: distribution, dailyTrend, tierCorrelation, patternFrequency, escalationStats
- **클라이언트 훅**: `app/hooks/admin/useSlipAnalytics.ts`

### HUA Analysis Card
- **파일**: `app/(app)/admin/diaries/[id]/components/HUAAnalysisCard.tsx`
- Z축을 "방향성"으로, entropy/density/transitions를 "복잡도/강도/변화"로 표시

---

## 9. 정책 관리 (DB)

**Prisma 스키마**: `prisma/schema.prisma`

| 테이블 | 역할 |
|---|---|
| `AiPolicyVersion` | 정책 버전 관리 (slip, ethics, tone, mode 등) |
| `AiPolicyActive` | 현재 활성 정책 |
| `AiPolicyOverride` | 사용자/테넌트별 정책 오버라이드 |

---

## 10. 파일 인덱스

### Slip 시스템
| 파일 | 역할 |
|---|---|
| `app/lib/slip-calculator-pure.ts` | 순수 함수 — 규칙 기반 Slip 판정, ethics 보정 (서버/클라이언트 호환) |
| `app/lib/slip-calculator.ts` | 서버 전용 — AI 맥락 분석, 히스토리 에스컬레이션 |
| `app/lib/hua-types.ts` | SlipStatus, SlipCondition, EthicsLabel, EthicsThreshold 타입 |
| `app/lib/hua-config.ts` | DEFAULT_ETHICS_THRESHOLD, enable_slip_analysis 설정 |
| `app/api/admin/slip-analytics/route.ts` | Slip 통계 API |
| `app/hooks/admin/useSlipAnalytics.ts` | Slip 통계 클라이언트 훅 |

### Ethics 시스템
| 파일 | 역할 |
|---|---|
| `app/lib/prompts/core.ts` | Ethics 태그 정의 (positive/negative/custom), motivation_cues 정의 |
| `app/lib/hua-types.ts` | EthicsLabel, EthicsThreshold 타입 |
| `app/lib/hua-config.ts` | DEFAULT_ETHICS_THRESHOLD 임계값 |
| `app/lib/slip-calculator-pure.ts` | adjustSlipByEthics — ethics 태그로 Slip 보정 |

### 3D 벡터 (XYZ)
| 파일 | 역할 |
|---|---|
| `app/lib/hua-ai-prompt.ts` | 2차 분석 프롬프트 + HUA_AI_RESPONSE 타입 (valence, arousal, approach_avoidance) |
| `app/lib/hua-ai-service.ts` | 2차 분석 서비스 — 산출/정규화/검증/DB 변환 |
| `app/lib/analyze/parsers.ts` | motivation_cues 파싱 |
| `app/components/hua-analysis/types.ts` | 프론트엔드 HUAAnalysisData 타입 |

### API
| 파일 | 역할 |
|---|---|
| `app/api/diary/analyze/stream/route.ts` | 1차 분석 (Slip 판정 + motivation_cues 저장 + 2차 트리거) |
| `app/api/hua-emotion-analysis/route.ts` | 2차 분석 (3D 벡터 산출) |
| `app/api/admin/slip-analytics/route.ts` | Slip 통계 |

### DB
| 파일 | 역할 |
|---|---|
| `prisma/schema.prisma` | AnalysisResult(slip, ethics, motivation_cues), HuaEmotionAnalysis(approach_avoidance, coordinates) |
| `prisma/migrations/20260201*` | approach_avoidance, motivation_cues 컬럼 추가 |

### 프론트엔드
| 파일 | 역할 |
|---|---|
| `app/(app)/admin/.../HUAAnalysisCard.tsx` | 어드민 — 2차 분석 결과 + 방향성 표시 |
| `app/components/hua-analysis/SentimentScoreCard.tsx` | valence(-1~1) → 1-100 변환 표시 |
| `app/components/diary/emotion-analysis.tsx` | 사용자 대면 감정 분석 UI |
