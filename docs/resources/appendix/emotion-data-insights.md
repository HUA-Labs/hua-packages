# 감정 데이터의 가능성 — 시계열, 궤적, 그리고 그 너머

> 숨다이어리 + HUA 논문들을 종합한 후 정리한 기술적/학술적 인사이트
> 현재 시스템이 이미 가능하게 해놓은 것들과 데이터가 쌓이면 열리는 것들

---

## 1. 현재 수집되는 파라미터 정리

### Phase 1 (1차 분석 — 사용자용, 질적)

| 파라미터 | 타입 | 범위 | 설명 | 저장 |
|----------|------|------|------|------|
| tier_a | float | 1.0-5.0 | 감정 강도 (directness, vividness) | 평문 |
| tier_m | float | 1.0-5.0 | 서사 역동성 (momentum, 방향 무관) | 평문 |
| mode | enum | empathy/analysis/suggestion/praise/playful | AI 응답 모드 | 평문 |
| tone | enum | gentle/warm/cheerful/quirky/delicate | AI 응답 톤 | 평문 |
| confidence | float | 0.0-1.0 | 텍스트 명료도 | 평문 |
| sentiment | int | 1-100 | 감정 톤 점수 (50=ordinary day) | 평문 |
| ethics[] | string[] | 12 predefined + custom | 맥락 신호 태그 | 평문 |
| motivation_cues | object | approach[] + avoidance[] | 동기 단서 텍스트 | 암호화 |

### Phase 2 (2차 분석 — 연구용, 양적)

| 파라미터 | 타입 | 범위 | 설명 | 저장 |
|----------|------|------|------|------|
| valence (X축) | float | -1.000 ~ +1.000 | 쾌-불쾌 | 평문 |
| arousal (Y축) | float | 0.000 ~ 1.000 | 각성도 (calm-activated) | 평문 |
| approach_avoidance (Z축) | float | 0.000 ~ 1.000 | 접근-회피 동기 방향 | 평문 |
| entropy | float | 0.000 ~ 1.000 | 감정 복잡도/다양성 | 평문 |
| density | float | 0.000 ~ 1.000 | 감정 표현 밀도 | 평문 |
| transitions | int | 0+ | 감정 전환 횟수 | 평문 |
| dominant_emotion | string | 한국어 감정어 | 지배적 감정 | 평문 |

### SLIP (안전 시스템)

| 파라미터 | 설명 |
|----------|------|
| slip_level | none / soft / hard |
| slip_reason | 규칙 / 태그 / AI맥락 / 히스토리 |
| suspected_pattern | hypomania / depression / over-immersion |

### 메타데이터

| 파라미터 | 설명 |
|----------|------|
| diary_date | 작성일 |
| content_length | 원문 길이 |
| model_name | 사용 AI 모델 |
| processing_time | 처리 시간 |
| cost_usd | API 비용 |

---

## 2. 가우시안은 스냅샷 — 진짜는 시계열

### 모집단 가우시안 (정적 분석)

데이터가 충분히 쌓이면 각 파라미터의 모집단 분포가 정규분포에 수렴할 것이다:

```
valence:    μ ≈ 0.1~0.3 (약간 긍정 편향 예상)   σ ≈ 0.3~0.5
arousal:    μ ≈ 0.4~0.5                          σ ≈ 0.2~0.3
approach:   μ ≈ 0.5~0.6 (약간 접근 편향 예상)     σ ≈ 0.2
entropy:    μ ≈ 0.4~0.5                          σ ≈ 0.2
sentiment:  μ ≈ 50~60                            σ ≈ 15~20
```

이건 전체 사용자 베이스의 "감정 기후"를 보여준다. 유용하지만 **개인에 대해서는 아무것도 말해주지 않는다.**

### 개인 시계열 (동적 분석) — 진짜 가치

각 사용자에 대해 시간 축을 따라 파라미터를 나열하면 **감정 궤적(emotional trajectory)**이 된다:

