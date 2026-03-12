"use client";

import React, { useMemo } from "react";
import { dotCSS } from "@hua-labs/dot/class";
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
 * @property {string} [dot] - dot 유틸리티 스트링 / dot utility string
 */
export interface DashboardEmptyStateProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  icon?: IconName | React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  variant?: "default" | "warning" | "info" | "error" | "success";
  size?: "sm" | "md" | "lg";
  dot?: string;
}

const variantIconColor = {
  default: "#9ca3af",
  warning: "#eab308",
  info: "#6366f1",
  error: "#ef4444",
  success: "#22c55e",
};

const sizeConfig = {
  sm: {
    paddingY: "2rem",
    iconSize: "2rem",
    iconMarginBottom: "0.75rem",
    titleFontSize: "1rem",
    descFontSize: "0.875rem",
    buttonPadding: "0.5rem 1rem",
    buttonFontSize: "0.875rem",
  },
  md: {
    paddingY: "3rem",
    iconSize: "3rem",
    iconMarginBottom: "1rem",
    titleFontSize: "1.125rem",
    descFontSize: "0.875rem",
    buttonPadding: "0.5rem 1.5rem",
    buttonFontSize: "0.875rem",
  },
  lg: {
    paddingY: "4rem",
    iconSize: "4rem",
    iconMarginBottom: "1.5rem",
    titleFontSize: "1.25rem",
    descFontSize: "1rem",
    buttonPadding: "0.75rem 2rem",
    buttonFontSize: "1rem",
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
export const DashboardEmptyState = React.forwardRef<
  HTMLDivElement,
  DashboardEmptyStateProps
>(
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
      dot,
      style,
      ...props
    },
    ref,
  ) => {
    const iconColor = variantIconColor[variant];
    const sizes = sizeConfig[size];

    const dotCls = useMemo(() => {
      const tokens = ["text-center", `py-[${sizes.paddingY}]`, dot]
        .filter(Boolean)
        .join(" ");
      return dotCSS(tokens);
    }, [dot, sizes.paddingY]);

    const buttonStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.5rem",
      fontWeight: 500,
      backgroundColor: "var(--color-muted, #f3f4f6)",
      color: "var(--color-foreground, #374151)",
      border: "1px solid var(--color-border, #d1d5db)",
      transition: "background-color 200ms",
      cursor: "pointer",
      padding: sizes.buttonPadding,
      fontSize: sizes.buttonFontSize,
    };

    const actionButton = actionText && (actionHref || actionOnClick) && (
      <div style={{ marginTop: "1.5rem" }}>
        {actionHref ? (
          <a href={actionHref} aria-label={actionText} style={buttonStyle}>
            {actionText}
          </a>
        ) : (
          <button
            onClick={actionOnClick}
            aria-label={actionText}
            style={buttonStyle}
          >
            {actionText}
          </button>
        )}
      </div>
    );

    return (
      <div ref={ref} className={dotCls.className} style={style} {...props}>
        {/* 아이콘 */}
        {icon && (
          <div
            style={{
              margin: "0 auto",
              width: sizes.iconSize,
              height: sizes.iconSize,
              marginBottom: sizes.iconMarginBottom,
              color: iconColor,
            }}
          >
            {typeof icon === "string" ? (
              <Icon
                name={icon as IconName}
                style={{ width: "100%", height: "100%", color: iconColor }}
              />
            ) : (
              icon
            )}
          </div>
        )}

        {/* 제목 */}
        <h3
          style={{
            fontWeight: 600,
            marginBottom: "0.5rem",
            color: "var(--color-foreground, #111827)",
            fontSize: sizes.titleFontSize,
          }}
        >
          {title}
        </h3>

        {/* 설명 */}
        {description && (
          <p
            style={{
              marginBottom: "1rem",
              color: "var(--color-muted-foreground, #6b7280)",
              fontSize: sizes.descFontSize,
            }}
          >
            {description}
          </p>
        )}

        {/* 액션 버튼 */}
        {actionButton}
        {dotCls.css && (
          <style dangerouslySetInnerHTML={{ __html: dotCls.css }} />
        )}
      </div>
    );
  },
);

DashboardEmptyState.displayName = "DashboardEmptyState";
