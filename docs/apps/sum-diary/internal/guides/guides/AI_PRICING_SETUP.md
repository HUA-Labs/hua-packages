# 💰 AI 모델 가격 설정 가이드

> 작성일: 2025-12-06  
> 목적: AI 모델별 가격 환경변수 설정 가이드  
> 환율 기준: 1 USD = 1,470 KRW

---

## 📋 기본 모델

- **1차 분석**: GPT-5-mini (사용자 화면용)
- **2차 분석**: GPT-4o-mini (HUA AI 정량 분석용)
- **대체 모델**: Gemini 2.5 Flash

---

## 💵 가격표 (공식 가격표 기준)

### OpenAI GPT-5-mini

**공식 가격표** (토큰 100만 개당):
- 입력: **$0.25** per 1M tokens
- 출력: **$2.00** per 1M tokens

**1K tokens당 변환**:
- 입력: $0.25 / 1000 = **$0.00025** per 1K tokens
- 출력: $2.00 / 1000 = **$0.002** per 1K tokens

**환경변수 설정**:
```env
OPENAI_GPT5_MINI_INPUT_PER_1K_USD=0.00025
OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD=0.002
```

---

### OpenAI GPT-4o-mini (2차 분석용)

**공식 가격표** (토큰 100만 개당):
- 입력: **$0.15** per 1M tokens
- 캐시된 입력: **$0.075** per 1M tokens
- 출력: **$0.60** per 1M tokens

**1K tokens당 변환**:
- 입력: $0.15 / 1000 = **$0.00015** per 1K tokens
- 캐시된 입력: $0.075 / 1000 = **$0.000075** per 1K tokens
- 출력: $0.60 / 1000 = **$0.0006** per 1K tokens

**환경변수 설정**:
```env
OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.0006
```

**참고**: 
- 2차 HUA AI 분석에 사용 (정량 분석용)
- 현재 캐시 기능 미사용 (향후 최적화 가능)

---

### Gemini 2.5 Flash (유료 등급)

**공식 가격표** (토큰 100만 개당):
- 입력: **$0.30** (텍스트/이미지/동영상)
- 출력: **$2.50** (사고 토큰 포함)

**1K tokens당 변환**:
- 입력: $0.30 / 1000 = **$0.0003** per 1K tokens
- 출력: $2.50 / 1000 = **$0.0025** per 1K tokens

**환경변수 설정**:
```env
GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD=0.0003
GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD=0.0025
```

**참고**: 
- 모델명 변환: `gemini-2.5-flash` → `GEMINI_2_5_FLASH`
- 점(.)은 언더스코어(_)로 변환됨

---

## 🔧 설정 방법

### 1. Doppler 설정 (프로덕션)

```bash
# OpenAI GPT-5-mini
doppler secrets set OPENAI_GPT5_MINI_INPUT_PER_1K_USD=0.00025
doppler secrets set OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD=0.002

# OpenAI GPT-4o-mini (2차 분석용)
doppler secrets set OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
doppler secrets set OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.0006

# Gemini 2.5 Flash
doppler secrets set GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD=0.0003
doppler secrets set GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD=0.0025
```

### 2. 로컬 .env 파일

`.env` 파일에 다음 내용 추가:

```env
# OpenAI GPT-5-mini
OPENAI_GPT5_MINI_INPUT_PER_1K_USD=0.00025
OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD=0.002

# OpenAI GPT-4o-mini (2차 분석용)
OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.0006

# Gemini 2.5 Flash
GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD=0.0003
GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD=0.0025
```

---

## 📝 환경변수 키 규칙

### 형식
```
{PROVIDER}_{MODEL}_{TYPE}_PER_1K_USD
```

### 예시
- `OPENAI_GPT5_MINI_INPUT_PER_1K_USD`
- `OPENAI_GPT5_MINI_OUTPUT_PER_1K_USD`
- `GEMINI_GEMINI_2_5_FLASH_INPUT_PER_1K_USD`
- `GEMINI_GEMINI_2_5_FLASH_OUTPUT_PER_1K_USD`

### 모델명 변환 규칙
1. 대문자로 변환
2. 하이픈(`-`) → 언더스코어(`_`)
3. 점(`.`) → 언더스코어(`_`)

**예시**:
- `gpt-5-mini` → `GPT_5_MINI`
- `gemini-2.5-flash` → `GEMINI_2_5_FLASH`

---

## 💡 비용 비교

### GPT-5-mini vs Gemini 2.5 Flash

| 모델 | 입력 (1K tokens) | 출력 (1K tokens) | 총 비용 (입력 1K + 출력 1K) |
|------|-------------------|------------------|----------------------------|
| GPT-5-mini | $0.00025 | $0.002 | **$0.00225** |
| Gemini 2.5 Flash | $0.0003 | $0.0025 | **$0.0028** |

**결론**: GPT-5-mini가 약 **24% 저렴**합니다.

