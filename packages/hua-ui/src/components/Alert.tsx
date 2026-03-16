"use client";

import React, { useState, useMemo } from "react";
import { dotVariants } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Variant style maps
// ---------------------------------------------------------------------------

export const alertVariantStyles = dotVariants({
  base: "relative rounded-lg border p-4",
  variants: {
    variant: {
      default: "bg-white/10 border-white/30 text-white",
      success: "bg-green-500/10 border-green-400/30 text-green-200",
      warning: "bg-yellow-500/10 border-yellow-400/30 text-yellow-200",
      error: "bg-red-500/10 border-red-400/30 text-red-200",
      info: "bg-indigo-500/10 border-cyan-400/30 text-cyan-200",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/** Base container styles as plain CSSProperties */
const BASE_CONTAINER: React.CSSProperties = {
  position: "relative",
  ...resolveDot("rounded-lg p-4"),
  borderWidth: "1px",
  borderStyle: "solid",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

/** Per-variant container styles */
const VARIANT_CONTAINER: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "rgba(255, 255, 255, 1)",
  },
  success: {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderColor: "rgba(74, 222, 128, 0.3)",
    color: "rgba(187, 247, 208, 1)",
  },
  warning: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderColor: "rgba(250, 204, 21, 0.3)",
    color: "rgba(254, 240, 138, 1)",
  },
  error: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderColor: "rgba(248, 113, 113, 0.3)",
    color: "rgba(254, 202, 202, 1)",
  },
  info: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderColor: "rgba(34, 211, 238, 0.3)",
    color: "rgba(165, 243, 252, 1)",
  },
};

/** Per-variant icon color styles */
const VARIANT_ICON: Record<string, React.CSSProperties> = {
  default: { color: "var(--color-muted-foreground, rgba(148, 163, 184, 1))" },
  success: { color: "rgba(34, 197, 94, 1)" },
  warning: { color: "rgba(234, 179, 8, 1)" },
  error: { color: "rgba(239, 68, 68, 1)" },
  info: { color: "rgba(6, 182, 212, 1)" },
};

/** Close button hover overlay */
const CLOSE_HOVER: React.CSSProperties = {
  backgroundColor: "rgba(0, 0, 0, 0.05)",
};

// ---------------------------------------------------------------------------
// Default icons (SVG, internal — className kept for sizing only)
// ---------------------------------------------------------------------------

