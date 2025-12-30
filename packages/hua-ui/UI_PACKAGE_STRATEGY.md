# UI 패키지 분리 전략

## 현재 상황 분석

### hua-ux 프레임워크 사용 현황
프레임워크에서 실제로 사용하는 UI 컴포넌트:
- `Button`, `Card`, `Skeleton`, `merge` (유틸리티)
- **Core UI만 필요** - Advanced/Pro 컴포넌트 불필요

### i18n 패키지 구조 (참고)
```
@hua-labs/i18n-core          # 기본 기능
@hua-labs/i18n-core-zustand  # Zustand 통합
@hua-labs/i18n-advanced      # 고급 기능
@hua-labs/i18n-currency      # 통화 포맷팅
@hua-labs/i18n-date          # 날짜 포맷팅
@hua-labs/i18n-number        # 숫자 포맷팅
@hua-labs/i18n-loaders       # 로더
@hua-labs/i18n-plugins       # 플러그인
```

**특징:**
- 개별 npm 패키지로 완전 분리
- 필요한 것만 선택적으로 설치
- 의존성 관리 명확

---

## 최종 전략: Core/Pro 분리 + 프레임워크 Pro 기능 제공

### 구조

```
@hua-labs/ui              # Core (공개)
@hua-labs/ui-pro          # Pro (유료, Advanced = Pro)
@hua-labs/hua-ux          # 프레임워크 (일부 Pro 기능 포함)
```

### 핵심 원칙

1. **Core만 공개** - 기본 UI 컴포넌트
2. **Advanced = Pro (유료)** - 고급 컴포넌트는 Pro 패키지
3. **프레임워크 사용자 혜택** - 일부 Pro 기능을 프레임워크에서 제공
4. **Enterprise 확장 가능** - 나중에 추가 가능

---

## 컴포넌트 분류 기준

### 📦 Core (`@hua-labs/ui`) - 공개

**기본 UI 컴포넌트** - 모든 사용자가 사용 가능

#### Core UI
- `Button`, `Action`, `Input`, `Link`, `Icon`, `Avatar`, `Modal`

#### Layout
- `Container`, `Grid`, `Stack`, `Divider`, `Card`, `Panel`, `ActionToolbar`, `ComponentLayout`

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
- `Bookmark`, `ChatMessage`, `LanguageToggle`
- `ScrollIndicator`, `ScrollProgress`, `Scrollbar`
- `FeatureCard`, `HeroSection`, `InfoCard`

#### Motion (Core)
- `AdvancedPageTransition` (고급 애니메이션은 공개)

---

### 💼 Pro (`@hua-labs/ui-pro`) - 유료

**고급 컴포넌트** - 유료 기능

#### Dashboard Components (일반용)
**프레임워크 사용자에게 제공 가능:**
- `StatCard` - 통계 카드 (일반 대시보드용)
- `QuickActionCard` - 빠른 액션 카드 (일반 앱용)
- `DashboardGrid` - 대시보드 그리드 레이아웃
- `ActivityFeed` - 활동 피드 (일반 앱용)
- `ProfileCard` - 프로필 카드 (일반 앱용)
- `MembershipBadge` - 멤버십 배지
- `MiniBarChart` - 작은 막대 그래프
- `SummaryCard` - 요약 카드
- `NotificationCard` - 알림 카드
- `MetricCard` - 메트릭 카드 (차트 포함)
- `ProgressCard` - 진행률 카드
- `DashboardEmptyState` - 빈 상태 컴포넌트

#### Dashboard Components (결제/정산 전용)
**프레임워크 사용자에게 제공 안 함 (Pro 전용):**
- `TransactionsTable` - 결제 거래 테이블
- `TransactionDetailDrawer` - 거래 상세 Drawer
- `SettlementTimeline` - 정산 타임라인
- `RoutingBreakdownCard` - PG 라우팅 분석
- `MerchantList` - 가맹점 관리
- `DashboardToolbar` - 결제 대시보드 툴바
- `DashboardSidebar` - 결제 대시보드 사이드바
- `TrendChart` - 결제 데이터용 트렌드 차트
- `BarChart` - 결제 데이터용 막대 차트

#### Specialized (Pro)
- `EmotionAnalysis` - 감정 분석
- `EmotionButton`, `EmotionMeter`, `EmotionSelector` - 감정 관련

---

### 🎁 프레임워크 Pro 기능 (`@hua-labs/hua-ux`)

**프레임워크 사용자에게 제공되는 Pro 기능**

프레임워크를 사용하면 일부 Pro 기능을 추가 비용 없이 사용 가능 (프레임워크의 가치)

#### 포함될 Pro 컴포넌트 (일반용)
```tsx
// @hua-labs/hua-ux에서 re-export
export { 
  StatCard, 
  QuickActionCard, 
  DashboardGrid,
  ActivityFeed,
  ProfileCard,
  MembershipBadge,
  MiniBarChart,
  SummaryCard,
  NotificationCard,
  MetricCard,
  ProgressCard,
  DashboardEmptyState
} from '@hua-labs/ui-pro';
```

#### 제외될 Pro 컴포넌트 (결제/정산 전용)
- `TransactionsTable`
- `TransactionDetailDrawer`
- `SettlementTimeline`
- `RoutingBreakdownCard`
- `MerchantList`
- `DashboardToolbar` (결제용)
- `DashboardSidebar` (결제용)
- `TrendChart` (결제 데이터용)
- `BarChart` (결제 데이터용)
- `EmotionAnalysis` 등 감정 분석 기능

