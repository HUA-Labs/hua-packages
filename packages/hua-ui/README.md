# @hua-labs/ui

Modern React UI component library with 70+ production-ready components.
70개 이상의 프로덕션 레디 React UI 컴포넌트 라이브러리

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **⚠️ Alpha Release**: This package is currently in alpha. APIs may change before the stable release.

---

[English](#english) | [한국어](#korean)

## English

### Overview

Accessible, TypeScript-native component library for React applications. Provides modular entry points for optimal bundle size and comprehensive dark mode support.

### Features

- 70+ production-ready components
- Modular entry points for bundle optimization
- Full TypeScript support
- Dark mode support
- Accessible (ARIA attributes, keyboard navigation)
- Responsive design
- Tree-shaking friendly
- Zero external dependencies (except React)
- Tailwind CSS based styling

### Installation

```bash
npm install @hua-labs/ui
# or
yarn add @hua-labs/ui
# or
pnpm add @hua-labs/ui
```

### Peer Dependencies

```bash
# Required
npm install react react-dom

# Optional (for Phosphor Icons support)
npm install @phosphor-icons/react
```

### Quick Start

```tsx
import { Button, Input, Card, ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <div>
        <Button>Click me</Button>
        <Input placeholder="Enter text" />
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
          </CardHeader>
          <CardContent>
            Card content
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
```

### Entry Points

HUA UI is organized into **Core**, **Form**, **Navigation**, **Feedback**, and **Advanced** entry points. Import only the components you need from specific entry points to optimize bundle size.

| Entry | Path | Description |
|-------|------|-------------|
| Core | `@hua-labs/ui` | Most commonly used basic components (Button, Card, Badge, Alert, Modal, Drawer, etc.) |
| Form | `@hua-labs/ui/form` | All form components (Input, Select, DatePicker, Upload, Autocomplete, etc.) |
| Navigation | `@hua-labs/ui/navigation` | Navigation components for page transitions (PageNavigation, PageTransition) |
| Feedback | `@hua-labs/ui/feedback` | Toast notifications for user feedback (ToastProvider, useToast) |
| Advanced (all) | `@hua-labs/ui/advanced` | Advanced components + experimental features |
| Dashboard widgets | `@hua-labs/ui/advanced/dashboard` | Dashboard-specific components (StatCard, TransactionsTable, TrendChart, etc.) |
| Motion/Experimental | `@hua-labs/ui/advanced/motion` | AdvancedPageTransition and experimental features |

```tsx
// Core components (most commonly used components)
import { Button, Card, Table, Badge, Alert, Modal, Drawer } from '@hua-labs/ui';

// Form components (bundle optimized)
import { Input, Select, DatePicker, Form } from '@hua-labs/ui/form';

// Navigation components (for page transitions)
import { PageNavigation, PageTransition } from '@hua-labs/ui/navigation';

// Feedback components (Toast - user feedback)
import { ToastProvider, useToast } from '@hua-labs/ui/feedback';
import '@hua-labs/ui/styles/toast.css';

// Advanced components
import { StatCard, DashboardSidebar } from '@hua-labs/ui/advanced';

// Import from specific sub-paths
import { TransactionsTable } from '@hua-labs/ui/advanced/dashboard';
import { AdvancedPageTransition } from '@hua-labs/ui/advanced/motion';
```

**Note**: See [package structure documentation](./docs/PACKAGE_STRUCTURE.md) for detailed entry point information.

### Bundle Optimization

HUA UI supports modular entry points and tree-shaking. Import only the components you need from specific entry points to optimize bundle size.

**Optimization Tips**:
- Import only needed components
- Use specific entry points (Form, Navigation, Feedback)
- Import Advanced components only when actually used

**Note**: You can import all components from Core, but it's not recommended. Using specific entry points provides better bundle size optimization. Next.js + Turbopack supports tree-shaking automatically.

### CSS Import (Toast Component Usage)

If you use Toast components, you need to import the CSS file:

```css
/* Add to globals.css or main CSS file */
@import '@hua-labs/ui/styles/toast.css';
```

Or in JavaScript/TypeScript:

```tsx
// app/layout.tsx or _app.tsx
import '@hua-labs/ui/styles/toast.css';
```

### API Overview

#### Core Components

- **Basic UI**: Button, Action, Input, Icon, Avatar
- **Layout**: Container, Grid, Stack, Card, Panel
- **Navigation**: Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition
- **Data Display**: Table, Badge, Progress, Skeleton
- **Feedback**: Alert, Toast, LoadingSpinner, Tooltip
- **Overlay**: Modal, Drawer, Popover, Dropdown, BottomSheet
- **Form**: Form, Input, Select, Checkbox, Radio, Switch, Slider, Textarea, DatePicker, Upload, Autocomplete
- **Interactive**: Accordion, Tabs, Menu, Command
- **Theme**: ThemeProvider, ThemeToggle

#### Utilities

- `merge`, `mergeIf`, `mergeMap`, `cn` - Class merging utilities
- `formatRelativeTime` - Date formatting utility

### Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md) - Core architecture and design principles
- [Package Structure](./docs/PACKAGE_STRUCTURE.md) - Package structure and internal organization
- [Development Guide](./docs/DEVELOPMENT_GUIDE.md) - Component development guide
- [Icon System](./docs/ICON_SYSTEM.md) - Icon system guide

### Related Packages

- [`@hua-labs/hua-ux`](../hua-ux/README.md) - Integrated framework (UI + Motion + i18n)
- [`@hua-labs/motion-core`](../hua-motion-core/README.md) - Animation hooks
- [`@hua-labs/i18n-core`](../hua-i18n-core/README.md) - Internationalization core

### Requirements

- React >= 19.0.0
- React DOM >= 19.0.0
- Tailwind CSS (for styling)
- Optional: @phosphor-icons/react (for Phosphor icon support)

## Korean

### 개요

접근 가능하고 TypeScript 네이티브인 React 컴포넌트 라이브러리입니다. 최적의 번들 크기를 위한 모듈식 진입점과 포괄적인 다크 모드 지원을 제공합니다.

### 주요 기능

- 70개 이상의 프로덕션 레디 컴포넌트
- 번들 최적화를 위한 모듈식 진입점
- 완전한 TypeScript 지원
- 다크 모드 지원
- 접근성 (ARIA 속성, 키보드 네비게이션)
- 반응형 디자인
- Tree-shaking 친화적
- React 외부 의존성 없음
- Tailwind CSS 기반 스타일링

### 설치

```bash
npm install @hua-labs/ui
# or
yarn add @hua-labs/ui
# or
pnpm add @hua-labs/ui
```

### Peer Dependencies

```bash
# 필수
npm install react react-dom

# 선택사항 (Phosphor Icons 지원용)
npm install @phosphor-icons/react
```

### 빠른 시작

```tsx
import { Button, Input, Card, ThemeProvider } from '@hua-labs/ui';

function App() {
  return (
    <ThemeProvider>
      <div>
        <Button>클릭하세요</Button>
        <Input placeholder="텍스트 입력" />
        <Card>
          <CardHeader>
            <CardTitle>카드 제목</CardTitle>
          </CardHeader>
          <CardContent>
            카드 내용
          </CardContent>
        </Card>
      </div>
    </ThemeProvider>
  );
}
```

### 진입점

HUA UI는 **Core**, **Form**, **Navigation**, **Feedback**, **Advanced** 진입점으로 구성됩니다. 번들 크기를 최적화하려면 필요한 컴포넌트만 특정 진입점에서 import하세요.

| 진입점 | 경로 | 설명 |
|--------|------|------|
| Core | `@hua-labs/ui` | 가장 많이 사용되는 기본 컴포넌트 (Button, Card, Badge, Alert, Modal, Drawer 등) |
| Form | `@hua-labs/ui/form` | 모든 폼 컴포넌트 (Input, Select, DatePicker, Upload, Autocomplete 등) |
| Navigation | `@hua-labs/ui/navigation` | 페이지 전환용 네비게이션 컴포넌트 (PageNavigation, PageTransition) |
| Feedback | `@hua-labs/ui/feedback` | 사용자 피드백용 Toast 알림 (ToastProvider, useToast) |
| Advanced (전체) | `@hua-labs/ui/advanced` | 고급 컴포넌트 + 실험적 기능 |
| Dashboard 위젯 | `@hua-labs/ui/advanced/dashboard` | 대시보드 전용 컴포넌트 (StatCard, TransactionsTable, TrendChart 등) |
| Motion/실험적 | `@hua-labs/ui/advanced/motion` | AdvancedPageTransition 및 실험적 기능 |

```tsx
// Core 컴포넌트 (가장 많이 사용되는 컴포넌트)
import { Button, Card, Table, Badge, Alert, Modal, Drawer } from '@hua-labs/ui';

// Form 컴포넌트 (번들 최적화)
import { Input, Select, DatePicker, Form } from '@hua-labs/ui/form';

// Navigation 컴포넌트 (페이지 전환용)
import { PageNavigation, PageTransition } from '@hua-labs/ui/navigation';

// Feedback 컴포넌트 (Toast - 사용자 피드백)
import { ToastProvider, useToast } from '@hua-labs/ui/feedback';
import '@hua-labs/ui/styles/toast.css';

// Advanced 컴포넌트
import { StatCard, DashboardSidebar } from '@hua-labs/ui/advanced';

// 특정 하위 경로에서 import
import { TransactionsTable } from '@hua-labs/ui/advanced/dashboard';
import { AdvancedPageTransition } from '@hua-labs/ui/advanced/motion';
```

**참고**: 자세한 진입점 정보는 [패키지 구조 문서](./docs/PACKAGE_STRUCTURE.md)를 참고하세요.

### 번들 최적화

HUA UI는 모듈식 진입점과 tree-shaking을 지원합니다. 번들 크기를 최적화하려면 필요한 컴포넌트만 특정 진입점에서 import하세요.

**최적화 팁**:
- 필요한 컴포넌트만 import
- 특정 진입점 사용 (Form, Navigation, Feedback)
- Advanced 컴포넌트는 실제로 사용할 때만 import

**참고**: Core에서 모든 컴포넌트를 import할 수 있지만 권장하지 않습니다. 특정 진입점을 사용하면 더 나은 번들 크기 최적화를 제공합니다. Next.js + Turbopack은 자동으로 tree-shaking을 지원합니다.

### CSS Import (Toast 컴포넌트 사용 시)

Toast 컴포넌트를 사용하는 경우 CSS 파일을 import해야 합니다:

```css
/* globals.css 또는 메인 CSS 파일에 추가 */
@import '@hua-labs/ui/styles/toast.css';
```

또는 JavaScript/TypeScript에서:

```tsx
// app/layout.tsx 또는 _app.tsx
import '@hua-labs/ui/styles/toast.css';
```

### API 개요

#### Core 컴포넌트

- **기본 UI**: Button, Action, Input, Icon, Avatar
- **레이아웃**: Container, Grid, Stack, Card, Panel
- **네비게이션**: Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition
- **데이터 표시**: Table, Badge, Progress, Skeleton
- **피드백**: Alert, Toast, LoadingSpinner, Tooltip
- **오버레이**: Modal, Drawer, Popover, Dropdown, BottomSheet
- **폼**: Form, Input, Select, Checkbox, Radio, Switch, Slider, Textarea, DatePicker, Upload, Autocomplete
- **인터랙티브**: Accordion, Tabs, Menu, Command
- **테마**: ThemeProvider, ThemeToggle

#### 유틸리티

- `merge`, `mergeIf`, `mergeMap`, `cn` - 클래스 병합 유틸리티
- `formatRelativeTime` - 날짜 포맷팅 유틸리티

### 문서

- [아키텍처 문서](./docs/ARCHITECTURE.md) - 핵심 아키텍처 및 설계 원칙
- [패키지 구조](./docs/PACKAGE_STRUCTURE.md) - 패키지 구조 및 내부 구조
- [개발 가이드](./docs/DEVELOPMENT_GUIDE.md) - 컴포넌트 추가 및 개발 가이드
- [아이콘 시스템](./docs/ICON_SYSTEM.md) - 아이콘 시스템 가이드

### 관련 패키지

- [`@hua-labs/hua-ux`](../hua-ux/README.md) - 통합 프레임워크 (UI + Motion + i18n)
- [`@hua-labs/motion-core`](../hua-motion-core/README.md) - 애니메이션 훅
- [`@hua-labs/i18n-core`](../hua-i18n-core/README.md) - 국제화 핵심

### 요구사항

- React >= 19.0.0
- React DOM >= 19.0.0
- Tailwind CSS (스타일링용)
- 선택사항: @phosphor-icons/react (Phosphor 아이콘 지원용)

## License

MIT License

## Repository

<https://github.com/HUA-Labs/HUA-Labs-public>
