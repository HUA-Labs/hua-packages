# HUA 논문 리라이팅 노트

> 숨다이어리 구현 경험 기반, 논문 보강 포인트 정리
>
> Date: 2026-01-26

---

## 1. 논문과 구현의 연결

### 1.1 Parameter → Implementation 매핑

| 논문 Parameter | 숨다이어리 구현 | 상태 |
|---------------|---------------|------|
| **tone** | `AnalysisResult.tone` (gentle, warm, cheerful, quirky, delicate) | ✅ 운영 중 |
| **mode** | `AnalysisResult.mode` (empathy, analysis, suggestion, praise, playful) | ✅ 운영 중 |
| **tier_a** (affect) | `AnalysisResult.affect_tier` (1.0-5.0) | ✅ 운영 중 |
| **tier_m** (momentum) | `AnalysisResult.momentum_tier` (1.0-5.0) | ✅ 운영 중 |
| **slip** | `AnalysisResult.slip` (none/soft/hard) + 에스컬레이션 | ✅ v2 구현 완료 |
| **ethics** | `AnalysisResult.ethics[]` + `CrisisAlert` | ✅ 운영 중 |

### 1.2 논문에서 "의도적 제외"했던 것들의 구현

논문 원문:
> "Slip and ethics were withheld because (i) commercial APIs lack session-level continuity, and (ii) these modules constitute the core ethical controls of HUA, reserved for controlled contexts."

숨다이어리에서는 **controlled context** (자체 서비스)이므로 slip/ethics 완전 구현:

```
slip-calculator.ts v2.1
├── 패턴 감지: hypomania, depression, over-immersion, burnout
├── AI 기반 맥락 판단 (의심 케이스)
├── 7일 히스토리 기반 에스컬레이션
└── 연속성 추적 (consecutive days)

crisis-detection-service.ts
├── 키워드 + AI 기반 위기 감지
├── 4단계 위험도 (risk_level 1-4)
└── 에스컬레이션 규칙 (7일/3건, 연속 3일, 급격 상승)
```

---

## 2. 임상적 통찰 추가 제안

### 2.1 초기종결(Early Termination) 문제

**현실**:
- 상담 5~10회기에 자기 회고 단계에서 고통으로 인한 종결 빈번
- 생면부지 전문가에게 트라우마/치부 즉시 개방의 어려움
- 라포 형성 전 회고 요구 → 방어 → 종결

**HUA/숨다이어리 해결책**:
1. **회고의 분산**: 매일 일기로 자기 직면을 micro-dose
2. **자기개방 훈련**: 앱(비인간)에게 먼저 연습
3. **사전 레포트**: 첫 상담 시 언어화 부담 경감
4. **탐색 단축**: 5회기 걸릴 맥락 파악을 1회기로

**논문 추가 가능**:
```
The journaling prototype addresses a well-documented clinical challenge:
early termination during the retrospection phase (sessions 5-10).
By distributing self-confrontation into daily micro-reflections,
users arrive at professional consultation with pre-processed emotional histories,
reducing the acute distress that often precipitates dropout.
```

### 2.2 다리(Bridge) 역할

```
[혼자 고통] ←────── 숨다이어리 ──────→ [전문가 상담]
                       │
                       ├── 자기개방 연습
                       ├── 패턴 인식
                       ├── 레포트 생성
                       └── 진입장벽 완화
```

**논문 추가 가능**:
```
HUA's journaling system functions as an affective bridge:
a transitional space where users practice self-disclosure
before encountering human professionals. This scaffolded approach
may lower barriers to formal care while preserving user agency.
```

---

## 3. Slip 시스템 고도화 내용

### 3.1 기존 논문의 slip 설명

> "Soft slip issues multiple gentle warnings or reassurance lines before escalation; if these are ignored, the system transitions to a temporary lockout (hard slip)."

### 3.2 실제 구현에서의 확장

**패턴 기반 감지** (단순 규칙 → 복합 패턴):

```typescript
// Tier Matrix (A × M) 해석
| A \ M     | M 낮음      | M 높음       |
|-----------|------------|-------------|
| A 낮음    | 온화/무감각  | 과몰입       |
| A 높음    | 우울/막힘   | 창발/경조증   |
```

**지표 태그 시스템**:

