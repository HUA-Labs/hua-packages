# AI 프로바이더 설정 가이드

## 서버 환경 변수 설정

### 1. .env.local 파일 생성

```bash
cp env.example .env.local
```

### 2. AI 프로바이더 API 키 설정 (서버에서 관리)

#### OpenAI (GPT) 설정
1. [OpenAI 콘솔](https://platform.openai.com/api-keys)에서 API 키 생성
2. `.env.local` 파일에 추가:
```env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

#### Google Gemini 설정
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. `.env.local` 파일에 추가:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. 기본 프로바이더 설정

```env
DEFAULT_AI_PROVIDER="openai"  # openai, gemini, auto
NEXT_PUBLIC_DEFAULT_AI_PROVIDER="openai"
```

## 사용 방법

### 1. 설정 페이지 접근
- 일기 페이지에서 "AI 설정" 버튼 클릭
- 또는 `/settings` 경로로 직접 접근

### 2. 프로바이더 선택
- **GPT (OpenAI)**: ChatGPT 모델 사용
- **Gemini (Google)**: Google의 Gemini 모델 사용
- **자동 선택**: 가장 적합한 모델 자동 선택

### 3. 설정 저장
- 선택한 프로바이더로 설정 저장
- 서버에서 자동으로 해당 API 키 사용

## 프로바이더별 특징

### OpenAI (GPT)
- **장점**: 안정적이고 정확한 분석
- **모델**: GPT-3.5-turbo, GPT-4
- **비용**: 토큰 기반 과금
- **사용 사례**: 일반적인 일기 분석

### Google Gemini
- **장점**: 빠른 응답 속도, 무료 할당량
- **모델**: Gemini Pro
- **비용**: 무료 할당량 제공
- **사용 사례**: 대량 분석, 비용 절약

### 자동 선택
- **동작**: OpenAI 우선, 실패 시 Gemini 사용
- **장점**: 안정성과 비용 효율성 균형
- **사용 사례**: 프로덕션 환경

## 문제 해결

### 설정이 저장되지 않음
1. 브라우저 로컬 스토리지 확인
2. 브라우저 캐시 클리어
3. 개발자 도구에서 오류 확인

### AI 분석이 작동하지 않음
1. 서버 환경 변수 확인
2. API 키가 올바르게 설정되었는지 확인
3. 서버 로그에서 오류 메시지 확인

## 보안 주의사항

- API 키는 서버에서만 관리됩니다
- 사용자는 API 키를 직접 입력할 필요가 없습니다
- `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- 프로덕션 환경에서는 환경 변수로 API 키를 관리하세요
