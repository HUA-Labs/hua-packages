"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";
import { Button } from "./Button";

/**
 * EmptyState 컴포넌트 Props
 * EmptyState component props
 */
export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
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
  /** dot 스타일 유틸리티 문자열 / Dot style utility string */
  dot?: string;
  /** 인라인 스타일 / Inline style */
  style?: React.CSSProperties;
}

const VARIANT_CONTAINER: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'var(--empty-state-default-bg)' },
  warning: { backgroundColor: 'var(--empty-state-warning-bg)' },
  info:    { backgroundColor: 'var(--empty-state-info-bg)' },
  error:   { backgroundColor: 'var(--empty-state-error-bg)' },
  success: { backgroundColor: 'var(--empty-state-success-bg)' },
};

const VARIANT_ICON_COLOR: Record<string, React.CSSProperties> = {
  default: { color: 'var(--empty-state-default-icon)' },
  warning: { color: 'var(--empty-state-warning-icon)' },
  info:    { color: 'var(--empty-state-info-icon)' },
  error:   { color: 'var(--empty-state-error-icon)' },
  success: { color: 'var(--empty-state-success-icon)' },
};

const TITLE_STYLE: React.CSSProperties = {
  color: 'var(--empty-state-title)',
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  color: 'var(--empty-state-description)',
};

const SIZE_CONTAINER: Record<string, React.CSSProperties> = {
  sm: { paddingTop: '2rem',  paddingBottom: '2rem',  paddingLeft: '1rem',  paddingRight: '1rem' },
  md: { paddingTop: '3rem',  paddingBottom: '3rem',  paddingLeft: '1.5rem', paddingRight: '1.5rem' },
  lg: { paddingTop: '4rem',  paddingBottom: '4rem',  paddingLeft: '2rem',  paddingRight: '2rem' },
};

const SIZE_ICON: Record<string, React.CSSProperties> = {
  sm: { width: '2rem',   height: '2rem',   marginBottom: '0.75rem' },
  md: { width: '3rem',   height: '3rem',   marginBottom: '1rem' },
  lg: { width: '4rem',   height: '4rem',   marginBottom: '1.5rem' },
};

const SIZE_TITLE: Record<string, React.CSSProperties> = {
  sm: { fontSize: '1rem',    lineHeight: '1.5rem' },
  md: { fontSize: '1.125rem', lineHeight: '1.75rem' },
  lg: { fontSize: '1.25rem', lineHeight: '1.75rem' },
};

const SIZE_DESCRIPTION: Record<string, React.CSSProperties> = {
  sm: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  md: { fontSize: '0.875rem', lineHeight: '1.25rem' },
  lg: { fontSize: '1rem',    lineHeight: '1.5rem' },
};

const BASE_CONTAINER: React.CSSProperties = {
  textAlign: 'center',
  borderRadius: '0.5rem',
};

const BORDERED_STYLE: React.CSSProperties = {
  border: '1px solid var(--empty-state-border)',
};

const ICON_WRAPPER_BASE: React.CSSProperties = {
  marginLeft: 'auto',
  marginRight: 'auto',
};

const TITLE_BASE: React.CSSProperties = {
  fontWeight: 600,
  marginBottom: '0.5rem',
};

const DESCRIPTION_BASE: React.CSSProperties = {
  maxWidth: '24rem',
  marginLeft: 'auto',
  marginRight: 'auto',
};

const ACTION_WRAPPER: React.CSSProperties = {
  marginTop: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
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
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const containerStyle = useMemo(() => mergeStyles(
      BASE_CONTAINER,
      VARIANT_CONTAINER[variant],
      SIZE_CONTAINER[size],
      bordered ? BORDERED_STYLE : undefined,
      resolveDot(dotProp),
      style,
    ), [variant, size, bordered, dotProp, style]);

    const iconWrapperStyle = useMemo(() => mergeStyles(
      ICON_WRAPPER_BASE,
      SIZE_ICON[size],
    ), [size]);

    const iconStyle = useMemo(() => mergeStyles(
      { display: 'block', width: '100%', height: '100%' },
      VARIANT_ICON_COLOR[variant],
    ), [variant]);

    const titleStyle = useMemo(() => mergeStyles(
      TITLE_BASE,
      TITLE_STYLE,
      SIZE_TITLE[size],
    ), [size]);

    const descriptionStyle = useMemo(() => mergeStyles(
      DESCRIPTION_BASE,
      DESCRIPTION_STYLE,
      SIZE_DESCRIPTION[size],
    ), [size]);

    return (
      <div
        ref={ref}
        style={containerStyle}
        {...props}
      >
        {/* 아이콘 / Icon */}
        {icon && (
          <div style={iconWrapperStyle}>
            {typeof icon === "string" ? (
              <span style={iconStyle}>
                <Icon
                  name={icon as IconName}
                  variant="inherit"
                  size="100%"
                />
              </span>
            ) : (
              <div style={VARIANT_ICON_COLOR[variant]}>{icon}</div>
            )}
          </div>
        )}

        {/* 제목 / Title */}
        <h3 style={titleStyle}>
          {title}
        </h3>

        {/* 설명 / Description */}
        {description && (
          <p style={descriptionStyle}>
            {description}
          </p>
        )}

        {/* 액션 버튼들 / Action buttons */}
        {(actionText || secondaryActionText) && (
          <div style={ACTION_WRAPPER}>
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
