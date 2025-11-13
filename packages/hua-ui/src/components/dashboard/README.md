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
        <DashboardGrid columns={4} gap="md" className="mb-8">
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
        <DashboardGrid columns={3} gap="md" className="mb-8">
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
        <DashboardGrid columns={3} gap="md" className="mb-8">
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
        <DashboardGrid columns={2} gap="md" className="mb-8">
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

