# AI 분석 시스템 아키텍처

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16  
> 실제 구현 기반 상세 문서

## 개요

숨다이어리 서비스는 **이중 분석 시스템**을 사용하여 일기를 분석합니다:
1. **1차 AI 분석** (OpenAI/Gemini): 사용자 화면용 개인화된 감정 분석
2. **2차 HUA 감정 엔진**: 정량적 감정 메트릭 분석

이 문서는 실제 구현 코드를 기반으로 AI 분석 시스템의 상세한 아키텍처를 설명합니다.

**핵심 원칙:**
- Privacy-First: 1차 분석은 원문 사용 (개인화된 응답), 2차 분석은 익명화된 텍스트 사용
- 감응 시스템: AI가 감정을 "명령"이 아닌 "감응요청"으로 자율적으로 해석
- 다중 프로바이더 지원: OpenAI, Gemini, 자동 선택

---

## 1. 시스템 구조

### 1.1 전체 흐름

```
일기 작성
    ↓
암호화 저장
    ↓
1차 AI 분석 (OpenAI/Gemini) - 원문 사용
    ├─ 사용자 화면용 응답 생성
    ├─ 메타데이터 추출 (mode, tone, tier_a, tier_m, ethics)
    └─ 슬립 계산
    ↓
2차 HUA 감정 엔진 분석 (비동기) - 익명화된 텍스트 사용
    ├─ 정량적 메트릭 계산
    └─ 좌표 및 엔트로피 분석
    ↓
위기 감지 (비동기) - 익명화된 텍스트 사용
    └─ 3단계 안전망
```

### 1.2 주요 컴포넌트

**1차 분석:**
- `diary-analysis-service.ts`: 메인 분석 서비스
- `prompt-templates.ts`: 프롬프트 템플릿 관리
- `slip-calculator.ts`: 슬립 계산

**2차 분석:**
- `hua-ai-service.ts`: HUA 감정 엔진 분석
- `hua-ai-prompt.ts`: HUA 프롬프트
- `hua-config.ts`: HUA 설정

**프로바이더 관리:**
- `openai-client.ts`: OpenAI 클라이언트
- `user-settings.ts`: 사용자 프로바이더 설정
- `user-settings-server.ts`: 서버 사이드 설정 조회

---

## 2. 1차 AI 분석 (사용자 화면용)

### 2.1 분석 함수

**구현 위치:** `app/lib/diary-analysis-service.ts`

**함수:** `analyzeDiary(diaryContent: string, userId?: string)`

**프로세스:**
1. 사용자 AI 프로바이더 설정 조회
2. 모델 및 API 키 가져오기
3. 프롬프트 생성 (원문 사용)
4. AI API 호출 (OpenAI 또는 Gemini)
5. 응답 파싱 및 검증
6. 슬립 계산
7. 토큰 사용량 및 비용 계산
8. 결과 반환

### 2.2 프롬프트 시스템

**구현 위치:** `app/lib/prompt-templates.ts`

**시스템 프롬프트:**
- HUA System Prompt v4 사용
- 토큰 수: 약 1,200 토큰
- 규칙 기반 감응 분석 시스템
- "이 것은 지시도 명령도 아닌 감응요청"

**주요 섹션:**
1. 전역 규칙 (Language & Format)
2. 응답 생성 원칙 (Behavior Rules)
3. 톤 가이드라인 (Tone Style)
4. 일기 제목 (Title)
5. 오늘의 장면 (Summary)
6. 감정 파형 규칙 (Emotion Flow)
7. 자기성찰 질문 (Question)
8. Interpretation 규칙 (감응 해석)
9. Enforcement: 추정 지표 산정 규칙

**프롬프트 생성 함수:**
```typescript
export function createAnalysisPrompt(diaryContent: string): {
  systemPrompt: string;
  userPrompt: string;
  metadata: {
    description: string;
    tokenCount: number;
  };
}
```

