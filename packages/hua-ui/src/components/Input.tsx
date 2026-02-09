"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"
import { FORM_STATE } from "../lib/styles/cva-base"

export const inputVariants = cva(
  "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-accent-foreground hover:shadow-sm",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        outline: "border-2 border-input bg-transparent",
        filled: "border-transparent bg-secondary/50",
        glass: "border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Input 컴포넌트의 props / Input component props
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "outline" | "filled" | "glass"
  error?: boolean
  success?: boolean
}

/**
 * Input 컴포넌트 / Input component
 *
 * 표준 HTML input 요소를 래핑한 스타일링된 입력 필드 컴포넌트입니다.
 *
 * @example
 * <Input type="text" placeholder="이름을 입력하세요" />
 * <Input type="email" error placeholder="이메일" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", error, success, ...props }, ref) => {
    const ariaInvalid = props["aria-invalid" as keyof typeof props] as boolean | undefined;
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false);

    return (
      <input
        type={type}
        className={merge(
          inputVariants({ variant }),
          isInvalid && FORM_STATE.error,
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
Input.displayName = "Input"

export { Input }
