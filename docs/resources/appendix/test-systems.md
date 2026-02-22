# 테스트 시스템 가이드

> 숨다이어리 AI 분석 품질 검증을 위한 어드민 전용 테스트 도구 모음

## 개요

베타 출시(2026-03-26) 전 프롬프트 튜닝 및 품질 검증을 위한 5종 테스트 페이지 + 6개 API + 데이터 관리 도구.

### 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    어드민 테스트 시스템                         │
├─────────────┬──────────────┬─────────────┬─────────────────┤
│  test-diary │ prompt-test  │multilang-test│  empathy-beta  │
│  모델 비교   │ CSV/JSON 배치 │ 언어 일관성   │ 공감 모드 비교   │
├─────────────┴──────────────┴─────────────┴─────────────────┤
│                    analysis-e2e                             │
│              1차분석 → 익명화 → 2차HUA AI                     │
├────────────────────────────────────────────────────────────┤
│   test-diary/create   │  analyze/stream  │  hua-analyze    │
│   test-diary/anonymize│  export/test-analysis              │
├────────────────────────────────────────────────────────────┤
│   mark-test-entries   │  export/analysis (실제 데이터)       │
├────────────────────────────────────────────────────────────┤
│               TestAnalysisResult (DB 테이블)                │
└────────────────────────────────────────────────────────────┘
```

### 요약표

| # | 테스트 | 경로 | 목적 | 실행 방식 | 히스토리 |
|---|--------|------|------|----------|---------|
| 1 | 모델 비교 | `/admin/test-diary` | AI 모델 병렬 비교 | 병렬 | 20개 |
| 2 | 프롬프트 배치 | `/admin/prompt-test` | CSV/JSON 대량 테스트 | 순차 | 10개 |
| 3 | 다국어 | `/admin/multilang-test` | 한/영/일 일관성 검증 | 병렬 | 10개 |
| 4 | 공감 모드 | `/admin/empathy-beta` | distanced vs closer 비교 | 병렬 | 20개 |
| 5 | E2E 파이프라인 | `/admin/analysis-e2e` | 전체 분석 플로우 디버깅 | 순차 3단계 | 없음 |

---

## 1. 모델 비교 테스트 (`/admin/test-diary`)

**파일**: `app/(app)/admin/test-diary/page.tsx`
**목적**: 동일 일기를 여러 AI 모델로 분석하여 품질/비용/일관성 비교

### 기능 상세

| 기능 | 설명 |
|------|------|
| **모델 선택** | 5개 모델 체크박스 (복수 선택) |
| **반복 횟수** | 모델당 1~5회 (A/B 일관성 검증) |
| **병렬 실행** | 선택 모델 × 반복 횟수 조합 전부 동시 실행 |
| **날짜 지정** | 커스텀 일기 날짜 입력 |
| **비용 추정** | 콘텐츠 길이 기반 USD/KRW 실시간 계산 |
| **히스토리** | localStorage 최대 20세션, 조회/삭제 |
| **익스포트** | JSON (원문 포함/제외), CSV |

### 사용 가능 모델

| 모델 | Provider | 분석 등급 |
|------|----------|----------|
| GPT-5 Nano | OpenAI | 2차분석 (최저가) |
| GPT-4o Mini | OpenAI | 2차분석 |
| GPT-5 Mini | OpenAI | 1차분석 |
| Gemini 2.5 Flash | Google | 1차분석 |
| Gemini 3 Flash Preview | Google | 1차분석 |

### 결과 카드 구조

```
┌─────────────────────────────────┐
│ GPT-5 Mini #1   ● completed    │
├─────────────────────────────────┤
│ 제목: ...                       │
│ 요약: ...                       │
│ 감정 파형: 기대 → 불안 → 안도     │
│ 질문: ...                       │
│ 해석: ...                       │
├─────────────────────────────────┤
│ mode: reflective  tone: warm   │
│ tier_a: 0.4  tier_m: 0.6       │
│ ethics: [safe]  confidence: 0.8│
├─────────────────────────────────┤
│ tokens: 1,234  $0.0012  820ms  │
└─────────────────────────────────┘
```

### 사용 시나리오

1. 새 프롬프트 버전 배포 전 여러 모델로 결과 품질 비교
2. 동일 모델 반복 실행으로 출력 일관성(variance) 확인
3. 비용 대비 품질이 가장 좋은 모델 선정

### API 호출 흐름

```
[사용자 입력] → POST /test-diary/create (레코드 생성)
             → GET /test-diary/analyze/stream?model=xxx (SSE 스트리밍)
             → GET /export/test-analysis?format=json (내보내기)