### 2.3 프로바이더별 구현

#### OpenAI

**구현:**
```typescript
const openai = getOpenAIClient();
const response = await openai.chat.completions.create({
  model: 'gpt-5-mini',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_completion_tokens: 4000,
}, {
  timeout: 120000, // 120초 타임아웃
});
```

**특징:**
- `max_completion_tokens` 사용 (GPT-5-mini)
- 타임아웃 120초
- JSON 응답 파싱

#### Gemini

**구현:**
```typescript
async function callGeminiAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string,
  retryCount = 0
)
```

**특징:**
- 재시도 로직 포함 (최대 3회)
- Safety Settings 설정
- JSON 응답 강제 (`responseMimeType: "application/json"`)
- `responseSchema`로 구조 강제

**재시도 전략:**
- 500 오류 시 자동 재시도
- 지수 백오프 (1초, 2초, 3초)
- 최대 3회 시도

### 2.4 응답 파싱

**응답 구조:**
```typescript
{
  user_response: {
    title: string;
    summary: string[];
    emotion_flow: string[];
    question: string;
    interpretation: string;
  },
  metadata: {
    mode: string;
    tone: string;
    affect_tier: number;
    momentum_tier: number;
    ethics: string[];
    confidence: number;
  }
}
```

**파싱 전략:**
1. JSON 코드 블록 제거 시도
2. JSON 파싱
3. 파싱 실패 시 정리 후 재시도
4. 필수 필드 검증
5. 하위 호환 처리 (tier_a/tier_m)

**에러 처리:**
- JSON 파싱 실패 시 기본 구조 반환
- 에러 메타데이터 포함
- 원본 응답 보존 (`_raw_response`)

### 2.5 슬립 계산

**구현 위치:** `app/lib/slip-calculator.ts`

**슬립 (Slip)**: 과몰입 패턴 감지 시스템

**계산 기준:**
- **Hard Slip**: 심각한 과몰입 (m≥4.5, a≤2.0) 또는 3개 이상의 위험 요소
- **Soft Slip**: 경미한 과몰입 (m≥4.0, a≤2.5) 또는 2개 이상의 위험 요소
- **None**: 정상적인 감정 몰입 상태

**계산 함수:**
```typescript
export function calculateFinalSlip(input: SlipCalculationInput): SlipCalculationResult
```

**입력:**
- `tier_a`: 감정 강도 (1.0-5.0)
- `tier_m`: 몰입도 (1.0-5.0)
- `ethics`: 윤리적 요소 배열

**윤리적 요소 조정:**
- 긍정적 요소: growth, reflection, connection 등 → 슬립 완화
- 부정적 요소: isolation, self-harm, destructive 등 → 슬립 강화

---

## 3. 2차 HUA 감정 엔진 분석

### 3.1 분석 목적

**1차 분석과의 차이:**
- 1차: 사용자 화면용 개인화된 응답 (원문 사용)
- 2차: 정량적 메트릭 분석 (익명화된 텍스트 사용)

**생성하는 메트릭:**
- Valence-Arousal 좌표
- Shannon Entropy (감정 복잡도)
- 감정 밀도 (Emotion Density)
- 주요 감정 (Dominant Emotion)
- 감정 전환 (Transitions)

### 3.2 구현

**구현 위치:** `app/lib/hua-ai-service.ts`

**함수:** `analyzeHUAEmotion(input: HUA_AnalysisInput): Promise<HUA_AnalysisResult>`

**프로세스:**
1. 익명화된 텍스트 준비
2. HUA 프롬프트 생성
3. AI API 호출 (OpenAI 또는 Gemini)
4. JSON 응답 파싱
5. 메트릭 검증 및 후처리
6. 결과 반환

### 3.3 HUA 프롬프트

**구현 위치:** `app/lib/hua-ai-prompt.ts`

