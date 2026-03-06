# Dashboard Components

대시보드용 재사용 가능한 컴포넌트 모음입니다.

## 컴포넌트 목록

### StatCard
통계를 표시하는 카드 컴포넌트입니다.

**Props:**
- `title`: 카드 제목 (배지로 표시)
- `value`: 표시할 값 (숫자 또는 문자열)
- `description`: 설명 텍스트
- `icon`: 아이콘 (IconName 또는 ReactNode)
- `trend`: 트렌드 정보 (선택사항)
  - `value`: 변화율 (숫자)
  - `label`: 트렌드 라벨
  - `positive`: 긍정적 트렌드 여부 (기본값: true)
- `variant`: 스타일 변형 ("default" | "gradient" | "outline" | "elevated")
- `color`: 색상 테마 ("blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray")
- `loading`: 로딩 상태

**예시:**
```tsx
import { StatCard } from '@hua-labs/ui';

<StatCard
  title="총 사용자"
  value={1234}
  description="전체 사용자 수"
  icon="users"
  color="purple"
  variant="elevated"
  trend={{
    value: 12.5,
    label: "지난 달 대비",
    positive: true
  }}
/>
```

**Empty/Error 상태 예시**
```tsx
<StatCard
  title="거래 승인율"
  value="--"
  description="잠시 후 다시 시도해주세요"
  icon="alert-triangle"
  variant="outline"
/>

<DashboardEmptyState
  icon="database-backup"
  title="거래 데이터가 없습니다"
  description="필터를 조정하거나 날짜 범위를 변경해보세요."
  actionText="필터 초기화"
  actionOnClick={resetFilters}
/>
```

또는 `emptyState` prop으로 커스텀 UI를 전달할 수 있습니다.

### QuickActionCard
빠른 액션을 위한 카드 컴포넌트입니다.

**Props:**
- `title`: 카드 제목
- `description`: 설명 텍스트
- `icon`: 아이콘 (IconName 또는 ReactNode)
- `href`: 링크 URL (선택사항)
- `onClick`: 클릭 핸들러 (선택사항)
- `variant`: 스타일 변형 ("gradient" | "outline" | "solid")
- `color`: 색상 테마
- `loading`: 로딩 상태

**예시:**
```tsx
import { QuickActionCard } from '@hua-labs/ui';

<QuickActionCard
  title="일기 관리"
  description="전체 일기 보기"
  icon="fileText"
  href="/admin/diaries"
  color="purple"
  variant="gradient"
/>
```

**Empty/Error 상태 예시**
```tsx
<QuickActionCard
  title="새 결제 생성"
  description="권한이 없습니다. 관리자에게 문의하세요."
  icon="lock"
  variant="outline"
  disabled
/>

<DashboardEmptyState
  icon="key-square"
  title="실행 가능한 액션이 없습니다"
  description="연결된 PG가 없거나 계정 권한이 부족합니다."
  actionText="권한 요청"
  actionOnClick={openAccessModal}
  size="sm"
/>
```

### DashboardGrid
대시보드 그리드 레이아웃 컴포넌트입니다.

**Props:**
- `columns`: 열 개수 (1-6)
- `gap`: 간격 ("sm" | "md" | "lg" | "xl")
- `responsive`: 반응형 여부 (기본값: true)

**예시:**
```tsx
import { DashboardGrid, StatCard } from '@hua-labs/ui';

<DashboardGrid columns={4} gap="md">
  <StatCard title="사용자" value={100} icon="users" />
  <StatCard title="일기" value={500} icon="fileText" />
  <StatCard title="분석" value={300} icon="brain" />
  <StatCard title="비용" value="$50" icon="dollarSign" />
</DashboardGrid>
```

**Empty/Error 상태 예시**
```tsx
{widgets.length === 0 ? (
  <DashboardEmptyState
    icon="layout-dashboard"
    title="표시할 위젯이 없습니다"
    description="대시보드 편집 모드에서 필요한 카드를 추가하세요."
    actionText="위젯 추가"
    actionOnClick={openWidgetPicker}
  />
) : (
  <DashboardGrid columns={4} gap="md">
    {widgets.map((widget) => widget.render())}
  </DashboardGrid>
)}
```

### ActivityFeed
활동 피드를 표시하는 컴포넌트입니다.