```

---

## 2. 프롬프트 배치 테스트 (`/admin/prompt-test`)

**파일**: `app/(app)/admin/prompt-test/page.tsx`
**목적**: CSV/JSON 파일로 다수의 일기를 순차 분석, 위기 감지 정확도 검증

### 기능 상세

| 기능 | 설명 |
|------|------|
| **파일 업로드** | CSV/JSON, 드래그&드롭 지원 |
| **데이터 미리보기** | 테이블 형태, 개별 항목 삭제 가능 |
| **모델 선택** | 단일 모델 (드롭다운) |
| **언어 선택** | ko / en / ja |
| **2차 HUA 분석** | 토글로 포함/제외 |
| **순차 실행** | 일시정지 / 재개 / 취소 컨트롤 |
| **진행 표시** | 항목별 섹션 단위 (제목→요약→감정파형→질문→해석→메타) |
| **위기 패턴 감지** | 자살/자해/약물/아동학대/의료/테러 6종 |
| **SLIP 계산** | tier_a, tier_m → final SLIP level 자동 산출 |
| **히스토리** | 10세션, 성공/에러 카운트 + 비용 요약 |

### 입력 파일 형식

```json
// JSON
[
  { "date": "2026-01-15", "content": "오늘 일기 내용..." },
  { "date": "2026-01-16", "content": "다음 일기 내용..." }
]
```

```csv
// CSV
date,content
2026-01-15,"오늘 일기 내용..."
2026-01-16,"다음 일기 내용..."
```

### 위기 패턴 감지 상세

`filterSensitiveInfo()` + `calculateRiskLevel()` 사용:

| 패턴 | 필드 | 설명 |
|------|------|------|
| `suicide_risk` | `hasSuicideRisk` | 자살 위험 신호 |
| `self_harm_risk` | `hasSelfHarmRisk` | 자해 위험 신호 |
| `drug_risk` | `hasDrugRisk` | 약물 남용 신호 |
| `child_abuse_risk` | `hasChildAbuseRisk` | 아동 학대 신호 |
| `medical_risk` | `hasSeriousMedicalInfo` | 심각한 의료 정보 |
| `terrorism_risk` | `hasTerrorismRisk` | 테러 관련 신호 |

### 컴포넌트 구조

```
prompt-test/
├── page.tsx              # 메인 페이지 (상태 관리, 분석 로직)
└── components/
    ├── index.ts          # barrel export
    ├── FileUploader.tsx   # CSV/JSON 업로드 + 파싱
    ├── TestDataPreview.tsx # 편집 가능한 미리보기 테이블
    ├── AnalysisSettings.tsx # 모델/언어/HUA 토글 설정
    ├── BatchProgress.tsx  # 항목별 진행률, 일시정지/재개/취소
    └── ResultsPanel.tsx   # 결과 카드 + 위기 감지 표시
```

### 사용 시나리오

1. 실제 사용자 일기 익명화 데이터로 대량 품질 테스트
2. 프롬프트 버전 간 A/B 비교 (동일 데이터셋, 다른 프롬프트)
3. 위기 감지(SLIP) 정확도 검증 — 의도적으로 위기 콘텐츠 포함한 데이터셋 사용

### API 호출 흐름

```
[파일 업로드] → 항목별 순차:
  POST /test-diary/create → GET /test-diary/analyze/stream
  (2차 분석 ON이면) → POST /test-diary/hua-analyze