**특징:**
- JSON 스키마 강제
- 정량적 메트릭 생성
- 434개 감정어 데이터 기반

**응답 구조:**
```typescript
{
  coordinates: {
    valence: number; // -1 ~ 1
    arousal: number; // 0 ~ 1
  },
  entropy: number; // 0 ~ 1
  density: number; // 0 ~ 1
  dominant_emotion: string;
  transitions: number;
  // ... 기타 메트릭
}
```

---

## 4. 토큰 관리 및 비용 계산

### 4.1 토큰 사용량 추적

**OpenAI:**
- `response.usage`에서 직접 추출
- `prompt_tokens`, `completion_tokens`, `total_tokens`

**Gemini:**
- `usageMetadata`에서 추출
- `promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`

### 4.2 비용 계산

**구현:** `calculateTokenCost(usage: any, model: string)`

**가격 (2025년 1월 기준):**
- GPT-5-mini: 입력 $0.25/1M, 출력 $2.00/1M
- Gemini 2.5 Flash: 입력 $0.30/1M, 출력 $2.50/1M

**계산:**
```typescript
const inputCost = (usage.prompt_tokens / 1000000) * INPUT_COST_PER_1M;
const outputCost = (usage.completion_tokens / 1000000) * OUTPUT_COST_PER_1M;
const totalCost = inputCost + outputCost;
```

### 4.3 토큰 예상

**구현:** `estimateTokenUsage(diaryContent: string, model: string)`

**목적:**
- 프롬프트 최적화
- 비용 예측
- 실제 사용량과 비교

---

## 5. 프로바이더 전환 로직

### 5.1 자동 선택 모드

**구현:**
```typescript
if (userProvider === 'auto') {
  try {
    // OpenAI 시도
    response = await openai.chat.completions.create(...);
  } catch (openaiError) {
    // OpenAI 실패 시 Gemini로 전환
    response = await callGeminiAPI(...);
  }
}
```

**전환 조건:**
- OpenAI API 실패 시
- 타임아웃 발생 시
- 에러 응답 시

### 5.2 사용자 설정

**구현 위치:** `app/lib/user-settings.ts`

**설정 조회:**
- `getUserAiProvider(userId)`: 사용자 프로바이더 조회
- `getModelForProvider(provider)`: 프로바이더별 모델 조회
- `getApiKeyForProvider(provider)`: API 키 조회

**기본값:**
- 프로바이더: `openai`
- 모델: `gpt-5-mini` (OpenAI), `gemini-2.5-flash` (Gemini)

---

## 6. 에러 처리 및 재시도

### 6.1 재시도 전략

**Gemini:**
- 500 오류 시 자동 재시도
- 최대 3회 시도
- 지수 백오프 (1초, 2초, 3초)

**OpenAI:**
- 타임아웃 120초
- 재시도는 상위 레이어에서 처리

### 6.2 에러 타입

**API 에러:**
- 네트워크 오류
- 타임아웃
- API 키 오류
- Rate Limit 초과

**파싱 에러:**
- JSON 파싱 실패
- 필수 필드 누락
- 구조 불일치

**응답 에러:**
- 빈 응답
- 안전 필터 차단 (Gemini)
- 형식 오류

---

## 7. 성능 최적화

### 7.1 프롬프트 최적화

**전략:**
- 시스템 프롬프트 고정값 분리
- 토큰 수 최소화
- 불필요한 설명 제거

**결과:**
- 시스템 프롬프트: 약 1,200 토큰
- 전체 프롬프트: 약 5,000-6,000 토큰 (일기 3,850자 기준)

### 7.2 비동기 처리

**2차 분석:**
- 1차 분석 완료 후 비동기로 실행
- 사용자 응답 속도에 영향 없음

**위기 감지:**
- 별도 비동기 작업으로 실행
- 즉시 응답 반환

### 7.3 캐싱 전략

**프롬프트 캐싱:**
- 시스템 프롬프트는 상수로 관리
- 동적 생성 최소화

