# 🚀 초보자를 위한 5분 완성 애니메이션 가이드

**복잡한 설정 없이 5분 만에 애니메이션 마스터가 되어보세요!**

## 📦 1단계: 설치

```bash
npm install @hua-labs/animation
```

## 🎯 2단계: 가장 간단한 애니메이션

### 페이드인 (가장 쉬움!)
```tsx
import { useFadeIn } from '@hua-labs/animation'

function MyComponent() {
  const animation = useFadeIn() // 설정 없이!

  return (
    <div ref={animation.ref} className="w-20 h-20 bg-blue-500 rounded">
      페이드인! ✨
    </div>
  )
}
```

### 호버 효과 (마우스 올리면!)
```tsx
import { useInteractive } from '@hua-labs/animation'

function HoverButton() {
  const animation = useInteractive({
    type: 'hover',
    effect: 'scale'
  })

  return (
    <button ref={animation.ref} className="px-4 py-2 bg-blue-500 text-white rounded">
      마우스를 올려보세요! 🖱️
    </button>
  )
}
```

## 🔄 3단계: 반복 애니메이션

### 로딩 스피너
```tsx
import { useRepeat } from '@hua-labs/animation'

function LoadingSpinner() {
  const animation = useRepeat({
    effect: 'pulse'
  })

  return (
    <div ref={animation.ref} className="w-8 h-8 bg-purple-500 rounded">
      로딩 중... 🔄
    </div>
  )
}
```

### 바운스 효과
```tsx
function BounceButton() {
  const animation = useRepeat({
    effect: 'bounce',
    intensity: 2.0
  })

  return (
    <div ref={animation.ref} className="w-16 h-16 bg-green-500 rounded">
      바운스! 🎪
    </div>
  )
}
```

## 🌊 4단계: 스프링 애니메이션

### 물리 기반 애니메이션
```tsx
import { useSpring } from '@hua-labs/animation'

function SpringButton() {
  const animation = useSpring({
    from: 0,
    to: 1,
    type: 'bounce'
  })

  return (
    <div ref={animation.ref} className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded">
      스프링! 🌊
    </div>
  )
}
```

## 💀 5단계: 스켈레톤 로딩

### 로딩 상태 애니메이션
```tsx
import { useSkeleton } from '@hua-labs/animation'

function SkeletonCard() {
  const animation = useSkeleton()

  return (
    <div ref={animation.ref} className="w-64 h-32 bg-gray-200 rounded">
      로딩 중... 💀
    </div>
  )
}
```

## 🎨 실전 예제: 카드 컴포넌트

```tsx
import { useInteractive, useFadeIn } from '@hua-labs/animation'

function AnimatedCard() {
  const fadeIn = useFadeIn({ delay: 200 })
  const hover = useInteractive({
    type: 'hover',
    effect: 'scale',
    intensity: 0.1
  })

  return (
    <div 
      ref={(el) => {
        fadeIn.ref(el)
        hover.ref(el)
      }}
      className="p-6 bg-white rounded-lg shadow-lg"
    >
      <h3 className="text-xl font-bold">애니메이션 카드</h3>
      <p className="text-gray-600">호버하면 살짝 커집니다! 🎯</p>
    </div>
  )
}
```

## 🎯 초보자 팁

### ✅ 권장 사용법
1. **전용 훅 사용**: `useFadeIn`, `useSlideUp` 등이 가장 쉬움
2. **기본값 활용**: 설정 없이 바로 사용 가능
3. **하나씩 추가**: 복잡한 애니메이션은 단계적으로

### ❌ 피해야 할 것들
1. **복잡한 설정**: 처음에는 기본값으로 시작
2. **너무 많은 애니메이션**: 성능에 영향
3. **빠른 반복**: 깜빡임 현상 발생

## 🚀 다음 단계

더 많은 예제와 고급 기능은 [README.md](./README.md)를 확인하세요!

---

**🎉 이제 당신도 애니메이션 마스터!** 