"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Switch 컴포넌트의 props / Switch component props
 * @typedef {Object} SwitchProps
 * @property {"default" | "outline" | "filled" | "glass"} [variant="default"] - Switch 스타일 변형 / Switch style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Switch 크기 / Switch size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {string} [label] - 스위치 레이블 텍스트 / Switch label text
 * @property {string} [description] - 스위치 설명 텍스트 / Switch description text
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>}
 */
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  label?: string
  description?: string
}

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
    const switchId = id || generatedId
    const labelId = label ? `${switchId}-label` : undefined
    const descriptionId = description ? `${switchId}-description` : undefined
    // Track sizes - proper proportions for smooth toggle
    const sizeClasses = {
      sm: "w-9 h-5",
      md: "w-11 h-6",
      lg: "w-14 h-8"
    }

    // Thumb sizes - slightly smaller than track height for padding
    const thumbSizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-7 h-7"
    }

    // Thumb position when checked - calculated for proper alignment
    const thumbTranslate = {
      sm: "peer-checked:translate-x-4",
      md: "peer-checked:translate-x-5",
      lg: "peer-checked:translate-x-6"
    }

    const variantClasses = {
      default: "bg-gray-200 peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-blue-500",
      outline: "bg-transparent border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 dark:border-gray-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500",
      filled: "bg-gray-100 peer-checked:bg-blue-600 dark:bg-gray-800 dark:peer-checked:bg-blue-500",
      glass: "bg-white/20 backdrop-blur-sm border border-white/30 peer-checked:bg-blue-400/50 peer-checked:border-blue-300/50 dark:bg-slate-800/20 dark:border-slate-700/50 dark:peer-checked:bg-blue-400/50 dark:peer-checked:border-blue-300/50"
    }

    const stateClasses = error 
      ? "bg-red-200 peer-checked:bg-red-600 dark:bg-red-800 dark:peer-checked:bg-red-500"
      : success
      ? "bg-green-200 peer-checked:bg-green-600 dark:bg-green-800 dark:peer-checked:bg-green-500"
      : ""

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            id={switchId}
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
            role="switch"
            {...props}
          />
          <div
            className={merge(
              "relative inline-flex cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses
            )}
          >
            <div
              className={merge(
                "pointer-events-none absolute rounded-full bg-white shadow-md ring-0",
                "transition-all duration-200 ease-out",
                "top-1/2 -translate-y-1/2 left-0.5",
                thumbSizes[size],
                thumbTranslate[size]
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label htmlFor={switchId} id={labelId} className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
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
Switch.displayName = "Switch"

export { Switch } 