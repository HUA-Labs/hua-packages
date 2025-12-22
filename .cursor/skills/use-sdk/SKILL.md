---
name: Use HUA UI SDK
description: HUA UI SDK 컴포넌트를 올바르게 사용하는 방법을 안내합니다
license: MIT
compatibility:
  - cursor
---

# HUA UI SDK 사용 스킬

이 스킬은 `@hua-labs/ui` 패키지의 컴포넌트를 올바르게 사용하는 방법을 안내합니다.

## SDK-First 원칙

**항상 SDK 컴포넌트를 먼저 확인하고 사용하세요.**

1. 필요한 컴포넌트가 SDK에 있는지 확인
2. SDK에 있으면 SDK 사용
3. SDK에 없으면 로컬에 생성 (나중에 SDK에 제안 고려)

## 사용 가능한 컴포넌트

### Core Components
- `Button`, `Action` - 버튼 컴포넌트
- `Input`, `Textarea` - 입력 컴포넌트
- `Link` - 링크 컴포넌트
- `Icon`, `EmotionIcon`, `StatusIcon` - 아이콘 컴포넌트
- `Avatar`, `AvatarImage`, `AvatarFallback` - 아바타 컴포넌트
- `Modal`, `ConfirmModal` - 모달 컴포넌트

### Layout Components
- `Container`, `Grid`, `Stack` - 레이아웃 컴포넌트
- `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent` - 카드 컴포넌트
- `Panel`, `ActionToolbar`, `ComponentLayout` - 패널 컴포넌트
- `Divider` - 구분선 컴포넌트

### Navigation Components
- `Navigation`, `NavigationList`, `NavigationItem`, `NavigationContent` - 네비게이션
- `Breadcrumb`, `BreadcrumbItem` - 브레드크럼
- `Pagination`, `PaginationOutlined`, `PaginationMinimal` - 페이지네이션
- `PageNavigation`, `PageTransition` - 페이지 전환

### Data Display Components
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell` - 테이블
- `Badge` - 배지 컴포넌트
- `Progress`, `ProgressSuccess`, `ProgressWarning` - 프로그레스
- `Skeleton`, `SkeletonText`, `SkeletonCard` - 스켈레톤

### Feedback Components
- `Alert`, `AlertSuccess`, `AlertWarning`, `AlertError` - 알림
- `ToastProvider`, `useToast` - 토스트 알림
- `LoadingSpinner` - 로딩 스피너
- `Tooltip`, `TooltipLight`, `TooltipDark` - 툴팁

### Overlay Components
- `Popover`, `PopoverTrigger`, `PopoverContent` - 팝오버
- `Dropdown`, `DropdownItem`, `DropdownMenu` - 드롭다운
- `Drawer`, `DrawerHeader`, `DrawerContent` - 드로어
- `BottomSheet` - 바텀시트

### Form Components
- `Form`, `FormField`, `FormGroup` - 폼 컴포넌트
- `Label`, `Checkbox`, `Radio`, `Select`, `Switch` - 폼 입력
- `Slider`, `DatePicker`, `Upload`, `Autocomplete` - 고급 입력

### Interactive Components
- `Accordion`, `AccordionItem`, `AccordionTrigger` - 아코디언
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - 탭
- `Menu`, `MenuItem`, `MenuSeparator` - 메뉴
- `ContextMenu`, `Command`, `CommandDialog` - 컨텍스트 메뉴

### Specialized Components
- `ScrollArea`, `ScrollToTop` - 스크롤
- `ThemeProvider`, `ThemeToggle`, `useTheme` - 테마

### 사용 전 확인

SDK에 어떤 컴포넌트가 있는지 확인하려면:
- `packages/hua-ui/src/index.ts` 파일 확인 (전체 export 목록)
- `packages/hua-ui/src/components/` 폴더 확인
- TypeScript 자동완성 활용

## Import 방법

```typescript
// 개별 import (권장 - 트리 쉐이킹)
import { Button, Card, Modal } from '@hua-labs/ui'

// 또는
import { Button } from '@hua-labs/ui'
import { Card } from '@hua-labs/ui'
```

## 사용 예시

### Button

```typescript
import { Button } from '@hua-labs/ui'

export function ActionButton() {
  return (
    <Button onClick={() => console.log('clicked')}>
      클릭하세요
    </Button>
  )
}
```

### Card

```typescript
import { Card } from '@hua-labs/ui'

export function InfoCard() {
  return (
    <Card>
      <h2>제목</h2>
      <p>내용</p>
    </Card>
  )
}
```

### Modal

```typescript
import { Modal } from '@hua-labs/ui'

export function ConfirmModal({ isOpen, onClose }: ModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>확인</h2>
      <p>정말로 진행하시겠습니까?</p>
    </Modal>
  )
}
```

## 로컬 재구현 금지

**중요**: SDK에 있는 컴포넌트를 로컬에서 재구현하지 마세요.

### ❌ 잘못된 예시

```typescript
// 로컬에 Button 재구현 (금지!)
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>
}
```

### ✅ 올바른 예시

```typescript
// SDK Button 사용
import { Button } from '@hua-labs/ui'

export function MyComponent() {
  return <Button onClick={handleClick}>클릭</Button>
}
```

## SDK에 없는 컴포넌트

SDK에 필요한 컴포넌트가 없을 때:

1. **로컬에 생성**: `apps/{app-name}/app/ui/` 폴더에 생성
2. **SDK 제안 고려**: 나중에 SDK에 추가 제안
3. **문서화**: 왜 로컬에 생성했는지 주석으로 설명

## 체크리스트

SDK 컴포넌트 사용 시 다음을 확인하세요:

- [ ] SDK에 필요한 컴포넌트가 있는지 확인했는가?
- [ ] SDK 컴포넌트를 사용하고 있는가?
- [ ] 로컬에 재구현하지 않았는가?
- [ ] 올바른 import 경로를 사용했는가? (`@hua-labs/ui`)
- [ ] 트리 쉐이킹을 위해 개별 import를 사용했는가?
