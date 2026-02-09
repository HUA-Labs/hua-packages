"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"
import { FORM_STATE } from "../lib/styles/cva-base"

export const selectVariants = cva(
  "flex w-full appearance-none rounded-md border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2 hover:border-accent-foreground hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background text-foreground focus:border-ring focus:ring-ring",
        outline: "border-2 border-input bg-transparent text-foreground focus:border-ring focus:ring-ring",
        filled: "border-transparent bg-secondary/50 text-foreground focus:bg-background focus:border-ring focus:ring-ring",
        ghost: "border-transparent bg-transparent text-foreground focus:bg-muted focus:border-border focus:ring-muted-foreground",
        glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:border-ring/50 focus:ring-ring/20 focus:bg-white/20",
      },
      size: {
        sm: "h-8 pl-2 text-sm",
        md: "h-10 pl-3 text-sm",
        lg: "h-12 pl-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

/**
 * Select 컴포넌트의 props / Select component props
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
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
            {leftIcon}
          </div>
        )}
        <select
          ref={combinedRef}
          className={merge(
            selectVariants({ variant, size }),
            error && FORM_STATE.error,
            success && FORM_STATE.success,
            leftIcon ? "pl-10" : "",
            "pr-10",
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
            className="w-4 h-4 text-muted-foreground"
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