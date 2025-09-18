"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface LinkProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "ghost" | "underline"
  size?: "sm" | "md" | "lg"
  external?: boolean
  className?: string
  onClick?: () => void
}

export function Link({ 
  href,
  children,
  className,
  variant = "default",
  size = "md",
  external = false,
  onClick
}: LinkProps) {
  const variantClasses = {
    default: "text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300",
    primary: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    secondary: "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
    ghost: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:bg-gray-800",
    underline: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline hover:no-underline"
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <a
      href={href}
      className={cn(
        "transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  )
} 