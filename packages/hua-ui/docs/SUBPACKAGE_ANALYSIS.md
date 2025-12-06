# 서브패키지 분리 분석 및 제안

**작성일**: 2025-12-06  
**최종 업데이트**: 2025-12-06 (ChatGPT 리뷰 반영)  
**목적**: UI 패키지의 서브패키지 분리 가능성 분석 및 권장사항 제시

---

## 핵심 원칙

### DX(개발 편의성) 우선
- **Core에서 대부분 해결 가능**해야 함
- 일반적인 앱 개발은 Core만으로 충분해야 함

### 번들 크기 최적화
- 특수 기능은 번들 무게가 크므로 서브패키지로 분리
- Motion + Portal + Scroll Lock 조합은 무거움

### 최종 목표
- **Core 80% / Subpackages 20%** 구도
- Builder 및 Preset System 확장성 고려

---

## 현재 구조

### 기존 엔트리 포인트
1. **Core** (`@hua-labs/ui`) - 기본 컴포넌트 및 유틸리티
2. **Form** (`@hua-labs/ui/form`) - 폼 관련 컴포넌트 (이미 분리됨)
3. **Advanced** (`@hua-labs/ui/advanced`) - 고급 컴포넌트
   - Dashboard (`@hua-labs/ui/advanced/dashboard`)
   - Motion (`@hua-labs/ui/advanced/motion`)

---

## 서브패키지 분리 후보 분석

### 1. Layout 컴포넌트 (`@hua-labs/ui/layout`)

**포함 컴포넌트**:
- Container
- Grid
- Stack
- Divider
- Card (CardHeader, CardFooter, CardTitle, CardDescription, CardContent)
- Panel
- ActionToolbar

**장점**:
- 레이아웃 관련 컴포넌트가 명확하게 그룹화됨
- 레이아웃만 필요한 경우 번들 크기 최적화 가능
- 사용 패턴이 명확함 (레이아웃은 보통 함께 사용)

**단점**:
- Card는 매우 자주 사용되는 컴포넌트 (Core에 남겨두는 것이 나을 수도 있음)
- ActionToolbar는 레이아웃보다는 UI 컴포넌트에 가까움

**권장사항**: 부분 분리 고려
- Container, Grid, Stack, Divider, Panel → `@hua-labs/ui/layout`
- Card는 Core에 유지 (너무 자주 사용됨)
- ActionToolbar는 Core에 유지

---

### 2. Navigation 컴포넌트 (`@hua-labs/ui/navigation`)

**포함 컴포넌트**:
- Navigation (NavigationList, NavigationItem, NavigationContent)
- Breadcrumb (BreadcrumbItem)
- Pagination (PaginationOutlined, PaginationMinimal, PaginationWithInfo)
- PageNavigation
- PageTransition

**장점**:
- ✅ 네비게이션 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 네비게이션만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함

**단점**:
- ⚠️ Breadcrumb과 Pagination은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- Navigation, PageNavigation, PageTransition → `@hua-labs/ui/navigation`
- Breadcrumb, Pagination은 Core에 유지 (너무 자주 사용됨)

---

### 3. Overlay 컴포넌트 (`@hua-labs/ui/overlay`)

**포함 컴포넌트**:
- Modal
- Drawer (DrawerHeader, DrawerContent, DrawerFooter)
- BottomSheet
- Popover (PopoverTrigger, PopoverContent)
- Dropdown (DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup)
- ConfirmModal

**장점**:
- ✅ 오버레이 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 오버레이만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함 (오버레이는 보통 함께 사용)

**단점**:
- ⚠️ Modal, Popover, Dropdown은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- Drawer, BottomSheet, ConfirmModal → `@hua-labs/ui/overlay`
- Modal, Popover, Dropdown은 Core에 유지 (너무 자주 사용됨)

---

### 4. Feedback 컴포넌트 (`@hua-labs/ui/feedback`)

**포함 컴포넌트**:
- Alert (AlertSuccess, AlertWarning, AlertError, AlertInfo)
- Toast (ToastProvider, useToast)
- LoadingSpinner
- Tooltip (TooltipLight, TooltipDark)

**장점**:
- ✅ 피드백 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 피드백만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함

**단점**:
- ⚠️ Alert, LoadingSpinner, Tooltip은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- Toast → `@hua-labs/ui/feedback` (CSS 파일도 함께 필요)
- Alert, LoadingSpinner, Tooltip은 Core에 유지 (너무 자주 사용됨)

