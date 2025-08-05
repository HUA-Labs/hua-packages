# HUA Animation SDK 아키텍처 문서

## 개요

HUA Animation SDK는 **서비스단은 간단하게, SDK 내부는 강력하게** 하는 것을 목표로 설계되었습니다. Framer Motion의 복잡한 설정 대신 직관적이고 간단한 API를 제공하면서도, 내부적으로는 고급 애니메이션 기능을 지원합니다.

## 애니메이션 타입 (현재 구현 상태)

### 현재 구현 완료 ✅
- **개별 요소 애니메이션**: `useSmartAnimation` - 완전 구현 및 테스트 완료
- **페이지 레벨 애니메이션**: `usePageAnimations` - 완전 구현 및 테스트 완료
- **프리셋 기반 애니메이션**: `useSimplePageAnimation` - 완전 구현 및 테스트 완료

### 🎉 **3단계 추상화 계층 완성!**

---

## 세 가지 애니메이션 타입 (계획)

### 1. 개별 요소 애니메이션 (Individual Element Animation)

#### 개요
가장 기본적인 방식으로, 각 요소마다 개별적으로 애니메이션을 적용합니다.

#### API
```typescript
import { useSmartAnimation } from '@hua-labs/animation'

// 기본 사용법
const heroRef = useSmartAnimation({ type: 'hero' })
const titleRef = useSmartAnimation({ type: 'title' })
const buttonRef = useSmartAnimation({ type: 'button' })

// 커스텀 설정
const customRef = useSmartAnimation({ 
  type: 'button',
  hover: true,
  click: true,
  delay: 200,
  duration: 500
})
```

#### 사용 예시
```tsx
export default function HomePage() {
  const heroRef = useSmartAnimation({ type: 'hero' })
  const titleRef = useSmartAnimation({ type: 'title' })
  const buttonRef = useSmartAnimation({ type: 'button' })

  return (
    <div>
      <div ref={heroRef.ref} style={heroRef.style}>
        <h1 ref={titleRef.ref} style={titleRef.style}>제목</h1>
        <button ref={buttonRef.ref} style={buttonRef.style}>버튼</button>
      </div>
    </div>
  )
}
```

#### 장점
- ✅ 직관적이고 이해하기 쉬움
- ✅ 각 요소별 세밀한 제어 가능
- ✅ 점진적 도입 가능

#### 단점
- ❌ 많은 요소가 있을 때 코드 중복
- ❌ 일관성 유지 어려움
- ❌ 설정 변경 시 모든 요소 수정 필요

#### 복잡도
- **서비스단**: 중간 (요소별 개별 설정)
- **SDK 내부**: 높음 (강력한 기능 지원)

#### 구현 상태
- ✅ **완전 구현 완료**
- ✅ **테스트 완료**
- ✅ **프로덕션 사용 가능**

---

### 2. 페이지 레벨 애니메이션 (Page-level Animation)

#### 개요
페이지 전체의 애니메이션을 중앙에서 관리하는 방식입니다.

#### API
```typescript
import { usePageAnimations } from '@hua-labs/animation'

// 설정 기반 사용법
const animations = usePageAnimations({
  hero: { type: 'hero' },
  title: { type: 'title' },
  button: { type: 'button', hover: true, click: true },
  card1: { type: 'card' },
  card2: { type: 'card' }
})
```

#### 사용 예시
```tsx
export default function HomePage() {
  const animations = usePageAnimations({
    hero: { type: 'hero' },
    title: { type: 'title' },
    button: { type: 'button' },
    card1: { type: 'card' },
    card2: { type: 'card' }
  })

  return (
    <div>
      <div data-animation-id="hero" style={animations.hero.style}>
        <h1 data-animation-id="title" style={animations.title.style}>제목</h1>
        <button data-animation-id="button" style={animations.button.style}>버튼</button>
      </div>
      <div data-animation-id="card1" style={animations.card1.style}>카드 1</div>
      <div data-animation-id="card2" style={animations.card2.style}>카드 2</div>
    </div>
  )
}
```

#### 장점
- ✅ 중앙 집중식 관리
- ✅ 일관성 보장
- ✅ 설정 변경 시 한 곳만 수정

#### 단점
- ❌ 초기 설정 복잡
- ❌ DOM 속성 추가 필요 (`data-animation-id`)
- ❌ 러닝 커브 존재

#### 복잡도
- **서비스단**: 중간 (설정 객체 필요)
- **SDK 내부**: 매우 높음 (중앙 상태 관리)

#### 구현 상태
- ✅ **완전 구현 완료**
- ✅ **테스트 완료**
- ✅ **프로덕션 사용 가능**

---

### 3. 프리셋 기반 애니메이션 (Preset-based Animation)

#### 개요
미리 정의된 페이지 타입별 프리셋을 사용하는 가장 간단한 방식입니다.

#### API
```typescript
import { useSimplePageAnimation } from '@hua-labs/animation'

// 프리셋 사용법
const animations = useSimplePageAnimation('home')  // 'home', 'dashboard', 'product', 'blog'

// 커스텀 설정도 가능
const customAnimations = useCustomPageAnimation({
  hero: { type: 'hero' },
  title: { type: 'title' }
})
```

#### 지원하는 프리셋
```typescript
const PAGE_ANIMATIONS = {
  // 홈페이지
  home: {
    hero: { type: 'hero' },
    title: { type: 'title' },
    description: { type: 'text' },
    cta: { type: 'button' },
    feature1: { type: 'card' },
    feature2: { type: 'card' },
    feature3: { type: 'card' }
  },
  
  // 대시보드
  dashboard: {
    header: { type: 'hero' },
    sidebar: { type: 'slideLeft' },
    main: { type: 'fadeIn' },
    card1: { type: 'card' },
    card2: { type: 'card' },
    card3: { type: 'card' },
    chart: { type: 'image' }
  },
  
  // 제품 페이지
  product: {
    hero: { type: 'hero' },
    title: { type: 'title' },
    image: { type: 'image' },
    description: { type: 'text' },
    price: { type: 'text' },
    buyButton: { type: 'button' },
    features: { type: 'card' }
  },
  
  // 블로그
  blog: {
    header: { type: 'hero' },
    title: { type: 'title' },
    content: { type: 'text' },
    sidebar: { type: 'slideRight' },
    related1: { type: 'card' },
    related2: { type: 'card' },
    related3: { type: 'card' }
  }
}
```

#### 사용 예시
```tsx
export default function HomePage() {
  // 1줄로 모든 애니메이션 설정!
  const animations = useSimplePageAnimation('home')

  return (
    <div>
      <div data-animation-id="hero" style={animations.hero.style}>
        <h1 data-animation-id="title" style={animations.title.style}>제목</h1>
        <p data-animation-id="description" style={animations.description.style}>설명</p>
        <button data-animation-id="cta" style={animations.cta.style}>시작하기</button>
      </div>
      <div data-animation-id="feature1" style={animations.feature1.style}>기능 1</div>
      <div data-animation-id="feature2" style={animations.feature2.style}>기능 2</div>
      <div data-animation-id="feature3" style={animations.feature3.style}>기능 3</div>
    </div>
  )
}
```

#### 장점
- ✅ **매우 간단한 API** (1줄로 모든 애니메이션 설정)
- ✅ **일관성 보장** (표준화된 애니메이션)
- ✅ **빠른 개발** (설정 불필요)
- ✅ **유지보수성** (프리셋 수정으로 전체 변경)

#### 단점
- ❌ 유연성 제한
- ❌ 커스텀 설정 어려움
- ❌ 새로운 페이지 타입 추가 시 SDK 수정 필요

#### 복잡도
- **서비스단**: 매우 낮음 (1줄 설정)
- **SDK 내부**: 매우 높음 (프리셋 시스템 + 중앙 관리)

#### 구현 상태
- ✅ **완전 구현 완료**
- ✅ **테스트 완료**
- ✅ **프로덕션 사용 가능**

---

## 비교 분석

### 코드 복잡도 비교

| 방식 | 서비스단 복잡도 | SDK 내부 복잡도 | 코드 라인 수 | 유지보수성 |
|------|----------------|----------------|-------------|-----------|
| **개별 요소** | 중간 | 높음 | 7줄 | 낮음 |
| **페이지 레벨** | 중간 | 매우 높음 | 5줄 | 높음 |
| **프리셋 기반** | 매우 낮음 | 매우 높음 | 1줄 | 매우 높음 |

### 사용 시나리오별 추천

