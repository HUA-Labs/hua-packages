# HUA Platform

> Engineering Emotion — UI, Motion, i18n을 하나로.

HUA Labs의 메인 모노레포입니다. 감정을 엔지니어링하는 오픈소스 React 프레임워크와 프로덕트를 함께 개발합니다.

## Products

| Product | Description | URL |
|---------|-------------|-----|
| [SUM Diary](./apps/my-app) | AI 기반 감정 분석 일기 서비스 | [sumdiary.com](https://sumdiary.com) |
| [HUA Docs](./apps/hua-docs) | HUA UX 프레임워크 문서 | [docs.hua-labs.com](https://docs.hua-labs.com) |
| [HUA Official](./apps/hua-official) | HUA Labs 공식 사이트 | [hua-labs.com](https://hua-labs.com) |

## Quick Start

```bash
# HUA UX로 새 프로젝트 시작
npx create-hua-ux my-app
cd my-app
pnpm dev
```

또는 기존 프로젝트에 추가:

```bash
pnpm add @hua-labs/hua-ux
```

## Packages

### Core Framework

| Package | Version | Description |
|---------|---------|-------------|
| [`@hua-labs/hua-ux`](./packages/hua-ux) | ![npm](https://img.shields.io/npm/v/@hua-labs/hua-ux) | UI + Motion + i18n 통합 프레임워크 |
| [`@hua-labs/ui`](./packages/hua-ui) | ![npm](https://img.shields.io/npm/v/@hua-labs/ui) | 100+ React UI 컴포넌트 |
| [`create-hua-ux`](./packages/create-hua-ux) | ![npm](https://img.shields.io/npm/v/create-hua-ux) | 프로젝트 생성 CLI |

### i18n (국제화)

| Package | Description |
|---------|-------------|
| [`hua-i18n-core`](./packages/hua-i18n-core) | SSR 지원, zero-flicker 다국어 시스템 |
| [`hua-i18n-loaders`](./packages/hua-i18n-loaders) | 번역 파일 로더 (JSON, YAML, API) |
| [`hua-i18n-formatters`](./packages/hua-i18n-formatters) | 날짜, 숫자, 상대시간 포매터 |
| [`hua-i18n-advanced`](./packages/hua-i18n-advanced) | 복수형, 성별, 컨텍스트 처리 |
| [`hua-i18n-ai`](./packages/hua-i18n-ai) | AI 기반 자동 번역 |
| [`hua-i18n-debug`](./packages/hua-i18n-debug) | 개발용 디버그 도구 |

### Motion (애니메이션)

| Package | Description |
|---------|-------------|
| [`hua-motion-core`](./packages/hua-motion-core) | 제로 의존성 애니메이션 훅 |
| [`hua-motion`](./packages/hua-motion) | 프리셋 애니메이션 |
| [`hua-motion-advanced`](./packages/hua-motion-advanced) | 스크롤, 제스처, 시퀀스 |

### Utilities

| Package | Description |
|---------|-------------|
| [`hua-state`](./packages/hua-state) | 상태 관리 유틸리티 (Zustand 기반) |
| [`hua-hooks`](./packages/hua-hooks) | 공용 React 훅 |
| [`hua-utils`](./packages/hua-utils) | 공용 유틸리티 함수 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| Runtime | React 19 |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | PostgreSQL + Prisma |
| Auth | NextAuth v5 |
| Build | Turborepo, tsup |
| Testing | Vitest, Playwright |
| Deploy | Vercel |

## Monorepo Structure

```
hua-platform/
├── apps/
│   ├── my-app/          # AI 감정 분석 일기 (메인 프로덕트)
│   ├── my-api/            # SUM API 서버
│   ├── hua-docs/           # 프레임워크 문서 사이트
│   └── hua-official/       # HUA Labs 공식 사이트
├── packages/
│   ├── hua-ux/             # 통합 프레임워크 (@hua-labs/hua-ux)
│   ├── hua-ui/             # UI 컴포넌트 (@hua-labs/ui)
│   ├── hua-i18n-*/         # i18n 패키지 (core, loaders, formatters, ...)
│   ├── hua-motion-*/       # Motion 패키지 (core, presets, advanced)
│   ├── hua-state/          # 상태 관리
│   └── hua-utils/          # 유틸리티
├── docs/
│   ├── collab/             # 아키텍처, 로드맵, 태스크
│   └── devlogs/            # 개발 일지
└── scripts/                # 빌드/배포 스크립트
```

## Development

### 요구사항

- Node.js 22.x
- pnpm 10.17.0+

### 설치 및 실행

```bash
pnpm install          # 의존성 설치
pnpm dev              # 전체 개발 서버
pnpm build            # 전체 빌드
pnpm type-check       # 타입 체크
pnpm lint             # 린트
pnpm test             # 테스트
```

특정 앱만 실행:

```bash
pnpm dev --filter=my-app
pnpm dev --filter=hua-docs
pnpm build --filter=my-app
```

### 배포

커밋 메시지에 태그로 배포 제어:

```
feat: new feature [deploy my-app]
fix: bug fix [deploy docs]
```

## Links

- [SUM Diary](https://sumdiary.com) — AI 감정 분석 일기
- [HUA Docs](https://docs.hua-labs.com) — 프레임워크 문서
- [HUA Labs](https://hua-labs.com) — 공식 사이트
- [npm: @hua-labs/hua-ux](https://www.npmjs.com/package/@hua-labs/hua-ux)
- [GitHub Issues](https://github.com/HUA-Labs/HUA-platform/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with care by [HUA Labs](https://hua-labs.com)
