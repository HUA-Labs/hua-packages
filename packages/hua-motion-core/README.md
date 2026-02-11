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
| `MotionEngine` | component |  |
| `motionEngine` | function |  |
| `type MotionFrame` | function |  |
| `type MotionOptions` | function |  |
| `type Motion` | function |  |
| `TransitionEffects` | component |  |
| `transitionEffects` | function |  |
| `type TransitionType` | function |  |
| `type TransitionOptions` | function |  |
| `PerformanceOptimizer` | component |  |
| `performanceOptimizer` | function |  |
| `type PerformanceOptimizerMetrics` | function |  |
| `type OptimizationConfig` | function |  |
| `useSimplePageMotion` | hook |  |
| `usePageMotions` | hook |  |
| `useSmartMotion` | hook |  |
| `useUnifiedMotion` | hook |  |
| `useFadeIn` | hook | Fade-in animation hook |
| `useSlideUp` | hook | Slide-up animation hook |
| `useSlideLeft` | hook | Slide-left animation hook |
| `useSlideRight` | hook | Slide-right animation hook |
| `useScaleIn` | hook | Scale-in animation hook |
| `useBounceIn` | hook | Bounce-in animation hook |
| `usePulse` | hook |  |
| `useSpringMotion` | hook |  |
| `useGradient` | hook |  |
| `useHoverMotion` | hook | Hover interaction animation |
| `useClickToggle` | hook |  |
| `useFocusToggle` | hook |  |
| `useScrollReveal` | hook | Scroll-triggered reveal animation |
| `useScrollProgress` | hook |  |
| `useMotionState` | hook |  |
| `useRepeat` | hook |  |
| `useToggleMotion` | hook |  |
| `useSlideDown` | hook |  |
| `useInView` | hook |  |
| `useMouse` | hook |  |
| `useReducedMotion` | hook |  |
| `useWindowSize` | hook |  |
| `useGesture` | hook |  |
| `useGestureMotion` | hook |  |
| `linear` | function |  |
| `easeIn` | function |  |
| `easeOut` | function |  |
| `easeInOut` | function |  |
| `easeInQuad` | function |  |
| `easeOutQuad` | function |  |
| `easeInOutQuad` | function |  |
| `type EasingFunction` | function |  |
| `type EasingType` | function |  |
| `getEasing` | function |  |
| `applyEasing` | function |  |
| `safeApplyEasing` | function |  |
| `isValidEasing` | function |  |
| `getAvailableEasings` | function |  |
| `isEasingFunction` | function |  |
| `easingPresets` | function |  |
| `getPresetEasing` | function |  |
| `UseUnifiedMotionOptions` | type |  |
| `PageType` | type |  |
| `MotionType` | type |  |
| `EntranceType` | type |  |
| `PageMotionElement` | type |  |
| `PageMotionsConfig` | type |  |
| `MotionState` | type |  |
| `PageMotionRef` | type |  |
| `BaseMotionOptions` | type |  |
| `BaseMotionReturn` | type |  |
| `MotionElement` | type |  |
| `MotionPreset` | type |  |
| `PresetConfig` | type |  |
| `SpringConfig` | type |  |
| `GestureConfig` | type |  |
| `OrchestrationConfig` | type |  |
| `FadeInOptions` | type |  |
| `SlideOptions` | type |  |
| `ScaleOptions` | type |  |
| `BounceOptions` | type |  |
| `PulseOptions` | type |  |
| `SpringOptions` | type |  |
| `GestureOptions` | type |  |
| `ScrollRevealOptions` | type |  |
| `ScrollRevealMotionType` | type |  |
| `GradientOptions` | type |  |
| `ToggleMotionOptions` | type |  |
| `RepeatOptions` | type |  |
| `HoverMotionOptions` | type |  |
| `InteractionReturn` | type |  |
| `InViewOptions` | type |  |
| `InViewReturn` | type |  |
| `MouseOptions` | type |  |
| `MouseReturn` | type |  |
| `ReducedMotionReturn` | type |  |
| `WindowSizeOptions` | type |  |
| `WindowSizeReturn` | type |  |
| `PerformanceMetrics` | type |  |
| `MotionConfig` | type |  |
| `MotionDirection` | type |  |
| `MotionEasing` | type |  |
| `MotionTrigger` | type |  |
| `MotionCallback` | type |  |
| `MotionProgressCallback` | type |  |
| `MotionStateCallback` | type |  |

## Documentation

[Full Documentation](https://docs.hua-labs.com)

## Related Packages

- [`@hua-labs/hua`](https://www.npmjs.com/package/@hua-labs/hua)

## License

MIT — [HUA Labs](https://hua-labs.com)