**결과 캐싱:**
- 동일한 일기 내용에 대한 재분석 방지
- AnalysisResult 테이블에 저장

---

## 8. 구현 상세

### 8.1 주요 함수

**1차 분석:**
- `analyzeDiary(diaryContent, userId?)`: 메인 분석 함수
- `testOpenAIConnection()`: 연결 테스트

**프롬프트:**
- `createAnalysisPrompt(diaryContent)`: 프롬프트 생성
- `estimateTokenUsage(diaryContent, model)`: 토큰 예상

**슬립 계산:**
- `calculateSlip(input)`: 기본 슬립 계산
- `adjustSlipByEthics(baseSlip, ethics)`: 윤리 요소 조정
- `calculateFinalSlip(input)`: 최종 슬립 계산

**2차 분석:**
- `analyzeHUAEmotion(input)`: HUA 감정 분석

### 8.2 데이터 구조

**분석 결과:**
```typescript
{
  // 사용자 화면용
  title: string;
  summary: string[];
  emotion_flow: string[];
  question: string;
  interpretation: string;
  
  // 메타데이터
  _metadata: {
    mode: string;
    tone: string;
    tier_a: number;
    tier_m: number;
    ethics: string[];
    confidence: number;
    slip: 'none' | 'soft' | 'hard';
    token_usage: {...};
  };
  
  // 원본 응답
  _raw_response: string;
}
```

---

## 9. 보안 고려사항

### 9.1 개인정보 보호

**1차 분석:**
- 원문 사용 (개인화된 응답을 위해)
- 사용자 화면에만 표시
- 관리자에게는 익명화된 버전 제공

**2차 분석:**
- 익명화된 텍스트 사용
- 개인정보 제거 후 분석

### 9.2 API 키 관리

**저장:**
- 환경 변수로 관리
- 절대 코드에 하드코딩하지 않음

**접근:**
- 서버 사이드에서만 접근
- 클라이언트에 노출되지 않음

---

## 10. 테스트 전략

### 10.1 단위 테스트

**테스트 케이스:**
- 프롬프트 생성 정확성
- 슬립 계산 정확성
- 토큰 비용 계산 정확성
- 에러 처리

### 10.2 통합 테스트

**테스트 시나리오:**
- 전체 분석 플로우
- 프로바이더 전환
- 재시도 로직
- 비동기 처리

---

## 11. 모니터링 및 로깅

### 11.1 로깅 항목

**분석 이벤트:**
- 분석 시작/완료
- 프로바이더 선택
- 토큰 사용량
- 비용 계산
- 에러 발생

### 11.2 성능 메트릭

**추적 항목:**
- 분석 소요 시간
- 토큰 사용량
- 비용
- 성공/실패율
- 프로바이더별 통계

---

## 12. 참고 자료

### 관련 코드 파일
- `app/lib/diary-analysis-service.ts`: 1차 분석 서비스
- `app/lib/hua-ai-service.ts`: 2차 HUA 분석 서비스
- `app/lib/prompt-templates.ts`: 프롬프트 템플릿
- `app/lib/slip-calculator.ts`: 슬립 계산
- `app/lib/openai-client.ts`: OpenAI 클라이언트
- `app/lib/user-settings.ts`: 사용자 설정

### 관련 문서
- [HUA 메트릭 분석](../analysis/HUA_METRICS_ANALYSIS.md)
- [개발 현황](../DEVELOPMENT_STATUS.md)

---

## 13. 향후 개선 계획

### 13.1 계획된 개선사항

1. **스트리밍 응답**
   - SSE를 통한 실시간 응답
   - 점진적 렌더링

2. **프롬프트 최적화**
   - A/B 테스트를 통한 최적 프롬프트 도출
   - 토큰 수 추가 최적화

3. **정확도 개선**
   - 후처리 로직 강화
   - 검증 로직 추가

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
