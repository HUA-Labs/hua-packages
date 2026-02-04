"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Badge 컴포넌트의 props / Badge component props
 * @typedef {Object} BadgeProps
 * @property {"default" | "secondary" | "destructive" | "error" | "outline" | "glass"} [variant="default"] - Badge 스타일 변형 / Badge style variant
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "error" | "outline" | "glass"
}

/**
 * Badge 컴포넌트 / Badge component
 * 
 * 상태나 카테고리를 표시하는 작은 배지 컴포넌트입니다.
 * React.memo로 최적화되어 있어 불필요한 리렌더링을 방지합니다.
 * 
 * Small badge component for displaying status or category.
 * Optimized with React.memo to prevent unnecessary re-renders.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Badge>New</Badge>
 * 
 * @example
 * // 다양한 변형 / Various variants
 * <Badge variant="destructive">완료</Badge>
 * <Badge variant="error">오류</Badge>
 * <Badge variant="outline">대기</Badge>
 * 
 * @param {BadgeProps} props - Badge 컴포넌트의 props / Badge component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Badge 컴포넌트 / Badge component
 */
const Badge = React.memo(React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    // CSS 변수 기반 배경색 (Tailwind v4 dark: + bg-* 충돌 우회)
    const variantClasses = React.useMemo(() => ({
      default: "bg-[var(--badge-default-bg)] text-[var(--badge-default-text)] hover:opacity-80",
      secondary: "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)] hover:opacity-80",
      destructive: "bg-[var(--badge-destructive-bg)] text-slate-50 hover:opacity-80",
      error: "bg-[var(--badge-destructive-bg)] text-slate-50 hover:opacity-80",
      outline: "bg-transparent text-[var(--badge-outline-text)] border border-[var(--badge-outline-border)] hover:bg-[var(--badge-outline-hover-bg)]",
      glass: "bg-[var(--badge-glass-bg)] backdrop-blur-sm border border-[var(--badge-glass-border)] text-[var(--badge-glass-text)] hover:opacity-80"
    }), [])

    return (
      <div
        ref={ref}
        className={merge(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 focus-visible:ring-offset-2",
          variantClasses[variant],
          className
        )}
        {...props}
      />
    )
  }
))
Badge.displayName = "Badge"

export { Badge } 
