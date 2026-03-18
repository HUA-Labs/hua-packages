"use client";

import React, { useMemo, useState, useId } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

// ---------------------------------------------------------------------------
// Size tokens
// ---------------------------------------------------------------------------
const SIZE_STYLES = {
  sm: {
    input: {
      height: "2rem", // h-8 = 32px
      padding: "0.25rem 0.5rem", // py-1 px-2
      fontSize: "0.875rem", // text-sm
    } satisfies React.CSSProperties,
    button: {
      width: "2rem", // w-8
      height: "2rem", // h-8
      fontSize: "0.875rem", // text-sm
    } satisfies React.CSSProperties,
    wrapper: {
      gap: "0.25rem", // gap-1
    } satisfies React.CSSProperties,
  },
  md: {
    input: {
      height: "2.5rem", // h-10 = 40px
      padding: "0.5rem 0.75rem", // py-2 px-3
      fontSize: "0.875rem", // text-sm
    } satisfies React.CSSProperties,
    button: {
      width: "2.5rem", // w-10
      height: "2.5rem", // h-10
      fontSize: "0.875rem", // text-sm
    } satisfies React.CSSProperties,
    wrapper: {
      gap: "0.5rem", // gap-2
    } satisfies React.CSSProperties,
  },
  lg: {
    input: {
      height: "3rem", // h-12 = 48px
      padding: "0.625rem 1rem", // py-2.5 px-4
      fontSize: "1rem", // text-base
    } satisfies React.CSSProperties,
    button: {
      width: "3rem", // w-12
      height: "3rem", // h-12
      fontSize: "1rem", // text-base
    } satisfies React.CSSProperties,
    wrapper: {
      gap: "0.5rem", // gap-2
    } satisfies React.CSSProperties,
  },
} as const;

// ---------------------------------------------------------------------------
// Base style objects
// ---------------------------------------------------------------------------
const WRAPPER_BASE: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
};

const BUTTON_BASE: React.CSSProperties = mergeStyles(resolveDot("rounded-md"), {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--color-input)",
  backgroundColor: "var(--color-background)",
  cursor: "pointer",
  transition: "all 150ms ease",
  flexShrink: 0,
});

const BUTTON_HOVER: React.CSSProperties = {
  backgroundColor: "var(--color-secondary)",
  borderColor: "color-mix(in srgb, var(--color-primary) 50%, transparent)",
};

const BUTTON_ACTIVE: React.CSSProperties = {
  transform: "scale(0.95)",
};

const BUTTON_DISABLED: React.CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
  backgroundColor: "var(--color-background)",
};

const BUTTON_FOCUS: React.CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 1px var(--color-ring), 0 0 0 3px color-mix(in srgb, var(--color-ring) 30%, transparent)",
};

const INPUT_BASE: React.CSSProperties = mergeStyles(resolveDot("rounded-md"), {
  width: "4rem",
  textAlign: "center",
  border: "1px solid var(--color-input)",
  backgroundColor: "var(--color-background)",
  color: "var(--color-foreground)",
  transition: "all 150ms ease",
  // Hide browser spinners
  appearance: "textfield",
  MozAppearance: "textfield",
  WebkitAppearance: "textfield",
});

const INPUT_FOCUS: React.CSSProperties = {
  outline: "none",
  boxShadow:
    "0 0 0 1px var(--color-ring), 0 0 0 3px color-mix(in srgb, var(--color-ring) 30%, transparent)",
};

const INPUT_DISABLED: React.CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
/**
 * NumberInput 컴포넌트의 props / NumberInput component props
 * @typedef {Object} NumberInputProps
 * @property {number} [value] - 현재 값 / Current value
 * @property {number} [defaultValue=0] - 기본 값 / Default value
 * @property {number} [min] - 최소 값 / Minimum value
 * @property {number} [max] - 최대 값 / Maximum value
 * @property {number} [step=1] - 증감 단위 / Step amount
 * @property {(value: number) => void} [onChange] - 값 변경 콜백 / Value change callback
 * @property {boolean} [disabled=false] - 비활성화 / Disabled state
 * @property {"sm" | "md" | "lg"} [size="md"] - 크기 / Size
 * @property {boolean} [showButtons=true] - +/- 버튼 표시 / Show +/- buttons
 * @property {"horizontal" | "vertical"} [buttonLayout="horizontal"] - 버튼 배치 / Button layout
 * @property {string} [dot] - dot utility string for additional styles / dot 유틸리티 문자열
 * @property {React.CSSProperties} [style] - 추가 인라인 스타일 / Additional inline style
 */
export interface NumberInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue" | "size" | "type" | "className"
> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  showButtons?: boolean;
  buttonLayout?: "horizontal" | "vertical";
  dot?: string;
  style?: React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Sub-components: interactive button with hover/active/focus state
