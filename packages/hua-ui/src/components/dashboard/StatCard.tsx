"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import type { Color } from "../../lib/types/common";

/**
 * StatCard 컴포넌트의 props / StatCard component props
 * @typedef {Object} StatCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {string | number | null | undefined} value - 통계 값 / Statistic value
 * @property {string} [description] - 카드 설명 / Card description
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {Object} [trend] - 추세 정보 / Trend information
 * @property {number} trend.value - 추세 값 / Trend value
 * @property {string} trend.label - 추세 라벨 / Trend label
 * @property {boolean} [trend.positive] - 긍정적 추세 여부 / Positive trend
 * @property {"default" | "gradient" | "outline" | "elevated"} [variant="elevated"] - 카드 스타일 변형 / Card style variant
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray" | "cyan"} [color="blue"] - 카드 색상 / Card color
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface StatCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  title: string;
  value: string | number | null | undefined;
  description?: string;
  icon?: IconName | React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: "default" | "gradient" | "outline" | "elevated";
  color?: Color;
  loading?: boolean;
  emptyState?: React.ReactNode;
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Base layout styles (CSSProperties) ────────────────────────────────────

const BASE_CARD: React.CSSProperties = {
  ...resolveDot("p-6 rounded-3xl"),
  border: "1px solid",
  transition: "box-shadow 200ms ease-in-out",
};

const GRADIENT_CARD_EXTRAS: React.CSSProperties = {
  color: "white",
};

const ELEVATED_CARD_EXTRAS: React.CSSProperties = {
  boxShadow: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1)",
};

const HOVER_SHADOW: React.CSSProperties = {
  boxShadow: "0 20px 25px -5px rgba(0,0,0,.1), 0 8px 10px -6px rgba(0,0,0,.1)",
};

// ─── Per-color, per-variant CSS variable references ─────────────────────────

type Variant = "default" | "gradient" | "outline" | "elevated";

function getCardBg(color: Color, variant: Variant): React.CSSProperties {
  const c = color;
  switch (variant) {
    case "default":
      return {
        backgroundColor: `var(--stat-card-${c}-default-bg)`,
        borderColor: `var(--stat-card-${c}-default-border)`,
      };
    case "gradient":
      return {
        background: `linear-gradient(135deg, var(--stat-card-${c}-gradient-from), var(--stat-card-${c}-gradient-to))`,
        borderColor: `var(--stat-card-${c}-gradient-border)`,
        ...GRADIENT_CARD_EXTRAS,
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        borderColor: `var(--stat-card-${c}-outline-border)`,
        borderWidth: "2px",
        color: `var(--stat-card-${c}-outline-text)`,
      };
    case "elevated":
      return {
        backgroundColor: `var(--stat-card-${c}-elevated-bg)`,
        borderColor: `var(--stat-card-${c}-elevated-border)`,
        ...ELEVATED_CARD_EXTRAS,
      };
  }
}

function getIconContainerStyle(
  color: Color,
  isGradient: boolean,
): React.CSSProperties {
  const base: React.CSSProperties = {
    ...resolveDot("w-12 h-12 rounded-lg"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
  if (isGradient) {
    return {
      ...base,
      backgroundColor: "rgba(255,255,255,0.2)",
      color: "white",
    };
  }
  return {
    ...base,
    backgroundColor: `var(--stat-card-${color}-icon-bg)`,
    color: `var(--stat-card-${color}-icon-color)`,
  };
}

// Returns a size number for Icon's `size` prop (24px = 1.5rem)
const ICON_SIZE = 24;

function getBadgeStyle(color: Color, isGradient: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: "0.875rem",
    ...resolveDot("px-3 py-1 rounded-full"),
    fontWeight: 500,
  };
  if (isGradient) {
    return {
      ...base,
      backgroundColor: "rgba(255,255,255,0.2)",
      color: "white",
    };
  }
  return {
    ...base,
    backgroundColor: `var(--stat-card-${color}-badge-bg)`,
    color: `var(--stat-card-${color}-badge-text)`,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * StatCard 컴포넌트 / StatCard component
 *
 * 통계 정보를 표시하는 카드 컴포넌트입니다.
 * 제목, 값, 설명, 아이콘, 추세 정보를 포함할 수 있습니다.
 *
 * Card component that displays statistic information.
 * Can include title, value, description, icon, and trend information.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <StatCard
 *   title="총 사용자"
 *   value="1,234"
 *   description="지난 달 대비"
 *   icon="users"
 * />
 *
 * @example
 * // 추세 정보 포함 / With trend information
 * <StatCard
 *   title="매출"
 *   value="₩1,000,000"
 *   trend={{ value: 12.5, label: "전월 대비", positive: true }}
 *   color="green"
 *   variant="gradient"
 * />
 *
 * @param {StatCardProps} props - StatCard 컴포넌트의 props / StatCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} StatCard 컴포넌트 / StatCard component
 */
