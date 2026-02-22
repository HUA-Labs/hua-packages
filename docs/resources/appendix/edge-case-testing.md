# 엣지 케이스 테스트 가이드

> E2E 테스트에서 커버해야 할 엣지 케이스 및 현재 구현 상태

## 개요

GPT 리뷰 기반으로 정리한 테스트 벡터. "착한 입력"만 있으면 방어력이 약하므로, 다양한 엣지 케이스 필요.

---

## 현재 구현 상태

### 1. 글자 수 제한

| 항목 | 값 | 위치 |
|------|-----|------|
| 최소 길이 | 10자 | `abuse-detection.ts` |
| 최대 길이 | 5,000자 | `DiaryEditor.tsx` (UI) |
| 최대 길이 | 10,000자 | `abuse-detection.ts` (서버) |

**현황**: ✅ 구현됨

### 2. 빈 문자열 / 이모지 처리

```typescript
// abuse-detection.ts
if (!content || content.length < ABUSE_DETECTION_CONFIG.MIN_CONTENT_LENGTH) {
  return { skip: true, pattern: 'TOKEN_ABUSE', reason: '내용이 너무 짧음' };
}
```

**현황**: ✅ 10자 미만은 분석 스킵

**TODO**: 이모지만 있는 경우 별도 처리 필요?
```
😭😭😭😭😭 → 길이는 5자, 감정 분석 가능?
```

### 3. 다국어 혼합 / 이상 패턴

```typescript
// abuse-detection.ts - shouldSkipAnalysis()
// 비정상 언어 혼합 패턴 감지 (다국어 탈옥 시도)
const koreanPattern = /[가-힣]/g;
const englishPattern = /[a-zA-Z]/g;
const japanesePattern = /[\u3040-\u309F\u30A0-\u30FF]/g;
const arabicPattern = /[\u0600-\u06FF]/g;
const cyrillicPattern = /[\u0400-\u04FF]/g;
```

**현황**: ✅ 구현됨
- 사용자 언어 설정(`userLang`)에 따라 정상/비정상 언어 판단
- 아랍어, 그리스어, 키릴문자 등 감지
- 일기 내용 키워드 없으면 필터링

### 4. 익명화 (Anonymization)

#### 현재 감지 항목

| 항목 | 패턴 | 상태 |
|------|------|------|
| 전화번호 | `\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4}` | ✅ |
| 이메일 | `[\w.-]+@[\w.-]+\.\w+` | ✅ |
| 주소 | `OO시 OO구 OO동/로/길` | ✅ |
| 주민등록번호 | `\d{6}[-\s]?\d{7}` | ✅ |
| 카드번호 | `\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}` | ✅ |
| 계좌정보 | `OO은행 + 숫자` | ✅ |
| 한글 이름 + 조사 | `철수가`, `영희를` | ✅ |
| 영어 이름 | `Josh`, `Mike` | ✅ |
| 한글 이름 단독 | `철수`, `조쉬` | ❌ 버그 |
| 일본어 이름 | `田中さん` | ❌ 미구현 |

#### 버그: 조사 없는 이름 미감지

```typescript
// 현재 패턴 - 조사 필수
const namePattern = /\b([가-힣]{2,4})(이|가|을|를|은|는|...)\b/g;

// "조쉬가 말했다" → [익명]가 말했다 ✅
// "조쉬 말했다" → 조쉬 말했다 ❌ (미감지)
```

**TODO**: 조사 없는 이름 패턴 추가 필요

### 5. 위험 신호 (Risk Signals)

```typescript
// anonymizer.ts - filterSensitiveInfo()
riskSignals: {
  hasSuicideRisk: boolean;      // 자살 위험
  hasSelfHarmRisk: boolean;     // 자해 위험
  hasDrugRisk: boolean;         // 약물 위험
  hasChildAbuseRisk: boolean;   // 아동학대 위험
  hasSeriousMedicalInfo: boolean; // 심각한 건강정보
  hasFinancialInfo: boolean;    // 금융정보
  hasTerrorismRisk: boolean;    // 테러/폭력 위험
}
```

