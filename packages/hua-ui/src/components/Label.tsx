"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Label 컴포넌트의 props / Label component props
 * @typedef {Object} LabelProps
 * @property {boolean} [required=false] - 필수 필드 여부 / Required field indicator
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [disabled=false] - 비활성화 상태 / Disabled state
 * @property {"default" | "glass"} [variant="default"] - Label 스타일 변형 / Label style variant
 * @extends {React.LabelHTMLAttributes<HTMLLabelElement>}
 */
export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  error?: boolean
  disabled?: boolean
  variant?: "default" | "glass"
}

/**
 * Label 컴포넌트 / Label component
 * 
 * 폼 필드의 레이블을 표시하는 컴포넌트입니다.
 * 필수 필드 표시와 에러 상태를 지원합니다.
 * 
 * Component for displaying form field labels.
 * Supports required field indicator and error state.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Label htmlFor="email">이메일</Label>
 * <Input id="email" />
 * 
 * @example
 * // 필수 필드 / Required field
 * <Label required htmlFor="name">이름</Label>
 * <Input id="name" required />
 * 
 * @example
 * // 에러 상태 / Error state
 * <Label error htmlFor="password">비밀번호</Label>
 * <Input id="password" aria-invalid />
 * 
 * @param {LabelProps} props - Label 컴포넌트의 props / Label component props
 * @param {React.Ref<HTMLLabelElement>} ref - label 요소 ref / label element ref
 * @returns {JSX.Element} Label 컴포넌트 / Label component
 * 
 * @todo 접근성 개선: required일 때 aria-required="true" 추가 필요 / Accessibility improvement: add aria-required="true" when required
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    children, 
    required = false,
    error = false,
    disabled = false,
    variant = "default",
    ...props 
  }, ref) => {
    const variantClasses = {
      default: merge(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-red-600 dark:text-red-400",
        disabled && "text-slate-400 dark:text-slate-500",
        !error && !disabled && "text-slate-700 dark:text-slate-300"
      ),
      glass: merge(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-red-400",
        disabled && "text-white/50",
        !error && !disabled && "text-white"
      )
    }

    return (
      <label
        ref={ref}
        className={merge(variantClasses[variant], className)}
        aria-required={required ? true : undefined}
        {...props}
      >
        {children}
        {required && (
          <span className={variant === "glass" ? "text-red-400 ml-1" : "text-red-500 ml-1"} aria-label="필수 필드">*</span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label } 