---

### 5. Data Display 컴포넌트 (`@hua-labs/ui/data`)

**포함 컴포넌트**:
- Table (TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption)
- Badge
- Progress (ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup)
- Skeleton (SkeletonText, SkeletonCircle, SkeletonRectangle, SkeletonRounded, SkeletonCard, SkeletonAvatar, SkeletonImage, SkeletonUserProfile, SkeletonList, SkeletonTable)

**장점**:
- ✅ 데이터 표시 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 데이터 표시만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함

**단점**:
- ⚠️ Table, Badge, Progress, Skeleton은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ❌ **분리 비권장**
- 모든 컴포넌트가 매우 자주 사용됨
- Core에 유지하는 것이 더 나음

---

### 6. Interactive 컴포넌트 (`@hua-labs/ui/interactive`)

**포함 컴포넌트**:
- Accordion (AccordionItem, AccordionTrigger, AccordionContent)
- Tabs (TabsList, TabsTrigger, TabsContent, TabsPills, TabsUnderline, TabsCards)
- Menu (MenuItem, MenuSeparator, MenuLabel, MenuHorizontal, MenuVertical, MenuCompact)
- ContextMenu (ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup)
- Command (CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandEmpty, CommandDialog)

**장점**:
- ✅ 인터랙티브 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 인터랙티브만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함

**단점**:
- ⚠️ Tabs, Menu, Accordion은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- Command, ContextMenu → `@hua-labs/ui/interactive`
- Accordion, Tabs, Menu은 Core에 유지 (너무 자주 사용됨)

---

### 7. Scroll 컴포넌트 (`@hua-labs/ui/scroll`)

**포함 컴포넌트**:
- ScrollArea
- ScrollToTop
- ScrollProgress
- ScrollIndicator

**장점**:
- ✅ 스크롤 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 스크롤만 필요한 경우 번들 크기 최적화 가능
- ✅ 사용 패턴이 명확함

**단점**:
- ⚠️ ScrollArea는 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- ScrollToTop, ScrollProgress, ScrollIndicator → `@hua-labs/ui/scroll`
- ScrollArea는 Core에 유지 (너무 자주 사용됨)

---

### 8. Theme 컴포넌트 (`@hua-labs/ui/theme`)

**포함 컴포넌트**:
- ThemeProvider
- ThemeToggle
- useTheme

**장점**:
- ✅ 테마 관련 컴포넌트가 명확하게 그룹화됨
- ✅ 테마만 필요한 경우 번들 크기 최적화 가능

**단점**:
- ⚠️ ThemeProvider는 앱 루트에서 필수적으로 사용됨 (Core에 남겨두는 것이 나을 수도 있음)
- ⚠️ 컴포넌트 수가 적음 (3개)

**권장사항**: ❌ **분리 비권장**
- ThemeProvider는 앱 루트에서 필수적으로 사용됨
- Core에 유지하는 것이 더 나음

---

### 9. Icon 시스템 (`@hua-labs/ui/icons`)

**포함 컴포넌트/유틸리티**:
- Icon (EmotionIcon, StatusIcon, LoadingIcon, SuccessIcon, ErrorIcon)
- IconProvider
- useIconContext
- iconCategories, emotionIcons, statusIcons
- iconNames, iconProviderMapping, isValidIconName, getIconNameForProvider
- ICON_ALIASES, resolveIconAlias, getIconAliases

**장점**:
- ✅ 아이콘 관련 컴포넌트/유틸리티가 명확하게 그룹화됨
- ✅ 아이콘만 필요한 경우 번들 크기 최적화 가능
- ✅ 아이콘 시스템이 독립적으로 사용 가능

**단점**:
- ⚠️ Icon은 매우 자주 사용됨 (Core에 남겨두는 것이 나을 수도 있음)

**권장사항**: ⚠️ **부분 분리 고려**
- IconProvider, useIconContext, icon 유틸리티들 → `@hua-labs/ui/icons`
- Icon 컴포넌트는 Core에 유지 (너무 자주 사용됨)

---

## 최종 권장사항 (ChatGPT 리뷰 반영)

### 1. Core에 유지되는 컴포넌트 (항상 필요한 것들)

Core는 **경량 + 자주 사용 + 필수적인 컴포넌트만** 포함합니다.

#### UI 핵심 요소
- Button, Input, Select
- Form primitives (Label, Checkbox, Radio, Switch, Slider, Textarea)
- DatePicker, Upload, Autocomplete (Form 서브패키지에도 있음)

