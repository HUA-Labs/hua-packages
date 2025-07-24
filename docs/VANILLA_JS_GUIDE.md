# 🟡 바닐라 JavaScript 가이드

**HUA Animation SDK의 핵심 로직을 바닐라 JS에서 사용하는 방법**

## 🚀 핵심 애니메이션 함수들

### 페이드인 애니메이션

```javascript
// 핵심 페이드인 함수
function fadeIn(element, config = {}) {
  const {
    duration = 1000,
    delay = 0,
    ease = 'easeOut'
  } = config

  // 초기 상태 설정
  element.style.opacity = '0'
  element.style.transition = `opacity ${duration}ms ${ease}`

  // 애니메이션 시작
  setTimeout(() => {
    element.style.opacity = '1'
  }, delay)

  // 완료 콜백
  setTimeout(() => {
    if (config.onComplete) {
      config.onComplete()
    }
  }, delay + duration)
}

// 사용 예제
const button = document.querySelector('.my-button')
fadeIn(button, {
  duration: 800,
  delay: 200,
  onComplete: () => console.log('페이드인 완료!')
})
```

### 슬라이드업 애니메이션

```javascript
function slideUp(element, config = {}) {
  const {
    distance = 50,
    duration = 1000,
    delay = 0,
    ease = 'easeOut'
  } = config

  // 초기 상태 설정
  element.style.opacity = '0'
  element.style.transform = `translateY(${distance}px)`
  element.style.transition = `opacity ${duration}ms ${ease}, transform ${duration}ms ${ease}`

  // 애니메이션 시작
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'translateY(0)'
  }, delay)

  // 완료 콜백
  setTimeout(() => {
    if (config.onComplete) {
      config.onComplete()
    }
  }, delay + duration)
}

// 사용 예제
const card = document.querySelector('.my-card')
slideUp(card, {
  distance: 30,
  duration: 600,
  onComplete: () => console.log('슬라이드업 완료!')
})
```

### 스프링 애니메이션

```javascript
function spring(element, config = {}) {
  const {
    from = 0,
    to = 1,
    type = 'bounce',
    onComplete
  } = config

  // 스프링 프리셋
  const springPresets = {
    bounce: { mass: 1.2, stiffness: 40, damping: 25 },
    gentle: { mass: 2.0, stiffness: 25, damping: 35 },
    fast: { mass: 1.0, stiffness: 60, damping: 30 }
  }

  const spring = springPresets[type]
  let position = from
  let velocity = 0
  const target = to

  // 초기 상태 설정
  element.style.transform = `scale(${from})`

  // 스프링 애니메이션
  function animate() {
    const springForce = -spring.stiffness * (position - target)
    const dampingForce = -spring.damping * velocity
    const acceleration = (springForce + dampingForce) / spring.mass

    velocity += acceleration * 0.016
    position += velocity

    element.style.transform = `scale(${position})`

    if (Math.abs(velocity) < 0.01 && Math.abs(position - target) < 0.01) {
      if (onComplete) onComplete()
      return
    }

    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

// 사용 예제
const icon = document.querySelector('.my-icon')
spring(icon, {
  from: 0,
  to: 1,
  type: 'bounce',
  onComplete: () => console.log('스프링 완료!')
})
```

## 🎨 실전 예제

### 애니메이션 카드 갤러리

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HUA Animation - 바닐라 JS</title>
    <style>
        .card {
            width: 200px;
            height: 150px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin: 10px;
            opacity: 0;
            transform: translateY(50px);
        }
        
        .gallery {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            padding: 20px;
        }
        
        .button {
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
        }
        
        .button:hover {
            background: #2563eb;
        }
    </style>
