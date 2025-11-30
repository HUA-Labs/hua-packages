"use client";

import React from "react";
import { merge } from "../lib/utils";

export interface StatsPanelItem {
  label: string;
  value: string | React.ReactNode;
  description?: string | React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  accent?: "primary" | "secondary" | "neutral" | "warning";
  icon?: React.ReactNode;
}

export interface StatsPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: StatsPanelItem[];
  columns?: 1 | 2 | 3 | 4;
  loading?: boolean;
}

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
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-slate-50">
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
                  <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
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
                        : "text-gray-500 dark:text-slate-400"
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

