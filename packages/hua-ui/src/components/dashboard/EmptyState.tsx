"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

export interface DashboardEmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: IconName | React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  variant?: "default" | "warning" | "info" | "error" | "success";
  size?: "sm" | "md" | "lg";
}

const variantStyles = {
  default: {
    icon: "text-gray-400 dark:text-gray-500",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  warning: {
    icon: "text-yellow-500 dark:text-yellow-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  info: {
    icon: "text-blue-500 dark:text-blue-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  error: {
    icon: "text-red-500 dark:text-red-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  success: {
    icon: "text-green-500 dark:text-green-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
};

const sizeStyles = {
  sm: {
    container: "py-8",
    icon: "w-8 h-8 mb-3",
    title: "text-base",
    description: "text-sm",
    button: "text-sm px-4 py-2",
  },
  md: {
    container: "py-12",
    icon: "w-12 h-12 mb-4",
    title: "text-lg",
    description: "text-sm",
    button: "text-sm px-6 py-2",
  },
  lg: {
    container: "py-16",
    icon: "w-16 h-16 mb-6",
    title: "text-xl",
    description: "text-base",
    button: "text-base px-8 py-3",
  },
};

export const DashboardEmptyState = React.forwardRef<HTMLDivElement, DashboardEmptyStateProps>(
  (
    {
      icon = "inbox",
      title,
      description,
      actionText,
      actionHref,
      actionOnClick,
      variant = "default",
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    const actionButton = actionText && (actionHref || actionOnClick) && (
      <div className="mt-6">
        {actionHref ? (
          <a
            href={actionHref}
            className={merge(
              "inline-flex items-center justify-center rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all duration-200",
              sizes.button
            )}
          >
            {actionText}
          </a>
        ) : (
          <button
            onClick={actionOnClick}
            className={merge(
              "inline-flex items-center justify-center rounded-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-lg transition-all duration-200",
              sizes.button
            )}
          >
            {actionText}
          </button>
        )}
      </div>
    );

    return (
      <div
        ref={ref}
        className={merge(
          "text-center",
          sizes.container,
          className
        )}
        {...props}
      >
        {/* 아이콘 */}
        {icon && (
          <div className={merge("mx-auto", styles.icon)}>
            {typeof icon === "string" ? (
              <Icon name={icon as IconName} className={merge("w-full h-full", styles.icon)} />
            ) : (
              icon
            )}
          </div>
        )}

        {/* 제목 */}
        <h3 className={merge("font-semibold mb-2", styles.title, sizes.title)}>
          {title}
        </h3>

        {/* 설명 */}
        {description && (
          <p className={merge("mb-4", styles.description, sizes.description)}>
            {description}
          </p>
        )}

        {/* 액션 버튼 */}
        {actionButton}
      </div>
    );
  }
);

DashboardEmptyState.displayName = "DashboardEmptyState";

