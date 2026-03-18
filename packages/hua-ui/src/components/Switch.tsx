"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { createGlassStyle } from "../lib/styles/glass";
import { FOCUS_RING_CONTROL } from "../lib/styles/focus";
import { TRANSITIONS } from "../lib/styles/transition";

// ---------------------------------------------------------------------------
// Static style constants
// ---------------------------------------------------------------------------

const WRAPPER_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  ...resolveDot("gap-3"),
};

const TRACK_BASE: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  cursor: "pointer",
  alignItems: "center",
  borderRadius: "9999px",
  flexShrink: 0,
  transition: TRANSITIONS.bgBorder,
};

const THUMB_BASE: React.CSSProperties = {
  pointerEvents: "none",
  position: "absolute",
  borderRadius: "9999px",
  backgroundColor: "white",
  boxShadow:
    "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
  top: "50%",
  transform: "translateY(-50%)",
  transition: TRANSITIONS.transform,
};

// Screen-reader-only hidden input
const SR_ONLY_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
  padding: 0,
  margin: -1,
};

// Size definitions
type SizeKey = "sm" | "md" | "lg";

const TRACK_SIZES: Record<SizeKey, React.CSSProperties> = {
  sm: { width: "2.25rem", height: "1.25rem" },
  md: { width: "2.75rem", height: "1.5rem" },
  lg: { width: "3.5rem", height: "2rem" },
};

const THUMB_SIZES: Record<SizeKey, React.CSSProperties> = {
  sm: { width: "1rem", height: "1rem" },
  md: { width: "1.25rem", height: "1.25rem" },
  lg: { width: "1.75rem", height: "1.75rem" },
};

// Thumb left offset (unchecked position): 2px gap from track edge
const THUMB_OFFSET_UNCHECKED: Record<SizeKey, React.CSSProperties> = {
  sm: { left: "0.125rem" },
  md: { left: "0.125rem" },
  lg: { left: "0.125rem" },
};

// Thumb translateX when checked: track width - thumb width - 2×offset
// sm: 2.25rem - 1rem - 0.25rem = 1rem → 16px
// md: 2.75rem - 1.25rem - 0.25rem = 1.25rem → 20px
// lg: 3.5rem - 1.75rem - 0.25rem = 1.5rem → 24px
const THUMB_TRANSLATE_CHECKED: Record<SizeKey, string> = {
  sm: "translateY(-50%) translateX(1rem)",
  md: "translateY(-50%) translateX(1.25rem)",
  lg: "translateY(-50%) translateX(1.5rem)",
};

const THUMB_TRANSLATE_UNCHECKED: Record<SizeKey, string> = {
  sm: "translateY(-50%) translateX(0)",
  md: "translateY(-50%) translateX(0)",
  lg: "translateY(-50%) translateX(0)",
};

// Variant colors (track background, unchecked / checked)
type VariantKey = "default" | "outline" | "filled" | "glass";

const VARIANT_UNCHECKED: Record<VariantKey, React.CSSProperties> = {
  default: { backgroundColor: "var(--color-muted)" },
  outline: {
    backgroundColor: "transparent",
    border: "2px solid var(--color-input)",
  },
  filled: { backgroundColor: "var(--color-secondary)" },
  glass: {
    ...createGlassStyle("light"),
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    border: "1px solid rgba(255, 255, 255, 0.30)",
  },
};

const VARIANT_CHECKED: Record<VariantKey, React.CSSProperties> = {
  default: { backgroundColor: "var(--color-primary)" },
  outline: {
    backgroundColor: "var(--color-primary)",
    border: "2px solid var(--color-primary)",
  },
  filled: { backgroundColor: "var(--color-primary)" },
  glass: {
    ...createGlassStyle("light"),
    backgroundColor: "rgba(var(--color-primary-rgb, 99, 102, 241), 0.50)",
    border: "1px solid rgba(var(--color-primary-rgb, 99, 102, 241), 0.30)",
  },
};

// State overrides (error / success)
const STATE_UNCHECKED_ERROR: React.CSSProperties = {
  backgroundColor:
    "color-mix(in srgb, var(--color-destructive) 20%, transparent)",
};
const STATE_CHECKED_ERROR: React.CSSProperties = {
  backgroundColor: "var(--color-destructive)",
};
const STATE_UNCHECKED_SUCCESS: React.CSSProperties = {
  backgroundColor: "color-mix(in srgb, #16a34a 20%, transparent)",
};
const STATE_CHECKED_SUCCESS: React.CSSProperties = {
  backgroundColor: "#16a34a",
};

