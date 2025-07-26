"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error" | "info" | "glass"
  showValue?: boolean
  animated?: boolean
  striped?: boolean
  label?: string
  description?: string
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ 
    className, 
    value = 0,
    max = 100,
    size = "md",
    variant = "default",
    showValue = false,
    animated = true,
    striped = false,
    label,
    description,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const sizeClasses = {
      sm: "h-2", // 8px 높이
      md: "h-3", // 12px 높이
      lg: "h-4" // 16px 높이
    }

    const getVariantClasses = () => {
      switch (variant) {
        case "success":
          return "bg-green-500 dark:bg-green-400"
        case "warning":
          return "bg-yellow-500 dark:bg-yellow-400"
        case "error":
          return "bg-red-500 dark:bg-red-400"
        case "info":
          return "bg-blue-500 dark:bg-blue-400"
        case "glass":
          return "bg-white/50 backdrop-blur-sm"
        default:
          return "bg-gray-900 dark:bg-gray-100"
      }
    }

    const getStripedClasses = () => {
      if (!striped) return ""
      return "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse"
    }

    return (
      <div className={cn("w-full", className)} {...props}>
        {/* 라벨과 값 */}
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2"> {/* 8px 여백 */}
            {label && (
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        {/* 프로그레스 바 */}
        <div
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full",
            variant === "glass" 
              ? "bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-slate-800/10 dark:border-slate-700/50"
              : "bg-gray-200 dark:bg-gray-700",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300 ease-out",
              getVariantClasses(),
              getStripedClasses(),
              animated && "animate-pulse"
            )}
            style={{
              width: `${percentage}%`,
              transition: animated ? "width 0.3s ease-out" : "none"
            }}
          />
        </div>

        {/* 설명 */}
        {description && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400"> {/* 8px 여백 */}
            {description}
          </p>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

// 편의 컴포넌트들
export const ProgressSuccess = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="success" className={className} {...props} />
  )
)
ProgressSuccess.displayName = "ProgressSuccess"

export const ProgressWarning = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="warning" className={className} {...props} />
  )
)
ProgressWarning.displayName = "ProgressWarning"

export const ProgressError = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="error" className={className} {...props} />
  )
)
ProgressError.displayName = "ProgressError"

export const ProgressInfo = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="info" className={className} {...props} />
  )
)
ProgressInfo.displayName = "ProgressInfo"

// 복합 Progress 컴포넌트들
export const ProgressCard = React.forwardRef<HTMLDivElement, ProgressProps & { title?: string }>(
  ({ title, className, ...props }, ref) => (
    <div className={cn("p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3"> {/* 12px 여백 */}
          {title}
        </h3>
      )}
      <Progress ref={ref} {...props} />
    </div>
  )
)
ProgressCard.displayName = "ProgressCard"

export const ProgressGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)} // 16px 간격
      {...props}
    >
      {children}
    </div>
  )
)
ProgressGroup.displayName = "ProgressGroup"

export { Progress } 