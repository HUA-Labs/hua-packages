# Motion 패키지 통합 가이드

**작성일**: 2025-12-06  
**버전**: 1.0.0

---

## 📋 목차

1. [개요](#개요)
2. [현재 상황](#현재-상황)
3. [마이그레이션 전략](#마이그레이션-전략)
4. [사용 가이드](#사용-가이드)
5. [최적화 전략](#최적화-전략)

---

## 개요

HUA UI 패키지는 Motion 패키지와의 통합을 통해 고급 애니메이션 기능을 제공합니다. 이 문서는 Motion 패키지 재편에 따른 UI 패키지 통합 전략을 설명합니다.

### 패키지 구조

```
@hua-labs/motion-core      # 필수 기능 (Zero Dependencies)
@hua-labs/motion-advanced  # 고급 기능 (Core 의존)
@hua-labs/motion          # 통합 패키지 (선택적, 하위 호환성)
```

---

## 현재 상황

### 1. 의존성 현황

#### 현재 설정 (`package.json`)
```json
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"
  }
}
```

#### 빌드 설정 (`tsup.config.ts`)
```typescript
external: [
  'react',
  'react-dom',
  'clsx',
  'tailwind-merge',
  '@hua-labs/motion',  // external로 설정되어 번들에 포함되지 않음
  'lucide-react',
  '@phosphor-icons/react'
]
```

### 2. 실제 사용 현황

#### 2.1 컴포넌트별 사용
- **Core 컴포넌트**: Motion 패키지 사용 안 함
- **Form 컴포넌트**: Motion 패키지 사용 안 함
- **Navigation 컴포넌트**: Motion 패키지 사용 안 함
- **Feedback 컴포넌트**: Motion 패키지 사용 안 함
- **Advanced 컴포넌트**: 
  - `AdvancedPageTransition`: Motion 훅을 사용하지 않고 자체 구현
  - 현재는 Motion 패키지에 의존하지만 실제로는 사용하지 않음

#### 2.2 코드 분석
```tsx
// packages/hua-ui/src/components/advanced/AdvancedPageTransition.tsx
// Motion 훅을 import하지 않고 requestAnimationFrame으로 자체 구현
```

### 3. 문제점

1. **불필요한 의존성**: Motion 패키지를 의존하지만 실제로는 사용하지 않음
2. **번들 크기**: 통합 패키지에 의존하여 불필요한 코드 포함 가능성
3. **유지보수**: 통합 패키지가 재편되면서 호환성 문제 가능성

---

## 마이그레이션 전략

### 1. 단계별 마이그레이션

#### Phase 1: 의존성 변경 (즉시 실행 가능)

**변경 전**:
```json
{
  "dependencies": {
    "@hua-labs/motion": "workspace:*"
  }
}
```

**변경 후**:
```json
{
  "dependencies": {
    "@hua-labs/motion-core": "workspace:*"
  },
  "peerDependencies": {
    "@hua-labs/motion-advanced": "*"
  }
}
```

**이유**:
- Core 패키지만 필수 의존성으로 설정
- Advanced 패키지는 선택적 의존성 (peerDependency)
- 실제로 사용하지 않으므로 최소한의 의존성만 유지

#### Phase 2: 빌드 설정 업데이트

**변경 전**:
```typescript
external: ['@hua-labs/motion']
```

**변경 후**:
```typescript
external: [
  '@hua-labs/motion-core',
  '@hua-labs/motion-advanced'
]
```

#### Phase 3: Advanced 컴포넌트 개선 (선택적)

**옵션 A: Motion Core 활용**
```tsx
import { useFadeIn, useSlideUp } from '@hua-labs/motion-core'

export const AdvancedPageTransition = ({ type, ...props }) => {
  const fadeIn = useFadeIn({ duration: props.duration })
  const slideUp = useSlideUp({ duration: props.duration })
  
  // type에 따라 적절한 훅 사용
  const motion = type === 'fade' ? fadeIn : slideUp
  
  return (
    <div ref={motion.ref} style={motion.style}>
      {props.children}
    </div>
  )
}
```

**옵션 B: 현재 구현 유지**
- 장점: 추가 의존성 없음, 성능 최적화된 자체 구현
- 단점: Motion 패키지와의 일관성 부족

**권장**: 옵션 B (현재 구현 유지)
- 이미 최적화된 구현
- Motion 패키지와의 의존성 완전 제거 가능
- 번들 크기 최소화

### 2. 완전한 의존성 제거 (최종 목표)

#### 최종 설정
```json
{
  "peerDependencies": {
    "@hua-labs/motion-core": "*",
    "@hua-labs/motion-advanced": "*"
  }
}
```

**장점**:
- UI 패키지가 Motion 패키지에 의존하지 않음
- 사용자가 필요한 Motion 패키지만 선택적으로 설치
- 번들 크기 최소화

**단점**:
- 사용자가 Motion 패키지를 별도로 설치해야 함
- 문서화와 가이드 필요

---

## 사용 가이드

### 1. 기본 사용 (Motion Core만 필요)

```bash
pnpm add @hua-labs/ui @hua-labs/motion-core
```

```tsx
import { Button } from '@hua-labs/ui'
import { useFadeIn } from '@hua-labs/motion-core'

function MyComponent() {
  const fadeIn = useFadeIn()
  
  return (
    <div ref={fadeIn.ref} style={fadeIn.style}>
      <Button>Click me</Button>
    </div>
  )
}
```

### 2. 고급 사용 (Motion Advanced 필요)

```bash
pnpm add @hua-labs/ui @hua-labs/motion-core @hua-labs/motion-advanced
```

```tsx
import { AdvancedPageTransition } from '@hua-labs/ui/advanced'
import { useMotionOrchestra } from '@hua-labs/motion-advanced'

function MyPage() {
  const orchestra = useMotionOrchestra({
    sequences: [
      { id: 'hero', delay: 0, duration: 1000 },
      { id: 'title', delay: 200, duration: 800 }
    ]
  })
  
  return (
    <AdvancedPageTransition type="fade">
      <h1>My Page</h1>
    </AdvancedPageTransition>
  )
}
```

### 3. Motion 패키지 없이 사용

```bash
pnpm add @hua-labs/ui
```

```tsx
import { Button, Card, Input } from '@hua-labs/ui'

function MyComponent() {
  // Core 컴포넌트는 Motion 패키지 없이도 사용 가능
  return (
    <div>
      <Button>Click me</Button>
      <Card>Content</Card>
      <Input placeholder="Type here" />
    </div>
  )
}
```

---

## 최적화 전략

### 1. 번들 크기 최적화

#### 현재 상황
- Motion 패키지가 external로 설정되어 번들에 포함되지 않음
- 하지만 의존성으로 인해 타입 체크 시 포함됨

#### 최적화 방안
1. **peerDependency로 전환**: 완전한 선택적 의존성
2. **타입 정의 분리**: Motion 타입을 별도 패키지로 분리 (선택적)
3. **동적 import**: Advanced 컴포넌트에서만 필요 시 import

### 2. 성능 최적화

#### 현재 구현 (AdvancedPageTransition)
- `requestAnimationFrame` 기반 자체 구현
- 최적화된 애니메이션 루프
- 불필요한 리렌더링 방지

#### 개선 방안
- Motion Core 훅 활용 시에도 동일한 성능 유지
- 필요 시 `useMemo`, `useCallback` 활용

### 3. 개발자 경험 최적화

#### 명확한 가이드
- 패키지별 사용 가이드 제공
- 예제 코드 제공
- 마이그레이션 가이드 제공

#### 타입 안정성
- Motion 패키지와의 타입 일관성 유지
- 선택적 의존성에서도 타입 체크 가능

---

## 마이그레이션 체크리스트

### 즉시 실행 가능
- [ ] `package.json` 의존성 변경
- [ ] `tsup.config.ts` 빌드 설정 업데이트
- [ ] 테스트 실행 및 확인

### 단기 작업 (1주)
- [ ] 문서 업데이트
- [ ] 예제 코드 작성
- [ ] 번들 크기 측정 및 비교

### 중기 작업 (2-4주)
- [ ] Advanced 컴포넌트 개선 검토
- [ ] Motion Core 훅 활용 검토
- [ ] 완전한 의존성 제거 검토

### 장기 작업 (1-2개월)
- [ ] peerDependency로 완전 전환
- [ ] 사용자 가이드 작성
- [ ] 커뮤니티 피드백 수집

---

## 결론

### 핵심 전략
1. **최소 의존성**: Core 패키지만 필수, Advanced는 선택적
2. **점진적 마이그레이션**: 단계별로 안전하게 전환
3. **유연성**: Motion 패키지 없이도 Core 컴포넌트 사용 가능
4. **최적화**: 번들 크기와 성능 최적화

### 다음 단계
1. Phase 1 실행 (의존성 변경)
2. 테스트 및 검증
3. 문서 업데이트
4. 단계별 마이그레이션 진행

---

**작성자**: Auto (AI Assistant)  
**최종 업데이트**: 2025-12-06

