# @hua-labs/motion-core

Production-ready React animation hooks — zero dependencies, SSR-ready.
프로덕션 레디 React 애니메이션 훅 — 의존성 없음, SSR 지원.

[![npm version](https://img.shields.io/npm/v/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![license](https://img.shields.io/npm/l/@hua-labs/motion-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

> **Alpha**: APIs may change before stable release. | **알파**: 안정 릴리스 전 API가 변경될 수 있습니다.

## Overview | 개요

A collection of 25+ React animation hooks built on a ref-based engine. Direct DOM manipulation for consistent performance with zero external dependencies. All hooks are TypeScript-native and SSR-compatible.

ref 기반 엔진으로 구축된 25개 이상의 React 애니메이션 훅 컬렉션입니다. 외부 의존성 없이 직접 DOM 조작으로 일관된 성능을 제공합니다. 모든 훅은 TypeScript 네이티브이며 SSR 호환됩니다.

## Features

- **25+ animation hooks** — Fade, slide, scale, scroll, interactions, gestures
- **Zero dependencies** — Pure JavaScript motion engine
- **Ref-based** — Direct DOM manipulation for consistent performance
- **SSR compatible** — Works with Next.js, Remix, and SSR frameworks
- **Tested** — 517 test cases

## Installation | 설치

```bash
pnpm add @hua-labs/motion-core
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`

## Quick Start | 빠른 시작

```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core';

function Hero() {
  const fadeIn = useFadeIn({ duration: 800 });
  const slideUp = useSlideUp({ delay: 200 });

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>Welcome</h1>
      <p ref={slideUp.ref} style={slideUp.style}>Animated content</p>
    </div>
  );
}
```

## API Overview | API 개요

All hooks return a consistent `BaseMotionReturn` interface:

| Property | Type | Description |
|----------|------|-------------|
| `ref` | `RefObject<T>` | Attach to target element |
| `style` | `CSSProperties` | Apply to element |
| `isVisible` | `boolean` | Visibility state |
| `isAnimating` | `boolean` | Animation in progress |
| `start/stop/reset/pause/resume` | `() => void` | Playback controls |

**Available hooks by category:**

| Category | Hooks |
|----------|-------|
| Basic | `useFadeIn`, `useSlideUp`, `useSlideLeft`, `useSlideRight`, `useScaleIn`, `useBounceIn`, `usePulse`, `useSpringMotion`, `useGradient` |
| Interaction | `useHoverMotion`, `useClickToggle`, `useFocusToggle`, `useToggleMotion` |
| Scroll | `useScrollReveal`, `useScrollProgress` |
| List | `useStaggerMotion`, `useCardList`, `useSkeleton` |
| Utility | `useMotionState`, `useRepeat`, `useSmartMotion`, `useUnifiedMotion`, `useSimplePageMotion`, `usePageMotions`, `useGesture`, `useGestureMotion` |

## Documentation | 문서

- [Detailed Guide](./DETAILED_GUIDE.md)
- [📚 Documentation Site | 문서 사이트](https://docs.hua-labs.com)

## Related Packages | 관련 패키지

- [`@hua-labs/pro`](https://www.npmjs.com/package/@hua-labs/pro) — Advanced motion hooks (orchestration, auto-animations)
- [`@hua-labs/hua-ux`](https://www.npmjs.com/package/@hua-labs/hua-ux) — UX framework (includes motion)

## Requirements | 요구사항

React >= 19.0.0 · React DOM >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
