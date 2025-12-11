"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { DashboardEmptyState } from "./EmptyState";

export type SettlementTimelineStatus = "pending" | "processing" | "completed" | "failed";

/**
 * 정산 타임라인 아이템 인터페이스 / SettlementTimelineItem interface
 * @typedef {Object} SettlementTimelineItem
 * @property {string} id - 아이템 고유 ID / Item unique ID
 * @property {string} title - 제목 / Title
 * @property {string} [description] - 설명 / Description
 * @property {SettlementTimelineStatus} status - 상태 / Status
 * @property {number} [amount] - 금액 / Amount
 * @property {string} [currency] - 통화 / Currency
 * @property {string | Date} [date] - 날짜 / Date
 * @property {string} [meta] - 메타 정보 / Meta information
 * @property {IconName} [icon] - 아이콘 / Icon
 */
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

/**
 * SettlementTimeline 컴포넌트의 props / SettlementTimeline component props
 * @typedef {Object} SettlementTimelineProps
 * @property {SettlementTimelineItem[]} items - 타임라인 아이템 배열 / Timeline items array
 * @property {string} [highlightedId] - 강조할 아이템 ID / Highlighted item ID
 * @property {string} [locale="ko-KR"] - 로케일 / Locale
 * @property {string} [defaultCurrency="KRW"] - 기본 통화 / Default currency
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
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

/**
 * SettlementTimeline 컴포넌트
 * 
 * 정산 처리 단계를 타임라인 형태로 표시하는 컴포넌트입니다.
 * 각 단계의 상태, 금액, 날짜를 시각적으로 표시합니다.
 * 
 * Timeline component that displays settlement processing stages.
 * Visually shows status, amount, and date for each stage.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <SettlementTimeline
 *   items={[
 *     {
 *       id: "1",
 *       title: "정산 요청",
 *       status: "completed",
 *       amount: 1000000,
 *       currency: "KRW",
 *       date: new Date("2024-01-01")
 *     },
 *     {
 *       id: "2",
 *       title: "처리 중",
 *       status: "processing",
 *       amount: 1000000,
 *       currency: "KRW"
 *     }
 *   ]}
 * />
 * 
 * @example
 * // 강조 기능 / Highlight feature
 * <SettlementTimeline
 *   items={timelineItems}
 *   highlightedId="2"
 *   locale="en-US"
 *   defaultCurrency="USD"
 * />
 * 
 * @param {SettlementTimelineProps} props - SettlementTimeline 컴포넌트의 props / SettlementTimeline component props
 * @returns {JSX.Element} SettlementTimeline 컴포넌트 / SettlementTimeline component
 */
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
          <ol className="space-y-4" role="list" aria-label="정산 타임라인">
            {items.map((item, index) => {
              const statusConfig = STATUS_CONFIG[item.status];
              const amount = formatAmount(item.amount, item.currency ?? defaultCurrency, locale);
              const date = formatDate(item.date, locale);
              const isHighlighted = highlightedId === item.id;
              const showConnector = index !== items.length - 1;

              const itemLabel = `${item.title}, 상태: ${statusConfig.label}${amount ? `, 금액: ${amount}` : ''}${date ? `, 날짜: ${date}` : ''}`;

              return (
                <li 
                  key={item.id} 
                  role="listitem"
                  aria-label={itemLabel}
                  className="relative flex gap-4"
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={merge(
                        "z-10 h-3.5 w-3.5 rounded-full border-2 bg-white shadow",
                        statusConfig.dot,
                        isHighlighted && "scale-110"
                      )}
                      aria-label={`${statusConfig.label} 상태`}
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
                          <Icon name="clock" className="h-3.5 w-3.5 text-slate-400" aria-hidden={true} />
                          <time dateTime={item.date instanceof Date ? item.date.toISOString() : typeof item.date === 'string' ? item.date : undefined}>
                            {date}
                          </time>
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

