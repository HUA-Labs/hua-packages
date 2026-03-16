"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Slot } from "../lib/Slot";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  buttonVariantStyles,
  VARIANT_EXTRAS,
  VARIANT_HOVER,
  HOVER_TRANSITIONS,
  HOVER_STYLES,
  ACTIVE_STYLES,
  DISABLED_STYLES,
  gradientPresets,
  getFocusRing,
  type HoverEffect,
} from "./Button.variants";

type Variant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "gradient"
  | "neon"
  | "glass";

type Size = "sm" | "md" | "lg" | "xl" | "icon";
type Rounded = "sm" | "md" | "lg" | "full";
type Shadow = "none" | "sm" | "md" | "lg" | "xl";
type GradientName = "blue" | "purple" | "green" | "orange" | "pink" | "custom";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  gradient?: GradientName;
  customGradient?: string;
  rounded?: Rounded;
  shadow?: Shadow;
  hover?: HoverEffect;
  fullWidth?: boolean;
  iconOnly?: boolean;
  "aria-label"?: string;
  dot?: string;
  disabled?: boolean;
  asChild?: boolean;
};

type AnchorProps = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type"> & {
    href?: undefined;
  };

export type ButtonProps = AnchorProps | NativeButtonProps;

type AnchorOrButton = HTMLAnchorElement | HTMLButtonElement;

const SR_ONLY: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

/**
 * Button 컴포넌트
 *
 * @example
 * <Button onClick={() => console.log('클릭')}>클릭하세요</Button>
 * <Button variant="destructive" size="lg">삭제</Button>
 * <Button variant="gradient" gradient="purple">그라디언트</Button>
 * <Button href="/about" variant="link">자세히 보기</Button>
 */
const ButtonInner = React.forwardRef<AnchorOrButton, ButtonProps>(
  function ButtonInner(
    {
      variant = "default",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      gradient = "blue",
      customGradient,
      rounded = "md",
      shadow = "md",
      hover = "springy",
      fullWidth,
      iconOnly,
      dot: dotProp,
      children,
      disabled,
      asChild = false,
      style,
      ...rest
    },
    ref,
  ) {
    const reduced = useReducedMotion();
    const effectiveHover: HoverEffect = reduced ? "none" : hover;
    const isDisabled = !!disabled || loading;

    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const baseStyle = useMemo(() => {
      const variantBase = buttonVariantStyles({
        variant,
        size,
        rounded,
        shadow,
        fullWidth: fullWidth ?? false,
      });

      const extras = VARIANT_EXTRAS[variant];

      const gradientStyle: React.CSSProperties | undefined =
        variant === "gradient"
          ? {
              backgroundImage:
                customGradient ||
                gradientPresets[gradient] ||
                gradientPresets.blue,
            }
          : undefined;

      const transitionStyle: React.CSSProperties = {
        transition: HOVER_TRANSITIONS[effectiveHover],
      };

      const gpuHint: React.CSSProperties | undefined =
        effectiveHover === "springy" ||
        effectiveHover === "scale" ||
        effectiveHover === "slide"
          ? { willChange: "transform" }
          : undefined;

      return mergeStyles(
        variantBase as React.CSSProperties,
        extras,
        gradientStyle,
        transitionStyle,
        gpuHint,
        resolveDot(dotProp),
        style,
      );
    }, [
      variant,
      size,
      rounded,
      shadow,
      fullWidth,
      gradient,
      customGradient,
      effectiveHover,
      dotProp,
      style,
    ]);

    const computedStyle = useMemo(() => {
      if (isDisabled) return mergeStyles(baseStyle, DISABLED_STYLES);

      let result = baseStyle;

      if (isFocused) {
        result = mergeStyles(result, getFocusRing(variant));
      }

      if (isActive) {
        result = mergeStyles(
          result,
          VARIANT_HOVER[variant],
          ACTIVE_STYLES[effectiveHover],
        );
      } else if (isHovered) {
        result = mergeStyles(
          result,
          VARIANT_HOVER[variant],
          HOVER_STYLES[effectiveHover],
        );
      }

      return result;
    }, [
      baseStyle,
      isDisabled,
      isHovered,
      isActive,
      isFocused,
      variant,
      effectiveHover,
    ]);

    const handleMouseEnter = () => {
      if (!isDisabled) setIsHovered(true);
    };
    const handleMouseLeave = () => {
      setIsHovered(false);
      setIsActive(false);
    };
    const handleMouseDown = () => {
      if (!isDisabled) setIsActive(true);
    };
    const handleMouseUp = () => setIsActive(false);

    const Spinner = (
      <span
        role="status"
        aria-live="polite"
        style={{
          marginLeft: "-4px",
          ...resolveDot("mr-2"),
          display: "inline-flex",
        }}
      >
        <svg
          style={{
            animation: "spin 1s linear infinite",
            height: "16px",
            width: "16px",
          }}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            style={{ opacity: 0.25 }}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            style={{ opacity: 0.75 }}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span style={SR_ONLY}>로딩 중</span>
      </span>
    );

    const content = (
      <>
        {loading && Spinner}
        {!loading && icon && iconPosition === "left" && (
          <span style={resolveDot("mr-2")}>{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span style={resolveDot("ml-2")}>{icon}</span>
        )}
      </>
    );

    if (
      iconOnly &&
      !("aria-label" in rest) &&
      process.env.NODE_ENV !== "production"
    ) {
      console.warn("[Button] iconOnly 사용 시 aria-label을 제공하세요.");
    }

    // asChild: Slot을 사용하여 자식 요소에 props 병합
    if (asChild) {
      return (
        <Slot
          ref={ref}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          {...rest}
          style={computedStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        >
          {children}
        </Slot>
      );
    }

    // 앵커 모드
    if ("href" in rest && rest.href) {
      const {
        onClick,
        target,
        rel,
        href,
        onFocus: onFocusProp,
        onBlur: onBlurProp,
        ...anchorProps
      } = rest as AnchorProps;

      const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (
        e,
      ) => {
        if (isDisabled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onClick?.(e);
      };

      return (
        <a
          {...anchorProps}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          style={computedStyle}
          onClick={handleAnchorClick}
          aria-busy={loading || undefined}
          aria-disabled={isDisabled || undefined}
          tabIndex={isDisabled ? -1 : anchorProps.tabIndex}
          target={target}
          rel={target === "_blank" ? (rel ?? "noopener noreferrer") : rel}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onFocus={(e) => {
            setIsFocused(true);
            onFocusProp?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlurProp?.(e);
          }}
        >
          {content}
        </a>
      );
    }

    // 버튼 모드
    const {
      onFocus: onFocusProp,
      onBlur: onBlurProp,
      ...btnProps
    } = rest as NativeButtonProps;

    return (
      <button
        {...btnProps}
        ref={ref as React.Ref<HTMLButtonElement>}
        style={computedStyle}
        type="button"
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-disabled={isDisabled || undefined}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onFocus={(e) => {
          setIsFocused(true);
          onFocusProp?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlurProp?.(e);
        }}
      >
        {content}
      </button>
    );
  },
);

ButtonInner.displayName = "Button";

export const Button = ButtonInner;
