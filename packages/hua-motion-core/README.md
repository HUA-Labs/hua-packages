# @hua-labs/motion-core

Production-ready React animation hooks — zero dependencies, SSR-ready.

[![npm version](https://img.shields.io/npm/v/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![license](https://img.shields.io/npm/l/@hua-labs/motion-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Overview

A collection of 25+ React animation hooks built on a ref-based engine. Direct DOM manipulation for consistent performance with zero external dependencies. All hooks are TypeScript-native and SSR-compatible.

## Features

- **25+ animation hooks** — Fade, slide, scale, scroll, interactions, gestures
- **Zero dependencies** — Pure JavaScript motion engine
- **Ref-based** — Direct DOM manipulation for consistent performance
- **SSR compatible** — Works with Next.js, Remix, and SSR frameworks
- **Tested** — 517 test cases

## Installation

```bash
pnpm add @hua-labs/motion-core
```

Peer dependencies: `react >= 19.0.0`, `react-dom >= 19.0.0`

## Quick Start

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

## API Overview

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

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)
- [Documentation Site](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua) — UX framework (includes motion)

## Requirements

React >= 19.0.0 · React DOM >= 19.0.0 · TypeScript >= 5.9

## License

MIT — [HUA Labs](https://github.com/HUA-Labs/HUA-Labs-public)
