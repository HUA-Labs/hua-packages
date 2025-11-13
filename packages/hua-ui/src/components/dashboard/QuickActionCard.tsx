"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface QuickActionCardProps extends React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
  title: string;
  description?: string;
  icon?: IconName | React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gradient" | "outline" | "solid";
  color?: "blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    gradient: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    outline: "border-2 border-blue-500 bg-transparent text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20",
    solid: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  purple: {
    gradient: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
    outline: "border-2 border-purple-500 bg-transparent text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20",
    solid: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  green: {
    gradient: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    outline: "border-2 border-green-500 bg-transparent text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20",
    solid: "bg-green-600 hover:bg-green-700 text-white",
  },
  orange: {
    gradient: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
    outline: "border-2 border-orange-500 bg-transparent text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20",
    solid: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  red: {
    gradient: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
    outline: "border-2 border-red-500 bg-transparent text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
    solid: "bg-red-600 hover:bg-red-700 text-white",
  },
  indigo: {
    gradient: "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
    outline: "border-2 border-indigo-500 bg-transparent text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20",
    solid: "bg-indigo-600 hover:bg-indigo-700 text-white",
  },
  pink: {
    gradient: "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700",
    outline: "border-2 border-pink-500 bg-transparent text-pink-600 hover:bg-pink-50 dark:text-pink-400 dark:hover:bg-pink-900/20",
    solid: "bg-pink-600 hover:bg-pink-700 text-white",
  },
  gray: {
    gradient: "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
    outline: "border-2 border-gray-500 bg-transparent text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/20",
    solid: "bg-gray-600 hover:bg-gray-700 text-white",
  },
};

export const QuickActionCard = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  QuickActionCardProps
>(
  (
    {
      title,
      description,
      icon,
      href,
      onClick,
      variant = "gradient",
      color = "blue",
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    const colors = colorClasses[color];
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient || variant === "solid";

    const variantClasses = {
      gradient: `text-white ${colors.gradient}`,
      outline: colors.outline,
      solid: `text-white ${colors.solid}`,
    };

    const baseClasses = merge(
      "rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl text-center",
      variantClasses[variant],
      className
    );

    const content = (
      <>
        {/* 아이콘 */}
        {icon && (
          <div className={merge(
            "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2",
            isGradient || variant === "solid"
              ? "bg-white/20"
              : variant === "outline"
              ? color === "blue" ? "bg-blue-100 dark:bg-blue-900/30" :
                color === "purple" ? "bg-purple-100 dark:bg-purple-900/30" :
                color === "green" ? "bg-green-100 dark:bg-green-900/30" :
                color === "orange" ? "bg-orange-100 dark:bg-orange-900/30" :
                color === "red" ? "bg-red-100 dark:bg-red-900/30" :
                color === "indigo" ? "bg-indigo-100 dark:bg-indigo-900/30" :
                color === "pink" ? "bg-pink-100 dark:bg-pink-900/30" :
                "bg-gray-100 dark:bg-gray-900/30"
              : ""
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

        {/* 제목 */}
        <h3 className={merge(
          "text-xl font-semibold mb-1",
          isTextWhite ? "text-white" : ""
        )}>
          {title}
        </h3>

        {/* 설명 */}
        {description && (
          <p className={merge(
            "text-sm",
            isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-300"
          )}>
            {description}
          </p>
        )}

        {loading && (
          <div className="mt-2 h-4 bg-white/20 rounded animate-pulse" />
        )}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        className={baseClasses}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

QuickActionCard.displayName = "QuickActionCard";

