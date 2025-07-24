"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction = "vertical",
    spacing = "md",
    align = "start",
    justify = "start",
    wrap = false,
    ...props 
  }, ref) => {
    const directionClasses = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row"
    }

    const spacingClasses = {
      none: "",
      sm: direction === "vertical" ? "space-y-4" : "space-x-4", // 16px
      md: direction === "vertical" ? "space-y-6" : "space-x-6", // 24px
      lg: direction === "vertical" ? "space-y-8" : "space-x-8", // 32px
      xl: direction === "vertical" ? "space-y-12" : "space-x-12" // 48px
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch"
    }

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    }

    return (
      <div
        ref={ref}
        className={cn(
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

export { Stack } 