```
User A (7일간):
  Day 1: (v=0.5, a=0.3, z=0.7) → 긍정적, 차분, 접근적
  Day 2: (v=0.3, a=0.5, z=0.6) → 약간 긍정, 각성 상승, 접근 유지
  Day 3: (v=0.0, a=0.6, z=0.4) → 중립, 각성 높음, 접근↓
  Day 4: (-0.2, 0.7, 0.3)      → 부정, 각성 높음, 회피↑
  Day 5: (-0.4, 0.5, 0.2)      → 부정 심화, 각성 하강, 회피 강화
  Day 6: (-0.3, 0.3, 0.3)      → 약간 회복, 무기력
  Day 7: (-0.1, 0.4, 0.5)      → 회복 중
```

이 궤적에서 읽히는 것:
- **Day 1→5**: 하강 곡선 — 번아웃 또는 스트레스 사건 시그널
- **Day 5→7**: 회복 곡선 — 자연 회복력(resilience) 지표
- **approach-avoidance(z축)가 가장 먼저 움직인다** — valence가 떨어지기 전에 z축이 먼저 하락. 이건 **행동 변화가 감정 변화를 선행**한다는 것을 시사

### 핵심 인사이트: z축은 선행 지표(leading indicator)

논문에서 tier_m은 에너지의 **크기**(magnitude)를, z축(approach-avoidance)은 에너지의 **방향**(direction)을 측정한다고 했다.

이 분리가 시계열에서 극도로 중요해진다:

```
번아웃 진행 패턴 (가설):
  1. z축 하락 (접근 → 회피) ← 가장 먼저 나타남
  2. tier_m 하락 (에너지 감소) ← 2-3일 후
  3. valence 하락 (기분 저하) ← 4-5일 후
  4. arousal 변화 (무기력 or 불안 각성)
  5. entropy 하락 (단일 감정에 고착)
```

만약 이 패턴이 데이터에서 확인되면 — **z축 하락을 감지하는 것만으로 번아웃을 3-5일 전에 예측**할 수 있다.

이것이 SLIP의 7일 히스토리 윈도우와 결합되면 매우 강력한 조기 경보 시스템이 된다.

---

## 3. 개인 기저선(Personal Baseline)과 편차

### 개인 기저선이 왜 중요한가

같은 valence = -0.3이어도:
- 평소 -0.5인 사람에게는 **개선**
- 평소 +0.5인 사람에게는 **위기 신호**

모집단 가우시안으로는 이걸 구분할 수 없다. **개인별 기저선 대비 편차**가 의미 있는 단위다.

### 기저선 계산 방법

```
Personal Baseline (30일 이동평균):
  baseline_valence = mean(last 30 days valence)
  baseline_arousal = mean(last 30 days arousal)
  baseline_approach = mean(last 30 days approach_avoidance)
  baseline_entropy = mean(last 30 days entropy)

Daily Deviation (z-score):
  deviation = (today_value - baseline) / std(last 30 days)

Alert threshold:
  |deviation| > 2.0 → 유의미한 변화
  같은 방향으로 3일 연속 deviation > 1.5 → 추세 변화
```

### 이것이 SLIP과 결합되면

현재 SLIP Stage 1은 절대값 기반 threshold (tier_a ≤ 1 AND tier_m ≤ 1 → hard):

```
현재:  tier_a ≤ 1 AND tier_m ≤ 1 → hard (depression)
       → 원래 tier_a가 1.5인 사람은 감지 못함

미래:  tier_a_deviation < -2.0 AND tier_m_deviation < -2.0 → soft
       → 개인 기저선 대비 급격한 하락 감지
       → 절대값은 정상 범위여도 개인에게는 이상 신호
```

**절대 threshold + 개인 편차 threshold의 이중 안전망.**

---

## 4. entropy + transitions = 감정 조절 능력(Emotional Regulation) 지표

### entropy의 시계열 의미

