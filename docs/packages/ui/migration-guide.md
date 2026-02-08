# Core/Advanced 분리 마이그레이션 가이드

> **작성일**: 2025-12-XX
> **버전**: 1.0.0+
> **목적**: UI 패키지 Core/Advanced 분리로 인한 import 경로 변경 가이드

---

## 변경 사항 요약

UI 패키지가 **Core**와 **Advanced**로 분리되었습니다. 번들 크기 최적화를 위해 Advanced 컴포넌트는 별도 엔트리 포인트에서 import해야 합니다.

### 변경 전 (Before)
```tsx
import { Button, StatCard, FeatureCard } from '@hua-labs/ui';
```

### 변경 후 (After)
```tsx
// Core 컴포넌트
import { Button } from '@hua-labs/ui';

// Advanced 컴포넌트
import { StatCard } from '@hua-labs/ui/advanced';
// 또는
import { StatCard } from '@hua-labs/ui/advanced/dashboard';
import { FeatureCard } from '@hua-labs/ui/advanced';
```

---

## 컴포넌트 분류

### Core (`@hua-labs/ui`)
기본 UI 컴포넌트로, 대부분의 프로젝트에서 사용하는 범용 컴포넌트입니다.

**포함 컴포넌트:**
- **Core**: Button, Action, Input, Link, Icon, Avatar, Modal
- **Layout**: Container, Grid, Stack, Divider, Card, Panel, ActionToolbar
- **Navigation**: Navigation, Breadcrumb, Pagination, PageNavigation, PageTransition
- **Data Display**: Table, Badge, Progress, Skeleton
- **Feedback**: Alert, Toast, LoadingSpinner, Tooltip
- **Overlay**: Popover, Dropdown, Drawer, BottomSheet, ConfirmModal
- **Form**: Form, Label, Checkbox, Radio, Select, Switch, Slider, Textarea
- **Interactive**: Accordion, Tabs, Menu, ContextMenu, Command
- **Specialized (Core)**: ScrollArea, ScrollToTop, ThemeProvider, ThemeToggle

### Advanced (`@hua-labs/ui/advanced`)
고급/특수 컴포넌트로, 특정 도메인에 특화된 컴포넌트입니다.

**포함 컴포넌트:**

1. **Dashboard** (`@hua-labs/ui/advanced/dashboard`)
   - StatCard, QuickActionCard, DashboardGrid
   - ActivityFeed, ProfileCard, MembershipBadge
   - MiniBarChart, SummaryCard, NotificationCard
   - MetricCard, ProgressCard, DashboardEmptyState
   - DashboardSidebar, TransactionsTable, DashboardToolbar
   - TrendChart, TransactionDetailDrawer
   - SettlementTimeline, RoutingBreakdownCard, MerchantList
   - StatsPanel, SectionHeader

2. **Motion** (`@hua-labs/ui/advanced/motion`)
   - AdvancedPageTransition
   - usePageTransition
   - usePageTransitionManager

3. **Specialized (Advanced)**
   - Bookmark, ChatMessage, ComponentLayout
   - EmotionAnalysis, EmotionButton, EmotionMeter, EmotionSelector
   - LanguageToggle
   - ScrollIndicator, ScrollProgress, Scrollbar
   - FeatureCard, HeroSection, InfoCard

---

## 마이그레이션 체크리스트

### 1. Dashboard 컴포넌트 마이그레이션

**Before:**
```tsx
import {
  StatCard,
  QuickActionCard,
  DashboardGrid,
  ActivityFeed,
  DashboardEmptyState,
  MetricCard
} from '@hua-labs/ui';
```

**After:**
```tsx
// 옵션 1: advanced 전체에서 import
import {
  StatCard,
  QuickActionCard,
  DashboardGrid,
  ActivityFeed,
  DashboardEmptyState,
  MetricCard
} from '@hua-labs/ui/advanced';

// 옵션 2: dashboard 서브 엔트리에서 import (권장 - 더 작은 번들)
import {
  StatCard,
  QuickActionCard,
  DashboardGrid,
  ActivityFeed,
  DashboardEmptyState,
  MetricCard
} from '@hua-labs/ui/advanced/dashboard';
```

### 2. Specialized Advanced 컴포넌트 마이그레이션

**Before:**
```tsx
import {
  FeatureCard,
  InfoCard,
  HeroSection,
  EmotionButton,
  ComponentLayout
} from '@hua-labs/ui';
```

