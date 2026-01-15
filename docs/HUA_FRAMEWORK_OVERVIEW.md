# HUA Framework Overview

> **Last Updated**: 2026-01-15
> **Status**: Alpha (Active Development)
> **Maintainer**: HUA Labs

---

## What is HUA?

**HUA (화)** is a full-stack React framework for building products with soul.
"Ship UX faster: UI + motion + i18n, pre-wired."

The framework provides a unified developer experience for:
- UI Components (100+ components)
- Motion/Animation Hooks
- Internationalization (i18n)
- State Management
- Server-Driven UI (SDUI)

---

## Package Architecture

### Core Packages

| Package | Version | Description |
|---------|---------|-------------|
| `@hua-labs/hua-ux` | 0.1.0-alpha.12 | **메인 프레임워크** - UI, motion, i18n 통합 re-export |
| `@hua-labs/ui` | 1.1.0-alpha.1 | UI 컴포넌트 라이브러리 (71+ 기본, 14 advanced, 21 dashboard) |
| `@hua-labs/motion-core` | - | 모션 훅 (useFadeIn, useSlideUp, useBounceIn 등) |
| `@hua-labs/motion-advanced` | - | 고급 모션 훅 (useMotion - unified API) |
| `@hua-labs/i18n-core` | 1.1.0-alpha.3 | 다국어 지원 코어 |

### i18n Ecosystem

| Package | Purpose |
|---------|---------|
| `@hua-labs/i18n-core` | Core translation functions |
| `@hua-labs/i18n-core-zustand` | Zustand-based state management |
| `@hua-labs/i18n-loaders` | Translation file loaders (JSON, YAML) |
| `@hua-labs/i18n-date` | Date/time formatting |
| `@hua-labs/i18n-number` | Number formatting |
| `@hua-labs/i18n-currency` | Currency formatting |
| `@hua-labs/i18n-plugins` | Plugin system |
| `@hua-labs/i18n-debug` | Development debugging tools |
| `@hua-labs/i18n-ai` | AI-powered translation |
| `@hua-labs/i18n-sdk` | SDK for external integrations |

### Utility Packages

| Package | Purpose |
|---------|---------|
| `@hua-labs/utils` | Shared utilities (merge, cn, etc.) |
| `@hua-labs/hooks` | Common React hooks |
| `@hua-labs/state` | State management utilities |
| `create-hua-ux` | CLI scaffolding tool |

### SDUI (Server-Driven UI)

| Package | Purpose |
|---------|---------|
| `@hua-labs/sdui-core` | SDUI core engine |
| `@hua-labs/sdui-renderers` | Component renderers |
| `@hua-labs/sdui-inspector` | Development inspector |

---

## UI Components (106+)

### Base Components (71)

**Form**
- Input, NumberInput, Textarea, Select, Checkbox, Radio, Switch, Slider
- Form, FormControl, Label, DatePicker, ColorPicker, Autocomplete, Upload

**Layout**
- Container, Grid, Stack, Card, Panel, Divider, ComponentLayout

**Navigation**
- Navigation, Breadcrumb, Menu, Tabs, Pagination, PageNavigation
- ScrollArea, ScrollToTop, ScrollIndicator, ScrollProgress

**Feedback**
- Alert, Toast, Modal, ConfirmModal, Drawer, BottomSheet
- Progress, LoadingSpinner, Skeleton

**Display**
- Button, Badge, Avatar, Tooltip, Popover, Dropdown, ContextMenu
- Accordion, Table, Command, CodeBlock

**Theme**
- ThemeProvider, ThemeToggle, LanguageToggle

**Emotion (Experimental)**
- EmotionButton, EmotionSelector, EmotionMeter, EmotionAnalysis

### Advanced Components (14)

| Component | Description |
|-----------|-------------|
| Carousel | 자동 재생, 스와이프 지원 슬라이더 |
| Marquee | 무한 스크롤 텍스트/콘텐츠 |
| Parallax | 스크롤 기반 패럴랙스 효과 |
| GlowCard | 마우스 추적 글로우 효과 카드 |
| SpotlightCard | 스포트라이트 호버 효과 |
| TiltCard | 3D 틸트 호버 효과 |
| TextReveal | 스크롤 텍스트 공개 애니메이션 |
| AnimatedGradient | 애니메이션 그라데이션 배경 |
| VideoBackground | 비디오 배경 컴포넌트 |
| AdvancedPageTransition | 페이지 전환 애니메이션 |

### Dashboard Components (21)

Pre-built dashboard widgets for analytics, stats, charts, etc.

---

## Motion Hooks

### Entrance Animations
| Hook | Description |
|------|-------------|
| `useFadeIn` | 페이드인 (IntersectionObserver 지원) |
| `useSlideUp` | 아래→위 슬라이드 |
| `useSlideLeft` | 왼쪽→오른쪽 슬라이드 |
| `useSlideRight` | 오른쪽→왼쪽 슬라이드 |
| `useScaleIn` | 스케일 확대 효과 |
| `useBounceIn` | 바운스 입장 효과 |