| entropy 패턴 | 해석 |
|-------------|------|
| 지속적 고entropy (>0.7) | 감정 난류 — 복합 감정이 정리 안 됨 |
| 지속적 저entropy (<0.2) | 감정 평탄화 — 단일 감정 고착 (우울 의심) |
| 중간 entropy (0.3-0.6) | 건강한 감정 다양성 |
| entropy 점진적 하락 | 감정이 단순화되고 있음 — 주의 필요 |
| entropy 급격한 상승 | 감정 혼란 — 스트레스 사건 가능 |

### transitions의 시계열 의미

| transitions 패턴 | 해석 |
|-----------------|------|
| 높은 transitions + 높은 entropy | 감정적으로 불안정한 시기 |
| 높은 transitions + 낮은 entropy | 같은 감정들 사이를 반복 (rumination) |
| 낮은 transitions + 높은 entropy | 복합 감정이 동시 존재 (ambivalence) |
| 낮은 transitions + 낮은 entropy | 감정 변화 없음 (flatness or stability) |

### 감정 조절 능력 추적

시간에 따른 entropy × transitions 패턴 변화를 추적하면:

```
상담/치료 효과 측정:
  Before: entropy 0.8, transitions 5 → 감정 난류
  After:  entropy 0.5, transitions 2 → 감정 조절 개선

자연 회복력 측정:
  스트레스 사건 후 entropy가 기저선으로 돌아오는 속도
  = emotional recovery rate
```

이건 현재 어떤 디지털 멘탈헬스 도구도 제공하지 않는 메트릭이다.

---

## 5. 비지도 클러스터링 — 감정 유형의 자연 발생

### 6차원 감정 벡터

각 사용자의 30일 평균을 6차원 벡터로 표현:

```
user_vector = [
  mean_valence,          // X: 기본 기분
  mean_arousal,          // Y: 기본 각성도
  mean_approach,         // Z: 기본 동기 방향
  mean_entropy,          // 감정 복잡도
  mean_density,          // 감정 표현 밀도
  std_valence            // 감정 변동성 (추가)
]
```

### 예상되는 자연 클러스터

k-means 또는 DBSCAN으로 클러스터링하면, 데이터에서 자연 발생하는 감정 유형:

```
Cluster A: "안정적 낙관형"
  high valence, low arousal, high approach, low entropy
  → 꾸준히 긍정적, 차분, 목표 지향적

Cluster B: "감정 역동형"
  mid valence, high arousal, high approach, high entropy
  → 감정이 풍부하고 역동적, 에너지 높음
  → "고에너지를 병리화하지 않는다" 원칙이 적용되는 그룹

Cluster C: "내향적 성찰형"
  mid valence, low arousal, mid approach, mid entropy
  → 차분하고 성찰적, 감정 표현이 절제됨

Cluster D: "불안 회피형"
  low valence, high arousal, low approach, high entropy
  → 부정적이고 각성 높고 회피 경향 + 감정 복잡
  → SLIP soft 대상이 될 가능성 높음

Cluster E: "감정 평탄형"
  low valence, low arousal, low approach, low entropy
  → 무기력, 단조로움
  → SLIP 우울 패턴 감지 대상
```

### 학술적 의미

이건 기존 심리학의 성격/기질 유형론(Big Five, MBTI 등)과 다른 접근:
- **사후적 분류가 아닌 데이터 기반 발견**
- **자기보고가 아닌 행동(글쓰기) 기반**
- **고정된 성격이 아닌 기간별 변동 가능한 감정 상태**
- **프라이버시 보존 — 원문 없이 파라미터만으로 클러스터링**

이 클러스터가 안정적으로 재현되면 **"Emergent Emotional Phenotypes from Privacy-Preserving Longitudinal Data"** 논문이 된다 (Paper E).

---

## 6. tier_m(크기) × z축(방향) 분리의 의미

### 논문에서의 정의

- **tier_m**: 서사 역동성의 강도. 방향 무관. "얼마나 많은 에너지가 글에 담겨있나"
- **z축 (approach-avoidance)**: 그 에너지의 방향. "접근하는 에너지인가, 회피하는 에너지인가"

### 이 분리가 해결하는 문제

기존 감정 분석 시스템의 최대 문제: **고에너지 = 위험?**

