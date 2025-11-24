"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
import { DashboardEmptyState } from "./EmptyState";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

type RoutingStatus = "normal" | "warning" | "critical";

export interface RoutingBreakdownSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
  status?: RoutingStatus;
  icon?: string;
  detail?: string;
}

export interface RoutingBreakdownCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  segments: RoutingBreakdownSegment[];
  totalLabel?: string;
  totalValue?: React.ReactNode;
  highlightId?: string;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  formatter?: (segment: RoutingBreakdownSegment, percentage: number) => React.ReactNode;
}

const DEFAULT_COLORS = ["#0ea5e9", "#6366f1", "#22c55e", "#f97316", "#a855f7", "#ef4444"];

const STATUS_BADGES: Record<RoutingStatus, string> = {
  normal: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
};

const formatPercentage = (value: number, total: number) => {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 1000) / 10}%`;
};

export const RoutingBreakdownCard: React.FC<RoutingBreakdownCardProps> = ({
  title = "PG / 결제수단 비중",
  description = "라우팅별 처리 비율과 상태",
  segments,
  totalLabel = "총 거래",
  totalValue,
  highlightId,
  actions,
  emptyState,
  formatter,
  className,
  ...props
}) => {
  const hasSegments = segments.length > 0;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div
      className={merge(
        "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
        {actions && <div className="text-xs text-slate-500">{actions}</div>}
      </div>

      {!hasSegments ? (
        emptyState ?? (
          <DashboardEmptyState
            icon="pie-chart"
            title="라우팅 데이터가 없습니다"
            description="PG 라우팅 혹은 결제수단 정보가 수집되면 자동으로 표시됩니다."
            size="sm"
            className="mt-4"
          />
        )
      ) : (
        <>
          <div className="mt-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              {segments.map((segment, index) => {
                const width = total === 0 ? 0 : (segment.value / total) * 100;
                const color = segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                return (
                  <div
                    key={segment.id}
                    className="h-full transition-all"
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                      opacity: highlightId && highlightId !== segment.id ? 0.4 : 1,
                    }}
                    aria-label={`${segment.label} ${formatPercentage(segment.value, total)}`}
                  />
                );
              })}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {totalLabel}: {totalValue ?? total.toLocaleString()}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {segments.map((segment, index) => {
              const color = segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              const percentage = total === 0 ? 0 : (segment.value / total) * 100;
              const badgeClass = segment.status ? STATUS_BADGES[segment.status] : null;
              const customContent = formatter?.(segment, percentage);

              return (
                <div
                  key={segment.id}
                  className={merge(
                    "flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3 transition hover:border-slate-200 dark:hover:border-slate-700",
                    highlightId === segment.id && "border-2 border-slate-200 dark:border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-[3rem]">
                    {segment.icon && (
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-500">
                        <Icon name={segment.icon as IconName} className="h-4 w-4" />
                      </span>
                    )}
                    <div
                      className="h-2 w-12 rounded-full"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{segment.label}</span>
                      {badgeClass && (
                        <span className={merge("rounded-full px-2 py-0.5 text-[11px] font-medium", badgeClass)}>
                          {segment.status === "critical"
                            ? "장애"
                            : segment.status === "warning"
                            ? "감시"
                            : "정상"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-300">
                      {segment.detail}
                    </div>
                  </div>
                  {customContent ?? (
                    <div className="text-right text-sm text-slate-700 dark:text-slate-100">
                      <div className="font-semibold">{segment.value.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">{formatPercentage(segment.value, total)}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

RoutingBreakdownCard.displayName = "RoutingBreakdownCard";

