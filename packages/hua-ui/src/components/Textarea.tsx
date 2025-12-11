"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Textarea 컴포넌트의 props / Textarea component props
 * @typedef {Object} TextareaProps
 * @property {"default" | "outline" | "filled" | "ghost" | "glass"} [variant="default"] - Textarea 스타일 변형 / Textarea style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Textarea 크기 / Textarea size
 * @property {boolean} [error=false] - 에러 상태 표시 / Error state
 * @property {boolean} [success=false] - 성공 상태 표시 / Success state
 * @property {"none" | "vertical" | "horizontal" | "both"} [resize="vertical"] - 크기 조절 방향 / Resize direction
 * @extends {React.TextareaHTMLAttributes<HTMLTextAreaElement>}
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
}

/**
 * Textarea 컴포넌트 / Textarea component
 * 
 * 여러 줄 텍스트 입력을 위한 텍스트 영역 컴포넌트입니다.
 * 다양한 스타일 변형과 크기를 지원하며, 접근성 속성을 포함합니다.
 * 
 * Text area component for multi-line text input.
 * Supports various style variants and sizes, includes accessibility attributes.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Textarea placeholder="내용을 입력하세요" />
 * 
 * @example
 * // 에러 상태 / Error state
 * <Textarea 
 *   error
 *   placeholder="에러가 발생했습니다"
 *   aria-label="설명 입력"
 * />
 * 
 * @example
 * // 크기 조절 비활성화 / Disable resize
 * <Textarea 
 *   resize="none"
 *   rows={5}
 *   placeholder="고정 크기 텍스트 영역"
 * />
 * 
 * @param {TextareaProps} props - Textarea 컴포넌트의 props / Textarea component props
 * @param {React.Ref<HTMLTextAreaElement>} ref - textarea 요소 ref / textarea element ref
 * @returns {JSX.Element} Textarea 컴포넌트 / Textarea component
 * 
 * @todo 접근성 개선: aria-invalid 속성 자동 추가 필요 / Accessibility improvement: auto-add aria-invalid attribute
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    resize = "vertical",
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 hover:shadow-sm",
      outline: "border-2 border-gray-200 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200 hover:border-blue-400 hover:shadow-sm",
      filled: "border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600",
      ghost: "border-transparent bg-transparent text-gray-900 placeholder-gray-500 focus:bg-gray-50 focus:border-gray-300 focus:ring-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:border-gray-600 dark:focus:ring-gray-400 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/20 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/20 dark:focus:bg-slate-700/20 transition-all duration-200 hover:border-blue-400/40 hover:bg-white/15 dark:hover:bg-slate-700/15"
    }

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[80px]",
      md: "px-4 py-3 text-base min-h-[100px]",
      lg: "px-4 py-3 text-lg min-h-[120px]"
    }

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize"
    }

    const stateClasses = error 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:border-green-400 dark:focus:ring-green-400"
      : ""
    
    // aria-invalid 자동 설정
    // Auto-set aria-invalid
    const ariaInvalid = props['aria-invalid' as keyof typeof props] as boolean | undefined
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false)

    return (
      <textarea
        className={merge(
          "flex w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          resizeClasses[resize],
          stateClasses,
          className
        )}
        ref={ref}
        aria-invalid={isInvalid || undefined}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 