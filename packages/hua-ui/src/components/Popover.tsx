"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ─── Shared design tokens ─────────────────────────────────────────────────────

const BASE_PANEL: React.CSSProperties = {
  position: "absolute",
  zIndex: 50,
  backgroundColor: "var(--color-popover, var(--background))",
  color: "var(--color-popover-foreground, var(--foreground))",
  border: "1px solid var(--color-border)",
  ...resolveDot("rounded-lg p-4"),
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  minWidth: "200px",
};

// ─── Position helpers ─────────────────────────────────────────────────────────

function getPanelPositionStyle(
  position: "top" | "bottom" | "left" | "right",
  offset: number,
): React.CSSProperties {
  switch (position) {
    case "top":
      return { bottom: "100%", marginBottom: offset };
    case "bottom":
      return { top: "100%", marginTop: offset };
    case "left":
      return { right: "100%", marginRight: offset };
    case "right":
      return { left: "100%", marginLeft: offset };
  }
}

function getPanelAlignStyle(
  position: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end",
): React.CSSProperties {
  const isVertical = position === "top" || position === "bottom";

  if (align === "start") {
    return isVertical ? { left: 0 } : { top: 0 };
  }
  if (align === "end") {
    return isVertical ? { right: 0 } : { bottom: 0 };
  }
  // center
  return isVertical
    ? { left: "50%", transform: "translateX(-50%)" }
    : { top: "50%", transform: "translateY(-50%)" };
}

