# 초기 설정 가이드

> 작성일: 2025-12-16  
> 최종 업데이트: 2025-12-16

## 개요

이 문서는 숨다이어리 서비스를 처음 설정하는 개발자를 위한 통합 가이드입니다.

---

## 1. 프로젝트 설정

### 1.1 저장소 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd hua-platform

# 루트에서 모든 패키지 의존성 설치 (monorepo)
pnpm install

# my-app 앱 디렉토리로 이동
cd apps/my-app
```

### 1.2 Node.js 버전

**요구 버전**: Node.js 22.x

**설정 방법**:
- `.nvmrc` 파일: `22.17.1`
- `.node-version` 파일: `22.17.1`
- `package.json`: `"node": "22.x"`

**Node.js 버전 관리 도구**:
- Volta (권장): 공식 지원, 크로스 플랫폼
- fnm: 빠르고 간단, Rust 기반
- nvm-windows: Windows용 서드파티

자세한 내용은 [Node.js 업그레이드 가이드](./NODE_UPGRADE_GUIDE.md) 참조

---

## 2. 환경 변수 설정

### 2.1 환경 변수 파일 생성

```bash
# 환경 변수 예제 파일 복사
cp env.example .env.local
```

### 2.2 필수 환경 변수

**데이터베이스:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sum_diary"
DIRECT_URL="postgresql://user:password@localhost:5432/sum_diary"
```

**인증:**
```env
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**암호화:**
```env
ENCRYPTION_KEY="your-32-byte-encryption-key"
```

**AI 프로바이더:**
```env
OPENAI_API_KEY="sk-your-openai-api-key"
GEMINI_API_KEY="your-gemini-api-key"
DEFAULT_AI_PROVIDER="openai"
```

### 2.3 환경 변수 관리 전략

**로컬 개발:**
- Doppler 사용 (무료 플랜)
- 또는 `.env.local` 파일 직접 사용

**프로덕션 (Vercel):**
- Vercel 환경 변수 직접 사용 (권장)
- 또는 Doppler Sync (유료 서비스)

자세한 내용은 [환경 변수 관리 전략](./ENVIRONMENT_VARIABLE_STRATEGY.md) 참조

---

## 3. 데이터베이스 설정

### 3.1 PostgreSQL 설정

**Docker 사용 (로컬 개발):**
```bash
# docker-compose.yml에서 PostgreSQL 컨테이너 실행
docker-compose up -d postgres
```

**타임존 설정:**
- Docker 컨테이너: `TZ: Asia/Seoul` (이미 설정됨)
- 애플리케이션: `app/lib/date-utils.ts`의 한국 시간대 유틸리티 함수 사용

자세한 내용은 [타임존 설정](./TIMEZONE_SETUP.md) 참조

### 3.2 Prisma 설정

```bash
# Prisma 클라이언트 생성
pnpm run db:generate

# 데이터베이스 스키마 적용
pnpm run db:push

# Prisma Studio 실행 (선택사항)
pnpm run db:studio
# 브라우저에서 http://localhost:5555 접속
```

### 3.3 Prisma 빌드 환경 변수

Prisma 빌드 시 필요한 환경 변수:
- `DATABASE_URL`: 연결 문자열
- `DIRECT_URL`: 직접 연결 (마이그레이션용)

자세한 내용은 [Prisma 빌드 환경 변수](./PRISMA_BUILD_ENV_VARIABLES.md) 참조

---

## 4. AI 프로바이더 설정

### 4.1 OpenAI 설정

1. [OpenAI 콘솔](https://platform.openai.com/api-keys)에서 API 키 생성
2. `.env.local` 파일에 추가:
```env
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

### 4.2 Google Gemini 설정

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 생성
2. `.env.local` 파일에 추가:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 4.3 기본 프로바이더 설정

```env
DEFAULT_AI_PROVIDER="openai"  # openai, gemini, auto
NEXT_PUBLIC_DEFAULT_AI_PROVIDER="openai"
```

### 4.4 AI 가격 설정

