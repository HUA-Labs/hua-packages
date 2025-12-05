# HUA UI 패키지 Core/Advanced 분리 전략

> **작성일**: 2025-12-05  
> **목적**: 패키지 번들 크기 최적화 및 트리 쉐이킹 개선을 위한 Core/Advanced 분리  
> **현재 문제**: 모든 컴포넌트가 index.ts에서 export되어 번들 크기가 큼

---

## 📊 현재 상태 분석

### 문제점

1. **모든 컴포넌트가 Core에 포함**
   - `index.ts`에서 Dashboard, Advanced 컴포넌트까지 모두 export
   - 기본 Button만 사용해도 Dashboard 컴포넌트까지 번들에 포함될 수 있음
   - 번들 크기 최적화 불가

2. **Advanced 엔트리 포인트는 있지만 분리 안 됨**
   - `package.json`에 `./advanced` 엔트리 정의되어 있음
   - 하지만 `index.ts`에서 `export * from './advanced'`로 모든 것을 포함
   - 실제로는 분리 효과 없음

3. **트리 쉐이킹 제한**
   - Dashboard 컴포넌트들이 Core에 포함되어 있어 트리 쉐이킹이 제대로 작동하지 않음
   - 사용하지 않는 컴포넌트도 번들에 포함될 수 있음

### 현재 구조

```
src/
├── index.ts                    # 모든 컴포넌트 export (Core + Dashboard + Advanced)
├── advanced.ts                 # Advanced 전체 re-export
├── advanced/
│   ├── dashboard.ts           # Dashboard re-export
│   └── motion.ts              # Motion re-export
└── components/
    ├── Button.tsx             # Core
    ├── Card.tsx               # Core
    ├── dashboard/             # Advanced (현재 Core에 포함됨)
    │   ├── StatCard.tsx
    │   ├── TransactionsTable.tsx
    │   └── ...
    └── advanced/              # Advanced
        ├── AdvancedPageTransition.tsx
        └── ...
```

---

## 🎯 분리 전략

### 컴포넌트 분류 기준

#### Core (기본 UI 컴포넌트)
**특징**: 
- 대부분의 프로젝트에서 사용하는 기본 컴포넌트
- 의존성이 적고 가벼움
- 범용적 사용

**포함 컴포넌트**:
- **Core**: Button, Action, Input, Link, Icon, Avatar, Modal
- **Layout**: Container, Grid, Stack, Divider, Card, Panel, ActionToolbar
- **Navigation**: Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition
- **Data Display**: Table, Badge, Progress, Skeleton
- **Feedback**: Alert, Toast, LoadingSpinner, Tooltip
- **Overlay**: Popover, Dropdown, Drawer, BottomSheet, ConfirmModal
- **Form**: Form, Label, Checkbox, Radio, Select, Switch, Slider, Textarea
- **Interactive**: Accordion, Tabs, Menu, ContextMenu, Command
- **Specialized (기본)**: ScrollArea, ScrollToTop, ThemeProvider, ThemeToggle
- **Utilities**: merge, cn, IconName 타입

**예상 번들 크기**: ~150KB (gzipped)

#### Advanced (고급/특수 컴포넌트)
**특징**:
- 특정 도메인에 특화된 컴포넌트
- 의존성이 많고 무거움
- 선택적 사용

**포함 컴포넌트**:

**1. Dashboard (데이터 위젯)**
- StatCard, QuickActionCard, DashboardGrid
- ActivityFeed, ProfileCard, MembershipBadge
- MiniBarChart, SummaryCard, NotificationCard
- MetricCard, ProgressCard, DashboardEmptyState
- DashboardSidebar, TransactionsTable, DashboardToolbar
- TrendChart, TransactionDetailDrawer
- SettlementTimeline, RoutingBreakdownCard, MerchantList
- StatsPanel, SectionHeader

