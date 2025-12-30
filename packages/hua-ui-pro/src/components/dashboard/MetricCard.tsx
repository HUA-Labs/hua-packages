"use client";

import React, { useMemo } from "react";
import { MiniBarChart } from "./MiniBarChart";
import { merge, Icon, useColorStyles, createVariantStyles, type IconName, type Color } from '@hua-labs/ui';

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
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
}


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
      className,
      ...props
    },
    ref
  ) => {
    // 공통 색상 시스템 사용
    const colorStyles = useColorStyles(color);
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient;

    // Variant 스타일 생성 (elevated는 rounded-3xl로 커스터마이징)
    const variantClass = useMemo(() => {
      const baseClass = createVariantStyles(variant, colorStyles);
      // elevated variant는 rounded-3xl 사용
      if (variant === "elevated") {
        return baseClass.replace("rounded-2xl", "rounded-3xl");
      }
      return baseClass;
    }, [variant, colorStyles]);

    const formatValue = (val: string | number): string => {
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val;
    };

    return (
      <div
        ref={ref}
        className={merge(
          "p-6 transition-all duration-200 hover:shadow-xl",
          variantClass,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          {/* 아이콘 */}
          {icon && (
            <div className={merge(
              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
              isGradient ? "bg-white/20" : colorStyles.icon
            )}>
              {typeof icon === "string" ? (
                <Icon
                  name={icon as IconName}
                  className={merge(
                    "w-6 h-6",
                    isTextWhite ? "text-white" : ""
                  )}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {/* 배지 */}
          {title && (
            <span className={merge(
              "text-sm px-3 py-1 rounded-full font-medium",
              isGradient ? "bg-white/20 text-white" : colorStyles.badge
            )}>
              {title}
            </span>
          )}
        </div>

        {/* 값 */}
        {loading ? (
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
        ) : (
          <h3 className={merge(
            "text-3xl font-bold mb-1",
            isTextWhite ? "text-white" : "text-gray-800 dark:text-white"
          )}>
            {formatValue(value)}
          </h3>
        )}

        {/* 설명 */}
        {description && (
          <p className={merge(
            "text-sm mb-3",
            isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-300"
          )}>
            {description}
          </p>
        )}

        {/* 차트 */}
        {showChart && chartData && chartData.length > 0 && (
          <div className="mt-4 mb-3">
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
          <div className="mt-3 flex items-center gap-1">
            <span
              className={merge(
                "text-xs font-medium",
                trend.positive !== false
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.positive !== false ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className={merge(
              "text-xs",
              isTextWhite ? "text-white/70" : "text-gray-500 dark:text-gray-400"
            )}>
              {trend.label}
            </span>
          </div>
        )}
      </div>
    );
  }
);

MetricCard.displayName = "MetricCard";

