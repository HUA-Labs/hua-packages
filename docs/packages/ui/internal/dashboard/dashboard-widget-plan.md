# 대시보드 컴포넌트 개발 계획 (Platform UI)

> 기준: `hua-platform/packages/hua-ui`  
> 작성일: 2025-11-24

## 1. 목표
- PaysByPays 등 PG 도메인 대시보드 요구사항을 UI 패키지 단계에서 해결 가능한 컴포넌트 세트로 정리.
- 사이드바, KPI, 거래 리스트, 알림, 정산 뷰 등을 재사용 가능한 카드/레이아웃/테이블로 추상화.
- Storybook 도입 전까지 README + docs 기반으로 상태(Loading/Empty/Error) 정의를 공유하며 TODO 명시.

## 2. 현재 자산 정리
| 구분 | 파일 | 상태 |
| --- | --- | --- |
| 통계 카드 | `dashboard/StatCard.tsx`, `MetricCard.tsx`, `SummaryCard.tsx` | ✅ Props/README + Empty 상태 반영 |
| 빠른 액션 | `dashboard/QuickActionCard.tsx` | ✅ Empty 상태 예시 추가 |
| 활동/알림 | `dashboard/ActivityFeed.tsx`, `NotificationCard.tsx` | ✅ EmptyState 연동 |
| 프로필/멤버십 | `dashboard/ProfileCard.tsx`, `MembershipBadge.tsx` | ✅ Empty 상태 예시 추가 |
| 미니 차트 | `dashboard/MiniBarChart.tsx`, `ProgressCard.tsx` | ✅ |
| 그리드 레이아웃 | `dashboard/DashboardGrid.tsx` | ✅ (브레이크포인트 가이드 추가 필요) |
| Empty State | `dashboard/EmptyState.tsx` | ⚠️ 개별 카드와 연계 작업 필요 |
| 데이터 테이블 | `Table.tsx` | ⚠️ 거래 리스트 프리셋 미정 |
| 툴바/필터 | 없음 | ❌ 신규 필요 |

## 3. 참고 소스 (my-api / my-app)
- **my-api (`apps/my-api/app/admin/page.tsx`)**
  - 7칸 퀵 액션 그리드, gradient KPI, AreaChart/BarChart/PieChart 섹션, 시스템 상태 카드, Top Users 리스트, 크레딧 분포 등 다양한 패턴 존재.
  - 필터 셀렉트, refresh 버튼, Recharts 조합 등을 UI 패키지로 추상화할 수 있음.
- **my-app (`apps/my-app/app/components/dashboard/*`)**
  - `StatsCard`, `QuickActions`, `RecentDiaries`, `dashboard/EmptyState` 등 경량 위젯이 레이아웃/타이포 참고용으로 유용.
  - 감정 분석/메트릭 카드(`hua-analysis/*`)는 MetricCard/TrendChart 확장 시 자료로 활용.

## 4. 신규/보강이 필요한 컴포넌트
1. **`TransactionsTable`**
   - `Table` 기반으로 상태/결제수단/가맹점/일시 열 프리셋 제공.
   - Props: `rows`, `isLoading`, `filters`, `emptyState`, `onRowClick`, `highlightRow`, `footer`.
   - Empty/Loading/Inline filter를 `DashboardEmptyState`, `SkeletonTable`과 연동.
2. **`DashboardToolbar`**
    - 날짜 범위, 검색, Quick action 버튼을 묶는 헤더 컴포넌트.
    - Props 초안:
      - `title`, `description`, `meta` (섹션 정보)
      - `dateRange`: { value, presets[], onChange }
      - `filters`: ReactNode (segment control, select 등)
      - `actions`: CTA 배열 (primary + secondary 버튼)
      - `onRefresh`, `lastUpdated` 상태 표기를 위한 슬롯
      - `variant`: “cards” | “plain” (배경 스타일)
3. **`DashboardSidebar`**
   - 좌측 폴딩 내비게이션 레일. `Navigation` + `Tooltip` + `ThemeToggle` 래핑.
   - Props 초안:
     - `logo`, `productSwitcher`, `sections[]`(label + items)
     - `isCollapsed`, `onToggle`, `collapsedWidth`, `expandedWidth`
     - `activeItem`, `onNavigate`
     - `footerActions` (테마 토글, 언어 스위치 등)
     - Breakpoint 옵션 (e.g., `mobileOverlay: boolean`)
