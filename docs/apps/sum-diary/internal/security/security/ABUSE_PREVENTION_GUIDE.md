# 어뷰즈 방지 가이드

> 작성일: 2025-12-16  
> 목적: 어뷰즈 방지 시스템 사용 가이드 및 테스트 방법

---

## 어뷰즈 방지 시스템 개요

### 다단계 방어 체계

```
1단계: User-Agent 검증
  ↓ 통과
2단계: Rate Limit (VPN 의심 시 더 엄격)
  ↓ 통과
3단계: 동시 실행 제한
  ↓ 통과
4단계: Quota 체크
  ↓ 통과
5단계: 요청 처리
```

---

## 테스트 환경 설정

### User-Agent 검증 비활성화

테스트 환경에서 User-Agent 검증을 비활성화하려면:

```bash
# .env 파일에 추가
DISABLE_USER_AGENT_CHECK=true
```

또는

```bash
# 환경변수로 설정
export DISABLE_USER_AGENT_CHECK=true
```

### 테스트 모드

`NODE_ENV=test`로 설정하면 자동으로 User-Agent 검증이 완화됩니다.

---

## 허용된 봇 설정

### 환경변수로 허용 봇 추가

`.env` 파일에 허용할 봇 User-Agent를 추가:

```bash
# 쉼표로 구분하여 여러 봇 허용
ALLOWED_BOT_USER_AGENTS=hua-bot,my-app-bot,monitoring-bot,custom-bot
```

### 기본 허용 봇

다음 봇들은 기본적으로 허용됩니다:

- **검색 엔진**: `googlebot`, `bingbot`, `slurp`, `duckduckbot`, `baiduspider`, `yandexbot`
- **소셜 미디어**: `facebookexternalhit`, `twitterbot`, `linkedinbot`, `whatsapp`, `telegrambot`, `discordbot`
- **우리 봇**: `hua-bot`, `my-app-bot`, `hua-monitor`

### 우리 봇 사용 예시

```typescript
// 허용된 User-Agent로 요청
const response = await fetch('/api/diary/create', {
  headers: {
    'User-Agent': 'HUA-Bot/1.0 (Monitoring)',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ ... }),
});
```

---

## 모바일 사용자

### 허용되는 모바일 브라우저

다음 모바일 브라우저는 자동으로 허용됩니다:

- iOS: `Safari`, `Chrome`, `Firefox`
- Android: `Chrome`, `Samsung Internet`, `Firefox`, `Opera`
- 기타: `UC Browser`, `MIUI Browser`

### 모바일 User-Agent 예시

```
Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15
Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120
```

---

## 차단되는 User-Agent

### 자동 차단 패턴

다음 패턴이 포함된 User-Agent는 자동으로 차단됩니다:

- **봇/크롤러**: `bot`, `crawler`, `spider`, `scraper`
- **CLI 도구**: `curl`, `wget`, `httpie`, `python-requests`
- **API 테스트 도구**: `postman`, `insomnia`, `rest-client`
- **자동화 도구**: `python`, `node`, `java`, `scrapy`, `selenium`
- **기타**: `apache-httpclient`, `okhttp`, `axios`, `fetch`, `urllib`

### 차단 예시

```bash
# 차단됨
curl -H "User-Agent: curl/7.68.0" https://api.example.com/diary/create

# 차단됨
curl -H "User-Agent: python-requests/2.28.0" https://api.example.com/diary/create

# 허용됨 (허용된 봇)
curl -H "User-Agent: HUA-Bot/1.0" https://api.example.com/diary/create
```

---

## VPN 대응

### VPN 감지

VPN 사용자는 더 엄격한 제한이 적용됩니다:

- **일반 사용자**: 1분 10회
- **VPN 의심 사용자**: 1분 3회

### VPN IP 목록 서비스 연동 (향후)

현재는 기본 휴리스틱만 제공하며, 향후 다음 서비스와 연동 가능:

- MaxMind GeoIP2
- IP2Location
- AbuseIPDB

---

## 🧪 테스트 방법

### 1. 정상 요청 테스트

```bash
# 정상 브라우저 User-Agent
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -X POST https://api.example.com/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"content": "테스트 일기"}'
```

### 2. 차단 테스트

```bash
# 의심스러운 User-Agent (차단됨)
curl -H "User-Agent: python-requests/2.28.0" \
  -X POST https://api.example.com/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"content": "테스트"}'
# 응답: 403 Forbidden
```

### 3. 허용된 봇 테스트

```bash
# 허용된 봇 User-Agent
curl -H "User-Agent: HUA-Bot/1.0 (Monitoring)" \
  -X POST https://api.example.com/api/diary/create \
  -H "Content-Type: application/json" \
  -d '{"content": "봇 테스트"}'
# 응답: 200 OK
```

### 4. 테스트 환경에서 검증 비활성화

```bash
# .env 파일
DISABLE_USER_AGENT_CHECK=true

# 또는 환경변수
export DISABLE_USER_AGENT_CHECK=true
npm test
```

---

## 모니터링

### 차단된 요청 로그

차단된 요청은 다음 정보와 함께 로그됩니다:

- IP 주소
- User-Agent
- 차단 이유
- 타임스탬프

### 알림 설정 (향후)

의심스러운 패턴이 감지되면:

- 관리자 알림
- 자동 차단 (반복 위반 시)
- 수동 검토 큐에 추가

---

## 환경변수 설정

### 필수 환경변수

```bash
# User-Agent 검증 비활성화 (테스트용)
DISABLE_USER_AGENT_CHECK=false

# 허용된 봇 User-Agent 목록 (쉼표로 구분)
ALLOWED_BOT_USER_AGENTS=hua-bot,my-app-bot,monitoring-bot
```

### 선택적 환경변수

```bash
# VPN IP 목록 서비스 API 키 (향후)
MAXMIND_API_KEY=your_api_key
IP2LOCATION_API_KEY=your_api_key
```

---

## 베스트 프랙티스

### 1. 개발 환경

- `DISABLE_USER_AGENT_CHECK=true` 설정
- 로컬 테스트 시 정상 브라우저 User-Agent 사용

### 2. 스테이징 환경

- 실제 User-Agent 검증 활성화
- 허용된 봇 목록 설정
- 모니터링 봇 테스트

### 3. 프로덕션 환경

- 모든 검증 활성화
- 허용된 봇만 명시적으로 추가
- 정기적인 로그 모니터링

---

## 문제 해결

### 우리 봇이 차단되는 경우

1. `.env` 파일에 `ALLOWED_BOT_USER_AGENTS` 추가
2. 봇 User-Agent에 허용된 패턴 포함 (예: `hua-bot`)
3. 또는 `DISABLE_USER_AGENT_CHECK=true` (테스트용만)

### 테스트가 실패하는 경우

1. `NODE_ENV=test` 설정 확인
2. 또는 `DISABLE_USER_AGENT_CHECK=true` 설정
3. 테스트 코드에서 정상 User-Agent 사용

### 정상 사용자가 차단되는 경우

1. User-Agent 확인 (너무 짧거나 의심스러운 패턴 포함 여부)
2. 모바일 브라우저인지 확인
3. 로그 확인하여 차단 이유 파악

---

**작성자**: Auto (AI Assistant)  
**태그**: #abuse-prevention #security #testing

