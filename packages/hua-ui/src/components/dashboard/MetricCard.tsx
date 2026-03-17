"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { MiniBarChart } from "./MiniBarChart";
import type { Color } from "../../lib/types/common";

/**
 * MetricCard 컴포넌트의 props / MetricCard component props
 * @typedef {Object} MetricCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {string | number} value - 메트릭 값 / Metric value
 * @property {string} [description] - 카드 설명 / Card description
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {Object} [trend] - 추세 정보 / Trend information
 * @property {number} trend.value - 추세 값 / Trend value
 * @property {string} trend.label - 추세 라벨 / Trend label
 * @property {boolean} [trend.positive] - 긍정적 추세 여부 / Positive trend
 * @property {number[]} [chartData] - 차트 데이터 / Chart data
 * @property {string[]} [chartLabels] - 차트 라벨 / Chart labels
 * @property {"default" | "gradient" | "outline" | "elevated"} [variant="default"] - 카드 스타일 변형 / Card style variant
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color] - 카드 색상 / Card color
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @property {boolean} [showChart] - 차트 표시 여부 / Show chart
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface MetricCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  title: string;
  value: string | number;
  description?: string;
  icon?: IconName | React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  chartData?: number[];
  chartLabels?: string[];
  variant?: "default" | "gradient" | "outline" | "elevated";
  color?: Color;
  loading?: boolean;
  showChart?: boolean;
  dot?: string;
}

// Color token maps for variants
const colorTokens: Record<
  Color,
  {
    gradientBg: string;
    defaultBorder: string;
    defaultBg: string;
    iconBg: string;
    iconText: string;
    badgeBg: string;
    badgeText: string;
  }
> = {
  blue: {
    gradientBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
    defaultBorder: "#bfdbfe",
    defaultBg: "rgba(239,246,255,0.5)",
    iconBg: "rgba(219,234,254,0.3)",
    iconText: "#2563eb",
    badgeBg: "rgba(239,246,255,0.3)",
    badgeText: "#1d4ed8",
  },
  purple: {
    gradientBg: "linear-gradient(135deg, #a855f7, #9333ea)",
    defaultBorder: "#e9d5ff",
    defaultBg: "rgba(250,245,255,0.5)",
    iconBg: "rgba(233,213,255,0.3)",
    iconText: "#9333ea",
    badgeBg: "rgba(250,245,255,0.3)",
    badgeText: "#7e22ce",
  },
  green: {
    gradientBg: "linear-gradient(135deg, #22c55e, #16a34a)",
    defaultBorder: "#bbf7d0",
    defaultBg: "rgba(240,253,244,0.5)",
    iconBg: "rgba(187,247,208,0.3)",
    iconText: "#16a34a",
    badgeBg: "rgba(240,253,244,0.3)",
    badgeText: "#15803d",
  },
  orange: {
    gradientBg: "linear-gradient(135deg, #f97316, #ea580c)",
    defaultBorder: "#fed7aa",
    defaultBg: "rgba(255,247,237,0.5)",
    iconBg: "rgba(254,215,170,0.3)",
    iconText: "#ea580c",
    badgeBg: "rgba(255,247,237,0.3)",
    badgeText: "#c2410c",
  },
  red: {
    gradientBg: "linear-gradient(135deg, #ef4444, #dc2626)",
    defaultBorder: "#fecaca",
    defaultBg: "rgba(254,242,242,0.5)",
    iconBg: "rgba(254,202,202,0.3)",
    iconText: "#dc2626",
    badgeBg: "rgba(254,242,242,0.3)",
    badgeText: "#b91c1c",
  },
  indigo: {
    gradientBg: "linear-gradient(135deg, #6366f1, #4f46e5)",
    defaultBorder: "#c7d2fe",
    defaultBg: "rgba(238,242,255,0.5)",
    iconBg: "rgba(199,210,254,0.3)",
    iconText: "#4f46e5",
    badgeBg: "rgba(238,242,255,0.3)",
    badgeText: "#4338ca",
  },
  pink: {
    gradientBg: "linear-gradient(135deg, #ec4899, #db2777)",
    defaultBorder: "#fbcfe8",
    defaultBg: "rgba(253,242,248,0.5)",
    iconBg: "rgba(251,207,232,0.3)",
    iconText: "#db2777",
    badgeBg: "rgba(253,242,248,0.3)",
    badgeText: "#be185d",
  },
  gray: {
    gradientBg: "linear-gradient(135deg, #6b7280, #4b5563)",
    defaultBorder: "#e5e7eb",
    defaultBg: "rgba(249,250,251,0.5)",
    iconBg: "rgba(229,231,235,0.3)",
    iconText: "#4b5563",
    badgeBg: "rgba(249,250,251,0.3)",
    badgeText: "#374151",
  },
  cyan: {
    gradientBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
    defaultBorder: "#a5f3fc",
    defaultBg: "rgba(236,254,255,0.5)",
    iconBg: "rgba(165,243,252,0.3)",
    iconText: "#0891b2",
    badgeBg: "rgba(236,254,255,0.3)",
    badgeText: "#0e7490",
  },
  primary: {
    gradientBg:
      "linear-gradient(135deg, var(--color-primary, #06b6d4), var(--color-primary, #0891b2))",
    defaultBorder: "var(--color-primary, #a5f3fc)",
    defaultBg: "rgba(var(--color-primary-rgb, 6,182,212),0.05)",
    iconBg: "rgba(var(--color-primary-rgb, 6,182,212),0.15)",
    iconText: "var(--color-primary, #0891b2)",
    badgeBg: "rgba(var(--color-primary-rgb, 6,182,212),0.1)",
    badgeText: "var(--color-primary, #0e7490)",
  },
};

/**
 * MetricCard 컴포넌트 / MetricCard component
 *
 * 메트릭 정보를 표시하는 카드 컴포넌트입니다.
 * StatCard와 유사하지만 차트 데이터를 포함할 수 있습니다.
 *
 * Card component that displays metric information.
 * Similar to StatCard but can include chart data.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <MetricCard
 *   title="페이지뷰"
 *   value="10,234"
 *   description="오늘"
 *   icon="eye"
 * />
 *
 * @example
 * // 차트 포함 / With chart
 * <MetricCard
 *   title="방문자"
 *   value="5,678"
 *   chartData={[100, 200, 150, 300, 250]}
 *   chartLabels={["월", "화", "수", "목", "금"]}
 *   showChart
 *   color="blue"
 * />
 *
 * @param {MetricCardProps} props - MetricCard 컴포넌트의 props / MetricCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} MetricCard 컴포넌트 / MetricCard component
 */
