"use client";

import React, { useMemo } from "react";
import { merge, Icon, useColorStyles, createVariantStyles, type IconName, type Color } from '@hua-labs/ui';

/**
 * ProgressCard 컴포넌트의 props / ProgressCard component props
 * @typedef {Object} ProgressCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {number} current - 현재 값 / Current value
 * @property {number} total - 전체 값 / Total value
 * @property {string} [unit] - 단위 / Unit
 * @property {string} [description] - 카드 설명 / Card description
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color] - 카드 색상 / Card color
 * @property {"default" | "gradient" | "outline" | "elevated"} [variant="default"] - 카드 스타일 변형 / Card style variant
 * @property {boolean} [showPercentage] - 퍼센트 표시 여부 / Show percentage
 * @property {boolean} [showLabel] - 라벨 표시 여부 / Show label
 * @property {"sm" | "md" | "lg"} [size="md"] - 카드 크기 / Card size
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface ProgressCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  current: number;
  total: number;
  unit?: string;
  description?: string;
  icon?: IconName | React.ReactNode;
  color?: Color;
  variant?: "default" | "gradient" | "outline" | "elevated";
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

// Progress bar 색상은 별도 처리
const progressColors: Record<Color, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  indigo: "bg-indigo-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
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

/**
 * ProgressCard 컴포넌트 / ProgressCard component
 * 
 * 진행률을 표시하는 카드 컴포넌트입니다.
 * 현재 값과 전체 값을 비교하여 진행률을 시각적으로 표시합니다.
 * 
 * Card component that displays progress.
 * Compares current value with total value to visually display progress.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ProgressCard
 *   title="목표 달성률"
 *   current={75}
 *   total={100}
 *   unit="%"
 *   description="이번 달 목표"
 * />
 * 
 * @example
 * // 퍼센트 표시 / Show percentage
 * <ProgressCard
 *   title="판매 진행률"
 *   current={150}
 *   total={200}
 *   showPercentage
 *   color="green"
 *   variant="gradient"
 * />
 * 
 * @param {ProgressCardProps} props - ProgressCard 컴포넌트의 props / ProgressCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ProgressCard 컴포넌트 / ProgressCard component
 */
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
    const colorStyles = useColorStyles(color);
    const sizes = sizeStyles[size];
    const percentage = total > 0 ? Math.min(Math.max((current / total) * 100, 0), 100) : 0;
    const isGradient = variant === "gradient";

    const variantClasses = {
      default: `rounded-2xl border ${colorStyles.default}`,
      gradient: `rounded-2xl border text-white ${colorStyles.gradient}`,
      outline: `rounded-2xl border-2 ${colorStyles.outline}`,
      elevated: `rounded-3xl border ${colorStyles.elevated}`,
    };

    const variantClass = variantClasses[variant];

    return (
      <div
        ref={ref}
        className={merge(
          "transition-all duration-200 hover:shadow-xl",
          variantClass,
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
                isGradient ? "bg-white/20" : colorStyles.icon
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
                  isGradient ? "text-white" : `text-${color}-600 dark:text-${color}-400`
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
                    ? `bg-gradient-to-r ${colorStyles.gradient.replace("bg-gradient-to-br", "bg-gradient-to-r").trim()}`
                    : progressColors[color]
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
                    isGradient ? "text-white/90" : `text-${color}-600 dark:text-${color}-400`
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