**Props:**
- `title`: 피드 제목
- `items`: 활동 항목 배열
  - `id`: 고유 ID
  - `title`: 제목
  - `description`: 설명 (선택사항)
  - `timestamp`: 타임스탬프 (Date 또는 string)
  - `icon`: 아이콘 (선택사항)
  - `badge`: 배지 (선택사항)
  - `onClick`: 클릭 핸들러 (선택사항)
  - `metadata`: 메타데이터 객체 (선택사항)
- `emptyMessage`: 빈 상태 메시지
- `showHeader`: 헤더 표시 여부
- `maxItems`: 최대 표시 항목 수
- `onViewAll`: 전체 보기 핸들러
- `viewAllLabel`: 전체 보기 라벨

**예시:**
```tsx
import { ActivityFeed } from '@hua-labs/ui';

const activities = [
  {
    id: '1',
    title: '새 일기 작성',
    description: '사용자가 일기를 작성했습니다.',
    timestamp: new Date(),
    icon: 'fileText',
    badge: '분석됨',
    onClick: () => console.log('클릭'),
    metadata: {
      'Tier-A': '3.2',
      'Tier-M': '2.8'
    }
  }
];

<ActivityFeed
  title="최근 활동"
  items={activities}
  maxItems={5}
  onViewAll={() => router.push('/admin/activities')}
/>
```

**Empty/Error 상태 예시**
```tsx
<ActivityFeed
  title="최근 활동"
  items={[]}
  emptyState={
    <DashboardEmptyState
      icon="activity"
      title="최근 활동이 없습니다"
      description="사용자 행동이 기록되면 자동으로 업데이트됩니다."
      size="sm"
    />
  }
/>

<DashboardEmptyState
  icon="bell-off"
  title="알림이 없습니다"
  description="새로운 활동이 들어오면 여기에 표시됩니다."
  size="sm"
/>
```

### ProfileCard
사용자 프로필 정보를 표시하는 카드 컴포넌트입니다. 그라데이션 배경, 아바타, 멤버십 뱃지를 지원합니다.

**Props:**
- `name`: 사용자 이름
- `email`: 이메일 (선택사항)
- `avatar`: 아바타 이미지 URL (선택사항)
- `avatarAlt`: 아바타 대체 텍스트 (선택사항)
- `greeting`: 인사말 (선택사항)
- `memberSince`: 가입일 (Date 또는 string, 선택사항)
- `membershipTier`: 회원 등급 ("basic" | "pro" | "premium" | "admin", 선택사항)
- `membershipLabel`: 회원 등급 라벨 (선택사항)
- `onSettingsClick`: 설정 클릭 핸들러 (선택사항)
- `settingsHref`: 설정 링크 URL (선택사항)
- `variant`: 스타일 변형 ("default" | "gradient" | "minimal")
- `showAvatar`: 아바타 표시 여부 (기본값: true)
- `showMembership`: 멤버십 표시 여부 (기본값: true)
- `showSettings`: 설정 버튼 표시 여부 (기본값: true)

**예시:**
```tsx
import { ProfileCard } from '@hua-labs/ui';

<ProfileCard
  name="홍길동"
  email="hong@example.com"
  greeting="안녕하세요 👋"
  memberSince={new Date('2024-01-01')}
  membershipTier="premium"
  variant="gradient"
  settingsHref="/settings"
/>
```

**Empty/Error 상태 예시**
```tsx
<ProfileCard
  name="연결된 사용자가 없습니다"
  greeting="로그인이 만료되었습니다"
  showSettings={false}
  emptyState={
    <DashboardEmptyState
      icon="user-x"
      title="세션이 만료되었습니다"
      description="다시 로그인하면 계정 정보가 표시됩니다."
      actionText="다시 로그인"
      actionOnClick={redirectToLogin}
      size="sm"
    />
  }
/>
```

### MembershipBadge
회원 등급을 표시하는 뱃지 컴포넌트입니다.

**Props:**
- `tier`: 회원 등급 ("basic" | "pro" | "premium" | "admin")
- `label`: 커스텀 라벨 (선택사항)
- `size`: 크기 ("sm" | "md" | "lg", 기본값: "md")
- `showIcon`: 아이콘 표시 여부 (기본값: true)