export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  (
    {
      title,
      value,
      description,
      icon,
      trend,
      chartData,
      chartLabels,
      variant = "elevated",
      color = "blue",
      loading = false,
      showChart = false,
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const tokens = colorTokens[color] || colorTokens.blue;
    const isGradient = variant === "gradient";

    const containerStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        padding: "1.5rem",
        transition: "all 200ms",
        borderRadius: variant === "elevated" ? "1.5rem" : "1rem",
        border: "1px solid",
      };

      switch (variant) {
        case "gradient":
          return {
            ...base,
            backgroundImage: tokens.gradientBg,
            borderColor: "transparent",
            color: "#ffffff",
          };
        case "default":
          return {
            ...base,
            borderColor: tokens.defaultBorder,
            backgroundColor: tokens.defaultBg,
          };
        case "outline":
          return {
            ...base,
            borderWidth: "2px",
            borderColor: tokens.defaultBorder,
            backgroundColor: "transparent",
          };
        case "elevated":
        default:
          return {
            ...base,
            borderColor: tokens.defaultBorder,
            backgroundColor: "#ffffff",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          };
      }
    }, [variant, tokens]);

    const formatValue = (val: string | number): string => {
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val;
    };

    return (
      <div
        ref={ref}
        style={mergeStyles(containerStyle, resolveDot(dot), style)}
        {...props}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          {/* 아이콘 */}
          {icon && (
            <div
              style={{
                width: "3rem",
                height: "3rem",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                backgroundColor: isGradient
                  ? "rgba(255,255,255,0.2)"
                  : tokens.iconBg,
              }}
            >
              {typeof icon === "string" ? (
                <Icon
                  name={icon as IconName}
                  dot="w-6 h-6"
                  style={{ color: isGradient ? "#ffffff" : tokens.iconText }}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {/* 배지 */}
          {title && (
            <span
              style={{
                fontSize: "0.875rem",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                fontWeight: 500,
                backgroundColor: isGradient
                  ? "rgba(255,255,255,0.2)"
                  : tokens.badgeBg,
                color: isGradient ? "#ffffff" : tokens.badgeText,
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* 값 */}
        {loading ? (
          <div
            style={{
              height: "2.5rem",
              backgroundColor: "#e5e7eb",
              borderRadius: "0.25rem",
              animation: "pulse 2s infinite",
              marginBottom: "0.5rem",
            }}
          />
        ) : (
          <h3
            style={{
              fontSize: "1.875rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
              color: isGradient
                ? "#ffffff"
                : "var(--color-foreground, #1f2937)",
            }}
          >
            {formatValue(value)}
          </h3>
        )}

        {/* 설명 */}
        {description && (
          <p
            style={{
              fontSize: "0.875rem",
              marginBottom: "0.75rem",
              color: isGradient
                ? "rgba(255,255,255,0.9)"
                : "var(--color-muted-foreground, #4b5563)",
            }}
          >
            {description}
          </p>
        )}

        {/* 차트 */}
        {showChart && chartData && chartData.length > 0 && (
          <div style={{ marginTop: "1rem", marginBottom: "0.75rem" }}>
            <MiniBarChart
              data={chartData}
              labels={chartLabels}
              color={color}
              height={100}
              showStats={false}
            />
          </div>
        )}

        {/* 트렌드 */}
        {trend && !loading && (
          <div
            style={{
              marginTop: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: trend.positive !== false ? "#16a34a" : "#dc2626",
              }}
            >
              {trend.positive !== false ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: isGradient
                  ? "rgba(255,255,255,0.7)"
                  : "var(--color-muted-foreground, #6b7280)",
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

MetricCard.displayName = "MetricCard";