```typescript
// 경조증 지표
HYPOMANIA_INDICATORS = [
  'impulsivity', 'sleep-reduction', 'hyperactivity',
  'grandiosity', 'racing-thoughts', 'overspending'
]

// 우울 지표
DEPRESSION_INDICATORS = [
  'exhaustion', 'hopelessness', 'isolation',
  'anhedonia', 'self-neglect', 'withdrawal'
]
```

**에스컬레이션 규칙** (심즈 무드렛 컨셉):

```
규칙 1: 연속 3일 soft → hard 에스컬레이트
규칙 2: 7일 중 5일 이상 soft → hard
규칙 3: 경조증 ↔ 우울 급격 전환 → hard
규칙 4: none이지만 최근 hard 2회+ → soft (주의 유지)
```

**논문 추가 가능**:
```
The slip parameter, initially conceptualized as binary de-escalation,
was extended into a pattern-recognition system. Drawing on clinical
indicators for hypomania and depression, the implementation detects
not only imbalanced states (high affect, low momentum) but also
"both-high" patterns characteristic of hypomanic episodes.

Escalation follows a temporal accumulation model—analogous to
"moodlets" in simulation games—where signals compound over days
rather than triggering on single events. This design reflects
the clinical reality that mental health patterns emerge longitudinally.
```

---

## 4. Ethics 태그 시스템 정교화

### 4.1 태그 구조

```yaml
ethics_tags:
  positive: [growth, reflection, connection, stability, resilience, tenderness]
  negative: [loneliness, anxiety, conflict, exhaustion, uncertainty, overwhelm]
  custom: 1-2개, AI 생성, 영어 단어만
```

### 4.2 영어 통일의 이유

- 다국어 사용자 (ko, en, ja) 데이터 정합성
- 패턴 분석 시 태그 집계 용이
- 연구 데이터로 활용 시 일관성

**논문 추가 가능**:
```
Ethics tags are constrained to English vocabulary regardless of
diary language (Korean, English, Japanese), ensuring cross-linguistic
consistency for longitudinal pattern analysis and research reproducibility.
```

---

## 5. 배치 테스트 → 연구 방법론

### 5.1 구현된 기능

```
/admin/prompt-test
├── CSV/JSON 업로드 (date, content)
├── 모델 선택 (GPT-5 Mini, Gemini 2.5 Flash 등)
├── 언어 선택 (ko, en, ja)
├── 순차 분석 + 진행상황
├── 2차 HUA 분석 옵션
└── 결과 익스포트 (JSON/CSV)
```

### 5.2 연구 활용 가능성

**연구 1: LLM별 감정 패턴 감지 비교**
- 동일 목데이터 → 다른 모델
- tier_a, tier_m, slip, ethics 비교
- Ground truth 대비 정확도

**연구 2: 경조증/우울 텍스트 분류**
- 임상 전문가 검토 목데이터 제작
- AI 감지 vs 전문가 판단 일치도
- 민감도/특이도 분석

**연구 3: 에스컬레이션 규칙 타당도**
- 실제 사용자 데이터 (동의 하)
- 에스컬레이션 발생 케이스 추적
- 후향적 검증

**논문 추가 가능**:
```
The batch testing infrastructure enables systematic evaluation
of parameter accuracy across models. By uploading structured
test corpora (CSV/JSON with date-content pairs), researchers
can compare tier assignments, slip detection sensitivity,
and ethics tag consistency across different LLM backends.
This tooling supports both internal iteration and
reproducible external validation.
```

---

## 6. Future Work 구체화

### 6.1 기존 논문의 Future Work

1. Longitudinal validation
2. Scale and diversity
3. Parameter refinement
4. Comparative evaluation
5. Responsible deployment

### 6.2 숨다이어리 기반 구체화

| 논문 항목 | 구체적 계획 |
|----------|-----------|
| Longitudinal validation | 숨다이어리 베타 운영 → 3개월+ 데이터 축적 |
| Scale and diversity | 한/영/일 다국어 지원 이미 구현 |
| Parameter refinement | slip v2 (패턴 감지 + 에스컬레이션) 완료 |
| Comparative evaluation | 배치 테스트로 모델 비교 인프라 구축 |
| Responsible deployment | 전문가 레포트 → 사용자 동의 기반 공유 |

