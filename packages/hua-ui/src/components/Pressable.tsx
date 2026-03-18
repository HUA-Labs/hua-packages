"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useDotMap, mergeStyles } from "../hooks/useDotMap";
import { Slot } from "../lib/Slot";
import { TRANSITIONS } from "../lib/styles/transition";

/** Minimum touch target size (px) per WCAG 2.1 AA §2.5.5 */
const MIN_TOUCH_PX = 44;

export interface PressableProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  dot?: string;
  asChild?: boolean;
  /**
   * Disable the WCAG 2.1 AA minimum touch target (44 × 44 px).
   * Use when the element is part of a larger interactive region or when
   * the enclosing layout already satisfies the size requirement.
   */
  disableMinTouch?: boolean;
}

const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  (
    {
      dot: dotProp,
      style,
      asChild = false,
      disabled,
      disableMinTouch = false,
      children,
      onMouseDown,
      onMouseUp,
      onMouseEnter: onMouseEnterProp,
      onMouseLeave: onMouseLeaveProp,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const { style: dotStyle, handlers } = useDotMap(dotProp ?? "", {
      disabled: !!disabled,
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsHovered(true);
        handlers.onMouseEnter();
        onMouseEnterProp?.(e);
      },
      [handlers, onMouseEnterProp],
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsHovered(false);
        setIsPressed(false);
        handlers.onMouseLeave();
        onMouseLeaveProp?.(e);
      },
      [handlers, onMouseLeaveProp],
    );

    const handleMouseDown = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) setIsPressed(true);
        onMouseDown?.(e);
      },
      [disabled, onMouseDown],
    );

    const handleMouseUp = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsPressed(false);
        onMouseUp?.(e);
      },
      [onMouseUp],
    );

    /**
     * Default interaction styles.
     * Merging order: defaultStyle → dotStyle → explicit style prop
     * This means dot prop and explicit style always win over defaults.
     */
    const defaultStyle = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        transition: TRANSITIONS.micro,
        cursor: disabled ? "not-allowed" : "pointer",
        // Hover: subtle dim — overridden if dot prop sets its own hover opacity
        opacity: isHovered && !disabled && !isPressed ? 0.85 : 1,
      };

      if (!disableMinTouch) {
        base.minHeight = MIN_TOUCH_PX;
        base.minWidth = MIN_TOUCH_PX;
        base.display = "inline-flex";
      }

      // Active press feedback: subtle scale-down
      if (isPressed && !disabled) {
        base.transform = "scale(0.98)";
        base.opacity = 1;
      }

      return base;
    }, [disabled, disableMinTouch, isHovered, isPressed]);

    const computedStyle = useMemo(
      () => mergeStyles(defaultStyle, dotStyle, style),
      [defaultStyle, dotStyle, style],
    );

    // Provide combined handlers — dot handlers (focus/blur) are kept via spread
    const combinedHandlers = {
      onFocus: handlers.onFocus,
      onBlur: handlers.onBlur,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    if (asChild) {
      return (
        <Slot
          ref={ref}
          style={computedStyle}
          aria-disabled={disabled || undefined}
          onMouseDown={handleMouseDown as React.MouseEventHandler}
          onMouseUp={handleMouseUp as React.MouseEventHandler}
          {...combinedHandlers}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        style={computedStyle}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...combinedHandlers}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Pressable.displayName = "Pressable";

export { Pressable };