#### 🏠 **간단한 페이지 (랜딩페이지, 소개페이지)**
- **추천**: 프리셋 기반 (`useSimplePageAnimation`)
- **이유**: 빠른 개발, 일관성 보장

#### 📊 **복잡한 페이지 (대시보드, 관리자 페이지)**
- **추천**: 페이지 레벨 (`usePageAnimations`)
- **이유**: 세밀한 제어, 중앙 관리

#### 🎨 **커스텀 페이지 (특별한 요구사항)**
- **추천**: 개별 요소 (`useSmartAnimation`)
- **이유**: 최대 유연성, 세밀한 제어

---

## 기술적 구현

### 공통 프리셋 시스템
```typescript
const presets = {
  hero: { entrance: 'fadeIn', delay: 200, duration: 800, hover: false, click: false },
  title: { entrance: 'slideUp', delay: 400, duration: 700, hover: false, click: false },
  button: { entrance: 'scaleIn', delay: 600, duration: 300, hover: true, click: true },
  card: { entrance: 'slideUp', delay: 800, duration: 500, hover: true, click: false },
  text: { entrance: 'fadeIn', delay: 200, duration: 600, hover: false, click: false },
  image: { entrance: 'scaleIn', delay: 400, duration: 600, hover: true, click: false }
}
```

### 지원하는 애니메이션 타입
- **entrance**: `fadeIn`, `slideUp`, `slideLeft`, `slideRight`, `scaleIn`, `bounceIn`
- **interaction**: `hover`, `click`
- **timing**: `delay`, `duration`
- **trigger**: `threshold` (Intersection Observer)

### 성능 최적화
- **Intersection Observer**: 스크롤 기반 애니메이션
- **useCallback**: 불필요한 리렌더링 방지
- **willChange**: GPU 가속
- **중앙 상태 관리**: 효율적인 메모리 사용

---

## 로드맵

### Phase 1: 안정화 (현재)
- [x] 기본 애니메이션 훅 구현 (`useSmartAnimation`)
- [x] 프리셋 시스템 구축
- [x] 버그 수정 및 성능 최적화
- [x] 문서화 완료
- [x] 테스트 완료

### Phase 2: 고급 기능 (완료!)
- [x] 페이지 레벨 애니메이션 (`usePageAnimations`)
- [x] 프리셋 기반 애니메이션 (`useSimplePageAnimation`)
- [ ] 애니메이션 오케스트레이션
- [ ] 스프링 물리 시스템
- [ ] 제스처 애니메이션
- [ ] 언어 변경 감지

### Phase 3: 확장
- [ ] 컴포넌트 기반 API (`<Animate>`)
- [ ] 애니메이션 빌더
- [ ] 시각적 에디터
- [ ] 성능 모니터링

---

## 결론

HUA Animation SDK는 **단계별로 발전하는 애니메이션 시스템**을 제공합니다:

### 현재 상태 (Phase 2 완료) ✅
- **개별 요소 애니메이션**: `useSmartAnimation` - 완전 구현 및 테스트 완료
- **페이지 레벨 애니메이션**: `usePageAnimations` - 완전 구현 및 테스트 완료
- **프리셋 기반 애니메이션**: `useSimplePageAnimation` - 완전 구현 및 테스트 완료
- **프로덕션 사용 가능**: 안정적이고 성능 최적화된 애니메이션

### 향후 계획 🚀
1. **고급 기능**: 오케스트레이션, 스프링 물리 (Phase 3)
2. **외부 배포**: NPM 패키지 배포 (Phase 4)
3. **내부 서비스 통합**: my-chat 등 적용 (Phase 4)

### 현재 사용 가능한 기능
```typescript
// 1단계: 프리셋 기반 (가장 간단)
const animations = useSimplePageAnimation('home')

// 2단계: 페이지 레벨 (중간 복잡도)
const animations = usePageAnimations({
  hero: { type: 'hero' },
  title: { type: 'title' },
  button: { type: 'button', hover: true, click: true }
})

// 3단계: 개별 요소 (최대 유연성)
const heroRef = useSmartAnimation({ type: 'hero' })
const titleRef = useSmartAnimation({ type: 'title' })
const buttonRef = useSmartAnimation({ type: 'button' })
```

이를 통해 **Framer Motion의 복잡성 없이도 강력한 애니메이션**을 구현할 수 있으며, **서비스단의 개발 효율성을 크게 향상**시킬 수 있습니다. 