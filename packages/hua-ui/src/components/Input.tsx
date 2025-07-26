"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      outline: "border-2 border-slate-200 bg-transparent text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      filled: "border-transparent bg-slate-50 text-slate-900 placeholder-slate-500 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400 dark:focus:bg-slate-800 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      ghost: "border-transparent bg-transparent text-slate-900 placeholder-slate-500 focus:bg-slate-50 focus:border-slate-300 focus:ring-slate-500 dark:text-white dark:placeholder-slate-400 dark:focus:bg-slate-800 dark:focus:border-slate-600 dark:focus:ring-slate-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:border-blue-400/50 focus:ring-blue-400/20 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:placeholder-slate-400 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/20 dark:focus:bg-slate-700/20"
    }

    const sizeClasses = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-base",
      lg: "h-12 px-4 text-lg"
    }

    const stateClasses = error 
      ? "border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:border-green-400 dark:focus:ring-green-400"
      : ""

    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex w-full rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            leftIcon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            className
          )}
          ref={ref}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input } 