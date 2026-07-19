"use client";

import React, { useMemo, useState, useCallback } from "react";
import { useDotMap, mergeStyles } from "../hooks/useDotMap";
import { dotClass } from "@hua-labs/dot/class";
import { Slot } from "../lib/Slot";
import { TRANSITIONS } from "../lib/styles/transition";
import { joinWebClassNames } from "../lib/web-classname";

export interface PressableProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  dot?: string;
  /** CSS-rule features: responsive (sm:, md:), state (hover:, focus:), pseudo-elements */
  classDot?: string;
  /** Opaque Web class bytes. No Dot parsing or utility conflict resolution. */
  className?: string;
  /** Remove Pressable-owned visual defaults while preserving interaction semantics. */
  unstyled?: boolean;
  asChild?: boolean;
  /**
   * Disable the component-owned 44 × 44 px minimum below `sm`; natural size
   * at `sm` and above. Use when the enclosing layout already supplies the
   * intended target size.
   */
  disableMinTouch?: boolean;
}

const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  (
    {
      dot: dotProp,
      classDot,
      className,
      unstyled = false,
      style,
      asChild = false,
      disabled,
      disableMinTouch = false,
      children,
      onMouseDown,
      onMouseUp,
      onMouseEnter: onMouseEnterProp,
      onMouseLeave: onMouseLeaveProp,
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      onClickCapture,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);

    const { style: dotStyle, handlers } = useDotMap(dotProp ?? "", {
      disabled: !!disabled,
    });

    /** Responsive touch target: 44px on mobile, natural size on sm+ */
    const touchClassName = useMemo(
      () =>
        disableMinTouch
          ? ""
          : dotClass("min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0"),
      [disableMinTouch],
    );

    const classDotName = useMemo(
      () => (classDot ? dotClass(classDot) : undefined),
      [classDot],
    );

    const combinedClassName = useMemo(() => {
      return joinWebClassNames(touchClassName, classDotName, className);
    }, [touchClassName, classDotName, className]);

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

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        handlers.onFocus();
        onFocusProp?.(event as React.FocusEvent<HTMLButtonElement>);
      },
      [handlers, onFocusProp],
    );

    const handleBlur = useCallback(
      (event: React.FocusEvent<HTMLElement>) => {
        handlers.onBlur();
        onBlurProp?.(event as React.FocusEvent<HTMLButtonElement>);
      },
      [handlers, onBlurProp],
    );

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event as React.MouseEvent<HTMLButtonElement>);
      },
      [disabled, onClick],
    );

    const handleClickCapture = useCallback(
      (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClickCapture?.(
          event as React.MouseEvent<HTMLButtonElement, MouseEvent>,
        );
      },
      [disabled, onClickCapture],
    );

    /**
     * Default interaction styles.
     * Merging order: defaultStyle → dotStyle → explicit style prop
     * This means dot prop and explicit style always win over defaults.
     */
    const defaultStyle = useMemo((): React.CSSProperties => {
      if (unstyled) return {};

      const base: React.CSSProperties = {
        display: "inline-flex",
        transition: TRANSITIONS.micro,
        cursor: disabled ? "not-allowed" : "pointer",
        // Hover: subtle dim — overridden if dot prop sets its own hover opacity
        opacity: disabled ? 0.5 : isHovered && !isPressed ? 0.85 : 1,
      };

      // Active press feedback: subtle scale-down
      if (isPressed && !disabled) {
        base.transform = "scale(0.98)";
        base.opacity = 1;
      }

      return base;
    }, [disabled, isHovered, isPressed, unstyled]);

    const computedStyle = useMemo(
      () => mergeStyles(defaultStyle, dotStyle, style),
      [defaultStyle, dotStyle, style],
    );

    // Provide combined handlers — dot handlers (focus/blur) are kept via spread
    const combinedHandlers = {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    };

    if (asChild) {
      const childArray = React.Children.toArray(children);
      const slottableChild =
        childArray.length === 1 && React.isValidElement(childArray[0])
          ? (childArray[0] as React.ReactElement<{
              "aria-disabled"?: React.AriaAttributes["aria-disabled"];
              tabIndex?: number;
            }>)
          : null;
      const guardedChild =
        disabled && slottableChild
          ? React.cloneElement(slottableChild, {
              "aria-disabled": true,
              tabIndex: -1,
            })
          : children;

      return (
        <Slot
          ref={ref}
          className={combinedClassName}
          style={computedStyle}
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={handleClick}
          onMouseDown={handleMouseDown as React.MouseEventHandler}
          onMouseUp={handleMouseUp as React.MouseEventHandler}
          {...combinedHandlers}
          {...props}
          onClickCapture={handleClickCapture}
        >
          {guardedChild}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        className={combinedClassName}
        style={computedStyle}
        disabled={disabled}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...combinedHandlers}
        {...props}
        onClickCapture={handleClickCapture}
        aria-disabled={disabled ? true : props["aria-disabled"]}
      >
        {children}
      </button>
    );
  },
);
Pressable.displayName = "Pressable";

export { Pressable };