**예시:**
```tsx
import { MembershipBadge } from '@hua-labs/ui';

<MembershipBadge tier="premium" size="md" />
```

### MiniBarChart
작은 막대 그래프 컴포넌트입니다. 최근 사용량 추이 등을 표시하는데 사용됩니다.

**Props:**
- `data`: 데이터 배열 (숫자)
- `labels`: 라벨 배열 (선택사항)
- `maxValue`: 최대값 (선택사항, 자동 계산됨)
- `height`: 그래프 높이 (기본값: 160)
- `showTooltip`: 툴팁 표시 여부 (기본값: true)
- `showStats`: 통계 표시 여부 (기본값: true)
- `color`: 색상 테마 ("blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink")
- `highlightToday`: 오늘 강조 여부 (기본값: true)
- `todayIndex`: 오늘 인덱스 (선택사항, 기본값: 마지막)

**예시:**
```tsx
import { MiniBarChart } from '@hua-labs/ui';

<MiniBarChart
  data={[10, 20, 15, 25, 30, 20, 35]}
  labels={['일', '월', '화', '수', '목', '금', '토']}
  color="purple"
  highlightToday={true}
/>
```

### SummaryCard
요약 정보를 표시하는 카드 컴포넌트입니다. 크레딧, API 키, 사용량 등을 표시하는데 적합합니다.

**Props:**
- `title`: 카드 제목
- `value`: 값 (숫자 또는 문자열)
- `subtitle`: 부제목 (선택사항)
- `icon`: 아이콘 (IconName 또는 ReactNode, 선택사항)
- `color`: 색상 테마 ("blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray")
- `variant`: 스타일 변형 ("default" | "gradient" | "outline")
- `href`: 링크 URL (선택사항)
- `onClick`: 클릭 핸들러 (선택사항)
- `loading`: 로딩 상태
- `badge`: 배지 (선택사항)
- `footer`: 푸터 컨텐츠 (선택사항)
- `showAction`: 액션 버튼 표시 여부 (기본값: true)
- `actionLabel`: 액션 버튼 라벨 (기본값: "자세히 보기")

**예시:**
```tsx
import { SummaryCard } from '@hua-labs/ui';

<SummaryCard
  title="크레딧 잔액"
  value={1000}
  subtitle="SUM 크레딧"
  icon="dollarSign"
  color="blue"
  href="/credits"
  badge="실시간"
/>
```

**Empty/Error 상태 예시**
```tsx
<SummaryCard
  title="정산 잔액"
  value="--"
  subtitle="정산 계정을 연결해주세요"
  icon="wallet"
  variant="outline"
  showAction={false}
  emptyState={
    <DashboardEmptyState
      icon="wallet"
      title="정산 계정이 없습니다"
      description="PG 계정을 연결하면 정산 잔액이 표시됩니다."
      actionText="계정 연결"
      actionOnClick={openSettlementModal}
      size="sm"
    />
  }
/>
```

### NotificationCard
알림 및 공지사항을 표시하는 카드 컴포넌트입니다.

**Props:**
- `title`: 카드 제목 (기본값: "알림 및 공지")
- `items`: 알림 항목 배열
  - `id`: 고유 ID
  - `title`: 제목
  - `message`: 메시지
  - `timestamp`: 타임스탬프 (Date 또는 string)
  - `type`: 타입 ("info" | "warning" | "error" | "success", 선택사항)
  - `icon`: 아이콘 (선택사항)
  - `onClick`: 클릭 핸들러 (선택사항)
  - `href`: 링크 URL (선택사항)
- `emptyMessage`: 빈 상태 메시지 (기본값: "알림이 없습니다.")
- `maxItems`: 최대 표시 항목 수 (선택사항)
- `onViewAll`: 전체 보기 핸들러 (선택사항)
- `viewAllLabel`: 전체 보기 라벨 (기본값: "모든 알림 보기")
- `showHeader`: 헤더 표시 여부 (기본값: true)
- `showCount`: 개수 표시 여부 (기본값: true)

**예시:**
```tsx
import { NotificationCard } from '@hua-labs/ui';

const notifications = [
  {
    id: '1',
    title: '시스템 업데이트 완료',
    message: '새로운 기능이 추가되었습니다.',
    timestamp: new Date(),
    type: 'info',
    href: '/updates'
  }
];

<NotificationCard
  title="알림 및 공지"
  items={notifications}
  maxItems={5}
  onViewAll={() => router.push('/notifications')}
/>
```