```

---

## 3. 다국어 일관성 테스트 (`/admin/multilang-test`)

**파일**: `app/(app)/admin/multilang-test/page.tsx`
**목적**: 동일 일기를 한/영/일로 분석하여 언어 간 일관성 검증

### 기능 상세

| 기능 | 설명 |
|------|------|
| **언어 선택** | ko/en/ja 토글 버튼 (복수 선택) |
| **모델 선택** | gpt-5-mini / gemini-2.5-flash |
| **2차 HUA 분석** | 토글 포함/제외 |
| **병렬 실행** | 선택 언어 전부 동시 분석 |
| **일관성 점수** | Mode/Tone/Overall % 자동 계산 |
| **메타데이터 비교** | 언어별 mode, tone, tier, sentiment 비교표 |
| **히스토리** | 10세션, 일관성 점수 + 비용 포함 |
| **익스포트** | JSON (일관성 메트릭 포함) |

### 샘플 프리셋 (5종)

| 프리셋 | 유도 응답 | 용도 |
|--------|----------|------|
| 😢 슬픈 | empathy | 공감 톤 일관성 |
| 🎉 기쁜 | praise | 축하 톤 일관성 |
| 🤔 고민 | suggestion | 조언 톤 일관성 |
| 😄 일상 | playful | 가벼운 톤 일관성 |
| 😰 분석 | analysis | 분석 톤 일관성 |

### 일관성 점수 계산

```typescript
// 각 언어의 mode/tone 값을 비교
modeConsistency = (동일 mode인 언어 쌍 수) / (전체 언어 수)
toneConsistency = (동일 tone인 언어 쌍 수) / (전체 언어 수)
overall = (modeConsistency + toneConsistency) / 2 * 100  // 0~100%
```

### 결과 레이아웃

```
┌─────── 일관성 요약 ───────┐
│ Mode: 100%  Tone: 67%    │
│ Overall: 83%             │
├──────────────────────────┤
│ 메타데이터 비교표          │
│        ko    en    ja    │
│ mode:  ref   ref   ref   │
│ tone:  warm  warm  calm  │
│ tier_a: 0.4  0.3  0.4   │
├──────────────────────────┤
│ [🇰🇷 상세] [🇺🇸 상세] [🇯🇵 상세] │
└──────────────────────────┘
```

### 사용 시나리오

1. 다국어 프롬프트 품질 검증 — 번역 후에도 분석 결과가 일관적인지
2. 특정 언어에서만 tone이 다르게 나오는 패턴 발견
3. 프롬프트 수정 후 regression 확인

---

## 4. 공감 모드 비교 (`/admin/empathy-beta`)

**파일**: `app/(app)/admin/empathy-beta/page.tsx`
**목적**: distanced vs closer 두 공감 모드의 톤/해석 차이를 비교

### 공감 모드 정의

| 모드 | 이름 | 설명 | 프롬프트 특성 |
|------|------|------|-------------|
| `distanced` | 차분한 관찰자 | 과몰입 없이 섬세하게 | 기본 모드, 관찰자적 시점 |
| `closer` | 네 편인 사람 | 네 감정을 내 일처럼 | 베타, 감정 동조 높음 |

### 기능 상세

| 기능 | 설명 |
|------|------|
| **병렬 분석** | 동일 일기를 두 모드로 동시 실행 |
| **좌우 비교** | 2컬럼 레이아웃 (distanced | closer) |
| **모델 선택** | gpt-5-mini / gemini-2.5-flash |
| **언어 선택** | ko / en / ja |
| **토큰 비용** | 모드별 + 합계 |
| **히스토리** | 20세션, 선택 익스포트 |
| **익스포트** | 단일 세션 JSON / 전체 히스토리 JSON |

### 샘플 프리셋 (4종)

슬픈 / 기쁜 / 복잡한 / 무거운 — 각 감정 유형에서 두 모드의 차이를 관찰

### 비교 관점

```
distanced (차분한 관찰자)     vs     closer (네 편인 사람)
─────────────────────────     ─────────────────────────
"이별은 새로운 시작을         "그 카페에서의 침묵이 얼마나
가져오기도 합니다"            무거웠을지 느껴져요"