```
Case 1: tier_m = 4.5, z = 0.9
  → 높은 에너지 + 강한 접근 동기
  → 크리에이티브 플로우, 열정적 프로젝트 몰입
  → SLIP: none (정상)

Case 2: tier_m = 4.5, z = 0.2
  → 높은 에너지 + 강한 회피 동기
  → 도피적 몰입, 현실 회피, 강박적 반복
  → SLIP: soft (관찰 필요)

Case 3: tier_m = 4.5, z = 0.5 + tier_a = 4.5
  → 높은 에너지 + 중립 방향 + 높은 감정 강도
  → 경조증 가능성 — Stage 3 AI 맥락 분석 필요
```

기존 시스템은 Case 1, 2, 3을 모두 "위험"으로 분류했을 것이다.
HUA는 z축으로 방향을 구분하고, Stage 3 AI로 맥락을 확인한다.

### 시계열에서의 tier_m × z축 패턴

```
건강한 몰입 (flow):
  tier_m: 높음, z: 높음 → 지속
  → tier_m이 내려오면 z도 자연스럽게 내려옴 (정상 이완)

경조증 의심:
  tier_m: 높음, z: 불안정 (높다 낮다 반복)
  → tier_m은 높은데 z가 요동 → 에너지는 넘치지만 방향 못 잡음

번아웃 전조:
  tier_m: 높음 → 점진적 하락, z: 높음 → 급격히 하락
  → 에너지가 빠지기 전에 방향(동기)이 먼저 사라짐
```

---

## 7. ETHICS 커스텀 태그 진화 = Computational Grounded Theory

### 현재 구조

```
12 predefined tags:
  Positive: growth, reflection, connection, stability, resilience, tenderness
  Negative: loneliness, anxiety, conflict, exhaustion, uncertainty, overwhelm

+ 1-2 custom tags per entry (AI 생성):
  예: "micro-joy", "quiet-grief", "self-care", "creative-flow", "nostalgia"
```

### 진화 메커니즘

```
1. AI가 사용자 글에서 커스텀 태그 생성
   → "quiet-grief", "silent-mourning", "muted-sorrow"

2. 시맨틱 유사도 클러스터링
   → "quiet-grief" ≈ "silent-mourning" ≈ "muted-sorrow" → 하나의 클러스터

3. 빈도 분석
   → 이 클러스터가 N번 이상 출현

4. 승격 판단
   → "quiet-grief"가 predefined 태그로 승격 후보

5. 분류 체계 진화
   → v2: 14 predefined tags (기존 12 + quiet-grief + creative-flow)
```

### 이것이 Grounded Theory인 이유

질적 연구의 Grounded Theory (Glaser & Strauss, 1967):
1. 데이터에서 개념(코드)을 추출 → AI의 커스텀 태그 생성
2. 유사 개념을 범주로 묶음 → 시맨틱 클러스터링
3. 범주가 포화되면 이론화 → 빈도 높은 클러스터 → predefined 승격
4. 지속적 비교법 → 매 entry마다 새 태그 vs 기존 태그 비교

**차이점: 이걸 사람이 수동으로 하는 게 아니라 AI가 대규모로 자동 수행한다.**

### 학술적 기여

- "Computationally-Augmented Grounded Theory" 방법론 제안
- 기존의 수동 코딩(노동 집약적) vs AI 자동 코딩(확장 가능) 비교
- 커스텀 태그 분포 자체가 "사람들이 경험하지만 기존 분류에 없는 감정"을 보여줌
- 예: "quiet-grief"는 DSM이나 기존 감정 분류에 없는 개념 — 데이터가 스스로 발견

---

## 8. Dual-Coding Architecture의 연구 방법론적 의미

### 구조

```
원본 일기 (암호화, 사용자만 접근)
     │
     ├──→ Phase 1 (질적): 감응 분석, 장면, 감정 흐름
     │     → 사용자에게 돌려줌 → 암호화 저장
     │     → 연구 접근 불가
     │
     └──→ Phase 2 (양적): 익명화 → 좌표, entropy, transitions
           → 평문 저장
           → 연구 분석 가능
```

