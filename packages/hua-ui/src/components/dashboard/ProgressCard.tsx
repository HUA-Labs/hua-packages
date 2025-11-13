"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface ProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  icon?: IconName | React.ReactNode;
  color?: "blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray";
  variant?: "default" | "gradient" | "outline" | "elevated";
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-700",
    progress: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    border: "border-purple-200 dark:border-purple-700",
    progress: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
    text: "text-purple-600 dark:text-purple-400",
    icon: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    border: "border-green-200 dark:border-green-700",
    progress: "bg-green-500",
    gradient: "from-green-500 to-green-600",
    text: "text-green-600 dark:text-green-400",
    icon: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  orange: {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    border: "border-orange-200 dark:border-orange-700",
    progress: "bg-orange-500",
    gradient: "from-orange-500 to-orange-600",
    text: "text-orange-600 dark:text-orange-400",
    icon: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    border: "border-red-200 dark:border-red-700",
    progress: "bg-red-500",
    gradient: "from-red-500 to-red-600",
    text: "text-red-600 dark:text-red-400",
    icon: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    border: "border-indigo-200 dark:border-indigo-700",
    progress: "bg-indigo-500",
    gradient: "from-indigo-500 to-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    icon: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    border: "border-pink-200 dark:border-pink-700",
    progress: "bg-pink-500",
    gradient: "from-pink-500 to-pink-600",
    text: "text-pink-600 dark:text-pink-400",
    icon: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  },
  gray: {
    bg: "bg-gray-50 dark:bg-gray-900/20",
    border: "border-gray-200 dark:border-gray-700",
    progress: "bg-gray-500",
    gradient: "from-gray-500 to-gray-600",
    text: "text-gray-600 dark:text-gray-400",
    icon: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  },
};

const sizeStyles = {
  sm: {
    container: "p-4",
    icon: "w-8 h-8",
    iconSize: "w-4 h-4",
    title: "text-sm",
    value: "text-xl",
    progress: "h-1.5",
  },
  md: {
    container: "p-6",
    icon: "w-12 h-12",
    iconSize: "w-6 h-6",
    title: "text-base",
    value: "text-2xl",
    progress: "h-2",
  },
  lg: {
    container: "p-8",
    icon: "w-16 h-16",
    iconSize: "w-8 h-8",
    title: "text-lg",
    value: "text-3xl",
    progress: "h-3",
  },
};

export const ProgressCard = React.forwardRef<HTMLDivElement, ProgressCardProps>(
  (
    {
      title,
      current,
      total,
      unit = "",
      description,
      icon,
      color = "blue",
      variant = "elevated",
      showPercentage = true,
      showLabel = true,
      size = "md",
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorClasses[color];
    const sizes = sizeStyles[size];
    const percentage = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;
    const isGradient = variant === "gradient";

    const variantClasses = {
      default: `rounded-2xl border ${colors.border} ${colors.bg}`,
      gradient: `rounded-2xl border text-white bg-gradient-to-br ${colors.gradient}`,
      outline: `rounded-2xl border-2 ${colors.border} bg-transparent`,
      elevated: `rounded-3xl border ${colors.border} bg-white dark:bg-gray-800 shadow-lg`,
    };

    return (
      <div
        ref={ref}
        className={merge(
          "transition-all duration-200 hover:shadow-xl",
          variantClasses[variant],
          sizes.container,
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-4">
          {/* 아이콘 */}
          {icon && (
            <div
              className={merge(
                "rounded-lg flex items-center justify-center flex-shrink-0",
                sizes.icon,
                isGradient ? "bg-white/20" : colors.icon
              )}
            >
              {typeof icon === "string" ? (
                <Icon
                  name={icon as IconName}
                  className={merge(
                    sizes.iconSize,
                    isGradient ? "text-white" : ""
                  )}
                />
              ) : (
                icon
              )}
            </div>
          )}

          {/* 제목 */}
          <div className="flex-1 ml-4">
            <h3
              className={merge(
                "font-semibold mb-1",
                sizes.title,
                isGradient ? "text-white" : "text-gray-800 dark:text-white"
              )}
            >
              {title}
            </h3>
            {description && (
              <p
                className={merge(
                  "text-sm",
                  isGradient ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                )}
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {/* 진행률 표시 */}
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ) : (
          <>
            {/* 값 표시 */}
            <div className="flex items-baseline justify-between mb-2">
              <span
                className={merge(
                  "font-bold",
                  sizes.value,
                  isGradient ? "text-white" : colors.text
                )}
              >
                {current.toLocaleString()}
                {unit && <span className="text-sm ml-1">{unit}</span>}
              </span>
              {showLabel && (
                <span
                  className={merge(
                    "text-sm",
                    isGradient ? "text-white/80" : "text-gray-600 dark:text-gray-400"
                  )}
                >
                  / {total.toLocaleString()}
                  {unit && <span className="ml-1">{unit}</span>}
                </span>
              )}
            </div>

            {/* 진행률 바 */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={merge(
                  "rounded-full transition-all duration-500",
                  sizes.progress,
                  isGradient
                    ? `bg-gradient-to-r ${colors.gradient}`
                    : colors.progress
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* 퍼센트 표시 */}
            {showPercentage && (
              <div className="mt-2 flex justify-end">
                <span
                  className={merge(
                    "text-xs font-semibold",
                    isGradient ? "text-white/90" : colors.text
                  )}
                >
                  {percentage.toFixed(1)}%
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  }
);

ProgressCard.displayName = "ProgressCard";

