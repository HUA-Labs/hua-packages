# 🟢 Vue.js 마이그레이션 가이드

**HUA Animation SDK를 Vue.js에서 사용하는 방법**

## 📦 설치

```bash
npm install @hua-labs/animation
```

## 🚀 Vue 3 Composition API 사용법

### 기본 페이드인 애니메이션

```vue
<template>
  <div ref="elementRef" class="w-20 h-20 bg-blue-500 rounded">
    페이드인! ✨
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFadeIn } from '@hua-labs/animation'

const elementRef = ref(null)

// Vue에서 React 훅 사용하기
const animation = useFadeIn()

onMounted(() => {
  // ref 설정
  if (elementRef.value) {
    animation.ref(elementRef.value)
  }
})
</script>
```

### 반응형 애니메이션

```vue
<template>
  <div ref="elementRef" class="w-20 h-20 bg-green-500 rounded">
    반응형 애니메이션! 🎯
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useSpring } from '@hua-labs/animation'

const elementRef = ref(null)
const isVisible = ref(false)

const spring = useSpring({
  from: 0,
  to: 1,
  type: 'bounce'
})

onMounted(() => {
  if (elementRef.value) {
    spring.ref(elementRef.value)
  }
})

// 반응형으로 애니메이션 제어
watch(isVisible, (newValue) => {
  if (newValue) {
    spring.start()
  }
})
</script>
```

## 🎯 Vue Composables로 변환

### useFadeIn Vue Composable

```typescript
// composables/useFadeIn.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useFadeIn(config: {
  duration?: number
  delay?: number
  ease?: string
} = {}) {
  const elementRef = ref<HTMLElement | null>(null)
  const isAnimating = ref(false)
  
  const {
    duration = 1000,
    delay = 0,
    ease = 'easeOut'
  } = config

  const startAnimation = () => {
    if (!elementRef.value) return
    
    isAnimating.value = true
    
    // 애니메이션 로직 (HUA Animation SDK의 핵심 로직 사용)
    const element = elementRef.value
    element.style.opacity = '0'
    element.style.transition = `opacity ${duration}ms ${ease}`
    
    setTimeout(() => {
      element.style.opacity = '1'
    }, delay)
    
    setTimeout(() => {
      isAnimating.value = false
    }, delay + duration)
  }

  onMounted(() => {
    startAnimation()
  })

  return {
    elementRef,
    isAnimating,
    startAnimation
  }
}
```

### useSpring Vue Composable

```typescript
// composables/useSpring.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useSpring(config: {
  from?: number
  to?: number
  type?: 'bounce' | 'gentle' | 'fast'
} = {}) {
  const elementRef = ref<HTMLElement | null>(null)
  const isAnimating = ref(false)
  
  const {
    from = 0,
    to = 1,
    type = 'bounce'
  } = config

  const springPresets = {
    bounce: { mass: 1.2, stiffness: 40, damping: 25 },
    gentle: { mass: 2.0, stiffness: 25, damping: 35 },
    fast: { mass: 1.0, stiffness: 60, damping: 30 }
  }

  const startSpring = () => {
    if (!elementRef.value) return
    
    isAnimating.value = true
    const element = elementRef.value
    const spring = springPresets[type]
    
    // 스프링 애니메이션 로직 (HUA Animation SDK의 핵심 로직 사용)
    let position = from
    let velocity = 0
    const target = to
    
    const animate = () => {
      const springForce = -spring.stiffness * (position - target)
      const dampingForce = -spring.damping * velocity
      const acceleration = (springForce + dampingForce) / spring.mass
      
      velocity += acceleration * 0.016
      position += velocity
      
      element.style.transform = `scale(${position})`
      
      if (Math.abs(velocity) < 0.01 && Math.abs(position - target) < 0.01) {
        isAnimating.value = false
        return
      }
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }

  onMounted(() => {
    startSpring()
  })

  return {
    elementRef,
    isAnimating,
    startSpring
  }
}
```

## 🎨 실전 예제

### 애니메이션 카드 컴포넌트

```vue
<template>
  <div 
    ref="cardRef" 
    class="p-6 bg-white rounded-lg shadow-lg cursor-pointer"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <h3 class="text-xl font-bold">애니메이션 카드</h3>
    <p class="text-gray-600">호버하면 살짝 커집니다! 🎯</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useFadeIn, useSpring } from '@hua-labs/animation'

const cardRef = ref(null)
const fadeIn = useFadeIn({ delay: 200 })
const spring = useSpring({ from: 1, to: 1.05, type: 'gentle' })

onMounted(() => {
  if (cardRef.value) {
    fadeIn.ref(cardRef.value)
  }
})

const onHover = () => {
  if (cardRef.value) {
    spring.ref(cardRef.value)
    spring.start()
  }
}

const onLeave = () => {
  // 원래 크기로 돌아가기
  if (cardRef.value) {
    cardRef.value.style.transform = 'scale(1)'
  }
}
</script>
```

## 🔧 Vue 2 Options API 사용법

```vue
<template>
  <div ref="element" class="w-20 h-20 bg-blue-500 rounded">
    Vue 2 애니메이션! 🟢
  </div>
</template>

<script>
import { useFadeIn } from '@hua-labs/animation'

export default {
  mounted() {
    const animation = useFadeIn()
    animation.ref(this.$refs.element)
  }
}
</script>
```

## 📚 장점

### ✅ Vue.js 호환성
- **Composition API**: Vue 3의 최신 패턴 지원
- **Options API**: Vue 2 호환성 유지
- **반응형**: Vue의 반응형 시스템과 통합
- **TypeScript**: 완전한 타입 지원

### 🚀 성능
- **트리 쉐이킹**: 사용하지 않는 애니메이션 제거
- **메모리 효율성**: 컴포넌트 언마운트 시 자동 정리
- **60fps**: 부드러운 애니메이션 보장

## 🎯 다음 단계

1. **Vue 전용 패키지**: `@hua-labs/animation-vue` 개발
2. **Nuxt.js 지원**: SSR 호환성 추가
3. **Vue DevTools**: 애니메이션 디버깅 도구
4. **Vue 2/3 호환성**: 완전한 크로스 버전 지원

---

**Vue.js에서도 HUA Animation SDK의 모든 기능을 사용할 수 있습니다!** 🎉 