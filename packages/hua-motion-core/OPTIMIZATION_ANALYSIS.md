# Motion Core 패키지 최적화 분석

**작성일**: 2025-12-06  
**목적**: 성능 최적화 기회 파악 및 개선 방안 제시

---

## 📋 목차

1. [현재 최적화 상태](#현재-최적화-상태)
2. [발견된 최적화 기회](#발견된-최적화-기회)
3. [우선순위별 개선 사항](#우선순위별-개선-사항)
4. [구체적 개선 방안](#구체적-개선-방안)

---

## 현재 최적화 상태

### ✅ 잘 최적화된 부분

1. **useCallback 활용**
   - 대부분의 함수가 `useCallback`으로 메모이제이션됨
   - `start`, `stop`, `reset` 함수들

2. **Intersection Observer 사용**
   - 스크롤 리빌에 Intersection Observer 활용
   - 불필요한 스크롤 이벤트 리스너 없음

3. **Cleanup 처리**
   - useEffect cleanup 함수로 메모리 누수 방지
   - Observer, timeout, animationFrame 정리

4. **requestAnimationFrame 사용**
   - MotionEngine에서 requestAnimationFrame 활용

---

## 발견된 최적화 기회

### 🔴 높은 우선순위

#### 1. Style 객체 메모이제이션 부재

**문제점**:
- `useFadeIn`, `useSlideUp` 등에서 style 객체가 매 렌더링마다 새로 생성됨
- React가 매번 새로운 객체로 인식하여 불필요한 리렌더링 발생 가능

**영향도**: 높음
- 매 렌더링마다 새로운 객체 생성
- 자식 컴포넌트에 전달 시 불필요한 리렌더링

**개선 방안**:
```typescript
// 현재
const style = {
  opacity: isVisible ? targetOpacity : initialOpacity,
  transition: `opacity ${duration}ms ${easing}`,
  // ...
} as const

// 개선
const style = useMemo(() => ({
  opacity: isVisible ? targetOpacity : initialOpacity,
  transition: `opacity ${duration}ms ${easing}`,
  // ...
}), [isVisible, targetOpacity, initialOpacity, duration, easing])
```

**적용 대상**:
- `useFadeIn.ts`
- `useSlideUp.ts`
- `useSlideLeft.ts`
- `useSlideRight.ts`
- `useScaleIn.ts`
- `useBounceIn.ts`
- `usePulse.ts`
- `useSmartMotion.ts`

---

#### 2. useSmartMotion의 무한 루프 위험

**문제점**:
```typescript
// useSmartMotion.ts:279-282
useEffect(() => {
  const { opacity, translateY, translateX, scale } = calculateMotionValues(state)
  setState(prev => ({ ...prev, opacity, translateY, translateX, scale }))
}, [state.isVisible, state.isHovered, state.isClicked])
```

- `calculateMotionValues`가 state를 받아서 계산하지만, 결과를 다시 state에 설정
- 의존성 배열에 `calculateMotionValues`가 없어서 stale closure 가능성
- state 업데이트가 다시 useEffect를 트리거할 수 있음

**영향도**: 높음
- 무한 루프 가능성
- 불필요한 리렌더링

**개선 방안**:
```typescript
// 개선: 함수형 업데이트 사용
useEffect(() => {
  setState(prev => {
    const { opacity, translateY, translateX, scale } = calculateMotionValues(prev)
    // 값이 실제로 변경되었을 때만 업데이트
    if (
      prev.opacity === opacity &&
      prev.translateY === translateY &&
      prev.translateX === translateX &&
      prev.scale === scale
    ) {
      return prev // 변경 없으면 이전 상태 반환
    }
    return { ...prev, opacity, translateY, translateX, scale }
  })
}, [state.isVisible, state.isHovered, state.isClicked, calculateMotionValues])
```

---

#### 3. usePageMotions의 이벤트 리스너 최적화

**문제점**:
```typescript
// usePageMotions.ts:351-356
const timer = setTimeout(() => {
  document.addEventListener('mouseenter', handleMouseEnter, true)
  document.addEventListener('mouseleave', handleMouseLeave, true)
  document.addEventListener('mousedown', handleMouseDown, true)
  document.addEventListener('mouseup', handleMouseUp, true)
}, 200)
```

- 모든 이벤트를 document에 등록
- 이벤트 버블링으로 인한 성능 이슈 가능
- capture phase 사용으로 더 많은 이벤트 처리

**영향도**: 중간
- 많은 요소가 있을 때 성능 저하
- 이벤트 위임은 좋지만 capture phase는 비용이 큼

**개선 방안**:
- 이벤트 위임을 capture phase가 아닌 bubble phase로 변경
- 또는 각 요소에 직접 리스너 등록 (요소가 적을 때)

---

#### 4. console.log 제거

**문제점**:
- 프로덕션 코드에 `console.log` 남아있음
- 성능 저하 (특히 많은 로그)

**영향도**: 낮음-중간
- 프로덕션에서 불필요한 로그
- 성능 약간 저하

**개선 방안**:
```typescript
// 조건부 로그
const isDev = process.env.NODE_ENV === 'development'
if (isDev) {
  console.log('모션 실행:', elementId)
}
```

**적용 대상**:
- `usePageMotions.ts` (여러 곳)

---

### 🟡 중간 우선순위

#### 5. getInitialTransform 최적화

**문제점**:
```typescript
// useSlideUp.ts:30-43
const getInitialTransform = useCallback(() => {
  switch (direction) {
    // ...
  }
}, [direction, distance])

// 사용: style 객체 내부에서 매번 호출
const style = {
  transform: isVisible ? 'translateY(0)' : getInitialTransform(),
  // ...
}
```

- `useCallback`으로 메모이제이션했지만 매 렌더링마다 호출
- 결과값을 메모이제이션하지 않음

**개선 방안**:
```typescript
const initialTransform = useMemo(
  () => getInitialTransform(),
  [direction, distance]
)

const style = useMemo(() => ({
  transform: isVisible ? 'translateY(0)' : initialTransform,
  // ...
}), [isVisible, initialTransform, duration, easing])
```

---

#### 6. usePageMotions의 Map 업데이트 최적화

**문제점**:
```typescript
// usePageMotions.ts:150-169
setMotions(prev => {
  const current = prev.get(elementId)
  if (!current) return prev

  const newMotion: MotionRef = {
    ...current,
    style: {
      ...current.style,
      opacity,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`
    },
    // ...
  }

  const newMap = new Map(prev)
  newMap.set(elementId, newMotion)
  return newMap
})
```

- Map을 새로 생성하지만 모든 항목을 복사
- 변경된 항목만 업데이트하지만 전체 Map 복사

**개선 방안**:
- 변경 감지 후 실제 변경이 있을 때만 업데이트
- 또는 Immer 같은 라이브러리 사용 (하지만 Zero Dependencies 원칙에 위배)

---

### 🟢 낮은 우선순위

#### 7. 타임아웃 최적화

**문제점**:
- 여러 곳에서 `setTimeout` 사용
- cleanup이 있지만 최적화 여지 있음

**개선 방안**:
- AbortController 사용 (더 명확한 취소)
- 또는 현재 방식 유지 (충분히 안전함)

---

## 우선순위별 개선 사항

### Phase 1: 즉시 개선 (높은 우선순위)

1. **Style 객체 메모이제이션**
   - 모든 기본 모션 훅에 `useMemo` 적용
   - 예상 효과: 불필요한 리렌더링 30-50% 감소

2. **useSmartMotion 무한 루프 방지**
   - 함수형 업데이트 및 변경 감지 추가
   - 예상 효과: 무한 루프 방지, 안정성 향상

3. **console.log 제거/조건부 실행**
   - 프로덕션 빌드에서 제거
   - 예상 효과: 프로덕션 성능 약간 향상

### Phase 2: 단기 개선 (중간 우선순위)

4. **이벤트 리스너 최적화**
   - capture phase → bubble phase
   - 또는 요소별 직접 등록

5. **getInitialTransform 결과 메모이제이션**
   - `useMemo`로 결과값 캐싱

### Phase 3: 장기 개선 (낮은 우선순위)

6. **Map 업데이트 최적화**
   - 변경 감지 강화
   - 불필요한 복사 최소화

---

## 구체적 개선 방안

### 1. useFadeIn 최적화 예시

**현재 코드**:
```typescript
const style = {
  opacity: isVisible ? targetOpacity : initialOpacity,
  transition: `opacity ${duration}ms ${easing}`,
  '--motion-delay': `${delay}ms`,
  '--motion-duration': `${duration}ms`,
  '--motion-easing': easing,
  '--motion-progress': `${progress}`
} as const
```

**개선 코드**:
```typescript
const style = useMemo(() => ({
  opacity: isVisible ? targetOpacity : initialOpacity,
  transition: `opacity ${duration}ms ${easing}`,
  '--motion-delay': `${delay}ms`,
  '--motion-duration': `${duration}ms`,
  '--motion-easing': easing,
  '--motion-progress': `${progress}`
} as const), [isVisible, targetOpacity, initialOpacity, duration, easing, delay, progress])
```

### 2. useSmartMotion 최적화 예시

**현재 코드**:
```typescript
useEffect(() => {
  const { opacity, translateY, translateX, scale } = calculateMotionValues(state)
  setState(prev => ({ ...prev, opacity, translateY, translateX, scale }))
}, [state.isVisible, state.isHovered, state.isClicked])
```

**개선 코드**:
```typescript
useEffect(() => {
  setState(prev => {
    const { opacity, translateY, translateX, scale } = calculateMotionValues(prev)
    // 값이 실제로 변경되었을 때만 업데이트
    if (
      prev.opacity === opacity &&
      prev.translateY === translateY &&
      prev.translateX === translateX &&
      prev.scale === scale
    ) {
      return prev
    }
    return { ...prev, opacity, translateY, translateX, scale }
  })
}, [state.isVisible, state.isHovered, state.isClicked, calculateMotionValues])
```

### 3. usePageMotions 이벤트 리스너 최적화

**현재 코드**:
```typescript
document.addEventListener('mouseenter', handleMouseEnter, true)
document.addEventListener('mouseleave', handleMouseLeave, true)
```

**개선 코드**:
```typescript
// Option 1: Bubble phase 사용
document.addEventListener('mouseenter', handleMouseEnter, false)
document.addEventListener('mouseleave', handleMouseLeave, false)

