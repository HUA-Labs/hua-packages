# HUA Motion - 3단계 추상화 시스템

HUA Motion은 React 애플리케이션을 위한 점진적 모션 추상화 시스템입니다. 사용자의 요구사항에 따라 3단계 중 적절한 수준을 선택할 수 있습니다.

## 🎯 3단계 추상화 구조

### 1단계: useSimpleMotion (프리셋 기반)
**가장 간단한 사용법** - 페이지 타입만 지정하면 자동으로 모션이 적용됩니다.

```typescript
import { useSimpleMotion } from '@hua-labs/motion'

// 홈페이지 프리셋 적용
const motions = useSimpleMotion('home')

// 사용법
<div data-motion-id="hero" ref={motions.hero?.ref} style={motions.hero?.style}>
  Hero Section
</div>
```

**특징:**
- ✅ 페이지 타입별 자동 프리셋
- ✅ 기본 진입 모션만 (fade, slide, scale)
- ❌ 호버/클릭 인터랙션 없음
- ❌ 커스터마이징 제한적

**적합한 사용자:**
- 빠른 프로토타이핑
- 기본적인 모션만 필요한 경우
- 모션에 대한 깊은 이해가 불필요

---

### 2단계: usePageMotions (페이지 레벨)
**중간 수준의 제어** - 요소별 설정과 인터랙션을 지원합니다.

```typescript
import { usePageMotions } from '@hua-labs/motion'

const motions = usePageMotions({
  hero: { type: 'hero', hover: true },
  title: { type: 'title' },
  button: { type: 'button', hover: true, click: true }
})

// 사용법
<div data-motion-id="hero" ref={motions.hero?.ref} style={motions.hero?.style}>
  Hero Section (호버 효과 포함)
</div>
```

**특징:**
- ✅ 1단계의 모든 기능
- ✅ 호버/클릭 인터랙션
- ✅ 요소별 세밀한 설정
- ✅ 상태 동기화
- ❌ 개별 요소 완전 제어 불가

**적합한 사용자:**
- 인터랙티브한 페이지 모션
- 요소 간 모션 조화가 필요한 경우
- 중간 수준의 커스터마이징

---

### 3단계: useSmartMotion (개별 요소)
**완전한 제어** - 각 요소의 모든 모션을 세밀하게 제어할 수 있습니다.

```typescript
import { useSmartMotion } from '@hua-labs/motion'

const heroMotion = useSmartMotion({ 
  type: 'hero', 
  entrance: 'fadeIn',
  hover: true,
  click: true,
  delay: 200,
  duration: 800
})

// 사용법
<div ref={heroMotion.ref} style={heroMotion.style}>
  Hero Section (완전한 제어)
</div>
```

**특징:**
- ✅ 1, 2단계의 모든 기능
- ✅ 커스텀 모션 타입 정의
- ✅ 실시간 상태 변경
- ✅ 언어 변경 감지 등 고급 기능
- ✅ 개별 요소 완전 제어

**적합한 사용자:**
- 복잡한 모션 시나리오
- 고도로 커스터마이징된 모션
- 실시간 모션 제어가 필요한 경우

---

## 🔄 마이그레이션 가이드

### 1단계 → 2단계
```typescript
// Before (1단계)
const motions = useSimpleMotion('home')

// After (2단계)
const motions = usePageMotions({
  hero: { type: 'hero', hover: true },
  title: { type: 'title' }
})
```

### 2단계 → 3단계
```typescript
// Before (2단계)
const motions = usePageMotions({
  hero: { type: 'hero', hover: true }
})

// After (3단계)
const heroMotion = useSmartMotion({ 
  type: 'hero', 
  entrance: 'slideUp',
  hover: true,
  delay: 300
})
```

## 🎨 모션 타입

### 기본 모션
- `fadeIn`: 페이드 인
- `slideUp`: 아래에서 위로 슬라이드
- `slideLeft`: 오른쪽에서 왼쪽으로 슬라이드
- `slideRight`: 왼쪽에서 오른쪽으로 슬라이드
- `scaleIn`: 스케일 확대
- `bounceIn`: 바운스 효과

### 요소 타입별 프리셋
- `hero`: 히어로 섹션 (fadeIn, 200ms delay)
- `title`: 제목 (slideUp, 400ms delay)
- `button`: 버튼 (scaleIn, 600ms delay, hover/click)
- `card`: 카드 (slideUp, 800ms delay, hover)
- `text`: 텍스트 (fadeIn, 200ms delay)
- `image`: 이미지 (scaleIn, 400ms delay, hover)

## 🚀 성능 최적화

### 1단계: 최적화됨
- Intersection Observer 사용
- 불필요한 리렌더링 방지
- 가벼운 상태 관리

### 2단계: 중간 최적화
- 이벤트 위임 사용
- 상태 업데이트 최적화
- 메모리 누수 방지

### 3단계: 고급 최적화
- 개별 요소별 최적화
- 실시간 상태 동기화
- 고급 메모리 관리

## 📱 브라우저 지원

- Chrome 51+
- Firefox 55+
- Safari 12.1+
- Edge 79+

## 🔧 설치 및 사용

```bash
pnpm add @hua-labs/motion
```

```typescript
import { 
  useSimpleMotion,    // 1단계
  usePageMotions,      // 2단계
  useSmartMotion       // 3단계
} from '@hua-labs/motion'
```

## 🤝 기여하기

HUA Motion은 오픈소스 프로젝트입니다. 버그 리포트, 기능 제안, PR을 환영합니다!

## 📄 라이선스

MIT License 