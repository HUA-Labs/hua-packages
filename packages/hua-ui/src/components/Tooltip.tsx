"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

function composeCleanupAwareRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (node) => {
    const cleanupCallbacks: (() => void)[] = [];

    for (const ref of refs) {
      if (typeof ref === "function") {
        const cleanup = ref(node);
        if (node !== null) {
          cleanupCallbacks.push(
            typeof cleanup === "function" ? cleanup : () => ref(null),
          );
        }
      } else if (ref != null) {
        ref.current = node;
        if (node !== null) {
          cleanupCallbacks.push(() => {
            ref.current = null;
          });
        }
      }
    }

    if (node === null) return;
    return () => {
      for (const cleanup of cleanupCallbacks) cleanup();
    };
  };
}

type TooltipTriggerProps = React.HTMLAttributes<HTMLElement> & {
  ref?: React.Ref<HTMLElement>;
};

type TooltipTriggerElement = React.ReactElement<TooltipTriggerProps>;

type TooltipTriggerOwnership = Readonly<{
  mode: "empty" | "direct" | "wrapper";
  type: unknown;
  key: React.Key | null;
}>;

function collectRenderableChildren(
  children: React.ReactNode,
  output: React.ReactNode[] = [],
): React.ReactNode[] {
  React.Children.forEach(children, (child) => {
    if (child == null || typeof child === "boolean" || child === "") return;
    if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
      if (child.type === React.Fragment) {
        collectRenderableChildren(child.props.children, output);
        return;
      }
    }
    output.push(child);
  });
  return output;
}

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
 * @property {React.ReactNode} children - Tooltip trigger content. A single element is used directly; legacy text/groups use the wrapper.
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
 * 단일 trigger의 hover 또는 keyboard focus 시 추가 정보를 표시합니다.
 * trigger의 기존 handler, ref, aria-describedby를 보존해 합성합니다.
 *
 * Displays additional information for one trigger on hover or keyboard focus.
 * Existing trigger handlers, refs, and aria-describedby tokens are composed.
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
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      ...props
    },
    ref,
  ) => {
    const [visibleOwnership, setVisibleOwnership] =
      React.useState<TooltipTriggerOwnership | null>(null);
    const [coords, setCoords] = React.useState({ x: 0, y: 0 });
    const timeoutRef = React.useRef<number | undefined>(undefined);
    const tooltipRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLElement>(null);
    const isHoveredRef = React.useRef(false);
    const isFocusedRef = React.useRef(false);
    const generatedId = React.useId();
    const tooltipId = `${generatedId}-tooltip`;

    const renderableChildren = useMemo(
      () => collectRenderableChildren(children),
      [children],
    );
    const hasRenderableChildren = renderableChildren.length > 0;
    const trigger =
      renderableChildren.length === 1 &&
      React.isValidElement<TooltipTriggerProps>(renderableChildren[0]) &&
      renderableChildren[0].type !== React.Fragment
        ? (renderableChildren[0] as TooltipTriggerElement)
        : null;
    const usesDirectTrigger = trigger !== null;
    const triggerOwnership = useMemo<TooltipTriggerOwnership>(
      () =>
        usesDirectTrigger
          ? {
              mode: "direct",
              type: trigger.type,
              key: trigger.key,
            }
          : {
              mode: hasRenderableChildren ? "wrapper" : "empty",
              type: null,
              key: null,
            },
      [hasRenderableChildren, trigger?.key, trigger?.type, usesDirectTrigger],
    );
    const previousTriggerOwnershipRef = React.useRef(triggerOwnership);
    const triggerProps = trigger?.props ?? {};
    const composedTriggerRef = useMemo(
      () => composeCleanupAwareRefs(triggerRef, triggerProps.ref),
      [triggerProps.ref],
    );

    const clearShowTimer = React.useCallback(() => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    }, []);

    const updateCoords = React.useCallback(
      (target: HTMLElement) => {
        const rect = target.getBoundingClientRect();

        switch (position) {
          case "top":
            setCoords({ x: rect.left + rect.width / 2, y: rect.top - 8 });
            break;
          case "bottom":
            setCoords({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
            break;
          case "left":
            setCoords({ x: rect.left - 8, y: rect.top + rect.height / 2 });
            break;
          case "right":
            setCoords({ x: rect.right + 8, y: rect.top + rect.height / 2 });
            break;
        }
      },
      [position],
    );

    const scheduleShow = React.useCallback(
      (target: HTMLElement) => {
        if (disabled || !hasRenderableChildren) return;
        clearShowTimer();
        updateCoords(target);
        timeoutRef.current = window.setTimeout(() => {
          timeoutRef.current = undefined;
          setVisibleOwnership(triggerOwnership);
        }, delay);
      },
      [
        clearShowTimer,
        delay,
        disabled,
        hasRenderableChildren,
        triggerOwnership,
        updateCoords,
      ],
    );

    const hideIfInactive = React.useCallback(() => {
      if (isHoveredRef.current || isFocusedRef.current) return;
      clearShowTimer();
      setVisibleOwnership(null);
    }, [clearShowTimer]);

    const dismissTooltip = React.useCallback(() => {
      clearShowTimer();
      setVisibleOwnership(null);
    }, [clearShowTimer]);

    React.useEffect(() => {
      if (previousTriggerOwnershipRef.current === triggerOwnership) return;
      previousTriggerOwnershipRef.current = triggerOwnership;
      isHoveredRef.current = false;
      isFocusedRef.current = false;
      dismissTooltip();
    }, [dismissTooltip, triggerOwnership]);

    React.useEffect(() => {
      if (disabled) {
        isHoveredRef.current = false;
        isFocusedRef.current = false;
        dismissTooltip();
      }
    }, [disabled, dismissTooltip]);

    React.useEffect(() => dismissTooltip, [dismissTooltip]);

    const existingDescribedBy = usesDirectTrigger
      ? triggerProps["aria-describedby"]
      : props["aria-describedby"];
    const isTooltipVisible =
      visibleOwnership === triggerOwnership &&
      !disabled &&
      hasRenderableChildren;
    const describedBy = useMemo(() => {
      if (!isTooltipVisible) return existingDescribedBy;
      const tokens =
        existingDescribedBy?.trim().split(/\s+/).filter(Boolean) ?? [];
      if (tokens.includes(tooltipId)) return existingDescribedBy;
      return existingDescribedBy
        ? `${existingDescribedBy} ${tooltipId}`
        : tooltipId;
    }, [existingDescribedBy, isTooltipVisible, tooltipId]);

    const handleTriggerMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onMouseEnter?.(event);
      onMouseEnter?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      isHoveredRef.current = true;
      scheduleShow(event.currentTarget);
    };

    const handleTriggerMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
      triggerProps.onMouseLeave?.(event);
      onMouseLeave?.(event as unknown as React.MouseEvent<HTMLDivElement>);
      isHoveredRef.current = false;
      hideIfInactive();
    };

    const handleTriggerFocus = (event: React.FocusEvent<HTMLElement>) => {
      triggerProps.onFocus?.(event);
      onFocus?.(event as unknown as React.FocusEvent<HTMLDivElement>);
      isFocusedRef.current = true;
      scheduleShow(event.currentTarget);
    };

    const handleTriggerBlur = (event: React.FocusEvent<HTMLElement>) => {
      triggerProps.onBlur?.(event);
      onBlur?.(event as unknown as React.FocusEvent<HTMLDivElement>);
      isFocusedRef.current = false;
      hideIfInactive();
    };

    const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
      triggerProps.onKeyDown?.(event);
      onKeyDown?.(event as unknown as React.KeyboardEvent<HTMLDivElement>);
      if (event.key === "Escape") dismissTooltip();
    };

    const handleWrapperMouseEnter = (
      event: React.MouseEvent<HTMLDivElement>,
    ) => {
      onMouseEnter?.(event);
      isHoveredRef.current = true;
      scheduleShow(event.currentTarget);
    };

    const handleWrapperMouseLeave = (
      event: React.MouseEvent<HTMLDivElement>,
    ) => {
      onMouseLeave?.(event);
      isHoveredRef.current = false;
      hideIfInactive();
    };

    const handleWrapperFocus = (event: React.FocusEvent<HTMLDivElement>) => {
      onFocus?.(event);
      if (event.target !== event.currentTarget) return;
      isFocusedRef.current = true;
      scheduleShow(event.currentTarget);
    };

    const handleWrapperBlur = (event: React.FocusEvent<HTMLDivElement>) => {
      onBlur?.(event);
      if (event.target !== event.currentTarget) return;
      isFocusedRef.current = false;
      hideIfInactive();
    };

    const handleWrapperKeyDown = (
      event: React.KeyboardEvent<HTMLDivElement>,
    ) => {
      onKeyDown?.(event);
      if (event.key === "Escape") dismissTooltip();
    };

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

    const composedTrigger = trigger
      ? React.cloneElement(trigger, {
          ref: composedTriggerRef,
          "aria-describedby": describedBy,
          onMouseEnter: handleTriggerMouseEnter,
          onMouseLeave: handleTriggerMouseLeave,
          onFocus: handleTriggerFocus,
          onBlur: handleTriggerBlur,
          onKeyDown: handleTriggerKeyDown,
        })
      : null;

    const popup = isTooltipVisible ? (
      <div ref={tooltipRef} id={tooltipId} role="tooltip" style={popupStyle}>
        {content}
        <div style={arrowStyle} />
      </div>
    ) : null;

    if (!usesDirectTrigger) {
      return (
        <div
          ref={ref}
          style={wrapperStyle}
          {...props}
          aria-describedby={describedBy}
          onMouseEnter={handleWrapperMouseEnter}
          onMouseLeave={handleWrapperMouseLeave}
          onFocus={handleWrapperFocus}
          onBlur={handleWrapperBlur}
          onKeyDown={handleWrapperKeyDown}
        >
          {children}
          {popup}
        </div>
      );
    }

    return (
      <div ref={ref} style={wrapperStyle} {...props}>
        {composedTrigger}
        {popup}
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
