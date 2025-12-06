# 패키지 구조 가이드

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 디렉토리 구조

```
packages/hua-ui/
├── src/                          # 소스 코드
│   ├── index.ts                  # Core 엔트리 포인트
│   ├── form.ts                   # Form 서브패키지
│   ├── navigation.ts             # Navigation 서브패키지
│   ├── feedback.ts               # Feedback 서브패키지
│   ├── advanced.ts               # Advanced 엔트리 포인트
│   ├── advanced/                  # Advanced 서브패키지
│   │   ├── dashboard.ts         # Dashboard 컴포넌트
│   │   └── motion.ts            # Motion 컴포넌트
│   ├── components/               # 컴포넌트 소스
│   │   ├── dashboard/           # Dashboard 컴포넌트 (20+)
│   │   ├── advanced/            # Advanced 컴포넌트
│   │   ├── Icon/                # Icon 시스템
│   │   └── [70+ 컴포넌트 파일]
│   ├── lib/                      # 유틸리티 및 헬퍼
│   │   ├── utils.ts             # 공용 유틸리티
│   │   ├── icons.ts             # 아이콘 정의
│   │   ├── icon-providers.ts    # 아이콘 프로바이더
│   │   ├── icon-aliases.ts      # 아이콘 별칭
│   │   ├── icon-names.ts        # 아이콘 이름 관리
│   │   ├── phosphor-icons.ts    # Phosphor 아이콘 매핑
│   │   ├── styles/              # 스타일 유틸리티
│   │   │   ├── colors.ts        # 색상 정의
│   │   │   ├── variants.ts      # 변형 정의
│   │   │   ├── utils.ts         # 스타일 유틸리티
│   │   │   └── index.ts         # 스타일 export
│   │   └── types/               # 타입 정의
│   │       ├── common.ts        # 공용 타입
│   │       └── index.ts         # 타입 export
│   ├── hooks/                    # 커스텀 훅
│   │   └── useScrollToggle.ts   # 스크롤 토글 훅
│   └── styles/                   # CSS 파일
│       └── toast.css            # Toast 애니메이션 CSS
├── dist/                         # 빌드 출력
├── docs/                         # 문서
│   ├── ARCHITECTURE.md          # 아키텍처 문서
│   ├── SUBPACKAGE_ANALYSIS.md   # 서브패키지 분석
│   ├── ICON_SYSTEM.md           # 아이콘 시스템
│   └── [기타 문서]
├── scripts/                      # 빌드 스크립트
│   ├── analyze-bundle.js        # 번들 분석
│   ├── generate-icon-types.ts   # 아이콘 타입 생성
│   └── generate-icon-snippets.ts # 아이콘 스니펫 생성
├── package.json                 # 패키지 설정
├── tsup.config.ts               # 빌드 설정
├── tsconfig.json                # TypeScript 설정
├── vitest.config.ts             # 테스트 설정
└── README.md                    # 메인 README
```

---

## 엔트리 포인트 구조

### Core (`src/index.ts`)

**역할**: 메인 엔트리 포인트, 대부분의 컴포넌트 export

**구조**:
```typescript
// UI Components - Core
export { Button, Action, Input, Link, Icon, Avatar, Modal } from './components/...';

// UI Components - Layout
export { Container, Grid, Stack, Card, Panel } from './components/...';

// UI Components - Navigation
export { Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition } from './components/...';

// UI Components - Form
export { Form, Input, Select, Checkbox, ... } from './components/...';

// UI Components - Feedback
export { Alert, ToastProvider, useToast, LoadingSpinner, Tooltip } from './components/...';

// UI Components - Overlay
export { Modal, Drawer, BottomSheet, Popover, Dropdown } from './components/...';

// Utilities
export { merge, mergeIf, mergeMap, cn, formatRelativeTime } from './lib/utils';

// Icons
export { Icon, IconProvider, useIconContext } from './components/Icon';
export type { IconName, IconSet } from './lib/icons';
```

---

### Form (`src/form.ts`)

**역할**: 폼 관련 컴포넌트만 export

**구조**:
```typescript
// Form structure
export { Form, FormField, FormGroup } from './components/Form';

// Basic form inputs
export { Input, Textarea, Label } from './components/...';

// Selection inputs
export { Select, Checkbox, Radio, Switch, Slider } from './components/...';

// Advanced form inputs
export { DatePicker, Upload, Autocomplete } from './components/...';
```

---

### Navigation (`src/navigation.ts`)

**역할**: 대규모 앱 구조에 필요한 네비게이션 컴포넌트

**구조**:
```typescript
export { PageNavigation } from './components/PageNavigation';
export { PageTransition } from './components/PageTransition';
```

---

### Feedback (`src/feedback.ts`)

**역할**: 글로벌 상태 관리가 필요한 Toast 컴포넌트

**구조**:
```typescript
export { ToastProvider, useToast } from './components/Toast';
export type { Toast } from './components/Toast';
```

