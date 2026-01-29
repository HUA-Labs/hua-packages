"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"

/**
 * Checkbox 컴포넌트의 props / Checkbox component props
 * @typedef {Object} CheckboxProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Checkbox 스타일 변형 / Checkbox style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Checkbox 크기 / Checkbox size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {string} [label] - 체크박스 레이블 텍스트 / Checkbox label text
 * @property {string} [description] - 체크박스 설명 텍스트 / Checkbox description text
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>}
 */
export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  label?: string
  description?: string
}

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
    const checkboxId = id || generatedId
    const labelId = label ? `${checkboxId}-label` : undefined
    const descriptionId = description ? `${checkboxId}-description` : undefined
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16
    }

    const variantClasses = {
      default: "border-gray-300 bg-white text-indigo-600 focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-ring",
      outline: "border-2 border-gray-200 bg-transparent text-indigo-600 focus:ring-ring dark:border-gray-700 dark:focus:ring-ring",
      filled: "border-transparent bg-gray-50 text-indigo-600 focus:bg-white focus:ring-ring dark:bg-gray-700 dark:focus:bg-gray-800 dark:focus:ring-ring",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:ring-ring/50 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:focus:ring-ring/50 dark:focus:bg-slate-700/20"
    }

    const stateClasses = error 
      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:ring-green-400"
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
            type="checkbox"
            id={checkboxId}
            className={merge(
              "peer absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10",
              className
            )}
            ref={ref}
            aria-checked={isChecked}
            aria-invalid={error}
            aria-label={!label ? props['aria-label'] : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="checkbox"
            readOnly={needsReadOnly || props.readOnly}
            {...props}
          />
          <div
            className={merge(
              "flex items-center justify-center rounded border transition-all duration-200 cursor-pointer relative",
              "peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-offset-2",
              "peer-hover:border-indigo-400 peer-hover:shadow-sm",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-disabled:hover:border-gray-300",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses,
              isChecked && "bg-primary border-primary dark:bg-primary dark:border-primary shadow-md shadow-indigo-500/20",
              !isChecked && "bg-white dark:bg-gray-800"
            )}
          >
            {/* 체크 아이콘으로 개선 */}
            <Icon 
              name="check" 
              size={iconSizes[size]} 
              className={merge(
                "text-white transition-all duration-200",
                isChecked ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={checkboxId} id={labelId} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p id={descriptionId} className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox } 