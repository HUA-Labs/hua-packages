"use client";

import React from "react";
import { merge } from "../../lib/utils";
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
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MiniBarChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: number[];
  labels?: string[];
  maxValue?: number;
  height?: number;
  showTooltip?: boolean;
  showStats?: boolean;
  color?: Color;
  highlightToday?: boolean;
  todayIndex?: number;
}

// 차트 전용 색상 (막대 그래프용 그라데이션)
const chartColors: Record<Color, { default: string; highlight: string }> = {
  blue: {
    default: "bg-gradient-to-t from-indigo-500 to-cyan-400",
    highlight: "bg-gradient-to-t from-cyan-600 to-cyan-500 shadow-lg",
  },
  purple: {
    default: "bg-gradient-to-t from-purple-500 to-purple-400",
    highlight: "bg-gradient-to-t from-purple-600 to-purple-500 shadow-lg",
  },
  green: {
    default: "bg-gradient-to-t from-green-500 to-green-400",
    highlight: "bg-gradient-to-t from-green-600 to-green-500 shadow-lg",
  },
  orange: {
    default: "bg-gradient-to-t from-orange-500 to-orange-400",
    highlight: "bg-gradient-to-t from-orange-600 to-orange-500 shadow-lg",
  },
  red: {
    default: "bg-gradient-to-t from-red-500 to-red-400",
    highlight: "bg-gradient-to-t from-red-600 to-red-500 shadow-lg",
  },
  indigo: {
    default: "bg-gradient-to-t from-indigo-500 to-indigo-400",
    highlight: "bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-lg",
  },
  pink: {
    default: "bg-gradient-to-t from-pink-500 to-pink-400",
    highlight: "bg-gradient-to-t from-pink-600 to-pink-500 shadow-lg",
  },
  gray: {
    default: "bg-gradient-to-t from-gray-500 to-gray-400",
    highlight: "bg-gradient-to-t from-gray-600 to-gray-500 shadow-lg",
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
      className,
      ...props
    },
    ref
  ) => {
    const colors = chartColors[color];
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
    const chartLabel = labels && labels.length > 0
      ? `미니 막대 그래프 - ${labels.length}개 항목, 최대값 ${max.toLocaleString()}, 평균 ${average.toLocaleString()}`
      : `미니 막대 그래프 - ${data.length}개 항목, 최대값 ${max.toLocaleString()}, 평균 ${average.toLocaleString()}`;

    return (
      <div
        ref={ref}
        role="img"
        aria-label={chartLabel}
        className={merge("w-full", className)}
        {...props}
      >
        {/* 그래프 영역 */}
        <div
          className="flex items-end justify-between gap-2 px-2 relative"
          style={{ height: `${height + 40}px` }}
        >
          {/* 기준선 */}
          <div className="absolute inset-x-2 bottom-8 border-t border-gray-200 dark:border-gray-700 opacity-50"></div>

          {data.map((value, index) => {
            const isToday = highlightToday && index === todayIdx;
            const barHeight = calculateHeight(value);
            const barColor = isToday ? colors.highlight : colors.default;

            return (
              <div
                key={index}
                className="flex flex-col items-center flex-1 group relative"
              >
                {/* 툴팁 */}
                {showTooltip && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {value}개
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                )}

                {/* 값 표시 (호버 시) */}
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {value}
                </div>

                {/* 막대 */}
                <div className="relative w-full flex-1 flex items-end">
                  <div
                    className={merge(
                      "w-full rounded-t-lg transition-all duration-500 ease-out group-hover:scale-105",
                      barColor
                    )}
                    style={{
                      height: `${barHeight}px`,
                      minHeight: "8px",
                    }}
                  >
                    {/* 막대 위 점 */}
                    {value > 0 && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 rounded-full shadow-sm"></div>
                    )}
                  </div>
                </div>

                {/* 라벨 */}
                {labels && labels[index] && (
                  <div
                    className={merge(
                      "text-xs font-medium mt-2 transition-colors duration-200",
                      isToday
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}
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
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-2">
            <div>
              총: {total}
            </div>
            <div>
              평균: {average}
            </div>
            <div>
              최고: {max}
            </div>
          </div>
        )}
      </div>
    );
  }
);

MiniBarChart.displayName = "MiniBarChart";

