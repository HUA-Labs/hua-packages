"use client"

import React from "react"
import { merge } from "../lib/utils"

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'loading'> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", loading = false, disabled, children, ...props }, ref) => {
    const variantClasses = {
      default: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm hover:shadow-md",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 shadow-sm hover:shadow-md",
      outline: "border-2 border-slate-300 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-transparent dark:text-slate-100 dark:hover:bg-slate-800/50",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
      glass: "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 dark:bg-slate-800/20 dark:border-slate-700/50 dark:text-slate-100 dark:hover:bg-slate-700/30"
    }

    const sizeClasses = {
      sm: "h-9 px-4 py-2 text-sm rounded-lg",
      md: "h-11 px-6 py-3 text-base rounded-xl",
      lg: "h-13 px-8 py-4 text-lg rounded-xl"
    }

    return (
      <button
        className={merge(
          "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          loading && "opacity-50 cursor-not-allowed",
          className
        )}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </div>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button } 