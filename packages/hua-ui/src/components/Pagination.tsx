"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Style constants (no Tailwind strings)
// ---------------------------------------------------------------------------

const BASE_WRAPPER: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ...resolveDot("gap-1"),
};

const BASE_BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 500,
  transition:
    "background-color 150ms ease-in-out, color 150ms ease-in-out, opacity 150ms ease-in-out, border-color 150ms ease-in-out",
  cursor: "pointer",
  outline: "none",
  border: "none",
  background: "none",
  padding: 0,
  userSelect: "none",
};

const DISABLED_BUTTON: React.CSSProperties = {
  pointerEvents: "none",
  opacity: 0.5,
};

// Size styles
const SIZE_STYLES: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: {
    height: "32px",
    minWidth: "32px",
    ...resolveDot("px-2"),
    fontSize: "14px",
  },
  md: {
    height: "40px",
    minWidth: "40px",
    ...resolveDot("px-3"),
    fontSize: "14px",
  },
  lg: {
    height: "48px",
    minWidth: "48px",
    ...resolveDot("px-4"),
    fontSize: "16px",
  },
};

// Shape styles
const SHAPE_STYLES: Record<"square" | "circle", React.CSSProperties> = {
  square: { borderRadius: "6px" },
  circle: { borderRadius: "9999px", aspectRatio: "1 / 1", padding: "0" },
};

// Variant × active state base styles
const VARIANT_INACTIVE: Record<
  "default" | "outlined" | "minimal",
  React.CSSProperties
> = {
  default: {
    border: "none",
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
  },
  outlined: {
    border: "1px solid var(--color-border)",
    backgroundColor: "var(--color-background)",
    color: "var(--color-foreground)",
  },
  minimal: {
    border: "none",
    backgroundColor: "transparent",
    color: "var(--color-foreground)",
  },
};

const VARIANT_ACTIVE: Record<
  "default" | "outlined" | "minimal",
  React.CSSProperties
> = {
  default: {
    border: "none",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
  },
  outlined: {
    border: "1px solid var(--color-primary)",
    backgroundColor: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
  },
  minimal: {
    border: "none",
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
    color: "var(--color-primary)",
  },
};

// Hover overlays for inactive buttons
const VARIANT_HOVER: Record<
  "default" | "outlined" | "minimal",
  React.CSSProperties
> = {
  default: { backgroundColor: "var(--color-muted)" },
  outlined: { backgroundColor: "var(--color-muted)" },
  minimal: { backgroundColor: "var(--color-muted)" },
};

// Focus ring
const FOCUS_RING: React.CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-ring)",
};

const ELLIPSIS_STYLE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  ...resolveDot("px-3"),
  fontSize: "14px",
  fontWeight: 500,
  color: "var(--color-muted-foreground)",
  userSelect: "none",
};

const SVG_STYLE: React.CSSProperties = {
  width: "16px",
  height: "16px",
  flexShrink: 0,
};

const INFO_WRAPPER: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "space-between",
  ...resolveDot("gap-4"),
};

const INFO_TEXT: React.CSSProperties = {
  fontSize: "14px",
  color: "var(--color-foreground)",
};

// ---------------------------------------------------------------------------
// Internal PageButton (manages its own hover/focus state)
// ---------------------------------------------------------------------------

interface PageButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  variant: "default" | "outlined" | "minimal";
  size: "sm" | "md" | "lg";
  shape: "square" | "circle";
  "aria-label"?: string;
  "aria-current"?: React.AriaAttributes["aria-current"];
  children: React.ReactNode;
}

const PageButton = React.memo(function PageButton({
  onClick,
  isActive = false,
  disabled = false,
  variant,
  size,
  shape,
  children,
  ...aria
}: PageButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const computedStyle = useMemo((): React.CSSProperties => {
    const variantBase = isActive
      ? VARIANT_ACTIVE[variant]
      : VARIANT_INACTIVE[variant];
    return mergeStyles(
      BASE_BUTTON,
      SIZE_STYLES[size],
      SHAPE_STYLES[shape],
      variantBase,
      disabled ? DISABLED_BUTTON : undefined,
      !isActive && isHovered ? VARIANT_HOVER[variant] : undefined,
      isFocused ? FOCUS_RING : undefined,
    );
  }, [variant, size, shape, isActive, disabled, isHovered, isFocused]);

  return (
    <button
      type="button"
      style={computedStyle}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => {
        if (!disabled) setIsHovered(true);
      }}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...aria}
    >
      {children}
    </button>
  );
});

// ---------------------------------------------------------------------------
// PaginationProps
// ---------------------------------------------------------------------------

/**
 * Pagination 컴포넌트의 props / Pagination component props
 * @typedef {Object} PaginationProps
 * @property {number} currentPage - 현재 페이지 번호 / Current page number
 * @property {number} totalPages - 전체 페이지 수 / Total number of pages
 * @property {(page: number) => void} onPageChange - 페이지 변경 콜백 / Page change callback
 * @property {boolean} [showFirstLast=true] - 첫/마지막 페이지 버튼 표시 여부 / Show first/last page buttons
 * @property {boolean} [showPrevNext=true] - 이전/다음 페이지 버튼 표시 여부 / Show previous/next page buttons
 * @property {number} [maxVisiblePages=5] - 최대 표시 페이지 수 / Maximum visible page numbers
 * @property {"sm" | "md" | "lg"} [size="md"] - Pagination 크기 / Pagination size
 * @property {"default" | "outlined" | "minimal"} [variant="default"] - Pagination 스타일 변형 / Pagination style variant
 * @property {"square" | "circle"} [shape="square"] - 버튼 모양 / Button shape
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Inline style overrides
 */
