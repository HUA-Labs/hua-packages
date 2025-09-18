# HUA Animation SDK - 훅 참조 가이드

## 📋 목차

1. [기본 애니메이션 훅](#기본-애니메이션-훅)
2. [간단한 애니메이션 훅](#간단한-애니메이션-훅)
3. [3단계 애니메이션 시스템](#3단계-애니메이션-시스템)
4. [고급 애니메이션 훅](#고급-애니메이션-훅)
5. [유틸리티 훅](#유틸리티-훅)

---

## 🎯 기본 애니메이션 훅

### `useFadeIn`

**설명**: 요소가 투명에서 불투명으로 페이드인되는 애니메이션

**사용법**:
```typescript
const fadeIn = useFadeIn({ 
  duration: 1000, 
  delay: 0, 
  autoStart: true 
})

return (
  <div 
    ref={fadeIn.ref}
    style={{ 
      opacity: fadeIn.opacity, 
      transform: `translateY(${fadeIn.translateY}px)` 
    }}
  >
    내용
  </div>
)
```

**옵션**:
- `duration`: 애니메이션 지속 시간 (기본값: 1000ms)
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `autoStart`: 자동 시작 여부 (기본값: true)
- `easing`: 이징 함수 (기본값: 'ease-out')

**반환값**:
- `ref`: DOM 요소 참조
- `opacity`: 현재 투명도 값
- `translateY`: 현재 Y축 이동 값
- `isAnimating`: 애니메이션 진행 상태
- `start()`: 애니메이션 시작
- `reset()`: 애니메이션 초기화

### `useBounceIn`

**설명**: 바운스 효과와 함께 나타나는 애니메이션

**사용법**:
```typescript
const bounceIn = useBounceIn({ 
  duration: 1000, 
  intensity: 0.3, 
  autoStart: true 
})

return (
  <div 
    ref={bounceIn.ref}
    style={{ 
      opacity: bounceIn.opacity, 
      transform: `scale(${bounceIn.scale})` 
    }}
  >
    내용
  </div>
)
```

**옵션**:
- `duration`: 애니메이션 지속 시간 (기본값: 1000ms)
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `autoStart`: 자동 시작 여부 (기본값: true)
- `intensity`: 바운스 강도 (기본값: 0.3)

### `useScaleIn`

**설명**: 크기가 작은 상태에서 원래 크기로 확대되는 애니메이션

**사용법**:
```typescript
const scaleIn = useScaleIn({ 
  scale: 0, 
  duration: 1000, 
  autoStart: true 
})

return (
  <div 
    ref={scaleIn.ref}
    style={{ 
      opacity: scaleIn.opacity, 
      transform: `scale(${scaleIn.scale})` 
    }}
  >
    내용
  </div>
)
```

**옵션**:
- `scale`: 초기 스케일 값 (기본값: 0)
- `duration`: 애니메이션 지속 시간 (기본값: 1000ms)
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `autoStart`: 자동 시작 여부 (기본값: true)
- `easing`: 이징 함수 (기본값: 'ease-out')

### `useSlideLeft`

**설명**: 왼쪽에서 오른쪽으로 슬라이드되는 애니메이션

**사용법**:
```typescript
const slideLeft = useSlideLeft({ 
  distance: 100, 
  duration: 1000, 
  autoStart: true 
})

return (
  <div 
    ref={slideLeft.ref}
    style={{ 
      opacity: slideLeft.opacity, 
      transform: `translateX(${slideLeft.translateX}px)` 
    }}
  >
    내용
  </div>
)
```

**옵션**:
- `distance`: 슬라이드 거리 (기본값: 100px)
- `duration`: 애니메이션 지속 시간 (기본값: 1000ms)
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `autoStart`: 자동 시작 여부 (기본값: true)
- `easing`: 이징 함수 (기본값: 'ease-out')

### `useSlideRight`

**설명**: 오른쪽에서 왼쪽으로 슬라이드되는 애니메이션

**사용법**:
```typescript
const slideRight = useSlideRight({ 
  distance: 100, 
  duration: 1000, 
  autoStart: true 
})

return (
  <div 
    ref={slideRight.ref}
    style={{ 
      opacity: slideRight.opacity, 
      transform: `translateX(${slideRight.translateX}px)` 
    }}
  >
    내용
  </div>
)
```

### `useSlideUp`

**설명**: 아래에서 위로 슬라이드되는 애니메이션

**사용법**:
```typescript
const slideUp = useSlideUp({ 
  distance: 50, 
  duration: 1000, 
  autoStart: true 
})

return (
  <div 
    ref={slideUp.ref}
    style={{ 
      opacity: slideUp.opacity, 
      transform: `translateY(${slideUp.translateY}px)` 
    }}
  >
    내용
  </div>
)
```

---

## 🚀 간단한 애니메이션 훅

### `useSimpleFadeIn`

**설명**: 순수 JavaScript 기반의 간단한 페이드인 애니메이션 (스크롤 리빌 포함)

**사용법**:
```typescript
const simpleFadeIn = useSimpleFadeIn({ delay: 0, duration: 700, threshold: 0.1 })

return (
  <div ref={simpleFadeIn.ref} style={simpleFadeIn.style}>
    내용
  </div>
)
```

**옵션**:
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `duration`: 애니메이션 지속 시간 (기본값: 700ms)
- `threshold`: 스크롤 리빌 임계값 (기본값: 0.1)

**반환값**:
- `ref`: DOM 요소 참조
- `isVisible`: 가시성 상태
- `style`: 인라인 스타일 객체

### `useSimpleSlideUp`

**설명**: 순수 JavaScript 기반의 간단한 슬라이드업 애니메이션 (스크롤 리빌 포함)

**사용법**:
```typescript
const simpleSlideUp = useSimpleSlideUp({ 
  delay: 0, 
  duration: 700, 
  distance: 8, 
  threshold: 0.1 
})

return (
  <div ref={simpleSlideUp.ref} style={simpleSlideUp.style}>
    내용
  </div>
)
```

**옵션**:
- `delay`: 시작 지연 시간 (기본값: 0ms)
- `duration`: 애니메이션 지속 시간 (기본값: 700ms)
- `distance`: 슬라이드 거리 (기본값: 8px)
- `threshold`: 스크롤 리빌 임계값 (기본값: 0.1)

**반환값**:
- `ref`: DOM 요소 참조
- `isVisible`: 가시성 상태
- `style`: 인라인 스타일 객체

---

## 🎨 3단계 애니메이션 시스템

### 1단계: `useSimplePageAnimation` (프리셋 기반)

**설명**: 페이지 타입만 지정하면 모든 애니메이션이 자동으로 설정됨

**사용법**:
```typescript
const presetAnimations = useSimplePageAnimation('home')

return (
  <div data-animation-id="hero" style={presetAnimations.hero?.style}>
    <h1 data-animation-id="title" style={presetAnimations.title?.style}>
      제목
    </h1>
    <p data-animation-id="description" style={presetAnimations.description?.style}>
      설명
    </p>
    <button data-animation-id="cta" style={presetAnimations.cta?.style}>
      버튼
    </button>
  </div>
)
```

**지원하는 페이지 타입**:
- `'home'`: 홈페이지
- `'about'`: 소개 페이지
- `'contact'`: 연락처 페이지
- `'blog'`: 블로그 페이지

### 2단계: `usePageAnimations` (페이지 레벨)

**설명**: 각 요소별로 세밀한 애니메이션 설정 가능

**사용법**:
```typescript
const config = useMemo(() => ({
  hero: { type: 'hero' },
  title: { type: 'title' },
  card1: { type: 'card' },
  card2: { type: 'card', hover: true },
  card3: { type: 'card', click: true },
  button: { type: 'button', hover: true, click: true }
}), [])

const pageAnimations = usePageAnimations(config)

return (
  <div data-animation-id="hero" style={pageAnimations.hero?.style}>
    <h1 data-animation-id="title" style={pageAnimations.title?.style}>
      제목
    </h1>
    <div data-animation-id="card1" style={pageAnimations.card1?.style}>
      카드 1
    </div>
    <div data-animation-id="card2" style={pageAnimations.card2?.style}>
      카드 2 (호버)
    </div>
  </div>
)
```

**지원하는 애니메이션 타입**:
- `'hero'`: 히어로 섹션
- `'title'`: 제목
- `'card'`: 카드
- `'button'`: 버튼
- `'text'`: 텍스트
- `'image'`: 이미지

**옵션**:
- `hover`: 호버 효과 활성화
- `click`: 클릭 효과 활성화
- `threshold`: 스크롤 리빌 임계값
- `delay`: 지연 시간

### 3단계: `useSmartAnimation` (개별 요소)

**설명**: 가장 세밀한 개별 요소 제어

**사용법**:
```typescript
const smartAnimation = useSmartAnimation({
  type: 'button',
  entrance: 'fadeIn',
  hover: true,
  click: true,
  duration: 1000
})

return (
  <button 
    ref={smartAnimation.ref}
    style={smartAnimation.style}
  >
    스마트 버튼
  </button>
)
```

**옵션**:
- `type`: 요소 타입 ('button', 'card', 'text', 'image')
- `entrance`: 진입 애니메이션 ('fadeIn', 'slideUp', 'slideLeft', 'slideRight', 'scaleIn', 'bounceIn')
- `hover`: 호버 효과
- `click`: 클릭 효과
- `duration`: 애니메이션 지속 시간
- `delay`: 지연 시간
- `threshold`: 스크롤 리빌 임계값

---

## 🔧 고급 애니메이션 훅

### `useMotion`

**설명**: 기본 모션 애니메이션 훅

**사용법**:
```typescript
const motion = useMotion(
  { opacity: 0, scale: 0.5 }, // from
  { opacity: 1, scale: 1.2 }, // to
  { duration: 1000, autoStart: false }
)

return (
  <div 
    ref={motion.ref}
    style={{ 
      opacity: motion.opacity, 
      transform: motion.transform 
    }}
  >
    내용
  </div>
)
```

### `useSpring`

**설명**: 스프링 물리 기반 애니메이션

**사용법**:
```typescript
const spring = useSpring({
  type: 'bounce',
  duration: 1500,
  autoStart: true
})

return (
  <div 
    ref={spring.ref}
    style={{ 
      opacity: spring.opacity, 
      transform: `scale(${spring.scale})` 
    }}
  >
    내용
  </div>
)
```

**타입**:
- `'gentle'`: 부드러운 스프링
- `'fast'`: 빠른 스프링
- `'bounce'`: 바운스 스프링

### `useScrollReveal`

**설명**: 스크롤 시 요소가 나타나는 애니메이션

**사용법**:
```typescript
const scrollReveal = useScrollReveal({
  animationType: 'fadeIn',
  threshold: 0.5,
  rootMargin: '-20% 0px',
  delay: 0
})

return (
  <div ref={scrollReveal.ref} style={scrollReveal.style}>
    스크롤하면 나타남
  </div>
)
```

**옵션**:
- `animationType`: 애니메이션 타입 ('fadeIn', 'slideUp', 'slideLeft', 'slideRight', 'scaleIn', 'bounceIn')
- `threshold`: 스크롤 리빌 임계값 (기본값: 0.1)
- `rootMargin`: 루트 마진 (기본값: '0px')
- `triggerOnce`: 한 번만 트리거 (기본값: true)
- `delay`: 지연 시간 (기본값: 0ms)

**반환값**:
- `ref`: DOM 요소 참조
- `isVisible`: 가시성 상태
- `style`: 인라인 스타일 객체

### `useHoverAnimation`

**설명**: 호버 시 애니메이션 적용

**사용법**:
```typescript
const motion = useMotion(
  { scale: 1 },
  { scale: 1.1 },
  { duration: 300, autoStart: false }
)

const hoverAnimation = useHoverAnimation(motion, {
  onHover: 'start',
  onLeave: 'reset'
})

return (
  <div ref={hoverAnimation.ref} style={hoverAnimation.style}>
    호버해보세요
  </div>
)
```

### `useSequence`

**설명**: 여러 애니메이션을 순차적으로 실행

**사용법**:
```typescript
const sequence = useSequence([
  () => useFadeIn({ autoStart: false }),
  () => useSlideUp({ autoStart: false }),
  () => useScaleIn({ autoStart: false })
], { delay: 200 })

return (
  <div>
    <div ref={sequence[0].ref} style={sequence[0].style}>첫 번째</div>
    <div ref={sequence[1].ref} style={sequence[1].style}>두 번째</div>
    <div ref={sequence[2].ref} style={sequence[2].style}>세 번째</div>
  </div>
)
```

---

## 🎨 유틸리티 훅

### `useGradient`

**설명**: 움직이는 그라디언트 배경 애니메이션

**사용법**:
```typescript
const gradient = useGradient({
  colors: ['#60a5fa', '#34d399', '#fbbf24'],
  duration: 6000,
  direction: 'diagonal',
  paused: false
})

return (
  <div style={gradient.style} className="w-32 h-32 rounded">
    그라디언트
  </div>
)
```

**옵션**:
- `colors`: 그라디언트 색상 배열
- `duration`: 애니메이션 지속 시간
- `direction`: 방향 ('horizontal', 'vertical', 'diagonal')
- `size`: 그라디언트 크기
- `easing`: 이징 함수
- `paused`: 일시정지 상태

### `usePulse`

**설명**: 펄스 효과 애니메이션

**사용법**:
```typescript
const pulse = usePulse({
  duration: 3000,
  intensity: 1,
  repeat: Infinity,
  yoyo: true
})

return (
  <div ref={pulse.ref} className="w-32 h-32 bg-pink-500 rounded">
    펄스
  </div>
)
```

**옵션**:
- `duration`: 애니메이션 지속 시간
- `intensity`: 펄스 강도
- `repeat`: 반복 횟수 (Infinity = 무한)
- `yoyo`: 요요 효과

---

## 🔄 공통 메서드

모든 애니메이션 훅은 다음 메서드를 제공합니다:

### `start()`
애니메이션을 시작합니다.

### `stop()`
애니메이션을 정지합니다.

### `reset()`
애니메이션을 초기 상태로 되돌립니다.

### `pause()` / `resume()`
애니메이션을 일시정지/재개합니다.

---

## 📝 사용 예시

### 기본 사용법
```typescript
import { useFadeIn, useSlideUp, useBounceIn } from '@hua-labs/animation'

function MyComponent() {
  const fadeIn = useFadeIn({ autoStart: true })
  const slideUp = useSlideUp({ autoStart: false })
  const bounceIn = useBounceIn({ autoStart: false })

  return (
    <div>
      <div ref={fadeIn.ref} style={{ opacity: fadeIn.opacity }}>
        자동으로 페이드인
      </div>
      <div ref={slideUp.ref} style={{ transform: `translateY(${slideUp.translateY}px)` }}>
        수동으로 슬라이드업
      </div>
      <div ref={bounceIn.ref} style={{ transform: `scale(${bounceIn.scale})` }}>
        바운스인
      </div>
    </div>
  )
}
```

### 3단계 시스템 사용법
```typescript
import { 
  useSimplePageAnimation, 
  usePageAnimations, 
  useSmartAnimation 
} from '@hua-labs/animation'

// 1단계: 프리셋 기반
const preset = useSimplePageAnimation('home')

// 2단계: 페이지 레벨
const config = { hero: { type: 'hero' }, title: { type: 'title' } }
const pageAnimations = usePageAnimations(config)

// 3단계: 개별 요소
const smart = useSmartAnimation({ type: 'button', entrance: 'fadeIn' })
```

---

## 🎯 성능 최적화 팁

1. **불필요한 리렌더링 방지**: `useMemo`로 설정 객체를 메모이제이션
2. **애니메이션 중단**: 컴포넌트 언마운트 시 자동으로 정리됨
3. **GPU 가속**: `transform`과 `opacity` 속성 사용으로 GPU 가속 활용
4. **Intersection Observer**: 스크롤 리빌에 Intersection Observer 사용으로 성능 최적화

---

## 🔧 문제 해결

### 애니메이션이 작동하지 않는 경우
1. `data-animation-id` 속성이 올바르게 설정되었는지 확인
2. DOM 요소가 마운트된 후 애니메이션이 시작되는지 확인
3. CSS `transition` 속성이 충돌하지 않는지 확인

### 성능 문제가 있는 경우
1. 동시에 실행되는 애니메이션 수를 줄이기
2. `requestAnimationFrame`을 사용하는 훅 선택
3. 불필요한 상태 업데이트 방지

---

## 📚 추가 리소스

- [3단계 애니메이션 시스템 가이드](./3_TIER_ANIMATION_SYSTEM.md)
- [성능 최적화 가이드](./PERFORMANCE_OPTIMIZATION.md)
- [마이그레이션 가이드](./MIGRATION_GUIDE.md) 