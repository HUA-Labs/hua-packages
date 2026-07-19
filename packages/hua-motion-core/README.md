# @hua-labs/motion-core

React 19 motion hooks, motion profiles, easing and spring utilities, and a dedicated React Native entry point. Web and native surfaces are documented separately so consumers can verify the exact renderer contract they use.

[![npm version](https://img.shields.io/npm/v/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![npm downloads](https://img.shields.io/npm/dm/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![license](https://img.shields.io/npm/l/@hua-labs/motion-core.svg)](https://github.com/HUA-Labs/hua-packages/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

## Features

- **Web entrance hooks — Ref, style, lifecycle state, and explicit controls**
- **Motion profiles — Neutral and expressive defaults with bounded overrides**
- **Reduced-motion signal — Browser preference tracking for application policy**
- **React Native entry — Animated-based hooks from the explicit /native route**
- **TypeScript declarations — Root and native entry-point types ship with the package**
- **Framework-neutral utilities — Motion engine, easing, and spring calculations**

## Installation

```bash
pnpm add @hua-labs/motion-core
```

> Required peer: `react >=19.0.0`. Optional, target-specific peers: `react-dom >=19.0.0` for DOM integrations and `react-native >=0.73.0` for the `/native` entry.

## Quick Start

```tsx
import { useFadeIn } from '@hua-labs/motion-core';

function Hero() {
  const fade = useFadeIn<HTMLDivElement>({
    autoStart: true,
    initialOpacity: 0,
    targetOpacity: 1,
    duration: 500,
  });

  return (
    <div ref={fade.ref} style={fade.style}>
      Welcome
    </div>
  );
}

```

## API

| Export | Type | Description |
|--------|------|-------------|
| `MotionEngine` | class | Zero-dependency pure JavaScript motion engine class |
| `motionEngine` | variable | Singleton instance of MotionEngine |
| `TransitionEffects` | class | Transition effect system class (fade, slide, scale, etc.) |
| `transitionEffects` | variable | Singleton instance of TransitionEffects |
| `useSimplePageMotion` | hook | Simple fade+slide page entrance animation |
| `usePageMotions` | hook | Multi-element page entrance orchestration |
| `useSmartMotion` | hook | Preset-based single-element entrance and interaction motion |
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
| `useScrollProgress` | hook | Document scroll position as a clamped 0-100 progress value |
| `useMotionState` | hook | Animation state tracking (idle, running, complete) |
| `useRepeat` | hook | Repeating animation with configurable count |
| `useToggleMotion` | hook | Toggle between two animation states |
| `useSlideDown` | hook | Slide-down entrance animation |
| `useInView` | hook | IntersectionObserver-based visibility detection |
| `useMouse` | hook | Mouse position tracking |
| `useReducedMotion` | hook | Detect prefers-reduced-motion setting |
| `useReducedMotionObject` | hook | Deprecated object-shaped wrapper around useReducedMotion |
| `useWindowSize` | hook | Responsive window size tracking |
| `useGesture` | hook | Multi-gesture handler (drag, swipe, pinch) |
| `useGestureMotion` | hook | Gesture-driven motion animation |
| `useButtonEffect` | hook | Ripple / press feedback effect for buttons |
| `useVisibilityToggle` | hook | Animate an element in/out based on a boolean visibility flag |
| `useScrollToggle` | hook | Toggle animation state based on scroll position threshold |
| `useCardList` | hook | Staggered entrance animation for a list of cards |
| `useLoadingSpinner` | hook | Continuous rotation animation for loading spinners |
| `useNavigation` | hook | Slide/fade animation for navigation transitions |
| `useSkeleton` | hook | Shimmer animation for skeleton loading placeholders |
| `useTypewriter` | hook | Typewriter character-by-character text reveal animation |
| `useCustomCursor` | hook | Custom cursor tracking and animation |
| `useMagneticCursor` | hook | Magnetic cursor attraction effect for interactive elements |
| `useSmoothScroll` | hook | Smooth programmatic scroll with easing |
| `useElementProgress` | hook | Track an element's scroll progress as a 0–1 value |
| `neutral` | variable | Built-in neutral motion profile (minimal, system-respecting) |
| `hua` | variable | Built-in hua motion profile (expressive, brand-aligned) |
| `resolveProfile` | function | Resolve a built-in profile name or MotionProfile object to a MotionProfile |
| `mergeProfileOverrides` | function | Deep-merge overrides into a base MotionProfile |
| `MotionProfileProvider` | component | React context provider that supplies a MotionProfile to the subtree |
| `useMotionProfile` | hook | Hook to read the current MotionProfile from context |
| `observeElement` | function | Shared IntersectionObserver helper — observe an element and invoke a callback on visibility change |
| `linear` | function | Linear easing (no acceleration) |
| `easeIn` | function | Ease-in curve (slow start) |
| `easeOut` | function | Ease-out curve (slow end) |
| `easeInOut` | function | Smooth ease-in-out curve |
| `getEasing` | function | Get easing function by name |
| `applyEasing` | function | Apply an easing function to a raw progress value (throws on invalid) |
| `safeApplyEasing` | function | Apply an easing function to a progress value, falling back to linear on error |
| `isValidEasing` | function | Check whether a string is a recognised EasingType name |
| `getAvailableEasings` | function | Return the list of all registered easing names |
| `isEasingFunction` | function | Type-guard that checks whether a value is a callable EasingFunction |
| `easingPresets` | variable | Map of named easing preset strings to EasingFunction objects |
| `getPresetEasing` | function | Look up an EasingFunction by preset name |
| `calculateSpring` | function | Pure function that computes spring position/velocity for a given time step |
| `useAutoFade` | hook | Auto-looping fade animation |
| `useAutoPlay` | hook | Auto-looping playback animation |
| `useAutoScale` | hook | Auto-looping scale animation |
| `useAutoSlide` | hook | Auto-looping slide animation |
| `useMotionOrchestra` | hook | Multi-mode orchestrator (sequential/parallel/stagger) with dynamic step registration |
| `useOrchestration` | hook | rAF-based timeline engine with seek, speed, reverse support |
| `useSequence` | hook | [DEPRECATED] Sequential motion chaining — use useOrchestration or useMotionOrchestra instead |
| `useLayoutMotion` | hook | Layout change animation with FLIP technique |
| `createLayoutTransition` | function | Factory function to create layout transition configs |
| `useKeyboardToggle` | hook | Keyboard shortcut-triggered toggle animation |
| `useScrollDirection` | hook | Detect scroll direction (up/down) for show/hide patterns |
| `useStickyToggle` | hook | Toggle animation based on sticky scroll threshold |
| `useInteractive` | hook | Combined hover/press/focus interaction state |
| `usePerformanceMonitor` | hook | FPS and frame timing monitor for motion performance |
| `useLanguageAwareMotion` | hook | Direction-aware motion that adapts to LTR/RTL languages |
| `useGameLoop` | hook | Fixed-timestep game loop with state management |
| `useMotion` | hook | Flexible single-element motion hook with from/to config |
| `useViewportToggle` | hook | IntersectionObserver-based viewport visibility toggle (renamed from pro useVisibilityToggle) |
| `useScrollPositionToggle` | hook | pageYOffset-based scroll position toggle (renamed from pro useScrollToggle) |
| `Motion` | component | React wrapper component that applies a motion hook to its child element via ref |
| `useCountUp` | hook | Animated counter that counts up to a target number |
| `useClipReveal` | hook | Clip-path reveal animation (wipe-in effect) |
| `useBlurIn` | hook | Blur-to-clear entrance animation |
| `useStagger` | hook | Orchestrate staggered entrance animations across a list of elements |
| `MOTION_PRESETS` | variable | Built-in preset configurations keyed by element role (hero, title, button, card, text, image) |
| `PAGE_MOTIONS` | variable | Page-level motion configs keyed by page type (home, dashboard, product, blog) |
| `mergeWithPreset` | function | Merge a MotionPreset with custom overrides |
| `getPagePreset` | function | Get PageMotionsConfig for a given PageType |
| `getMotionPreset` | function | Get a MotionPreset by element role string |
| `useFadeIn (native)` | hook | Native fade-in using Animated.timing |
| `useSlideUp (native)` | hook | Native slide-up using Animated.parallel |
| `useSlideDown (native)` | hook | Native slide-down using Animated.parallel |
| `useSlideLeft (native)` | hook | Native slide-left using Animated.parallel |
| `useSlideRight (native)` | hook | Native slide-right using Animated.parallel |
| `useScaleIn (native)` | hook | Native scale-in using Animated.parallel |
| `useBounceIn (native)` | hook | Native bounce-in using Animated.spring |
| `useSpringMotion (native)` | hook | Native generic spring animation with animateTo() |
| `usePulse (native)` | hook | Native looping pulse using Animated.loop |
| `useStagger (native)` | hook | Native staggered list animation using Animated.stagger |

## Documentation

- [Detailed Guide](./DETAILED_GUIDE.md)
- [Full Documentation](https://docs.hua-labs.com)

## License

MIT — [HUA Labs](https://hua-labs.com)
