"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

/**
 * BarChartData 인터페이스 / BarChartData interface
 * @typedef {Object} BarChartData
 * @property {string} label - 막대 라벨 / Bar label
 * @property {number} value - 막대 값 / Bar value
 * @property {string} [color] - 커스텀 색상 / Custom color
 * @property {boolean} [highlight] - 강조 표시 여부 / Highlight display
 */
export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
}

/**
 * BarChart 컴포넌트의 props / BarChart component props
 * @typedef {Object} BarChartProps
 * @property {BarChartData[]} data - 차트 데이터 배열 / Chart data array
 * @property {string} [title] - 차트 제목 / Chart title
 * @property {number} [height=200] - 차트 높이 (px) / Chart height (px)
 * @property {boolean} [showValues=true] - 값 표시 여부 / Show values
 * @property {boolean} [showLabels=true] - 라벨 표시 여부 / Show labels
 * @property {number} [maxValue] - 최대값 (자동 계산 시 생략) / Maximum value (omit for auto-calculation)
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [colorScheme="blue"] - 색상 스킴 / Color scheme
 * @property {"default" | "gradient"} [variant="gradient"] - 차트 스타일 변형 / Chart style variant
 * @property {boolean} [showGrid=true] - 그리드 표시 여부 / Show grid
 * @property {boolean} [showTooltip] - 툴팁 표시 여부 / Show tooltip
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface BarChartProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  showLabels?: boolean;
  maxValue?: number;
  colorScheme?: "blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray";
  variant?: "default" | "gradient";
  showGrid?: boolean;
  showTooltip?: boolean;
  dot?: string;
}

// Color scheme maps — using explicit hex values to avoid Tailwind class resolution issues
const colorSchemeValues = {
  blue: {
    default: "#6366f1",
    gradient: ["#6366f1", "#0891b2"],
    highlight: ["#0891b2", "#0e7490"],
  },
  purple: {
    default: "#a855f7",
    gradient: ["#a855f7", "#9333ea"],
    highlight: ["#9333ea", "#7e22ce"],
  },
  green: {
    default: "#22c55e",
    gradient: ["#22c55e", "#16a34a"],
    highlight: ["#16a34a", "#15803d"],
  },
  orange: {
    default: "#f97316",
    gradient: ["#f97316", "#ea580c"],
    highlight: ["#ea580c", "#c2410c"],
  },
  red: {
    default: "#ef4444",
    gradient: ["#ef4444", "#dc2626"],
    highlight: ["#dc2626", "#b91c1c"],
  },
  indigo: {
    default: "#6366f1",
    gradient: ["#6366f1", "#4f46e5"],
    highlight: ["#4f46e5", "#4338ca"],
  },
  pink: {
    default: "#ec4899",
    gradient: ["#ec4899", "#db2777"],
    highlight: ["#db2777", "#be185d"],
  },
  gray: {
    default: "#6b7280",
    gradient: ["#6b7280", "#4b5563"],
    highlight: ["#4b5563", "#374151"],
  },
};

/**
 * BarChart 컴포넌트
 *
 * 막대 차트를 표시하는 컴포넌트입니다.
 * 다양한 색상 스킴과 그라디언트 스타일을 지원합니다.
 *
 * Bar chart component that displays data in bar format.
 * Supports various color schemes and gradient styles.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <BarChart
 *   data={[
 *     { label: "월", value: 100 },
 *     { label: "화", value: 200 },
 *     { label: "수", value: 150 }
 *   ]}
 *   title="주간 매출"
 * />
 *
 * @example
 * // 커스텀 색상 및 강조 / Custom color and highlight
 * <BarChart
 *   data={[
 *     { label: "1월", value: 1000, highlight: true },
 *     { label: "2월", value: 1200 },
 *     { label: "3월", value: 1500 }
 *   ]}
 *   colorScheme="green"
 *   variant="gradient"
 *   showTooltip
 * />
 *
 * @param {BarChartProps} props - BarChart 컴포넌트의 props / BarChart component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} BarChart 컴포넌트 / BarChart component
 */
export const BarChart = React.forwardRef<HTMLDivElement, BarChartProps>(
  (
    {
      data,
      title,
      height = 200,
      showValues = true,
      showLabels = true,
      maxValue,
      colorScheme = "blue",
      variant = "gradient",
      showGrid = true,
      showTooltip = true,
      dot,
      style,
      ...props
    },
    ref
  ) => {
    const colors = colorSchemeValues[colorScheme];

    // 성능 최적화: max 값 계산을 useMemo로 메모이제이션
    // Performance optimization: Memoize max value calculation with useMemo
    const max = React.useMemo(() => {
      return maxValue || Math.max(...data.map((d) => d.value), 1);
    }, [maxValue, data]);

    // 성능 최적화: chartLabel 계산을 useMemo로 메모이제이션
    // Performance optimization: Memoize chartLabel calculation with useMemo
    const chartLabel = React.useMemo(() => {
      return title
        ? `${title} 차트 - 총 ${data.length}개 항목, 최대값 ${max.toLocaleString()}`
        : `막대 그래프 차트 - 총 ${data.length}개 항목, 최대값 ${max.toLocaleString()}`;
    }, [title, data.length, max]);

    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
    const _chartId = React.useId();

    return (
      <div
        ref={ref}
        role="img"
        aria-label={chartLabel}
        style={mergeStyles(
          resolveDot("rounded-2xl p-6"),
          {
            backgroundColor: "var(--color-background, #ffffff)",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
            border: "1px solid var(--color-border, #e5e7eb)",
          },
          resolveDot(dot),
          style
        )}
        {...props}
      >
        {title && (
          <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-foreground, #111827)" }}>
            {title}
          </h3>
        )}

        <div style={{ position: "relative", height: `${height}px` }} aria-hidden="true">
          {/* 그리드 라인 */}
          {showGrid && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  style={{
                    borderTop: "1px solid var(--color-border, #e5e7eb)",
                    opacity: 0.3,
                    marginTop: percent === 0 ? 0 : `${(percent / 100) * height - 1}px`,
                  }}
                />
              ))}
            </div>
          )}

          {/* 막대 그래프 */}
          <div style={{ position: "relative", height: "100%", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "0.5rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
            {data.map((item, index) => {
              const barHeight = max > 0 ? (item.value / max) * (height - 40) : 0;
              const isHighlighted = item.highlight || hoveredIndex === index;
              const barColor = item.color
                ? item.color
                : variant === "gradient"
                ? (isHighlighted ? colors.highlight[0] : colors.gradient[0])
                : colors.default;

              return (
                <div
                  key={index}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* 툴팁 */}
                  {showTooltip && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginBottom: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        backgroundColor: "#111827",
                        color: "#ffffff",
                        fontSize: "0.75rem",
                        borderRadius: "0.25rem",
                        opacity: hoveredIndex === index ? 1 : 0,
                        transition: "opacity 200ms",
                        pointerEvents: "none",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                      }}
                    >
                      {item.label}: {item.value.toLocaleString()}
                      <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #111827" }} />
                    </div>
                  )}

                  {/* 값 표시 */}
                  {showValues && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        marginBottom: "0.25rem",
                        transition: "opacity 200ms",
                        opacity: hoveredIndex === index ? 1 : 0,
                        color: hoveredIndex === index ? "var(--color-foreground, #111827)" : "var(--color-muted-foreground, #6b7280)",
                      }}
                    >
                      {item.value.toLocaleString()}
                    </div>
                  )}

                  {/* 막대 */}
                  <div style={{ position: "relative", width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
                    <div
                      style={{
                        width: "100%",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                        transition: "all 500ms ease-out",
                        backgroundColor: barColor,
                        height: `${Math.max(barHeight, 4)}px`,
                        minHeight: "4px",
                        boxShadow: isHighlighted ? "0 10px 15px -3px rgba(0,0,0,0.1)" : undefined,
                        transform: isHighlighted ? "scaleX(1.05)" : undefined,
                      }}
                    >
                      {/* 막대 위 점 */}
                      {item.value > 0 && (
                        <div style={{ position: "absolute", top: "-4px", left: "50%", transform: "translateX(-50%)", width: "8px", height: "8px", backgroundColor: "var(--color-background, #ffffff)", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }} />
                      )}
                    </div>
                  </div>

                  {/* 라벨 */}
                  {showLabels && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        marginTop: "0.5rem",
                        transition: "color 200ms",
                        color: isHighlighted ? "#9333ea" : "var(--color-muted-foreground, #6b7280)",
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 통계 */}
        {data.length > 0 && (
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--color-muted-foreground, #6b7280)", paddingLeft: "0.5rem", paddingRight: "0.5rem" }}>
            <div>
              총: {data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
            </div>
            <div>
              평균:{" "}
              {Math.round(
                data.reduce((sum, item) => sum + item.value, 0) / data.length
              ).toLocaleString()}
            </div>
            <div>최고: {max.toLocaleString()}</div>
          </div>
        )}
      </div>
    );
  }
);

BarChart.displayName = "BarChart";