### 6.3 전문가 레포트 비전

```
┌──────────────────────────────────────────────────────────┐
│              전문가 사전상담 레포트                        │
├──────────────────────────────────────────────────────────┤
│ 1. 요약 (분석 기간, 일기 수, 주요 패턴)                    │
│ 2. 감정 추이 그래프 (valence, arousal, tier 시계열)       │
│ 3. 패턴 분석 (경조증/우울 구간 식별)                       │
│ 4. 주요 태그 빈도                                        │
│ 5. 에스컬레이션 이력                                      │
│ 6. 참고 사항 (비진단적 접근 명시)                         │
└──────────────────────────────────────────────────────────┘
```

**논문 추가 가능**:
```
A planned extension generates pre-consultation reports for
mental health professionals. These reports aggregate longitudinal
patterns (affect trajectories, tag frequencies, escalation history)
into structured summaries, potentially reducing intake session time
and supporting more efficient therapeutic alliance formation.
Crucially, report generation remains user-initiated,
preserving autonomy and consent.
```

---

## 7. 이론적 기여 강화 포인트

### 7.1 Distanced Empathy의 임상적 근거

기존 논문은 HCI/디자인 관점. 임상심리 관점 추가 가능:

- **자기개방(self-disclosure)** 연구와의 연결
- **치료적 글쓰기(therapeutic writing)** 문헌
- **단계적 노출(graduated exposure)** 원리

### 7.2 Stateless의 재해석

"메모리 없음"이 아니라 "축적되지만 사용자 소유":

```
기존 AI: 시스템이 기억 → 사용자 통제 불가
HUA: 사용자가 기록 → 사용자가 소유/공유 결정
```

**논문 추가 가능**:
```
HUA's "statelessness" does not preclude data existence—diary entries
are stored—but rather ensures that accumulated data remains under
user sovereignty. The system does not "remember" users across sessions;
instead, users choose when and how to surface their own histories.
This reframes privacy not as data absence but as data agency.
```

---

## 8. 방법론 섹션 보강

### 8.1 Journaling Prototype 상세화

기존 논문: "We also sketched a journaling prototype..."

실제 구현 상세:

```
숨다이어리 아키텍처
├── Frontend: Next.js 16 (App Router)
├── Backend: Prisma + PostgreSQL
├── AI: Multi-provider (OpenAI, Google, Anthropic)
├── Auth: Better-Auth
└── i18n: next-intl (ko, en, ja)

분석 파이프라인
├── 1차 분석: HUA Core Rules (YAML 기반 프롬프트)
├── 2차 분석: HUA Emotion Analysis (valence, arousal, entropy)
├── Slip 계산: 패턴 감지 + 에스컬레이션
└── Crisis 감지: 키워드 + AI + 에스컬레이션
```

### 8.2 Pilot Study 확장 가능성

현재 N=15 → 숨다이어리 베타 사용자 데이터로 확장 가능:

- 사용 패턴 (작성 빈도, 길이, 시간대)
- 파라미터 분포 (tier, slip, ethics 통계)
- 종단 추적 (개인별 변화 추이)

---

## 9. 인용 추가 제안

### 9.1 임상심리 문헌

- Pennebaker의 expressive writing 연구
- 초기종결(premature termination) 메타분석
- 자기개방과 치료 동맹 연구

### 9.2 디지털 정신건강

- 모바일 기분 추적 앱 효과 연구
- AI 기반 정신건강 도구 윤리 가이드라인
- 텍스트 기반 감정 분석 타당도 연구

---

## 10. 요약: 핵심 보강 포인트

1. **임상적 문제의식 추가**: 초기종결, 자기개방 훈련, 회고의 분산
2. **Slip 시스템 상세화**: 패턴 감지, 지표 태그, 에스컬레이션 규칙
3. **Bridge 역할 명시**: 혼자 ↔ 전문가 사이의 전환 공간
4. **연구 인프라 설명**: 배치 테스트, 모델 비교, 데이터 익스포트
5. **전문가 레포트 비전**: 사전상담 효율화, 사용자 동의 기반
6. **Stateless 재정의**: 데이터 부재가 아닌 데이터 주권

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-26 | 초안 작성 |
