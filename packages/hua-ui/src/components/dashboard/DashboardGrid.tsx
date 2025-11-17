"use client";

import React from "react";
import { merge } from "../../lib/utils";

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