**Empty 상태 예시**
```tsx
<NotificationCard
  title="알림 및 공지"
  items={[]}
  emptyState={
    <DashboardEmptyState
      icon="inbox"
      title="알림이 없습니다"
      description="시스템 공지가 올라오면 여기에 표시됩니다."
      size="sm"
    />
  }
/>
```

### MetricCard
차트와 트렌드를 포함한 정교한 통계 카드 컴포넌트입니다.

**Props:**
- `title`: 카드 제목
- `value`: 값 (숫자 또는 문자열)
- `description`: 설명 (선택사항)
- `icon`: 아이콘 (IconName 또는 ReactNode, 선택사항)
- `trend`: 트렌드 정보 (선택사항)
  - `value`: 변화율 (숫자)
  - `label`: 트렌드 라벨
  - `positive`: 긍정적 트렌드 여부 (기본값: true)
- `chartData`: 차트 데이터 배열 (선택사항)
- `chartLabels`: 차트 라벨 배열 (선택사항)
- `variant`: 스타일 변형 ("default" | "gradient" | "outline" | "elevated")
- `color`: 색상 테마 ("blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray")
- `loading`: 로딩 상태
- `showChart`: 차트 표시 여부 (기본값: false)

**예시:**
```tsx
import { MetricCard } from '@hua-labs/ui';

<MetricCard
  title="API 사용량"
  value={1234}
  description="이번 달 요청 수"
  icon="barChart"
  color="purple"
  variant="elevated"
  showChart={true}
  chartData={[10, 20, 15, 25, 30, 20, 35]}
  chartLabels={['일', '월', '화', '수', '목', '금', '토']}
  trend={{
    value: 12.5,
    label: "지난 달 대비",
    positive: true
  }}
/>
```

**Empty/Error 상태 예시**
```tsx
<MetricCard
  title="승인 추이"
  value="데이터 없음"
  description="원천 시스템 응답을 기다리고 있습니다"
  icon="refresh"
  loading
/>

<MetricCard
  title="실패 비율"
  value="--"
  description="데이터를 받아올 수 없습니다"
  icon="alert-triangle"
  variant="outline"
  emptyState={
    <DashboardEmptyState
      icon="server-off"
      title="데이터를 불러오지 못했습니다"
      description="잠시 후 다시 시도하거나 API 키를 확인하세요."
      actionText="다시 시도"
      actionOnClick={retryFetch}
      size="sm"
    />
  }
/>
```

### TransactionsTable
결제/거래 데이터를 위한 테이블 프리셋입니다.

**Props:**
- `rows`: `TransactionRow[]`
- `columns`: 커스텀 컬럼 설정 (선택)
- `isLoading`: 로딩 상태
- `filters`: 필터/툴바 슬롯
- `emptyState`: 빈 상태 대체 UI
- `onRowClick`: 행 클릭 핸들러
- `highlightRow`: 특정 행 강조 함수
- `statusLabels`: 상태 라벨 커스터마이징
- `statusRenderer`: 상태 렌더러 override
- `amountFormatter`, `methodFormatter`, `dateFormatter`: 각 셀 포맷터
- `locale`, `defaultCurrency`: 포맷 기본값
- `footer`: 테이블 하단 영역 (페이지네이션 등)

**예시:**
```tsx
import { TransactionsTable, type TransactionRow } from '@hua-labs/ui';

const rows: TransactionRow[] = [
  {
    id: 'TXN-230011',
    merchant: 'HUA Coffee',
    amount: 125000,
    currency: 'KRW',
    status: 'approved',
    method: '카드 (VISA)',
    date: new Date(),
    customer: '김민수',
    fee: 3500,
  },
];

<TransactionsTable
  rows={rows}
  footer={<div className="flex justify-between text-sm">1-10 / 312건</div>}
  onRowClick={(row) => console.log(row)}
/>;
```

### TransactionDetailDrawer
거래 행 클릭 시 세부 정보를 Drawer로 노출하는 프리셋입니다. 결제/정산/이벤트 로그를 묶어 한 화면에서 확인할 수 있습니다.

