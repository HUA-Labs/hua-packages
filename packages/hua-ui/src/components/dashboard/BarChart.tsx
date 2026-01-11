"use client";

import React from "react";
import { merge } from "../../lib/utils";

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
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface BarChartProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

const colorSchemes = {
  blue: {
    default: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    highlight: "from-blue-600 to-blue-700",
  },
  purple: {
    default: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
    highlight: "from-purple-600 to-purple-700",
  },
  green: {
    default: "bg-green-500",
    gradient: "from-green-500 to-green-600",
    highlight: "from-green-600 to-green-700",
  },
  orange: {
    default: "bg-orange-500",
    gradient: "from-orange-500 to-orange-600",
    highlight: "from-orange-600 to-orange-700",
  },
  red: {
    default: "bg-red-500",
    gradient: "from-red-500 to-red-600",
    highlight: "from-red-600 to-red-700",
  },
  indigo: {
    default: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-600",
    highlight: "from-indigo-600 to-indigo-700",
  },
  pink: {
    default: "bg-pink-500",
    gradient: "from-pink-500 to-pink-600",
    highlight: "from-pink-600 to-pink-700",
  },
  gray: {
    default: "bg-gray-500",
    gradient: "from-gray-500 to-gray-600",
    highlight: "from-gray-600 to-gray-700",
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
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorSchemes[colorScheme];
    
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
        className={merge(
          "bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6",
          className
        )}
        {...props}
      >
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {title}
          </h3>
        )}

        <div className="relative" style={{ height: `${height}px` }} aria-hidden="true">
          {/* 그리드 라인 */}
          {showGrid && (
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 25, 50, 75, 100].map((percent) => (
                <div
                  key={percent}
                  className="border-t border-gray-200 dark:border-gray-700 opacity-30"
                  style={{ marginTop: `${percent === 0 ? 0 : (percent / 100) * height - 1}px` }}
                />
              ))}
            </div>
          )}

          {/* 막대 그래프 */}
          <div className="relative h-full flex items-end justify-between gap-2 px-2">
            {data.map((item, index) => {
              const barHeight = max > 0 ? (item.value / max) * (height - 40) : 0;
              const isHighlighted = item.highlight || hoveredIndex === index;
              const barColor = item.color
                ? item.color
                : variant === "gradient"
                ? `bg-gradient-to-t ${isHighlighted ? colors.highlight : colors.gradient}`
                : colors.default;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center flex-1 group relative"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* 툴팁 */}
                  {showTooltip && (
                    <div
                      className={merge(
                        "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10"
                      )}
                    >
                      {item.label}: {item.value.toLocaleString()}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  )}

                  {/* 값 표시 */}
                  {showValues && (
                    <div
                      className={merge(
                        "text-xs font-medium mb-1 transition-opacity duration-200",
                        hoveredIndex === index
                          ? "opacity-100 text-gray-900 dark:text-white"
                          : "opacity-0 group-hover:opacity-100 text-gray-600 dark:text-gray-400"
                      )}
                    >
                      {item.value.toLocaleString()}
                    </div>
                  )}

                  {/* 막대 */}
                  <div className="relative w-full flex-1 flex items-end">
                    <div
                      className={merge(
                        "w-full rounded-t-lg transition-all duration-500 ease-out",
                        barColor,
                        isHighlighted && "shadow-lg scale-105"
                      )}
                      style={{
                        height: `${Math.max(barHeight, 4)}px`,
                        minHeight: "4px",
                      }}
                    >
                      {/* 막대 위 점 */}
                      {item.value > 0 && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 rounded-full shadow-sm"></div>
                      )}
                    </div>
                  </div>

                  {/* 라벨 */}
                  {showLabels && (
                    <div
                      className={merge(
                        "text-xs font-medium mt-2 transition-colors duration-200",
                        isHighlighted
                          ? "text-purple-600 dark:text-purple-400"
                          : "text-gray-500 dark:text-gray-400"
                      )}
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
          <div className="mt-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-2">
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