### Interaction Hooks
| Hook | Description |
|------|-------------|
| `useHoverMotion` | 호버 애니메이션 |
| `useClickToggle` | 클릭 토글 상태 |
| `useFocusToggle` | 포커스 토글 상태 |
| `useGesture` | 스와이프/드래그/핀치/롱프레스 감지 |

### Scroll Hooks
| Hook | Description |
|------|-------------|
| `useScrollReveal` | 스크롤 진입 시 다양한 모션 |
| `useScrollProgress` | 스크롤 진행률 추적 |
| `useInView` | 뷰포트 진입 감지 |

### Utility Hooks
| Hook | Description |
|------|-------------|
| `useMouse` | 마우스 위치 추적 |
| `useWindowSize` | 윈도우 크기 추적 |
| `useReducedMotion` | 모션 감소 설정 감지 |
| `useSpringMotion` | 스프링 물리 애니메이션 |
| `useMotionState` | 모션 상태 관리 |

### Unified API
| Hook | Description |
|------|-------------|
| `useMotion` | 통합 모션 훅 (fade/slide/scale/rotate 지원) |
| `useUnifiedMotion` | 확장 가능한 통합 모션 시스템 |

---

## Import Patterns

### Recommended (via hua-ux)

```tsx
// UI Components
import { Button, Card, Modal } from '@hua-labs/hua-ux';

// Motion Hooks
import { useFadeIn, useSlideUp, useGesture } from '@hua-labs/hua-ux/framework';

// i18n
import { useTranslation, TranslationProvider } from '@hua-labs/hua-ux';

// Advanced Components
import { Carousel, Marquee } from '@hua-labs/hua-ux/advanced';
```

### Direct Package Import

```tsx
// 패키지 직접 임포트 (트리쉐이킹 최적화)
import { Button } from '@hua-labs/ui';
import { useFadeIn } from '@hua-labs/motion-core';
import { useTranslation } from '@hua-labs/i18n-core';
```

---

## CSS/Styling

### Required CSS Imports

```css
/* 테마 (Tailwind v4 호환) */
@import '@hua-labs/ui/styles/recommended-theme.css';

/* CodeBlock 신택스 하이라이팅 */
@import '@hua-labs/ui/styles/codeblock.css';

/* Toast 애니메이션 */
@import '@hua-labs/ui/styles/toast.css';
```

### CSS Variables

The framework uses CSS custom properties for theming:
- `--primary`, `--secondary`, `--accent`
- `--background`, `--foreground`
- `--muted`, `--border`, `--ring`
- `--sh-*` (syntax highlighting)

---

## Documentation Site

**URL**: https://docs.hua-labs.com (hua-docs)

### Structure
- `/docs/components/*` - UI 컴포넌트 문서
- `/docs/hooks/*` - 모션 훅 문서
- `/docs/guides/*` - 가이드 문서
- `/packages/*` - 패키지별 상세 문서

### Features
- 라이브 인터랙티브 데모
- 한/영 다국어 지원
- 다크/라이트 테마
- API 레퍼런스 테이블
- 코드 예시 (sugar-high 하이라이팅)

---

## Current Status (2026-01-15)

### Completed
- [x] Core UI components (71+)
- [x] Advanced visual components (14)
- [x] Motion hooks with IntersectionObserver
- [x] i18n core system
- [x] Documentation site with live demos
- [x] Tailwind v4 compatibility
- [x] Dark/Light theme support

### In Progress
- [ ] Component JSDoc 영문화
- [ ] SDUI production readiness
- [ ] Dashboard components documentation
- [ ] Performance optimization
- [ ] Test coverage improvement

### Planned
- [ ] React Server Components 지원
- [ ] Vue/Svelte 포팅
- [ ] Figma plugin
- [ ] VS Code extension

---

## Tech Stack

- **Runtime**: React 18+, Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4, CSS Variables
- **Build**: tsup, TypeScript
- **Package Manager**: pnpm (monorepo)
- **Testing**: Vitest
- **Syntax Highlighting**: sugar-high
- **Icons**: Phosphor Icons, Lucide React

---

## Repository Structure

```
hua/
├── apps/
│   └── hua-docs/          # Documentation site (Next.js)
├── packages/
│   ├── hua-ux/            # Main framework package
│   ├── hua-ui/            # UI component library
│   ├── hua-motion-core/   # Motion hooks
│   ├── hua-motion-advanced/
│   ├── hua-i18n-*/        # i18n packages
│   ├── sdui-*/            # Server-driven UI
│   └── ...
└── docs/
    └── devlogs/           # Development logs
```

---

## Quick Start

```bash
# Create new project
npx create-hua-ux my-app

# Or add to existing project
pnpm add @hua-labs/hua-ux

# Import in your app
import { Button, useTranslation } from '@hua-labs/hua-ux';
```

---

## Questions for Review

1. **Architecture**: 패키지 분리 구조가 적절한가?
2. **API Design**: 훅/컴포넌트 API가 직관적인가?
3. **Documentation**: 문서화 품질과 범위가 충분한가?
4. **Performance**: 번들 사이즈, 트리쉐이킹 최적화 상태?
5. **DX**: 개발자 경험 개선점?
6. **Missing Features**: 빠진 필수 기능?

---

*This document is intended for AI-assisted code review and framework assessment.*