**Props:**
- `open`, `onClose`: Drawer 제어
- `transaction`: `{ id, status, amount, currency, merchant, method, createdAt, customer }`
- `metadata`: `{ label, value, icon? }[]`
- `settlement`: `{ status, amount, scheduledDate, bankAccount, note }`
- `fees`: 수수료 배열
- `events`: 타임라인 로그
- `actions`: Footer slot

**예시:**
```tsx
import { useState } from 'react';
import { TransactionDetailDrawer, TransactionsTable, type TransactionRow } from '@hua-labs/ui';

export default function TransactionsPage() {
  const [selected, setSelected] = useState<TransactionRow | null>(null);

  return (
    <>
      <TransactionsTable
        rows={rows}
        onRowClick={(row) => setSelected(row)}
      />
      <TransactionDetailDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        transaction={{
          id: selected?.id ?? '',
          status: selected?.status ?? 'pending',
          amount: selected?.amount ?? 0,
          currency: selected?.currency,
          merchant: selected?.merchant,
          method: selected?.method,
          createdAt: selected?.date,
          customer: selected?.customer,
        }}
        metadata={[
          { label: "고객", value: selected?.customer ?? "-", icon: "user" },
          { label: "결제 수단", value: selected?.method ?? "-", icon: "credit-card" },
        ]}
        settlement={{
          status: "processing",
          amount: selected?.amount,
          scheduledDate: new Date(),
          bankAccount: "Pays Bank ••2248",
        }}
        events={[
          {
            id: "auth",
            title: "승인 요청",
            description: "PG-KR 라인에서 승인 처리",
            timestamp: selected?.date ?? new Date(),
            status: "success",
            icon: "shield-check",
          },
        ]}
        actions={
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            이메일 영수증 전송
          </button>
        }
      />
    </>
  );
}
```

### SettlementTimeline
정산 단계를 세로 타임라인 형태로 표시하는 컴포넌트입니다. `pending / processing / completed / failed` 상태를 색상으로 보여주며, 금액/일시/메모를 함께 노출할 수 있습니다.

**Props:**
- `items`: `{ id, title, description?, status, amount?, currency?, date?, meta? }[]`
- `highlightedId`: 강조할 단계 ID
- `locale`, `defaultCurrency`
- `emptyState`

**예시:**
```tsx
import { SettlementTimeline } from '@hua-labs/ui';

const settlementSteps = [
  {
    id: "request",
    title: "정산 요청",
    status: "completed",
    amount: 4200000,
    date: "2025-11-20T09:00:00Z",
    description: "PG-KR 라인에서 정산 요청 생성",
  },
  {
    id: "processing",
    title: "은행 처리",
    status: "processing",
    meta: "Pays Bank ••2248",
    date: "2025-11-21T09:00:00Z",
  },
  {
    id: "payout",
    title: "지급 예정",
    status: "pending",
    description: "서류 검토 중",
  },
];

<SettlementTimeline items={settlementSteps} highlightedId="processing" />;
```

### RoutingBreakdownCard
PG 라우팅/결제수단 비중을 시각화하는 카드입니다. 상단에는 스택 바(bar)를, 하단에는 상세 리스트와 상태 배지를 제공합니다.

**Props:**
- `segments`: `{ id, label, value, color?, status?, detail? }[]`
- `title`, `description`, `totalLabel`, `totalValue`
- `highlightId`, `actions`, `formatter`
- `emptyState`

**예시:**
```tsx
import { RoutingBreakdownCard } from '@hua-labs/ui';

const routing = [
  { id: "visa", label: "VISA (PG-A)", value: 420, status: "normal" },
  { id: "master", label: "MASTER (PG-A)", value: 210, status: "warning", detail: "승인율 92%" },
  { id: "payco", label: "PAYCO (PG-B)", value: 120, status: "critical", detail: "장애 조치 중" },
];

<RoutingBreakdownCard
  segments={routing}
  totalLabel="총 거래"
  totalValue="750건"
  highlightId="payco"
  actions={<button className="text-xs text-blue-600">라우팅 정책 관리</button>}
/>;
```

### MerchantList
가맹점 검색/요약을 카드 형태로 표시하는 프리셋입니다. 건강 상태(Health), 승인률, 거래금액 등을 함께 보여주고 클릭 시 세부 Drawer와 연동할 수 있습니다.

