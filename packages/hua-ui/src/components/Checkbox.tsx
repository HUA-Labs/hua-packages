"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Icon } from "./Icon";
import { createGlassStyle } from "../lib/styles/glass";

/**
 * Checkbox 컴포넌트의 props / Checkbox component props
 * @typedef {Object} CheckboxProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Checkbox 스타일 변형 / Checkbox style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Checkbox 크기 / Checkbox size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {string} [label] - 체크박스 레이블 텍스트 / Checkbox label text
 * @property {string} [description] - 체크박스 설명 텍스트 / Checkbox description text
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>}
 */
export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "className"
> {
  variant?: "default" | "outline" | "filled" | "glass";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  success?: boolean;
  label?: string;
  description?: string;
  dot?: string;
  style?: React.CSSProperties;
}

/** Sizes as CSSProperties */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { width: "1rem", height: "1rem" },
  md: { width: "1.25rem", height: "1.25rem" },
  lg: { width: "1.5rem", height: "1.5rem" },
};

const ICON_SIZES: Record<string, number> = {
  sm: 12,
  md: 14,
  lg: 16,
};

/** Base visual box styles shared by all variants */
const BASE_BOX_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.25rem",
  border: "1px solid",
  transition: "all 200ms",
  cursor: "pointer",
  position: "relative",
  flexShrink: 0,
};

/** Variant base styles (unchecked) */
const VARIANT_BASE: Record<string, React.CSSProperties> = {
  default: {
    borderColor: "var(--color-input)",
    backgroundColor: "var(--color-background)",
  },
  outline: {
    borderWidth: "2px",
    borderColor: "var(--color-input)",
    backgroundColor: "transparent",
  },
  filled: {
    borderColor: "transparent",
    backgroundColor: "var(--color-muted)",
  },
  glass: {
    ...createGlassStyle("light"),
    borderColor: "rgba(255,255,255,0.3)",
  },
};

/** Checked state overrides (all variants use primary color) */
const CHECKED_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-primary)",
  borderColor: "var(--color-primary)",
  boxShadow:
    "0 1px 3px color-mix(in srgb, var(--color-primary) 20%, transparent)",
};

/** Error border override */
const ERROR_BORDER: React.CSSProperties = {
  borderColor: "var(--color-destructive, hsl(0 84% 60%))",
};

/** Success border override */
const SUCCESS_BORDER: React.CSSProperties = { borderColor: "hsl(142 71% 45%)" };

/** Focus ring style */
const FOCUS_RING: React.CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 1px var(--color-ring), 0 0 0 3px color-mix(in srgb, var(--color-ring) 30%, transparent)",
};

/** Hover border (only when unchecked) */
const HOVER_BORDER: React.CSSProperties = {
  borderColor: "var(--color-foreground)",
};

/** Disabled overlay */
const DISABLED_STYLE: React.CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
};

/**
 * Checkbox 컴포넌트 / Checkbox component
 *
 * 체크박스 입력 필드를 제공하는 컴포넌트입니다.
 * ARIA 속성을 자동으로 설정하여 접근성을 지원합니다.
 *
 * Checkbox input field component.
 * Automatically sets ARIA attributes for accessibility support.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Checkbox label="이용약관에 동의합니다" />
 *
 * @example
 * // 에러 상태와 설명 / Error state with description
 * <Checkbox
 *   label="필수 항목"
 *   description="이 항목은 필수입니다"
 *   error
 * />
 *
 * @example
 * // 제어 컴포넌트 / Controlled component
 * const [checked, setChecked] = useState(false)
 * <Checkbox
 *   checked={checked}
 *   onChange={(e) => setChecked(e.target.checked)}
 *   label="동의"
 * />
 *
 * @param {CheckboxProps} props - Checkbox 컴포넌트의 props / Checkbox component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Checkbox 컴포넌트 / Checkbox component
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      success = false,
      label,
      description,
      id,
      dot: dotProp,
      style,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;
    const labelId = label ? `${checkboxId}-label` : undefined;
    const descriptionId = description ? `${checkboxId}-description` : undefined;

    const [isFocused, setIsFocused] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Support both controlled and uncontrolled modes
    const isControlled = props.checked !== undefined;
    const isChecked = props.checked ?? props.defaultChecked ?? false;
    // Add readOnly if controlled without onChange to suppress React warning
    const needsReadOnly = isControlled && !props.onChange && !props.readOnly;

    const isDisabled = !!props.disabled;

    /** Computed style for the visual checkbox box */
    const boxStyle = useMemo((): React.CSSProperties => {
      const base = mergeStyles(
        BASE_BOX_STYLE,
        SIZE_STYLES[size],
        VARIANT_BASE[variant],
      );

      // State overrides: error / success border (unchecked only)
      const stateBorder: React.CSSProperties | undefined = !isChecked
        ? error
          ? ERROR_BORDER
          : success
            ? SUCCESS_BORDER
            : undefined
        : undefined;

      // Hover: only when unchecked and not disabled
      const hoverStyle =
        isHovered && !isChecked && !isDisabled ? HOVER_BORDER : undefined;

      // Checked fills with primary
      const checkedStyle = isChecked ? CHECKED_STYLE : undefined;

      // Focus ring
      const focusStyle = isFocused ? FOCUS_RING : undefined;

      // Disabled
      const disabledStyle = isDisabled ? DISABLED_STYLE : undefined;

      return mergeStyles(
        base,
        stateBorder,
        hoverStyle,
        checkedStyle,
        focusStyle,
        disabledStyle,
      );
    }, [
      size,
      variant,
      isChecked,
      error,
      success,
      isFocused,
      isHovered,
      isDisabled,
    ]);

    /** Wrapper row style */
    const wrapperStyle: React.CSSProperties = mergeStyles(
      { display: "flex", alignItems: "flex-start", ...resolveDot("gap-3") },
      resolveDot(dotProp),
      style,
    );

    return (
      <div style={wrapperStyle}>
        <div style={{ position: "relative" }}>
          {/* Hidden accessible input — sits on top for click/keyboard interaction */}
          <input
            type="checkbox"
            id={checkboxId}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: isDisabled ? "not-allowed" : "pointer",
              zIndex: 10,
              margin: 0,
              padding: 0,
              inset: 0,
            }}
            ref={ref}
            aria-checked={isChecked}
            aria-invalid={error}
            aria-label={!label ? props["aria-label"] : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="checkbox"
            readOnly={needsReadOnly || props.readOnly}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
          {/* Visual checkbox box */}
          <div
            style={boxStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-hidden="true"
          >
            <span
              style={{
                display: "inline-flex",
                color: "white",
                transition: "all 200ms",
                opacity: isChecked ? 1 : 0,
                transform: isChecked ? "scale(1)" : "scale(0)",
              }}
            >
              <Icon name="check" size={ICON_SIZES[size]} />
            </span>
          </div>
        </div>
        {(label || description) && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {label && (
              <label
                htmlFor={checkboxId}
                id={labelId}
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "var(--color-foreground)",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                }}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                id={descriptionId}
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-muted-foreground)",
                  margin: 0,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
