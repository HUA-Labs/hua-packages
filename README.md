# HUA Platform

> Ship UX faster. UI + Motion + i18n, pre-wired.

HUA Labs의 메인 모노레포입니다. 오픈소스 React 프레임워크와 프로덕트를 함께 개발합니다.

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
| [`hua-state`](./packages/hua-state) | 상태 관리 유틸리티 |
| [`hua-hooks`](./packages/hua-hooks) | 공용 React 훅 |
| [`hua-utils`](./packages/hua-utils) | 공용 유틸리티 함수 |

### SDUI (Server-Driven UI)

| Package | Description |
|---------|-------------|
| [`sdui-core`](./packages/sdui-core) | SDUI 코어 엔진 |
| [`sdui-renderers`](./packages/sdui-renderers) | 컴포넌트 렌더러 |
| [`sdui-inspector`](./packages/sdui-inspector) | 개발용 인스펙터 |

## Apps

### Products

| App | Description | URL |
|-----|-------------|-----|
| [`my-app`](./apps/my-app) | AI 감정 다이어리 | [sumdiary.com](https://sumdiary.com) |
| [`my-api`](./apps/my-api) | SUM API 서버 | - |

### Framework & Docs

| App | Description | URL |
|-----|-------------|-----|
| [`hua-docs`](./apps/hua-docs) | HUA UX 문서 사이트 | [docs.hua-labs.com](https://docs.hua-labs.com) |
| [`hua-official`](./apps/hua-official) | HUA Labs 공식 사이트 | [hua-labs.com](https://hua-labs.com) |

### Tools (WIP)

| App | Description |
|-----|-------------|
| [`sdui-studio`](./apps/sdui-studio) | SDUI 비주얼 에디터 |
| [`hue`](./apps/hue) | HUA UI 비주얼 에디터 |

## Development

### 요구사항

- Node.js 22.x
- pnpm 10.17.0+

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 전체 개발 서버
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=hua-docs
pnpm dev --filter=hua-official

# 빌드
pnpm build

# 타입 체크
pnpm type-check

# 린트
pnpm lint

# 테스트
pnpm test
```

### 프로젝트 구조

```
hua-platform/
├── apps/                    # 애플리케이션
│   ├── hua-docs/           # 문서 사이트
│   ├── hua-official/       # 공식 사이트
│   ├── sdui-studio/        # SDUI 에디터
│   └── ...
├── packages/               # npm 패키지
│   ├── hua-ux/            # 통합 프레임워크
│   ├── hua-ui/            # UI 컴포넌트
│   ├── hua-i18n-*/        # i18n 패키지들
│   ├── hua-motion-*/      # Motion 패키지들
│   └── ...
├── docs/                   # 문서 및 devlogs
└── scripts/               # 빌드/배포 스크립트
```

## Tech Stack

- **Framework**: Next.js 15, React 19
- **Language**: TypeScript 5.9
- **Build**: Turbo, tsup
- **Styling**: Tailwind CSS
- **Testing**: Vitest, Playwright
- **Docs**: Storybook

## Links

**Products**
- [SUM Diary](https://sumdiary.com) - AI 감정 다이어리

**Framework**
- [Documentation](https://docs.hua-labs.com)
- [npm: @hua-labs/hua-ux](https://www.npmjs.com/package/@hua-labs/hua-ux)
- [npm: @hua-labs/ui](https://www.npmjs.com/package/@hua-labs/ui)

**Community**
- [HUA Labs](https://hua-labs.com)
- [GitHub Issues](https://github.com/HUA-Labs/HUA-platform/issues)

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with HUA by [HUA Labs](https://hua-labs.com)