export interface PaginationProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "minimal";
  shape?: "square" | "circle";
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Pagination 컴포넌트 / Pagination component
 *
 * 페이지네이션 컨트롤을 제공하는 컴포넌트입니다.
 * 첫/마지막 페이지, 이전/다음 페이지 버튼을 지원하며,
 * 많은 페이지가 있을 경우 자동으로 생략 표시(...)를 합니다.
 *
 * Component that provides pagination controls.
 * Supports first/last page and previous/next page buttons,
 * and automatically shows ellipsis (...) when there are many pages.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [page, setPage] = useState(1)
 *
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 *
 * @example
 * // Outlined 스타일, 원형 버튼 / Outlined style, circular buttons
 * <Pagination
 *   currentPage={page}
 *   totalPages={20}
 *   onPageChange={setPage}
 *   variant="outlined"
 *   shape="circle"
 * />
 *
 * @param {PaginationProps} props - Pagination 컴포넌트의 props / Pagination component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Pagination 컴포넌트 / Pagination component
 */
const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  (
    {
      dot: dotProp,
      style,
      currentPage,
      totalPages,
      onPageChange,
      showFirstLast = true,
      showPrevNext = true,
      maxVisiblePages = 5,
      size = "md",
      variant = "default",
      shape = "square",
      ...props
    },
    ref,
  ) => {
    const getVisiblePages = (): (number | string)[] => {
      const pages: (number | string)[] = [];
      const halfVisible = Math.floor(maxVisiblePages / 2);

      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, currentPage + halfVisible);

      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }

      return pages;
    };

    const handlePageClick = (page: number) => {
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    };

    const visiblePages = getVisiblePages();

    const wrapperStyle = useMemo(
      () => mergeStyles(BASE_WRAPPER, resolveDot(dotProp), style),
      [dotProp, style],
    );

    // Ellipsis height mirrors the button size
    const ellipsisStyle = useMemo(
      () => mergeStyles(ELLIPSIS_STYLE, { height: SIZE_STYLES[size].height }),
      [size],
    );

    return (
      <div ref={ref} style={wrapperStyle} {...props}>
        {/* 첫 페이지 버튼 */}
        {showFirstLast && currentPage > 1 && (
          <PageButton
            onClick={() => handlePageClick(1)}
            variant={variant}
            size={size}
            shape={shape}
            aria-label="첫 페이지로 이동"
          >
            <svg
              style={SVG_STYLE}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7M19 19l-7-7 7-7"
              />
            </svg>
          </PageButton>
        )}

        {/* 이전 페이지 버튼 */}
        {showPrevNext && currentPage > 1 && (
          <PageButton
            onClick={() => handlePageClick(currentPage - 1)}
            variant={variant}
            size={size}
            shape={shape}
            aria-label="이전 페이지로 이동"
          >
            <svg
              style={SVG_STYLE}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </PageButton>
        )}

        {/* 페이지 번호들 */}
        {visiblePages.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span style={ellipsisStyle}>...</span>
            ) : (
              <PageButton
                onClick={() => handlePageClick(page as number)}
                isActive={page === currentPage}
                variant={variant}
                size={size}
                shape={shape}
                aria-label={`${page}페이지로 이동`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </PageButton>
            )}
          </React.Fragment>
        ))}

        {/* 다음 페이지 버튼 */}
        {showPrevNext && currentPage < totalPages && (
          <PageButton
            onClick={() => handlePageClick(currentPage + 1)}
            variant={variant}
            size={size}
            shape={shape}
            aria-label="다음 페이지로 이동"
          >
            <svg
              style={SVG_STYLE}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </PageButton>
        )}

        {/* 마지막 페이지 버튼 */}
        {showFirstLast && currentPage < totalPages && (
          <PageButton
            onClick={() => handlePageClick(totalPages)}
            variant={variant}
            size={size}
            shape={shape}
            aria-label="마지막 페이지로 이동"
          >
            <svg
              style={SVG_STYLE}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
          </PageButton>
        )}
      </div>
    );
  },
);
Pagination.displayName = "Pagination";

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

export const PaginationOutlined = React.forwardRef<
  HTMLDivElement,
  Omit<PaginationProps, "variant">
>((props, ref) => <Pagination ref={ref} variant="outlined" {...props} />);
PaginationOutlined.displayName = "PaginationOutlined";

export const PaginationMinimal = React.forwardRef<
  HTMLDivElement,
  Omit<PaginationProps, "variant">
>((props, ref) => <Pagination ref={ref} variant="minimal" {...props} />);
PaginationMinimal.displayName = "PaginationMinimal";

// ---------------------------------------------------------------------------
// PaginationWithInfo
// ---------------------------------------------------------------------------

export const PaginationWithInfo = React.forwardRef<
  HTMLDivElement,
  PaginationProps & {
    totalItems?: number;
    itemsPerPage?: number;
    showInfo?: boolean;
  }
>(
  (
    {
      totalItems = 0,
      itemsPerPage = 10,
      showInfo = true,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const startItem = (props.currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(props.currentPage * itemsPerPage, totalItems);

    const wrapperStyle = useMemo(
      () => mergeStyles(INFO_WRAPPER, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return (
      <div style={wrapperStyle}>
        {showInfo && (
          <div style={INFO_TEXT}>
            {totalItems > 0 ? (
              <>
                <span style={{ fontWeight: 500 }}>{startItem}</span>
                {" - "}
                <span style={{ fontWeight: 500 }}>{endItem}</span>
                {" of "}
                <span style={{ fontWeight: 500 }}>{totalItems}</span>
                {" results"}
              </>
            ) : (
              "No results"
            )}
          </div>
        )}
        <Pagination ref={ref} {...props} />
      </div>
    );
  },
);
PaginationWithInfo.displayName = "PaginationWithInfo";

export { Pagination };