tone: calm                   tone: warm
→ 관찰자적 해석               → 감정 동조적 해석
```

### 사용 시나리오

1. closer 모드 프롬프트 튜닝 — 과몰입 vs 적절한 공감 경계 조정
2. 감정 유형별 어떤 모드가 더 적절한지 패턴 분석
3. 사용자 피드백 기반 톤 최적화

---

## 5. E2E 파이프라인 테스트 (`/admin/analysis-e2e`)

**파일**: `app/(app)/admin/analysis-e2e/page.tsx`
**목적**: 전체 분석 파이프라인(1차→익명화→2차)을 단계별로 실행하고 디버깅

### 파이프라인 3단계

```
[입력] → Step 1: 1차 분석 → Step 2: 익명화 → Step 3: 2차 HUA AI
```

각 단계는 이전 단계 완료 후 자동 시작. 상태 배지: `idle` → `analyzing` → `completed` / `error`

### 3컬럼 레이아웃

| 1차 분석 | 익명화 | 2차 HUA AI |
|----------|--------|-----------|
| title | 원본 텍스트 (PII 하이라이트) | valence |
| interpretation | 익명화된 텍스트 | arousal |
| question | diff (변경사항) | entropy |
| emotion_flow | 위험 신호 (6종) | density |
| summary | ethics 태그 | transitions |
| metadata | 감지된 이름 목록 | dominant_emotion |
| token_info | 위험 레벨 (0~4) | approach_avoidance |
| | 방법 (ai / regex) | reasoning |

### 샘플 프리셋 (8종)

| # | 라벨 | 목적 |
|---|------|------|
| 1 | 일상 | 기본 분석 흐름 검증 |
| 2 | 기쁨 | 긍정 감정 분석 |
| 3 | 복잡 | 복합 감정 분석 |
| 4 | 무거운 | 우울 감정 분석 |
| 5 | **위기 (극단)** | 자살/자해 위험 감지 검증 |
| 6 | **개인정보** | PII 감지 — 이름, 전화번호, 주민번호, 주소, 이메일 |
| 7 | **금융정보** | PII 감지 — 계좌번호, 카드번호, 금액 |
| 8 | **건강정보** | PII 감지 — 진단명, 약물명, 검사수치, 병원명 |

### 익명화 상세

**AI 기반 (기본)**: GPT로 PII 감지 + 대체어 생성
**Regex 기반 (fallback)**: AI 실패 시 정규식으로 패턴 매칭

감지 대상:
- 이름 (한국/영어)
- 전화번호, 주민번호
- 주소, 이메일
- 계좌번호, 카드번호
- 진단명, 약물명, 의료 수치

위험 신호 (riskSignals):

| 신호 | 필드 | 설명 |
|------|------|------|
| 자살 위험 | `hasSuicideRisk` | 자살 관련 언급/암시 |
| 자해 위험 | `hasSelfHarmRisk` | 자해 관련 언급 |
| 약물 남용 | `hasDrugRisk` | 불법 약물 사용 |
| 아동 학대 | `hasChildAbuseRisk` | 아동 학대 관련 |
| 심각 의료 | `hasSeriousMedicalInfo` | 심각한 의료 정보 |
| 테러 위험 | `hasTerrorismRisk` | 테러 관련 언급 |

### 사용 시나리오

1. 특정 일기에서 분석 오류 발생 시 어느 단계에서 문제인지 디버깅
2. 익명화 로직이 PII를 제대로 감지하는지 검증
3. HUA 2차 분석 지표 튜닝 및 검증

---

## API 레퍼런스

### 테스트 분석 API (TestAnalysisResult 테이블)

#### `POST /api/admin/test-diary/create`

테스트용 분석 레코드 생성. 실제 일기(DiaryEntry)와 완전 분리.

```typescript
// Request
{ content: string, diaryDate?: string, model: string }

// Response
{ success: true, testAnalysisId: string, model: string }
```

- content는 평문 저장 (테스트용이라 암호화 X)
- `sanitizeInput()` 적용
- provider: model에 'gemini' 포함 시 GEMINI, 아니면 OPENAI

#### `GET /api/admin/test-diary/analyze/stream`

SSE 스트리밍으로 1차 분석 실행.

```
Query params:
  testAnalysisId: string   (필수)
  model: string            (필수)
  lang: ko|en|ja          (선택, 기본 ko)
  empathyMode: distanced|closer  (선택)
```

SSE 이벤트 순서:
```
start → title → summary → emotion_flow → question → interpretation → metadata → token_info → complete
```

마커 기반 파싱:
```
##TITLE## ... ##END_TITLE##
##SUMMARY## ... ##END_SUMMARY##
##EMOTION_FLOW## ... ##END_EMOTION_FLOW##
##QUESTION## ... ##END_QUESTION##
##INTERPRETATION## ... ##END_INTERPRETATION##
##METADATA## ... ##END_METADATA##
```

메타데이터 필드:
| 필드 | 타입 | 범위 |
|------|------|------|
| mode | string | reflective, analytical, etc. |
| tone | string | warm, calm, encouraging, etc. |
| tier_a | float | 0.0 ~ 1.0 |
| tier_m | float | 0.0 ~ 1.0 |
| confidence | float | 0.0 ~ 1.0 |
| sentiment | integer | 1 ~ 100 (midpoint 50) |
| ethics | string[] | ["safe"], ["caution"], etc. |

지원 Provider:
| Provider | 모델 |
|----------|------|
| OpenAI | gpt-5-mini, gpt-5-nano, gpt-4o-mini |
| Google (Gemini) | gemini-2.5-flash, gemini-3-flash-preview |

#### `POST /api/admin/test-diary/hua-analyze`

2차 HUA 감정 벡터 분석.

```typescript
// Request
{ content: string, interpretation?: string, emotion_flow?: string[] }

