"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Radio 컴포넌트의 props / Radio component props
 * @typedef {Object} RadioProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Radio 스타일 변형 / Radio style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Radio 크기 / Radio size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {string} [label] - 라디오 버튼 레이블 텍스트 / Radio button label text
 * @property {string} [description] - 라디오 버튼 설명 텍스트 / Radio button description text
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>}
 */
export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  label?: string
  description?: string
}

/**
 * Radio 컴포넌트 / Radio component
 * 
 * 라디오 버튼 입력 필드를 제공하는 컴포넌트입니다.
 * 같은 name 속성을 가진 여러 Radio는 그룹으로 동작합니다.
 * ARIA 속성을 자동으로 설정하여 접근성을 지원합니다.
 * 
 * Radio button input field component.
 * Multiple Radio components with the same name attribute work as a group.
 * Automatically sets ARIA attributes for accessibility support.
 * 
 * @component
 * @example
 * // 기본 사용 (그룹) / Basic usage (group)
 * <Radio name="option" value="1" label="옵션 1" />
 * <Radio name="option" value="2" label="옵션 2" />
 * <Radio name="option" value="3" label="옵션 3" />
 * 
 * @example
 * // 에러 상태 / Error state
 * <Radio 
 *   name="gender"
 *   value="male"
 *   label="남성"
 *   error
 * />
 * 
 * @param {RadioProps} props - Radio 컴포넌트의 props / Radio component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Radio 컴포넌트 / Radio component
 */
const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    label,
    description,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId()
    const radioId = id || generatedId
    const labelId = label ? `${radioId}-label` : undefined
    const descriptionId = description ? `${radioId}-description` : undefined
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const dotSizes = {
      sm: "w-1.5 h-1.5",
      md: "w-2 h-2",
      lg: "w-2.5 h-2.5"
    }

    const variantClasses = {
      default: "border-input bg-background text-primary focus:ring-ring",
      outline: "border-2 border-input bg-transparent text-primary focus:ring-ring",
      filled: "border-transparent bg-muted text-primary focus:bg-background focus:ring-ring",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:ring-ring/50 focus:bg-white/20",
    }

    const stateClasses = error
      ? "border-destructive focus:ring-destructive"
      : success
      ? "border-green-500 focus:ring-green-500"
      : ""

    // Support both controlled and uncontrolled modes
    const isControlled = props.checked !== undefined;
    const isChecked = props.checked ?? props.defaultChecked ?? false;
    // Add readOnly if controlled without onChange to suppress React warning
    const needsReadOnly = isControlled && !props.onChange && !props.readOnly;

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            type="radio"
            id={radioId}
            className={merge(
              "peer sr-only",
              className
            )}
            ref={ref}
            aria-checked={isChecked}
            aria-invalid={error}
            aria-label={!label ? props['aria-label'] : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="radio"
            readOnly={needsReadOnly || props.readOnly}
            {...props}
          />
          <div
            className={merge(
              "flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer",
              "peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses,
              isChecked && "border-primary dark:border-primary"
            )}
          >
            <div
              className={merge(
                "rounded-full bg-primary dark:bg-primary transition-all duration-200",
                dotSizes[size],
                isChecked ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={radioId} id={labelId} className="text-sm font-medium text-foreground cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Radio.displayName = "Radio"

export { Radio } 