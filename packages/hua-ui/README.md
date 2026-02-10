# @hua-labs/ui

Modern React UI component library — accessible, themeable, production-ready.
모던 React UI 컴포넌트 라이브러리 — 접근성, 테마, 프로덕션 레디.

[![npm version](https://img.shields.io/npm/v/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/ui.svg)](https://www.npmjs.com/package/@hua-labs/ui)
[![license](https://img.shields.io/npm/l/@hua-labs/ui.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

Accessible, TypeScript-first component library for React applications. Provides 50+ production-ready components with modular entry points for optimal bundle size, dark mode support, and Tailwind CSS integration.

React 애플리케이션을 위한 접근성 우선 TypeScript 컴포넌트 라이브러리입니다. 50개 이상의 프로덕션 레디 컴포넌트를 모듈식 진입점, 다크 모드, Tailwind CSS 통합과 함께 제공합니다.

## Features

- **50+ components** — Buttons, forms, tables, modals, overlays, and more
- **Modular entry points** — Import only what you need for optimal bundle size
- **Accessible** — ARIA attributes, keyboard navigation, WCAG compliant
- **Dark mode** — Built-in dark mode support
- **Tailwind CSS** — Utility-first styling with class variance authority
- **Tree-shakeable** — Side-effect free (except CSS)

## Installation | 설치

```bash
pnpm add @hua-labs/ui
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`

Optional peers: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` (for drag-and-drop)

## Quick Start | 빠른 시작

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@hua-labs/ui';
import { Input, Select } from '@hua-labs/ui/form';

function App() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Entry Points | 진입점

| Path | Components |
|------|------------|
| `@hua-labs/ui` | Button, Card, Badge, Alert, Modal, Drawer, Table, Avatar, etc. |
| `@hua-labs/ui/form` | Input, Select, DatePicker, Upload, Autocomplete, ColorPicker, etc. |
| `@hua-labs/ui/navigation` | PageNavigation, PageTransition |
| `@hua-labs/ui/feedback` | ToastProvider, useToast |
| `@hua-labs/ui/overlay` | Modal, Drawer, Popover, Dropdown, BottomSheet, ConfirmModal |
| `@hua-labs/ui/data` | Table, Badge, Progress, Skeleton |
| `@hua-labs/ui/interactive` | Accordion, Tabs, Menu, ContextMenu, Command |
| `@hua-labs/ui/sdui` | Server-driven UI components |
| `@hua-labs/ui/advanced` | Advanced components (dashboard, motion, emotion) |
| `@hua-labs/ui/styles/*` | CSS files (base, toast, codeblock, theme) |
| `@hua-labs/ui/icons` | Icon components |

## API Overview | API 개요

| Category | Components |
|----------|------------|
| Basic UI | Button, Icon, Avatar, Link, Badge |
| Layout | Container, Grid, Stack, Card, Panel, Divider |
| Form | Input, NumberInput, Select, Checkbox, Radio, Switch, Slider, Textarea, DatePicker, Upload, Autocomplete, ColorPicker |
| Overlay | Modal, Drawer, Popover, Dropdown, BottomSheet, ConfirmModal |
| Data | Table, Progress, Skeleton |
| Feedback | Alert, Toast, LoadingSpinner, Tooltip |
| Interactive | Accordion, Tabs, Menu, ContextMenu, Command |
| Navigation | Breadcrumb, Pagination, PageNavigation, PageTransition |
| Theme | ThemeProvider, ThemeToggle |
| Utilities | `cn`, `merge`, `mergeIf`, `mergeMap` |

## Documentation | 문서

- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UX framework (UI + Motion + i18n)
- [`@hua-labs/ui-dashboard`](https://www.npmjs.com/package/@hua-labs/ui-dashboard) — Dashboard domain components
- [`@hua-labs/motion-core`](https://www.npmjs.com/package/@hua-labs/motion-core) — Animation hooks

## Requirements | 요구사항

React >= 19.0.0 · React DOM >= 19.0.0 · Tailwind CSS · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