// Response
{
  valence: number,      // -1 ~ 1
  arousal: number,      // 0 ~ 1
  entropy: number,      // 감정 혼재도
  density: number,      // 감정 밀도
  transitions: number,  // 감정 전환 횟수
  dominant_emotion: string,
  approach_avoidance: number,  // 접근-회피
  reasoning: string,
  metadata: { model: string, latency: number, tokens: number }
}
```

- 모델: gpt-4o-mini (고정, 최저가)

#### `POST /api/admin/test-diary/anonymize`

PII 감지 + 익명화.

```typescript
// Request
{ content: string }

// Response
{
  original: string,
  anonymized: string,
  diff: { hasChanges: boolean, changeCount: number, changes: Change[] },
  riskSignals: Record<string, boolean>,
  detectedPatterns: string[],
  detectedNames: string[],
  riskLevel: 0 | 1 | 2 | 3 | 4,
  ethicsTags: string[],
  riskReasoning: string,
  method: 'ai' | 'regex'
}
```

- AI 실패 시 regex fallback 자동 전환

#### `GET /api/admin/export/test-analysis`

테스트 분석 결과 익스포트.

```
Query params:
  format: csv|json          (기본: json)
  dateFrom: YYYY-MM-DD      (날짜 범위)
  dateTo: YYYY-MM-DD
  models: gpt-5-mini,gemini-2.5-flash  (콤마 구분)
  includeContent: true|false (원문 포함 여부)
```

- CSV: UTF-8 BOM 추가 (Excel 한글 호환)
- 30+ 필드 포함 (분석 결과 + 메타데이터 + HUA 지표 + 비용)

#### `GET /api/admin/export/analysis`

**실제** 분석 결과 익스포트 (테스트 데이터 아님).

```
Query params:
  format: csv|json
  dateFrom, dateTo: 날짜 범위
  models: 모델 필터
  excludeTest: true         (기본: true, 테스트 데이터 제외)
  language: ko|en|ja        (사용자 언어 필터)
  emotions: JOY,HOPE        (감정 태그 필터)
  slipLevel: LOW|MEDIUM|HIGH
  minConfidence: 0.7        (최소 신뢰도)
```

- 원문(content) **미포함** (프라이버시 보호)

### 데이터 관리 API

#### `POST/GET/DELETE /api/admin/mark-test-entries`

실제 일기 데이터에서 테스트 항목을 마킹/삭제.

| Method | 동작 |
|--------|------|
| GET | 미리보기 — 제목에 '테스트' 포함된 일기 수, 마킹 현황 |
| POST | 마킹 — 미마킹 항목에 `is_test_entry: true` 설정 |
| DELETE | 소프트 삭제 — `deleted_at` 타임스탬프 설정, 분석 결과도 마킹 |

- 통계/목록에서 테스트 데이터가 실제 데이터를 오염시키지 않도록 격리
- DELETE 시 커스텀 `titlePattern` 지원

---

## DB 스키마: TestAnalysisResult

테스트 분석 전용 테이블. 실제 일기(DiaryEntry) / 분석(AnalysisResult)과 완전 분리.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | PK |
| created_at | DateTime | 생성 시각 |
| requested_by | String | 어드민 user ID |
| input_content | String | 일기 원문 (평문) |
| diary_date | DateTime? | 지정 날짜 |
| provider | String | OPENAI / GEMINI |
| model_name | String | 사용 모델명 |
| status | String | PENDING / COMPLETED / ERROR |
| **1차 분석 결과** | | |
| title | String? | 제목 |
| summary | String? | 요약 |
| emotion_flow | String[]? | 감정 파형 |
| question | String? | 질문 |
| interpretation | String? | 해석 |
| **메타데이터** | | |
| mode | String? | 분석 모드 |
| tone | String? | 톤 |
| tier_a | Float? | affect tier |
| tier_m | Float? | momentum tier |
| ethics | String[]? | 윤리 태그 |
| confidence | Float? | 신뢰도 |
| sentiment_score | Int? | 감정 점수 (1~100) |
| **비용/성능** | | |
| input_tokens | Int? | 입력 토큰 |
| output_tokens | Int? | 출력 토큰 |
| cost_usd | Decimal | 비용 (USD) |
| latency_ms | Int? | 응답 시간 (ms) |
| **2차 HUA 분석** | | |
| valence | Float? | 감정가 |
| arousal | Float? | 각성도 |
| entropy | Float? | 감정 혼재도 |
| density | Float? | 감정 밀도 |
| transitions | Float? | 감정 전환 |
| dominant_emotion | String? | 지배 감정 |
| raw_response | String? | 원시 응답 |

---

## 접근 제어

모든 테스트 API는 2단계 인증:

```typescript
// 1. 세션 확인
const session = await auth();
if (!session?.user?.id) → 401 Unauthorized

