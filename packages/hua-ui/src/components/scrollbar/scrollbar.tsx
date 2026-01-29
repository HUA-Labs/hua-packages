import React from "react"
import { merge } from "../../lib/utils"

export interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "glass" | "colorful" | "minimal" | "neon"
  size?: "sm" | "md" | "lg" | "xl"
  orientation?: "vertical" | "horizontal" | "both"
  autoHide?: boolean
  smooth?: boolean
}

const Scrollbar = React.forwardRef<HTMLDivElement, ScrollbarProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    orientation = "both", 
    autoHide = true, 
    smooth = true, 
    children, 
    ...props 
  }, ref) => {
    
    const getVariantClasses = () => {
      switch (variant) {
        case "glass":
          return "scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 backdrop-blur-sm"
        case "colorful":
          return "scrollbar-thumb-gradient-to-b scrollbar-thumb-from-indigo-500 scrollbar-thumb-to-purple-500 hover:scrollbar-thumb-from-cyan-600 hover:scrollbar-thumb-to-purple-600"
        case "minimal":
          return "scrollbar-thumb-slate-200/50 hover:scrollbar-thumb-slate-300/70 dark:scrollbar-thumb-slate-700/50 dark:hover:scrollbar-thumb-slate-600/70"
        case "neon":
          return "scrollbar-thumb-cyan-400/60 hover:scrollbar-thumb-cyan-300/80 scrollbar-thumb-shadow-lg scrollbar-thumb-shadow-cyan-500/25"
        default:
          return "scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 dark:hover:scrollbar-thumb-slate-500"
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "scrollbar-w-1"
        case "lg":
          return "scrollbar-w-3"
        case "xl":
          return "scrollbar-w-4"
        default:
          return "scrollbar-w-2"
      }
    }

    const getOrientationClasses = () => {
      switch (orientation) {
        case "vertical":
          return "overflow-y-auto overflow-x-hidden"
        case "horizontal":
          return "overflow-x-auto overflow-y-hidden"
        default:
          return "overflow-auto"
      }
    }

    const baseClasses = merge(
      "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded-full transition-all duration-200",
      getVariantClasses(),
      getSizeClasses(),
      getOrientationClasses(),
      autoHide && "scrollbar-hide",
      smooth && "scroll-smooth",
      className
    )

    return (
      <div
        className={baseClasses}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Scrollbar.displayName = "Scrollbar"

export { Scrollbar } 