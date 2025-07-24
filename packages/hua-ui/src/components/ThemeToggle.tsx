"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"
import { useTheme } from "./ThemeProvider"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "button" | "icon" | "switch"
  showLabel?: boolean
  label?: {
    light?: string
    dark?: string
    system?: string
  }
}

export function ThemeToggle({
  className,
  size = "md",
  variant = "button",
  showLabel = false,
  label = {
    light: "라이트",
    dark: "다크",
    system: "시스템"
  },
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const sizeClasses = {
    sm: "h-10 w-10", // 40px - 더 넉넉한 크기
    md: "h-12 w-12", // 48px - 더 넉넉한 크기
    lg: "h-14 w-14" // 56px - 더 넉넉한 크기
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const renderIcon = () => {
    if (theme === "system") {
      return <Icon name="monitor" size={iconSizes[size]} />
    }
    return resolvedTheme === "dark" ? (
      <Icon name="moon" size={iconSizes[size]} />
    ) : (
      <Icon name="sun" size={iconSizes[size]} />
    )
  }

  const handleClick = () => {
    if (theme === "system") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      setTheme("system")
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="relative">
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300",
              resolvedTheme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            )}
          >
            <Icon name="moon" size={iconSizes[size]} className="text-blue-500" />
          </div>
          <div
            className={cn(
              "transition-all duration-300",
              resolvedTheme === "dark" ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            )}
          >
            <Icon name="sun" size={iconSizes[size]} className="text-yellow-500" />
          </div>
        </div>
      </button>
    )
  }

  if (variant === "switch") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2",
          resolvedTheme === "dark" 
            ? "bg-blue-600" 
            : "bg-gray-200 dark:bg-gray-700",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg",
            resolvedTheme === "dark" ? "translate-x-6" : "translate-x-1"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Icon name="sun" size={12} className="text-yellow-500 opacity-0" />
          <Icon name="moon" size={12} className="text-blue-500 opacity-0" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2", // 12px 간격, 16px, 12px 패딩
        className
      )}
      {...props}
    >
      {renderIcon()}
      {showLabel && (
        <span>
          {theme === "system" ? label.system : theme === "dark" ? label.dark : label.light}
        </span>
      )}
    </button>
  )
} 