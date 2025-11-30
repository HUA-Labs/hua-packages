"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  label?: string
  description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
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
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6"
    }

    const iconSizes = {
      sm: 12,
      md: 14,
      lg: 16
    }

    const variantClasses = {
      default: "border-gray-300 bg-white text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:focus:ring-blue-400",
      outline: "border-2 border-gray-200 bg-transparent text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:focus:ring-blue-400",
      filled: "border-transparent bg-gray-50 text-blue-600 focus:bg-white focus:ring-blue-500 dark:bg-gray-700 dark:focus:bg-gray-800 dark:focus:ring-blue-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:ring-blue-400/50 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:focus:ring-blue-400/50 dark:focus:bg-slate-700/20"
    }

    const stateClasses = error 
      ? "border-red-500 focus:ring-red-500 dark:border-red-400 dark:focus:ring-red-400"
      : success
      ? "border-green-500 focus:ring-green-500 dark:border-green-400 dark:focus:ring-green-400"
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
              "flex items-center justify-center rounded border transition-all duration-200 cursor-pointer relative",
              "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              sizeClasses[size],
              variantClasses[variant],
              stateClasses,
              "peer-checked:bg-blue-600 peer-checked:border-blue-600 dark:peer-checked:bg-blue-500 dark:peer-checked:border-blue-500"
            )}
          >
            {/* CSS로 체크 표시 만들기 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-2 border-r-2 border-b-2 border-white transform rotate-45 opacity-0 peer-checked:opacity-100 transition-opacity duration-200" />
            </div>
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
Checkbox.displayName = "Checkbox"

export { Checkbox } 