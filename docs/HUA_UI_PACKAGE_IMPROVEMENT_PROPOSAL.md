# HUA UI 패키지 컴포넌트 개선 제안서

> **작성일**: 2025-12-05  
> **목적**: 패키지 컴포넌트의 품질 향상 및 일관성 개선  
> **검토 범위**: `packages/hua-ui/src/components` 전체

---

## 📦 Core/Advanced 분리 전략

> **상세 내용**: [Core/Advanced 분리 전략 문서](./HUA_UI_CORE_ADVANCED_SEPARATION_STRATEGY.md) 참조

**현재 문제**:
- 모든 컴포넌트가 `index.ts`에서 export되어 번들 크기 큼 (~350KB)
- Dashboard 컴포넌트가 Core에 포함되어 트리 쉐이킹 제한
- Advanced 엔트리 포인트는 있지만 실제 분리 안 됨

**개선 제안**:
- Core: 기본 UI 컴포넌트만 (~150KB, 49개)
- Advanced: Dashboard + Motion + 특수 컴포넌트 (~200KB, 39개)
- 번들 크기 57% 감소 예상

**우선순위**: 🔴 높음 (즉시 진행 권장)

---

## 📊 현재 상태 분석

### 긍정적인 부분 ✅

1. **forwardRef 패턴**: 대부분의 컴포넌트(75개 파일)에서 `forwardRef` 사용
2. **displayName 설정**: 대부분의 컴포넌트에 `displayName` 설정 (184개 매치)
3. **TypeScript 지원**: 모든 컴포넌트에 타입 정의 존재
4. **유틸리티 함수**: `merge`, `cn` 등 클래스 병합 유틸리티 제공
5. **컴포넌트 구조**: 잘 정리된 컴포넌트 구조 (Core, Layout, Dashboard, Form 등)

### 개선이 필요한 부분 ⚠️

1. **접근성 (A11y)**: 일부 컴포넌트만 ARIA 속성 사용 (15개 파일)
2. **타입 안정성**: 일부 컴포넌트에서 `any`/`unknown` 사용 (11개 파일)
3. **테스트 커버리지**: 테스트 파일이 매우 적음 (7개 파일만 존재)
4. **일관성**: `merge`와 `cn` 혼용

5. **forwardRef 누락**: 일부 컴포넌트(Modal 등)에서 forwardRef 미사용
6. **TODO 주석**: 미완성 기능 표시 (Action.tsx)

---

## 🎯 개선 제안 (우선순위별)

### 🔴 높은 우선순위 (즉시 개선 권장)

#### 1. 접근성 (A11y) 개선

**현재 상태**:
- ARIA 속성 사용: 15개 파일만
- 키보드 네비게이션: 일부 컴포넌트만 지원
- 포커스 관리: 일관성 부족

**개선 제안**:

```tsx
// 예시: Button 컴포넌트 개선
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, disabled, loading, "aria-label": ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-label={ariaLabel || (loading ? "로딩 중" : undefined)}
        aria-busy={loading}
        {...props}
      >
        {loading && <span className="sr-only">로딩 중</span>}
        {children}
      </button>
    );
  }
);
```

**대상 컴포넌트**:
- `Button` - aria-label, aria-busy 추가
- `Modal` - aria-modal, aria-labelledby, aria-describedby 추가
- `Select` - aria-label, aria-invalid 추가
- `Input` - aria-invalid, aria-describedby 추가
- `Checkbox`, `Radio` - aria-checked, aria-label 추가
- `Tabs` - aria-selected, role="tablist" 추가
- `Accordion` - aria-expanded, aria-controls 추가
- `Dropdown`, `Menu` - 키보드 네비게이션 개선

**예상 작업 시간**: 2-3일

---

#### 2. Modal 컴포넌트 forwardRef 추가

**현재 상태**:
```tsx
// Modal.tsx - forwardRef 미사용
export function Modal({ ... }: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null)
  // ...
}
```

