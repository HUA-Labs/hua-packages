"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"
import { FORM_STATE } from "../lib/styles/cva-base"

export const textareaVariants = cva(
  "flex w-full rounded-md border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-2 hover:border-accent-foreground hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground",
  {
    variants: {
      variant: {
        default: "border-input bg-background text-foreground focus:border-ring focus:ring-ring",
        outline: "border-2 border-input bg-transparent text-foreground focus:border-ring focus:ring-ring",
        filled: "border-transparent bg-secondary/50 text-foreground focus:bg-background focus:border-ring focus:ring-ring",
        ghost: "border-transparent bg-transparent text-foreground focus:bg-muted focus:border-border focus:ring-muted-foreground",
        glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 focus:border-ring/50 focus:ring-ring/20 focus:bg-white/20",
      },
      size: {
        sm: "px-3 py-2 text-sm min-h-[80px]",
        md: "px-4 py-3 text-base min-h-[100px]",
        lg: "px-4 py-3 text-lg min-h-[120px]",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      resize: "vertical",
    },
  }
)

/**
 * Textarea 컴포넌트의 props / Textarea component props
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
    const ariaInvalid = props['aria-invalid' as keyof typeof props] as boolean | undefined
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false)

    return (
      <textarea
        className={merge(
          textareaVariants({ variant, size, resize }),
          error && FORM_STATE.error,
          success && FORM_STATE.success,
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