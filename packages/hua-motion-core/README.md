# @hua-labs/motion-core

Production-ready React animation hooks. Zero dependencies, SSR-ready.
프로덕션 레디 React 애니메이션 훅. 의존성 없음, SSR 지원

[![npm version](https://img.shields.io/npm/v/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![npm downloads](https://img.shields.io/npm/dw/@hua-labs/motion-core.svg)](https://www.npmjs.com/package/@hua-labs/motion-core)
[![license](https://img.shields.io/npm/l/@hua-labs/motion-core.svg)](https://github.com/HUA-Labs/HUA-Labs-public/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

> **⚠️ Alpha Release**: This package is currently in alpha. APIs may change before the stable release.

---

[English](#english) | [한국어](#korean)

## English

### Overview

A collection of React animation hooks built on a ref-based engine. Provides smooth animations with zero external dependencies. All hooks are TypeScript-native and SSR-compatible.

### Features

- **25+ Animation Hooks** - Fade, slide, scale, scroll, and interaction animations
- **Performance Optimized** - Direct ref manipulation for consistent performance
- **Zero Dependencies** - Pure JavaScript motion engine
- **TypeScript Native** - Full type safety with inferred types
- **SSR Compatible** - Works with Next.js, Remix, and SSR frameworks
- **Tested** - Test coverage with 517 test cases

### Installation

```bash
npm install @hua-labs/motion-core
# or
yarn add @hua-labs/motion-core
# or
pnpm add @hua-labs/motion-core
```

### Quick Start

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
        Simple animations
      </p>
    </div>
  );
}
```

### Available Hooks

#### Basic Motion Hooks
- `useFadeIn` - Fade in animation
- `useSlideUp` - Slide up animation
- `useSlideLeft` - Slide left animation
- `useSlideRight` - Slide right animation
- `useScaleIn` - Scale in animation
- `useBounceIn` - Bounce in animation
- `usePulse` - Pulse animation
- `useSpringMotion` - Spring physics animations
- `useGradient` - Gradient animations

#### Interaction Hooks
- `useHoverMotion` - Hover-triggered animations
- `useClickToggle` - Click-triggered animations
- `useFocusToggle` - Focus-triggered animations
- `useToggleMotion` - Toggle animations

#### Scroll Hooks
- `useScrollReveal` - Scroll-triggered reveal animations
- `useScrollProgress` - Scroll progress tracking

#### Utility Hooks
- `useMotionState` - Motion state management
- `useRepeat` - Repeating animations
- `useSmartMotion` - Smart motion with auto-detection
- `useUnifiedMotion` - Unified motion interface
- `useSimplePageMotion` - Simple page transitions
- `usePageMotions` - Multiple page motions
- `useGesture` - Gesture detection
- `useGestureMotion` - Gesture-based animations

### API Overview

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

### Documentation

- [Detailed Guide](./DETAILED_GUIDE.md) - Complete API reference, examples, and advanced usage
- [TypeScript Definitions](./dist/index.d.ts) - Type definitions

### Related Packages

- [`@hua-labs/hua-ux`](../hua-ux/README.md) - Integrated framework (UI + Motion + i18n)

### Requirements

- React >= 19.0.0
- React DOM >= 19.0.0

## Korean

### 개요

ref 기반 엔진으로 구축된 React 애니메이션 훅 컬렉션입니다. 외부 의존성 없이 부드러운 애니메이션을 제공합니다. 모든 훅은 TypeScript 네이티브이며 SSR과 호환됩니다.

### 주요 기능

- **25개 이상의 애니메이션 훅** - 페이드, 슬라이드, 스케일, 스크롤 및 상호작용 애니메이션
- **성능 최적화** - 일관된 성능을 위한 직접 ref 조작
- **의존성 없음** - 순수 JavaScript 모션 엔진
- **TypeScript 네이티브** - 타입 추론을 통한 완전한 타입 안전성
- **SSR 호환** - Next.js, Remix 및 SSR 프레임워크와 작동
- **테스트 완료** - 517개 테스트 케이스로 테스트 커버리지

### 설치

```bash
npm install @hua-labs/motion-core
# 또는
yarn add @hua-labs/motion-core
# 또는
pnpm add @hua-labs/motion-core
```

### 빠른 시작

```tsx
import React from 'react';
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core';

function MyComponent() {
  const fadeIn = useFadeIn({ duration: 800 });
  const slideUp = useSlideUp({ delay: 200 });

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>
        HUA Motion Core에 오신 것을 환영합니다
      </h1>
      <p ref={slideUp.ref} style={slideUp.style}>
        간단한 애니메이션
      </p>
    </div>
  );
}
```

### 사용 가능한 훅

#### 기본 모션 훅
- `useFadeIn` - 페이드 인 애니메이션
- `useSlideUp` - 슬라이드 업 애니메이션
- `useSlideDown` - 슬라이드 다운 애니메이션
- `useSlideLeft` - 슬라이드 왼쪽 애니메이션
- `useSlideRight` - 슬라이드 오른쪽 애니메이션
- `useScaleIn` - 스케일 인 애니메이션
- `useBounceIn` - 바운스 인 애니메이션
- `usePulse` - 펄스 애니메이션
- `useSpringMotion` - 스프링 물리 애니메이션
- `useGradient` - 그라디언트 애니메이션

#### 스태거 및 리스트 훅
- `useStaggerMotion` - 여러 항목에 대한 스태거 애니메이션
- `useCardList` - 카드 리스트 애니메이션
- `useSkeleton` - 스켈레톤 로딩 애니메이션

#### 상호작용 훅
- `useHoverMotion` - 호버 트리거 애니메이션
- `useClickToggle` - 클릭 트리거 애니메이션
- `useFocusToggle` - 포커스 트리거 애니메이션
- `useToggleMotion` - 토글 애니메이션

#### 스크롤 훅
- `useScrollReveal` - 스크롤 트리거 리빌 애니메이션
- `useScrollProgress` - 스크롤 진행률 추적

#### 유틸리티 훅
- `useMotionState` - 모션 상태 관리
- `useRepeat` - 반복 애니메이션
- `useSmartMotion` - 자동 감지 스마트 모션
- `useUnifiedMotion` - 통합 모션 인터페이스
- `useSimplePageMotion` - 간단한 페이지 전환
- `usePageMotions` - 여러 페이지 모션
- `useGesture` - 제스처 감지
- `useGestureMotion` - 제스처 기반 애니메이션

### API 개요

모든 훅은 일관된 인터페이스를 반환합니다:

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

### 문서

- [상세 가이드](./DETAILED_GUIDE.md) - 완전한 API 참조, 예시 및 고급 사용법
- [TypeScript 정의](./dist/index.d.ts) - 타입 정의

### 관련 패키지

- [`@hua-labs/hua-ux`](../hua-ux/README.md) - 통합 프레임워크 (UI + Motion + i18n)

### 요구사항

- React >= 19.0.0
- React DOM >= 19.0.0

## License

MIT © HUA Labs

## Repository

https://github.com/HUA-Labs/HUA-Labs-public
