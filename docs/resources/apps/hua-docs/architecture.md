# my-docs Architecture

**작성일**: 2026-03-13

---

## 개요

HUA 플랫폼 공식 문서 사이트. 패키지 API 문서, 컴포넌트 레지스트리, 워크플로우 가이드를 제공합니다.

## 기술 스택

- Next.js (App Router)
- TypeScript
- @hua-labs/ui (문서용 컴포넌트)
- @hua-labs/i18n-core (다국어)

## 디렉토리 구조

```
apps/my-docs/
├── app/
│   ├── docs/           # 문서 페이지
│   │   └── components/ # 컴포넌트별 문서 페이지
│   ├── packages/       # 패키지별 문서 페이지
│   ├── ai-docs/        # AI 문서
│   ├── workflow/        # 워크플로우 가이드
│   ├── api/            # API 라우트
│   ├── layout.tsx
│   └── page.tsx
├── registry/
│   ├── metadata/       # 컴포넌트 메타데이터 (22+ 파일)
│   ├── hooks/          # 훅 레지스트리
│   └── i18n/           # i18n 레지스트리
├── lib/
│   └── translations/   # en, ko 번역 파일
├── types/
│   └── i18n-types.generated.ts  # 자동 생성 i18n 타입
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```

## 레지스트리 시스템

`registry/metadata/` 디렉토리에 컴포넌트별 메타데이터 파일이 있습니다. 각 파일은 컴포넌트의 props, 사용 예시, 접근성 정보를 정의합니다.

현재 22개+ 컴포넌트 메타데이터:
activity-feed, bar-chart, dashboard-grid, dashboard-sidebar, dashboard-toolbar, empty-state, kanban-board, membership-badge, merchant-list, metric-card, mini-bar-chart, notification-card, profile-card, progress-card, quick-action-card, routing-breakdown-card, settlement-timeline, stat-card, summary-card, transaction-detail-drawer, transactions-table, trend-chart

## 다국어 지원

- 영어 (`lib/translations/en/`)
- 한국어 (`lib/translations/ko/`)
- 자동 생성 타입: `types/i18n-types.generated.ts`

---

**최종 업데이트**: 2026-03-13
