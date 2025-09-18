"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
  error?: boolean
  disabled?: boolean
  variant?: "default" | "glass"
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ 
    className, 
    children, 
    required = false,
    error = false,
    disabled = false,
    variant = "default",
    ...props 
  }, ref) => {
    const variantClasses = {
      default: cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-red-600 dark:text-red-400",
        disabled && "text-slate-400 dark:text-slate-500",
        !error && !disabled && "text-slate-700 dark:text-slate-300"
      ),
      glass: cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        error && "text-red-400",
        disabled && "text-white/50",
        !error && !disabled && "text-white"
      )
    }

    return (
      <label
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
        {required && (
          <span className={variant === "glass" ? "text-red-400 ml-1" : "text-red-500 ml-1"}>*</span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label } 