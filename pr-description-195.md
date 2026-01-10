## 변경 사항

- [x] 새로운 기능 추가
- [ ] 버그 수정
- [ ] 코드 리팩토링
- [ ] 문서 수정
- [ ] 성능 개선
- [ ] 기존 API 업데이트
- [ ] 설정 변경
- [ ] 기타 (설명 필요)

## 브랜치 정보

- **Base 브랜치**: `main`
- **Head 브랜치**: `feat/packages/hua-ui/add-slot-component-utility`

## Breaking Changes

- [x] Breaking Changes 없음
- [ ] Breaking Changes 있음 (아래 설명)

## 변경 이유

Radix UI의 `asChild` 패턴을 구현하기 위한 `Slot` 컴포넌트를 추가합니다. 이를 통해 컴포넌트의 유연성과 재사용성을 높이고, Radix UI 의존성 없이 `asChild` 패턴을 사용할 수 있도록 합니다.

## 변경 내용 상세

### 변경된 파일
- `packages/hua-ui/src/lib/Slot.tsx` (신규)
- `packages/hua-ui/src/index.ts` (export 추가)

### 주요 변경사항

1. **Slot 컴포넌트 구현**
   - Radix UI의 `asChild` 패턴을 구현한 유틸리티 컴포넌트
   - 자식 요소의 props와 ref를 병합하여 하나의 요소로 렌더링
   - 이벤트 핸들러, className, style 등을 올바르게 병합

2. **Radix UI 독립성**
   - Radix UI 의존성 없이 자체 구현
   - `React.cloneElement`를 사용한 props 병합
   - `clsx`를 사용한 className 병합

3. **React 19 호환성**
   - React 19.2.1에서 정상 작동 확인
   - `React.cloneElement` 사용 (현재 React 19에서도 지원)

4. **유틸리티 함수 export**
   - `composeRefs`: 여러 ref를 하나로 합성
   - `mergeProps`: props 병합 로직
   - `Slot`: 메인 컴포넌트

## 체크리스트

### 코드 품질
- [x] 코드가 프로젝트 코딩 컨벤션을 따릅니다
- [x] 자기 코드 리뷰를 수행했습니다
- [x] 코드에 주석을 추가했습니다 (특히 복잡한 부분)
- [x] 문서를 업데이트했습니다 (필요한 경우)

### 타입 및 빌드
- [x] TypeScript 타입 체크 통과
- [x] 빌드 성공 확인

### 테스트
- [x] 테스트 코드 작성 (필요한 경우)
- [x] 기존 테스트 통과

## 사용 예시

```tsx
import { Button } from '@hua-labs/ui';
import { Slot } from '@hua-labs/ui';
import Link from 'next/link';

// Button과 Link를 함께 사용
<Button asChild>
  <Slot>
    <Link href="/home">홈으로</Link>
  </Slot>
</Button>
```

## 참고

- [Radix UI Slot 문서](https://www.radix-ui.com/primitives/docs/utilities/slot)
- React 19에서 `React.cloneElement`는 현재 정상 지원되며, 향후 deprecated될 수 있습니다.