**After:**
```tsx
import {
  FeatureCard,
  InfoCard,
  HeroSection,
  EmotionButton,
  ComponentLayout
} from '@hua-labs/ui/advanced';
```

### 3. Motion 컴포넌트 마이그레이션

**Before:**
```tsx
import {
  AdvancedPageTransition,
  usePageTransition
} from '@hua-labs/ui';
```

**After:**
```tsx
// 옵션 1: advanced 전체에서 import
import {
  AdvancedPageTransition,
  usePageTransition
} from '@hua-labs/ui/advanced';

// 옵션 2: motion 서브 엔트리에서 import (권장)
import {
  AdvancedPageTransition,
  usePageTransition
} from '@hua-labs/ui/advanced/motion';
```

### 4. Core 컴포넌트는 변경 없음

**변경 없음:**
```tsx
import {
  Button,
  Input,
  Card,
  Modal,
  Icon,
  LoadingSpinner
} from '@hua-labs/ui';
// 변경 불필요
```

---

## 번들 크기 최적화 팁

### 1. 서브 엔트리 사용 (권장)

필요한 컴포넌트만 import하여 번들 크기를 최소화하세요:

```tsx
// 좋은 예: 필요한 것만 import
import { StatCard } from '@hua-labs/ui/advanced/dashboard';
import { AdvancedPageTransition } from '@hua-labs/ui/advanced/motion';

// 나쁜 예: 전체 advanced import
import { StatCard, AdvancedPageTransition } from '@hua-labs/ui/advanced';
```

### 2. 트리 쉐이킹 활용

Core만 사용하는 경우, Advanced 컴포넌트는 번들에 포함되지 않습니다:

```tsx
// Core만 사용 → Advanced 컴포넌트는 번들에 포함되지 않음
import { Button, Input, Card } from '@hua-labs/ui';
```

---

## 자동 마이그레이션 스크립트

다음 스크립트를 사용하여 자동으로 마이그레이션할 수 있습니다:

```bash
# 프로젝트 루트에서 실행
find . -type f -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e "s/from '@hua-labs\/ui';/from '@hua-labs\/ui';/g" \
  -e "s/StatCard, QuickActionCard, DashboardGrid, ActivityFeed, DashboardEmptyState, MetricCard/StatCard, QuickActionCard, DashboardGrid, ActivityFeed, DashboardEmptyState, MetricCard/g"
```

**주의**: 자동 스크립트 사용 전 백업을 권장합니다.

---

## 주의사항

1. **하위 호환성**: 이 변경은 **breaking change**입니다. 모든 프로젝트에서 import 경로를 업데이트해야 합니다.

2. **타입 import**: 타입도 함께 마이그레이션해야 합니다:
   ```tsx
   // Before
   import type { StatCardProps } from '@hua-labs/ui';

   // After
   import type { StatCardProps } from '@hua-labs/ui/advanced/dashboard';
   ```

3. **빌드 확인**: 마이그레이션 후 빌드가 정상적으로 작동하는지 확인하세요.

---

## 예상 효과

### 번들 크기 개선
- **Core만 사용**: ~57% 감소 (350KB -> 150KB)
- **Advanced만 사용**: ~57% 감소 (350KB -> 200KB)
- **Core + Advanced**: ~14% 감소 (350KB -> 300KB)

### 개발자 경험
- 명확한 컴포넌트 분류
- 필요한 것만 import 가능
- 번들 크기 예측 가능

---

## 문제 해결

### 문제: "Module not found" 에러

**해결책**: import 경로를 확인하세요:
```tsx
// 잘못된 경로
import { StatCard } from '@hua-labs/ui';

// 올바른 경로
import { StatCard } from '@hua-labs/ui/advanced/dashboard';
```

### 문제: 타입 에러

**해결책**: 타입도 함께 import하세요:
```tsx
import { StatCard } from '@hua-labs/ui/advanced/dashboard';
import type { StatCardProps } from '@hua-labs/ui/advanced/dashboard';
```

---

## 관련 문서

- [Core/Advanced 분리 전략 문서](../../docs/HUA_UI_CORE_ADVANCED_SEPARATION_STRATEGY.md)
- [UI 패키지 개선 제안서](../../docs/HUA_UI_PACKAGE_IMPROVEMENT_PROPOSAL.md)

---

## 문의

마이그레이션 중 문제가 발생하면 이슈를 등록해주세요.
