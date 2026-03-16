"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Variant style maps
// ---------------------------------------------------------------------------

const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "rgba(31, 41, 55, 0.95)", // gray-800
    color: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3), 0 2px 4px -1px rgba(0,0,0,0.2)",
  },
  dark: {
    backgroundColor: "rgba(17, 24, 39, 0.97)", // gray-900
    color: "#ffffff",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)",
  },
  light: {
    backgroundColor: "var(--color-popover, #ffffff)",
    color: "var(--color-popover-foreground, #0f172a)",
    border: "1px solid var(--color-border, rgba(226,232,240,1))",
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  },
};

// Arrow color per variant+position (the "colored" side of the border trick)
const ARROW_COLOR: Record<string, string> = {
  default: "rgba(31, 41, 55, 0.95)",
  dark: "rgba(17, 24, 39, 0.97)",
  light: "var(--color-popover, #ffffff)",
};

// ---------------------------------------------------------------------------
// Arrow CSSProperties by position
// ---------------------------------------------------------------------------

function getArrowStyle(
  position: TooltipProps["position"],
  variant: TooltipProps["variant"] = "default",
): React.CSSProperties {
  const color = ARROW_COLOR[variant ?? "default"];
  const transparent = "transparent";
  const size = 5;

  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
  };

  switch (position) {
    case "top":
      return {
        ...base,
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        borderLeft: `${size}px solid ${transparent}`,
        borderRight: `${size}px solid ${transparent}`,
        borderTop: `${size}px solid ${color}`,
      };
    case "bottom":
      return {
        ...base,
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        borderLeft: `${size}px solid ${transparent}`,
        borderRight: `${size}px solid ${transparent}`,
        borderBottom: `${size}px solid ${color}`,
      };
    case "left":
      return {
        ...base,
        left: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        borderTop: `${size}px solid ${transparent}`,
        borderBottom: `${size}px solid ${transparent}`,
        borderLeft: `${size}px solid ${color}`,
      };
    case "right":
      return {
        ...base,
        right: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        borderTop: `${size}px solid ${transparent}`,
        borderBottom: `${size}px solid ${transparent}`,
        borderRight: `${size}px solid ${color}`,
      };
    default:
      return {
        ...base,
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        borderLeft: `${size}px solid ${transparent}`,
        borderRight: `${size}px solid ${transparent}`,
        borderTop: `${size}px solid ${color}`,
      };
  }
}

// ---------------------------------------------------------------------------
// Tooltip popup transform per position
// ---------------------------------------------------------------------------

function getPopupTransform(position: TooltipProps["position"]): string {
  switch (position) {
    case "top":
      return "translate(-50%, -100%)";
    case "bottom":
      return "translate(-50%, 0%)";
    case "left":
      return "translate(-100%, -50%)";
    case "right":
      return "translate(0%, -50%)";
    default:
      return "translate(-50%, -100%)";
  }
}

// ---------------------------------------------------------------------------
// TooltipProps
// ---------------------------------------------------------------------------

/**
 * Tooltip 컴포넌트의 props / Tooltip component props
 * @typedef {Object} TooltipProps
 * @property {string} content - Tooltip 내용 / Tooltip content
 * @property {React.ReactNode} children - Tooltip이 연결될 요소 / Element to attach tooltip to
 * @property {"top" | "bottom" | "left" | "right"} [position="top"] - Tooltip 표시 위치 / Tooltip display position
 * @property {"default" | "light" | "dark"} [variant="default"] - Tooltip 스타일 변형 / Tooltip style variant
 * @property {number} [delay=300] - Tooltip 표시 지연 시간(ms) / Tooltip display delay (ms)
 * @property {boolean} [disabled=false] - Tooltip 비활성화 여부 / Disable tooltip
 * @property {string} [dot] - dot utility string for wrapper element
 * @property {React.CSSProperties} [style] - inline style for wrapper element
 */
