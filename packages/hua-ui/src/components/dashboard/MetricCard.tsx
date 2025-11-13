"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { MiniBarChart } from "./MiniBarChart";

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
  color?: "blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray";
  loading?: boolean;
  showChart?: boolean;
}

const colorClasses = {
  blue: {
    default: "border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 dark:border-blue-500",
    outline: "border-2 border-blue-300 dark:border-blue-600 bg-transparent",
    elevated: "border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    badge: "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    text: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    default: "border-purple-200 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-900/10",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-600 border-purple-400 dark:border-purple-500",
    outline: "border-2 border-purple-300 dark:border-purple-600 bg-transparent",
    elevated: "border-purple-200 dark:border-purple-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
    badge: "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    text: "text-purple-600 dark:text-purple-400",
  },
  green: {
    default: "border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10",
    gradient: "bg-gradient-to-br from-green-500 to-green-600 border-green-400 dark:border-green-500",
    outline: "border-2 border-green-300 dark:border-green-600 bg-transparent",
    elevated: "border-green-200 dark:border-green-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    badge: "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    text: "text-green-600 dark:text-green-400",
  },
  orange: {
    default: "border-orange-200 dark:border-orange-700 bg-orange-50/50 dark:bg-orange-900/10",
    gradient: "bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400 dark:border-orange-500",
    outline: "border-2 border-orange-300 dark:border-orange-600 bg-transparent",
    elevated: "border-orange-200 dark:border-orange-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
    badge: "bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    text: "text-orange-600 dark:text-orange-400",
  },
  red: {
    default: "border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10",
    gradient: "bg-gradient-to-br from-red-500 to-red-600 border-red-400 dark:border-red-500",
    outline: "border-2 border-red-300 dark:border-red-600 bg-transparent",
    elevated: "border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
    badge: "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
    text: "text-red-600 dark:text-red-400",
  },
  indigo: {
    default: "border-indigo-200 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-900/10",
    gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600 border-indigo-400 dark:border-indigo-500",
    outline: "border-2 border-indigo-300 dark:border-indigo-600 bg-transparent",
    elevated: "border-indigo-200 dark:border-indigo-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
    badge: "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
    text: "text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    default: "border-pink-200 dark:border-pink-700 bg-pink-50/50 dark:bg-pink-900/10",
    gradient: "bg-gradient-to-br from-pink-500 to-pink-600 border-pink-400 dark:border-pink-500",
    outline: "border-2 border-pink-300 dark:border-pink-600 bg-transparent",
    elevated: "border-pink-200 dark:border-pink-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
    badge: "bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    text: "text-pink-600 dark:text-pink-400",
  },
  gray: {
    default: "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10",
    gradient: "bg-gradient-to-br from-gray-500 to-gray-600 border-gray-400 dark:border-gray-500",
    outline: "border-2 border-gray-300 dark:border-gray-600 bg-transparent",
    elevated: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg",
    icon: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
    badge: "bg-gray-50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300",
    text: "text-gray-600 dark:text-gray-400",
  },
};

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
    const colors = colorClasses[color];
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient;

    const variantClasses = {
      default: `rounded-2xl border ${colors.default}`,
      gradient: `rounded-2xl border text-white ${colors.gradient}`,
      outline: `rounded-2xl ${colors.outline}`,
      elevated: `rounded-3xl border ${colors.elevated}`,
    };

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
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          {/* 아이콘 */}
          {icon && (
            <div className={merge(
              "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
              isGradient ? "bg-white/20" : colors.icon
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
              isGradient ? "bg-white/20 text-white" : colors.badge
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

