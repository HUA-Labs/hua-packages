"use client";

import React, { useState, useMemo, useCallback, useId } from "react";
import { dotVariants, dot as dotFn } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import type { CSSProperties } from "react";
import { createGlassStyle } from "../lib/styles/glass";
import {
  FORM_FOCUS_BASE,
  FORM_FOCUS_ERROR,
  FORM_FOCUS_SUCCESS,
  FORM_BORDER_ERROR,
  FORM_BORDER_SUCCESS,
  FORM_DISABLED,
} from "../lib/styles/focus";
import { FORM_HOVER } from "../lib/styles/hover";
import { TRANSITIONS } from "../lib/styles/transition";

const s = (input: string) => dotFn(input) as CSSProperties;

export const selectVariantStyles = dotVariants({
  base: "flex w-full rounded-md border",
  variants: {
    variant: {
      default:
        "border-[var(--color-input)] bg-[var(--color-background)] text-[var(--color-foreground)]",
      outline:
        "border-2 border-[var(--color-input)] bg-transparent text-[var(--color-foreground)]",
      filled:
        "border-transparent bg-[var(--color-secondary)]/50 text-[var(--color-foreground)]",
      ghost: "border-transparent bg-transparent text-[var(--color-foreground)]",
      glass: "",
    },
    size: {
      sm: "h-8 pl-2 text-sm",
      md: "h-10 pl-3 text-sm",
      lg: "h-12 pl-4 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

/** Extra base styles per variant (can't be expressed as dot utilities) */
const VARIANT_EXTRAS: Record<string, CSSProperties> = {
  glass: {
    ...createGlassStyle("light"),
    borderColor: "rgba(255, 255, 255, 0.3)",
    color: "white",
  },
};

/** Focus styles per variant (ghost/filled/glass have unique overrides) */
const VARIANT_FOCUS: Record<string, CSSProperties> = {
  default: FORM_FOCUS_BASE,
  outline: FORM_FOCUS_BASE,
  filled: {
    ...FORM_FOCUS_BASE,
    backgroundColor: "var(--color-background)",
  },
  ghost: {
    outline: "none",
    boxShadow:
      "0 0 0 1px color-mix(in srgb, var(--color-muted-foreground) 40%, transparent)",
    backgroundColor: "var(--color-muted)",
    borderColor: "var(--color-border)",
  },
  glass: {
    outline: "none",
    boxShadow:
      "0 0 0 1px color-mix(in srgb, var(--color-ring) 20%, transparent)",
    borderColor: "color-mix(in srgb, var(--color-ring) 50%, transparent)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
};

/**
 * Select 컴포넌트의 props / Select component props
 */
export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  "className" | "size"
> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  dot?: string;
  style?: CSSProperties;
}

/**
 * SelectOption 컴포넌트의 props / SelectOption component props
 * @typedef {Object} SelectOptionProps
 * @property {string} value - 옵션 값 / Option value
 * @property {React.ReactNode} children - 옵션 표시 텍스트 / Option display text
 * @extends {React.OptionHTMLAttributes<HTMLOptionElement>}
 */
export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string;
  children: React.ReactNode;
}

/**
 * Select 컴포넌트 / Select component
 *
 * 드롭다운 선택 메뉴를 제공하는 컴포넌트입니다.
 * 다양한 스타일 변형과 크기를 지원하며, 접근성 속성을 포함합니다.
 *
 * Dropdown selection menu component.
 * Supports various style variants and sizes, includes accessibility attributes.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Select>
 *   <option value="option1">옵션 1</option>
 *   <option value="option2">옵션 2</option>
 * </Select>
 *
 * @example
 * // 에러 상태와 아이콘 / Error state with icon
 * <Select
 *   error
 *   leftIcon={<Icon name="alert" />}
 *   aria-label="국가 선택"
 * >
 *   <option value="">국가를 선택하세요</option>
 *   <option value="kr">한국</option>
 *   <option value="us">미국</option>
 * </Select>
 *
 * @example
 * // 다양한 변형 / Various variants
 * <Select variant="outline" size="lg">
 *   <option value="1">항목 1</option>
 * </Select>
 *
 * @param {SelectProps} props - Select 컴포넌트의 props / Select component props
 * @param {React.Ref<HTMLSelectElement>} ref - select 요소 ref / select element ref
 * @returns {JSX.Element} Select 컴포넌트 / Select component
 */
const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      dot: dotProp,
      style: styleProp,
      variant = "default",
      size = "md",
      error = false,
      success = false,
      leftIcon,
      placeholder,
      children,
      "aria-label": ariaLabel,
      "aria-invalid": ariaInvalid,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp || autoId;

    const selectRef = React.useRef<HTMLSelectElement>(null);
    const combinedRef = useCallback(
      (node: HTMLSelectElement | null) => {
        selectRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLSelectElement | null>).current =
            node;
        }
      },
      [ref],
    );

    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isDisabled = props.disabled ?? false;
    const isInvalid =
      error || (ariaInvalid !== undefined ? Boolean(ariaInvalid) : false);

    const chevronRight = size === "sm" ? 8 : size === "lg" ? 14 : 12;
    const paddingRight = size === "sm" ? 32 : size === "lg" ? 44 : 40;

    const computedStyle = useMemo(() => {
      const base = mergeStyles(
        { transition: TRANSITIONS.normal, appearance: "none" as const },
        selectVariantStyles({ variant, size }) as CSSProperties,
        VARIANT_EXTRAS[variant],
        leftIcon ? { paddingLeft: "40px" } : undefined,
        { paddingRight: `${paddingRight}px` },
      );

      if (isDisabled) {
        return mergeStyles(base, FORM_DISABLED, resolveDot(dotProp), styleProp);
      }

      let stateStyles: CSSProperties = {};

      if (isHovered && !isFocused) {
        stateStyles = FORM_HOVER;
      }

      if (isFocused) {
        if (isInvalid) {
          stateStyles = FORM_FOCUS_ERROR;
        } else if (success) {
          stateStyles = FORM_FOCUS_SUCCESS;
        } else {
          stateStyles = VARIANT_FOCUS[variant] ?? VARIANT_FOCUS.default;
        }
      }

      // Error/success border (non-focus)
      if (!isFocused) {
        if (isInvalid) {
          stateStyles = mergeStyles(stateStyles, FORM_BORDER_ERROR);
        } else if (success) {
          stateStyles = mergeStyles(stateStyles, FORM_BORDER_SUCCESS);
        }
      }

      return mergeStyles(base, stateStyles, resolveDot(dotProp), styleProp);
    }, [
      variant,
      size,
      isHovered,
      isFocused,
      isDisabled,
      isInvalid,
      success,
      leftIcon,
      paddingRight,
      dotProp,
      styleProp,
    ]);

    const chevronStyle = useMemo(
      (): CSSProperties => ({
        position: "absolute",
        right: `${chevronRight}px`,
        top: "50%",
        transform: isFocused
          ? "translateY(-50%) rotate(180deg)"
          : "translateY(-50%)",
        pointerEvents: "none",
        transition: TRANSITIONS.transform,
      }),
      [isFocused, chevronRight],
    );

    return (
      <div style={{ position: "relative" }}>
        {leftIcon && (
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-muted-foreground)",
              pointerEvents: "none",
              zIndex: 10,
            }}
          >
            {leftIcon}
          </div>
        )}
        <select
          ref={combinedRef}
          id={id}
          style={computedStyle}
          aria-label={ariaLabel || (placeholder ? undefined : "선택")}
          aria-invalid={
            ariaInvalid !== undefined ? ariaInvalid : error || undefined
          }
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div style={chevronStyle}>
          <svg
            style={{
              width: "16px",
              height: "16px",
              color: "var(--color-muted-foreground)",
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    );
  },
);
Select.displayName = "Select";

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ ...props }, ref) => <option ref={ref} {...props} />,
);
SelectOption.displayName = "SelectOption";

export { Select, SelectOption };
