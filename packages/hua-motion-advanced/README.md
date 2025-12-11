# @hua-labs/motion-advanced

🚀 **HUA Motion Advanced** - 고급 모션 훅들과 오케스트레이션 기능

## 📋 개요

`@hua-labs/motion-advanced`는 **Core 패키지의 기본 기능을 확장**하여 **고급 모션 효과**와 **복잡한 애니메이션 시퀀스**를 제공하는 패키지입니다.

## ✨ 주요 기능

### 🚀 고급 모션 (Auto 시리즈)
- **`useAutoSlide`** - 자동 슬라이드 애니메이션
- **`useAutoScale`** - 자동 스케일 애니메이션
- **`useAutoFade`** - 자동 페이드 애니메이션
- **`useAutoPlay`** - 자동 재생 애니메이션

### 🎼 오케스트레이션
- **`useMotionOrchestra`** - 모션 오케스트라 (복잡한 시퀀스)
- **`useOrchestration`** - 오케스트레이션 관리
- **`useSequence`** - 시퀀스 관리

### 🔧 고급 인터랙션
- **`useLayoutMotion`** - 레이아웃 모션
- **`useKeyboardToggle`** - 키보드 토글
- **`useScrollDirection`** - 스크롤 방향 감지
- **`useStickyToggle`** - 스티키 토글
- **`useScrollToggle`** - 스크롤 토글
- **`useVisibilityToggle`** - 가시성 토글
- **`useInteractive`** - 인터랙티브 모션

### ⚡ 성능 최적화
- **`usePerformanceMonitor`** - 성능 모니터링

### 🌍 국제화
- **`useLanguageAwareMotion`** - 언어 인식 모션

### 🎮 게임 엔진
- **`useGameLoop`** - 게임 루프

## 📦 설치

```bash
npm install @hua-labs/motion-advanced
# 또는
yarn add @hua-labs/motion-advanced
# 또는
pnpm add @hua-labs/motion-advanced
```

## 🔧 사용법

```tsx
import { useAutoSlide, useMotionOrchestra } from '@hua-labs/motion-advanced'

function AdvancedMotionExample() {
  const autoSlide = useAutoSlide({ 
    direction: 'left', 
    interval: 3000 
  })
  
  const orchestra = useMotionOrchestra({
    sequences: [
      { id: 'hero', delay: 0, duration: 1000 },
      { id: 'title', delay: 200, duration: 800 },
      { id: 'button', delay: 400, duration: 600 }
    ]
  })

  return (
    <div>
      <div ref={autoSlide.ref} style={autoSlide.style}>
        자동 슬라이드 콘텐츠
      </div>
    </div>
  )
}
```

## 📚 의존성

- **React**: ^18.0.0 || ^19.0.0
- **@hua-labs/motion-core**: Core 패키지 기능 사용

## 🎯 사용 시나리오

- **복잡한 애니메이션 시퀀스**가 필요한 경우
- **자동화된 모션**이 필요한 경우
- **고급 인터랙션**이 필요한 경우
- **성능 최적화**가 중요한 경우
- **게임이나 인터랙티브 앱** 개발 시

## 🔗 관련 패키지

- **[@hua-labs/motion-core](../hua-motion-core)** - 기본 모션 기능 (필수 의존성)
- **[@hua-labs/motion](../../hua-motion)** - 통합 패키지 (Core + Advanced re-export)

## �� 라이선스

MIT License