4. **`DashboardEmptyState` 통합**
   - 기존 EmptyState 컴포넌트를 StatCard/ActivityFeed/NotificationCard 등에서 공통 슬롯으로 사용.
   - README 내 StatCard/QuickActionCard/SummaryCard/MetricCard/TransactionsTable 섹션에 Empty/Error 예시를 정리 완료.
5. **`TrendChart` preset**
   - Line/Area chart 프리셋 및 PG 도메인 색상맵 (승인/실패/대기) 제공.
   - Props 초안: `series[]`(label+data), `timeBuckets`, `statusPalette`, `showLegend`, `height`.
6. **`TransactionDetailDrawer`**
   - `TransactionsTable`와 연동되는 Drawer 패턴. 거래 요약/정산/수수료/이벤트 로그 슬롯 제공.
   - Props: `transaction`, `metadata[]`, `settlement`, `fees`, `events`, `actions`, `loading`.
7. **`SettlementTimeline`**
   - 정산 단계를 Stepper/Timeline 형태로 시각화. 상태(status)별 컬러, 금액/시간 메타 정보 표시.
   - Props: `items[]`, `highlightedId`, `locale`, `defaultCurrency`, `emptyState`.
8. **`RoutingBreakdownCard`**
   - PG/결제수단 비중을 시각화하는 카드. 스택 바 + 상세 리스트 + 상태 배지 제공.
   - Props: `segments[]`, `title`, `totalLabel/value`, `actions`, `formatter`.
9. **`MerchantList`**
   - 가맹점 검색/요약 카드 리스트. 건강 상태, 승인률, 거래 금액, 메타데이터 표시.
   - Props: `items[]`, `isLoading`, `filters`, `onSelect`, `emptyState`.

## 5. 작업 우선순위 & TODO
1. **핵심 컴포넌트**
   - [x] `TransactionsTable` 설계 & 구현
   - [x] `DashboardToolbar` 구현
   - [x] `DashboardSidebar` 폴딩 UX 구현 (README 상태 예시 포함)
   - [x] `DashboardEmptyState` 연동 가이드 작성 (README 상태 예시 수록)
2. **문서화**
   - [x] `dashboard/README.md`에 TransactionsTable/Toolbar 예시 추가
   - [x] `COMPONENT_STATUS_2025-11.md` 업데이트
   - [x] Storybook 도입 전 README/Docs 기반 상태 가이드 1차 확장
3. **테스트/데모**
   - [ ] TransactionsTable/Toolbar/Sidebar 상태별 예시 작성 (README + docs) — Sidebar는 추후 보강
   - [ ] Vitest/Jest 기반 스모크 테스트 도입
4. **배포 준비**
   - [ ] `tsup/rollup` 빌드 파이프라인 논의
   - [ ] React peerDependencies 정리 + Changeset 발행

## 6. 향후 연계
- Next.js 대시보드 과제에서는 npm 배포된 버전을 설치해 바로 구성.
- `docs/component-plan.md`(대시보드 프로젝트)와 본 계획을 주기적으로 동기화해 스펙/레이아웃 일관성 유지.
- Storybook 도입 시 본 문서의 TODO를 체크리스트로 활용.

## 7. 문서 기반 데모 전략
- Storybook 구축 전까지 `src/components/dashboard/README.md`를 단일 진실(Single Source)로 사용.
- 각 컴포넌트별로 **Loading / Empty / Error** 시나리오를 README에 추가하고, 필요한 경우 `/docs/screenshots` 폴더(추후 생성)에 캡처 이미지를 저장.
- 실제 과제 리포(`docs/component-plan.md`)와 동일한 상태 정의를 유지해 문서 간 참조가 가능하도록 함.
- 테스트 미도입 상태에서는 `docs/COMPONENT_STATUS_2025-11.md`에 체크리스트 형태로 품질 현황을 공유.

---
담당: Platform UI Guild  
문의: #hua-ui