**Props:**
- `items`: `{ id, name, status?, health?, approvalRate?, volume?, currency?, category?, region?, metadata[] }[]`
- `isLoading`, `filters`, `emptyState`
- `onMerchantSelect`: 가맹점 클릭 핸들러

**예시:**
```tsx
import { MerchantList } from '@hua-labs/ui';

const merchants = [
  {
    id: "m-1001",
    name: "HUA Coffee",
    status: "Sandbox",
    health: "normal",
    approvalRate: 98.2,
    volume: 42000000,
    category: "F&B",
    region: "Seoul, KR",
    metadata: [
      { label: "대표자", value: "김민수" },
      { label: "최근 접속", value: "2분 전" },
    ],
  },
  {
    id: "m-1002",
    name: "Lumos Market",
    status: "Live",
    health: "warning",
    approvalRate: 92.4,
    volume: 18000000,
    tag: "서류 검토",
  },
];

<MerchantList
  items={merchants}
  filters={<div className="text-xs text-slate-500">검색/필터 UI</div>}
  onMerchantSelect={(merchant) => console.log(merchant)}
/>;
```

**Empty/Error 상태 예시**
```tsx
<TransactionsTable
  rows={[]}
  filters={<DashboardToolbar title="거래 내역" />}
  emptyState={
    <DashboardEmptyState
      icon="credit-card-off"
      title="거래가 없습니다"
      description="날짜 범위를 확장하거나 필터를 초기화해보세요."
      actionText="필터 초기화"
      actionOnClick={resetFilters}
    />
  }
/>

<TransactionsTable
  rows={[]}
  isLoading
  emptyState={
    <DashboardEmptyState
      icon="loader"
      title="거래 데이터를 불러오는 중입니다"
      description="잠시만 기다려주세요"
      size="sm"
    />
  }
/>
```

### DashboardToolbar
대시보드 상단 컨트롤 헤더입니다.

**Props:**
- `title`, `description`, `meta`
- `variant`: "cards" | "plain"
- `dateRange`: `{ value, presets[], onSelectPreset, onCustomRange, display }`
- `filters`: ReactNode
- `actions`: CTA 배열 (`ToolbarAction`)
- `onRefresh`, `lastUpdated`

**예시:**
```tsx
import { DashboardToolbar } from '@hua-labs/ui';

const presets = [
  { label: "오늘", value: "today" },
  { label: "지난 7일", value: "7d" },
  { label: "지난 30일", value: "30d" },
];

<DashboardToolbar
  title="거래 현황"
  description="PG 라우팅, 결제 수단별 데이터를 요약합니다."
  dateRange={{
    presets,
    display: "지난 7일",
    onSelectPreset: (preset) => console.log(preset),
  }}
  filters={<div className="flex gap-2 text-sm">승인률 97.2% · 환불 12건</div>}
  actions={[
    { label: "보고서 다운로드", icon: "download", appearance: "secondary" },
    { label: "새 거래 추가", icon: "plus", appearance: "primary" },
  ]}
  onRefresh={() => console.log("refresh")}
  lastUpdated="5분 전"
/>;
```

### TrendChart
승인/실패/대기 등 시계열 데이터를 시각화하는 라인/에어리어 차트 프리셋입니다. `categories`가 1개 이하이더라도 자동으로 좌표를 보정하며, `series.data` 길이가 다르면 마지막 카테고리 라벨을 사용합니다.

**Props:**
- `series`: `{ label, data[], color?, area? }[]`
- `categories`: x축 라벨 배열
- `palette`: `"approval" | "settlement" | "custom"`
- `height`, `showLegend`, `showDots`, `showTooltip`

**예시:**
```tsx
import { TrendChart } from '@hua-labs/ui';

const series = [
  { label: "승인", data: [82, 84, 86, 85, 88, 90], area: true },
  { label: "실패", data: [12, 10, 9, 11, 8, 7] },
  { label: "대기", data: [6, 6, 5, 4, 4, 3] },
];

<TrendChart
  series={series}
  categories={["월", "화", "수", "목", "금", "토"]}
  palette="approval"
  height={220}
  showTooltip
/>;
```

