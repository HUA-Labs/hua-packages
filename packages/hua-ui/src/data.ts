/**
 * Data Display Components Entrypoint
 *
 * 데이터 표시 관련 합성 컴포넌트의 엔트리 포인트입니다.
 * 테이블, 코드블록 등 다중 파트 컴포넌트를 포함합니다.
 *
 * Entry point for data display composite components.
 * Includes multi-part components like Table, CodeBlock.
 *
 * @example
 * import { Table, TableHeader, TableBody, TableRow, TableCell } from '@hua-labs/ui/data';
 * import { CodeBlock, InlineCode } from '@hua-labs/ui/data';
 *
 * Note: Badge, Progress, Skeleton remain in core (@hua-labs/ui)
 * as they are atomic, single-purpose components.
 */

// Table
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./components/Table";

// Code Display
export { CodeBlock, InlineCode } from "./components/CodeBlock";
export type { CodeBlockProps } from "./components/CodeBlock";

// ─── Charts ───
export { BarChart } from "./components/dashboard/BarChart";
export type { BarChartProps } from "./components/dashboard/BarChart";
export { MiniBarChart } from "./components/dashboard/MiniBarChart";
export type { MiniBarChartProps } from "./components/dashboard/MiniBarChart";
export { TrendChart } from "./components/dashboard/TrendChart";
export type {
  TrendChartProps,
  TrendSeries,
} from "./components/dashboard/TrendChart";
export { YearlyHeatmap } from "./components/dashboard/YearlyHeatmap";
export type {
  YearlyHeatmapProps,
  YearlyHeatmapLabels,
} from "./components/dashboard/YearlyHeatmap";

// ─── Stat Cards ───
export { StatCard } from "./components/dashboard/StatCard";
export type { StatCardProps } from "./components/dashboard/StatCard";
export { MetricCard } from "./components/dashboard/MetricCard";
export type { MetricCardProps } from "./components/dashboard/MetricCard";
export { SummaryCard } from "./components/dashboard/SummaryCard";
export type { SummaryCardProps } from "./components/dashboard/SummaryCard";
export { ProgressCard } from "./components/dashboard/ProgressCard";
export type { ProgressCardProps } from "./components/dashboard/ProgressCard";
export { QuickActionCard } from "./components/dashboard/QuickActionCard";
export type { QuickActionCardProps } from "./components/dashboard/QuickActionCard";

// ─── Feed & Profile ───
export { ActivityFeed } from "./components/dashboard/ActivityFeed";
export type {
  ActivityFeedProps,
  ActivityItem,
} from "./components/dashboard/ActivityFeed";
export { NotificationCard } from "./components/dashboard/NotificationCard";
export type {
  NotificationCardProps,
  NotificationItem,
} from "./components/dashboard/NotificationCard";
export { ProfileCard } from "./components/dashboard/ProfileCard";
export type {
  ProfileCardProps,
  MembershipTier,
} from "./components/dashboard/ProfileCard";
export { MembershipBadge } from "./components/dashboard/MembershipBadge";
export type { MembershipBadgeProps } from "./components/dashboard/MembershipBadge";

// ─── Data Tables & Lists (renamed from PG-specific) ───
export { TransactionsTable as DataTable } from "./components/dashboard/TransactionsTable";
export type {
  TransactionsTableProps as DataTableProps,
  TransactionRow,
  TransactionColumnConfig,
  TransactionColumnKey,
  TransactionStatus,
} from "./components/dashboard/TransactionsTable";
export { RoutingBreakdownCard as BreakdownCard } from "./components/dashboard/RoutingBreakdownCard";
export type {
  RoutingBreakdownCardProps as BreakdownCardProps,
  RoutingBreakdownSegment as BreakdownSegment,
} from "./components/dashboard/RoutingBreakdownCard";
export { MerchantList as EntityList } from "./components/dashboard/MerchantList";
export type {
  MerchantListProps as EntityListProps,
  MerchantListItem as EntityListItem,
  MerchantHealth as EntityHealth,
} from "./components/dashboard/MerchantList";
export { SettlementTimeline } from "./components/dashboard/SettlementTimeline";
export type {
  SettlementTimelineProps,
  SettlementTimelineItem,
  SettlementTimelineStatus,
} from "./components/dashboard/SettlementTimeline";
export { TransactionDetailDrawer as DetailDrawer } from "./components/dashboard/TransactionDetailDrawer";
export type {
  TransactionDetailDrawerProps as DetailDrawerProps,
  TransactionDetail,
  TransactionMetadataItem,
  SettlementInfo,
  FeeBreakdown,
  TransactionEvent,
} from "./components/dashboard/TransactionDetailDrawer";

// ─── Grid Layout ───
export { DashboardGrid } from "./components/dashboard/DashboardGrid";
export type { DashboardGridProps } from "./components/dashboard/DashboardGrid";

// ─── Stats (from advanced/dashboard) ───
export { StatsPanel } from "./components/StatsPanel";
export type { StatsPanelProps, StatsPanelItem } from "./components/StatsPanel";
export { SectionHeader } from "./components/SectionHeader";
export type { SectionHeaderProps } from "./components/SectionHeader";