**개선 제안**:
```tsx
export interface ModalProps {
  // ... 기존 props
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, children, ...props }, ref) => {
    const modalRef = React.useRef<HTMLDivElement>(null)
    const combinedRef = useCombinedRefs(ref, modalRef)
    
    // ... 기존 로직
    
    return (
      <div ref={combinedRef} {...props}>
        {/* ... */}
      </div>
    )
  }
)

Modal.displayName = "Modal"
```

**예상 작업 시간**: 1시간

---

#### 3. 타입 안정성 개선

**현재 상태**:
- `any` 타입 사용: 11개 파일에서 발견
- `unknown` 타입 사용: 일부 컴포넌트

**개선 제안**:

**Icon.tsx**:
```tsx
// 현재: any 사용
// 개선: 명시적 타입 정의
type IconComponent = React.ComponentType<IconProps>
```

**Command.tsx, Accordion.tsx, Tabs.tsx**:
```tsx
// 현재: any 사용
// 개선: 제네릭 타입 활용
interface CommandItemProps<T = string> {
  value: T
  onSelect?: (value: T) => void
}
```

**대상 파일**:
- `Icon/Icon.tsx`
- `Command.tsx`
- `Accordion.tsx`
- `Tabs.tsx`
- `Menu.tsx`
- `Navigation.tsx`
- `EmotionSelector.tsx`
- `ActivityFeed.tsx`
- `TransactionsTable.tsx`
- `ScrollIndicator.tsx`
- `advanced/usePageTransitionManager.ts`

**예상 작업 시간**: 1-2일

---

### 🟡 중간 우선순위 (단기 개선 권장)

#### 4. 유틸리티 함수 일관성 개선

**현재 상태**:
- `merge` 함수: 새로 추가된 유틸리티
- `cn` 함수: 기존 유틸리티 (merge의 alias)
- 혼용 사용: 일부 컴포넌트는 `merge`, 일부는 `cn` 사용

**개선 제안**:

**옵션 1: `merge`로 통일 (권장)**
```tsx
// 모든 컴포넌트에서 merge 사용
import { merge } from '../lib/utils'

className={merge("base-class", variantClass, className)}
```

**옵션 2: `cn`으로 통일**
```tsx
// 모든 컴포넌트에서 cn 사용
import { cn } from '../lib/utils'

className={cn("base-class", variantClass, className)}
```

**대상 파일**: 모든 컴포넌트 파일 (약 80개)

**예상 작업 시간**: 2-3시간 (자동화 가능)

---

#### 5. 테스트 커버리지 확대

**현재 상태**:
- 테스트 파일: 7개만 존재
  - `Action.test.tsx`
  - `Badge.test.tsx`
  - `Button.test.tsx`
  - `Card.test.tsx`
  - `Input.test.tsx`
  - `Panel.test.tsx`
  - `Toast.test.tsx`

**개선 제안**:

**우선순위 1: 핵심 컴포넌트**
- `Modal.test.tsx` - 열기/닫기, ESC 키, 오버레이 클릭
- `Select.test.tsx` - 선택, 키보드 네비게이션
- `Checkbox.test.tsx` - 체크/언체크, disabled 상태
- `Radio.test.tsx` - 그룹 선택
- `Switch.test.tsx` - 토글 동작

**우선순위 2: 폼 컴포넌트**
- `Textarea.test.tsx`
- `Form.test.tsx`
- `Label.test.tsx`

**우선순위 3: 레이아웃 컴포넌트**
- `Grid.test.tsx`
- `Container.test.tsx`
- `Stack.test.tsx`

**우선순위 4: 피드백 컴포넌트**
- `Alert.test.tsx`
- `LoadingSpinner.test.tsx`
- `Progress.test.tsx`

**테스트 작성 가이드**:
```tsx
// 예시: Modal.test.tsx
describe('Modal', () => {
  it('should open when isOpen is true', () => {
    render(<Modal isOpen={true} onClose={jest.fn()}>Content</Modal>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('should close on ESC key', () => {
    const onClose = jest.fn()
    render(<Modal isOpen={true} onClose={onClose}>Content</Modal>)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('should have proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal">
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
```

