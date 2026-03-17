"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { DashboardEmptyState } from "./EmptyState";

export type SettlementTimelineStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

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
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface SettlementTimelineProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  items: SettlementTimelineItem[];
  highlightedId?: string;
  locale?: string;
  defaultCurrency?: string;
  emptyState?: React.ReactNode;
  dot?: string;
}

const STATUS_CONFIG: Record<
  SettlementTimelineStatus,
  {
    dotColor: string;
    borderColor: string;
    textColor: string;
    label: string;
    shadow?: string;
  }
> = {
  completed: {
    dotColor: "#10b981",
    borderColor: "rgba(167,243,208,1)",
    textColor: "#047857",
    label: "정산 완료",
    shadow: "0 0 8px rgba(16,185,129,0.5)",
  },
  processing: {
    dotColor: "#0ea5e9",
    borderColor: "rgba(186,230,253,1)",
    textColor: "#0369a1",
    label: "처리 중",
    shadow: "0 0 8px rgba(14,165,233,0.5)",
  },
  pending: {
    dotColor: "#fbbf24",
    borderColor: "rgba(253,230,138,1)",
    textColor: "#b45309",
    label: "대기",
  },
  failed: {
    dotColor: "#f43f5e",
    borderColor: "rgba(253,205,211,1)",
    textColor: "#be123c",
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
  return parsed.toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
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
  dot,
  style,
  ...props
}) => {
  const hasItems = items.length > 0;

  return (
    <div
      style={mergeStyles(
        {
          ...resolveDot("rounded-xl p-4"),
          border: "1px solid var(--color-border, #f1f5f9)",
          backgroundColor: "var(--color-card, rgba(255,255,255,0.5))",
        },
        resolveDot(dot),
        style,
      )}
      {...props}
    >
      <div
        style={{
          ...resolveDot("mb-4"),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--color-foreground, #0f172a)",
            }}
          >
            정산 타임라인
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
            처리 단계별 상태와 금액을 확인하세요.
          </p>
        </div>
      </div>

      {!hasItems ? (
        (emptyState ?? (
          <DashboardEmptyState
            icon="calendar-clock"
            title="정산 단계가 없습니다"
            description="정산 요청이 생성되면 자동으로 단계가 채워집니다."
            size="sm"
          />
        ))
      ) : (
        <ol
          style={{
            display: "flex",
            flexDirection: "column",
            ...resolveDot("gap-4"),
          }}
          role="list"
          aria-label="정산 타임라인"
        >
          {items.map((item, index) => {
            const statusConfig = STATUS_CONFIG[item.status];
            const amount = formatAmount(
              item.amount,
              item.currency ?? defaultCurrency,
              locale,
            );
            const date = formatDate(item.date, locale);
            const isHighlighted = highlightedId === item.id;
            const showConnector = index !== items.length - 1;

            const itemLabel = `${item.title}, 상태: ${statusConfig.label}${amount ? `, 금액: ${amount}` : ""}${date ? `, 날짜: ${date}` : ""}`;

            return (
              <li
                key={item.id}
                role="listitem"
                aria-label={itemLabel}
                style={{
                  position: "relative",
                  display: "flex",
                  ...resolveDot("gap-4"),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      zIndex: 10,
                      ...resolveDot("h-3.5 w-3.5 rounded-full"),
                      border: "2px solid",
                      backgroundColor: statusConfig.dotColor,
                      borderColor: statusConfig.dotColor,
                      boxShadow: statusConfig.shadow,
                      transform: isHighlighted ? "scale(1.1)" : undefined,
                      flexShrink: 0,
                    }}
                    aria-label={`${statusConfig.label} 상태`}
                  />
                  {showConnector && (
                    <span
                      style={{
                        ...resolveDot("mt-1"),
                        flex: 1,
                        width: "1px",
                        backgroundColor: "var(--color-border, #e2e8f0)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    ...resolveDot("rounded-xl p-4 mb-2"),
                    border: isHighlighted ? "2px solid" : "1px solid",
                    borderColor: statusConfig.borderColor,
                    boxShadow: isHighlighted
                      ? "0 1px 3px rgba(0,0,0,0.1)"
                      : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      ...resolveDot("gap-2"),
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "var(--color-foreground, #0f172a)",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        borderRadius: "9999px",
                        padding: "0.125rem 0.5rem",
                        color: statusConfig.textColor,
                      }}
                    >
                      {statusConfig.label}
                    </span>
                    {item.meta && (
                      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {item.meta}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        ...resolveDot("mt-1"),
                        fontSize: "0.875rem",
                        color: "#475569",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                  <div
                    style={{
                      ...resolveDot("mt-3 gap-4"),
                      display: "flex",
                      flexWrap: "wrap",
                      fontSize: "0.75rem",
                      color: "#64748b",
                    }}
                  >
                    {amount && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          ...resolveDot("gap-1"),
                          fontSize: "0.875rem",
                          color: "var(--color-foreground, #334155)",
                        }}
                      >
                        <Icon
                          name="wallet"
                          dot="w-3.5 h-3.5"
                          style={{ color: "#94a3b8" }}
                        />
                        {amount}
                      </div>
                    )}
                    {date && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          ...resolveDot("gap-1"),
                        }}
                      >
                        <Icon
                          name="clock"
                          dot="w-3.5 h-3.5"
                          style={{ color: "#94a3b8" }}
                          aria-hidden={true}
                        />
                        <time
                          dateTime={
                            item.date instanceof Date
                              ? item.date.toISOString()
                              : typeof item.date === "string"
                                ? item.date
                                : undefined
                          }
                        >
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
