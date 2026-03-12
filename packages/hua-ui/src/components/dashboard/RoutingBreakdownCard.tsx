"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { DashboardEmptyState } from "./EmptyState";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

type RoutingStatus = "normal" | "warning" | "critical";

/**
 * 라우팅 분할 세그먼트 인터페이스 / RoutingBreakdownSegment interface
 * @typedef {Object} RoutingBreakdownSegment
 * @property {string} id - 세그먼트 고유 ID / Segment unique ID
 * @property {string} label - 세그먼트 라벨 / Segment label
 * @property {number} value - 세그먼트 값 / Segment value
 * @property {string} [color] - 커스텀 색상 / Custom color
 * @property {RoutingStatus} [status] - 상태 / Status
 * @property {string} [icon] - 아이콘 이름 / Icon name
 * @property {string} [detail] - 상세 정보 / Detail information
 */
export interface RoutingBreakdownSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
  status?: RoutingStatus;
  icon?: string;
  detail?: string;
}

/**
 * RoutingBreakdownCard 컴포넌트의 props / RoutingBreakdownCard component props
 * @typedef {Object} RoutingBreakdownCardProps
 * @property {string} [title="PG / 결제수단 비중"] - 카드 제목 / Card title
 * @property {string} [description="라우팅별 처리 비율과 상태"] - 카드 설명 / Card description
 * @property {RoutingBreakdownSegment[]} segments - 세그먼트 배열 / Segments array
 * @property {string} [totalLabel="총 거래"] - 총계 라벨 / Total label
 * @property {React.ReactNode} [totalValue] - 총계 값 / Total value
 * @property {string} [highlightId] - 강조할 세그먼트 ID / Highlighted segment ID
 * @property {React.ReactNode} [actions] - 액션 컴포넌트 / Actions component
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {(segment: RoutingBreakdownSegment, percentage: number) => React.ReactNode} [formatter] - 커스텀 포맷터 / Custom formatter
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface RoutingBreakdownCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  title?: string;
  description?: string;
  segments: RoutingBreakdownSegment[];
  totalLabel?: string;
  totalValue?: React.ReactNode;
  highlightId?: string;
  actions?: React.ReactNode;
  emptyState?: React.ReactNode;
  formatter?: (
    segment: RoutingBreakdownSegment,
    percentage: number,
  ) => React.ReactNode;
  dot?: string;
}

const DEFAULT_COLORS = [
  "#0ea5e9",
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#a855f7",
  "#ef4444",
];

const STATUS_BADGE_STYLES: Record<RoutingStatus, React.CSSProperties> = {
  normal: { backgroundColor: "#ecfdf5", color: "#047857" },
  warning: { backgroundColor: "#fffbeb", color: "#b45309" },
  critical: { backgroundColor: "#fff1f2", color: "#be123c" },
};

const STATUS_LABELS: Record<RoutingStatus, string> = {
  normal: "정상",
  warning: "감시",
  critical: "장애",
};

const formatPercentage = (value: number, total: number) => {
  if (total <= 0) return "0%";
  return `${Math.round((value / total) * 1000) / 10}%`;
};

/**
 * RoutingBreakdownCard 컴포넌트
 *
 * PG 라우팅 또는 결제수단별 비중을 표시하는 카드 컴포넌트입니다.
 * 진행 바와 세그먼트별 상세 정보를 제공합니다.
 *
 * Card component that displays PG routing or payment method breakdown.
 * Provides progress bar and detailed information for each segment.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <RoutingBreakdownCard
 *   title="PG 라우팅 비중"
 *   segments={[
 *     { id: "pg1", label: "PG A", value: 5000, status: "normal" },
 *     { id: "pg2", label: "PG B", value: 3000, status: "warning" },
 *     { id: "pg3", label: "PG C", value: 2000, status: "normal" }
 *   ]}
 *   totalValue="10,000"
 * />
 *
 * @example
 * // 강조 기능 / Highlight feature
 * <RoutingBreakdownCard
 *   segments={segments}
 *   highlightId="pg1"
 *   formatter={(segment, percentage) => (
 *     <div>
 *       <span>{segment.value.toLocaleString()}</span>
 *       <span>{percentage}%</span>
 *     </div>
 *   )}
 * />
 *
 * @param {RoutingBreakdownCardProps} props - RoutingBreakdownCard 컴포넌트의 props / RoutingBreakdownCard component props
 * @returns {JSX.Element} RoutingBreakdownCard 컴포넌트 / RoutingBreakdownCard component
 */
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
  dot,
  style,
  ...props
}) => {
  const hasSegments = segments.length > 0;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div
      style={mergeStyles(
        {
          borderRadius: "1rem",
          border: "1px solid var(--color-border, #f1f5f9)",
          backgroundColor: "var(--color-card, rgba(255,255,255,0.6))",
          padding: "1.25rem",
        },
        resolveDot(dot),
        style,
      )}
      {...props}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
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
            {title}
          </p>
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>{description}</p>
        </div>
        {actions && (
          <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{actions}</div>
        )}
      </div>

      {!hasSegments ? (
        (emptyState ?? (
          <DashboardEmptyState
            icon="pie-chart"
            title="라우팅 데이터가 없습니다"
            description="PG 라우팅 혹은 결제수단 정보가 수집되면 자동으로 표시됩니다."
            size="sm"
            style={{ marginTop: "1rem" }}
          />
        ))
      ) : (
        <>
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                display: "flex",
                height: "0.75rem",
                overflow: "hidden",
                borderRadius: "9999px",
                backgroundColor: "var(--color-muted, #f1f5f9)",
              }}
            >
              {segments.map((segment, index) => {
                const width = total === 0 ? 0 : (segment.value / total) * 100;
                const color =
                  segment.color ??
                  DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                return (
                  <div
                    key={segment.id}
                    style={{
                      height: "100%",
                      transition: "all 150ms",
                      width: `${width}%`,
                      backgroundColor: color,
                      opacity:
                        highlightId && highlightId !== segment.id ? 0.4 : 1,
                    }}
                    aria-label={`${segment.label} ${formatPercentage(segment.value, total)}`}
                  />
                );
              })}
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.75rem",
                color: "#64748b",
              }}
            >
              {totalLabel}: {totalValue ?? total.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {segments.map((segment, index) => {
              const color =
                segment.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              const percentage =
                total === 0 ? 0 : (segment.value / total) * 100;
              const badgeStyle = segment.status
                ? STATUS_BADGE_STYLES[segment.status]
                : null;
              const statusLabel = segment.status
                ? STATUS_LABELS[segment.status]
                : null;
              const customContent = formatter?.(segment, percentage);
              const isHighlighted = highlightId === segment.id;

              return (
                <div
                  key={segment.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.75rem",
                    borderRadius: "0.75rem",
                    border: isHighlighted
                      ? "2px solid var(--color-border, #e2e8f0)"
                      : "1px solid var(--color-border, #f1f5f9)",
                    padding: "0.75rem",
                    transition: "border-color 150ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      minWidth: "3rem",
                    }}
                  >
                    {segment.icon && (
                      <span
                        style={{
                          borderRadius: "0.5rem",
                          backgroundColor: "var(--color-muted, #f1f5f9)",
                          padding: "0.375rem",
                          color: "#64748b",
                        }}
                      >
                        <Icon name={segment.icon as IconName} dot="w-4 h-4" />
                      </span>
                    )}
                    <div
                      style={{
                        height: "0.5rem",
                        width: "3rem",
                        borderRadius: "9999px",
                        backgroundColor: color,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "var(--color-foreground, #0f172a)",
                        }}
                      >
                        {segment.label}
                      </span>
                      {badgeStyle && statusLabel && (
                        <span
                          style={{
                            borderRadius: "9999px",
                            padding: "0.125rem 0.5rem",
                            fontSize: "0.6875rem",
                            fontWeight: 500,
                            ...badgeStyle,
                          }}
                        >
                          {statusLabel}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {segment.detail}
                    </div>
                  </div>
                  {customContent ?? (
                    <div
                      style={{
                        textAlign: "right",
                        fontSize: "0.875rem",
                        color: "var(--color-foreground, #334155)",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>
                        {segment.value.toLocaleString()}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                        {formatPercentage(segment.value, total)}
                      </div>
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