// ---------------------------------------------------------------------------
function StepButton({
  onClick,
  disabled,
  ariaLabel,
  sizeStyle,
  extraStyle,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  sizeStyle: React.CSSProperties;
  extraStyle?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const style = useMemo(
    (): React.CSSProperties =>
      mergeStyles(
        BUTTON_BASE,
        sizeStyle,
        extraStyle,
        disabled
          ? BUTTON_DISABLED
          : mergeStyles(
              isHovered ? BUTTON_HOVER : undefined,
              isActive ? BUTTON_ACTIVE : undefined,
            ),
        isFocused ? BUTTON_FOCUS : undefined,
      ),
    [sizeStyle, extraStyle, disabled, isHovered, isActive, isFocused],
  );

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={style}
      aria-label={ariaLabel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
/**
 * NumberInput 컴포넌트 / NumberInput component
 *
 * 숫자 입력을 위한 컴포넌트로, 커스텀 +/- 버튼을 제공합니다.
 * 브라우저 기본 스피너 대신 스타일링된 버튼을 사용합니다.
 *
 * Number input component with custom +/- buttons.
 * Uses styled buttons instead of browser default spinners.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <NumberInput value={count} onChange={setCount} />
 *
 * @example
 * // 범위 지정 / With range
 * <NumberInput min={0} max={100} step={5} />
 *
 * @example
 * // 세로 버튼 / Vertical buttons
 * <NumberInput buttonLayout="vertical" />
 */
const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value: controlledValue,
      defaultValue = 0,
      min,
      max,
      step = 1,
      onChange,
      disabled = false,
      size = "md",
      showButtons = true,
      buttonLayout = "horizontal",
      dot: dotProp,
      style,
      id: idProp,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const id = idProp || autoId;

    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const [isInputFocused, setIsInputFocused] = useState(false);

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const sizes = SIZE_STYLES[size];

    const updateValue = React.useCallback(
      (newValue: number) => {
        let clampedValue = newValue;
        if (min !== undefined) clampedValue = Math.max(min, clampedValue);
        if (max !== undefined) clampedValue = Math.min(max, clampedValue);

        if (!isControlled) {
          setInternalValue(clampedValue);
        }
        onChange?.(clampedValue);
      },
      [isControlled, min, max, onChange],
    );

    const increment = () => {
      if (disabled) return;
      updateValue(currentValue + step);
    };

    const decrement = () => {
      if (disabled) return;
      updateValue(currentValue - step);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (inputValue === "" || inputValue === "-") return;
      const newValue = parseFloat(inputValue);
      if (!isNaN(newValue)) {
        if (min !== undefined && newValue < min) {
          updateValue(min);
        } else {
          updateValue(newValue);
        }
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsInputFocused(false);
      if (min !== undefined && currentValue < min) updateValue(min);
      if (max !== undefined && currentValue > max) updateValue(max);
      props.onBlur?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        increment();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        decrement();
      }
    };

    const canDecrement = min === undefined || currentValue > min;
    const canIncrement = max === undefined || currentValue < max;

    // Wrapper style
    const wrapperStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(WRAPPER_BASE, sizes.wrapper, resolveDot(dotProp), style),
      [sizes.wrapper, dotProp, style],
    );

    // Input style
    const inputStyle = useMemo(
      (): React.CSSProperties =>
        mergeStyles(
          INPUT_BASE,
          sizes.input,
          disabled ? INPUT_DISABLED : undefined,
          isInputFocused ? INPUT_FOCUS : undefined,
        ),
      [sizes.input, disabled, isInputFocused],
    );

    if (buttonLayout === "vertical") {
      const halfButtonStyle: React.CSSProperties = {
        ...sizes.button,
        height: "calc(50% - 1px)",
      };
      const topButtonExtra: React.CSSProperties = {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      };
      const bottomButtonExtra: React.CSSProperties = {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      };

      return (
        <div style={wrapperStyle}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.125rem",
            }}
          >
            <StepButton
              onClick={increment}
              disabled={disabled || !canIncrement}
              ariaLabel="Increase"
              sizeStyle={halfButtonStyle}
              extraStyle={topButtonExtra}
            >
              <ChevronUp style={{ width: "0.75rem", height: "0.75rem" }} />
            </StepButton>
            <StepButton
              onClick={decrement}
              disabled={disabled || !canDecrement}
              ariaLabel="Decrease"
              sizeStyle={halfButtonStyle}
              extraStyle={bottomButtonExtra}
            >
              <ChevronDown style={{ width: "0.75rem", height: "0.75rem" }} />
            </StepButton>
          </div>
          <input
            ref={ref}
            id={id}
            type="text"
            inputMode="numeric"
            pattern={min !== undefined && min >= 0 ? "[0-9]*" : "-?[0-9]*"}
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => setIsInputFocused(true)}
            disabled={disabled}
            style={inputStyle}
            {...props}
          />
        </div>
      );
    }

    return (
      <div style={wrapperStyle}>
        {showButtons && (
          <StepButton
            onClick={decrement}
            disabled={disabled || !canDecrement}
            ariaLabel="Decrease"
            sizeStyle={sizes.button}
          >
            <Minus style={{ width: "0.875rem", height: "0.875rem" }} />
          </StepButton>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="numeric"
          pattern={min !== undefined && min >= 0 ? "[0-9]*" : "-?[0-9]*"}
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => setIsInputFocused(true)}
          disabled={disabled}
          style={inputStyle}
          {...props}
        />
        {showButtons && (
          <StepButton
            onClick={increment}
            disabled={disabled || !canIncrement}
            ariaLabel="Increase"
            sizeStyle={sizes.button}
          >
            <Plus style={{ width: "0.875rem", height: "0.875rem" }} />
          </StepButton>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

// ---------------------------------------------------------------------------
// Icon sub-components (inline style for SVG sizing)
// ---------------------------------------------------------------------------
function Minus({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 12H4"
      />
    </svg>
  );
}

function Plus({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}

function ChevronUp({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 15l7-7 7 7"
      />
    </svg>
  );
}

function ChevronDown({ style }: { style?: React.CSSProperties }) {
  return (
    <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export { NumberInput };