### 이것이 새로운 이유

기존 Mixed Methods 연구:
- 같은 데이터를 연구자가 질적 + 양적으로 이중 분석
- 수동, 노동 집약적, 소규모 (N=20-50이 한계)
- 프라이버시 문제 → 데이터 접근 제한적

HUA Dual-Coding:
- 같은 데이터를 AI가 자동으로 질적 + 양적 이중 분석
- 자동, 확장 가능, 대규모 (N 무제한)
- 프라이버시 보존 → 질적 결과는 사용자에게만, 양적 파라미터만 연구용

### 핵심: 두 분석의 목적이 다르다

| | Phase 1 (질적) | Phase 2 (양적) |
|---|---|---|
| 목적 | 사용자 경험 | 연구 데이터 |
| 대상 | 사용자 | 연구자/시스템 |
| 저장 | 암호화 | 평문 (파라미터) |
| 원문 접근 | 사용자만 | 불가 (익명화 후 폐기) |
| AI 모델 | Gemini 2.5 Flash (품질 우선) | GPT-4o-mini (일관성+비용) |

이 분리 덕분에:
- 사용자 경험을 해치지 않으면서 연구 데이터 수집 가능
- 연구 윤리 문제 최소화 (원문 없음, 파라미터만)
- 두 분석이 서로를 오염시키지 않음

---

## 9. 크로스 프로덕트 데이터 Enrichment

### 숨다이어리 × 마이력서

두 서비스가 같은 사용자 ID를 공유하면 (동의 하에):

```
숨다이어리: 감정 시계열 데이터
  [date, valence, arousal, approach, entropy, ...]

마이력서: 커리어 이벤트 데이터
  [date, event_type: '이직'|'승진'|'퇴사'|'입사', company, role]
```

### 가능한 분석

**1. 커리어 이벤트 × 감정 변화 상관관계**
```
"이직 전 30일간 approach_avoidance 평균 변화"
  → 이직 결정 전에 회피 동기가 먼저 올라가는지?
  → 이직 후 감정 궤적은 어떻게 변하는지?
```

**2. 직무 만족도의 감정 지표**
```
"특정 회사/직무 재직 중 valence × entropy 패턴"
  → 낮은 valence + 낮은 entropy = 만족 없는 단조로움
  → 높은 valence + 높은 entropy = 도전적이지만 만족
```

**3. 번아웃 예측**
```
"경력 기간 × tier_m × approach_avoidance 하강 곡선"
  → 재직 기간이 길어질수록 에너지와 접근 동기가 하락하는 패턴
  → 특정 threshold 이하 = 이직 시기 제안
```

### 이것이 가능한 이유

- 감정 데이터는 파라미터 (원문 아님) → 프라이버시 보존
- 커리어 데이터는 구조화된 메타데이터 (이름/회사 외 날짜+이벤트)
- 상관관계 분석은 집계 레벨 → 개인 식별 불가
- **두 서비스를 같은 플랫폼에서 운영하는 사람만 할 수 있음**

---

## 10. Emotion API로 가는 길

### Phase 1: 내부 활용 (현재)
```
숨다이어리 내에서 SLIP + ETHICS + 2차 분석 운용
→ 파라미터 축적
→ 기저선 형성
```

### Phase 2: 스키마 표준화 (Paper C/D 이후)
```
파라미터 스키마를 공개:
{
  coordinates: { valence, arousal, approach_avoidance },
  complexity: { entropy, density, transitions },
  narrative: { tier_a, tier_m, sentiment },
  context: { ethics_tags[], dominant_emotion }
}

→ 다른 멘탈헬스 앱이 이 스키마를 채택할 수 있게
→ "감정 데이터의 FHIR(의료 데이터 표준)" 포지션
```

### Phase 3: API 공개 (데이터 충분 시)
```typescript
import { EmotionAnalyzer } from '@hua-labs/emotion'

const result = await EmotionAnalyzer.analyze(anonymizedText)
// {
//   coordinates: { valence: 0.35, arousal: 0.62, approach: 0.71 },
//   entropy: 0.45,
//   density: 0.38,
//   transitions: 2,
//   dominant_emotion: "기대",
//   ethics: ["growth", "micro-joy"],
//   tier_a: 3.2,
//   tier_m: 3.8
// }
```

