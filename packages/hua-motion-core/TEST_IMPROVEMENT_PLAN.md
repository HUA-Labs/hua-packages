# 테스트 개선 계획

**작성일**: 2025-12-06  
**목적**: 실제 코드에 맞는 제대로 된 테스트 작성

---

## 🔍 발견된 문제점

### 1. 존재하지 않는 메서드 호출
- `pause()`, `resume()` 메서드를 호출하지만 실제 코드에는 없음
- `useFadeIn`, `usePulse`, `useSlideUp` 등에서 발견

### 2. 존재하지 않는 속성 확인
- `willChange` CSS 속성을 확인하지만 실제 코드에는 없음
- `progress` 속성을 확인하지만 일부 훅에는 없음

### 3. 잘못된 옵션 사용
- `finalOpacity` 대신 `targetOpacity` 사용해야 함
- `pulseScale`, `pulseSpeed` 대신 `intensity`, `repeat`, `yoyo` 사용해야 함
- `easing` 옵션을 사용하지만 실제 코드에는 없음

### 4. 잘못된 스타일 검증
- `transition` 스타일 형식이 실제 코드와 다름
- 실제로는 `opacity`와 `transform` 모두 포함

---

## ✅ 완료된 개선

### useFadeIn.test.ts
- ✅ `pause()`, `resume()` 제거
- ✅ `willChange` 제거
- ✅ `finalOpacity` → `targetOpacity` 수정
- ✅ 실제 코드 동작에 맞게 테스트 재작성
- ✅ CSS custom properties 검증 추가
- ✅ IntersectionObserver 동작 검증 개선

### usePulse.test.ts
- ✅ `pause()`, `resume()` 제거
- ✅ `willChange` 제거
- ✅ `pulseScale`, `pulseSpeed` 제거
- ✅ `easing`, `onStart`, `onComplete` 제거
- ✅ `progress` 제거
- ✅ 실제 코드 동작에 맞게 테스트 재작성
- ✅ requestAnimationFrame 기반 애니메이션 검증 추가
- ✅ `intensity`, `repeat`, `yoyo` 옵션 검증 추가

### useSlideUp.test.ts
- ✅ `pause()`, `resume()` 제거
- ✅ `transition` 스타일 검증 수정

---

## 📋 남은 작업

### 우선순위 높음
1. **useSmartMotion.test.ts** 생성
   - 현재 테스트 파일이 없음
   - 실제 코드 동작 검증 필요

2. **useMotionState.test.ts** 개선
   - 실제 코드와 일치하는지 확인
   - `pause()`, `resume()` 메서드가 실제로 있는지 확인

3. **usePageMotions.test.ts** 개선
   - 실제 코드와 일치하는지 확인

### 우선순위 중간
4. **나머지 훅 테스트 확인**
   - `useBounceIn`, `useScaleIn`, `useSlideLeft`, `useSlideRight` 등
   - 각 훅의 실제 인터페이스 확인 후 테스트 수정

5. **테스트 커버리지 확인**
   - 현재 커버리지 확인
   - 누락된 케이스 추가

### 우선순위 낮음
6. **통합 테스트 추가**
   - 여러 훅을 함께 사용하는 시나리오 테스트

7. **성능 테스트 추가**
   - 애니메이션 성능 측정
   - 메모리 누수 검증

---

## 🎯 테스트 작성 원칙

1. **실제 코드 기반**: 코드를 테스트에 맞추지 말고, 실제 코드 동작을 검증
2. **명확한 검증**: 각 테스트는 하나의 동작만 검증
3. **엣지 케이스**: 경계값, 예외 상황 테스트
4. **정리**: beforeEach/afterEach에서 모킹 정리

---

## 📊 예상 효과

- ✅ 테스트 신뢰성 향상
- ✅ 실제 버그 발견 가능
- ✅ 리팩토링 시 안전성 확보
- ✅ 코드 문서화 효과

---

**작성자**: AI Assistant  
**최종 업데이트**: 2025-12-06

