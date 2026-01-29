"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Select 컴포넌트의 props / Select component props
 * @typedef {Object} SelectProps
 * @property {"default" | "outline" | "filled" | "ghost" | "glass"} [variant="default"] - Select 스타일 변형 / Select style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Select 크기 / Select size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {React.ReactNode} [leftIcon] - 왼쪽 아이콘 / Left icon
 * @property {string} [placeholder] - 플레이스홀더 텍스트 / Placeholder text
 * @extends {Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>}
 */
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  placeholder?: string
}

/**
 * SelectOption 컴포넌트의 props / SelectOption component props
 * @typedef {Object} SelectOptionProps
 * @property {string} value - 옵션 값 / Option value
 * @property {React.ReactNode} children - 옵션 표시 텍스트 / Option display text
 * @extends {React.OptionHTMLAttributes<HTMLOptionElement>}
 */
export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string
  children: React.ReactNode
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
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    leftIcon,
    placeholder,
    children,
    "aria-label": ariaLabel,
    "aria-invalid": ariaInvalid,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400",
      outline: "border-2 border-gray-300 bg-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400",
      filled: "border-transparent bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      ghost: "border-transparent bg-transparent text-gray-900 focus:bg-gray-50 focus:border-gray-300 focus:ring-gray-500 dark:text-white dark:focus:bg-gray-800 dark:focus:border-gray-600 dark:focus:ring-gray-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:border-blue-400/50 focus:ring-blue-400/20 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/20 dark:focus:bg-slate-700/20"
    }

    // Spacing system: 4px grid - matching Input component
    // pr-10 is added separately for arrow icon space
    const sizeClasses = {
      sm: "h-8 pl-2 text-sm",
      md: "h-10 pl-3 text-sm",
      lg: "h-12 pl-4 text-base"
    }

    const stateClasses = error 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:border-green-400 dark:focus:ring-green-400"
      : ""

    const selectRef = React.useRef<HTMLSelectElement>(null)
    const combinedRef = React.useCallback((node: HTMLSelectElement | null) => {
      selectRef.current = node
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLSelectElement | null>).current = node
      }
    }, [ref])
    
    const [isFocused, setIsFocused] = React.useState(false)

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <select
          ref={combinedRef}
          className={merge(
            "flex w-full appearance-none rounded-md border transition-all duration-200",
            "focus:outline-none focus:ring-1 focus:ring-offset-2",
            "hover:border-blue-400 hover:shadow-sm",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300",
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            leftIcon ? "pl-10" : "",
            "pr-10", // 화살표 아이콘을 위한 공간
            className
          )}
          aria-label={ariaLabel || (placeholder ? undefined : "선택")}
          aria-invalid={ariaInvalid !== undefined ? ariaInvalid : (error || undefined)}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
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
        <div className={merge(
          "absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none",
          "transition-transform duration-200 ease-out",
          isFocused && "rotate-180"
        )}>
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
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
    )
  }
)
Select.displayName = "Select"

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option
      className={className || ""}
      ref={ref}
      {...props}
    />
  )
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption } 