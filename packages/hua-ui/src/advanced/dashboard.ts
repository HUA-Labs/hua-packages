/**
 * @deprecated Use specific subpath imports instead:
 * - Charts, Cards, Tables, Lists: `@hua-labs/ui/data`
 * - EmptyState: `@hua-labs/ui/feedback`
 * - Sidebar: `@hua-labs/ui/navigation`
 * - Toolbar: `@hua-labs/ui/interactive`
 * - Kanban: `@hua-labs/ui/interactive/kanban`
 */

// ─── All dashboard components (backward compat) ───
export * from "../components/dashboard";
export type * from "../components/dashboard";

// ─── New generic aliases (value + type) ───
export { DashboardEmptyState as EmptyState } from "../components/dashboard/EmptyState";
export type { DashboardEmptyStateProps as EmptyStateProps } from "../components/dashboard/EmptyState";
export { DashboardToolbar as Toolbar } from "../components/dashboard/DashboardToolbar";
export type { DashboardToolbarProps as ToolbarProps } from "../components/dashboard/DashboardToolbar";
export { DashboardSidebar as Sidebar } from "../components/dashboard/DashboardSidebar";
export type { DashboardSidebarProps as SidebarProps } from "../components/dashboard/DashboardSidebar";
export { TransactionsTable as DataTable } from "../components/dashboard/TransactionsTable";
export type { TransactionsTableProps as DataTableProps } from "../components/dashboard/TransactionsTable";
export { TransactionDetailDrawer as DetailDrawer } from "../components/dashboard/TransactionDetailDrawer";
export type { TransactionDetailDrawerProps as DetailDrawerProps } from "../components/dashboard/TransactionDetailDrawer";
export { RoutingBreakdownCard as BreakdownCard } from "../components/dashboard/RoutingBreakdownCard";
export type { RoutingBreakdownCardProps as BreakdownCardProps } from "../components/dashboard/RoutingBreakdownCard";
export { MerchantList as EntityList } from "../components/dashboard/MerchantList";
export type { MerchantListProps as EntityListProps } from "../components/dashboard/MerchantList";

// Dashboard-related components
export { StatsPanel } from "../components/StatsPanel";
export type { StatsPanelProps, StatsPanelItem } from "../components/StatsPanel";
export { SectionHeader } from "../components/SectionHeader";
export type { SectionHeaderProps } from "../components/SectionHeader";