**2. Motion (고급 모션)**
- AdvancedPageTransition
- usePageTransition
- usePageTransitionManager

**3. Specialized (특수 용도)**
- Bookmark, ChatMessage, ComponentLayout
- EmotionAnalysis, EmotionButton, EmotionMeter, EmotionSelector
- LanguageToggle
- ScrollIndicator, ScrollProgress, Scrollbar
- FeatureCard, HeroSection, InfoCard

**예상 번들 크기**: ~200KB (gzipped)

---

## 🔧 구현 계획

### Phase 1: Core 분리 (1주)

#### 1.1 index.ts 수정

```tsx
// src/index.ts - Core만 export

// UI Components - Core
export { Button } from './components/Button';
export { Action } from './components/Action';
export { Input } from './components/Input';
export { Link } from './components/Link';
export { Icon, EmotionIcon, StatusIcon, LoadingIcon, SuccessIcon, ErrorIcon } from './components/Icon';
export type { IconProps } from './components/Icon';
export { Avatar, AvatarImage, AvatarFallback } from './components/Avatar';
export { Modal } from './components/Modal';

// UI Components - Layout
export { Container } from './components/Container';
export { Grid } from './components/Grid';
export { Stack } from './components/Stack';
export { Divider } from './components/Divider';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/Card';
export { Panel } from './components/Panel';
export { ActionToolbar } from './components/ActionToolbar';
export type { ActionToolbarProps, ActionButton } from './components/ActionToolbar';

// UI Components - Navigation
export { Navigation, NavigationList, NavigationItem, NavigationContent } from './components/Navigation';
export { Breadcrumb, BreadcrumbItem } from './components/Breadcrumb';
export { Pagination, PaginationOutlined, PaginationMinimal, PaginationWithInfo } from './components/Pagination';
export { PageNavigation } from './components/PageNavigation';
export { PageTransition } from './components/PageTransition';

// UI Components - Data Display
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/Table';
export { Badge } from './components/Badge';
export { Progress, ProgressSuccess, ProgressWarning, ProgressError, ProgressInfo, ProgressGroup } from './components/Progress';
export { Skeleton, SkeletonText, SkeletonCircle, SkeletonRectangle, SkeletonRounded, SkeletonCard, SkeletonAvatar, SkeletonImage, SkeletonUserProfile, SkeletonList, SkeletonTable } from './components/Skeleton';

// UI Components - Feedback
export { Alert, AlertSuccess, AlertWarning, AlertError, AlertInfo } from './components/Alert';
export { ToastProvider, useToast } from './components/Toast';
export type { Toast } from './components/Toast';
export { LoadingSpinner } from './components/LoadingSpinner';
export { Tooltip, TooltipLight, TooltipDark } from './components/Tooltip';

// UI Components - Overlay
export { Popover, PopoverTrigger, PopoverContent } from './components/Popover';
export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup } from './components/Dropdown';
export { Drawer, DrawerHeader, DrawerContent, DrawerFooter } from './components/Drawer';
export { BottomSheet } from './components/BottomSheet';
export { ConfirmModal } from './components/ConfirmModal';

// UI Components - Form
export { Form, FormField, FormGroup } from './components/Form';
export { Label } from './components/Label';
export { Checkbox } from './components/Checkbox';
export { Radio } from './components/Radio';
export { Select, SelectOption } from './components/Select';
export { Switch } from './components/Switch';
export { Slider } from './components/Slider';
export { Textarea } from './components/Textarea';

// UI Components - Interactive
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/Accordion';
export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPills, TabsUnderline, TabsCards } from './components/Tabs';
export { Menu, MenuItem, MenuSeparator, MenuLabel, MenuHorizontal, MenuVertical, MenuCompact } from './components/Menu';
export { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup } from './components/ContextMenu';
export { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandEmpty, CommandDialog } from './components/Command';

// UI Components - Specialized (Core)
export { ScrollArea } from './components/ScrollArea';
export { ScrollToTop } from './components/ScrollToTop';
export { ThemeProvider } from './components/ThemeProvider';
export { ThemeToggle } from './components/ThemeToggle';
export { useTheme } from './components/ThemeProvider';

// Icons and Types
export { iconCategories, emotionIcons, statusIcons } from './lib/icons';
export type { IconName } from './lib/icons';
export { iconNames, iconProviderMapping, isValidIconName, getIconNameForProvider } from './lib/icon-names';
export type { ProjectIconName, AllIconName } from './lib/icon-names';
export { ICON_ALIASES, resolveIconAlias, getIconAliases } from './lib/icon-aliases';
export { IconProvider, useIconContext } from './components/Icon';
export type { IconProviderProps } from './components/Icon';
export type { IconSet, PhosphorWeight, IconConfig } from './components/Icon';
export { defaultIconConfig, getDefaultStrokeWidth } from './components/Icon';

// Utilities
export { merge, mergeIf, mergeMap, cn } from './lib/utils';

// Convenience exports
export { Button as Btn } from './components/Button';
export { Action as Act } from './components/Action';
export { Input as Inp } from './components/Input';
export { Link as Lnk } from './components/Link';
export { Icon as Ic } from './components/Icon';
export { Avatar as Avt } from './components/Avatar';
export { Modal as Mdl } from './components/Modal';
export { Container as Cont } from './components/Container';
export { Card as Crd } from './components/Card';
export { Table as Tbl } from './components/Table';
export { Form as Frm } from './components/Form';
export { Alert as Alt } from './components/Alert';
export { LoadingSpinner as Loading } from './components/LoadingSpinner';

// ❌ 제거: Dashboard, Advanced 컴포넌트 export 제거
// export * from './advanced'; // 제거
```

