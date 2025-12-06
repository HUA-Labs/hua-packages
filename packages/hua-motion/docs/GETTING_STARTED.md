# Motion 패키지 도입 가이드

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [패키지 선택 가이드](#패키지-선택-가이드)
3. [설치 및 사용](#설치-및-사용)
4. [기능별 분류](#기능별-분류)
5. [UI 패키지와의 통합](#ui-패키지와의-통합)
6. [예제 코드](#예제-코드)

---

## 개요

HUA Motion 패키지는 React 애플리케이션을 위한 모션 및 애니메이션 라이브러리입니다. 3개의 패키지로 구성되어 있어 필요한 기능만 선택적으로 사용할 수 있습니다.

### 패키지 구조

```
@hua-labs/motion-core      # 필수 기능 (25개 훅)
@hua-labs/motion-advanced   # 고급 기능 (17개 훅)
@hua-labs/motion           # 통합 패키지 (Core + Advanced)
```

---

## 패키지 선택 가이드

### Core vs Advanced 차이

| 구분 | Core | Advanced |
|------|------|----------|
| **목적** | 필수 모션 기능 | 고급 모션 기능 |
| **의존성** | Zero Dependencies | Core 의존 |
| **용도** | 기본 애니메이션 | 복잡한 시퀀스, 오케스트레이션 |
| **학습 곡선** | 낮음 | 높음 |
| **번들 크기** | 작음 | 중간 |

### 어떤 패키지를 선택해야 할까?

#### Core만 필요한 경우 ✅

**사용 시나리오**:
- 기본 페이드, 슬라이드 애니메이션
- 호버, 클릭 인터랙션
- 스크롤 리빌 애니메이션
- 간단한 페이지 전환

**설치**:
```bash
pnpm add @hua-labs/motion-core
```

#### Advanced가 필요한 경우 ✅

**사용 시나리오**:
- 복잡한 애니메이션 시퀀스
- 오케스트레이션 (여러 요소 동시 제어)
- 자동화된 모션 (Auto 시리즈)
- 게임이나 인터랙티브 앱
- 성능 모니터링

**설치**:
```bash
pnpm add @hua-labs/motion-core @hua-labs/motion-advanced
```

#### 통합 패키지 사용 (하위 호환성) ⚠️

**사용 시나리오**:
- 기존 코드 마이그레이션 중
- 모든 기능을 한 번에 사용
- 빠른 프로토타이핑

**설치**:
```bash
pnpm add @hua-labs/motion
```

**주의**: 새로운 프로젝트는 Core + Advanced 직접 사용을 권장합니다.

---

## 설치 및 사용

### 1. Core 패키지 설치

```bash
# npm
npm install @hua-labs/motion-core

# yarn
yarn add @hua-labs/motion-core

# pnpm
pnpm add @hua-labs/motion-core
```

### 2. 기본 사용법

```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'

function MyComponent() {
  const fadeIn = useFadeIn({ duration: 800 })
  const slideUp = useSlideUp({ delay: 200 })

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>
        Fade In Title
      </h1>
      <p ref={slideUp.ref} style={slideUp.style}>
        Slide Up Content
      </p>
    </div>
  )
}
```

### 3. Advanced 패키지 추가

```bash
pnpm add @hua-labs/motion-advanced
```

```tsx
import { useFadeIn } from '@hua-labs/motion-core'
import { useMotionOrchestra } from '@hua-labs/motion-advanced'

function AdvancedComponent() {
  const fadeIn = useFadeIn()
  const orchestra = useMotionOrchestra({
    sequences: [
      { id: 'hero', delay: 0, duration: 1000 },
      { id: 'title', delay: 200, duration: 800 }
    ]
  })

  return (
    <div>
      <div ref={fadeIn.ref} style={fadeIn.style}>
        Content
      </div>
    </div>
  )
}
```

---

## 기능별 분류

### Core 패키지 기능 (25개)

#### 3단계 추상화
- `useSimplePageMotion` - 프리셋 기반 (1단계)
- `usePageMotions` - 페이지 레벨 (2단계)
- `useSmartMotion` - 개별 요소 (3단계)

#### 기본 모션
- `useFadeIn` - 페이드 인
- `useSlideUp` - 위로 슬라이드
- `useSlideLeft` - 왼쪽으로 슬라이드
- `useSlideRight` - 오른쪽으로 슬라이드
- `useScaleIn` - 스케일 인
- `useBounceIn` - 바운스 인
- `usePulse` - 펄스
- `useSpringMotion` - 스프링 물리
- `useGradient` - 그라데이션

#### 인터랙션
- `useHoverMotion` - 호버 모션
- `useClickToggle` - 클릭 토글
- `useFocusToggle` - 포커스 토글
- `useToggleMotion` - 토글 모션

#### 스크롤
- `useScrollReveal` - 스크롤 리빌
- `useScrollProgress` - 스크롤 진행도
- `useScrollToggle` - 스크롤 토글

#### 유틸리티
- `useMotionState` - 모션 상태 관리
- `useRepeat` - 반복 애니메이션

#### 제스처
- `useGesture` - 제스처 감지
- `useGestureMotion` - 제스처 모션

### Advanced 패키지 기능 (17개)

#### Auto 시리즈
- `useAutoSlide` - 자동 슬라이드
- `useAutoScale` - 자동 스케일
- `useAutoFade` - 자동 페이드
- `useAutoPlay` - 자동 재생

#### 오케스트레이션
- `useMotionOrchestra` - 모션 오케스트라
- `useOrchestration` - 오케스트레이션 관리
- `useSequence` - 시퀀스 관리

#### 고급 인터랙션
- `useLayoutMotion` - 레이아웃 모션
- `useKeyboardToggle` - 키보드 토글
- `useScrollDirection` - 스크롤 방향
- `useStickyToggle` - 스티키 토글
- `useScrollToggle` - 스크롤 토글 (고급)
- `useVisibilityToggle` - 가시성 토글 (고급)
- `useInteractive` - 인터랙티브 모션

#### 기타 고급 기능
- `usePerformanceMonitor` - 성능 모니터링
- `useLanguageAwareMotion` - 언어 인식 모션
- `useGameLoop` - 게임 루프

---

## UI 패키지와의 통합

### UI 패키지 의존성

**현재 구조**:
- UI 패키지는 `@hua-labs/motion-core`를 의존합니다
- `@hua-labs/motion-advanced`는 선택적 (peerDependency)

### UI 패키지에서 Motion 사용

#### Core 컴포넌트
Core 컴포넌트는 Motion 패키지 없이도 사용 가능합니다.

```tsx
import { Button, Card, Input } from '@hua-labs/ui'

// Motion 패키지 없이도 작동
function MyComponent() {
  return (
    <div>
      <Button>Click me</Button>
      <Card>Content</Card>
      <Input placeholder="Type here" />
    </div>
  )
}
```

#### Advanced 컴포넌트
Advanced 컴포넌트는 Motion Core가 필요합니다.

```tsx
import { AdvancedPageTransition } from '@hua-labs/ui/advanced'

// @hua-labs/motion-core 필요
function MyPage() {
  return (
    <AdvancedPageTransition type="fade">
      <h1>My Page</h1>
    </AdvancedPageTransition>
  )
}
```

### Motion 패키지와 함께 사용

```tsx
import { Button } from '@hua-labs/ui'
import { useFadeIn } from '@hua-labs/motion-core'

function MyComponent() {
  const fadeIn = useFadeIn()

  return (
    <div ref={fadeIn.ref} style={fadeIn.style}>
      <Button>Animated Button</Button>
    </div>
  )
}
```

---

## 예제 코드

### 예제 1: 기본 페이드 인

```tsx
import { useFadeIn } from '@hua-labs/motion-core'

function FadeInExample() {
  const fadeIn = useFadeIn({ duration: 1000 })

  return (
    <div ref={fadeIn.ref} style={fadeIn.style}>
      <h1>Fade In Title</h1>
    </div>
  )
}
```

### 예제 2: 스크롤 리빌

```tsx
import { useScrollReveal } from '@hua-labs/motion-core'

function ScrollRevealExample() {
  const reveal = useScrollReveal({
    threshold: 0.3,
    triggerOnce: true
  })

  return (
    <div ref={reveal.ref} style={reveal.style}>
      <p>This appears when scrolled into view</p>
    </div>
  )
}
```

### 예제 3: 호버 인터랙션

```tsx
import { useHoverMotion } from '@hua-labs/motion-core'

function HoverExample() {
  const hover = useHoverMotion({
    scale: 1.1,
    duration: 300
  })

  return (
    <div
      ref={hover.ref}
      style={hover.style}
      onMouseEnter={hover.hover}
      onMouseLeave={hover.leave}
    >
      Hover me!
    </div>
  )
}
```

### 예제 4: 오케스트레이션 (Advanced)

```tsx
import { useFadeIn } from '@hua-labs/motion-core'
import { useMotionOrchestra } from '@hua-labs/motion-advanced'

function OrchestraExample() {
  const hero = useFadeIn()
  const title = useFadeIn()
  const button = useFadeIn()

  const orchestra = useMotionOrchestra({
    sequences: [
      { id: 'hero', delay: 0, duration: 1000 },
      { id: 'title', delay: 200, duration: 800 },
      { id: 'button', delay: 400, duration: 600 }
    ]
  })

  return (
    <div>
      <div ref={hero.ref} style={hero.style}>
        Hero Section
      </div>
      <h1 ref={title.ref} style={title.style}>
        Title
      </h1>
      <button ref={button.ref} style={button.style}>
        Button
      </button>
    </div>
  )
}
```

### 예제 5: 3단계 추상화 (Core)

```tsx
import { useSimplePageMotion } from '@hua-labs/motion-core'

function PageExample() {
  const pageMotion = useSimplePageMotion({
    type: 'hero',
    elements: {
      hero: { type: 'fade', delay: 0 },
      title: { type: 'slide-up', delay: 200 },
      button: { type: 'scale', delay: 400 }
    }
  })

  return (
    <div>
      <div ref={pageMotion.hero.ref} style={pageMotion.hero.style}>
        Hero
      </div>
      <h1 ref={pageMotion.title.ref} style={pageMotion.title.style}>
        Title
      </h1>
      <button ref={pageMotion.button.ref} style={pageMotion.button.style}>
        Button
      </button>
    </div>
  )
}
```

---

## 다음 단계

1. **Core 패키지 시작**: 기본 기능부터 시작
2. **Advanced 패키지 확장**: 고급 기능이 필요할 때 추가
3. **UI 패키지 통합**: UI 컴포넌트와 함께 사용
4. **문서 참고**: 더 자세한 내용은 각 패키지의 README 참고

---

## 관련 문서

- [의존성 규칙](./DEPENDENCY_RULES.md)
- [마이그레이션 가이드](./MIGRATION_GUIDE.md)
- [Core 패키지 README](../hua-motion-core/README.md)
- [Advanced 패키지 README](../hua-motion-advanced/README.md)

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

