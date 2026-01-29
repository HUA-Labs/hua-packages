"use client";

import React from "react";
import { merge } from "../lib/utils";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";
import { Button } from "./Button";

/**
 * EmptyState 컴포넌트 Props
 * EmptyState component props
 */
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 아이콘 (IconName 또는 ReactNode) / Icon (IconName or ReactNode) */
  icon?: IconName | React.ReactNode;
  /** 제목 / Title */
  title: string;
  /** 설명 / Description */
  description?: string;
  /** 액션 버튼 텍스트 / Action button text */
  actionText?: string;
  /** 액션 버튼 링크 URL / Action button link URL */
  actionHref?: string;
  /** 액션 버튼 클릭 핸들러 / Action button click handler */
  onAction?: () => void;
  /** 보조 액션 텍스트 / Secondary action text */
  secondaryActionText?: string;
  /** 보조 액션 클릭 핸들러 / Secondary action click handler */
  onSecondaryAction?: () => void;
  /** 스타일 변형 / Style variant */
  variant?: "default" | "warning" | "info" | "error" | "success";
  /** 크기 / Size */
  size?: "sm" | "md" | "lg";
  /** 테두리 표시 여부 / Show border */
  bordered?: boolean;
}

const variantStyles = {
  default: {
    container: "bg-gray-50/50 dark:bg-gray-900/50",
    icon: "text-gray-400 dark:text-gray-500",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  warning: {
    container: "bg-yellow-50/50 dark:bg-yellow-900/10",
    icon: "text-yellow-500 dark:text-yellow-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  info: {
    container: "bg-indigo-50/50 dark:bg-indigo-900/10",
    icon: "text-indigo-500 dark:text-indigo-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  error: {
    container: "bg-red-50/50 dark:bg-red-900/10",
    icon: "text-red-500 dark:text-red-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
  success: {
    container: "bg-green-50/50 dark:bg-green-900/10",
    icon: "text-green-500 dark:text-green-400",
    title: "text-gray-900 dark:text-white",
    description: "text-gray-600 dark:text-gray-400",
  },
};

const sizeStyles = {
  sm: {
    container: "py-8 px-4",
    icon: "w-8 h-8 mb-3",
    title: "text-base",
    description: "text-sm",
  },
  md: {
    container: "py-12 px-6",
    icon: "w-12 h-12 mb-4",
    title: "text-lg",
    description: "text-sm",
  },
  lg: {
    container: "py-16 px-8",
    icon: "w-16 h-16 mb-6",
    title: "text-xl",
    description: "text-base",
  },
};

/**
 * EmptyState - 빈 상태 표시 컴포넌트
 * Empty state display component
 *
 * 데이터가 없을 때 사용자에게 안내 메시지와 액션을 제공합니다.
 * Displays a message and action when there is no data to show.
 *
 * @example
 * // 기본 사용 / Basic usage
 * <EmptyState
 *   icon="inbox"
 *   title="데이터가 없습니다"
 *   description="새로운 데이터를 추가해보세요"
 *   actionText="데이터 추가"
 *   onAction={handleAdd}
 * />
 *
 * @example
 * // 경고 스타일 / Warning style
 * <EmptyState
 *   icon="warning"
 *   title="오류가 발생했습니다"
 *   description="잠시 후 다시 시도해주세요"
 *   variant="error"
 *   actionText="다시 시도"
 *   onAction={handleRetry}
 *   secondaryActionText="취소"
 *   onSecondaryAction={handleCancel}
 * />
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      icon = "inbox",
      title,
      description,
      actionText,
      actionHref,
      onAction,
      secondaryActionText,
      onSecondaryAction,
      variant = "default",
      size = "md",
      bordered = false,
      className,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    return (
      <div
        ref={ref}
        className={merge(
          "text-center rounded-lg",
          styles.container,
          sizes.container,
          bordered && "border border-gray-200 dark:border-gray-700",
          className
        )}
        {...props}
      >
        {/* 아이콘 / Icon */}
        {icon && (
          <div className={merge("mx-auto", sizes.icon)}>
            {typeof icon === "string" ? (
              <Icon
                name={icon as IconName}
                className={merge("w-full h-full", styles.icon)}
              />
            ) : (
              <div className={styles.icon}>{icon}</div>
            )}
          </div>
        )}

        {/* 제목 / Title */}
        <h3 className={merge("font-semibold mb-2", styles.title, sizes.title)}>
          {title}
        </h3>

        {/* 설명 / Description */}
        {description && (
          <p
            className={merge(
              "max-w-sm mx-auto",
              styles.description,
              sizes.description
            )}
          >
            {description}
          </p>
        )}

        {/* 액션 버튼들 / Action buttons */}
        {(actionText || secondaryActionText) && (
          <div className="mt-6 flex items-center justify-center gap-3">
            {actionText && (
              <>
                {actionHref ? (
                  <a href={actionHref}>
                    <Button size={size === "lg" ? "lg" : "md"}>
                      {actionText}
                    </Button>
                  </a>
                ) : (
                  <Button size={size === "lg" ? "lg" : "md"} onClick={onAction}>
                    {actionText}
                  </Button>
                )}
              </>
            )}
            {secondaryActionText && onSecondaryAction && (
              <Button
                variant="ghost"
                size={size === "lg" ? "lg" : "md"}
                onClick={onSecondaryAction}
              >
                {secondaryActionText}
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";