**예상 작업 시간**: 1-2주 (점진적 추가)

---

#### 6. TODO 주석 해결

**현재 상태**:
- `Action.tsx`에 TODO 주석 3개 발견:
  ```tsx
  // TODO: lazy load & play
  // TODO: data-ripple 토글
  // TODO: spawn particles
  ```

**개선 제안**:

**옵션 1: 기능 구현**
- Ripple 효과 구현
- Particle 효과 구현 (선택사항)
- Lazy loading 구현

**옵션 2: TODO 제거**
- 기능이 필요하지 않다면 TODO 제거
- 또는 GitHub Issue로 전환

**예상 작업 시간**: 1일 (구현 시) 또는 30분 (제거 시)

---

### 🟢 낮은 우선순위 (장기 개선)

#### 7. 컴포넌트 문서화 개선

**현재 상태**:
- README.md에 기본 사용법만 존재
- 개별 컴포넌트 JSDoc 부족
- 예제 코드 부족

**개선 제안**:

**JSDoc 추가**:
```tsx
/**
 * Modal 컴포넌트
 * 
 * @description
 * 오버레이와 함께 표시되는 모달 다이얼로그 컴포넌트입니다.
 * ESC 키와 오버레이 클릭으로 닫을 수 있습니다.
 * 
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="확인"
 *   size="md"
 * >
 *   <p>정말 삭제하시겠습니까?</p>
 * </Modal>
 * ```
 * 
 * @see {@link ConfirmModal} 확인 모달이 필요한 경우
 */
export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(...)
```

**Storybook 추가 (선택사항)**:
- 각 컴포넌트의 Storybook 스토리 작성
- 인터랙티브 예제 제공

**예상 작업 시간**: 1주 (JSDoc), 2-3주 (Storybook)

---

#### 8. 성능 최적화

**개선 제안**:

**React.memo 적용**:
```tsx
// 정적 컴포넌트에 memo 적용
export const Badge = React.memo(React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ ... }, ref) => {
    // ...
  }
))
```

**useMemo/useCallback 최적화**:
- 복잡한 계산이 있는 컴포넌트에 useMemo 적용
- 콜백 함수에 useCallback 적용

**대상 컴포넌트**:
- `Badge`, `Icon`, `Divider` 등 정적 컴포넌트
- `Table`, `Grid` 등 대용량 데이터 처리 컴포넌트

**예상 작업 시간**: 2-3일

---

#### 9. 에러 경계 및 경고 개선

**개선 제안**:

**개발 모드 경고**:
```tsx
if (process.env.NODE_ENV === 'development') {
  if (!onClose) {
    console.warn('Modal: onClose prop is required when isOpen is true')
  }
}
```

**타입 체크 강화**:
```tsx
// 런타임 타입 검증 (선택사항)
if (process.env.NODE_ENV === 'development') {
  if (typeof size !== 'string' || !['sm', 'md', 'lg'].includes(size)) {
    console.error(`Button: Invalid size prop "${size}"`)
  }
}
```

**예상 작업 시간**: 1일

---

## 📋 개선 작업 체크리스트

### Phase 1: 긴급 개선 (1주)
- [ ] Modal forwardRef 추가
- [ ] 핵심 컴포넌트 접근성 개선 (Button, Modal, Select, Input)
- [ ] Icon, Command 타입 안정성 개선

### Phase 2: 단기 개선 (2-3주)
- [ ] 유틸리티 함수 일관성 개선 (merge/cn 통일)
- [ ] 나머지 컴포넌트 접근성 개선
- [ ] 핵심 컴포넌트 테스트 추가 (Modal, Select, Checkbox, Radio, Switch)
- [ ] Action.tsx TODO 해결

### Phase 3: 중기 개선 (1-2개월)
- [ ] 모든 컴포넌트 타입 안정성 개선
- [ ] 테스트 커버리지 70% 이상 달성
- [ ] JSDoc 문서화 완료

### Phase 4: 장기 개선 (3개월+)
- [ ] Storybook 구축
- [ ] 성능 최적화 (memo, useMemo, useCallback)
- [ ] 에러 경계 및 개발 모드 경고 추가

---

## 🛠️ 구현 가이드

### 접근성 개선 가이드

```tsx
// 1. 기본 ARIA 속성 추가
<button
  aria-label={ariaLabel || children}
  aria-disabled={disabled}
  aria-busy={loading}
