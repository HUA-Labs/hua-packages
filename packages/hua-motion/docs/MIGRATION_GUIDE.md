# Motion 패키지 마이그레이션 가이드

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [마이그레이션 전략](#마이그레이션-전략)
3. [단계별 마이그레이션](#단계별-마이그레이션)
4. [코드 예제](#코드-예제)
5. [FAQ](#faq)

---

## 개요

이 가이드는 기존 `@hua-labs/motion` (통합 패키지) 사용 코드를 새로운 패키지 구조(Core/Advanced)로 마이그레이션하는 방법을 설명합니다.

### 마이그레이션 목표

1. **점진적 전환**: 기존 코드를 단계적으로 마이그레이션
2. **하위 호환성**: 통합 패키지로 기존 코드 지원 유지
3. **최적화**: 필요한 패키지만 사용하여 번들 크기 최소화

---

## 마이그레이션 전략

### 전략 1: 점진적 마이그레이션 (권장)

**장점**:
- 기존 코드와 새 코드 공존 가능
- 단계별 검증 가능
- 리스크 최소화

**방법**:
1. 새 코드는 Core/Advanced 직접 사용
2. 기존 코드는 통합 패키지 유지
3. 점진적으로 마이그레이션

### 전략 2: 일괄 마이그레이션

**장점**:
- 빠른 전환
- 일관된 구조

**단점**:
- 높은 리스크
- 전체 테스트 필요

**방법**:
1. 전체 코드 분석
2. 일괄 변경
3. 전체 테스트

---

## 단계별 마이그레이션

### Phase 1: 의존성 분석

#### 1.1 현재 사용 현황 확인

```bash
# 프로젝트에서 motion 패키지 사용 확인
grep -r "@hua-labs/motion" src/
```

#### 1.2 사용하는 훅 목록 정리

**Core 훅 (25개)**:
- `useFadeIn`, `useSlideUp`, `useSlideLeft`, `useSlideRight`
- `useScaleIn`, `useBounceIn`, `usePulse`
- `useHoverMotion`, `useClickToggle`, `useFocusToggle`
- `useScrollReveal`, `useScrollProgress`, `useScrollToggle`
- `useMotionState`, `useRepeat`
- `useGesture`, `useGestureMotion`
- `useSimplePageMotion`, `usePageMotions`, `useSmartMotion`
- `useSpringMotion`, `useGradient`

**Advanced 훅 (17개)**:
- `useAutoSlide`, `useAutoScale`, `useAutoFade`, `useAutoPlay`
- `useMotionOrchestra`, `useOrchestration`, `useSequence`
- `useLayoutMotion`, `useKeyboardToggle`, `useScrollDirection`
- `useStickyToggle`, `useScrollToggle`, `useVisibilityToggle`, `useInteractive`
- `usePerformanceMonitor`, `useLanguageAwareMotion`, `useGameLoop`

#### 1.3 의존성 결정

**Core만 필요한 경우**:
- Core 훅만 사용
- Advanced 훅 미사용

**Advanced도 필요한 경우**:
- Advanced 훅 사용
- 오케스트레이션 필요

### Phase 2: 의존성 변경

#### 2.1 package.json 수정

**Core만 필요한 경우**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "^1.0.0"
  }
}
```

**Advanced도 필요한 경우**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "^1.0.0",
    "@hua-labs/motion-advanced": "^1.0.0"
  }
}
```

#### 2.2 설치

```bash
# Core만
pnpm add @hua-labs/motion-core

# Advanced 포함
pnpm add @hua-labs/motion-core @hua-labs/motion-advanced

# 기존 통합 패키지 제거 (선택적)
pnpm remove @hua-labs/motion
```

### Phase 3: Import 경로 변경

#### 3.1 Core 훅 변경

**변경 전**:
```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion'
```

**변경 후**:
```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'
```

#### 3.2 Advanced 훅 변경

**변경 전**:
```tsx
import { useMotionOrchestra } from '@hua-labs/motion'
```

**변경 후**:
```tsx
import { useMotionOrchestra } from '@hua-labs/motion-advanced'
```

#### 3.3 혼합 사용

**변경 전**:
```tsx
import { useFadeIn, useMotionOrchestra } from '@hua-labs/motion'
```

**변경 후**:
```tsx
import { useFadeIn } from '@hua-labs/motion-core'
import { useMotionOrchestra } from '@hua-labs/motion-advanced'
```

### Phase 4: 코드 검증

#### 4.1 타입 체크

```bash
pnpm type-check
```

#### 4.2 빌드 테스트

```bash
pnpm build
```

#### 4.3 테스트 실행

```bash
pnpm test
```

#### 4.4 번들 크기 확인

```bash
pnpm build:analyze
```

### Phase 5: 통합 패키지 제거 (선택적)

#### 5.1 통합 패키지 제거

```bash
pnpm remove @hua-labs/motion
```

#### 5.2 최종 검증

- 모든 테스트 통과
- 번들 크기 감소 확인
- 성능 테스트

---

## 코드 예제

### 예제 1: 기본 마이그레이션

**변경 전**:
```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion'

function MyComponent() {
  const fadeIn = useFadeIn()
  const slideUp = useSlideUp()

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>Title</h1>
      <p ref={slideUp.ref} style={slideUp.style}>Content</p>
    </div>
  )
}
```

**변경 후**:
```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'

function MyComponent() {
  const fadeIn = useFadeIn()
  const slideUp = useSlideUp()

  return (
    <div>
      <h1 ref={fadeIn.ref} style={fadeIn.style}>Title</h1>
      <p ref={slideUp.ref} style={slideUp.style}>Content</p>
    </div>
  )
}
```

### 예제 2: Advanced 훅 마이그레이션

**변경 전**:
```tsx
import { useFadeIn, useMotionOrchestra } from '@hua-labs/motion'

function AdvancedComponent() {
  const fadeIn = useFadeIn()
  const orchestra = useMotionOrchestra({ sequences: [...] })

  return <div>...</div>
}
```

**변경 후**:
```tsx
import { useFadeIn } from '@hua-labs/motion-core'
import { useMotionOrchestra } from '@hua-labs/motion-advanced'

function AdvancedComponent() {
  const fadeIn = useFadeIn()
  const orchestra = useMotionOrchestra({ sequences: [...] })

  return <div>...</div>
}
```

### 예제 3: 서브 엔트리 포인트 사용

**변경 전**:
```tsx
import { usePageMotions } from '@hua-labs/motion/page'
```

**변경 후**:
```tsx
import { usePageMotions } from '@hua-labs/motion-core'
```

### 예제 4: 점진적 마이그레이션

**혼합 사용 (과도기)**:
```tsx
// 새 코드: Core 직접 사용
import { useFadeIn } from '@hua-labs/motion-core'

// 기존 코드: 통합 패키지 유지
import { useSlideUp } from '@hua-labs/motion'

function MyComponent() {
  const fadeIn = useFadeIn()  // 새 방식
  const slideUp = useSlideUp() // 기존 방식

  return <div>...</div>
}
```

---

## FAQ

### Q1: 통합 패키지를 계속 사용할 수 있나요?

**A**: 네, 가능합니다. 통합 패키지는 하위 호환성을 위해 계속 제공됩니다. 다만 새로운 프로젝트는 Core/Advanced 직접 사용을 권장합니다.

### Q2: 마이그레이션은 필수인가요?

**A**: 필수는 아닙니다. 통합 패키지로 계속 사용할 수 있습니다. 다만 번들 크기 최적화를 위해 마이그레이션을 권장합니다.

### Q3: 점진적 마이그레이션이 가능한가요?

**A**: 네, 가능합니다. Core/Advanced와 통합 패키지를 동시에 사용할 수 있습니다.

### Q4: 번들 크기는 얼마나 줄어드나요?

**A**: 사용하는 기능에 따라 다릅니다. Core만 사용 시 약 30-50% 감소, Advanced 미사용 시 추가 감소가 예상됩니다.

### Q5: 타입 정의는 호환되나요?

**A**: 네, 호환됩니다. Core와 Advanced의 타입은 통합 패키지와 동일합니다.

### Q6: 서브 엔트리 포인트(`/core`, `/page` 등)는 어떻게 되나요?

**A**: 통합 패키지에서 계속 제공됩니다. 다만 Core/Advanced 직접 사용을 권장합니다.

### Q7: 마이그레이션 중 문제가 발생하면?

**A**: 
1. 통합 패키지로 롤백
2. 문제 리포트 작성
3. 단계별로 재시도

### Q8: UI 패키지는 어떻게 마이그레이션하나요?

**A**: UI 패키지는 이미 `@hua-labs/motion-core`를 사용하도록 변경되었습니다. 추가 작업이 필요 없습니다.

---

## 마이그레이션 체크리스트

### 준비 단계
- [ ] 현재 사용 현황 확인
- [ ] 사용하는 훅 목록 정리
- [ ] 의존성 결정 (Core만 / Core + Advanced)

### 실행 단계
- [ ] package.json 의존성 변경
- [ ] 패키지 설치
- [ ] Import 경로 변경
- [ ] 타입 체크
- [ ] 빌드 테스트
- [ ] 테스트 실행

### 검증 단계
- [ ] 모든 테스트 통과
- [ ] 번들 크기 확인
- [ ] 성능 테스트
- [ ] 통합 패키지 제거 (선택적)

---

## 도움말

마이그레이션 중 문제가 발생하면:

1. [의존성 규칙](./DEPENDENCY_RULES.md) 확인
2. [도입 가이드](./GETTING_STARTED.md) 참고
3. 이슈 리포트 작성

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