#### 1.2 advanced.ts 수정

```tsx
// src/advanced.ts - Advanced 전체 export

// Dashboard widgets
export * from './components/dashboard';
export type * from './components/dashboard';

// Motion components
export * from './components/advanced';

// Specialized Advanced components
export { Bookmark } from './components/Bookmark';
export { ChatMessage } from './components/ChatMessage';
export { ComponentLayout } from './components/ComponentLayout';
export { EmotionAnalysis } from './components/EmotionAnalysis';
export { EmotionButton } from './components/EmotionButton';
export { EmotionMeter } from './components/EmotionMeter';
export { EmotionSelector } from './components/EmotionSelector';
export { LanguageToggle } from './components/LanguageToggle';
export { ScrollIndicator } from './components/ScrollIndicator';
export { ScrollProgress } from './components/ScrollProgress';
export { Scrollbar } from './components/scrollbar/scrollbar';
export { FeatureCard } from './components/FeatureCard';
export { HeroSection } from './components/HeroSection';
export { InfoCard } from './components/InfoCard';
export { StatsPanel } from './components/StatsPanel';
export type { StatsPanelProps, StatsPanelItem } from './components/StatsPanel';
export { SectionHeader } from './components/SectionHeader';
export type { SectionHeaderProps } from './components/SectionHeader';
```

#### 1.3 advanced/dashboard.ts 수정

```tsx
// src/advanced/dashboard.ts - Dashboard만 export

export * from '../components/dashboard';
export type * from '../components/dashboard';
export { StatsPanel } from '../components/StatsPanel';
export type { StatsPanelProps, StatsPanelItem } from '../components/StatsPanel';
export { SectionHeader } from '../components/SectionHeader';
export type { SectionHeaderProps } from '../components/SectionHeader';
```

#### 1.4 advanced/motion.ts 수정

```tsx
// src/advanced/motion.ts - Motion만 export

export * from '../components/advanced';
```

---

### Phase 2: 마이그레이션 가이드 작성 (1일)

#### 2.1 마이그레이션 문서 작성