### 실제 사용량 기준 (5,000~6,000 tokens per 분석)

**실제 측정값**: 한 번 분석 시 약 5,000~6,000 tokens 사용

**환율**: 1 USD = 1,470 KRW

| 모델 | 분석 1건 | 일일 10건 | 월간 300건 |
|------|---------|-----------|------------|
| **GPT-5-mini** | | | |
| USD | **$0.005** | $0.05 | **$1.50** |
| KRW | **₩7.35** | ₩73.5 | **₩2,205** |
| **Gemini 2.5 Flash** | | | |
| USD | **$0.006** | $0.06 | **$1.80** |
| KRW | **₩8.82** | ₩88.2 | **₩2,646** |

**비용 비교**: GPT-5-mini가 약 **17% 저렴**합니다.
- USD: $1.50 vs $1.80
- KRW: ₩2,205 vs ₩2,646

---

## ⚠️ 주의사항

### Gemini 2.5 Flash
- 현재 설정은 **사고 토큰 포함** 기준입니다 (출력 $2.50/1M tokens).
- 사고 토큰이 포함된 출력 가격이 적용됩니다.

### 모델명 주의
- Gemini 모델명은 `gemini-2.5-flash` 형식 (점 포함)
- 환경변수 키는 `GEMINI_GEMINI_2_5_FLASH` 형식으로 변환됨
- 코드에서 자동 변환하므로 모델명만 정확히 입력하면 됨

---

## 🧪 테스트

가격 설정 후 비용 계산 테스트:

```bash
pnpm test:quota
```

비용 계산 함수가 환경변수에서 가격을 올바르게 읽는지 확인할 수 있습니다.

---

## 📊 실제 사용 예시

### 실제 사용량 기준 (5,000~6,000 tokens)

**시나리오 1: 입력 4,000 tokens + 출력 1,500 tokens = 총 5,500 tokens**

**GPT-5-mini 비용**:
- 입력: (4,000 / 1000) × $0.00025 = $0.001
- 출력: (1,500 / 1000) × $0.002 = $0.003
- **총 비용: $0.004** (₩5.88)

**Gemini 2.5 Flash 비용**:
- 입력: (4,000 / 1000) × $0.0003 = $0.0012
- 출력: (1,500 / 1000) × $0.0025 = $0.00375
- **총 비용: $0.00495** (약 **$0.005**, **₩7.35**)

---

**시나리오 2: 입력 3,500 tokens + 출력 2,000 tokens = 총 5,500 tokens** (실제 사용량 기준)

**GPT-5-mini 비용**:
- 입력: (3,500 / 1000) × $0.00025 = $0.000875
- 출력: (2,000 / 1000) × $0.002 = $0.004
- **총 비용: $0.004875** (약 **$0.005**, **₩7.35**)

**Gemini 2.5 Flash 비용**:
- 입력: (3,500 / 1000) × $0.0003 = $0.00105
- 출력: (2,000 / 1000) × $0.0025 = $0.005
- **총 비용: $0.00605** (약 **$0.006**, **₩8.82**)

---

### 월간 비용 추정 (무료 사용자 기준)

**가정**: 
- 일일 전송: 10회
- 월간 전송: 300회
- 분석당 평균 토큰: 5,500 tokens (입력 3,500 + 출력 2,000)
- 환율: 1 USD = 1,470 KRW

**GPT-5-mini**:
- 일일: 10회 × $0.005 = **$0.05/일** (₩73.5/일)
- 월간: 300회 × $0.005 = **$1.50/월** (₩2,205/월)

**Gemini 2.5 Flash**:
- 일일: 10회 × $0.006 = **$0.06/일** (₩88.2/일)
- 월간: 300회 × $0.006 = **$1.80/월** (₩2,646/월)

**비용 비교**: GPT-5-mini가 약 **17% 저렴**합니다.
- USD: $1.50 vs $1.80
- KRW: ₩2,205 vs ₩2,646

---

### 프리미엄 사용자 비용 추정

**가정**: 
- 일일 전송: 100회
- 월간 전송: 3,000회
- 분석당 평균 토큰: 5,500 tokens
- 환율: 1 USD = 1,470 KRW

**GPT-5-mini**:
- 일일: 100회 × $0.005 = **$0.50/일** (₩735/일)
- 월간: 3,000회 × $0.005 = **$15/월** (₩22,050/월)

**Gemini 2.5 Flash**:
- 일일: 100회 × $0.006 = **$0.60/일** (₩882/일)
- 월간: 3,000회 × $0.006 = **$18/월** (₩26,460/월)

**비용 비교**: GPT-5-mini가 약 **17% 저렴**합니다.
- USD: $15 vs $18
- KRW: ₩22,050 vs ₩26,460

---

**작성자**: Auto (AI Assistant)  
**태그**: #pricing #environment-variables #cost-management