비용 계산을 위한 환경 변수:
```env
OPENAI_GPT4O_MINI_INPUT_PER_1K_USD=0.00015
OPENAI_GPT4O_MINI_OUTPUT_PER_1K_USD=0.00060
GEMINI_PRO_INPUT_PER_1K_USD=0.0005
GEMINI_PRO_OUTPUT_PER_1K_USD=0.0015
```

자세한 내용은:
- [AI 설정](./AI_SETUP.md)
- [AI 가격 설정](./AI_PRICING_SETUP.md)
- [프로바이더 설정 플로우](./PROVIDER_SETTINGS_FLOW.md)

---

## 5. 개발 서버 실행

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 http://localhost:3000 접속
```

---

## 6. 관리자 계정 설정

### 6.1 관리자 계정 생성

```bash
# 관리자 계정 생성 (개발용)
curl -X POST http://localhost:3000/api/admin/setup \
  -H "Content-Type: application/json" \
  -d '{"userId": "USER_ID", "action": "promote"}'
```

---

## 7. 시스템 최적화

### 7.1 데이터베이스 인덱스 생성

```bash
# 인덱스 생성
curl -X POST http://localhost:3000/api/admin/optimize-database \
  -H "Content-Type: application/json" \
  -d '{"action": "create_indexes"}'
```

### 7.2 데이터 정리

```bash
# 데이터 정리
curl -X POST http://localhost:3000/api/admin/optimize-database \
  -H "Content-Type: application/json" \
  -d '{"action": "cleanup"}'
```

---

## 8. 프로덕션 준비

### 8.1 프로덕션 체크리스트

프로덕션 배포 전 확인사항:
- [ ] 모든 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] AI 프로바이더 API 키 설정
- [ ] 암호화 키 설정
- [ ] 이메일 서비스 설정
- [ ] 보안 설정 확인
- [ ] 성능 최적화 완료

자세한 내용은 [프로덕션 준비 체크리스트](./PRODUCTION_READINESS_CHECKLIST.md) 참조

---

## 9. 문제 해결

### 9.1 데이터베이스 연결 오류

```bash
# 데이터베이스 URL 확인
echo $DATABASE_URL

# Prisma 클라이언트 재생성
pnpm run db:generate

# 데이터베이스 마이그레이션
pnpm run db:push
```

### 9.2 암호화 키 오류

```bash
# 암호화 키 확인
echo $ENCRYPTION_KEY

# 키 강도 검사
curl http://localhost:3000/api/admin/rotate-keys
```

### 9.3 빌드 오류

자세한 내용은:
- 빌드 관련 상세 문서는 [빌드 및 배포 가이드](./BUILD_AND_DEPLOYMENT.md) 참조

---

## 참고 문서

### 설정 관련
- [환경 변수 관리 전략](./ENVIRONMENT_VARIABLE_STRATEGY.md)
- [Doppler 토큰 설정](./DOPPLER_TOKEN_SETUP.md)
- [Node.js 업그레이드 가이드](./NODE_UPGRADE_GUIDE.md)
- [타임존 설정](./TIMEZONE_SETUP.md)

### AI 관련
- [AI 설정](./AI_SETUP.md)
- [AI 가격 설정](./AI_PRICING_SETUP.md)
- [프로바이더 설정 플로우](./PROVIDER_SETTINGS_FLOW.md)
- [AI 프로바이더 설정 실패 분석](./AI_PROVIDER_SETTINGS_FAILURE_ANALYSIS.md)

### 데이터베이스 관련
- [Prisma 빌드 환경 변수](./PRISMA_BUILD_ENV_VARIABLES.md) - Prisma 빌드 시 필수 참조
- [Prisma Lazy 초기화 분석](./PRISMA_LAZY_INITIALIZATION_ANALYSIS.md) - Prisma 최적화 참조
- 스키마 관련 상세 문서는 [데이터베이스 스키마](../DATABASE_SCHEMA.md) 참조

### 배포 관련
- [프로덕션 준비 체크리스트](./PRODUCTION_READINESS_CHECKLIST.md) - 배포 전 필수 체크리스트
- 배포 관련 상세 문서는 [빌드 및 배포 가이드](./BUILD_AND_DEPLOYMENT.md) 참조

---

**작성일**: 2025-12-16  
**최종 업데이트**: 2025-12-16
