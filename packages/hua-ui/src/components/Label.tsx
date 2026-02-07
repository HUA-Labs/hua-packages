"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      variant: {
        default: "text-foreground",
        glass: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Label 컴포넌트의 props / Label component props
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
 *
 * @example
 * <Label htmlFor="email">이메일</Label>
 * <Label required htmlFor="name">이름</Label>
 * <Label error htmlFor="password">비밀번호</Label>
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
    return (
      <label
        ref={ref}
        className={merge(
          labelVariants({ variant }),
          error && (variant === "glass" ? "text-red-400" : "text-destructive"),
          disabled && (variant === "glass" ? "text-white/50" : "text-muted-foreground"),
          className
        )}
        aria-required={required ? true : undefined}
        {...props}
      >
        {children}
        {required && (
          <span className={variant === "glass" ? "text-red-400 ml-1" : "text-destructive ml-1"} aria-label="필수 필드">*</span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label } 