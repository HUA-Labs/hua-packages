"use client";

import React from "react";
import { merge } from "../lib/utils";

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
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
export interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "defaultValue" | "size" | "type"> {
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
}

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
      className,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const updateValue = React.useCallback(
      (newValue: number) => {
        // Clamp to min/max
        let clampedValue = newValue;
        if (min !== undefined) clampedValue = Math.max(min, clampedValue);
        if (max !== undefined) clampedValue = Math.min(max, clampedValue);

        if (!isControlled) {
          setInternalValue(clampedValue);
        }
        onChange?.(clampedValue);
      },
      [isControlled, min, max, onChange]
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
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue)) {
        updateValue(newValue);
      }
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

    // Spacing system: 4px grid
    // sm: h-8 (32px), px-2 (8px), gap-1 (4px)
    // md: h-10 (40px), px-3 (12px), gap-2 (8px)
    // lg: h-12 (48px), px-4 (16px), gap-2 (8px)
    const sizeClasses = {
      sm: {
        input: "h-8 text-sm px-2 py-1",
        button: "w-8 h-8 text-sm",
        wrapper: "gap-1",
      },
      md: {
        input: "h-10 text-sm px-3 py-2",
        button: "w-10 h-10 text-sm",
        wrapper: "gap-2",
      },
      lg: {
        input: "h-12 text-base px-4 py-2.5",
        button: "w-12 h-12 text-base",
        wrapper: "gap-2",
      },
    };

    const sizes = sizeClasses[size];

    const buttonBase = merge(
      "flex items-center justify-center rounded-md border border-input bg-background",
      "hover:bg-secondary hover:border-primary/50 active:scale-95",
      "transition-all duration-150",
      "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      sizes.button
    );

    const canDecrement = min === undefined || currentValue > min;
    const canIncrement = max === undefined || currentValue < max;

    if (buttonLayout === "vertical") {
      return (
        <div className={merge("inline-flex items-center", sizes.wrapper, className)}>
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={increment}
              disabled={disabled || !canIncrement}
              className={merge(buttonBase, "rounded-b-none h-[calc(50%-1px)]")}
              aria-label="Increase"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={decrement}
              disabled={disabled || !canDecrement}
              className={merge(buttonBase, "rounded-t-none h-[calc(50%-1px)]")}
              aria-label="Decrease"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={currentValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            className={merge(
              "w-16 text-center rounded-md border border-input bg-background",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              sizes.input
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <div className={merge("inline-flex items-center", sizes.wrapper, className)}>
        {showButtons && (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || !canDecrement}
            className={buttonBase}
            aria-label="Decrease"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={currentValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={merge(
            "w-16 text-center rounded-md border border-input bg-background",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            sizes.input
          )}
          {...props}
        />
        {showButtons && (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || !canIncrement}
            className={buttonBase}
            aria-label="Increase"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

// Simple icon components to avoid external dependency
function Minus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export { NumberInput };
