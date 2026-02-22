# Sum Diary - Quick Start Guide

> 협업자 온보딩 문서 | 30분 안에 로컬 환경 셋업

---

## 핵심 요약 (3줄)

- **Privacy-First 감정 일기 서비스** - AES-256-GCM 암호화, 개인정보 익명화
- **AI 기반 감정 분석** - OpenAI GPT-5-mini / Google Gemini 2.5 Flash
- **위기 감지 시스템** - 3단계 안전망 (AI + 키워드 + 운영자)

---

## 기술 스택

| 카테고리 | 기술 |
|----------|------|
| 프레임워크 | Next.js 16.1.4 (App Router) |
| 언어 | TypeScript 5.9 |
| 인증 | NextAuth.js v5 (Credentials, Kakao, Google) |
| DB | PostgreSQL (Prisma ORM, Supabase) |
| AI | OpenAI GPT-5-mini, Google Gemini 2.5 Flash |
| 스트리밍 | Server-Sent Events (SSE) |
| 캐싱 | Redis (선택, 메모리 캐시 폴백) |
| 패키지 매니저 | pnpm (모노레포) |
| 시크릿 관리 | Doppler |

---

## 30분 로컬 셋업

### 1. 사전 요구사항 (5분)

```bash
# Node.js 22.x
node -v  # v22.x.x

# pnpm
pnpm -v  # 9.x.x

# Doppler CLI (시크릿 관리)
doppler --version
```

### 2. 저장소 클론 & 의존성 설치 (5분)

```bash
git clone <repo-url>
cd hua
pnpm install
```

### 3. Doppler 설정 (5분)

```bash
# Doppler 로그인
doppler login

# 프로젝트 연결
cd apps/my-app
doppler setup  # my-app 프로젝트 선택
```

### 4. 데이터베이스 설정 (5분)

```bash
# Prisma 클라이언트 생성
pnpm db:generate

# 스키마 동기화 (개발 DB)
pnpm db:push
```

### 5. 개발 서버 실행 (5분)

```bash
# Doppler로 환경변수 주입하며 실행
pnpm dev

# 또는 로컬 .env 사용 시
pnpm dev:local
```

### 6. 접속 확인

- **앱**: http://localhost:3000
- **Prisma Studio**: `pnpm db:studio`

---

## 핵심 철학 3가지

### 1. Privacy-First

- **암호화 저장**: 일기 내용, 사용자 정보 모두 AES-256-GCM
- **해시 기반 검색**: 이메일/닉네임은 SHA-256 해시로 검색
- **익명화 분석**: 2차 분석(HUA)은 익명화된 텍스트만 사용

### 2. 숨다 캐릭터

- **공감 중심**: 판단하지 않고 공감하는 AI 응답
- **비진단적 표현**: "패턴 관찰", "주의 신호" (진단 용어 X)
- **사용자 자기결정권**: 레포트 생성 등 모든 데이터 활용은 사용자 동의 기반

### 3. 데이터 미활용

- **개인정보 수집 최소화**: 서비스에 꼭 필요한 정보만
- **분석 데이터 비상업적 활용**: 사용자 동의 없이 마케팅/광고 X
- **연구 목적은 익명화 후**: 개인 식별 불가능한 형태로만

---

## 필수 읽기 문서

| 순서 | 문서 | 설명 |
|------|------|------|
| 1 | [01-overview.md](./01-ARCHITECTURE/01-overview.md) | 시스템 전체 아키텍처 |
| 2 | [glossary.md](./APPENDIX/glossary.md) | HUA, Slip, Crisis 용어 정의 |
| 3 | [p0-critical.md](./04-TASKS/01-p0-critical.md) | 당장 해결할 이슈 |

---

## 주요 스크립트

```bash
# 개발
pnpm dev              # Doppler 환경변수로 실행
pnpm dev:local        # 로컬 .env로 실행

# 데이터베이스
pnpm db:push          # 스키마 동기화
pnpm db:studio        # Prisma Studio 실행
pnpm db:generate      # Prisma 클라이언트 생성

# 테스트
pnpm test             # Vitest 단위 테스트
pnpm test:e2e         # Playwright E2E 테스트

# 유틸리티
pnpm utils:check-users        # 사용자 목록 확인
pnpm utils:create-admin-user  # 관리자 계정 생성
```

---

## 폴더 구조 (핵심)

```
apps/my-app/
├── app/
│   ├── (app)/           # 앱 라우트 (로그인 필요)
│   ├── (public)/        # 공개 라우트 (랜딩, 로그인)
│   ├── api/             # API 라우트 (84개)
│   ├── components/      # React 컴포넌트 (85개)
│   ├── hooks/           # Custom Hooks (48개)
│   └── lib/             # 핵심 라이브러리 (75개)
├── prisma/
│   └── schema.prisma    # DB 스키마 (20+ 모델)
└── docs/                # 내부 문서
```

---

## 도움 요청

- **Slack**: #my-app-dev
- **문서 이슈**: 이 문서에 오류/누락이 있으면 PR 부탁

---

*마지막 업데이트: 2026-01-27*
