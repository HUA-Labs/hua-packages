"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  label?: string
  description?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    label,
    description,
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-4",
      md: "w-11 h-6",
      lg: "w-14 h-7"
    }

    const thumbSizes = {
      sm: "w-3 h-3",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const variantClasses = {
      default: "bg-gray-200 peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-blue-500",
      outline: "bg-transparent border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 dark:border-gray-600 dark:peer-checked:border-blue-500 dark:peer-checked:bg-blue-500",
      filled: "bg-gray-100 peer-checked:bg-blue-600 dark:bg-gray-800 dark:peer-checked:bg-blue-500",
      glass: "bg-white/20 backdrop-blur-sm border border-white/30 peer-checked:bg-blue-400/50 peer-checked:border-blue-300/50 dark:bg-slate-800/20 dark:border-slate-700/50 dark:peer-checked:bg-blue-400/50 dark:peer-checked:border-blue-300/50"
    }

    const stateClasses = error 
      ? "bg-red-200 peer-checked:bg-red-600 dark:bg-red-800 dark:peer-checked:bg-red-500"
      : success
      ? "bg-green-200 peer-checked:bg-green-600 dark:bg-green-800 dark:peer-checked:bg-green-500"
      : ""

    return (
      <div className="flex items-start space-x-3">
        <div className="relative">
          <input
            type="checkbox"
            className={cn(
              "peer sr-only",
              className
            )}
            ref={ref}
            {...props}
          />
          <div
            className={cn(
              "relative inline-flex cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses
            )}
          >
            <div
              className={cn(
                "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out",
                "peer-checked:translate-x-full",
                thumbSizes[size],
                size === "sm" ? "translate-x-0.5 peer-checked:translate-x-4.5" : "",
                size === "md" ? "translate-x-0.5 peer-checked:translate-x-5.5" : "",
                size === "lg" ? "translate-x-0.5 peer-checked:translate-x-7" : ""
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)
Switch.displayName = "Switch"

export { Switch } 