</head>
<body>
    <div style="text-align: center; padding: 20px;">
        <h1>HUA Animation - 바닐라 JS</h1>
        <button class="button" onclick="animateAll()">모든 카드 애니메이션</button>
        <button class="button" onclick="resetAll()">리셋</button>
    </div>
    
    <div class="gallery" id="gallery">
        <div class="card">카드 1</div>
        <div class="card">카드 2</div>
        <div class="card">카드 3</div>
        <div class="card">카드 4</div>
        <div class="card">카드 5</div>
        <div class="card">카드 6</div>
    </div>

    <script>
        // 애니메이션 함수들
        function fadeIn(element, config = {}) {
            const { duration = 1000, delay = 0 } = config
            
            element.style.transition = `opacity ${duration}ms easeOut`
            
            setTimeout(() => {
                element.style.opacity = '1'
            }, delay)
        }

        function slideUp(element, config = {}) {
            const { duration = 1000, delay = 0 } = config
            
            element.style.transition = `transform ${duration}ms easeOut`
            
            setTimeout(() => {
                element.style.transform = 'translateY(0)'
            }, delay)
        }

        function spring(element, config = {}) {
            const { from = 0, to = 1, type = 'bounce' } = config
            
            const springPresets = {
                bounce: { mass: 1.2, stiffness: 40, damping: 25 },
                gentle: { mass: 2.0, stiffness: 25, damping: 35 }
            }
            
            const spring = springPresets[type]
            let position = from
            let velocity = 0
            
            element.style.transform = `scale(${from})`
            
            function animate() {
                const springForce = -spring.stiffness * (position - to)
                const dampingForce = -spring.damping * velocity
                const acceleration = (springForce + dampingForce) / spring.mass
                
                velocity += acceleration * 0.016
                position += velocity
                
                element.style.transform = `scale(${position})`
                
                if (Math.abs(velocity) < 0.01 && Math.abs(position - to) < 0.01) {
                    return
                }
                
                requestAnimationFrame(animate)
            }
            
            requestAnimationFrame(animate)
        }

        // 모든 카드 애니메이션
        function animateAll() {
            const cards = document.querySelectorAll('.card')
            
            cards.forEach((card, index) => {
                // 페이드인과 슬라이드업 동시에
                fadeIn(card, { delay: index * 100 })
                slideUp(card, { delay: index * 100 })
                
                // 호버 효과 추가
                card.addEventListener('mouseenter', () => {
                    spring(card, { from: 1, to: 1.05, type: 'gentle' })
                })
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'scale(1)'
                })
            })
        }

        // 리셋
        function resetAll() {
            const cards = document.querySelectorAll('.card')
            cards.forEach(card => {
                card.style.opacity = '0'
                card.style.transform = 'translateY(50px) scale(1)'
                card.style.transition = 'none'
            })
        }

        // 페이지 로드 시 자동 애니메이션
        window.addEventListener('load', () => {
            setTimeout(animateAll, 500)
        })
    </script>
</body>
</html>
```

## 🔧 유틸리티 함수들

### 이징 함수들

```javascript
const easing = {
  linear: t => t,
  easeOut: t => 1 - Math.pow(1 - t, 2),
  easeIn: t => t * t,
  easeInOut: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  bounce: t => {
    if (t < 1 / 2.75) return 7.5625 * t * t
    if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
    if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
  }
}

// 이징을 적용한 애니메이션
function animateWithEasing(element, from, to, duration, easeType = 'easeOut', onUpdate, onComplete) {
  const startTime = performance.now()
  const ease = easing[easeType]
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = ease(progress)
    
    const currentValue = from + (to - from) * easedProgress
    
    if (onUpdate) {
      onUpdate(currentValue)
    }
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      if (onComplete) onComplete()
    }
  }
  
  requestAnimationFrame(animate)
}

// 사용 예제
const element = document.querySelector('.my-element')
animateWithEasing(
  element,
  0, // from
  100, // to
  1000, // duration
  'bounce', // ease
  (value) => {
    element.style.transform = `translateX(${value}px)`
  },
  () => console.log('애니메이션 완료!')
)
```

## 🎯 성능 최적화

### RAF (RequestAnimationFrame) 활용

```javascript
// 성능 최적화된 애니메이션 매니저
class AnimationManager {
  constructor() {
    this.animations = new Set()
    this.isRunning = false
  }

  add(animation) {
    this.animations.add(animation)
    if (!this.isRunning) {
      this.start()
    }
  }

  remove(animation) {
    this.animations.delete(animation)
    if (this.animations.size === 0) {
      this.stop()
    }
  }

  start() {
    this.isRunning = true
    this.animate()
  }

  stop() {
    this.isRunning = false
  }

  animate() {
    if (!this.isRunning) return

    this.animations.forEach(animation => {
      if (animation.update) {
        animation.update()
      }
    })

    requestAnimationFrame(() => this.animate())
  }
}

// 사용 예제
const manager = new AnimationManager()

const fadeAnimation = {
  element: document.querySelector('.fade-element'),
  duration: 1000,
  startTime: performance.now(),
  from: 0,
  to: 1,
  update() {
    const elapsed = performance.now() - this.startTime
    const progress = Math.min(elapsed / this.duration, 1)
    const opacity = this.from + (this.to - this.from) * progress
    
    this.element.style.opacity = opacity
    
    if (progress >= 1) {
      manager.remove(this)
    }
  }
}

manager.add(fadeAnimation)
```

## 📚 장점

### ✅ 바닐라 JS 호환성
- **프레임워크 독립적**: React, Vue, Angular 등에 의존하지 않음
- **가벼운 번들**: 필요한 함수만 사용
- **높은 성능**: 직접적인 DOM 조작
- **완전한 제어**: 모든 애니메이션 세부사항 제어 가능

### 🚀 확장성
- **모든 프레임워크**: 어떤 JS 프레임워크에서도 사용 가능
- **커스터마이징**: 완전한 커스터마이징 가능
- **성능 최적화**: RAF와 메모리 관리
- **타입 안전성**: TypeScript 지원

## 🎯 다음 단계

1. **바닐라 JS 패키지**: `@hua-labs/animation-core` 개발
2. **Web Components**: 재사용 가능한 애니메이션 컴포넌트
3. **CSS-in-JS**: 스타일링 통합
4. **성능 모니터링**: 애니메이션 성능 측정 도구

---

**바닐라 JavaScript에서도 HUA Animation SDK의 모든 핵심 기능을 사용할 수 있습니다!** 🎉 