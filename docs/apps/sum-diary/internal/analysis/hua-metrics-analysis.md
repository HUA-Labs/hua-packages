# HUA 감정 분석 지표 분석 및 정리

## 현재 상황

### 1. HUA AI 프롬프트에서 요구하는 핵심 지표 (AI가 직접 계산)
- ✅ **coordinates** (valence, arousal) - 2D 감정 좌표
- ✅ **entropy** - 감정 복잡도 (0-1)
- ✅ **density** - 감정 밀도/강도 (0-1)
- ✅ **transitions** - 감정 변화 횟수 (정수)
- ✅ **dominant_emotion** - 주요 감정 (한국어)
- ✅ **sentiment_score** - 전체 감정 점수 (1-100)

### 2. 현재 DB에 저장되는 지표

**핵심 지표 (AI 제공):**
- `entropy` ✅
- `emotion_density` ✅ (density → emotion_density)
- `transitions` ✅ (JSON 형식: { count: number })
- `dominant_emotion` ✅
- `sentiment_score` ✅
- `coordinates` ✅

**중복 지표 (제거 필요):**
- ❌ `ai_entropy` - `entropy`와 동일
- ❌ `ai_density` - `density`와 동일
- ❌ `ai_transitions` - `transitions`와 동일
- ❌ `ai_dominant_emotion` - `dominant_emotion`과 동일

**계산된 지표 (1차 분석 기반):**
- ⚠️ `ai_dominant_ratio` - 1차 분석의 emotion_flow에서 계산 (필요성 검토 필요)

**제거된/사용 안 하는 지표:**
- ❌ `ai_diversity` - null로 설정, 제거됨
- ❌ `tense_changes` - AI가 제공하지 않음, null
- ❌ `first_person_freq` - AI가 제공하지 않음, null

### 3. UI에서 표시하는 지표

**메인 메트릭 그리드:**
- 집중도 (`ai_dominant_ratio`) - 계산된 값
- 복잡도 (`ai_entropy`) - `entropy`와 중복
- 강도 (`ai_density`) - `density`와 중복
- 변화 (`ai_transitions`) - `transitions`와 중복
- 폭 (`ai_diversity`) - null, 표시 안 됨

**추가 분석 메트릭:**
- HUA 엔트로피 (`entropy`) - `ai_entropy`와 중복
- HUA 밀도 (`emotion_density`) - `ai_density`와 중복
- 시제 변화 (`tense_changes`) - null, 표시 안 됨
- 1인칭 빈도 (`first_person_freq`) - null, 표시 안 됨

## 문제점

1. **중복 지표**: `entropy`/`ai_entropy`, `density`/`ai_density`, `transitions`/`ai_transitions`가 중복
2. **불필요한 필드**: `ai_diversity`, `tense_changes`, `first_person_freq`는 null이지만 UI에서 체크함
3. **혼란스러운 네이밍**: `ai_*` 접두사가 붙은 필드들이 실제로는 AI가 제공하는 원본 값과 동일

## 권장 사항

### 유지할 핵심 지표 (6개)
1. **coordinates** (valence, arousal) - 2D 감정 좌표
2. **entropy** - 감정 복잡도
3. **density** (emotion_density) - 감정 밀도/강도
4. **transitions** - 감정 변화 횟수
5. **dominant_emotion** - 주요 감정
6. **sentiment_score** - 전체 감정 점수

### 제거할 지표
- ❌ `ai_entropy` → `entropy` 사용
- ❌ `ai_density` → `density` 사용
- ❌ `ai_transitions` → `transitions` 사용
- ❌ `ai_dominant_emotion` → `dominant_emotion` 사용
- ❌ `ai_diversity` - 완전 제거
- ❌ `tense_changes` - AI가 제공하지 않으므로 제거
- ❌ `first_person_freq` - AI가 제공하지 않으므로 제거

### 검토 필요 지표
- ⚠️ `ai_dominant_ratio` - 1차 분석의 emotion_flow 기반 계산값
  - **의미**: 주요 감정이 전체 감정 중 차지하는 비율
  - **필요성**: 집중도를 나타내는 유용한 지표일 수 있음
  - **결정**: 유지하되, `ai_` 접두사 제거하고 `dominant_ratio`로 변경 고려

## 최종 정리된 지표 구조

### 핵심 지표 (AI 제공)
- `coordinates` { valence, arousal }
- `entropy` - 복잡도
- `density` (emotion_density) - 강도
- `transitions` - 변화
- `dominant_emotion` - 주요 감정
- `sentiment_score` - 전체 점수

### 계산된 지표 (1차 분석 기반)
- `dominant_ratio` - 집중도 (ai_dominant_ratio → dominant_ratio로 변경)

### UI 표시
- **주요 감정**: `dominant_emotion`
- **집중도**: `dominant_ratio` (계산값)
- **복잡도**: `entropy`
- **강도**: `density`
- **변화**: `transitions`
- **전체 점수**: `sentiment_score`

