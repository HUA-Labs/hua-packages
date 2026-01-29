"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { DashboardEmptyState } from "./EmptyState";
import { Skeleton } from "../Skeleton";

export type MerchantHealth = "normal" | "warning" | "critical";

/**
 * 가맹점 리스트 아이템 인터페이스 / MerchantListItem interface
 * @typedef {Object} MerchantListItem
 * @property {string} id - 가맹점 고유 ID / Merchant unique ID
 * @property {string} name - 가맹점 이름 / Merchant name
 * @property {string} [status] - 상태 / Status
 * @property {MerchantHealth} [health] - 건강 상태 / Health status
 * @property {number} [approvalRate] - 승인률 (0-1) / Approval rate (0-1)
 * @property {number} [volume] - 거래량 / Transaction volume
 * @property {string} [currency] - 통화 / Currency
 * @property {string} [category] - 카테고리 / Category
 * @property {string} [region] - 지역 / Region
 * @property {string | Date} [updatedAt] - 업데이트 시간 / Updated time
 * @property {string} [tag] - 태그 / Tag
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {Array<{ label: string; value: React.ReactNode }>} [metadata] - 메타데이터 / Metadata
 */
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

/**
 * MerchantList 컴포넌트의 props / MerchantList component props
 * @typedef {Object} MerchantListProps
 * @property {MerchantListItem[]} items - 가맹점 아이템 배열 / Merchant items array
 * @property {boolean} [isLoading=false] - 로딩 상태 / Loading state
 * @property {React.ReactNode} [filters] - 필터 컴포넌트 / Filter component
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {(merchant: MerchantListItem) => void} [onMerchantSelect] - 가맹점 선택 핸들러 / Merchant selection handler
 * @property {string} [locale="ko-KR"] - 로케일 / Locale
 * @property {string} [defaultCurrency="KRW"] - 기본 통화 / Default currency
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect">}
 */
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

/**
 * MerchantList 컴포넌트
 * 
 * 가맹점 목록을 표시하는 컴포넌트입니다.
 * 가맹점 정보, 건강 상태, 승인률, 거래량 등을 카드 형태로 표시합니다.
 * 
 * Component that displays a list of merchants.
 * Shows merchant information, health status, approval rate, and transaction volume in card format.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <MerchantList
 *   items={[
 *     {
 *       id: "1",
 *       name: "가맹점 A",
 *       health: "normal",
 *       approvalRate: 0.985,
 *       volume: 1000000,
 *       currency: "KRW"
 *     }
 *   ]}
 *   onMerchantSelect={(merchant) => console.log(merchant)}
 * />
 * 
 * @example
 * // 로딩 상태 / Loading state
 * <MerchantList
 *   items={merchants}
 *   isLoading={true}
 *   filters={<FilterComponent />}
 * />
 * 
 * @param {MerchantListProps} props - MerchantList 컴포넌트의 props / MerchantList component props
 * @returns {JSX.Element} MerchantList 컴포넌트 / MerchantList component
 */
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
          <div className="space-y-3" role="list" aria-label="가맹점 목록">
            {items.map((merchant) => {
              const approval = formatPercent(merchant.approvalRate);
              const volume = formatVolume(merchant.volume, merchant.currency ?? defaultCurrency, locale);
              const badgeClass = merchant.health ? HEALTH_BADGES[merchant.health] : undefined;

              const merchantLabel = `${merchant.name}${merchant.status ? `, 상태: ${merchant.status}` : ''}${merchant.health ? `, 건강 상태: ${merchant.health === "critical" ? "위험" : merchant.health === "warning" ? "감시" : "정상"}` : ''}${volume ? `, 거래량: ${volume}` : ''}${approval ? `, 승인률: ${approval}` : ''}`;

              return (
                <button
                  key={merchant.id}
                  type="button"
                  role="button"
                  onClick={onMerchantSelect ? () => onMerchantSelect(merchant) : undefined}
                  disabled={!onMerchantSelect}
                  aria-label={onMerchantSelect ? `${merchantLabel} - 클릭하여 상세 정보 보기` : merchantLabel}
                  className={merge(
                    "w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/60 p-4 text-left shadow-sm transition hover:border-slate-200 dark:hover:border-slate-700 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/70",
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

