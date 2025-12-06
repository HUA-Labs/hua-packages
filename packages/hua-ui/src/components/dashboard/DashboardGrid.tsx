"use client";

import React from "react";
import { merge } from "../../lib/utils";

/**
 * DashboardGrid 컴포넌트의 props
 * @typedef {Object} DashboardGridProps
 * @property {1 | 2 | 3 | 4 | 5 | 6} [columns=4] - 그리드 컬럼 수
 * @property {"sm" | "md" | "lg" | "xl"} [gap="md"] - 그리드 간격
 * @property {boolean} [responsive=true] - 반응형 여부
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface DashboardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
}

const gapClasses = {
  sm: "gap-3",
  md: "gap-6",
  lg: "gap-8",
  xl: "gap-12",
};

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 md:grid-cols-2",
  3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};

// 비반응형용 고정 클래스 (Tailwind 동적 클래스 생성 문제 해결)
const fixedColumnClasses: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

/**
 * DashboardGrid 컴포넌트
 * 
 * 대시보드 그리드 레이아웃을 제공하는 컴포넌트입니다.
 * 반응형 그리드를 지원하며, 다양한 컬럼 수와 간격을 설정할 수 있습니다.
 * 
 * Dashboard grid layout component.
 * Supports responsive grid with configurable column count and gap sizes.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <DashboardGrid columns={4}>
 *   <StatCard title="항목 1" value="100" />
 *   <StatCard title="항목 2" value="200" />
 * </DashboardGrid>
 * 
 * @example
 * // 반응형 그리드 / Responsive grid
 * <DashboardGrid columns={3} gap="lg" responsive>
 *   <MetricCard title="메트릭 1" value="1,000" />
 *   <MetricCard title="메트릭 2" value="2,000" />
 * </DashboardGrid>
 * 
 * @param {DashboardGridProps} props - DashboardGrid 컴포넌트의 props / DashboardGrid component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DashboardGrid 컴포넌트 / DashboardGrid component
 */
export const DashboardGrid = React.forwardRef<HTMLDivElement, DashboardGridProps>(
  (
    {
      columns = 4,
      gap = "md",
      responsive = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const gridClasses = responsive
      ? columnClasses[columns]
      : fixedColumnClasses[columns];

    return (
      <div
        ref={ref}
        className={merge(
          "grid",
          gridClasses,
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DashboardGrid.displayName = "DashboardGrid";