```markdown
# Core/Advanced 분리 마이그레이션 가이드

## 변경 사항

### Before (기존)
```tsx
import { Button, StatCard } from '@hua-labs/ui';
```

### After (새로운)
```tsx
// Core 컴포넌트
import { Button } from '@hua-labs/ui';

// Advanced 컴포넌트
import { StatCard } from '@hua-labs/ui/advanced';
// 또는
import { StatCard } from '@hua-labs/ui/advanced/dashboard';
```

## 마이그레이션 체크리스트

- [ ] Dashboard 컴포넌트 import 경로 변경
- [ ] Motion 컴포넌트 import 경로 변경
- [ ] Specialized 컴포넌트 import 경로 변경
- [ ] 빌드 테스트
- [ ] 번들 크기 확인
```

#### 2.2 하위 호환성 유지 (선택사항)

```tsx
// src/index.ts 하단에 deprecated export 추가 (경고와 함께)
if (process.env.NODE_ENV === 'development') {
  console.warn(
    '[@hua-labs/ui] Dashboard components have been moved to @hua-labs/ui/advanced. ' +
    'Please update your imports to reduce bundle size.'
  );
}

// Deprecated exports (제거 예정)
export { StatCard } from './components/dashboard/StatCard';
export type { StatCardProps } from './components/dashboard/StatCard';
// ... (다른 Dashboard 컴포넌트들)
```

---

### Phase 3: 프로젝트 마이그레이션 (1주)

#### 3.1 숨다이어리 앱 마이그레이션

**현재 사용 중인 Advanced 컴포넌트 확인**:
- `DashboardEmptyState` - `@hua-labs/ui`에서 사용 중

**마이그레이션**:
```tsx
// Before
import { DashboardEmptyState } from '@hua-labs/ui';

// After
import { DashboardEmptyState } from '@hua-labs/ui/advanced';
// 또는
import { DashboardEmptyState } from '@hua-labs/ui/advanced/dashboard';
```

#### 3.2 다른 프로젝트 마이그레이션

각 프로젝트에서 Advanced 컴포넌트 사용 현황 확인 후 마이그레이션

---

## 📦 번들 크기 최적화

### 예상 효과

**Before (현재)**:
```
@hua-labs/ui: ~350KB (gzipped)
  - Core: ~150KB
  - Dashboard: ~150KB
  - Motion: ~30KB
  - Specialized: ~20KB
```

**After (분리 후)**:
```
@hua-labs/ui (Core): ~150KB (gzipped) ⬇️ 57% 감소
@hua-labs/ui/advanced: ~200KB (gzipped)
  - Dashboard: ~150KB
  - Motion: ~30KB
  - Specialized: ~20KB
```

**트리 쉐이킹 효과**:
- Core만 사용 시: ~150KB (기존 ~350KB 대비 57% 감소)
- Dashboard만 사용 시: ~150KB (기존 ~350KB 대비 57% 감소)
- Core + Dashboard 사용 시: ~300KB (기존 ~350KB 대비 14% 감소)

---

## 🛠️ 빌드 설정 확인

### tsup.config.ts 확인

현재 설정이 올바른지 확인:

```ts
// tsup.config.ts
const entry = {
  index: 'src/index.ts',              // Core
  advanced: 'src/advanced.ts',        // Advanced 전체
  'advanced-dashboard': 'src/advanced/dashboard.ts',  // Dashboard만
  'advanced-motion': 'src/advanced/motion.ts',        // Motion만
};
```

**확인 사항**:
- ✅ 각 엔트리 포인트가 독립적으로 빌드되는지
- ✅ 트리 쉐이킹이 제대로 작동하는지
- ✅ 번들 크기가 예상대로 분리되는지

---

## 📋 컴포넌트 분류표

### Core (index.ts)

