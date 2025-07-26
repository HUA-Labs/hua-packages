"use client"

import React from "react"
import { merge } from "../lib/utils"

export interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: "solid" | "glass" | "outline" | "elevated"
  padding?: "none" | "small" | "medium" | "large"
}

const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ className, style = "solid", padding = "medium", children, ...props }, ref) => {
    const styleClasses = {
      solid: "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
      glass: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20 dark:border-slate-700/50",
      outline: "bg-transparent border-2 border-slate-200 dark:border-slate-700",
      elevated: "bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700"
    }

    const paddingClasses = {
      none: "",
      small: "p-4",
      medium: "p-6",
      large: "p-8"
    }

    return (
      <div
        ref={ref}
        className={merge(
          "rounded-xl transition-all duration-200",
          styleClasses[style],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Panel.displayName = "Panel"

export { Panel } 