### Phase 4: 감정 인식 앱 생태계
```
HUA 프레임워크로 만든 앱
  → @hua-labs/emotion 플러그인 추가
    → 사용자 텍스트 감정 분석 자동화
      → 교육, 상담, HR, 커머스 어디든

데이터 → 모델 개선 → 더 나은 분석 → 더 많은 앱 → 더 많은 데이터
  = 데이터 플라이휠
```

---

## 11. 타임라인 정리

```
현재 (2026)
  ├─ 파라미터 축적 중
  ├─ Paper B: SLIP & ETHICS 프레임워크 검증
  ├─ Paper A: Resonance 개념 정립
  └─ 스키마 안정화

6개월 후
  ├─ 개인별 baseline 형성 가능 (활성 사용자 기준)
  ├─ SLIP에 개인 편차 기반 threshold 추가 검토
  └─ 커스텀 태그 클러스터 1차 분석

1년 후
  ├─ 모집단 가우시안 형성
  ├─ 비지도 클러스터링 → 감정 유형 발견
  ├─ Paper D: 방법론 검증
  └─ Paper C: 3D 감정 모델 + entropy/density 기여

2년 후
  ├─ 시계열 예측 모델 시도
  ├─ z축 선행 지표 가설 검증
  ├─ 크로스 프로덕트 enrichment (MYR 런칭 후)
  ├─ Paper E: Longitudinal Validation
  └─ Emotion Schema 표준 제안

3년 후
  ├─ Emotion API 공개
  ├─ HUA 에코시스템 통합
  └─ 데이터 플라이휠 시작
```

---

## 12. 열린 질문들

향후 연구/개발에서 답해야 할 질문:

1. **z축 선행 지표 가설**: approach-avoidance 하락이 실제로 valence 하락을 선행하는가?
2. **개인 기저선 안정성**: 30일 이동평균이 안정적인 기저선을 제공하는가? 계절 변동은?
3. **클러스터 안정성**: 감정 유형 클러스터가 시간이 지나도 재현되는가?
4. **AI 분석 일관성**: 같은 텍스트에 대해 반복 분석 시 파라미터가 얼마나 일치하는가?
5. **문화적 차이**: 한국어/영어/일본어 분석 간 파라미터 분포 차이는?
6. **content_length 효과**: 짧은 일기 vs 긴 일기에서 파라미터 신뢰도 차이는?
7. **커스텀 태그 포화**: 태그가 충분히 모이면 predefined으로 승격하는 기준은?
8. **SLIP 개인화**: 개인 기저선 기반 threshold가 절대 threshold보다 효과적인가?
9. **크로스 프로덕트 동의 설계**: 감정 × 커리어 데이터 연결에 대한 사용자 동의 UX는?
10. **재식별 위험**: 6차원 감정 벡터 시계열만으로 개인 특정이 가능한가?

---

## 13. 양의 피드백 루프 — 사용자 경험 = 데이터 품질

### 자기강화 루프

```
사용자가 쓴다
  → AI가 공명한다 (100% 정확하지 않아도 됨)
    → 사용자: "아 그런 면도 있네" / "그렇게 볼 수도 있구나"
      → 다음에 더 자세히, 더 솔직하게 쓴다
        → content_length ↑, confidence ↑, 파라미터 정밀도 ↑
          → 더 나은 공명
            → 더 깊이 쓴다...
```

**AI가 완벽하지 않아서 오히려 작동하는 구조.**
- 100% 맞추면 → "읽혔다"는 느낌 (감시, 불쾌)
- 70% 맞추면 → "그런 면도 있네" (성찰, 자기이해)
- 사용자가 나머지 30%를 채우려고 더 쓴다