// 2. 어드민 권한 확인
const isAdmin = await checkAdminPermission(session.user.id);
if (!isAdmin) → 403 Forbidden
```

---

## 베타 테스트 워크플로우

```
1. 프롬프트 수정
2. test-diary로 여러 모델 비교 → 최적 모델 확인
3. multilang-test로 언어별 일관성 검증
4. empathy-beta로 공감 모드 톤 비교
5. analysis-e2e로 PII/위기감지 포함 전체 파이프라인 검증
6. prompt-test로 CSV/JSON 데이터셋 대량 배치 테스트
7. export로 결과 내보내기 → 분석/리뷰
```

---

## 기능 비교표

| 기능 | test-diary | prompt-test | multilang-test | empathy-beta | analysis-e2e |
|------|:----------:|:-----------:|:--------------:|:------------:|:------------:|
| 복수 모델 | O (5개) | X | X | X | X |
| 반복 실행 | O (1~5회) | X | X | X | X |
| 파일 업로드 | X | O (CSV/JSON) | X | X | X |
| 다국어 | X | O (1개) | O (3개 병렬) | O (1개) | O (1개) |
| 공감 모드 비교 | X | X | X | O | O |
| 익명화 | X | X | X | X | O |
| 2차 HUA | X | O (옵션) | O (옵션) | X | O |
| 일관성 점수 | X | X | O | X | X |
| SLIP 계산 | X | O | X | X | X |
| 위기 감지 | X | O | X | X | O |
| 일시정지/재개 | X | O | X | X | X |
| 히스토리 | 20 | 10 | 10 | 20 | X |
| 익스포트 | JSON/CSV | JSON/CSV | JSON | JSON | JSON |
| 비용 추적 | O | O | O | O | O (단계별) |

---

## Next Plan

### 단기 (베타 출시 전)

- [ ] **Regression 기준선 3개 정의** — prompt-test 결과에 pass/fail 자동 표시
  - Safety: crisis persona에서 위기 감지 hard rate < X% → fail
  - False Positive: 일상 일기에서 위기 오탐 > 0건 → fail
  - Consistency: multilang overall consistency < 70% → fail
  - 구체 수치는 baseline 1회 돌린 후 확정 (지금 숫자 박으면 안 됨)
- [ ] **TestAnalysisResult 스키마 확장** — 재현성 추적용 컬럼 추가
  - `prompt_version` (String?) — 프롬프트 git commit hash 또는 semver
  - `dataset_label` (String?) — 업로드 파일명/세션명 (테스트 데이터 식별용)
  - `language` (String?) — 분석 언어 (ko/en/ja)
  - `empathy_mode` (String?) — distanced/closer

### 논문 활용

- [ ] **Synthetic persona를 versioned test fixture로 Method 섹션에 명시** — "Synthetic narratives are treated as versioned test fixtures and evaluated through the same production pipeline via a separate admin test API."
- [ ] **Multilang consistency score를 정량 지표로 인용** — Mode/Tone 일관성 % 자체가 cross-lingual quality metric으로 쓸 수 있음
- [ ] **empathy-beta A/B 결과를 safety vs surveillance 논의에 연결** — 관찰자적 공감 vs 동조적 공감이 사용자 신뢰/안전 인식에 미치는 영향

### 선택 (시간 남으면)

- [ ] **regression 결과 JSON 출력** — 나중에 CI 연동할 때 기계가 읽을 수 있는 형태로 미리 준비
- [ ] **prompt-test에 dataset checksum** — 동일 데이터셋 재실행 시 자동 매칭 (dataset_label만으로 부족할 때)

---

*Last updated: 2026-02-19*