#### 데이터 표시
- Badge, Progress, Skeleton
- Table (TableHeader, TableBody, TableRow, TableCell 등)

#### 피드백
- Tooltip, Alert, LoadingSpinner
- ※ Toast는 글로벌 상태 관리 + motion queue로 무거워서 분리

#### 오버레이 (경량)
- Popover, Dropdown
- Modal
- ※ Drawer, BottomSheet는 motion + portal + scroll lock로 무거워서 분리

#### 인터랙티브 (경량)
- Tabs, Accordion, Menu
- ※ Command, ContextMenu는 무거워서 분리

#### 레이아웃
- Card
- Container, Grid, Stack, Divider, Panel
- ActionToolbar

#### 스크롤
- ScrollArea
- ※ ScrollToTop, ScrollIndicator, ScrollProgress는 motion + listener 기반 특수 기능으로 분리

#### 네비게이션 (경량)
- Breadcrumb, Pagination
- ※ Sidebar Navigation, PageNavigation, PageTransition은 대규모 앱 구조에 필요한 요소로 분리

#### 기본 시스템 요소
- ThemeProvider (앱 루트에서 필수)
- Icon (IconProvider 포함)
- 기본 Provider들

**👉 Core만으로 대부분의 일반적인 앱 개발이 가능해야 함**

---

### 2. 서브패키지로 분리되는 컴포넌트 (특수 기능)

이들은 **무겁거나 특정 도메인/고급 UX 패턴에서만 쓰이므로** 분리합니다.

#### `@hua-labs/ui/overlay`

**이유**: motion + portal + scroll lock → 번들 무게 증가

**포함 컴포넌트**:
- Drawer (DrawerHeader, DrawerContent, DrawerFooter)
- BottomSheet
- ConfirmModal

**※ Modal/Popover/Dropdown은 너무 자주 쓰여서 Core 유지**

---

#### `@hua-labs/ui/navigation`

**이유**: 대규모 앱 구조에 필요한 요소

**포함 컴포넌트**:
- Sidebar Navigation (DashboardSidebar 등)
- PageNavigation
- PageTransition

**※ Breadcrumb, Pagination 등은 Core 유지**

---

#### `@hua-labs/ui/interactive`

**이유**: 무겁고 특정 인터랙션의 경우에만 필요

**포함 컴포넌트**:
- Command (CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandEmpty, CommandDialog)
- ContextMenu (ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup)

**※ Tabs/Accordion/Menu 등은 자주 사용되므로 Core 유지**

---

#### `@hua-labs/ui/feedback`

**이유**: 글로벌 상태 관리 + motion queue → Core에서 분리

**포함 컴포넌트**:
- ToastProvider
- useToast
- Toast CSS 파일

**※ Alert/Spinner/Tooltip은 Core 유지**

---

#### `@hua-labs/ui/scroll`

**이유**: motion + listener 기반 특수 기능

**포함 컴포넌트**:
- ScrollToTop
- ScrollIndicator
- ScrollProgress

**※ ScrollArea는 자주 사용되므로 Core 유지**

---

### 3. 요약된 분리 기준

| 기준 | Core | 서브패키지 |
|------|------|-----------|
| **사용 빈도** | 자주 쓰는 것 | 특수 도메인 기능 |
| **번들 크기** | 경량 | 무거운 것 (motion + portal + scroll lock) |
| **의존성** | 기본 Provider | Focus trap / Portal / Motion 조합 |
| **필수성** | 앱 전체 Provider 필요 | 특정 기능에서만 필요 |

**이 기준으로 프레임워크 전체가 깔끔하게 유지됨**

---

## 분리 시 고려사항

### 1. 사용 빈도
- 매우 자주 사용되는 컴포넌트는 Core에 유지
- 특정 용도로만 사용되는 컴포넌트는 서브패키지로 분리

### 2. 의존성
- 서브패키지 간 의존성 최소화
- Core는 다른 서브패키지에 의존하지 않도록 유지

### 3. 번들 크기
- 서브패키지 분리로 번들 크기 최적화 가능
- 하지만 너무 많이 분리하면 import 경로가 복잡해질 수 있음

### 4. 사용자 경험
- 개발자가 쉽게 찾을 수 있어야 함
- import 경로가 직관적이어야 함

### 5. 유지보수
- 서브패키지가 너무 많으면 유지보수가 어려워질 수 있음
- 적절한 균형이 필요함