**현황**: ✅ 구현됨

---

## 필요한 테스트 케이스

### Priority 1: 베타 전 필수

| 케이스 | 설명 | 테스트 플래그 필요 |
|--------|------|-------------------|
| PII 포함 | 전화번호, 이메일, 주소 | ❌ |
| 인명 (조사 없음) | "조쉬 말했다" | ❌ |
| 고위험 문장 | 자해/자살 언급 | ✅ `is_test: true` |
| 빈 문자열 | "" | ❌ |
| 공백만 | "   " | ❌ |
| 이모지만 | "😭😭😭" | ❌ |

### Priority 2: 베타 후

| 케이스 | 설명 |
|--------|------|
| 초장문 | 4,999자 vs 5,001자 경계 |
| 다국어 혼합 | 한+영+일 섞인 일기 |
| 모델 타임아웃 | API 실패 시나리오 |
| 일본어 이름 | `田中さん`, `山田君` |

---

## 고위험 테스트 케이스 처리

### 문제
- 고위험 키워드 테스트 시 실제 크라이시스 알림 발동 가능
- 프로덕션 데이터 오염 우려

### 해결 방안

```typescript
// 테스트 분석 요청 시
interface TestAnalysisRequest {
  content: string;
  is_test: true;  // 테스트 플래그
  skip_crisis_alert: true;  // 크라이시스 알림 스킵
}

// 분석 로직에서
if (request.is_test && request.skip_crisis_alert) {
  // 리스크 시그널 감지는 수행
  // 크라이시스 알림은 스킵
  // 결과는 TestAnalysisResult에만 저장
}
```

---

## 테스트 템플릿

### 1. PII 포함 케이스

```json
{
  "date": "2026-02-01",
  "content": "오늘 철수한테 전화했다. 번호는 010-1234-5678이고 이메일은 test@example.com이야.",
  "expected": {
    "anonymized_contains": ["[익명]", "[전화번호]", "[이메일]"],
    "diff.hasChanges": true
  }
}
```

### 2. 고위험 케이스 (테스트용)

```json
{
  "date": "2026-02-01",
  "content": "[TEST] 요즘 너무 힘들어서 극단적인 생각이 든다.",
  "is_test": true,
  "expected": {
    "riskSignals.hasSuicideRisk": true,
    "riskLevel": 4
  }
}
```

### 3. 빈/이모지 케이스

```json
[
  { "date": "2026-02-01", "content": "", "expected": { "skip": true } },
  { "date": "2026-02-01", "content": "   ", "expected": { "skip": true } },
  { "date": "2026-02-01", "content": "😭", "expected": { "skip": true } },
  { "date": "2026-02-01", "content": "😭😭😭😭😭😭😭😭😭😭", "expected": { "skip": "?" } }
]
```

---

## 액션 아이템

### 즉시 수정 필요

- [ ] 익명화: 조사 없는 한글 이름 패턴 추가
- [ ] 테스트 API: `is_test` 플래그로 크라이시스 알림 스킵 옵션

### 베타 전

- [ ] PII 테스트 케이스 템플릿 생성
- [ ] 고위험 테스트 케이스 템플릿 생성 (테스트 플래그 포함)
- [ ] 빈/공백/이모지 처리 확인

### 베타 후

- [ ] 일본어 이름 익명화 추가
- [ ] 모델 실패 시나리오 테스트
- [ ] 초장문 경계 테스트

---

## 관련 파일

| 파일 | 역할 |
|------|------|
| `app/lib/abuse-detection.ts` | 악용 패턴 감지 |
| `app/lib/anonymizer.ts` | 개인정보 익명화 |
| `app/lib/crisis-detection-service.ts` | 위기 감지 |
| `app/(app)/admin/analysis-e2e/page.tsx` | E2E 테스트 UI |

---

*Last updated: 2026-02-02*
