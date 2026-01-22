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
    const variantClasses = React.useMemo(() => ({
      default: "bg-slate-900 text-slate-50 hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/80",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
      destructive: "bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80",
      error: "bg-red-500 text-slate-50 hover:bg-red-500/80 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/80", // error는 destructive와 동일
      outline: "text-slate-950 border border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-50",
      glass: "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 dark:bg-slate-800/20 dark:border-slate-700/50 dark:text-slate-200 dark:hover:bg-slate-700/30"
    }), [])

    return (
      <div
        ref={ref}
        className={merge(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2",
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
