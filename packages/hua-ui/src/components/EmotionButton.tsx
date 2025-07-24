"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface EmotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emotion: string
  isSelected?: boolean
  size?: "sm" | "md" | "lg"
}

const EmotionButton = React.forwardRef<HTMLButtonElement, EmotionButtonProps>(
  ({ className, emotion, isSelected = false, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-lg",
      lg: "w-16 h-16 text-xl"
    }

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-full border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500",
          sizeClasses[size],
          isSelected 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
          className
        )}
        {...props}
      >
        {emotion}
      </button>
    )
  }
)
EmotionButton.displayName = "EmotionButton"

export { EmotionButton } 