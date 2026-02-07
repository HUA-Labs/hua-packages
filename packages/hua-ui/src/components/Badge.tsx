"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] hover:opacity-80",
        secondary: "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] hover:opacity-80",
        destructive: "bg-[var(--badge-destructive-bg)] text-slate-50 hover:opacity-80",
        error: "bg-[var(--badge-destructive-bg)] text-slate-50 hover:opacity-80",
        outline: "bg-transparent text-[var(--badge-outline-text)] border border-[var(--badge-outline-border)] hover:bg-[var(--badge-outline-hover-bg)]",
        glass: "bg-[var(--badge-glass-bg)] backdrop-blur-sm border border-[var(--badge-glass-border)] text-[var(--badge-glass-text)] hover:opacity-80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Badge 컴포넌트의 props / Badge component props
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "error" | "outline" | "glass"
}

/**
 * Badge 컴포넌트 / Badge component
 *
 * 상태나 카테고리를 표시하는 작은 배지 컴포넌트입니다.
 *
 * @example
 * <Badge>New</Badge>
 * <Badge variant="destructive">완료</Badge>
 * <Badge variant="outline">대기</Badge>
 */
const Badge = React.memo(React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
))
Badge.displayName = "Badge"

export { Badge }
