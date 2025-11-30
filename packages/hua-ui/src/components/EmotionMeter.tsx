"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface EmotionMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "yellow" | "red"
}

const EmotionMeter = React.forwardRef<HTMLDivElement, EmotionMeterProps>(
  ({ className, value, max = 100, size = "md", color = "blue", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-2",
      md: "h-3", 
      lg: "h-4"
    }

    const colorClasses = {
      blue: "bg-blue-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500"
    }

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={cn(
          "w-full bg-gray-200 rounded-full dark:bg-gray-700",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
EmotionMeter.displayName = "EmotionMeter"

export { EmotionMeter } 