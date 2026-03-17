"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
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
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface MerchantListProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onSelect" | "className"
> {
  items: MerchantListItem[];
  isLoading?: boolean;
  filters?: React.ReactNode;
  emptyState?: React.ReactNode;
  onMerchantSelect?: (merchant: MerchantListItem) => void;
  locale?: string;
  defaultCurrency?: string;
  dot?: string;
}

const HEALTH_BADGE_STYLES: Record<MerchantHealth, React.CSSProperties> = {
  normal: { backgroundColor: "#ecfdf5", color: "#047857" },
  warning: { backgroundColor: "#fffbeb", color: "#b45309" },
  critical: { backgroundColor: "#fff1f2", color: "#be123c" },
};

const HEALTH_LABELS: Record<MerchantHealth, string> = {
  normal: "정상",
  warning: "감시",
  critical: "위험",
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
  dot,
  style,
  ...props
}) => {
  const hasItems = items.length > 0;

  return (
    <div
      style={mergeStyles(
        {
          ...resolveDot("rounded-xl"),
          border: "1px solid var(--color-border, #f1f5f9)",
          backgroundColor: "var(--color-card, #ffffff)",
        },
        resolveDot(dot),
        style,
      )}
      {...props}
    >
      {filters && (
        <div
          style={{
            borderBottom: "1px solid var(--color-border, #f1f5f9)",
            ...resolveDot("py-3 px-6"),
          }}
        >
          {filters}
        </div>
      )}

      <div style={{ ...resolveDot("p-4 px-6") }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              ...resolveDot("gap-3"),
            }}
          >
            {[...Array(3)].map((_, idx) => (
              <Skeleton key={idx} dot="h-20 rounded-2xl" />
            ))}
          </div>
        ) : !hasItems ? (
          (emptyState ?? (
            <DashboardEmptyState
              icon="store"
              title="가맹점이 없습니다"
              description="검색어를 변경하거나 새로운 가맹점을 온보딩하세요."
              size="sm"
              style={{ ...resolveDot("py-6") }}
            />
          ))
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              ...resolveDot("gap-3"),
            }}
            role="list"
            aria-label="가맹점 목록"
          >
            {items.map((merchant) => {
              const approval = formatPercent(merchant.approvalRate);
              const volume = formatVolume(
                merchant.volume,
                merchant.currency ?? defaultCurrency,
                locale,
              );
              const healthBadgeStyle = merchant.health
                ? HEALTH_BADGE_STYLES[merchant.health]
                : undefined;
              const healthLabel = merchant.health
                ? HEALTH_LABELS[merchant.health]
                : undefined;

              const merchantLabel = `${merchant.name}${merchant.status ? `, 상태: ${merchant.status}` : ""}${merchant.health ? `, 건강 상태: ${healthLabel}` : ""}${volume ? `, 거래량: ${volume}` : ""}${approval ? `, 승인률: ${approval}` : ""}`;

              return (
                <button
                  key={merchant.id}
                  type="button"
                  role="button"
                  onClick={
                    onMerchantSelect
                      ? () => onMerchantSelect(merchant)
                      : undefined
                  }
                  disabled={!onMerchantSelect}
                  aria-label={
                    onMerchantSelect
                      ? `${merchantLabel} - 클릭하여 상세 정보 보기`
                      : merchantLabel
                  }
                  style={{
                    width: "100%",
                    ...resolveDot("rounded-xl p-4"),
                    border: "1px solid var(--color-border, #f1f5f9)",
                    backgroundColor: "var(--color-card, rgba(255,255,255,0.9))",
                    textAlign: "left",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    transition: "border-color 150ms",
                    cursor: onMerchantSelect ? "pointer" : "default",
                    opacity: onMerchantSelect ? 1 : 0.6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      ...resolveDot("gap-3"),
                    }}
                  >
                    {merchant.icon && (
                      <div
                        style={{
                          ...resolveDot("rounded-xl p-2"),
                          backgroundColor: "var(--color-muted, #f1f5f9)",
                          color: "#64748b",
                        }}
                      >
                        {typeof merchant.icon === "string" ? (
                          <Icon
                            name={merchant.icon as IconName}
                            dot="w-5 h-5"
                          />
                        ) : (
                          merchant.icon
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          ...resolveDot("gap-2"),
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.875rem",
                            fontWeight: 600,
                            color: "var(--color-foreground, #0f172a)",
                          }}
                        >
                          {merchant.name}
                        </p>
                        {merchant.status && (
                          <Badge dot="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-100">
                            {merchant.status}
                          </Badge>
                        )}
                        {merchant.tag && (
                          <span
                            style={{
                              borderRadius: "9999px",
                              backgroundColor: "var(--color-muted, #f8fafc)",
                              padding: "0.125rem 0.5rem",
                              fontSize: "0.6875rem",
                              color: "#64748b",
                            }}
                          >
                            {merchant.tag}
                          </span>
                        )}
                        {healthBadgeStyle && (
                          <span
                            style={{
                              borderRadius: "9999px",
                              padding: "0.125rem 0.5rem",
                              fontSize: "0.6875rem",
                              fontWeight: 500,
                              ...healthBadgeStyle,
                            }}
                          >
                            {healthLabel}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {merchant.category ?? "카테고리 미정"} ·{" "}
                        {merchant.region ?? "지역 정보 없음"}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "0.875rem",
                        color: "var(--color-foreground, #0f172a)",
                      }}
                    >
                      {volume && (
                        <div style={{ fontWeight: 600 }}>{volume}</div>
                      )}
                      {approval && (
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          승인률 {approval}
                        </div>
                      )}
                    </div>
                  </div>

                  {merchant.metadata && merchant.metadata.length > 0 && (
                    <div
                      style={{
                        ...resolveDot("mt-3 gap-3"),
                        display: "grid",
                        fontSize: "0.75rem",
                        color: "#64748b",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      }}
                    >
                      {merchant.metadata.map((meta) => (
                        <div
                          key={meta.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            ...resolveDot("gap-2"),
                          }}
                        >
                          <span style={{ color: "#94a3b8" }}>{meta.label}</span>
                          <span
                            style={{
                              color: "var(--color-foreground, #334155)",
                            }}
                          >
                            {meta.value}
                          </span>
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
