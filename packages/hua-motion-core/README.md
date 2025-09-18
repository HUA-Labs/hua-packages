# HUA Motion Core

The foundation of React motion ✨

## Overview

HUA Motion Core provides a comprehensive collection of 25 essential motion hooks designed to simplify animation implementation in React applications. Built with TypeScript and extensively tested, it offers intuitive APIs for creating smooth, performant animations.

**Every React app needs motion. Start here.**

## Features

- **25 Essential Hooks** Complete collection covering fade, slide, scale, scroll, and interaction animations
- **TypeScript First** Full type safety with comprehensive type definitions
- **Battle Tested** 74%+ function coverage with 517 test cases
- **Zero Dependencies** Lightweight with no external animation dependencies
- **SSR Ready** Works seamlessly with Next.js and other SSR frameworks
- **Highly Customizable** Extensive configuration options for each hook

## Installation

```bash
npm install @hua-labs/motion-core
```

```bash
yarn add @hua-labs/motion-core
```

```bash
pnpm add @hua-labs/motion-core
```

## Quick Start

```tsx
import React from 'react';
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core';

function MyComponent() {
  const fadeIn = useFadeIn({ duration: 800 });
  const slideUp = useSlideUp({ delay: 200 });

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>
        Welcome to HUA Motion Core
      </h1>
      <p ref={slideUp.ref} style={slideUp.style}>
        Beautiful animations made simple
      </p>
    </div>
  );
}
```

## Available Hooks

### Basic Motion Hooks (9)
- `useFadeIn` - Fade in animation
- `useSlideUp` - Slide up animation  
- `useSlideLeft` - Slide left animation
- `useSlideRight` - Slide right animation
- `useSlideDown` - Advanced slide down with bounce/overshoot
- `useScaleIn` - Scale in animation
- `useBounceIn` - Bounce in animation
- `usePulse` - Pulse animation
- `useSkeleton` - Skeleton loading animation

### Interaction Hooks (4)
- `useHoverMotion` - Hover-triggered animations
- `useClickToggle` - Click-triggered animations
- `useFocusToggle` - Focus-triggered animations
- `useVisibilityToggle` - Visibility-controlled animations

### Scroll Hooks (3)
- `useScrollReveal` - Scroll-triggered reveal animations
- `useScrollToggle` - Scroll-based toggle animations
- `useScrollProgress` - Scroll progress tracking

### Utility Hooks (2)
- `useMotionState` - Motion state management
- `useRepeat` - Repeating animations

### Advanced Hooks (7)
- `useMotion` - Core motion engine
- `useSpringMotion` - Spring physics animations
- `useGradient` - Gradient animations
- `useNavigation` - Navigation animations
- `useButtonEffect` - Button interaction effects
- `useCardList` - Card list animations
- `useLoadingSpinner` - Loading spinner animations

## API Reference

All hooks return a consistent interface:

```tsx
interface BaseMotionReturn<T = HTMLElement> {
  ref: RefObject<T>;
  style: CSSProperties;
  isVisible: boolean;
  isAnimating: boolean;
  progress: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}
```

### Common Options

```tsx
interface BaseMotionOptions {
  duration?: number;        // Animation duration in ms (default: 1000)
  delay?: number;          // Animation delay in ms (default: 0)
  easing?: string;         // CSS easing function (default: 'ease-out')
  autoStart?: boolean;     // Auto-start animation (default: true)
  onStart?: () => void;    // Start callback
  onComplete?: () => void; // Complete callback
  onStop?: () => void;     // Stop callback
  onReset?: () => void;    // Reset callback
}
```

## Examples

### Fade In Animation

```tsx
import { useFadeIn } from '@hua-labs/motion-core';

function FadeInExample() {
  const { ref, style, start, stop } = useFadeIn({
    duration: 1000,
    autoStart: false
  });

  return (
    <div>
      <div ref={ref} style={style}>
        This will fade in
      </div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  );
}
```

### Scroll Reveal

```tsx
import { useScrollReveal } from '@hua-labs/motion-core';

function ScrollRevealExample() {
  const { ref, style } = useScrollReveal({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <div ref={ref} style={style}>
      This appears when scrolled into view
    </div>
  );
}
```

### Hover Interaction

```tsx
import { useHoverMotion } from '@hua-labs/motion-core';

function HoverExample() {
  const { ref, style, hover, leave } = useHoverMotion({
    scale: 1.1,
    duration: 300
  });

  return (
    <div 
      ref={ref} 
      style={style}
      onMouseEnter={hover}
      onMouseLeave={leave}
    >
      Hover me!
    </div>
  );
}
```

## TypeScript Support

HUA Motion Core is built with TypeScript and provides comprehensive type definitions:

```tsx
import { useFadeIn, BaseMotionReturn, FadeInOptions } from '@hua-labs/motion-core';

// Full type safety
const fadeIn: BaseMotionReturn<HTMLDivElement> = useFadeIn({
  duration: 1000,
  opacity: { from: 0, to: 1 }
} as FadeInOptions);
```

## Roadmap

- **Motion Core** - Essential hooks (Current)
- **Motion Advanced** - Complex animations (In Development)
- **Motion Enterprise** - Team solutions (Planned)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

---

Built with ❤️ by [HUA Labs](https://github.com/HUA-Labs)