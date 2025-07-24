"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "bars" | "ring" | "ripple"
  text?: string
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "default", text, color = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-6 h-6", // 24px - 더 넉넉한 크기
      md: "w-8 h-8", // 32px - 더 넉넉한 크기
      lg: "w-12 h-12", // 48px - 더 넉넉한 크기
      xl: "w-16 h-16" // 64px - 더 넉넉한 크기
    }

    const colorClasses = {
      default: "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
      primary: "border-blue-300 border-t-blue-600 dark:border-blue-600 dark:border-t-blue-300",
      secondary: "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
      success: "border-green-300 border-t-green-600 dark:border-green-600 dark:border-t-green-300",
      warning: "border-yellow-300 border-t-yellow-600 dark:border-yellow-600 dark:border-t-yellow-300",
      error: "border-red-300 border-t-red-600 dark:border-red-600 dark:border-t-red-300"
    }

    const renderSpinner = () => {
      switch (variant) {
        case "dots":
          return (
            <div className="flex space-x-1"> {/* 4px 간격 */}
              <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
            </div>
          )
        case "bars":
          return (
            <div className="flex space-x-1"> {/* 4px 간격 */}
              <div className="w-1 h-full bg-current animate-pulse" />
              <div className="w-1 h-full bg-current animate-pulse delay-100" />
              <div className="w-1 h-full bg-current animate-pulse delay-200" />
            </div>
          )
        case "ring":
          return (
            <div className={cn(
              "animate-spin rounded-full border-2",
              colorClasses[color]
            )} />
          )
        case "ripple":
          return (
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-full border-2 animate-ping",
                colorClasses[color]
              )} />
              <div className={cn(
                "rounded-full border-2",
                colorClasses[color]
              )} />
            </div>
          )
        default:
          return (
            <div className={cn(
              "animate-spin rounded-full border-2",
              colorClasses[color]
            )} />
          )
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center",
          className
        )}
        {...props}
      >
        <div className={cn(sizeClasses[size], "text-gray-600 dark:text-gray-400")}>
          {renderSpinner()}
        </div>
        {text && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center"> {/* 12px 여백 */}
            {text}
          </p>
        )}
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner } 