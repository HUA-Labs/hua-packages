# HUA Platform

HUA Labs - 감정 인터페이스 플랫폼 (Monorepo)

## 🚀 빠른 시작

```bash
# Node.js 버전 확인 (22.17.1 필요)
node --version

# 의존성 설치
pnpm install

# 개발 서버 시작 (모든 앱)
pnpm dev

# 특정 앱 개발
pnpm dev --filter=my-chat
pnpm dev --filter=my-api
pnpm dev --filter=my-app
pnpm dev --filter=hua-labs-official

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 테스트
pnpm test

# 린트
pnpm lint
```

## 📁 모노레포 구조

```
hua-platform/
├── apps/                    # 애플리케이션들
│   ├── my-chat/           # 채팅 애플리케이션
│   ├── my-api/            # API 서버
│   ├── my-app/          # 다이어리 애플리케이션
│   ├── hua-labs-official/  # 공식 웹사이트
│   └── hua-demo/           # 데모 애플리케이션들
├── packages/               # 공통 패키지들
│   ├── hua-i18n-sdk/       # 국제화 SDK
│   ├── hua-i18n-core/      # 국제화 핵심 기능
│   ├── hua-i18n-advanced/  # 국제화 고급 기능
│   ├── hua-i18n-beginner/  # 국제화 초보자용
│   ├── hua-i18n-ai/        # 국제화 AI 기능
│   ├── hua-i18n-debug/     # 국제화 디버그 도구
│   ├── hua-i18n-plugins/   # 국제화 플러그인
│   ├── hua-my-api-sdk/    # SUM API SDK
│   ├── hua-config/         # 공통 설정
│   ├── hua-types/          # 공통 타입 정의
│   └── hua-utils/          # 공통 유틸리티
├── tools/                  # 개발 도구들
├── infra/                  # 인프라 설정
└── etc/                    # 기타 파일들
```

## 🛠️ 개발 가이드

### 환경 설정

1. **Node.js 버전**: 22.17.1 (`.nvmrc` 참조)
2. **패키지 매니저**: pnpm 8.0.0+
3. **TypeScript**: 5.8.3

### 공통 명령어

```bash
# 전체 모노레포 작업
pnpm install          # 모든 의존성 설치
pnpm dev              # 모든 앱 개발 서버 시작
pnpm build            # 모든 패키지 빌드
pnpm type-check       # 모든 패키지 타입 체크
pnpm test             # 모든 패키지 테스트
pnpm lint             # 모든 패키지 린트

# 특정 앱/패키지 작업
pnpm dev --filter=my-chat     # my-chat만 개발
pnpm build --filter=hua-i18n-sdk  # hua-i18n-sdk만 빌드
pnpm test --filter=my-api     # my-api만 테스트
```

### 패키지 개발

각 패키지는 독립적으로 개발할 수 있습니다:

```bash
# 패키지 개발
cd packages/hua-i18n-sdk
pnpm dev

# 패키지 빌드
pnpm build

# 패키지 테스트
pnpm test
```

## 🔧 기술 스택

- **프레임워크**: Next.js 15.4.1
- **언어**: TypeScript 5.8.3
- **상태 관리**: Zustand, React Context
- **스타일링**: Tailwind CSS
- **국제화**: hua-i18n-sdk
- **데이터베이스**: MongoDB, PostgreSQL
- **인증**: NextAuth.js
- **배포**: Vercel, Docker

## 📦 패키지 정보

### Apps
- **my-chat**: 실시간 채팅 애플리케이션
- **my-api**: REST API 서버
- **my-app**: 감정 다이어리 애플리케이션
- **hua-labs-official**: HUA Labs 공식 웹사이트
- **hua-ui-site**: HUA UI 컴포넌트 라이브러리 데모 사이트

### Packages
- **hua-ui**: 🎨 **shadcn/ui보다 더 직관적이고 스마트한 React 컴포넌트 라이브러리**
  - 직관적인 API (복잡한 variant 대신 간단한 prop)
  - 스마트 기본값 (자동 스타일 적용)
  - 완벽한 TypeScript 지원
  - 트리 쉐이킹으로 번들 크기 최적화
  - 하위 호환성 보장
- **hua-i18n-sdk**: 완전한 국제화 솔루션
- **hua-my-api-sdk**: SUM API 클라이언트 SDK
- **hua-utils**: 공통 유틸리티 함수들

## 🤝 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 브랜치 생성 (`feature/기능명` 또는 `fix/버그명`)
3. 코드 작성 및 테스트
4. 커밋 및 푸시
5. Pull Request 생성

## 📄 라이선스

MIT License

## 📚 문서

### 📖 공개 문서
- **[HUA UI 라이브러리 문서](./docs/HUA_UI_LIBRARY.md)** - 🎨 shadcn/ui보다 더 직관적인 React 컴포넌트 라이브러리
- **[HUA UI 개발 플랜](./docs/HUA_UI_DEVELOPMENT_PLAN.md)** - 🚀 개발 로드맵 및 차별화 전략
- **[모노레포 정리 계획](./docs/public/architecture/monorepo-cleanup-plan.md)** - 모노레포 구조 정리 계획
- **[개발 로그](./docs/devlogs/)** - 개발 과정 기록 및 이슈 추적
- **[API 문서](./docs/public/api/)** - API 스펙 및 문서
- **[개발 가이드](./docs/public/guides/)** - 개발 튜토리얼 및 가이드
- **[아키텍처 문서](./docs/public/architecture/)** - 시스템 아키텍처 설명
- **[사용자 매뉴얼](./docs/public/user-manuals/)** - 사용자 가이드

### 📋 문서 작성
- 문서는 `docs/public/` 폴더에 작성
- 비공개 문서는 `docs/private/` 폴더에 작성 (Git에서 자동 제외)
- 템플릿은 `docs/templates/` 폴더 참조

## 🔗 링크

- [HUA Labs 공식 웹사이트](https://hua-labs.com)
- [문서](https://docs.hua-labs.com)
- [API 문서](https://api.hua-labs.com)

## 🔐 GitHub Actions Secrets (배포 자동화)

배포 워크플로(`.github/workflows/deploy.yml`)가 성공하려면 아래 시크릿을 GitHub 저장소 또는 조직 단위 Secrets에 등록해야 합니다:

- `VERCEL_TOKEN`: Vercel 개인 계정 Settings → Tokens에서 생성한 Personal Token
- `VERCEL_ORG_ID`: Vercel 팀 Settings → General에서 확인 가능한 Team ID
- `VERCEL_PROJECT_ID_SUM_DIARY`: `my-app` 프로젝트 Settings → General의 Project ID
- `VERCEL_PROJECT_ID_SUM_API`: `my-api` 프로젝트 Settings → General의 Project ID
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `DATABASE_URL`: 기존 환경 변수와 동일하게 설정

시크릿이 누락되면 `amondnet/vercel-action@v25` 단계에서 `Input required and not supplied: vercel-token` 오류로 배포가 중단되므로, 브랜치 보호 전 반드시 위 시크릿 유무를 확인하세요.