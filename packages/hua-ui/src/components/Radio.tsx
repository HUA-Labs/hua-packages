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
      default: "border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-400",
      outline: "border-2 border-gray-200 bg-transparent text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-400",
      filled: "border-transparent bg-gray-50 text-blue-600 focus:bg-white focus:ring-blue-500 dark:bg-gray-700 dark:focus:bg-gray-800 dark:focus:ring-blue-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:ring-blue-400/50 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:focus:ring-blue-400/50 dark:focus:bg-slate-700/20"
    }

    const stateClasses = error 
      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:ring-green-400"
      : ""

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
            aria-checked={props.checked ?? false}
            aria-invalid={error}
            aria-label={!label ? props['aria-label'] : undefined}
            aria-labelledby={label ? labelId : undefined}
            aria-describedby={descriptionId}
            role="radio"
            {...props}
          />
          <div
            className={merge(
              "flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses,
              "peer-checked:border-blue-600 dark:peer-checked:border-blue-500"
            )}
          >
            <div
              className={merge(
                "rounded-full bg-blue-600 dark:bg-blue-500 opacity-0 peer-checked:opacity-100 transition-opacity duration-200",
                dotSizes[size]
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={radioId} id={labelId} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
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
Radio.displayName = "Radio"

export { Radio } 