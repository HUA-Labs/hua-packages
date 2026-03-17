"use client";

import React, { useState, useMemo } from "react";
import { dotVariants } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Variant styles via dotVariants
// ---------------------------------------------------------------------------

export const toggleVariantStyles = dotVariants({
  base: "inline-flex items-center justify-center rounded-md font-medium",
  variants: {
    size: {
      sm: "h-7 px-3 text-sm",
      md: "h-9 px-4 text-base",
      lg: "h-11 px-5 text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

// ---------------------------------------------------------------------------
// Static style constants
// ---------------------------------------------------------------------------

const BASE_EXTRAS: React.CSSProperties = {
  ...resolveDot("gap-2"),
  transition: "all 200ms ease-in-out",
  userSelect: "none",
  cursor: "pointer",
  outline: "none",
  border: "none",
  background: "none",
};

/** Pressed + not-pressed background/foreground per variant */
const VARIANT_PRESSED: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
  },
  outline: {
    border: "2px solid var(--color-primary)",
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
    color: "var(--color-primary)",
  },
  filled: {
    backgroundColor: "var(--color-primary)",
    color: "var(--color-primary-foreground)",
  },
  ghost: {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 10%, transparent)",
    color: "var(--color-primary)",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.30)",
    color: "white",
  },
};

const VARIANT_IDLE: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--color-muted)",
    color: "var(--color-foreground)",
  },
  outline: {
    border: "2px solid var(--color-border)",
    backgroundColor: "transparent",
    color: "var(--color-foreground)",
  },
  filled: {
    backgroundColor: "color-mix(in srgb, var(--color-muted) 50%, transparent)",
    color: "var(--color-foreground)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-foreground)",
  },
  glass: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    border: "1px solid rgba(255, 255, 255, 0.20)",
    color: "white",
  },
};

/** Hover overlay — applied on top of the current variant base */
const VARIANT_HOVER_PRESSED: Record<string, React.CSSProperties> = {
  default: { opacity: 0.8 },
  outline: {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 15%, transparent)",
  },
  filled: { opacity: 0.8 },
  ghost: {
    backgroundColor:
      "color-mix(in srgb, var(--color-primary) 15%, transparent)",
  },
  glass: { backgroundColor: "rgba(255, 255, 255, 0.30)" },
};

const VARIANT_HOVER_IDLE: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "color-mix(in srgb, var(--color-muted) 80%, transparent)",
  },
  outline: { backgroundColor: "var(--color-muted)" },
  filled: { backgroundColor: "var(--color-muted)" },
  ghost: { backgroundColor: "var(--color-muted)" },
  glass: { backgroundColor: "rgba(255, 255, 255, 0.20)" },
};

const FOCUS_RING: React.CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 2px var(--color-background), 0 0 0 3px var(--color-ring)",
};

const DISABLED_STYLES: React.CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
  pointerEvents: "none",
};

const FLEX_SHRINK_ZERO: React.CSSProperties = { flexShrink: 0 };

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Toggle 컴포넌트의 props / Toggle component props
 * @typedef {Object} ToggleProps
 * @property {"default" | "outline" | "filled" | "ghost" | "glass"} [variant="default"] - Toggle 스타일 변형 / Toggle style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Toggle 크기 / Toggle size
 * @property {boolean} [pressed] - 제어 모드에서 눌림 상태 / Pressed state in controlled mode
 * @property {(pressed: boolean) => void} [onPressedChange] - 상태 변경 콜백 / State change callback
 * @property {string} [label] - Toggle 라벨 텍스트 / Toggle label text
 * @property {string} [description] - Toggle 설명 텍스트 / Toggle description text
 * @property {React.ReactNode} [icon] - 아이콘 / Icon
 * @property {"left" | "right"} [iconPosition="left"] - 아이콘 위치 / Icon position
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'size'>}
 */
export interface ToggleProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className" | "size"
> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  dot?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Toggle 컴포넌트 / Toggle component
 *
 * 눌림 상태를 가지는 토글 버튼 컴포넌트입니다.
 * Switch와 달리 버튼 형태로 표시되며, 여러 개를 그룹으로 사용할 수 있습니다.
 *
 * Toggle button component with pressed state.
 * Unlike Switch, displayed as a button and can be used in groups.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Toggle label="알림" />
 *
 * @example
 * // 제어 모드 / Controlled mode
 * const [pressed, setPressed] = useState(false)
 * <Toggle
 *   pressed={pressed}
 *   onPressedChange={setPressed}
 *   label="다크 모드"
 *   icon={<Icon name="moon" />}
 * />
 *
 * @example
 * // 아이콘만 / Icon only
 * <Toggle
 *   icon={<Icon name="heart" />}
 *   variant="ghost"
 * />
 *
 * @param {ToggleProps} props - Toggle 컴포넌트의 props / Toggle component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} Toggle 컴포넌트 / Toggle component
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    {
      variant = "default",
      size = "md",
      pressed: controlledPressed,
      onPressedChange,
      label,
      description,
      icon,
      iconPosition = "left",
      onClick,
      disabled,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const [internalPressed, setInternalPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isControlled = controlledPressed !== undefined;
    const pressed = isControlled ? controlledPressed : internalPressed;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isControlled) {
        setInternalPressed(!pressed);
      }
      onPressedChange?.(!pressed);
      onClick?.(e);
    };

    const computedStyle = useMemo((): React.CSSProperties => {
      if (disabled) {
        return mergeStyles(
          toggleVariantStyles({ size }) as React.CSSProperties,
          BASE_EXTRAS,
          pressed ? VARIANT_PRESSED[variant] : VARIANT_IDLE[variant],
          DISABLED_STYLES,
          resolveDot(dotProp),
          style,
        );
      }

      return mergeStyles(
        toggleVariantStyles({ size }) as React.CSSProperties,
        BASE_EXTRAS,
        pressed ? VARIANT_PRESSED[variant] : VARIANT_IDLE[variant],
        isHovered
          ? pressed
            ? VARIANT_HOVER_PRESSED[variant]
            : VARIANT_HOVER_IDLE[variant]
          : undefined,
        isFocused ? FOCUS_RING : undefined,
        resolveDot(dotProp),
        style,
      );
    }, [
      variant,
      size,
      pressed,
      isHovered,
      isFocused,
      disabled,
      dotProp,
      style,
    ]);

    const wrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      ...resolveDot("gap-3"),
    };

    const descriptionStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
    };

    const descriptionTextStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      color: "var(--color-muted-foreground)",
    };

    return (
      <div style={wrapperStyle}>
        <button
          type="button"
          ref={ref}
          style={computedStyle}
          onClick={handleClick}
          aria-pressed={pressed}
          disabled={disabled}
          onMouseEnter={() => {
            if (!disabled) setIsHovered(true);
          }}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          {icon && iconPosition === "left" && (
            <span style={FLEX_SHRINK_ZERO}>{icon}</span>
          )}
          {label && <span>{label}</span>}
          {icon && iconPosition === "right" && (
            <span style={FLEX_SHRINK_ZERO}>{icon}</span>
          )}
        </button>
        {description && (
          <div style={descriptionStyle}>
            <p style={descriptionTextStyle}>{description}</p>
          </div>
        )}
      </div>
    );
  },
);
Toggle.displayName = "Toggle";

export { Toggle };