---

## 구현 계획

### Phase 1: 즉시 (패키지 분리 준비)

1. **ComponentLayout 중복 제거**
   ```ts
   // src/index.ts - 유지 (Core)
   export { ComponentLayout } from './components/ComponentLayout';
   
   // src/advanced.ts - 제거
   // export { ComponentLayout } from './components/ComponentLayout'; // 삭제
   ```

2. **컴포넌트 분류 확정**
   - Core: 기본 UI 컴포넌트 (공개)
   - Pro (일반용): 프레임워크 사용자에게 제공
   - Pro (결제/정산 전용): Pro 전용
   - Enterprise: 미정 (나중에 추가)

### Phase 2: 패키지 분리

1. **@hua-labs/ui (Core)**
   - 현재 `src/index.ts`의 Core 컴포넌트만 유지
   - 공개 패키지

2. **@hua-labs/ui-pro (Pro)**
   - `packages/hua-ui-pro` 새로 생성
   - `src/advanced.ts`의 모든 컴포넌트 이동
   - 유료 패키지

3. **@hua-labs/hua-ux (프레임워크)**
   - 일부 Pro 컴포넌트 re-export
   - 프레임워크 사용자에게 추가 가치 제공

4. **의존성 설정**
   ```json
   // @hua-labs/ui-pro/package.json
   {
     "dependencies": {
       "@hua-labs/ui": "workspace:*"  // Core 의존
     }
   }
   
   // @hua-labs/hua-ux/package.json
   {
     "dependencies": {
       "@hua-labs/ui": "workspace:*",      // Core 의존
       "@hua-labs/ui-pro": "workspace:*"  // Pro 의존 (일부 re-export용)
     }
   }
   ```

### Phase 3: Enterprise 준비 (미정)

- 필요 시 `@hua-labs/ui-enterprise` 패키지 추가
- 구조는 동일하게 유지

---

## 분류 기준 상세

### Core vs Pro 구분 기준

#### Core (공개)
- ✅ 범용적으로 사용 가능한 기본 UI 컴포넌트
- ✅ 특정 도메인에 종속되지 않음
- ✅ 프레임워크에서 직접 사용

#### Pro (유료)
- ✅ 고급/전문가용 기능
- ✅ 복잡한 비즈니스 로직 포함
- ✅ 특정 도메인 특화 (결제, 감정 분석 등)

### 프레임워크 Pro 기능 포함 기준

#### 포함 (일반용 Pro)
- ✅ 범용 대시보드 컴포넌트
- ✅ 일반 앱에서 사용 가능
- ✅ 프레임워크 사용자에게 가치 제공

#### 제외 (결제/정산 전용 Pro)
- ❌ 결제/정산 도메인 특화
- ❌ 특정 비즈니스 로직 포함
- ❌ Pro 패키지에서만 제공

---

## 사용자 경험

### Core만 사용 (공개)
```bash
pnpm add @hua-labs/ui
```
```tsx
import { Button, Card } from '@hua-labs/ui';
```

### 프레임워크 사용 (일부 Pro 포함)
```bash
pnpm add @hua-labs/hua-ux
```
```tsx
import { Button, Card } from '@hua-labs/hua-ux';
// 프레임워크에서 제공하는 Pro 기능
import { StatCard, DashboardGrid } from '@hua-labs/hua-ux';
```

### Pro 전체 사용 (유료)
```bash
pnpm add @hua-labs/ui-pro
```
```tsx
import { StatCard } from '@hua-labs/ui-pro';
import { TransactionsTable } from '@hua-labs/ui-pro';  // 결제 전용
```

---

## 트리쉐이킹 검증

### 번들 크기 예상

**Core만 사용:**
```tsx
import { Button, Card } from '@hua-labs/ui';
// 예상: ~50KB (Button, Card만 포함)
```

**프레임워크 사용 (일부 Pro 포함):**
```tsx
import { Button } from '@hua-labs/hua-ux';
import { StatCard } from '@hua-labs/hua-ux';
// 예상: ~50KB (Core) + ~30KB (일반용 Pro) = ~80KB
// 결제 전용 Pro는 포함 안 됨
```

**Pro 전체 사용:**
```tsx
import { Button } from '@hua-labs/ui';
import { StatCard } from '@hua-labs/ui-pro';
import { TransactionsTable } from '@hua-labs/ui-pro';
// 예상: ~50KB (Core) + ~100KB (Pro 전체) = ~150KB
```

---

## 다음 단계

1. ✅ `ComponentLayout` 중복 제거
2. ✅ Pro 컴포넌트 목록 확정
   - 일반용 Pro (프레임워크 포함)
   - 결제/정산 전용 Pro (Pro 전용)
3. ✅ `packages/hua-ui-pro` 패키지 생성
4. ✅ Core에서 Advanced 컴포넌트 제거
5. ✅ Pro 패키지에 Advanced 컴포넌트 이동
6. ✅ 프레임워크에서 일반용 Pro re-export
7. ✅ 의존성 설정
8. ✅ 트리쉐이킹 검증
9. ✅ 퍼블릭 레포에 복사