>

// 2. 키보드 네비게이션
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onClick?.()
  }
}

// 3. 포커스 관리
useEffect(() => {
  if (isOpen && modalRef.current) {
    modalRef.current.focus()
  }
}, [isOpen])
```

### 타입 안정성 개선 가이드

```tsx
// Before: any 사용
const handleClick = (item: any) => { ... }

// After: 명시적 타입
interface Item {
  id: string
  label: string
}
const handleClick = (item: Item) => { ... }

// 또는 제네릭 사용
interface SelectProps<T> {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
}
```

### 테스트 작성 가이드

```tsx
// 1. 기본 렌더링 테스트
it('should render correctly', () => {
  render(<Component />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})

// 2. 상호작용 테스트
it('should call onClick when clicked', () => {
  const onClick = jest.fn()
  render(<Component onClick={onClick} />)
  fireEvent.click(screen.getByRole('button'))
  expect(onClick).toHaveBeenCalled()
})

// 3. 접근성 테스트
it('should have proper ARIA attributes', () => {
  render(<Component aria-label="Test" />)
  expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Test')
})
```

---

## 📊 예상 효과

### 접근성 개선
- **WCAG 2.1 AA 준수율**: 현재 ~60% → 목표 95%+
- **스크린 리더 호환성**: 개선
- **키보드 네비게이션**: 모든 인터랙티브 컴포넌트 지원

### 타입 안정성 개선
- **any 타입 사용**: 11개 파일 → 0개
- **타입 에러 감소**: 개발 시점 타입 체크 강화

### 테스트 커버리지
- **현재**: ~10% (7개 파일)
- **목표**: 70%+ (50+ 파일)

### 개발자 경험
- **일관성**: 유틸리티 함수 통일로 코드 일관성 향상
- **문서화**: JSDoc으로 IDE 자동완성 개선
- **디버깅**: 개발 모드 경고로 문제 조기 발견

---

## 🎯 우선순위 요약

| 우선순위 | 작업 | 예상 시간 | 효과 |
|---------|------|----------|------|
| 🔴 높음 | 접근성 개선 | 2-3일 | 사용자 경험 대폭 개선 |
| 🔴 높음 | Modal forwardRef | 1시간 | API 일관성 |
| 🔴 높음 | 타입 안정성 | 1-2일 | 버그 예방 |
| 🟡 중간 | 유틸리티 통일 | 2-3시간 | 코드 일관성 |
| 🟡 중간 | 테스트 추가 | 1-2주 | 품질 보증 |
| 🟡 중간 | TODO 해결 | 1일 | 코드 정리 |
| 🟢 낮음 | 문서화 | 1주 | 개발자 경험 |
| 🟢 낮음 | 성능 최적화 | 2-3일 | 런타임 성능 |
| 🟢 낮음 | 에러 경계 | 1일 | 디버깅 개선 |

---

## 📝 참고 사항

- 모든 개선 작업은 **하위 호환성**을 유지해야 합니다
- 변경 사항은 **단계적으로** 적용하여 리스크 최소화
- 각 개선 작업 후 **테스트** 필수
- **문서 업데이트** 병행 필요

---

## 🔗 관련 문서

- [WCAG 2.1 가이드라인](https://www.w3.org/WAI/WCAG21/quickref/)
- [React 접근성 가이드](https://react.dev/learn/accessibility)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Testing Library 가이드](https://testing-library.com/docs/react-testing-library/intro/)