// Focus ring — imported from shared focus.ts

// Disabled styles
const DISABLED_TRACK: React.CSSProperties = {
  cursor: "not-allowed",
  opacity: 0.5,
};

// Label + description
const LABEL_META_WRAPPER: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-foreground)",
  cursor: "pointer",
};

const DESCRIPTION_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground)",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Switch 컴포넌트의 props / Switch component props
 * @typedef {Object} SwitchProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Switch 스타일 변형 / Switch style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Switch 크기 / Switch size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {string} [label] - 스위치 레이블 텍스트 / Switch label text
 * @property {string} [description] - 스위치 설명 텍스트 / Switch description text
 * @property {string} [dot] - dot 유틸리티 문자열 / dot utility string
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>}
 */
export interface SwitchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "className"
> {
  variant?: VariantKey;
  size?: SizeKey;
  error?: boolean;
  success?: boolean;
  label?: string;
  description?: string;
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Switch 컴포넌트 / Switch component
 *
 * 토글 스위치 입력 필드를 제공하는 컴포넌트입니다.
 * ARIA 속성을 자동으로 설정하여 접근성을 지원합니다.
 *
 * Toggle switch input field component.
 * Automatically sets ARIA attributes for accessibility support.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Switch label="알림 받기" />
 *
 * @example
 * // 제어 컴포넌트 / Controlled component
 * const [enabled, setEnabled] = useState(false)
 * <Switch
 *   checked={enabled}
 *   onChange={(e) => setEnabled(e.target.checked)}
 *   label="다크 모드"
 * />
 *
 * @example
 * // 에러 상태 / Error state
 * <Switch
 *   label="필수 설정"
 *   description="이 설정을 활성화해야 합니다"
 *   error
 * />
 *
 * @param {SwitchProps} props - Switch 컴포넌트의 props / Switch component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Switch 컴포넌트 / Switch component
 */
const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      success = false,
      label,
      description,
      id,
      checked: controlledChecked,
      defaultChecked = false,
      disabled,
      onChange,
      onFocus,
      onBlur,
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;
    const labelId = label ? `${switchId}-label` : undefined;
    const descriptionId = description ? `${switchId}-description` : undefined;

    // Controlled vs uncontrolled
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const checked = isControlled ? controlledChecked : internalChecked;

    // Focus state for ring
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Computed track style
    const trackStyle = useMemo((): React.CSSProperties => {
      const variantColor = checked
        ? VARIANT_CHECKED[variant]
        : VARIANT_UNCHECKED[variant];

      const stateColor = error
        ? checked
          ? STATE_CHECKED_ERROR
          : STATE_UNCHECKED_ERROR
        : success
          ? checked
            ? STATE_CHECKED_SUCCESS
            : STATE_UNCHECKED_SUCCESS
          : undefined;

      return mergeStyles(
        TRACK_BASE,
        TRACK_SIZES[size],
        variantColor,
        stateColor,
        isFocused ? FOCUS_RING_CONTROL : undefined,
        disabled ? DISABLED_TRACK : undefined,
        resolveDot(dotProp),
        style,
      );
    }, [
      variant,
      size,
      checked,
      error,
      success,
      isFocused,
      disabled,
      dotProp,
      style,
    ]);

    // Computed thumb style
    const thumbStyle = useMemo((): React.CSSProperties => {
      return mergeStyles(
        THUMB_BASE,
        THUMB_SIZES[size],
        THUMB_OFFSET_UNCHECKED[size],
        {
          transform: checked
            ? THUMB_TRANSLATE_CHECKED[size]
            : THUMB_TRANSLATE_UNCHECKED[size],
        },
      );
    }, [size, checked]);

    return (
      <div style={WRAPPER_STYLE}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {/* Hidden real checkbox — stays accessible for keyboard/form */}
          <input
            type="checkbox"
            id={switchId}
            style={SR_ONLY_STYLE}
            ref={ref}
            checked={checked}
            disabled={disabled}
            aria-checked={checked}
            aria-invalid={error}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="switch"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
            aria-label={!label ? props["aria-label"] : undefined}
          />
          {/* Visual track — clicking this toggles the hidden input via label linkage */}
          <label
            htmlFor={switchId}
            style={{
              display: "block",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          >
            <div style={trackStyle}>
              <div style={thumbStyle} />
            </div>
          </label>
        </div>
        {(label || description) && (
          <div style={LABEL_META_WRAPPER}>
            {label && (
              <label htmlFor={switchId} id={labelId} style={LABEL_STYLE}>
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} style={DESCRIPTION_STYLE}>
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