export interface TooltipProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "default" | "light" | "dark";
  delay?: number;
  disabled?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

/**
 * Tooltip 컴포넌트 / Tooltip component
 *
 * 호버 시 추가 정보를 표시하는 툴팁 컴포넌트입니다.
 * 마우스 호버 시 지연 시간 후 표시됩니다.
 *
 * Tooltip component that displays additional information on hover.
 * Appears after a delay when the mouse hovers over the element.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Tooltip content="이것은 도움말입니다">
 *   <Button>호버하세요</Button>
 * </Tooltip>
 *
 * @example
 * // 다양한 위치 / Different positions
 * <Tooltip content="위치 변경" position="bottom">
 *   <Icon name="info" />
 * </Tooltip>
 *
 * @example
 * // 커스텀 스타일 / Custom styles
 * <Tooltip content="라이트 스타일" variant="light" delay={500}>
 *   <span>호버</span>
 * </Tooltip>
 *
 * @param {TooltipProps} props - Tooltip 컴포넌트의 props / Tooltip component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Tooltip 컴포넌트 / Tooltip component
 *
 * @todo 접근성 개선: role="tooltip" 추가 필요 / Accessibility: Add role="tooltip"
 * @todo 접근성 개선: aria-describedby 연결 필요 / Accessibility: Connect aria-describedby
 * @todo 접근성 개선: 키보드 포커스 시 Tooltip 표시 필요 / Accessibility: Show tooltip on keyboard focus
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      dot: dotProp,
      style,
      content,
      children,
      position = "top",
      variant = "default",
      delay = 300,
      disabled = false,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [coords, setCoords] = React.useState({ x: 0, y: 0 });
    const timeoutRef = React.useRef<number | undefined>(undefined);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    const showTooltip = (e: React.MouseEvent) => {
      if (disabled) return;

      const rect = e.currentTarget.getBoundingClientRect();

      let x = 0;
      let y = 0;

      switch (position) {
        case "top":
          x = rect.left + rect.width / 2;
          y = rect.top - 8;
          break;
        case "bottom":
          x = rect.left + rect.width / 2;
          y = rect.bottom + 8;
          break;
        case "left":
          x = rect.left - 8;
          y = rect.top + rect.height / 2;
          break;
        case "right":
          x = rect.right + 8;
          y = rect.top + rect.height / 2;
          break;
      }

      setCoords({ x, y });

      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, delay);
    };

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const wrapperStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          { position: "relative", display: "inline-block" },
          resolveDot(dotProp),
          style,
        ),
      [dotProp, style],
    );

    const popupStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          {
            position: "fixed",
            zIndex: 50,
            ...resolveDot("py-2 px-3 rounded-lg"),
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          },
          VARIANT_STYLES[variant],
          {
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: getPopupTransform(position),
          },
        ),
      [variant, coords, position],
    );

    const arrowStyle = useMemo(
      () => getArrowStyle(position, variant),
      [position, variant],
    );

    return (
      <div
        ref={ref}
        style={wrapperStyle}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        {...props}
      >
        {children}

        {isVisible && (
          <div ref={tooltipRef} style={popupStyle}>
            {content}
            {/* Arrow */}
            <div style={arrowStyle} />
          </div>
        )}
      </div>
    );
  },
);
Tooltip.displayName = "Tooltip";

// ---------------------------------------------------------------------------
// Convenience components
// ---------------------------------------------------------------------------

export const TooltipLight = React.forwardRef<
  HTMLDivElement,
  Omit<TooltipProps, "variant">
>((props, ref) => <Tooltip ref={ref} variant="light" {...props} />);
TooltipLight.displayName = "TooltipLight";

export const TooltipDark = React.forwardRef<
  HTMLDivElement,
  Omit<TooltipProps, "variant">
>((props, ref) => <Tooltip ref={ref} variant="dark" {...props} />);
TooltipDark.displayName = "TooltipDark";

export { Tooltip };
