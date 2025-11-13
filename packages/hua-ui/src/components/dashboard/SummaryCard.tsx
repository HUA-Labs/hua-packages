"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface SummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: IconName | React.ReactNode;
  color?: "blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray";
  variant?: "default" | "gradient" | "outline";
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  badge?: string | React.ReactNode;
  footer?: React.ReactNode;
  showAction?: boolean;
  actionLabel?: string;
}

const colorClasses = {
  blue: {
    default: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
    gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
    outline: "border-2 border-blue-500 bg-transparent",
    icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    button: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    decoration: "from-blue-400/10 to-transparent",
  },
  purple: {
    default: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
    gradient: "bg-gradient-to-br from-purple-500 to-pink-600",
    outline: "border-2 border-purple-500 bg-transparent",
    icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    button: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
    decoration: "from-purple-400/10 to-transparent",
  },
  green: {
    default: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    outline: "border-2 border-green-500 bg-transparent",
    icon: "bg-green-500/10 text-green-600 dark:text-green-400",
    button: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    decoration: "from-green-400/10 to-transparent",
  },
  orange: {
    default: "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20",
    gradient: "bg-gradient-to-br from-orange-500 to-amber-600",
    outline: "border-2 border-orange-500 bg-transparent",
    icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    button: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700",
    decoration: "from-orange-400/10 to-transparent",
  },
  red: {
    default: "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20",
    gradient: "bg-gradient-to-br from-red-500 to-rose-600",
    outline: "border-2 border-red-500 bg-transparent",
    icon: "bg-red-500/10 text-red-600 dark:text-red-400",
    button: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
    decoration: "from-red-400/10 to-transparent",
  },
  indigo: {
    default: "bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20",
    gradient: "bg-gradient-to-br from-indigo-500 to-blue-600",
    outline: "border-2 border-indigo-500 bg-transparent",
    icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    button: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    decoration: "from-indigo-400/10 to-transparent",
  },
  pink: {
    default: "bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20",
    gradient: "bg-gradient-to-br from-pink-500 to-rose-600",
    outline: "border-2 border-pink-500 bg-transparent",
    icon: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    button: "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
    decoration: "from-pink-400/10 to-transparent",
  },
  gray: {
    default: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
    gradient: "bg-gradient-to-br from-gray-500 to-gray-600",
    outline: "border-2 border-gray-500 bg-transparent",
    icon: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    button: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
    decoration: "from-gray-400/10 to-transparent",
  },
};

export const SummaryCard = React.forwardRef<HTMLDivElement, SummaryCardProps>(
  (
    {
      title,
      value,
      subtitle,
      icon,
      color = "blue",
      variant = "default",
      href,
      onClick,
      loading = false,
      badge,
      footer,
      showAction = true,
      actionLabel = "자세히 보기",
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorClasses[color];
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient;

    const variantClasses = {
      default: `rounded-xl shadow-lg ${colors.default}`,
      gradient: `rounded-xl shadow-xl text-white ${colors.gradient}`,
      outline: `rounded-xl ${colors.outline}`,
    };

    const formatValue = (val: string | number): string => {
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val;
    };

    const content = (
      <div
        ref={ref}
        className={merge(
          "p-6 flex flex-col min-h-[220px] relative overflow-hidden group hover:shadow-xl transition-all duration-300",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {/* 배경 장식 */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colors.decoration} rounded-full -translate-y-16 translate-x-16`}></div>
        <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr ${colors.decoration} rounded-full translate-y-12 -translate-x-12`}></div>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            {icon && (
              <div className={merge(
                "p-2 rounded-lg",
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
            <span className={merge(
              "text-lg font-semibold ml-3",
              isTextWhite ? "text-white" : "text-gray-900 dark:text-white"
            )}>
              {title}
            </span>
          </div>
          {badge && (
            <div className="text-xs font-medium">
              {typeof badge === "string" ? (
                <span className={merge(
                  "px-2 py-1 rounded-full",
                  isGradient ? "bg-white/20 text-white" : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                )}>
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}
        </div>

        {/* 값 */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          {loading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          ) : (
            <>
              <div className={merge(
                "text-3xl font-bold mb-2",
                isTextWhite ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                {formatValue(value)}
              </div>
              {subtitle && (
                <div className={merge(
                  "text-sm mb-4",
                  isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                )}>
                  {subtitle}
                </div>
              )}
            </>
          )}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="relative z-10 mb-4">
            {footer}
          </div>
        )}

        {/* 액션 버튼 */}
        {showAction && (href || onClick) && (
          <div className="relative z-10">
            {href ? (
              <a
                href={href}
                className={merge(
                  "block w-full text-center py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]",
                  colors.button
                )}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                onClick={onClick}
                className={merge(
                  "block w-full text-center py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]",
                  colors.button
                )}
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );

    return content;
  }
);

SummaryCard.displayName = "SummaryCard";

