"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted" | "gradient"
  size?: "sm" | "md" | "lg"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  color?: "default" | "muted" | "primary" | "secondary"
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    className, 
    orientation = "horizontal",
    variant = "solid",
    size = "md",
    spacing = "md",
    color = "default",
    ...props 
  }, ref) => {
    const orientationClasses = {
      horizontal: "w-full",
      vertical: "h-full w-px"
    }

    const sizeClasses = {
      sm: orientation === "horizontal" ? "h-px" : "w-px",
      md: orientation === "horizontal" ? "h-0.5" : "w-0.5", // 2px
      lg: orientation === "horizontal" ? "h-1" : "w-1" // 4px
    }

    const variantClasses = {
      solid: "",
      dashed: "border-dashed",
      dotted: "border-dotted",
      gradient: orientation === "horizontal" 
        ? "bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
        : "bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600"
    }

    const colorClasses = {
      default: "bg-gray-200 dark:bg-gray-700",
      muted: "bg-gray-100 dark:bg-gray-800",
      primary: "bg-blue-200 dark:bg-blue-700",
      secondary: "bg-gray-300 dark:bg-gray-600"
    }

    const spacingClasses = {
      none: "",
      sm: orientation === "horizontal" ? "my-4" : "mx-4", // 16px
      md: orientation === "horizontal" ? "my-6" : "mx-6", // 24px
      lg: orientation === "horizontal" ? "my-8" : "mx-8", // 32px
      xl: orientation === "horizontal" ? "my-12" : "mx-12" // 48px
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex-shrink-0",
          orientationClasses[orientation],
          sizeClasses[size],
          variant === "gradient" ? variantClasses[variant] : colorClasses[color],
          variant !== "gradient" && variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      />
    )
  }
)
Divider.displayName = "Divider"

export { Divider } 