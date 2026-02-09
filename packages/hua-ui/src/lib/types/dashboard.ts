/**
 * HUA UI Dashboard 관련 타입 정의
 * StatCard, MetricCard, ProgressCard 등 대시보드 컴포넌트에서 사용하는 표준 타입들을 정의합니다.
 */

import type { ReactNode } from "react";
import type { Color } from "./common";

/**
 * 트렌드 방향 타입
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * 트렌드 정보 인터페이스
 */
export interface TrendInfo {
  /** 트렌드 방향 */
  direction: TrendDirection;
  /** 변화값 (퍼센트 또는 절대값) */
  value: number;
  /** 표시 레이블 (예: "vs last month") */
  label?: string;
  /** 퍼센트 표시 여부 */
  isPercentage?: boolean;
}

/**
 * 기본 Dashboard Card Props
 * StatCard, MetricCard 등에서 사용하는 공통 Props
 */
export interface BaseDashboardCardProps {
  /** 카드 제목 */
  title: string;
  /** 주요 값 */
  value: string | number;
  /** 아이콘 */
  icon?: ReactNode;
  /** 색상 테마 */
  color?: Color;
  /** 트렌드 정보 */
  trend?: TrendInfo;
  /** 설명 텍스트 */
  description?: string;
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * StatCard Props
 */
export interface StatCardProps extends BaseDashboardCardProps {
  /** 단위 (예: "원", "개", "%") */
  unit?: string;
  /** 포맷팅 함수 */
  formatter?: (value: number) => string;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

/**
 * MetricCard Props
 */
export interface MetricCardProps extends BaseDashboardCardProps {
  /** 목표값 */
  target?: number;
  /** 진행률 표시 여부 */
  showProgress?: boolean;
  /** 차트 데이터 (스파크라인) */
  sparklineData?: number[];
}

/**
 * ProgressCard Props
 */
export interface ProgressCardProps {
  /** 카드 제목 */
  title: string;
  /** 현재 값 */
  value: number;
  /** 최대 값 */
  max?: number;
  /** 색상 테마 */
  color?: Color;
  /** 레이블 표시 여부 */
  showLabel?: boolean;
  /** 퍼센트 표시 여부 */
  showPercentage?: boolean;
  /** 크기 */
  size?: "sm" | "md" | "lg";
  /** 스트라이프 애니메이션 */
  striped?: boolean;
  /** 애니메이션 */
  animated?: boolean;
}

/**
 * Activity 아이템 타입
 */
export interface ActivityItem {
  /** 고유 ID */
  id: string;
  /** 제목/내용 */
  title: string;
  /** 설명 */
  description?: string;
  /** 타임스탬프 */
  timestamp: Date | string;
  /** 아이콘 */
  icon?: ReactNode;
  /** 타입/카테고리 */
  type?: string;
  /** 사용자 정보 */
  user?: {
    name: string;
    avatar?: string;
  };
}

/**
 * ActivityFeed Props
 */
export interface ActivityFeedProps {
  /** 활동 목록 */
  items: ActivityItem[];
  /** 최대 표시 개수 */
  maxItems?: number;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 로딩 상태 */
  loading?: boolean;
  /** 더보기 핸들러 */
  onLoadMore?: () => void;
  /** 더보기 가능 여부 */
  hasMore?: boolean;
}

/**
 * Chart 데이터 포인트
 */
export interface ChartDataPoint {
  /** X축 값 (레이블) */
  x: string | number;
  /** Y축 값 */
  y: number;
  /** 레이블 */
  label?: string;
  /** 색상 */
  color?: string;
}

/**
 * 기본 Chart Props
 */
export interface BaseChartProps {
  /** 차트 데이터 */
  data: ChartDataPoint[];
  /** 차트 너비 */
  width?: number | string;
  /** 차트 높이 */
  height?: number | string;
  /** X축 레이블 */
  xAxisLabel?: string;
  /** Y축 레이블 */
  yAxisLabel?: string;
  /** 그리드 표시 */
  showGrid?: boolean;
  /** 툴팁 표시 */
  showTooltip?: boolean;
  /** 범례 표시 */
  showLegend?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 애니메이션 활성화 */
  animated?: boolean;
}

/**
 * BarChart Props
 */
export interface BarChartProps extends BaseChartProps {
  /** 막대 방향 */
  orientation?: "vertical" | "horizontal";
  /** 막대 간격 */
  barGap?: number;
  /** 막대 색상 */
  barColor?: string;
  /** 스택 여부 */
  stacked?: boolean;
}

/**
 * LineChart Props
 */
export interface LineChartProps extends BaseChartProps {
  /** 선 두께 */
  strokeWidth?: number;
  /** 곡선 여부 */
  curved?: boolean;
  /** 점 표시 */
  showDots?: boolean;
  /** 영역 채우기 */
  fill?: boolean;
}

/**
 * PieChart Props
 */
export interface PieChartProps {
  /** 차트 데이터 */
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  /** 도넛 차트 여부 */
  donut?: boolean;
  /** 내부 반지름 (도넛) */
  innerRadius?: number;
  /** 레이블 표시 */
  showLabels?: boolean;
  /** 퍼센트 표시 */
  showPercentage?: boolean;
  /** 범례 표시 */
  showLegend?: boolean;
  /** 범례 위치 */
  legendPosition?: "top" | "bottom" | "left" | "right";
}

/**
 * DashboardSidebar Props
 */
export interface DashboardSidebarProps {
  /** 네비게이션 아이템 목록 */
  items: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    href?: string;
    onClick?: () => void;
    children?: Array<{
      id: string;
      label: string;
      href?: string;
    }>;
  }>;
  /** 접힌 상태 */
  collapsed?: boolean;
  /** 접힌 상태 변경 핸들러 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 접힌 상태 너비 */
  collapsedWidth?: number;
  /** 펼친 상태 너비 */
  expandedWidth?: number;
  /** 현재 활성 아이템 ID */
  activeItemId?: string;
  /** 헤더 영역 */
  header?: ReactNode;
  /** 푸터 영역 */
  footer?: ReactNode;
}
