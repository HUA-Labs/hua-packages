"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  label?: string
  description?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    pressed: controlledPressed,
    onPressedChange,
    label,
    description,
    icon,
    iconPosition = "left",
    onClick,
    ...props 
  }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(false)
    const isControlled = controlledPressed !== undefined
    const pressed = isControlled ? controlledPressed : internalPressed

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isControlled) {
        setInternalPressed(!pressed)
      }
      onPressedChange?.(!pressed)
      onClick?.(e)
    }

    const sizeClasses = {
      sm: "h-7 px-3 text-sm",
      md: "h-9 px-4 text-base",
      lg: "h-11 px-5 text-lg"
    }

    const variantClasses = {
      default: pressed
        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
      outline: pressed
        ? "border-2 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        : "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
      filled: pressed
        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
      ghost: pressed
        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
      glass: pressed
        ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 dark:bg-blue-400/20 dark:border-blue-300/50 dark:hover:bg-blue-400/30"
        : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 dark:bg-slate-800/10 dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-slate-700/20"
    }

    return (
      <div className="flex items-start space-x-3">
        <button
          type="button"
          ref={ref}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          onClick={handleClick}
          aria-pressed={pressed}
          {...props}
        >
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {label && <span>{label}</span>}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </button>
        {description && (
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        )}
      </div>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }

