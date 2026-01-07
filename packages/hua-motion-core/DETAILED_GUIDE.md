# @hua-labs/motion-core Detailed Guide

Complete technical reference for the ref-based motion engine.
Ref 기반 모션 엔진에 대한 완전한 기술 레퍼런스입니다.

---

## English

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
  - PerformanceOptimizer: Manages RAF and GPU acceleration
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

## Korean

### 목차

- [아키텍처](#아키텍처-1)
- [설치 및 설정](#설치-및-설정-1)
- [핵심 개념](#핵심-개념-1)
- [API 레퍼런스](#api-레퍼런스-1)
- [고급 사용법](#고급-사용법-1)
- [통합 예제](#통합-예제-1)
- [문제 해결](#문제-해결-1)

---

## 아키텍처

### 설계 철학

`@hua-labs/motion-core`는 세 가지 핵심 원칙을 기반으로 합니다:

1. **성능 우선** - 직접 ref 조작으로 React 재조정을 우회하여 일관된 60fps 애니메이션 달성
2. **외부 의존성 없음** - 외부 애니메이션 라이브러리 없는 순수 JavaScript 모션 엔진
3. **개발자 경험** - 완전한 TypeScript 지원과 간단하고 예측 가능한 API

### 모션 엔진

코어 엔진은 프레임 기반 애니메이션 시스템을 사용합니다:

```tsx
// 내부 아키텍처 (단순화)
MotionEngine {
  - PerformanceOptimizer: RAF 및 GPU 가속 관리
  - TransitionEffects: 이징 및 보간 처리
  - MotionStateManager: 애니메이션 생명주기 추적
}
```

모든 훅은 일관된 인터페이스를 반환합니다:
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

## 설치 및 설정

### 기본 설치

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

### TypeScript 설정

라이브러리에 완전한 타입 정의가 포함되어 있습니다. 추가 설정 불필요.

---

## 핵심 개념

### 공통 옵션

모든 모션 훅은 기본 옵션 세트를 받습니다:

```tsx
interface BaseMotionOptions {
  duration?: number;        // 애니메이션 지속 시간(ms) (기본값: 400)
  delay?: number;          // 시작 지연(ms) (기본값: 0)
  easing?: EasingType;     // 이징 함수 (기본값: 'easeOut')
  autoPlay?: boolean;      // 자동 시작 (기본값: true)
  threshold?: number;      // 교차 임계값 0-1 (기본값: 0.1)
}
```

### 이징 함수

내장 이징 옵션:
- `linear` `easeIn` `easeOut` `easeInOut`
- `easeInQuad` `easeOutQuad` `easeInOutQuad`
- `spring` `bounce` `elastic`

커스텀 이징:
```tsx
const customEasing = (t: number) => t * t * t;
useFadeIn({ easing: customEasing });
```

---

## API 레퍼런스

### 진입 애니메이션

#### useFadeIn

투명도를 0에서 1로 애니메이션합니다.

```tsx
import { useFadeIn } from '@hua-labs/motion-core';

const fadeIn = useFadeIn({
  duration: 600,
  delay: 0,
  easing: 'easeOut'
});

<div ref={fadeIn.ref} style={fadeIn.style}>콘텐츠</div>
```

**옵션:**
- 모든 기본 옵션
- `from?: number` - 시작 투명도 (기본값: 0)
- `to?: number` - 종료 투명도 (기본값: 1)

---

#### useSlideUp

요소를 아래에서 위로 슬라이드합니다.

```tsx
const slideUp = useSlideUp({
  distance: 20,    // 슬라이드 거리(픽셀)
  duration: 500
});
```

**옵션:**
- 모든 기본 옵션
- `distance?: number` - 슬라이드 거리(px) (기본값: 20)

**유사 훅:**
- `useSlideDown` - 위에서 아래로 슬라이드
- `useSlideLeft` - 오른쪽에서 왼쪽으로 슬라이드
- `useSlideRight` - 왼쪽에서 오른쪽으로 슬라이드

---

#### useScaleIn

요소를 작은 크기에서 정상 크기로 확대합니다.

```tsx
const scaleIn = useScaleIn({
  from: 0.8,
  to: 1,
  duration: 400
});
```

**옵션:**
- 모든 기본 옵션
- `from?: number` - 시작 스케일 (기본값: 0.95)
- `to?: number` - 종료 스케일 (기본값: 1)

---

#### useBounceIn

탄성 바운스 효과를 적용한 진입 애니메이션입니다.

```tsx
const bounceIn = useBounceIn({
  intensity: 0.3,
  duration: 600
});
```

**옵션:**
- 모든 기본 옵션
- `intensity?: number` - 바운스 강도 0-1 (기본값: 0.2)

---

### 인터랙션 훅

#### useHoverMotion

호버 상태에서 애니메이션을 트리거합니다.

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
  호버하세요
</button>
```

**반환값:**
- `ref` `style` (표준)
- `onMouseEnter: () => void`
- `onMouseLeave: () => void`

**옵션:**
- `scale?: number` - 호버 스케일 (기본값: 1.02)
- `translateY?: number` - 수직 이동
- `duration?: number`

---

#### useClickToggle

클릭 시 애니메이션을 토글합니다.

```tsx
const toggle = useClickToggle({
  duration: 300
});

<div
  ref={toggle.ref}
  style={toggle.style}
  onClick={toggle.onClick}
>
  {toggle.isActive ? '활성' : '비활성'}
</div>
```

**반환값:**
- `ref` `style` (표준)
- `onClick: () => void`
- `isActive: boolean`

---

#### useGesture / useGestureMotion

드래그 및 스와이프 제스처를 추적합니다.

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

**옵션:**
- `axis?: 'x' | 'y' | 'both'` - 드래그 방향
- `bounds?: { left?, right?, top?, bottom? }` - 이동 제한

---

### 스크롤 효과

#### useScrollReveal

스크롤하여 화면에 나타날 때 요소를 표시합니다.

```tsx
const reveal = useScrollReveal({
  threshold: 0.2,
  once: true
});
```

**옵션:**
- 모든 기본 옵션
- `threshold?: number` - 트리거 지점 0-1 (기본값: 0.1)
- `once?: boolean` - 한 번만 트리거 (기본값: true)

---

#### useScrollProgress

스크롤 위치를 백분율로 추적합니다.

```tsx
const progress = useScrollProgress();

<div ref={progress.ref} style={progress.style}>
  {/* 진행률: {progress.value}% */}
</div>
```

**반환값:**
- `ref` `style` (표준)
- `value: number` - 스크롤 진행률 0-100

---

### 고급 훅

#### useSpringMotion

물리 기반 스프링 애니메이션입니다.

```tsx
const spring = useSpringMotion({
  tension: 180,
  friction: 12,
  mass: 1
});
```

**옵션:**
- `tension?: number` - 스프링 강성 (기본값: 170)
- `friction?: number` - 스프링 감쇠 (기본값: 26)
- `mass?: number` - 스프링 질량 (기본값: 1)

---

#### usePulse

연속적인 펄스 애니메이션입니다.

```tsx
const pulse = usePulse({
  scale: 1.1,
  duration: 1000
});

// 수동 제어
pulse.controls.start();
pulse.controls.stop();
pulse.controls.reset();
```

**옵션:**
- `scale?: number` - 펄스 스케일 (기본값: 1.05)
- `duration?: number` - 펄스 사이클 지속 시간
- `autoPlay?: boolean`

---

#### usePageMotions

페이지 레벨 전환을 조정합니다.

```tsx
const page = usePageMotions({
  pageType: 'landing',
  motionType: 'fade-slide',
  stagger: 100
});

<div ref={page.containerRef}>
  <h1 ref={page.titleRef} style={page.titleStyle}>제목</h1>
  <p ref={page.contentRef} style={page.contentStyle}>콘텐츠</p>
</div>
```

**옵션:**
- `pageType?: 'landing' | 'content' | 'minimal'`
- `motionType?: 'fade' | 'slide' | 'fade-slide'`
- `stagger?: number` - 요소 간 지연

---

## 고급 사용법

### 여러 애니메이션 결합

```tsx
function Hero() {
  const fade = useFadeIn({ duration: 800 });
  const slideUp = useSlideUp({ delay: 200 });

  return (
    <section ref={fade.ref} style={fade.style}>
      <h1 ref={slideUp.ref} style={slideUp.style}>
        환영합니다
      </h1>
    </section>
  );
}
```

### 순차 애니메이션

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

### 프로그래밍 방식 제어

```tsx
function ControlledAnimation() {
  const pulse = usePulse({ autoPlay: false });

  return (
    <>
      <div ref={pulse.ref} style={pulse.style}>요소</div>
      <button onClick={pulse.controls.start}>시작</button>
      <button onClick={pulse.controls.stop}>중지</button>
      <button onClick={pulse.controls.reset}>초기화</button>
    </>
  );
}
```

---

## 통합 예제

### Next.js App Router

```tsx
// app/page.tsx
'use client';

import { useFadeIn } from '@hua-labs/motion-core';

export default function Page() {
  const fadeIn = useFadeIn();
  return <div ref={fadeIn.ref} style={fadeIn.style}>콘텐츠</div>;
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
  return <div ref={slideUp.ref} style={slideUp.style}>콘텐츠</div>;
}
```

---

## 문제 해결

### 애니메이션이 실행되지 않음

**문제:** 마운트 시 애니메이션이 시작되지 않습니다.

**해결:** `autoPlay` 옵션을 확인하세요 (기본값은 `true`).

```tsx
// autoPlay가 활성화되어 있는지 확인
const animation = useFadeIn({ autoPlay: true });
```

---

### 성능 문제

**문제:** 여러 애니메이션 요소에서 렉이 발생합니다.

**해결:** 지연 시간을 순차적으로 적용하고 동시 애니메이션을 제한하세요.

```tsx
// 좋음: 순차적 애니메이션
items.map((item, i) => useFadeIn({ delay: i * 50 }))

// 피해야 함: 모두 동시에
items.map(() => useFadeIn())
```

---

### SSR 하이드레이션 불일치

**문제:** 서버/클라이언트 불일치 경고가 발생합니다.

**해결:** Next.js에서 `'use client'` 지시어를 사용하세요.

```tsx
'use client';

import { useFadeIn } from '@hua-labs/motion-core';
```

---

### TypeScript 오류

**문제:** ref 관련 타입 오류가 발생합니다.

**해결:** 적절한 요소 타입을 지정하세요.

```tsx
const animation = useFadeIn();
// ref는 RefObject<HTMLElement>로 타입이 지정됨
<div ref={animation.ref}>콘텐츠</div>
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/CONTRIBUTING.md).

## License

MIT © HUA Labs