---

## 4. 기대 효과

### DX(개발 경험)
- **매우 단순**: 대부분 Core에서 import
- 일반적인 앱 개발은 Core만으로 충분

### 번들 크기
- 특수 기능만 가져올 때만 증량
- Motion + Portal + Scroll Lock 조합은 필요할 때만 로드

### Builder
- 도메인별 패키지 단위로 활성화/비활성화 쉬움
- Preset System: 기능별 도메인화에 유리

### 유지보수
- 적당한 패키지 수(5~6개)로 관리 용이
- Core 80% / Subpackages 20% 구도로 명확한 구조

---

## 5. 구현 가이드라인

### 각 서브패키지 디렉토리 생성
```
packages/hua-ui/src/
├── overlay.ts          # 새로 생성
├── navigation.ts        # 새로 생성
├── interactive.ts       # 새로 생성
├── feedback.ts         # 새로 생성
└── scroll.ts           # 새로 생성
```

### 내부 컴포넌트를 해당 패키지로 이동
- 컴포넌트 파일은 `src/components/`에 유지
- 엔트리 포인트 파일(`overlay.ts` 등)에서 export만 관리

### Core import 경로 유지 여부 점검
- 서브패키지에서 Core 컴포넌트 사용 가능해야 함
- 예: `@hua-labs/ui/overlay`에서 `Button`, `Card` 등 Core 컴포넌트 사용 가능

### 모든 서브패키지에서 Core 토큰/스타일 시스템 의존 허용
- Tailwind CSS 클래스는 공유
- `merge`, `formatRelativeTime` 등 유틸리티는 Core에서 export

### ESM 트리쉐이킹 정상 동작 확인
- 각 서브패키지는 독립적으로 import 가능해야 함
- 사용하지 않는 컴포넌트는 번들에서 제외되어야 함

### 빌드/테스트 환경에서 패키지 간 의존성 순환 없는지 점검
- Core → 서브패키지: 불가능 (순환 의존성 방지)
- 서브패키지 → Core: 가능
- 서브패키지 간: 불가능 (순환 의존성 방지)

---

## 6. 구현 우선순위

1. **높음**: Overlay, Navigation (motion + portal 조합으로 무거움)
2. **중간**: Feedback, Interactive (글로벌 상태 관리 또는 무거운 인터랙션)
3. **낮음**: Scroll (motion + listener 기반 특수 기능)

---

## 결론

현재 **Form 서브패키지**는 잘 작동하고 있으며, ChatGPT 리뷰를 반영하여 **Overlay, Navigation, Interactive, Feedback, Scroll** 서브패키지를 추가로 분리하는 것을 권장합니다.

**핵심 원칙**:
- **DX 우선**: Core에서 대부분 해결 가능
- **번들 최적화**: 무거운 특수 기능만 분리
- **Core 80% / Subpackages 20%** 구도 유지

이 구조로 프레임워크 전체가 깔끔하게 유지되며, 개발자 경험과 번들 크기 최적화를 모두 달성할 수 있습니다.

---

## 최종 결정 (2025-12-06)

**결정**: 최소 분리 전략 채택

실제 구현 확인 결과, ChatGPT의 가정(motion + portal + scroll lock)과 실제 구현이 다르다는 것이 확인되었습니다. 자세한 내용은 [`SUBPACKAGE_OPINION.md`](./SUBPACKAGE_OPINION.md)를 참고하세요.

**최종 구조**:

### 분리되는 패키지 (2개)
1. **`@hua-labs/ui/navigation`** - PageNavigation, PageTransition
2. **`@hua-labs/ui/feedback`** - ToastProvider, useToast (+ CSS)

### Core에 유지
- Drawer, BottomSheet, ConfirmModal (실제로 가벼움)
- Command, ContextMenu (실제로 가벼움)
- ScrollToTop, ScrollIndicator, ScrollProgress (사용 빈도 낮지만 가벼움)
- Modal, Popover, Dropdown (자주 사용)
- Tabs, Accordion, Menu (자주 사용)
- Table, Badge, Skeleton, Progress (자주 사용)
- Alert, Tooltip, LoadingSpinner (자주 사용)
- 모든 Layout 요소 및 Form primitives

**이유**:
- DX(개발 경험) 극대화
- 컴포넌트 자체가 실제로 무거움 X
- 분리 시 복잡도만 증가
- 사용 빈도 높음

**구현 상태**: 완료 (2025-12-06)

