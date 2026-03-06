"use client";

import React, { useMemo } from "react";
import { dotVariants } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { useBreakpoint } from "../../hooks/useBreakpoint";

export const dashboardGridVariants = dotVariants({
  base: "grid",
  variants: {
    gap: {
      sm: "gap-3",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    },
  },
  defaultVariants: {
    gap: "md",
  },
});

const GAP_VALUES: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "0.75rem",
  md: "1.5rem",
  lg: "2rem",
  xl: "3rem",
};

/**
 * DashboardGrid 컴포넌트의 props
 * @property {1 | 2 | 3 | 4 | 5 | 6} [columns=4] - 그리드 컬럼 수
 * @property {"sm" | "md" | "lg" | "xl"} [gap="md"] - 그리드 간격
 * @property {boolean} [responsive=true] - 반응형 여부
 * @property {string} [dot] - dot utility string
 * @property {React.CSSProperties} [style] - inline styles
 */
export interface DashboardGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
  responsive?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

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
export const DashboardGrid = React.forwardRef<
  HTMLDivElement,
  DashboardGridProps
>(
  (
    {
      columns = 4,
      gap = "md",
      responsive = true,
      dot: dotProp,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const bp = useBreakpoint();

    const computedStyle = useMemo(() => {
      const base = dashboardGridVariants({ gap }) as React.CSSProperties;

      // Responsive column resolution
      let resolvedCols: number;
      if (responsive && columns > 1) {
        if (!bp || bp === "sm") {
          resolvedCols = 1;
        } else if (bp === "md") {
          resolvedCols = Math.min(columns, 2);
        } else {
          resolvedCols = columns;
        }
      } else {
        resolvedCols = columns;
      }

      const colStyle: React.CSSProperties = {
        gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))`,
        gap: GAP_VALUES[gap],
      };

      return mergeStyles(base, colStyle, resolveDot(dotProp), style);
    }, [columns, gap, responsive, bp, dotProp, style]);

    return (
      <div ref={ref} style={computedStyle} {...props}>
        {children}
      </div>
    );
  }
);

DashboardGrid.displayName = "DashboardGrid";