/** CSS border-trick arrow pointing toward the trigger */
function getArrowStyle(
  position: "top" | "bottom" | "left" | "right",
): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    width: 0,
    height: 0,
    border: "5px solid transparent",
  };

  const color = "var(--color-border)";

  switch (position) {
    case "top":
      // Arrow points down (below the panel, toward trigger)
      return {
        ...base,
        top: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        borderTopColor: color,
        borderBottom: "none",
      };
    case "bottom":
      // Arrow points up (above the panel, toward trigger)
      return {
        ...base,
        bottom: "100%",
        left: "50%",
        transform: "translateX(-50%)",
        borderBottomColor: color,
        borderTop: "none",
      };
    case "left":
      // Arrow points right (toward trigger on the right)
      return {
        ...base,
        left: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        borderLeftColor: color,
        borderRight: "none",
      };
    case "right":
      // Arrow points left (toward trigger on the left)
      return {
        ...base,
        right: "100%",
        top: "50%",
        transform: "translateY(-50%)",
        borderRightColor: color,
        borderLeft: "none",
      };
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Popover 컴포넌트의 props / Popover component props
 * @typedef {Object} PopoverProps
 * @property {React.ReactNode} children - Popover 내용 / Popover content
 * @property {React.ReactNode} trigger - Popover를 열기 위한 트리거 요소 / Trigger element to open popover
 * @property {boolean} [open] - 제어 모드에서 열림/닫힘 상태 / Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - 상태 변경 콜백 / State change callback
 * @property {"top" | "bottom" | "left" | "right"} [position="bottom"] - Popover 표시 위치 / Popover display position
 * @property {"start" | "center" | "end"} [align="center"] - Popover 정렬 / Popover alignment
 * @property {number} [offset=8] - 트리거와 Popover 사이 간격 (px) / Spacing between trigger and popover (px)
 * @property {boolean} [disabled=false] - Popover 비활성화 여부 / Disable popover
 * @property {string} [contentDot] - dot utility string for popover panel / 팝오버 패널 dot 유틸리티
 * @property {React.CSSProperties} [contentStyle] - inline style for popover panel / 팝오버 패널 인라인 스타일
 * @property {boolean} [fullWidth] - 트리거를 full-width로 렌더링 / Render trigger as full-width
 * @property {string} [dot] - dot utility string for wrapper / 래퍼 dot 유틸리티
 * @property {React.CSSProperties} [style] - inline style for wrapper / 래퍼 인라인 스타일
 */
export interface PopoverProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  children: React.ReactNode;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  position?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  offset?: number;
  disabled?: boolean;
  /** dot utility string for popover content panel */
  contentDot?: string;
  /** inline style overrides for popover content panel */
  contentStyle?: React.CSSProperties;
  /** Render trigger as full-width (DatePicker etc.) */
  fullWidth?: boolean;
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Popover 컴포넌트 / Popover component
 *
 * 트리거 요소를 클릭하면 표시되는 팝오버 컴포넌트입니다.
 * 외부 클릭 시 자동으로 닫힙니다.
 *
 * Popover component that appears when the trigger element is clicked.
 * Automatically closes when clicking outside.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Popover trigger={<Button>열기</Button>}>
 *   <div style={{ padding: 16 }}>Popover 내용</div>
 * </Popover>
 *
 * @example
 * // 제어 모드 / Controlled mode
 * const [open, setOpen] = useState(false)
 * <Popover
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={<Button>제어 모드</Button>}
 *   position="top"
 * >
 *   <div style={{ padding: 16 }}>내용</div>
 * </Popover>
 *
 * @param {PopoverProps} props - Popover 컴포넌트의 props / Popover component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Popover 컴포넌트 / Popover component
 */
const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  (
    {
      dot: dotProp,
      style,
      children,
      trigger,
      open: controlledOpen,
      onOpenChange,
      position = "bottom",
      align = "center",
      offset = 8,
      disabled = false,
      contentDot,
      contentStyle,
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const triggerRef = React.useRef<HTMLDivElement>(null);
    const popoverRef = React.useRef<HTMLDivElement>(null);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalOpen;

    const handleOpenChange = React.useCallback(
      (newOpen: boolean) => {
        if (disabled) return;
        if (!isControlled) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [disabled, isControlled, onOpenChange],
    );

    const handleTriggerClick = () => {
      handleOpenChange(!isOpen);
    };

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          popoverRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          !popoverRef.current.contains(event.target as Node)
        ) {
          handleOpenChange(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    }, [isOpen, handleOpenChange]);

    const wrapperStyle = useMemo(
      () => mergeStyles({ position: "relative" }, resolveDot(dotProp), style),
      [dotProp, style],
    );

    const triggerWrapperStyle: React.CSSProperties = useMemo(
      () => ({
        display: fullWidth ? "block" : "inline-block",
        width: fullWidth ? "100%" : undefined,
        cursor: "pointer",
      }),
      [fullWidth],
    );

    const panelStyle = useMemo(
      () =>
        mergeStyles(
          BASE_PANEL,
          getPanelPositionStyle(position, offset),
          getPanelAlignStyle(position, align),
          resolveDot(contentDot),
          contentStyle,
        ),
      [position, offset, align, contentDot, contentStyle],
    );

    const arrowStyle = useMemo(() => getArrowStyle(position), [position]);

    return (
      <div ref={ref} style={wrapperStyle} {...props}>
        {/* 트리거 */}
        <div
          ref={triggerRef}
          onClick={handleTriggerClick}
          style={triggerWrapperStyle}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {trigger}
        </div>

        {/* 팝오버 패널 */}
        {isOpen && (
          <div
            ref={popoverRef}
            role="dialog"
            data-position={position}
            data-align={align}
            style={panelStyle}
          >
            {/* 화살표 */}
            <div aria-hidden="true" style={arrowStyle} />

            {/* 내용 */}
            <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
          </div>
        )}
      </div>
    );
  },
);
Popover.displayName = "Popover";

// ─── Convenience sub-components ───────────────────────────────────────────────

export interface PopoverTriggerProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

export const PopoverTrigger = React.forwardRef<
  HTMLDivElement,
  PopoverTriggerProps
>(({ dot: dotProp, style, children, ...props }, ref) => {
  const computedStyle = useMemo(
    () =>
      mergeStyles(
        { display: "inline-block", cursor: "pointer" },
        resolveDot(dotProp),
        style,
      ),
    [dotProp, style],
  );
  return (
    <div ref={ref} style={computedStyle} {...props}>
      {children}
    </div>
  );
});
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  style?: React.CSSProperties;
}

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  PopoverContentProps
>(({ dot: dotProp, style, children, ...props }, ref) => {
  const computedStyle = useMemo(
    () => mergeStyles(BASE_PANEL, resolveDot(dotProp), style),
    [dotProp, style],
  );
  return (
    <div ref={ref} style={computedStyle} {...props}>
      {children}
    </div>
  );
});
PopoverContent.displayName = "PopoverContent";

export { Popover };