---

### Advanced (`src/advanced.ts`)

**역할**: 고급 기능 및 특수 도메인 컴포넌트

**구조**:
```typescript
// Dashboard widgets
export * from './advanced/dashboard';

// Motion components
export * from './advanced/motion';

// Advanced specialized components
export { Bookmark, ChatMessage, EmotionAnalysis, ... } from './components/...';
```

---

## 컴포넌트 구조

### 컴포넌트 분류

#### 1. Core Components (`src/components/`)
기본 UI 컴포넌트들:
- `Button.tsx`, `Input.tsx`, `Link.tsx`
- `Card.tsx`, `Container.tsx`, `Grid.tsx`
- `Modal.tsx`, `Drawer.tsx`, `BottomSheet.tsx`
- `Table.tsx`, `Badge.tsx`, `Progress.tsx`
- 등 70+ 컴포넌트

#### 2. Dashboard Components (`src/components/dashboard/`)
대시보드 전용 위젯:
- `StatCard.tsx`, `MetricCard.tsx`, `SummaryCard.tsx`
- `TransactionsTable.tsx`, `TrendChart.tsx`, `BarChart.tsx`
- `DashboardSidebar.tsx`, `DashboardToolbar.tsx`
- `ActivityFeed.tsx`, `NotificationCard.tsx`
- 등 20+ 컴포넌트

#### 3. Advanced Components (`src/components/advanced/`)
고급 모션 및 실험 기능:
- `AdvancedPageTransition.tsx`
- `usePageTransition.ts`
- `usePageTransitionManager.ts`

#### 4. Icon System (`src/components/Icon/`)
아이콘 시스템:
- `Icon.tsx` - 메인 Icon 컴포넌트
- `IconProvider.tsx` - 글로벌 아이콘 설정
- `icon-store.ts` - 아이콘 저장소

---

## 유틸리티 구조

### `src/lib/utils.ts`
공용 유틸리티 함수:
- `merge` - 클래스 병합
- `mergeIf` - 조건부 클래스 병합
- `mergeMap` - 객체 기반 클래스 병합
- `cn` - merge의 별칭 (shadcn/ui 호환)
- `formatRelativeTime` - 상대 시간 포맷팅

### `src/lib/icons.ts`
아이콘 정의 및 카테고리:
- `iconCategories` - 아이콘 카테고리
- `emotionIcons` - 감정 아이콘
- `statusIcons` - 상태 아이콘

### `src/lib/icon-providers.ts`
아이콘 프로바이더 관리:
- Lucide React 프로바이더
- Phosphor Icons 프로바이더
- 프로바이더 간 전환 로직

### `src/lib/styles/`
스타일 유틸리티:
- `colors.ts` - 색상 정의
- `variants.ts` - 컴포넌트 변형 정의
- `utils.ts` - 스타일 유틸리티 함수

---

## 파일 명명 규칙

### 컴포넌트 파일
- PascalCase: `Button.tsx`, `Card.tsx`
- 컴포넌트 이름과 파일 이름 일치

### 유틸리티 파일
- camelCase: `utils.ts`, `icon-providers.ts`
- kebab-case도 허용: `icon-aliases.ts`

### 타입 파일
- `types/` 디렉토리 내에 정의
- `common.ts`, `index.ts`

---

## 의존성 관계

### Core
- 다른 패키지에 의존하지 않음
- React, React DOM만 필요

### 서브패키지
- Core에서 컴포넌트 import 가능
- 서브패키지 간 의존성 없음

### Advanced
- `@hua-labs/motion` 의존
- Core 컴포넌트 사용 가능

---

## 컴포넌트 통계

- **총 컴포넌트 수**: 70+
- **Core 컴포넌트**: 50+
- **Dashboard 컴포넌트**: 20+
- **Advanced 컴포넌트**: 5+
- **Form 컴포넌트**: 10+
- **Navigation 컴포넌트**: 2
- **Feedback 컴포넌트**: 1 (Toast)

---

## 빌드 출력 구조

```
dist/
├── index.js / index.mjs          # Core (ESM + CJS)
├── form.js / form.mjs            # Form 서브패키지
├── navigation.js / navigation.mjs # Navigation 서브패키지
├── feedback.js / feedback.mjs    # Feedback 서브패키지
├── advanced.js / advanced.mjs    # Advanced 엔트리
├── advanced-dashboard.mjs        # Dashboard 서브패키지
├── advanced-motion.mjs           # Motion 서브패키지
├── components/                   # 개별 컴포넌트 (선택적)
└── *.d.ts                        # TypeScript 타입 정의
```

---

## 참고 문서

- [아키텍처 문서](./ARCHITECTURE.md)
- [서브패키지 분석](./SUBPACKAGE_ANALYSIS.md)
- [아이콘 시스템](./ICON_SYSTEM.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

