"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { DashboardEmptyState } from "./EmptyState";

export type SettlementTimelineStatus = "pending" | "processing" | "completed" | "failed";

export interface SettlementTimelineItem {
  id: string;
  title: string;
  description?: string;
  status: SettlementTimelineStatus;
  amount?: number;
  currency?: string;
  date?: string | Date;
  meta?: string;
  icon?: IconName;
}

export interface SettlementTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SettlementTimelineItem[];
  highlightedId?: string;
  locale?: string;
  defaultCurrency?: string;
  emptyState?: React.ReactNode;
}

const STATUS_CONFIG: Record<
  SettlementTimelineStatus,
  { dot: string; border: string; text: string; label: string }
> = {
  completed: {
    dot: "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    border: "border-emerald-200 dark:border-emerald-500/40",
    text: "text-emerald-700 dark:text-emerald-300",
    label: "정산 완료",
  },
  processing: {
    dot: "bg-sky-500 border-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)] animate-pulse",
    border: "border-sky-200 dark:border-sky-500/40",
    text: "text-sky-700 dark:text-sky-200",
    label: "처리 중",
  },
  pending: {
    dot: "bg-amber-400 border-amber-400",
    border: "border-amber-200 dark:border-amber-500/40",
    text: "text-amber-700 dark:text-amber-200",
    label: "대기",
  },
  failed: {
    dot: "bg-rose-500 border-rose-500",
    border: "border-rose-200 dark:border-rose-500/40",
    text: "text-rose-700 dark:text-rose-300",
    label: "실패",
  },
};

const formatAmount = (amount?: number, currency?: string, locale = "ko-KR") => {
  if (typeof amount !== "number") return undefined;
  const unit = currency ?? "KRW";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: unit,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${unit}`;
  }
};

const formatDate = (value?: string | Date, locale = "ko-KR") => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
};

export const SettlementTimeline: React.FC<SettlementTimelineProps> = ({
  items,
  highlightedId,
  locale = "ko-KR",
  defaultCurrency = "KRW",
  emptyState,
  className,
  ...props
}) => {
  const hasItems = items.length > 0;

  return (
    <div
      className={merge(
        "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">정산 타임라인</p>
          <p className="text-xs text-slate-500">처리 단계별 상태와 금액을 확인하세요.</p>
        </div>
      </div>

      {!hasItems
        ? emptyState ?? (
            <DashboardEmptyState
              icon="calendar-clock"
              title="정산 단계가 없습니다"
              description="정산 요청이 생성되면 자동으로 단계가 채워집니다."
              size="sm"
            />
          )
        : (
          <ol className="space-y-4">
            {items.map((item, index) => {
              const statusConfig = STATUS_CONFIG[item.status];
              const amount = formatAmount(item.amount, item.currency ?? defaultCurrency, locale);
              const date = formatDate(item.date, locale);
              const isHighlighted = highlightedId === item.id;
              const showConnector = index !== items.length - 1;

              return (
                <li key={item.id} className="relative flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={merge(
                        "z-10 h-3.5 w-3.5 rounded-full border-2 bg-white shadow",
                        statusConfig.dot,
                        isHighlighted && "scale-110"
                      )}
                    />
                    {showConnector && (
                      <span className="mt-1 flex-1 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                    )}
                  </div>

                  <div
                    className={merge(
                      "flex-1 rounded-xl border p-4",
                      statusConfig.border,
                      isHighlighted && "border-2 shadow-sm"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</span>
                      <span className={merge("text-xs font-medium rounded-full px-2 py-0.5", statusConfig.text)}>
                        {statusConfig.label}
                      </span>
                      {item.meta && (
                        <span className="text-xs text-slate-500 dark:text-slate-300">{item.meta}</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-300">
                      {amount && (
                        <div className="flex items-center gap-1 text-sm text-slate-700 dark:text-slate-100">
                          <Icon name="wallet" className="h-3.5 w-3.5 text-slate-400" />
                          {amount}
                        </div>
                      )}
                      {date && (
                        <div className="flex items-center gap-1">
                          <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" />
                          {date}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
    </div>
  );
};

SettlementTimeline.displayName = "SettlementTimeline";