이건 resonance의 정의 그 자체:
> AI가 사용자를 "이해"하는 게 아니라, 사용자가 AI의 공명을 보면서 **자기 자신을 이해**하게 된다.
> 거울은 너를 이해 안 해. 근데 거울 보면 너를 알게 되잖아.

### 데이터 플라이휠과의 연결

이 루프가 돌수록:
- 사용자: 더 깊은 자기 이해 → 서비스 유지율 ↑
- 데이터: content_length ↑, confidence ↑ → 파라미터 품질 ↑ → 모델 정밀도 ↑
- 사업: 사용자 경험 향상과 데이터 품질 향상이 같은 방향

**사용자가 스스로 데이터 품질을 올려주는 구조** — 별도의 데이터 수집 노력 없이 제품 사용 자체가 데이터 정제 과정.

### 슬로건 후보

| 슬로건 | 특징 |
|--------|------|
| **"쓸수록 나를 알게 됩니다"** | 6글자. 루프의 본질. 간결 |
| "매일 쓰면, 나를 읽게 됩니다" | 쓰기→읽기 전환. 능동→수동 |
| "AI가 나보다 나를 잘 아는 시대, 나만 나를 모르면 안 되니까" | 시대적 맥락. 길지만 강렬 |
| "기록은 잊혀져도, 감정은 남습니다" | 감성적. 숨다이어리의 프라이버시 철학 |
| "오늘의 나를, 내일의 내가 이해할 수 있도록" | 시간축 강조 |

---

## 14. Closer 모드 — Distanced Empathy의 스펙트럼

### 맥락

"너무 데이터적이다"는 피드백 → 기본 모드(distanced)가 분석적으로 느껴지는 사용자 존재
→ **Closer 모드**: distanced empathy가 약간 누그러진, "내 편 들어주는" 모드

### 학술적 의미

논문에서 distanced empathy를 하나의 고정된 입장으로 제시했는데,
실제로는 **스펙트럼**이 있다는 발견:

```
← distanced ─────────────────── closer →
   분석적, 관찰자적              공감적, 동반자적
   "이런 감정이 보입니다"        "그랬구나, 힘들었겠다"
   HUA_BEHAVIOR_DISTANCED        HUA_BEHAVIOR_CLOSER
```

이건 Paper A (Resonance) 리빌드할 때 중요한 포인트:
- 기존: "distanced empathy = 하나의 해답"
- 수정: "distanced empathy는 스펙트럼이며, 사용자가 선택할 수 있어야 한다"
- → **사용자 에이전시(agency)** 강화 — 네 논문의 핵심 가치와 일치

### 디자인 임플리케이션

1. **기본값은 distanced가 맞다** — 안전하고, 과의존 방지, 경계 유지
2. **Closer는 opt-in** — 사용자가 의식적으로 선택
3. **Closer에서도 slip/ethics는 동일하게 작동** — 경계는 유지
4. **Closer 모드의 위험**: parasocial attachment 증가 가능
   → 사용 빈도 모니터링, 장기 closer-only 사용자 패턴 관찰 필요

### 데이터 관점

Closer 모드 사용 여부 자체가 의미 있는 파라미터:
- closer 선택 빈도 → 정서적 지지 욕구의 프록시
- distanced → closer 전환 시점 → 감정적으로 힘든 시기일 가능성
- 지속적 closer 사용 → 의존성 모니터링 대상

→ 모드 선택 로그도 메타데이터로 축적하면 추가 차원의 분석 가능

### 열린 질문

- Closer 모드에서 tier_a/tier_m 분포가 달라지는가?
- Closer 모드 사용 후 다음 일기의 content_length가 변하는가?
- Closer ↔ Distanced 전환 패턴이 감정 궤적과 상관있는가?

---

## 연관 문서

- [Paper Roadmap 2026](./paper-roadmap-2026.md)
- [SLIP & ETHICS Draft](file:///c:/Users/echon/Downloads/SLIP%20&%20ETHICS_draft.md)
- [Resonance Without Memory](file:///d:/HUA/my-docs/1-Project/HUA-PAPER/Resonance%20Without%20Memory-en.md)
- [MYR Revival Plan](./myr-revival-plan.md)