### DashboardSidebar
좌측 폴딩 가능한 내비게이션 레일입니다.

**Props:**
- `logo`, `productSwitcher`, `sections`
- `isCollapsed`, `defaultCollapsed`, `onToggleCollapsed`
- `collapsedWidth`, `expandedWidth`
- `footerActions`, `mobileBreakpoint`

**예시:**
```tsx
import { DashboardSidebar } from '@hua-labs/ui';

const sections = [
  {
    id: 'main',
    label: '개요',
    items: [
      { id: 'overview', label: '대시보드', icon: 'layout-dashboard', active: true },
      { id: 'transactions', label: '거래 내역', icon: 'credit-card' },
      { id: 'settlements', label: '정산 현황', icon: 'wallet' },
    ],
  },
  {
    id: 'system',
    label: '시스템',
    items: [
      { id: 'alerts', label: '알림 센터', icon: 'bell' },
      { id: 'settings', label: '설정', icon: 'settings' },
    ],
  },
];

<DashboardSidebar
  logo={<div className="text-xl font-bold">Pays</div>}
  productSwitcher={<button className="text-sm text-slate-500">Sandbox</button>}
  sections={sections}
  footerActions={
    <div className="flex flex-col gap-2">
      <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm">테마 전환</button>
      <button className="rounded-lg bg-slate-100 px-3 py-2 text-sm">언어 설정</button>
    </div>
  }
/>;
```

**상태 가이드**
- **Collapsed**: `isCollapsed` 또는 `defaultCollapsed`로 제어, 아이콘만 표시되며 Tooltip으로 라벨 보조.
- **Expanded**: `expandedWidth` 범위에서 텍스트/배지가 노출, 제품 스위처/메타 정보 포함.
- **Mobile (< `mobileBreakpoint`)**: 추후 Drawer에 올리는 방식으로 확장 예정(현재는 width transition만 정의).
- **Active Item**: `item.active` true 시 강조; `onClick` 이벤트로 라우팅 처리.
- **Footer Actions**: 테마/언어 토글 등 추가 컨트롤 슬롯.
- **Link Items**: `item.href`를 지정하면 자동으로 `<a>` 앵커로 렌더링되어 새 탭 열기 등의 브라우저 기본 동작을 사용할 수 있습니다.

```tsx
import { DashboardSidebar } from '@hua-labs/ui';
import { useState } from 'react';

const sections = [
  {
    id: 'system',
    label: '시스템',
    items: [
      { id: 'overview', label: '대시보드', icon: 'layout-dashboard', active: true },
      { id: 'alerts', label: '알림 센터', icon: 'bell' },
    ],
  },
];

export function SidebarExample() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex">
      <DashboardSidebar
        sections={sections}
        isCollapsed={collapsed}
        onToggleCollapsed={setCollapsed}
        collapsedWidth={72}
        expandedWidth={256}
        mobileBreakpoint={768}
        overlayBackground="bg-slate-950/60"
        footerActions={
          <button className="rounded-md bg-slate-100 px-3 py-2 text-sm w-full">
            로그아웃
          </button>
        }
      />

      <main className="flex-1 p-6">
        <button
          className="rounded-md border px-3 py-2 text-sm"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          {collapsed ? '확장' : '접기'}
        </button>
        <p className="mt-4 text-sm text-slate-500">
          모바일 폭(768px 이하)에서는 Sidebar가 자동으로 overlay 모드로 전환됩니다.
        </p>
      </main>
    </div>
  );
}
```

## 전체 예시

