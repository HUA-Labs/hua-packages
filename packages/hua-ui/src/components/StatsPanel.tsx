"use client";

import React from "react";
import { merge } from "../lib/utils";

/**
 * StatsPanelItem 인터페이스 / StatsPanelItem interface
 * @typedef {Object} StatsPanelItem
 * @property {string} label - 통계 항목 라벨 / Stat item label
 * @property {string | React.ReactNode} value - 통계 값 / Stat value
 * @property {string | React.ReactNode} [description] - 통계 설명 / Stat description
 * @property {"up" | "down" | "neutral"} [trend] - 추세 방향 / Trend direction
 * @property {string} [trendValue] - 추세 값 / Trend value
 * @property {"primary" | "secondary" | "neutral" | "warning"} [accent] - 강조 색상 / Accent color
 * @property {React.ReactNode} [icon] - 아이콘 / Icon
 */
export interface StatsPanelItem {
  label: string;
  value: string | React.ReactNode;
  description?: string | React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: "primary" | "secondary" | "neutral" | "warning";
  icon?: React.ReactNode;
}

/**
 * StatsPanel 컴포넌트의 props / StatsPanel component props
 * @typedef {Object} StatsPanelProps
 * @property {string} [title] - 패널 제목 / Panel title
 * @property {StatsPanelItem[]} items - 통계 항목 배열 / Stat items array
 * @property {1 | 2 | 3 | 4} [columns=4] - 그리드 컬럼 수 / Grid column count
 * @property {boolean} [loading=false] - 로딩 상태 / Loading state
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface StatsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: StatsPanelItem[];
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
}

/**
 * StatsPanel 컴포넌트 / StatsPanel component
 * 
 * 통계 정보를 표시하는 패널 컴포넌트입니다.
 * 여러 통계 항목을 그리드 형태로 표시하며, 추세 정보를 포함할 수 있습니다.
 * 
 * Panel component that displays statistics.
 * Shows multiple stat items in grid format and can include trend information.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <StatsPanel
 *   items={[
 *     { label: "총 사용자", value: "1,234", trend: "up", trendValue: "+12%" },
 *     { label: "활성 사용자", value: "567", trend: "down", trendValue: "-5%" }
 *   ]}
 * />
 * 
 * @example
 * // 2열 그리드, 제목 포함 / 2-column grid with title
 * <StatsPanel
 *   title="통계"
 *   columns={2}
 *   items={[
 *     { label: "항목 1", value: "100", accent: "primary" },
 *     { label: "항목 2", value: "200", accent: "secondary" }
 *   ]}
 * />
 * 
 * @param {StatsPanelProps} props - StatsPanel 컴포넌트의 props / StatsPanel component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} StatsPanel 컴포넌트 / StatsPanel component
 */
export const StatsPanel = React.forwardRef<HTMLDivElement, StatsPanelProps>(
  (
    {
      title,
      items,
      columns = 4,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseCardClass =
      "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] shadow-sm transition-colors";

    const accentStyles: Record<
      NonNullable<StatsPanelItem["accent"]>,
      {
        card: string;
        label: string;
        value: string;
        icon: string;
        iconWrapper: string;
      }
    > = {
      primary: {
        card: `${baseCardClass} ring-1 ring-[rgba(0,82,204,0.18)] dark:ring-[rgba(59,130,246,0.28)] bg-gradient-to-br from-[rgba(0,82,204,0.08)] via-transparent to-transparent dark:from-[rgba(59,130,246,0.18)]`,
        label: "text-[var(--brand-primary)]",
        value: "text-[var(--text-strong)]",
        icon: "text-[var(--brand-primary)]",
        iconWrapper: "bg-[rgba(0,82,204,0.12)] dark:bg-[rgba(59,130,246,0.25)]",
      },
      secondary: {
        card: `${baseCardClass} ring-1 ring-[rgba(11,122,91,0.18)] dark:ring-[rgba(52,211,153,0.25)] bg-gradient-to-br from-[rgba(0,200,151,0.08)] via-transparent to-transparent dark:from-[rgba(52,211,153,0.16)]`,
        label: "text-[var(--brand-secondary)]",
        value: "text-[var(--text-strong)]",
        icon: "text-[var(--brand-secondary)]",
        iconWrapper: "bg-[rgba(0,200,151,0.12)] dark:bg-[rgba(52,211,153,0.22)]",
      },
      warning: {
        card: `${baseCardClass} ring-1 ring-[rgba(245,158,11,0.2)] dark:ring-[rgba(251,191,36,0.32)] bg-gradient-to-br from-[rgba(245,158,11,0.1)] via-transparent to-transparent dark:from-[rgba(251,191,36,0.2)]`,
        label: "text-amber-600",
        value: "text-[var(--text-strong)]",
        icon: "text-amber-600",
        iconWrapper: "bg-[rgba(245,158,11,0.15)] dark:bg-[rgba(251,191,36,0.25)]",
      },
      neutral: {
        card: baseCardClass,
        label: "text-[var(--text-muted)]",
        value: "text-[var(--text-strong)]",
        icon: "text-[var(--text-muted)]",
        iconWrapper: "bg-[var(--surface-muted)]",
      },
    };

    const gridCols = {
      1: "grid-cols-1",
      2: "grid-cols-1 lg:grid-cols-2",
      3: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3",
      4: "grid-cols-1 lg:grid-cols-2 xl:grid-cols-4",
    }[columns];

    return (
      <div
        ref={ref}
        className={merge("w-full", className)}
        {...props}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            {title}
          </h2>
        )}
        <div
          className={merge("grid gap-5", gridCols)}
        >
          {loading ? (
            Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6"
              >
                <div className="mb-2 h-4 w-20 rounded bg-[var(--surface-muted)]/80" />
                <div className="mb-1 h-8 w-24 rounded bg-[var(--surface-muted)]/80" />
                <div className="h-3 w-32 rounded bg-[var(--surface-muted)]/80" />
              </div>
            ))
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className={merge(
                  "rounded-xl transition-all duration-200 p-6",
                  accentStyles[item.accent ?? "neutral"].card
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div
                    className={merge(
                      "text-sm font-medium",
                      accentStyles[item.accent ?? "neutral"].label
                    )}
                  >
                    {item.label}
                  </div>
                  {item.icon && (
                    <div
                      className={merge(
                        "inline-flex h-10 w-10 items-center justify-center rounded-xl text-base font-semibold",
                        accentStyles[item.accent ?? "neutral"].iconWrapper,
                        accentStyles[item.accent ?? "neutral"].icon
                      )}
                    >
                      {item.icon}
                    </div>
                  )}
                </div>
                <div
                  className={merge(
                    "text-2xl font-semibold leading-tight mb-2",
                    accentStyles[item.accent ?? "neutral"].value
                  )}
                >
                  {item.value}
                </div>
                {item.description && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </div>
                )}
                {item.trend && item.trendValue && (
                  <div
                    className={merge(
                      "mt-2 flex items-center gap-1 text-xs",
                      item.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : item.trend === "down"
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.trend === "up" && "↑"}
                    {item.trend === "down" && "↓"}
                    {item.trendValue}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }
);

StatsPanel.displayName = "StatsPanel";