const DefaultIcon: React.FC<{ variant: string }> = ({ variant }) => {
  switch (variant) {
    case "success":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      );
    case "error":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case "info":
      return (
        <svg
          style={{ width: "1.25rem", height: "1.25rem" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return null;
  }
};

// ---------------------------------------------------------------------------
// AlertProps
// ---------------------------------------------------------------------------

/**
 * Alert 컴포넌트의 props
 * @typedef {Object} AlertProps
 * @property {"default" | "success" | "warning" | "error" | "info"} [variant="default"] - Alert 스타일 변형
 * @property {string} [title] - Alert 제목
 * @property {string} [description] - Alert 설명
 * @property {React.ReactNode} [icon] - 커스텀 아이콘
 * @property {React.ReactNode} [action] - 액션 버튼/요소
 * @property {boolean} [closable=false] - 닫기 버튼 표시 여부
 * @property {() => void} [onClose] - 닫기 버튼 클릭 시 호출되는 콜백
 * @property {string} [dot] - dot 유틸리티 스트링 (추가 스타일)
 * @property {React.CSSProperties} [style] - 인라인 스타일
 */
export interface AlertProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Alert
// ---------------------------------------------------------------------------

/**
 * Alert 컴포넌트 / Alert component
 *
 * 사용자에게 중요한 정보나 경고를 표시하는 컴포넌트입니다.
 * 다양한 변형(variant)을 지원하며, 아이콘, 제목, 설명, 액션 버튼을 포함할 수 있습니다.
 *
 * Component for displaying important information or warnings to users.
 * Supports various variants and can include icons, titles, descriptions, and action buttons.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Alert variant="info" title="정보" description="이것은 정보 메시지입니다." />
 *
 * @example
 * // 닫기 버튼 포함 / With close button
 * <Alert
 *   variant="warning"
 *   title="경고"
 *   closable
 *   onClose={() => console.log('닫기')}
 * />
 *
 * @example
 * // 커스텀 아이콘과 액션 / Custom icon and action
 * <Alert
 *   variant="success"
 *   icon={<Icon name="check" />}
 *   action={<Button size="sm">확인</Button>}
 * >
 *   작업이 완료되었습니다.
 * </Alert>
 *
 * @param {AlertProps} props - Alert 컴포넌트의 props / Alert component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Alert 컴포넌트 / Alert component
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      dot: dotProp,
      style,
      variant = "default",
      title,
      description,
      icon,
      action,
      closable = false,
      onClose,
      children,
      ...props
    },
    ref,
  ) => {
    const [closeHovered, setCloseHovered] = useState(false);

    const containerStyle = useMemo(
      () =>
        mergeStyles(
          BASE_CONTAINER,
          VARIANT_CONTAINER[variant],
          resolveDot(dotProp),
          style,
        ),
      [variant, dotProp, style],
    );

    const iconWrapStyle = useMemo(
      () =>
        mergeStyles(
          { flexShrink: 0, marginTop: "2px" } as React.CSSProperties,
          VARIANT_ICON[variant],
        ),
      [variant],
    );

    const closeButtonStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          {
            display: "inline-flex",
            ...resolveDot("rounded-md p-1.5"),
            transition: "background-color 200ms ease-in-out",
            outline: "none",
            border: "none",
            cursor: "pointer",
            background: "transparent",
          } as React.CSSProperties,
          VARIANT_ICON[variant],
          closeHovered ? CLOSE_HOVER : undefined,
        ),
      [variant, closeHovered],
    );

    const defaultIcon = <DefaultIcon variant={variant} />;
    const resolvedIcon = icon ?? defaultIcon;

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            ...resolveDot("gap-3"),
          }}
        >
          {/* 아이콘 */}
          {resolvedIcon && <div style={iconWrapStyle}>{resolvedIcon}</div>}

          {/* 내용 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {title && (
              <h4
                style={{
                  margin: 0,
                  ...resolveDot("mb-1"),
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  lineHeight: "1.25rem",
                }}
              >
                {title}
              </h4>
            )}
            {description && (
              <p
                style={{ margin: 0, fontSize: "0.875rem", lineHeight: "1.625" }}
              >
                {description}
              </p>
            )}
            {children && <div style={resolveDot("mt-2")}>{children}</div>}
          </div>

          {/* 액션 */}
          {(action || closable) && (
            <div
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                ...resolveDot("gap-2"),
              }}
            >
              {action}
              {closable && (
                <button
                  onClick={onClose}
                  style={closeButtonStyle}
                  onMouseEnter={() => setCloseHovered(true)}
                  onMouseLeave={() => setCloseHovered(false)}
                  aria-label="닫기"
                >
                  <svg
                    style={{ width: "1rem", height: "1rem" }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Alert.displayName = "Alert";

// ---------------------------------------------------------------------------
// Convenience components
// ---------------------------------------------------------------------------

export const AlertSuccess = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, "variant">
>(({ dot, style, ...props }, ref) => (
  <Alert ref={ref} variant="success" dot={dot} style={style} {...props} />
));
AlertSuccess.displayName = "AlertSuccess";

export const AlertWarning = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, "variant">
>(({ dot, style, ...props }, ref) => (
  <Alert ref={ref} variant="warning" dot={dot} style={style} {...props} />
));
AlertWarning.displayName = "AlertWarning";

export const AlertError = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, "variant">
>(({ dot, style, ...props }, ref) => (
  <Alert ref={ref} variant="error" dot={dot} style={style} {...props} />
));
AlertError.displayName = "AlertError";

export const AlertInfo = React.forwardRef<
  HTMLDivElement,
  Omit<AlertProps, "variant">
>(({ dot, style, ...props }, ref) => (
  <Alert ref={ref} variant="info" dot={dot} style={style} {...props} />
));
AlertInfo.displayName = "AlertInfo";

export { Alert };
