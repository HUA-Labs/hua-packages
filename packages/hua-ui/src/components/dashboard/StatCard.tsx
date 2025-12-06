"use client";

import React, { useMemo } from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { useColorStyles } from "../../lib/styles/colors";
import { createVariantStyles } from "../../lib/styles/variants";
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
 * @property {"default" | "gradient" | "outline" | "elevated"} [variant="default"] - 카드 스타일 변형 / Card style variant
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color] - 카드 색상 / Card color
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @property {React.ReactNode} [emptyState] - 빈 상태 컴포넌트 / Empty state component
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
}


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

    if (!loading && (value === null || value === undefined || value === "")) {
      return emptyState ? (
        <div className={className} {...props}>
          {emptyState}
        </div>
      ) : (
        <div className={merge("rounded-2xl border border-slate-100 dark:border-slate-800 p-6", className)} {...props}>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">데이터가 없습니다.</p>
        </div>
      );
    }

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
            {formatValue(value ?? 0)}
          </h3>
        )}

        {/* 설명 */}
        {description && (
          <p className={merge(
            "text-sm",
            isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-300"
          )}>
            {description}
          </p>
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

StatCard.displayName = "StatCard";

