# @hua-labs/ui Full Component Guide

This document provides a technical specification of components in the HUA UI library, categorized by distribution tier.
HUA UI 라이브러리 컴포넌트의 배포 등급별 기술 명세를 제공합니다.

---

## English

### Distribution Strategy
HUA UI is structured to separate fundamental UI elements from specialized business logic components.
- **Core (Open Source)**: Fundamental UI and layout components available in the public distribution.
- **Advanced / Pro (Specialized)**: High-level widgets for dashboards and specific business domains (Payment, Analytics).
  - *Framework Benefit*: A selection of General-purpose Pro components is included in the `@hua-labs/hua-ux` framework as built-in value.
  - *Pro Exclusive*: Domain-specific components (Settlement, Payment Analysis) require a specialized Pro distribution.

---

### 1. Core Components (`@hua-labs/ui`)
Available in the standard public distribution.

#### Basic UI & Action
- **Button / Action**: Base interactive elements with support for various styles (neon, glass, etc.) and interaction effects.
- **Icon / Avatar**: Visual representation and user identity components.

#### Layout System
- **Container / Grid / Stack**: Layout managers for responsive spacing.
- **Card / Panel / Divider**: Structural containers for content grouping.

#### Form & Navigation
- **Input / Select / DatePicker**: Data entry components with accessibility integration.
- **Breadcrumb / Pagination / Tabs**: Hierarchical and sequential navigation tools.

#### Data Display & Feedback
- **Table / Badge / Progress / Skeleton**: Information visualization and loading state components.
- **Alert / Toast / Tooltip**: Contextual messaging and feedback systems.

---

### 2. Advanced / Pro Components (`@hua-labs/ui-pro`)
Specialized components for data-intensive applications.

#### General Dashboard Widgets (Included in Framework)
These are re-exported via `@hua-labs/hua-ux` for framework users.
- **StatCard / MetricCard**: Visual metrics with trend analysis.
- **QuickActionCard / ProfileCard**: Specialized layout for common dashboard actions.
- **MembershipBadge / NotificationCard**: User-centric data display widgets.
- **ActivityFeed / DashboardGrid**: Components for building integrated overview pages.

#### Business Domain Specific (Pro Exclusive)
Specialized for financial and operational management. Available via Pro distribution.
- **TransactionsTable / TransactionDetailDrawer**: Comprehensive financial data management.
- **SettlementTimeline / RoutingBreakdownCard**: Backend-heavy logic for payment processing.
- **MerchantList / TrendChart**: Enterprise-level data visualization and management.

---

## Korean

### 배포 전략
HUA UI는 기본 UI 요소와 특수 비즈니스 로직용 컴포넌트를 분리하여 효율적인 번들링과 라이선스 관리를 지원합니다.
- **Core (공개)**: 모든 환경에서 사용 가능한 기초 UI 및 레이아웃 컴포넌트입니다.
- **Advanced / Pro (특수)**: 대시보드 및 특정 도메인(결제, 분석 등) 전용 고기능 위젯입니다.
  - *프레임워크 혜택*: 범용 대시보드 컴포넌트 일부는 `@hua-labs/hua-ux` 프레임워크에 기본 내장되어 제공됩니다.
  - *Pro 전용*: 결제 정산, 데이터 분석 등 특화 도메인 컴포넌트는 별도의 Pro 배포본을 통해 제공됩니다.

---

### 1. 코어 컴포넌트 (Core)
표준 공개 배포본에 포함된 컴포넌트입니다.

#### 기초 UI 및 액션
- **Button / Action**: 네온, 유리 효과 등 다양한 스타일과 클릭 상호작용을 지원하는 버튼 요소입니다.
- **Icon / Avatar / Link**: 아이콘, 사용자 프로필, 링크 등 기본 시각 요소입니다.

#### 레이아웃 및 내비게이션
- **Container / Grid / Stack**: 정교한 간격 조절을 위한 레이아웃 관리자입니다.
- **Card / Panel**: 콘텐츠를 구조화하는 컨테이너입니다.
- **Breadcrumb / Tabs / Pagination**: 페이지 구조화 및 탐색 도구입니다.

#### 데이터 표시 및 피드백
- **Table / Badge / Progress / Skeleton**: 정보 시각화 및 로딩 상태 처리를 위한 컴포넌트입니다.
- **Alert / Toast / Tooltip**: 사용자에게 신호를 전달하는 피드백 시스템입니다.

---

### 2. 고급 / Pro 컴포넌트 (Pro)
데이터 중심 애플리케이션을 위한 특수 컴포넌트군입니다.

#### 범용 대시보드 위젯 (프레임워크 포함)
프레임워크 사용자의 개발 생산성을 위해 `@hua-labs/hua-ux`에서 기본 제공하는 프로 컴포넌트입니다.
- **StatCard / MetricCard**: 지표 및 추이 분석을 시각화합니다.
- **QuickActionCard / ProfileCard**: 대시보드에서 자주 쓰이는 레이아웃 프리셋입니다.
- **ActivityFeed / NotificationCard**: 활동 기록 및 알림 관리를 위한 위젯입니다.

#### 비즈니스 도메인 특화 (Pro 전용)
금융, 정산 및 전문 운영 도구를 위한 컴포넌트입니다.
- **TransactionsTable / SettlementTimeline**: 거래 데이터 및 정산 흐름 관리용 전문 컴포넌트입니다.
- **RoutingBreakdownCard / MerchantList**: 결제 라우팅 분석 및 가맹점 관리를 위한 엔터프라이즈급 기능을 제공합니다.
- **TrendChart / BarChart**: 비즈니스 데이터 시각화에 최적화된 차트 시스템입니다.
