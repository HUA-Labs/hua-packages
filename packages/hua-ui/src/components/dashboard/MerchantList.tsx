"use client";

import * as React from "react";
import { merge } from "../../lib/utils";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { DashboardEmptyState } from "./EmptyState";
import { Skeleton } from "../Skeleton";

export type MerchantHealth = "normal" | "warning" | "critical";

export interface MerchantListItem {
  id: string;
  name: string;
  status?: string;
  health?: MerchantHealth;
  approvalRate?: number;
  volume?: number;
  currency?: string;
  category?: string;
  region?: string;
  updatedAt?: string | Date;
  tag?: string;
  icon?: IconName | React.ReactNode;
  metadata?: Array<{ label: string; value: React.ReactNode }>;
}

export interface MerchantListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: MerchantListItem[];
  isLoading?: boolean;
  filters?: React.ReactNode;
  emptyState?: React.ReactNode;
  onMerchantSelect?: (merchant: MerchantListItem) => void;
  locale?: string;
  defaultCurrency?: string;
}

const HEALTH_BADGES: Record<MerchantHealth, string> = {
  normal: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  critical: "bg-rose-50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-100",
};

const formatPercent = (value?: number) => {
  if (typeof value !== "number") return undefined;
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
};

const formatVolume = (value?: number, currency?: string, locale = "ko-KR") => {
  if (typeof value !== "number") return undefined;
  const unit = currency ?? "KRW";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: unit,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString(locale)} ${unit}`;
  }
};

export const MerchantList: React.FC<MerchantListProps> = ({
  items,
  isLoading = false,
  filters,
  emptyState,
  onMerchantSelect,
  locale = "ko-KR",
  defaultCurrency = "KRW",
  className,
  ...props
}) => {
  const hasItems = items.length > 0;

  return (
    <div
      className={merge(
        "rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50",
        className
      )}
      {...props}
    >
      {filters && (
        <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3 md:px-6">{filters}</div>
      )}

      <div className="p-4 md:p-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, idx) => (
              <Skeleton key={idx} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !hasItems ? (
          emptyState ?? (
            <DashboardEmptyState
              icon="store"
              title="가맹점이 없습니다"
              description="검색어를 변경하거나 새로운 가맹점을 온보딩하세요."
              size="sm"
              className="py-6"
            />
          )
        ) : (
          <div className="space-y-3">
            {items.map((merchant) => {
              const approval = formatPercent(merchant.approvalRate);
              const volume = formatVolume(merchant.volume, merchant.currency ?? defaultCurrency, locale);
              const badgeClass = merchant.health ? HEALTH_BADGES[merchant.health] : undefined;

              return (
                <button
                  key={merchant.id}
                  type="button"
                  onClick={onMerchantSelect ? () => onMerchantSelect(merchant) : undefined}
                  disabled={!onMerchantSelect}
                  className={merge(
                    "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-4 text-left shadow-sm transition hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70",
                    onMerchantSelect ? "cursor-pointer" : "cursor-default opacity-60"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    {merchant.icon && (
                      <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-500">
                        {typeof merchant.icon === "string" ? (
                          <Icon name={merchant.icon as IconName} className="h-5 w-5" />
                        ) : (
                          merchant.icon
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{merchant.name}</p>
                        {merchant.status && (
                          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-100">
                            {merchant.status}
                          </Badge>
                        )}
                        {merchant.tag && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800/80">
                            {merchant.tag}
                          </span>
                        )}
                        {badgeClass && (
                          <span className={merge("rounded-full px-2 py-0.5 text-[11px] font-medium", badgeClass)}>
                            {merchant.health === "critical"
                              ? "위험"
                              : merchant.health === "warning"
                              ? "감시"
                              : "정상"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-300">
                        {merchant.category ?? "카테고리 미정"} · {merchant.region ?? "지역 정보 없음"}
                      </div>
                    </div>
                    <div className="text-right text-sm text-slate-900 dark:text-white">
                      {volume && <div className="font-semibold">{volume}</div>}
                      {approval && <div className="text-xs text-slate-500">승인률 {approval}</div>}
                    </div>
                  </div>

                  {merchant.metadata && merchant.metadata.length > 0 && (
                    <div className="mt-3 grid gap-3 text-xs text-slate-500 dark:text-slate-300 sm:grid-cols-2">
                      {merchant.metadata.map((meta) => (
                        <div key={meta.label} className="flex items-center gap-2">
                          <span className="text-slate-400">{meta.label}</span>
                          <span className="text-slate-700 dark:text-slate-100">{meta.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

MerchantList.displayName = "MerchantList";

