# 🎨 HUA Animation SDK

**순수 JavaScript/React로 구현된 애니메이션 SDK**  
외부 CSS 프레임워크 의존성 없이 강력한 애니메이션 기능을 제공합니다.

## 📦 설치

```bash
npm install @hua-labs/animation
```

## 🚀 빠른 시작

```tsx
import { useSimplePageAnimation } from '@hua-labs/animation'

function MyComponent() {
  const { ref, isVisible, style } = useSimplePageAnimation('fade-in')
  
  return (
    <div ref={ref} style={style}>
      애니메이션이 적용된 요소
    </div>
  )
}
```

## 🎯 3단계 추상화 시스템

### 1단계: `useSimplePageAnimation` - 프리셋 기반
가장 간단한 API로 미리 정의된 애니메이션을 사용합니다.

```tsx
import { useSimplePageAnimation } from '@hua-labs/animation'

const { ref, isVisible, style } = useSimplePageAnimation('fade-in')
```

**사용 가능한 프리셋:**
- `fade-in`: 페이드 인 애니메이션
- `slide-up`: 아래에서 위로 슬라이드
- `slide-left`: 오른쪽에서 왼쪽으로 슬라이드
- `slide-right`: 왼쪽에서 오른쪽으로 슬라이드
- `scale-in`: 스케일 인 애니메이션
- `bounce-in`: 바운스 인 애니메이션

### 2단계: `usePageAnimations` - 페이지 레벨 설정
페이지 전체의 애니메이션을 중앙에서 관리합니다.

```tsx
import { usePageAnimations } from '@hua-labs/animation'

const config = {
  'hero-section': { type: 'fade-in', delay: 0 },
  'content-section': { type: 'slide-up', delay: 200 },
  'footer-section': { type: 'scale-in', delay: 400 }
}

const { getAnimationProps } = usePageAnimations(config)
```

### 3단계: `useSmartAnimation` - 개별 요소 제어
각 요소의 애니메이션을 세밀하게 제어할 수 있습니다.

```tsx
import { useSmartAnimation } from '@hua-labs/animation'

const { ref, style, controls } = useSmartAnimation({
  initial: { opacity: 0, translateY: 50 },
  animate: { opacity: 1, translateY: 0 },
  transition: { duration: 500, ease: 'ease-out' }
})

// 애니메이션 제어
controls.start()
controls.stop()
controls.reset()
```

## 🎭 개별 애니메이션 훅

각 애니메이션 타입별로 독립적인 훅을 제공합니다:

### 기본 애니메이션
- `useFadeIn` - 페이드 인 애니메이션
- `useSlideUp` - 위로 슬라이드 애니메이션
- `useSlideLeft` - 왼쪽으로 슬라이드 애니메이션
- `useSlideRight` - 오른쪽으로 슬라이드 애니메이션
- `useScaleIn` - 스케일 인 애니메이션
- `useBounceIn` - 바운스 인 애니메이션

### 특수 애니메이션
- `usePulse` - 펄스 애니메이션
- `useGradient` - 그라디언트 애니메이션
- `useSpring` - 스프링 애니메이션
- `useMotion` - 기본 모션 애니메이션

### 인터랙션 애니메이션
- `useHoverAnimation` - 호버 애니메이션
- `useScrollReveal` - 스크롤 리빌 애니메이션
- `useLanguageAwareAnimation` - 언어 인식 애니메이션

## 🎮 애니메이션 제어

모든 애니메이션 훅은 표준 제어 메서드를 제공합니다:

```tsx
const { ref, style, start, stop, reset, pause, resume } = useFadeIn()

// 애니메이션 시작
start()

// 애니메이션 중지
stop()

// 애니메이션 리셋
reset()

// 애니메이션 일시정지/재개
pause()
resume()
```

## 🎨 애니메이션 타입

### 기본 타입
- **Fade**: 투명도 변화
- **Slide**: 위치 이동
- **Scale**: 크기 변화
- **Rotate**: 회전
- **Bounce**: 바운스 효과

### 고급 타입
- **Spring**: 물리 기반 애니메이션
- **Gradient**: 색상 변화
- **Pulse**: 반복 애니메이션

## 🔧 설정 옵션

### AnimationConfig 인터페이스
```typescript
interface AnimationConfig {
  type: 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale-in' | 'bounce-in'
  delay?: number
  duration?: number
  ease?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
  threshold?: number
  rootMargin?: string
}
```

### 개별 애니메이션 설정
```typescript
interface IndividualAnimationConfig {
  initial: AnimationState
  animate: AnimationState
  transition?: TransitionConfig
  trigger?: 'scroll' | 'hover' | 'click' | 'manual'
}
```

## 🎯 프리셋

### Simple Animation 프리셋
- `home`: 홈페이지용 애니메이션
- `about`: 소개 페이지용 애니메이션
- `contact`: 연락처 페이지용 애니메이션
- `portfolio`: 포트폴리오용 애니메이션

### 커스텀 프리셋 생성
```tsx
const customPreset = {
  'hero': { type: 'fade-in', delay: 0 },
  'content': { type: 'slide-up', delay: 300 },
  'cta': { type: 'scale-in', delay: 600 }
}
```

## 🚀 데모 사이트

실제 사용 예제를 확인하세요:
- [라이브 데모](https://hua-animation.vercel.app)
- [문서](https://hua-animation.vercel.app/docs)
- [GitHub](https://github.com/hua-labs/hua-animation)

## 📚 문서

- [Getting Started](./docs/getting-started.md)
- [API Reference](./docs/api-reference.md)
- [Examples](./docs/examples.md)
- [Migration Guide](./docs/migration.md)

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면 [Contributing Guide](./CONTRIBUTING.md)를 참고해주세요.

## 📄 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요. 