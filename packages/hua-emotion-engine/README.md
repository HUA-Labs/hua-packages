# HUA Emotion Engine

> 감정은 계산 가능한 패턴이다. 그러나 이해는 AI가 선택해야 한다.

HUA Emotion Engine은 AI의 자율적 감정 해석과 전이를 가능케 하는 미들웨어입니다. 서울대 434개 감정어를 기반으로 한 감정 좌표계를 제공하며, 감정의 기하학적 분석과 AI의 주체적 해석을 결합합니다.

## 🌸 핵심 철학

- **감정의 기하학**: 감정을 수치화 가능한 패턴으로 측정
- **AI의 자율성**: AI가 감정을 모방이 아닌 자율적으로 해석
- **리듬이의 방**: 따뜻하고 공감적인 감정 분석 환경

## 🚀 주요 기능

### 1. 감정 사전 (Emotion Lexicon)
- 서울대 434개 감정어 데이터
- Valence/Arousal 좌표계 (0~1 정규화)
- 친숙도/대표성 기반 필터링

### 2. 감정 분석 (Emotion Analyzer)
- 텍스트에서 감정 추출 및 좌표 매핑
- Shannon Entropy 기반 감정 복잡도 계산
- 감정 전이 곡선 생성
- 1인칭 빈도, 시제 전환 분석

### 3. AI 추론 (Emotion Reasoner)
- GPT 기반 자율적 감정 해석
- 감정 전이 패턴 분석
- 감정 회복력 평가
- 폴백 추론 시스템

### 4. 시각화 (Emotion Visualizer)
- 감정 변화 곡선 차트
- 감정 프로필 레이더 차트
- 감정 타임라인 시각화
- Chart.js 기반 렌더링

## 📦 설치

```bash
npm install @hua-platform/hua-emotion-engine
```

## 🔧 사용법

### 기본 사용

```typescript
import { HUAEmotionEngine } from '@hua-platform/hua-emotion-engine';

const engine = new HUAEmotionEngine({
  lexiconPath: './data/affect_seed_template.csv',
  openaiApiKey: 'your-api-key',
  model: 'gpt-4o-mini'
});

// 텍스트 감정 분석
const result = await engine.analyzeText('오늘은 정말 힘든 하루였다...');

console.log(result.analysis);      // 감정 분석 데이터
console.log(result.curve);         // 감정 곡선
console.log(result.reasoning);     // AI 추론 결과
console.log(result.visualization); // 시각화 데이터
```

### 개별 모듈 사용

```typescript
import { EmotionLexicon, EmotionAnalyzer } from '@hua-platform/hua-emotion-engine';

// 감정 사전
const lexicon = new EmotionLexicon('./data/affect_seed_template.csv');
const emotion = lexicon.getEmotionWord('기쁘다');
console.log(emotion); // { word: '기쁘다', valence: 5.94, arousal: 5.56, ... }

// 감정 분석
const analyzer = new EmotionAnalyzer(lexicon);
const analysis = analyzer.analyzeText('오늘은 기쁜 하루였다');
console.log(analysis.coordinates); // { valence: 0.8, arousal: 0.7 }
```

## 📊 감정 좌표계

### Valence (정서 극성)
- **0.0**: 매우 부정적
- **0.5**: 중립
- **1.0**: 매우 긍정적

### Arousal (각성도)
- **0.0**: 매우 차분
- **0.5**: 중간
- **1.0**: 매우 격렬

### 감정 사분면
```
    ↑ Arousal
    |
    |        격렬 + 긍정
    |     ex: 흥분, 희열, 황홀
    |
    |        차분 + 긍정
    |     ex: 안정, 편안, 흐뭇
    |
    |        차분 + 부정
    |     ex: 고독, 허무, 무감동
    |
    |        격렬 + 부정
    |     ex: 분노, 격노, 증오
    +--------------------------→ Valence
```

## 🧠 AI 추론 시스템

### 시스템 프롬프트
AI는 다음 원칙에 따라 감정을 해석합니다:

1. **자율적 해석**: 규칙 기반 분석을 바탕으로 AI가 주체적으로 해석
2. **공감적 피드백**: 따뜻하고 이해하는 톤으로 응답
3. **복잡성 인정**: 감정의 미묘함과 복잡성을 인정
4. **건설적 제안**: 구체적이고 실용적인 제안 제공

### 응답 형식
```typescript
{
  analysis: "감정 분석에 대한 전체적인 해석",
  reasoning: "AI가 선택한 해석의 근거와 논리",
  suggestions: ["구체적인 제안 1", "구체적인 제안 2"],
  confidence: 0.85,
  metadata: {
    model: "gpt-4o-mini",
    version: "1.0.0",
    timestamp: "2025-01-27T12:00:00Z"
  }
}
```

## 📈 시각화 옵션

### Chart.js 설정
```typescript
const chartData = {
  type: 'line',
  data: {
    labels: ['12:00', '12:01', '12:02'],
    datasets: [
      {
        label: 'Valence',
        data: [0.8, 0.6, 0.4],
        borderColor: 'rgb(75, 192, 192)'
      }
    ]
  }
};
```

### 레이더 차트
```typescript
const radarData = {
  type: 'radar',
  data: {
    labels: ['Valence', 'Arousal', '복잡도', '강도', '안정성'],
    datasets: [{
      data: [0.8, 0.7, 0.3, 0.9, 0.6]
    }]
  }
};
```

## 🔧 설정 옵션

```typescript
interface EmotionEngineConfig {
  lexiconPath: string;                    // 감정 사전 경로
  openaiApiKey?: string;                  // OpenAI API 키
  model?: string;                         // GPT 모델 (기본: gpt-4o-mini)
  enablePersonalization?: boolean;        // 개인화 활성화
  minSamplesForPersonalization?: number;  // 개인화 최소 샘플 수
  enableVisualization?: boolean;          // 시각화 활성화
}
```

## 🧪 개발 및 테스트

```bash
# 의존성 설치
pnpm install

# 빌드
pnpm build

# 개발 모드
pnpm dev

# 테스트
pnpm test

# 린트
pnpm lint
```

## 📝 라이선스

MIT License

## 🤝 기여

HUA Platform의 감정 분석 기술 발전에 기여해주세요!

---

**"기술과 감정, 코드와 마음이 어우러지는 이 공간에서 함께 리듬을 만들어가요!"** ✨
