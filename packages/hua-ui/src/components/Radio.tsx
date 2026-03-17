"use client";

import React, { useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// --- Static style constants ---

const SR_ONLY_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

const WRAPPER_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  ...resolveDot("gap-3"),
};

const LABEL_COL_STYLE: React.CSSProperties = {
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

// --- Size maps ---

type Size = "sm" | "md" | "lg";

const CIRCLE_SIZE: Record<Size, React.CSSProperties> = {
  sm: { width: "1rem", height: "1rem" },
  md: { width: "1.25rem", height: "1.25rem" },
  lg: { width: "1.5rem", height: "1.5rem" },
};

const DOT_SIZE: Record<Size, React.CSSProperties> = {
  sm: { width: "0.375rem", height: "0.375rem" },
  md: { width: "0.5rem", height: "0.5rem" },
  lg: { width: "0.625rem", height: "0.625rem" },
};

// --- Variant base styles ---

type Variant = "default" | "outline" | "filled" | "glass";

const VARIANT_BASE: Record<Variant, React.CSSProperties> = {
  default: {
    borderColor: "var(--color-input)",
    backgroundColor: "var(--color-background)",
    color: "var(--color-primary)",
  },
  outline: {
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "var(--color-input)",
    backgroundColor: "transparent",
    color: "var(--color-primary)",
  },
  filled: {
    borderColor: "transparent",
    backgroundColor: "var(--color-muted)",
    color: "var(--color-primary)",
  },
  glass: {
    borderColor: "rgba(255,255,255,0.3)",
    backgroundColor: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    color: "#fff",
  },
};

// --- Focus ring colors per variant/state ---

const FOCUS_SHADOW: Record<string, string> = {
  default: "0 0 0 1px var(--color-ring)",
  outline: "0 0 0 1px var(--color-ring)",
  filled: "0 0 0 1px var(--color-ring)",
  glass: "0 0 0 1px rgba(var(--color-ring), 0.5)",
  error: "0 0 0 1px var(--color-destructive)",
  success: "0 0 0 1px #22c55e",
};

/**
 * Radio component props
 *
 * @typedef {Object} RadioProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Radio style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Radio size
 * @property {boolean} [error=false] - Error state
 * @property {boolean} [success=false] - Success state
 * @property {string} [label] - Radio button label text
 * @property {string} [description] - Radio button description text
 * @property {string} [dot] - Dot utility string for additional styles on the wrapper
 * @property {React.CSSProperties} [style] - Inline styles for the wrapper
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'className'>}
 */
export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size" | "className"
> {
  variant?: Variant;
  size?: Size;
  error?: boolean;
  success?: boolean;
  label?: string;
  description?: string;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Radio component
 *
 * A radio button input field. Multiple Radio components with the same name attribute
 * work as a group. Automatically sets ARIA attributes for accessibility.
 *
 * @component
 * @example
 * // Basic usage (group)
 * <Radio name="option" value="1" label="Option 1" />
 * <Radio name="option" value="2" label="Option 2" />
 *
 * @example
 * // Error state
 * <Radio name="gender" value="male" label="Male" error />
 *
 * @param {RadioProps} props - Radio component props
 * @param {React.Ref<HTMLInputElement>} ref - input element ref
 * @returns {JSX.Element} Radio component
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
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
      disabled,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const radioId = id || generatedId;
    const labelId = label ? `${radioId}-label` : undefined;
    const descriptionId = description ? `${radioId}-description` : undefined;

    const [isFocused, setIsFocused] = useState(false);

    // Support both controlled and uncontrolled modes
    const isControlled = props.checked !== undefined;
    const isChecked = props.checked ?? props.defaultChecked ?? false;
    const needsReadOnly = isControlled && !props.onChange && !props.readOnly;

    // Resolve which focus shadow to use
    const focusShadowKey = error ? "error" : success ? "success" : variant;
    const focusShadow = FOCUS_SHADOW[focusShadowKey] ?? FOCUS_SHADOW["default"];

    // State border color overrides
    const stateBorderColor: React.CSSProperties | undefined = error
      ? { borderColor: "var(--color-destructive)" }
      : success
        ? { borderColor: "#22c55e" }
        : isChecked
          ? { borderColor: "var(--color-primary)" }
          : undefined;

    // Computed circle (outer) style
    const circleStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1px solid",
            transition: "all 200ms ease-in-out",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            outline: "none",
          },
          CIRCLE_SIZE[size],
          VARIANT_BASE[variant],
          stateBorderColor,
          isFocused ? { boxShadow: focusShadow } : undefined,
        ),
      [
        size,
        variant,
        error,
        success,
        isChecked,
        isFocused,
        disabled,
        focusShadow,
      ],
    );

    // Computed inner dot style
    const innerDotStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          {
            borderRadius: "50%",
            backgroundColor: "var(--color-primary)",
            transition: "all 200ms ease-in-out",
            opacity: isChecked ? 1 : 0,
            transform: isChecked ? "scale(1)" : "scale(0)",
          },
          DOT_SIZE[size],
        ),
      [size, isChecked],
    );

    // Computed wrapper style (supports dot prop + style override)
    const wrapperStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(WRAPPER_STYLE, resolveDot(dotProp), style),
      [dotProp, style],
    );

    return (
      <div style={wrapperStyle}>
        <div style={{ position: "relative" }}>
          <input
            type="radio"
            id={radioId}
            style={SR_ONLY_STYLE}
            ref={ref}
            aria-checked={isChecked}
            aria-invalid={error}
            aria-label={!label ? props["aria-label"] : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="radio"
            disabled={disabled}
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
          <div style={circleStyle}>
            <div style={innerDotStyle} />
          </div>
        </div>
        {(label || description) && (
          <div style={LABEL_COL_STYLE}>
            {label && (
              <label
                htmlFor={radioId}
                id={labelId}
                style={
                  disabled
                    ? { ...LABEL_STYLE, cursor: "not-allowed", opacity: 0.5 }
                    : LABEL_STYLE
                }
              >
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
Radio.displayName = "Radio";

export { Radio };