// Option 2: 각 요소에 직접 등록 (요소가 적을 때)
useEffect(() => {
  const elements = Object.keys(config).map(id => 
    document.querySelector(`[data-motion-id="${id}"]`)
  ).filter(Boolean) as HTMLElement[]

  elements.forEach((element, index) => {
    const elementId = Object.keys(config)[index]
    if (config[elementId]?.hover) {
      element.addEventListener('mouseenter', () => {
        updateMotionState(elementId, { isHovered: true })
      })
      element.addEventListener('mouseleave', () => {
        updateMotionState(elementId, { isHovered: false })
      })
    }
  })

  return () => {
    // cleanup
  }
}, [config])
```

---

## 예상 효과

### 성능 개선
- **리렌더링 감소**: 30-50% 감소 예상
- **메모리 사용**: 약간 감소
- **CPU 사용**: 약간 감소

### 안정성 개선
- **무한 루프 방지**: useSmartMotion 안정성 향상
- **메모리 누수 방지**: 더 명확한 cleanup

### 코드 품질
- **프로덕션 코드 정리**: console.log 제거
- **가독성 향상**: 명확한 최적화 패턴

---

## 다음 단계

1. **Phase 1 실행** (즉시)
   - Style 객체 메모이제이션
   - useSmartMotion 무한 루프 방지
   - console.log 제거

2. **Phase 2 실행** (단기)
   - 이벤트 리스너 최적화
   - getInitialTransform 최적화

3. **테스트 및 검증**
   - 성능 테스트
   - 기능 테스트
   - 번들 크기 확인

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

