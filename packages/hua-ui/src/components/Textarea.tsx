"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    resize = "vertical",
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      outline: "border-2 border-gray-200 bg-transparent text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      filled: "border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      ghost: "border-transparent bg-transparent text-gray-900 placeholder-gray-500 focus:bg-gray-50 focus:border-gray-300 focus:ring-gray-500 dark:text-white dark:placeholder-gray-400 dark:focus:bg-gray-800 dark:focus:border-gray-600 dark:focus:ring-gray-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/20 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/20 dark:focus:bg-slate-700/20"
    }

    const sizeClasses = {
      sm: "px-3 py-2 text-sm min-h-[80px]",
      md: "px-4 py-3 text-base min-h-[100px]",
      lg: "px-4 py-3 text-lg min-h-[120px]"
    }

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize"
    }

    const stateClasses = error 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:border-green-400 dark:focus:ring-green-400"
      : ""

    return (
      <textarea
        className={cn(
          "flex w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          resizeClasses[resize],
          stateClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea } 