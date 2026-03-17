"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import type { Color } from "../../lib/types/common";

/**
 * MiniBarChart 컴포넌트의 props
 * @typedef {Object} MiniBarChartProps
 * @property {number[]} data - 차트 데이터 배열
 * @property {string[]} [labels] - 라벨 배열
 * @property {number} [maxValue] - 최대값 (자동 계산 시 생략)
 * @property {number} [height=160] - 차트 높이 (px)
 * @property {boolean} [showTooltip=true] - 툴팁 표시 여부
 * @property {boolean} [showStats=true] - 통계 정보 표시 여부
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color="blue"] - 색상
 * @property {boolean} [highlightToday=true] - 오늘 항목 강조 여부
 * @property {number} [todayIndex] - 오늘 인덱스 (기본값: 마지막 항목)
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface MiniBarChartProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  data: number[];
  labels?: string[];
  maxValue?: number;
  height?: number;
  showTooltip?: boolean;
  showStats?: boolean;
  color?: Color;
  highlightToday?: boolean;
  todayIndex?: number;
  dot?: string;
}

// Chart colors as actual CSS values
const chartColorValues: Record<Color, { default: string; highlight: string }> =
  {
    primary: {
      default: "var(--color-primary, #06b6d4)",
      highlight: "var(--color-primary, #0891b2)",
    },
    blue: {
      default: "#6366f1",
      highlight: "#0891b2",
    },
    purple: {
      default: "#a855f7",
      highlight: "#9333ea",
    },
    green: {
      default: "#22c55e",
      highlight: "#16a34a",
    },
    orange: {
      default: "#f97316",
      highlight: "#ea580c",
    },
    red: {
      default: "#ef4444",
      highlight: "#dc2626",
    },
    indigo: {
      default: "#6366f1",
      highlight: "#4f46e5",
    },
    pink: {
      default: "#ec4899",
      highlight: "#db2777",
    },
    gray: {
      default: "#6b7280",
      highlight: "#4b5563",
    },
    cyan: {
      default: "#06b6d4",
      highlight: "#0891b2",
    },
  };

/**
 * MiniBarChart 컴포넌트
 *
 * 작은 막대 그래프 차트 컴포넌트입니다.
 * 간단한 데이터 시각화에 적합하며, 오늘 항목 강조 기능을 제공합니다.
 *
 * Small bar chart component for simple data visualization.
 * Suitable for compact displays with today's item highlight feature.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <MiniBarChart
 *   data={[10, 20, 15, 30, 25, 40, 35]}
 *   labels={["월", "화", "수", "목", "금", "토", "일"]}
 * />
 *
 * @example
 * // 커스텀 색상과 통계 / Custom color and stats
 * <MiniBarChart
 *   data={dailyData}
 *   color="purple"
 *   showStats={true}
 *   highlightToday={true}
 *   todayIndex={6}
 * />
 *
 * @param {MiniBarChartProps} props - MiniBarChart 컴포넌트의 props / MiniBarChart component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} MiniBarChart 컴포넌트 / MiniBarChart component
 */
export const MiniBarChart = React.forwardRef<HTMLDivElement, MiniBarChartProps>(
  (
    {
      data,
      labels,
      maxValue,
      height = 160,
      showTooltip = true,
      showStats = true,
      color = "blue",
      highlightToday = true,
      todayIndex,
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const colors = chartColorValues[color] || chartColorValues.blue;
    const calculatedMax = maxValue || Math.max(...data, 1);
    const fixedMax = Math.max(calculatedMax, 10);
    const todayIdx = todayIndex !== undefined ? todayIndex : data.length - 1;

    const calculateHeight = (value: number): number => {
      if (fixedMax === 0) return 8;
      return Math.max((value / fixedMax) * height, 8);
    };

    const total = data.reduce((sum, val) => sum + val, 0);
    const average = data.length > 0 ? Math.round(total / data.length) : 0;
    const max = Math.max(...data);

    const _chartId = React.useId();
    const chartLabel =
      labels && labels.length > 0
        ? `미니 막대 그래프 - ${labels.length}개 항목, 최대값 ${max.toLocaleString()}, 평균 ${average.toLocaleString()}`
        : `미니 막대 그래프 - ${data.length}개 항목, 최대값 ${max.toLocaleString()}, 평균 ${average.toLocaleString()}`;

    const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

    return (
      <div
        ref={ref}
        role="img"
        aria-label={chartLabel}
        style={mergeStyles({ width: "100%" }, resolveDot(dot), style)}
        {...props}
      >
        {/* 그래프 영역 */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "0.5rem",
            paddingLeft: "0.5rem",
            paddingRight: "0.5rem",
            position: "relative",
            height: `${height + 40}px`,
          }}
        >
          {/* 기준선 */}
          <div
            style={{
              position: "absolute",
              left: "0.5rem",
              right: "0.5rem",
              bottom: "2rem",
              borderTop: "1px solid var(--color-border, #e5e7eb)",
              opacity: 0.5,
            }}
          />

          {data.map((value, index) => {
            const isToday = highlightToday && index === todayIdx;
            const barHeight = calculateHeight(value);
            const barColor = isToday ? colors.highlight : colors.default;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  position: "relative",
                }}
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
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 200ms",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      zIndex: 10,
                    }}
                  >
                    {value}개
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 0,
                        height: 0,
                        borderLeft: "4px solid transparent",
                        borderRight: "4px solid transparent",
                        borderTop: "4px solid #111827",
                      }}
                    />
                  </div>
                )}

                {/* 값 표시 (호버 시) */}
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: "var(--color-foreground, #374151)",
                    marginBottom: "0.25rem",
                    opacity: isHovered ? 1 : 0,
                    transition: "opacity 200ms",
                  }}
                >
                  {value}
                </div>

                {/* 막대 */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      borderTopLeftRadius: "0.5rem",
                      borderTopRightRadius: "0.5rem",
                      transition: "all 500ms ease-out",
                      backgroundColor: barColor,
                      height: `${barHeight}px`,
                      minHeight: "8px",
                      transform: isHovered ? "scaleX(1.05)" : undefined,
                    }}
                  >
                    {/* 막대 위 점 */}
                    {value > 0 && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-4px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "8px",
                          height: "8px",
                          backgroundColor: "var(--color-background, #ffffff)",
                          borderRadius: "50%",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* 라벨 */}
                {labels && labels[index] && (
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      marginTop: "0.5rem",
                      transition: "color 200ms",
                      color: isToday
                        ? "#9333ea"
                        : "var(--color-muted-foreground, #6b7280)",
                    }}
                  >
                    {labels[index]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 통계 정보 */}
        {showStats && (
          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "var(--color-muted-foreground, #6b7280)",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
            }}
          >
            <div>총: {total}</div>
            <div>평균: {average}</div>
            <div>최고: {max}</div>
          </div>
        )}
      </div>
    );
  },
);

MiniBarChart.displayName = "MiniBarChart";