| 카테고리 | 컴포넌트 | 개수 |
|---------|---------|------|
| Core | Button, Action, Input, Link, Icon, Avatar, Modal | 7 |
| Layout | Container, Grid, Stack, Divider, Card, Panel, ActionToolbar | 7 |
| Navigation | Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition | 5 |
| Data Display | Table, Badge, Progress, Skeleton | 4 |
| Feedback | Alert, Toast, LoadingSpinner, Tooltip | 4 |
| Overlay | Popover, Dropdown, Drawer, BottomSheet, ConfirmModal | 5 |
| Form | Form, Label, Checkbox, Radio, Select, Switch, Slider, Textarea | 8 |
| Interactive | Accordion, Tabs, Menu, ContextMenu, Command | 5 |
| Specialized (Core) | ScrollArea, ScrollToTop, ThemeProvider, ThemeToggle | 4 |
| **합계** | | **49개** |

### Advanced (advanced.ts)

| 카테고리 | 컴포넌트 | 개수 |
|---------|---------|------|
| Dashboard | StatCard, QuickActionCard, DashboardGrid, ActivityFeed, ProfileCard, MembershipBadge, MiniBarChart, SummaryCard, NotificationCard, MetricCard, ProgressCard, DashboardEmptyState, DashboardSidebar, TransactionsTable, DashboardToolbar, TrendChart, TransactionDetailDrawer, SettlementTimeline, RoutingBreakdownCard, MerchantList, StatsPanel, SectionHeader | 22 |
| Motion | AdvancedPageTransition, usePageTransition, usePageTransitionManager | 3 |
| Specialized (Advanced) | Bookmark, ChatMessage, ComponentLayout, EmotionAnalysis, EmotionButton, EmotionMeter, EmotionSelector, LanguageToggle, ScrollIndicator, ScrollProgress, Scrollbar, FeatureCard, HeroSection, InfoCard | 14 |
| **합계** | | **39개** |

---

## 🚀 마이그레이션 전략

### 단계적 마이그레이션 (권장)

#### Step 1: 하위 호환성 유지 (1주)
- Core에서 Advanced 컴포넌트를 deprecated export로 유지
- 경고 메시지 추가
- 문서 업데이트

#### Step 2: 프로젝트별 마이그레이션 (2-3주)
- 각 프로젝트에서 Advanced 컴포넌트 import 경로 변경
- 테스트 및 검증

#### Step 3: Deprecated 제거 (1주)
- 하위 호환성 export 제거
- 최종 검증

### 즉시 마이그레이션 (빠른 전환)

- Core에서 Advanced export 즉시 제거
- 모든 프로젝트 동시 마이그레이션
- 빠른 번들 크기 개선

---

## 📊 예상 효과 요약

### 번들 크기
- **Core만 사용**: 57% 감소 (350KB → 150KB)
- **Advanced만 사용**: 57% 감소 (350KB → 200KB)
- **Core + Advanced**: 14% 감소 (350KB → 300KB)

### 개발자 경험
- ✅ 명확한 컴포넌트 분류
- ✅ 필요한 것만 import 가능
- ✅ 번들 크기 예측 가능

### 유지보수
- ✅ Core와 Advanced 독립적 관리
- ✅ 버전 관리 용이
- ✅ 의존성 관리 개선

---

## ⚠️ 주의사항

1. **하위 호환성**: 기존 프로젝트에 영향 최소화
2. **의존성 확인**: Advanced 컴포넌트가 Core 컴포넌트에 의존하는지 확인
3. **타입 export**: 타입도 함께 분리 필요
4. **문서 업데이트**: README, 마이그레이션 가이드 업데이트
5. **테스트**: 각 엔트리 포인트별 테스트 필요

---

## 🔗 관련 문서

- [패키지 개선 제안서](./HUA_UI_PACKAGE_IMPROVEMENT_PROPOSAL.md)
- [패키지 사용 현황 분석](./SUMDIARY_PACKAGE_USAGE_ANALYSIS.md)
- [트리 쉐이킹 가이드](https://webpack.js.org/guides/tree-shaking/)

