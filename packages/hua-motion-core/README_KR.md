# HUA Motion Core

React 모션의 기초 ✨

## 개요

HUA Motion Core는 React 애플리케이션에서 애니메이션 구현을 간소화하도록 설계된 25개의 필수 모션 훅을 제공하는 종합 라이브러리입니다. TypeScript로 구축되고 광범위하게 테스트되어, 부드럽고 성능이 우수한 애니메이션을 위한 직관적인 API를 제공합니다.

**모든 React 앱에는 모션이 필요합니다. 여기서 시작하세요.**

## 특징

- **25개 필수 훅** 페이드, 슬라이드, 스케일, 스크롤, 상호작용 애니메이션을 포괄하는 완전한 컬렉션
- **TypeScript 우선** 포괄적인 타입 정의로 완전한 타입 안전성 제공
- **실전 검증** 517개 테스트 케이스로 74%+ 함수 커버리지 달성
- **제로 의존성** 외부 애니메이션 의존성 없는 경량 라이브러리
- **SSR 준비** Next.js 및 기타 SSR 프레임워크와 완벽 호환
- **높은 커스터마이징** 각 훅에 대한 광범위한 설정 옵션 제공

## 설치

```bash
npm install @hua-labs/motion-core
```

```bash
yarn add @hua-labs/motion-core
```

```bash
pnpm add @hua-labs/motion-core
```

## 빠른 시작

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
        아름다운 애니메이션을 간단하게
      </p>
    </div>
  );
}
```

## 사용 가능한 훅

### 기본 모션 훅 (9개)
- `useFadeIn` - 페이드 인 애니메이션
- `useSlideUp` - 슬라이드 업 애니메이션  
- `useSlideLeft` - 슬라이드 왼쪽 애니메이션
- `useSlideRight` - 슬라이드 오른쪽 애니메이션
- `useSlideDown` - 바운스/오버슈트가 포함된 고급 슬라이드 다운
- `useScaleIn` - 스케일 인 애니메이션
- `useBounceIn` - 바운스 인 애니메이션
- `usePulse` - 펄스 애니메이션
- `useSkeleton` - 스켈레톤 로딩 애니메이션

### 상호작용 훅 (4개)
- `useHoverMotion` - 호버 트리거 애니메이션
- `useClickToggle` - 클릭 트리거 애니메이션
- `useFocusToggle` - 포커스 트리거 애니메이션
- `useVisibilityToggle` - 가시성 제어 애니메이션

### 스크롤 훅 (3개)
- `useScrollReveal` - 스크롤 트리거 리빌 애니메이션
- `useScrollToggle` - 스크롤 기반 토글 애니메이션
- `useScrollProgress` - 스크롤 진행률 추적

### 유틸리티 훅 (2개)
- `useMotionState` - 모션 상태 관리
- `useRepeat` - 반복 애니메이션

### 고급 훅 (7개)
- `useMotion` - 핵심 모션 엔진
- `useSpringMotion` - 스프링 물리 애니메이션
- `useGradient` - 그라디언트 애니메이션
- `useNavigation` - 내비게이션 애니메이션
- `useButtonEffect` - 버튼 상호작용 효과
- `useCardList` - 카드 리스트 애니메이션
- `useLoadingSpinner` - 로딩 스피너 애니메이션

## API 레퍼런스

모든 훅은 일관된 인터페이스를 반환합니다:

```tsx
interface BaseMotionReturn<T = HTMLElement> {
  ref: RefObject<T>;          // DOM 참조
  style: CSSProperties;       // 애니메이션 스타일
  isVisible: boolean;         // 가시성 상태
  isAnimating: boolean;       // 애니메이션 실행 상태
  progress: number;           // 진행률 (0-1)
  start: () => void;          // 시작
  stop: () => void;           // 중지
  reset: () => void;          // 리셋
  pause: () => void;          // 일시정지
  resume: () => void;         // 재개
}
```

### 공통 옵션

```tsx
interface BaseMotionOptions {
  duration?: number;        // 애니메이션 지속시간 (기본값: 1000ms)
  delay?: number;          // 애니메이션 지연시간 (기본값: 0ms)
  easing?: string;         // CSS 이징 함수 (기본값: 'ease-out')
  autoStart?: boolean;     // 자동 시작 (기본값: true)
  onStart?: () => void;    // 시작 콜백
  onComplete?: () => void; // 완료 콜백
  onStop?: () => void;     // 중지 콜백
  onReset?: () => void;    // 리셋 콜백
}
```

## 사용 예제

### 페이드 인 애니메이션

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
        페이드 인 될 콘텐츠
      </div>
      <button onClick={start}>시작</button>
      <button onClick={stop}>중지</button>
    </div>
  );
}
```

### 스크롤 리빌

```tsx
import { useScrollReveal } from '@hua-labs/motion-core';

function ScrollRevealExample() {
  const { ref, style } = useScrollReveal({
    threshold: 0.3,
    triggerOnce: true
  });

  return (
    <div ref={ref} style={style}>
      스크롤할 때 나타나는 콘텐츠
    </div>
  );
}
```

### 호버 상호작용

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
      마우스를 올려보세요!
    </div>
  );
}
```

## TypeScript 지원

HUA Motion Core는 TypeScript로 구축되어 포괄적인 타입 정의를 제공합니다:

```tsx
import { useFadeIn, BaseMotionReturn, FadeInOptions } from '@hua-labs/motion-core';

// 완전한 타입 안전성
const fadeIn: BaseMotionReturn<HTMLDivElement> = useFadeIn({
  duration: 1000,
  opacity: { from: 0, to: 1 }
} as FadeInOptions);
```

## 로드맵

- **Motion Core** - 필수 훅 (현재)
- **Motion Advanced** - 복잡한 애니메이션 (개발중)
- **Motion Enterprise** - 팀 솔루션 (계획중)

## 브라우저 지원

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 기여하기

기여를 환영합니다! 자세한 내용은 [기여 가이드](CONTRIBUTING.md)를 참조하세요.

## 라이선스

MIT 라이선스 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 변경 로그

릴리스 히스토리는 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.

---

[HUA Labs](https://github.com/HUA-Labs)에서 ❤️로 제작되었습니다
