"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  leftIcon?: React.ReactNode
  placeholder?: string
}

export interface SelectOptionProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    error = false,
    success = false,
    leftIcon,
    placeholder,
    children,
    ...props 
  }, ref) => {
    const variantClasses = {
      default: "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400",
      outline: "border-2 border-gray-200 bg-transparent text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400",
      filled: "border-transparent bg-gray-50 text-gray-900 focus:bg-white focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:focus:bg-gray-800 dark:focus:border-blue-400 dark:focus:ring-blue-400",
      ghost: "border-transparent bg-transparent text-gray-900 focus:bg-gray-50 focus:border-gray-300 focus:ring-gray-500 dark:text-white dark:focus:bg-gray-800 dark:focus:border-gray-600 dark:focus:ring-gray-400",
      glass: "border-white/30 bg-white/10 backdrop-blur-sm text-white focus:border-blue-400/50 focus:ring-blue-400/20 focus:bg-white/20 dark:border-slate-600/50 dark:bg-slate-800/10 dark:text-slate-200 dark:focus:border-blue-400/50 dark:focus:ring-blue-400/20 dark:focus:bg-slate-700/20"
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
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <select
          className={cn(
            "flex w-full appearance-none rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            variantClasses[variant],
            sizeClasses[size],
            stateClasses,
            leftIcon ? "pl-10" : "",
            "pr-10", // 화살표 아이콘을 위한 공간
            className
          )}
          ref={ref}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          <Icon name="chevronDown" size={16} />
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectOption = React.forwardRef<HTMLOptionElement, SelectOptionProps>(
  ({ className, ...props }, ref) => (
    <option
      className={cn("", className)}
      ref={ref}
      {...props}
    />
  )
)
SelectOption.displayName = "SelectOption"

export { Select, SelectOption } 