# UI 컴포넌트 분류 상태

## 현재 구조

### ✅ Core (메인 export - `@hua-labs/ui`)
**공개/기본 컴포넌트** - 모든 사용자가 사용 가능

#### Core UI
- `Button`, `Action`, `Input`, `Link`, `Icon`, `Avatar`, `Modal`

#### Layout
- `Container`, `Grid`, `Stack`, `Divider`, `Card`, `Panel`, `ActionToolbar`
- ⚠️ **`ComponentLayout`** - 중복 export (메인과 advanced 둘 다)

#### Navigation
- `Navigation`, `Breadcrumb`, `Pagination`, `PageNavigation`, `PageTransition`

#### Data Display
- `Table`, `Badge`, `Progress`, `Skeleton` (다양한 variants)

#### Feedback
- `Alert`, `Toast`, `LoadingSpinner`, `Tooltip`

#### Overlay
- `Popover`, `Dropdown`, `Drawer`, `BottomSheet`, `ConfirmModal`

#### Form
- `Form`, `Label`, `Checkbox`, `Radio`, `Select`, `Switch`, `Slider`, `Textarea`, `DatePicker`, `Upload`, `Autocomplete`

#### Interactive
- `Accordion`, `Tabs`, `Menu`, `ContextMenu`, `Command`

#### Specialized (Core)
- `ScrollArea`, `ScrollToTop`, `ThemeProvider`, `ThemeToggle`, `useTheme`

---

### 🔶 Advanced (`@hua-labs/ui/advanced`)
**고급 컴포넌트** - 현재 공개되어 있으나, 일부는 Pro용으로 분리 예정

#### Dashboard Components (`/advanced/dashboard`)
**⚠️ Pro용 후보** - 결제/정산 대시보드 전용 컴포넌트들
- `StatCard`, `QuickActionCard`, `DashboardGrid`
- `ActivityFeed`, `ProfileCard`, `MembershipBadge`
- `MiniBarChart`, `SummaryCard`, `NotificationCard`
- `MetricCard`, `ProgressCard`
- `TransactionsTable` - **결제 거래 테이블 (Pro용 확실)**
- `TransactionDetailDrawer` - **거래 상세 Drawer (Pro용 확실)**
- `SettlementTimeline` - **정산 타임라인 (Pro용 확실)**
- `RoutingBreakdownCard` - **PG 라우팅 분석 (Pro용 확실)**
- `MerchantList` - **가맹점 관리 (Pro용 확실)**
- `DashboardToolbar`, `DashboardSidebar`
- `TrendChart`, `BarChart`
- `DashboardEmptyState`

#### Motion Components (`/advanced/motion`)
**공개 가능** - 고급 애니메이션 컴포넌트
- `AdvancedPageTransition`
- `usePageTransition`, `usePageTransitionManager`

#### Advanced Specialized
**분류 필요** - 용도에 따라 Core/Pro 분리 필요
- `Bookmark` - 북마크 기능 (Core 가능)
- `ChatMessage` - 채팅 메시지 (Core 가능)
- `ComponentLayout` - 문서 레이아웃 (Core 가능, 현재 중복)
- `EmotionAnalysis` - 감정 분석 (Pro용 가능)
- `EmotionButton`, `EmotionMeter`, `EmotionSelector` - 감정 관련 (Pro용 가능)
- `LanguageToggle` - 언어 전환 (Core 가능)
- `ScrollIndicator`, `ScrollProgress`, `Scrollbar` - 스크롤 관련 (Core 가능)
- `FeatureCard`, `HeroSection`, `InfoCard` - 마케팅용 (Core 가능)

---

## 분류 제안

### 📦 Core (공개 - `@hua-labs/ui`)
기본 UI 컴포넌트 + 일반적인 고급 컴포넌트

**유지:**
- 모든 Core UI, Layout, Navigation, Data Display, Feedback, Overlay, Form, Interactive
- `ScrollArea`, `ScrollToTop`, `ThemeProvider`, `ThemeToggle`
- `Bookmark`, `ChatMessage`, `ComponentLayout`, `LanguageToggle`
- `ScrollIndicator`, `ScrollProgress`, `Scrollbar`
- `FeatureCard`, `HeroSection`, `InfoCard`
- `AdvancedPageTransition` (Motion)

### 💼 Pro (유료 - `@hua-labs/ui-pro` 또는 별도 패키지)
결제/정산 대시보드 전용 컴포넌트

**이동 필요:**
- `TransactionsTable`
- `TransactionDetailDrawer`
- `SettlementTimeline`
- `RoutingBreakdownCard`
- `MerchantList`
- `DashboardToolbar` (결제 대시보드용)
- `DashboardSidebar` (결제 대시보드용)
- `TrendChart` (결제 데이터용)
- `BarChart` (결제 데이터용)

**검토 필요:**
- `StatCard`, `QuickActionCard`, `DashboardGrid` - 일반 대시보드에도 사용 가능하므로 Core 유지?
- `ActivityFeed`, `ProfileCard`, `MembershipBadge` - 일반 앱에도 사용 가능하므로 Core 유지?
- `MiniBarChart`, `SummaryCard`, `NotificationCard`, `MetricCard`, `ProgressCard` - 일반 대시보드에도 사용 가능하므로 Core 유지?
- `EmotionAnalysis`, `EmotionButton`, `EmotionMeter`, `EmotionSelector` - 감정 분석 기능이 Pro 기능인지 확인 필요

---

## 현재 문제점

1. **중복 export**: `ComponentLayout`이 메인과 advanced 둘 다에 export됨
2. **명확한 분류 부재**: 어떤 컴포넌트가 Pro용인지 명확하지 않음
3. **Dashboard 컴포넌트 혼재**: 일반 대시보드용과 결제 대시보드용이 섞여 있음

---

## 권장 조치

### 즉시 조치
1. `ComponentLayout` 중복 제거 - 메인에서만 export
2. Pro용 컴포넌트 명확히 표시 (주석 또는 별도 파일)

### 단기 조치
1. Pro용 컴포넌트를 별도 export 경로로 분리 (`@hua-labs/ui/pro`)
2. 또는 별도 패키지로 분리 (`@hua-labs/ui-pro`)

### 장기 조치
1. Pro용 컴포넌트를 완전히 별도 npm 패키지로 분리
2. 라이선스 체크 로직 추가 (Pro 컴포넌트 사용 시)