### 기본 대시보드
```tsx
import {
  StatCard,
  QuickActionCard,
  DashboardGrid,
  ActivityFeed
} from '@hua-labs/ui';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container mx-auto px-4">
        {/* 통계 카드들 */}
        <DashboardGrid columns={4} gap="md" style={{ marginBottom: "2rem" }}>
          <StatCard
            title="총 사용자"
            value={1234}
            description="전체 사용자 수"
            icon="users"
            color="purple"
            variant="elevated"
          />
          <StatCard
            title="총 일기"
            value={5678}
            description="전체 일기 수"
            icon="fileText"
            color="blue"
            variant="elevated"
          />
          <StatCard
            title="오늘 분석"
            value={123}
            description="오늘 분석 건수"
            icon="brain"
            color="green"
            variant="elevated"
            trend={{
              value: 5.2,
              label: "어제 대비",
              positive: true
            }}
          />
          <StatCard
            title="총 비용"
            value="$1,234"
            description="123,456 토큰"
            icon="dollarSign"
            color="orange"
            variant="elevated"
          />
        </DashboardGrid>

        {/* 빠른 액션 */}
        <DashboardGrid columns={3} gap="md" style={{ marginBottom: "2rem" }}>
          <QuickActionCard
            title="일기 관리"
            description="전체 일기 보기"
            icon="fileText"
            href="/admin/diaries"
            color="purple"
          />
          <QuickActionCard
            title="사용자 관리"
            description="사용자 정보 확인"
            icon="users"
            href="/admin/users"
            color="blue"
          />
          <QuickActionCard
            title="분석 통계"
            description="상세 데이터 분석"
            icon="barChart"
            href="/admin/analytics"
            color="green"
          />
        </DashboardGrid>

        {/* 활동 피드 */}
        <ActivityFeed
          title="최근 활동"
          items={activities}
          maxItems={5}
          onViewAll={() => router.push('/admin/activities')}
        />
      </div>
    </div>
  );
}
```

### 고급 대시보드 (새 컴포넌트 활용)
```tsx
import {
  ProfileCard,
  SummaryCard,
  MetricCard,
  NotificationCard,
  MiniBarChart,
  DashboardGrid,
  MembershipBadge
} from '@hua-labs/ui';

export default function AdvancedDashboard() {
  const apiUsageData = [10, 20, 15, 25, 30, 20, 35];
  const apiUsageLabels = ['일', '월', '화', '수', '목', '금', '토'];

  const notifications = [
    {
      id: '1',
      title: '시스템 업데이트 완료',
      message: '새로운 기능이 추가되었습니다.',
      timestamp: new Date(),
      type: 'info' as const,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 프로필 카드 */}
        <ProfileCard
          name="홍길동"
          email="hong@example.com"
          greeting="안녕하세요 👋"
          memberSince={new Date('2024-01-01')}
          membershipTier="premium"
          variant="gradient"
          settingsHref="/settings"
          className="mb-8"
        />

        {/* 요약 카드들 */}
        <DashboardGrid columns={3} gap="md" style={{ marginBottom: "2rem" }}>
          <SummaryCard
            title="크레딧 잔액"
            value={1000}
            subtitle="SUM 크레딧"
            icon="dollarSign"
            color="blue"
            href="/credits"
            badge="실시간"
          />
          <SummaryCard
            title="API 키 관리"
            value={3}
            subtitle="활성 API 키"
            icon="key"
            color="green"
            href="/api-key"
          />
          <SummaryCard
            title="API 사용량"
            value={1234}
            subtitle="이번 달 요청 수"
            icon="barChart"
            color="purple"
            href="/usage"
            badge="이번 달"
          />
        </DashboardGrid>

        {/* 메트릭 카드와 알림 */}
        <DashboardGrid columns={2} gap="md" style={{ marginBottom: "2rem" }}>
          <MetricCard
            title="API 사용량 추이"
            value={1234}
            description="최근 7일 사용량"
            icon="barChart"
            color="purple"
            variant="elevated"
            showChart={true}
            chartData={apiUsageData}
            chartLabels={apiUsageLabels}
            trend={{
              value: 12.5,
              label: "지난 주 대비",
              positive: true
            }}
          />
          <NotificationCard
            title="알림 및 공지"
            items={notifications}
            maxItems={5}
            onViewAll={() => router.push('/notifications')}
          />
        </DashboardGrid>
      </div>
    </div>
  );
}
```

## 스타일 커스터마이징

모든 컴포넌트는 `className` prop을 통해 추가 스타일을 적용할 수 있습니다.

```tsx
<StatCard
  title="사용자"
  value={100}
  className="custom-class"
/>
```

## 접근성

모든 컴포넌트는 접근성을 고려하여 설계되었습니다:
- 적절한 시맨틱 HTML 사용
- 키보드 네비게이션 지원
- 스크린 리더 호환성

## 다크 모드

모든 컴포넌트는 다크 모드를 지원합니다. Tailwind의 `dark:` 클래스를 사용하여 자동으로 다크 모드 스타일이 적용됩니다.

