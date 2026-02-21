# @hua-labs/motion-core Detailed Guide

Complete technical reference for the ref-based motion engine.

---

### Table of Contents

- [Architecture](#architecture)
- [Installation & Setup](#installation--setup)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)
- [Integration Examples](#integration-examples)
- [Troubleshooting](#troubleshooting)

---

## Architecture

### Design Philosophy

`@hua-labs/motion-core` is built on three core principles:

1. **Performance First** - Direct ref manipulation bypasses React's reconciliation, achieving consistent 60fps animations
2. **Zero Dependencies** - Pure JavaScript motion engine with no external animation libraries
3. **Developer Experience** - Simple, predictable API with full TypeScript support

### Motion Engine

The core engine uses a frame-based animation system:

```tsx
// Internal architecture (simplified)
MotionEngine {
  - TransitionEffects: Handles easing and interpolation
  - MotionStateManager: Tracks animation lifecycle
}
```

All hooks return a consistent interface:
```tsx
{
  ref: RefObject<HTMLElement>,
  style: CSSProperties,
  controls?: {
    start: () => void,
    stop: () => void,
    reset: () => void
  }
}
```

---

## Installation & Setup

### Basic Installation

```bash
npm install @hua-labs/motion-core
```

### Peer Dependencies

```json
{
  "react": ">=19.0.0",
  "react-dom": ">=19.0.0"
}
```

### TypeScript Configuration

The library includes comprehensive type definitions. No additional setup required.

---

## Core Concepts

### Common Options

All motion hooks accept a base set of options:

```tsx
interface BaseMotionOptions {
  duration?: number;        // Animation duration in ms (default: 400)
  delay?: number;          // Start delay in ms (default: 0)
  easing?: EasingType;     // Easing function (default: 'easeOut')
  autoPlay?: boolean;      // Auto-start animation (default: true)
  threshold?: number;      // Intersection threshold 0-1 (default: 0.1)
}
```

### Easing Functions

Built-in easing options:
- `linear` `easeIn` `easeOut` `easeInOut`
- `easeInQuad` `easeOutQuad` `easeInOutQuad`
- `spring` `bounce` `elastic`

Custom easing:
```tsx
const customEasing = (t: number) => t * t * t;
useFadeIn({ easing: customEasing });
```

---

## API Reference

### Entrance Animations

#### useFadeIn

Animate opacity from 0 to 1.

```tsx
import { useFadeIn } from '@hua-labs/motion-core';

const fadeIn = useFadeIn({
  duration: 600,
  delay: 0,
  easing: 'easeOut'
});

<div ref={fadeIn.ref} style={fadeIn.style}>Content</div>
```

**Options:**
- All base options
- `from?: number` - Starting opacity (default: 0)
- `to?: number` - Ending opacity (default: 1)

---

#### useSlideUp

Slide element from bottom to top.

```tsx
const slideUp = useSlideUp({
  distance: 20,    // Slide distance in pixels
  duration: 500
});
```

**Options:**
- All base options
- `distance?: number` - Slide distance in px (default: 20)

**Similar hooks:**
- `useSlideDown` - Slide from top
- `useSlideLeft` - Slide from right
- `useSlideRight` - Slide from left

---

#### useScaleIn

Scale element from smaller to normal size.

```tsx
const scaleIn = useScaleIn({
  from: 0.8,
  to: 1,
  duration: 400
});
```

**Options:**
- All base options
- `from?: number` - Starting scale (default: 0.95)
- `to?: number` - Ending scale (default: 1)

---

#### useBounceIn

Entrance with elastic bounce effect.

```tsx
const bounceIn = useBounceIn({
  intensity: 0.3,
  duration: 600
});
```

**Options:**
- All base options
- `intensity?: number` - Bounce intensity 0-1 (default: 0.2)

---

### Interaction Hooks

#### useHoverMotion

Trigger animation on hover state.

```tsx
const hover = useHoverMotion({
  scale: 1.05,
  duration: 200
});

<button
  ref={hover.ref}
  style={hover.style}
  onMouseEnter={hover.onMouseEnter}
  onMouseLeave={hover.onMouseLeave}
>
  Hover me
</button>
```

**Returns:**
- `ref` `style` (standard)
- `onMouseEnter: () => void`
- `onMouseLeave: () => void`

**Options:**
- `scale?: number` - Hover scale (default: 1.02)
- `translateY?: number` - Vertical shift
- `duration?: number`

---

#### useClickToggle

Toggle animation on click.

```tsx
const toggle = useClickToggle({
  duration: 300
});

<div
  ref={toggle.ref}
  style={toggle.style}
  onClick={toggle.onClick}
>
  {toggle.isActive ? 'Active' : 'Inactive'}
</div>
```

**Returns:**
- `ref` `style` (standard)
- `onClick: () => void`
- `isActive: boolean`

---

#### useGesture / useGestureMotion

Track drag and swipe gestures.

```tsx
const gesture = useGestureMotion({
  axis: 'x',        // 'x' | 'y' | 'both'
  bounds: {
    left: -100,
    right: 100
  }
});

<div
  ref={gesture.ref}
  style={gesture.style}
  onMouseDown={gesture.onStart}
  onMouseMove={gesture.onMove}
  onMouseUp={gesture.onEnd}
/>
```

**Options:**
- `axis?: 'x' | 'y' | 'both'` - Drag direction
- `bounds?: { left?, right?, top?, bottom? }` - Movement limits

---

### Scroll Effects

#### useScrollReveal

Reveal element when scrolled into view.

```tsx
const reveal = useScrollReveal({
  threshold: 0.2,
  once: true
});
```

**Options:**
- All base options
- `threshold?: number` - Trigger point 0-1 (default: 0.1)
- `once?: boolean` - Trigger once (default: true)

---

#### useScrollProgress

Track scroll position as percentage.

```tsx
const progress = useScrollProgress();

<div ref={progress.ref} style={progress.style}>
  {/* Progress: {progress.value}% */}
</div>
```

**Returns:**
- `ref` `style` (standard)
- `value: number` - Scroll progress 0-100

---

### Advanced Hooks

#### useSpringMotion

Physics-based spring animation.

```tsx
const spring = useSpringMotion({
  tension: 180,
  friction: 12,
  mass: 1
});
```

**Options:**
- `tension?: number` - Spring stiffness (default: 170)
- `friction?: number` - Spring damping (default: 26)
- `mass?: number` - Spring mass (default: 1)

---

#### usePulse

Continuous pulsing animation.

```tsx
const pulse = usePulse({
  scale: 1.1,
  duration: 1000
});

// Manual control
pulse.controls.start();
pulse.controls.stop();
pulse.controls.reset();
```

**Options:**
- `scale?: number` - Pulse scale (default: 1.05)
- `duration?: number` - Pulse cycle duration
- `autoPlay?: boolean`

---

#### usePageMotions

Orchestrate page-level transitions.

```tsx
const page = usePageMotions({
  pageType: 'landing',
  motionType: 'fade-slide',
  stagger: 100
});

<div ref={page.containerRef}>
  <h1 ref={page.titleRef} style={page.titleStyle}>Title</h1>
  <p ref={page.contentRef} style={page.contentStyle}>Content</p>
</div>
```

**Options:**
- `pageType?: 'landing' | 'content' | 'minimal'`
- `motionType?: 'fade' | 'slide' | 'fade-slide'`
- `stagger?: number` - Delay between elements

---

### Interaction Hooks (Advanced)

#### useButtonEffect

Multi-type button interaction effects with scale, ripple, glow, shake, bounce, and slide.

```tsx
import { useButtonEffect } from '@hua-labs/motion-core';

const button = useButtonEffect({
  type: 'scale',
  scaleAmount: 0.95,
  hoverScale: 1.05,
  duration: 200
});

<button ref={button.ref} style={button.style}>
  Click me
</button>
```

**Options:**
- `type?: 'scale' | 'ripple' | 'glow' | 'shake' | 'bounce' | 'slide' | 'custom'` - Effect type (default: `'scale'`)
- `scaleAmount?: number` - Press scale for scale type (default: 0.95)
- `rippleColor?: string` - Ripple color (default: `'rgba(255,255,255,0.6)'`)
- `glowColor?: string` - Glow color (default: `'#3b82f6'`)
- `shakeAmount?: number` - Shake distance in px (default: 5)
- `bounceHeight?: number` - Bounce height in px (default: 10)
- `slideDistance?: number` - Slide distance in px (default: 5)
- `slideDirection?: 'left' | 'right' | 'up' | 'down'` (default: `'down'`)
- `hoverScale?: number` - Scale on hover (default: 1.05)
- `disabled?: boolean` - Disable interactions (default: false)
- `disabledOpacity?: number` (default: 0.5)

**Returns:**
- `ref` `style` `start` `stop` `reset` (standard)
- `buttonType: string` - Current effect type
- `isPressed: boolean` - Press state
- `isHovered: boolean` - Hover state
- `isFocused: boolean` - Focus state
- `pressButton: () => void` - Trigger press
- `releaseButton: () => void` - Release press
- `setButtonState: (state) => void` - Set button state programmatically

---

#### useVisibilityToggle

Programmatic show/hide/toggle with scale and opacity transitions.

```tsx
import { useVisibilityToggle } from '@hua-labs/motion-core';

const panel = useVisibilityToggle({
  showScale: 1,
  hideScale: 0.8,
  hideOpacity: 0,
  duration: 300
});

<button onClick={panel.toggle}>Toggle</button>
<div ref={panel.ref} style={panel.style}>Content</div>
```

**Options:**
- `showScale?: number` (default: 1)
- `showOpacity?: number` (default: 1)
- `showTranslateY?: number` (default: 0)
- `hideScale?: number` (default: 0.8)
- `hideOpacity?: number` (default: 0)
- `hideTranslateY?: number` (default: 20)

**Returns:**
- `ref` `style` `start` `stop` `reset` (standard)
- `toggle: () => void` - Toggle visibility
- `show: () => void` - Show element
- `hide: () => void` - Hide element

---

### Scroll Hooks (Advanced)

#### useScrollToggle

Show/hide elements based on scroll direction with shared scroll listener.

```tsx
import { useScrollToggle } from '@hua-labs/motion-core';

const header = useScrollToggle({
  scrollDirection: 'down',
  scrollThreshold: 0.1,
  showScale: 1,
  hideTranslateY: -100
});

<header ref={header.ref} style={header.style}>
  Navigation
</header>
```

**Options:**
- `scrollDirection?: 'up' | 'down' | 'both'` - Trigger direction (default: `'both'`)
- `scrollThreshold?: number` - Viewport fraction threshold (default: 0.1)
- `showScale?: number` (default: 1)
- `showOpacity?: number` (default: 1)
- `hideScale?: number` (default: 0.8)
- `hideOpacity?: number` (default: 0)
- `hideTranslateY?: number` (default: 20)

**Returns:**
- `ref` `style` `start` `stop` `reset` `pause` `resume` (standard)

---

### Layout Motion Hooks

#### useCardList

Staggered entrance animation for card grids with IntersectionObserver auto-trigger.

```tsx
import { useCardList } from '@hua-labs/motion-core';

const grid = useCardList({
  gridColumns: 3,
  gridGap: 20,
  staggerDelay: 100
});

<div ref={grid.ref} style={grid.style}>
  {items.map((item, i) => (
    <div key={item.id} data-card style={grid.cardStyles[i]}>
      {item.content}
    </div>
  ))}
</div>
```

**Options:**
- `gridColumns?: number` - Grid columns (default: 3)
- `gridGap?: number` - Gap in px (default: 20)
- `staggerDelay?: number` - Delay between cards in ms (default: 100)
- `initialScale?: number` (default: 0.8)
- `initialOpacity?: number` (default: 0)
- `initialTranslateY?: number` (default: 30)
- `cardScale?: number` - Visible scale (default: 1)
- `cardOpacity?: number` - Visible opacity (default: 1)

**Returns:**
- `ref` `style` `start` `stop` `reset` (standard)
- `cardStyles: CSSProperties[]` - Per-card animated styles
- `staggerDelay: number`
- `gridColumns: number`
- `gridGap: number`

---

#### useLoadingSpinner

Multi-type loading spinner with rotate, pulse, bounce, wave, dots, and bars animations.

```tsx
import { useLoadingSpinner } from '@hua-labs/motion-core';

const spinner = useLoadingSpinner({
  type: 'rotate',
  size: 40,
  color: '#3b82f6',
  thickness: 4
});

<div ref={spinner.ref} style={spinner.style} />
```

**Options:**
- `type?: 'rotate' | 'pulse' | 'bounce' | 'wave' | 'dots' | 'bars' | 'custom'` (default: `'rotate'`)
- `color?: string` (default: `'#3b82f6'`)
- `size?: number` - Size in px (default: 40)
- `thickness?: number` - Border/bar thickness (default: 4)
- `autoStart?: boolean` (default: true)
- `infinite?: boolean` (default: true)
- `rotationSpeed?: number` (default: 1)
- `pulseSpeed?: number` (default: 1)
- `bounceHeight?: number` (default: 20)

**Returns:**
- `ref` `style` `start` `stop` `reset` (standard)
- `isLoading: boolean`
- `spinnerType: string`
- `startLoading: () => void`
- `stopLoading: () => void`
- `setLoadingState: (loading: boolean) => void`

---

#### useNavigation

Menu animation with stagger entrance and active item management.

```tsx
import { useNavigation } from '@hua-labs/motion-core';

const nav = useNavigation({
  type: 'slide',
  slideDirection: 'left',
  itemCount: 5,
  staggerDelay: 50
});

<nav ref={nav.ref} style={nav.style}>
  {nav.itemStyles.map((style, i) => (
    <a key={i} style={style} onClick={() => nav.setActiveItem(i)}>
      Item {i + 1}
    </a>
  ))}
</nav>
<button onClick={nav.toggleMenu}>Menu</button>
```

**Options:**
- `type?: 'slide' | 'fade' | 'scale' | 'rotate' | 'custom'` (default: `'slide'`)
- `slideDirection?: 'left' | 'right' | 'up' | 'down'` (default: `'left'`)
- `itemCount?: number` (default: 5)
- `staggerDelay?: number` (default: 50)
- `activeScale?: number` (default: 1.05)
- `hoverScale?: number` (default: 1.1)
- `autoStart?: boolean` (default: false)

**Returns:**
- `ref` `style` `start` `stop` `reset` (standard)
- `isOpen: boolean`
- `activeIndex: number`
- `itemStyles: CSSProperties[]`
- `openMenu: () => void`
- `closeMenu: () => void`
- `toggleMenu: () => void`
- `setActiveItem: (index: number) => void`
- `goToNext: () => void`
- `goToPrevious: () => void`

---

#### useSkeleton

Wave/pulse skeleton loading placeholder with CSS keyframe animations.

```tsx
import { useSkeleton } from '@hua-labs/motion-core';

const skeleton = useSkeleton({
  height: 20,
  width: '100%',
  wave: true,
  borderRadius: 4
});

<div ref={skeleton.ref} style={skeleton.style} />
```

**Options:**
- `wave?: boolean` - Enable wave shimmer (default: true)
- `pulse?: boolean` - Enable pulse effect (default: false)
- `height?: number` - Height in px (default: 20)
- `width?: number | string` (default: `'100%'`)
- `borderRadius?: number` (default: 4)
- `backgroundColor?: string` (default: `'#f0f0f0'`)
- `highlightColor?: string` (default: `'#e0e0e0'`)
- `motionSpeed?: number` - Animation cycle in ms (default: 1500)
- `autoStart?: boolean` (default: true)

**Returns:**
- `ref` `style` `start` `stop` `reset` `pause` `resume` (standard)

---

## Advanced Usage

### Combining Multiple Animations

```tsx
function Hero() {
  const fade = useFadeIn({ duration: 800 });
  const slideUp = useSlideUp({ delay: 200 });

  return (
    <section ref={fade.ref} style={fade.style}>
      <h1 ref={slideUp.ref} style={slideUp.style}>
        Welcome
      </h1>
    </section>
  );
}
```

### Sequential Animations

```tsx
function CardList({ items }) {
  return items.map((item, index) => {
    const animation = useFadeIn({
      delay: index * 100
    });

    return (
      <div key={item.id} ref={animation.ref} style={animation.style}>
        {item.content}
      </div>
    );
  });
}
```

### Programmatic Control

```tsx
function ControlledAnimation() {
  const pulse = usePulse({ autoPlay: false });

  return (
    <>
      <div ref={pulse.ref} style={pulse.style}>Element</div>
      <button onClick={pulse.controls.start}>Start</button>
      <button onClick={pulse.controls.stop}>Stop</button>
      <button onClick={pulse.controls.reset}>Reset</button>
    </>
  );
}
```

---

## Integration Examples

### Next.js App Router

```tsx
// app/page.tsx
'use client';

import { useFadeIn } from '@hua-labs/motion-core';

export default function Page() {
  const fadeIn = useFadeIn();
  return <div ref={fadeIn.ref} style={fadeIn.style}>Content</div>;
}
```

### Next.js Pages Router

```tsx
// pages/index.tsx
import { usePageMotions } from '@hua-labs/motion-core';

export default function Home() {
  const page = usePageMotions({ pageType: 'landing' });
  return <main ref={page.containerRef}>...</main>;
}
```

### React SPA

```tsx
import { useSlideUp } from '@hua-labs/motion-core';

function Component() {
  const slideUp = useSlideUp();
  return <div ref={slideUp.ref} style={slideUp.style}>Content</div>;
}
```

---

## Troubleshooting

### Animations Not Triggering

**Issue:** Animation doesn't start on mount.

**Solution:** Check `autoPlay` option (default is `true`).

```tsx
// Ensure autoPlay is enabled
const animation = useFadeIn({ autoPlay: true });
```

---

### Performance Issues

**Issue:** Lag with many animated elements.

**Solution:** Use staggered delays and limit concurrent animations.

```tsx
// Good: Stagger animations
items.map((item, i) => useFadeIn({ delay: i * 50 }))

// Avoid: All at once
items.map(() => useFadeIn())
```

---

### SSR Hydration Mismatch

**Issue:** Warning about server/client mismatch.

**Solution:** Use `'use client'` directive in Next.js.

```tsx
'use client';

import { useFadeIn } from '@hua-labs/motion-core';
```

---

### TypeScript Errors

**Issue:** Type errors with refs.

**Solution:** Ensure proper element typing.

```tsx
const animation = useFadeIn();
// Ref is typed as RefObject<HTMLElement>
<div ref={animation.ref}>Content</div>
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/CONTRIBUTING.md).

## License

MIT © HUA Labs
