"use client";

import React from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";

/**
 * DashboardEmptyState 컴포넌트의 props / DashboardEmptyState component props
 * @typedef {Object} DashboardEmptyStateProps
 * @property {IconName | React.ReactNode} [icon="inbox"] - 아이콘 / Icon
 * @property {string} title - 제목 / Title
 * @property {string} [description] - 설명 / Description
 * @property {string} [actionText] - 액션 버튼 텍스트 / Action button text
 * @property {string} [actionHref] - 액션 버튼 링크 URL / Action button link URL
 * @property {() => void} [actionOnClick] - 액션 버튼 클릭 핸들러 / Action button click handler
 * @property {"default" | "warning" | "info" | "error" | "success"} [variant="default"] - 스타일 변형 / Style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
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
    icon: "text-indigo-500 dark:text-indigo-400",
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

/**
 * DashboardEmptyState 컴포넌트
 * 
 * 대시보드에서 빈 상태를 표시하는 컴포넌트입니다.
 * 데이터가 없을 때 사용자에게 안내 메시지와 액션을 제공합니다.
 * 
 * Empty state component for dashboards.
 * Displays a message and action when there is no data to show.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <DashboardEmptyState
 *   icon="inbox"
 *   title="데이터가 없습니다"
 *   description="새로운 데이터를 추가해보세요"
 *   actionText="데이터 추가"
 *   actionOnClick={handleAdd}
 * />
 * 
 * @example
 * // 경고 스타일 / Warning style
 * <DashboardEmptyState
 *   icon="warning"
 *   title="오류가 발생했습니다"
 *   description="잠시 후 다시 시도해주세요"
 *   variant="warning"
 *   size="lg"
 * />
 * 
 * @param {DashboardEmptyStateProps} props - DashboardEmptyState 컴포넌트의 props / DashboardEmptyState component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} DashboardEmptyState 컴포넌트 / DashboardEmptyState component
 */
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
            aria-label={actionText}
            className={merge(
              "inline-flex items-center justify-center rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200",
              sizes.button
            )}
          >
            {actionText}
          </a>
        ) : (
          <button
            onClick={actionOnClick}
            aria-label={actionText}
            className={merge(
              "inline-flex items-center justify-center rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors duration-200",
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

