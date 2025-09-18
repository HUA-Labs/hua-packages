"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  centered?: boolean
  fluid?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ 
    className, 
    size = "lg",
    padding = "md",
    centered = true,
    fluid = false,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "max-w-2xl", // 672px
      md: "max-w-4xl", // 896px
      lg: "max-w-6xl", // 1152px
      xl: "max-w-7xl", // 1280px
      full: "max-w-full"
    }

    const paddingClasses = {
      none: "",
      sm: "px-4 py-8", // 16px 좌우, 32px 상하
      md: "px-6 py-12", // 24px 좌우, 48px 상하
      lg: "px-8 py-16", // 32px 좌우, 64px 상하
      xl: "px-12 py-20" // 48px 좌우, 80px 상하
    }

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          !fluid && sizeClasses[size],
          paddingClasses[padding],
          centered && "mx-auto",
          "bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-xl",
          "dark:bg-slate-900/5 dark:border-slate-700/20",
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container } 