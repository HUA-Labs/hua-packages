# @hua-labs/motion-core

A collection of 35+ React animation hooks built on a ref-based engine. Direct DOM manipulation for consistent performance with zero external dependencies. All hooks are TypeScript-native and SSR-compatible.

[![npm version](https://img.shields.io/npm/v/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![license](https://img.shields.io/npm/l/@hua-labs/motion-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **35+ animation hooks — Fade, slide, scale, scroll, interactions, gestures**
- **Zero dependencies — Pure JavaScript motion engine**
- **Ref-based — Direct DOM manipulation for consistent performance**
- **SSR compatible — Works with Next.js, Remix, and SSR frameworks**
- **Fully tested — Comprehensive test coverage**

## Installation

```bash
pnpm add @hua-labs/motion-core
```

> Peer dependencies: react >=19.0.0, react-dom >=19.0.0

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

## API

| Export | Type | Description |
|--------|------|-------------|
| `useSimplePageMotion` | hook | Simple fade+slide page entrance animation |
| `usePageMotions` | hook | Multi-element page entrance orchestration |
| `useSmartMotion` | hook | Adaptive motion based on device performance |
| `useUnifiedMotion` | hook | All-in-one motion hook with presets |
| `useFadeIn` | hook | Fade-in animation hook |
| `useSlideUp` | hook | Slide-up entrance animation |
| `useSlideLeft` | hook | Slide-left entrance animation |
| `useSlideRight` | hook | Slide-right entrance animation |
| `useScaleIn` | hook | Scale-in entrance animation |
| `useBounceIn` | hook | Bounce-in entrance animation |
| `usePulse` | hook | Repeating pulse animation |
| `useSpringMotion` | hook | Spring physics animation |
| `useGradient` | hook | Animated gradient background |
| `useHoverMotion` | hook | Hover interaction animation |
| `useClickToggle` | hook | Click-triggered toggle animation |
| `useFocusToggle` | hook | Focus-triggered toggle animation |
| `useScrollReveal` | hook | Scroll-triggered reveal animation |
| `useScrollProgress` | hook | Scroll position as 0-1 progress value |
| `useMotionState` | hook | Animation state tracking (idle, running, complete) |
| `useRepeat` | hook | Repeating animation with configurable count |
| `useToggleMotion` | hook | Toggle between two animation states |
| `useSlideDown` | hook | Slide-down entrance animation |
| `useInView` | hook | IntersectionObserver-based visibility detection |
| `useMouse` | hook | Mouse position tracking |
| `useReducedMotion` | hook | Detect prefers-reduced-motion setting |
| `useWindowSize` | hook | Responsive window size tracking |
| `useGesture` | hook | Multi-gesture handler (drag, swipe, pinch) |
| `useGestureMotion` | hook | Gesture-driven motion animation |
| `easeInOut` | function | Smooth ease-in-out curve |
| `getEasing` | function | Get easing function by name |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
