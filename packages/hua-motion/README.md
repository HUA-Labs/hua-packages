# HUA Motion - 통합 패키지

**React 애플리케이션을 위한 모션 및 애니메이션 라이브러리**

HUA Motion은 Core와 Advanced 패키지를 통합하여 제공하는 통합 패키지입니다. 기존 코드와의 호환성을 위해 Core와 Advanced의 모든 기능을 re-export합니다.

## 📦 패키지 구조

```
@hua-labs/motion           # 통합 패키지 (Core + Advanced)
├── @hua-labs/motion-core  # 필수 기능 (25개 훅, Zero Dependencies)
└── @hua-labs/motion-advanced # 고급 기능 (17개 훅, Core 의존)
```

## 🚀 빠른 시작

### 설치

```bash
npm install @hua-labs/motion
# 또는
yarn add @hua-labs/motion
# 또는
pnpm add @hua-labs/motion
```

### 기본 사용법

```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion'

function MyComponent() {
  const fadeIn = useFadeIn({ duration: 800 })
  const slideUp = useSlideUp({ delay: 200 })

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>
        Welcome
      </h1>
      <p ref={slideUp.ref} style={slideUp.style}>
        Beautiful animations
      </p>
    </div>
  )
}
```

## 📚 패키지 선택 가이드

### Core vs Advanced vs 통합 패키지

| 패키지 | 용도 | 의존성 | 권장 사용 |
|--------|------|--------|----------|
| `@hua-labs/motion-core` | 기본 애니메이션 | Zero | ✅ **권장**: 번들 크기 최적화 |
| `@hua-labs/motion-advanced` | 고급 기능 | Core | 복잡한 시퀀스, 오케스트레이션 |
| `@hua-labs/motion` | 모든 기능 | Core + Advanced | 기존 코드 호환성 |

### 어떤 패키지를 선택해야 할까?

#### ✅ Core만 필요한 경우 (권장)
- 기본 페이드, 슬라이드 애니메이션
- 스크롤 리빌 애니메이션
- 간단한 인터랙션
- **번들 크기 최적화가 중요한 경우**

```bash
pnpm add @hua-labs/motion-core
```

#### 🚀 Advanced가 필요한 경우
- 복잡한 애니메이션 시퀀스
- 오케스트레이션
- 자동화된 모션
- 게임 루프, 성능 모니터링

```bash
pnpm add @hua-labs/motion-advanced
```

#### 🔄 통합 패키지 사용 (기존 코드 호환)
- 기존 코드와의 호환성 유지
- Core와 Advanced 모두 필요
- 점진적 마이그레이션

```bash
pnpm add @hua-labs/motion
```

## 🎯 주요 기능

### Core 패키지 (25개 훅)
- **기본 모션**: `useFadeIn`, `useSlideUp`, `useScaleIn`, `useBounceIn` 등
- **인터랙션**: `useHoverMotion`, `useClickToggle`, `useFocusToggle` 등
- **스크롤**: `useScrollReveal`, `useScrollProgress` 등
- **유틸리티**: `useMotionState`, `useSpringMotion` 등

### Advanced 패키지 (17개 훅)
- **자동 모션**: `useAutoSlide`, `useAutoScale`, `useAutoFade` 등
- **오케스트레이션**: `useMotionOrchestra`, `useOrchestration`, `useSequence` 등
- **고급 인터랙션**: `useLayoutMotion`, `useKeyboardToggle` 등
- **성능**: `usePerformanceMonitor`, `useGameLoop` 등

## 📖 문서

- [도입 가이드](./docs/GETTING_STARTED.md) - 패키지 선택 및 설치 가이드
- [마이그레이션 가이드](./docs/MIGRATION_GUIDE.md) - 기존 코드 마이그레이션
- [의존성 규칙](./docs/DEPENDENCY_RULES.md) - 패키지 간 의존성 규칙

## 🔗 관련 패키지

- [@hua-labs/motion-core](../hua-motion-core) - 필수 모션 기능
- [@hua-labs/motion-advanced](../hua-motion-advanced) - 고급 모션 기능

## ⚠️ 마이그레이션 권장

**새 프로젝트에서는 Core 또는 Advanced를 직접 사용하는 것을 권장합니다.**

```tsx
// ❌ 권장하지 않음 (통합 패키지)
import { useFadeIn } from '@hua-labs/motion'

// ✅ 권장 (Core 직접 사용)
import { useFadeIn } from '@hua-labs/motion-core'
```

이렇게 하면:
- ✅ 번들 크기 최적화
- ✅ 명확한 의존성
- ✅ 필요한 기능만 포함

## 🌐 브라우저 지원

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## 📄 라이선스

MIT License

---

**Built with ❤️ by [HUA Labs](https://github.com/HUA-Labs)**