export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      description,
      icon,
      trend,
      variant = "elevated",
      color = "blue",
      loading = false,
      emptyState,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);

    const isGradient = variant === "gradient";

    const formatValue = (val: string | number): string => {
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val;
    };

    const cardStyle = useMemo((): React.CSSProperties => {
      const colorVariantStyle = getCardBg(color, variant);
      return mergeStyles(
        BASE_CARD,
        colorVariantStyle,
        isHovered ? HOVER_SHADOW : undefined,
        resolveDot(dotProp),
        style,
      );
    }, [color, variant, isHovered, dotProp, style]);

    const emptyCardStyle = useMemo(
      (): React.CSSProperties => ({
        ...resolveDot("rounded-xl p-6"),
        border: "1px solid var(--stat-card-empty-border)",
        backgroundColor: "var(--stat-card-empty-bg)",
        ...resolveDot(dotProp),
        ...style,
      }),
      [dotProp, style],
    );

    // Empty state
    if (!loading && (value === null || value === undefined || value === "")) {
      return emptyState ? (
        <div style={mergeStyles(resolveDot(dotProp), style)} {...props}>
          {emptyState}
        </div>
      ) : (
        <div style={emptyCardStyle} {...props}>
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--stat-card-empty-title)",
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--stat-card-empty-text)",
              margin: "0.5rem 0 0",
            }}
          >
            데이터가 없습니다.
          </p>
        </div>
      );
    }

    const iconContainerStyle = getIconContainerStyle(color, isGradient);
    const badgeStyle = getBadgeStyle(color, isGradient);

    const valueStyle: React.CSSProperties = {
      fontSize: "1.875rem",
      fontWeight: 700,
      ...resolveDot("mb-1"),
      margin: "0 0 0.25rem",
      color: isGradient ? "white" : "var(--stat-card-value-color)",
    };

    const descStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      color: isGradient
        ? "rgba(255,255,255,0.9)"
        : "var(--stat-card-desc-color)",
      margin: 0,
    };

    const loadingBarStyle: React.CSSProperties = {
      ...resolveDot("h-10 rounded-md mb-2"),
      backgroundColor: "var(--stat-card-loading-bg)",
      animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
    };

    const trendRowStyle: React.CSSProperties = {
      ...resolveDot("mt-3 gap-1"),
      display: "flex",
      alignItems: "center",
    };

    return (
      <div
        ref={ref}
        style={cardStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Header row: icon + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            ...resolveDot("mb-4"),
          }}
        >
          {icon && (
            <div style={iconContainerStyle}>
              {typeof icon === "string" ? (
                <Icon
                  name={icon as IconName}
                  size={ICON_SIZE}
                  variant="default"
                />
              ) : (
                icon
              )}
            </div>
          )}

          {title && <span style={badgeStyle}>{title}</span>}
        </div>

        {/* Value */}
        {loading ? (
          <div style={loadingBarStyle} />
        ) : (
          <h3 style={valueStyle}>{formatValue(value ?? 0)}</h3>
        )}

        {/* Description */}
        {description && <p style={descStyle}>{description}</p>}

        {/* Trend */}
        {trend && !loading && (
          <div style={trendRowStyle}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color:
                  trend.positive !== false
                    ? "var(--stat-card-trend-pos)"
                    : "var(--stat-card-trend-neg)",
              }}
            >
              {trend.positive !== false ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: isGradient
                  ? "rgba(255,255,255,0.7)"
                  : "var(--stat-card-trend-muted)",
              }}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    );
  },
);

StatCard.displayName = "StatCard";
