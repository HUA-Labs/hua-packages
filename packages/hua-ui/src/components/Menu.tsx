"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
}

const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ 
    className, 
    children,
    variant = "default",
    size = "md",
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "flex items-center space-x-1" // 4px 간격
        case "vertical":
          return "flex flex-col space-y-1" // 4px 간격
        case "compact":
          return "flex flex-col space-y-0.5" // 2px 간격
        default:
          return "flex flex-col space-y-1" // 4px 간격
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-sm"
        case "lg":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              variant,
              size
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
Menu.displayName = "Menu"

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
  active?: boolean
  disabled?: boolean
}

const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({ 
    className, 
    icon,
    variant = "default",
    size = "md",
    active = false,
    disabled = false,
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors", // 12px, 8px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        case "vertical":
          return cn(
            "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors", // 16px, 12px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        case "compact":
          return cn(
            "flex items-center gap-2 px-2 py-1.5 rounded text-sm font-medium transition-colors", // 8px, 6px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
        default:
          return cn(
            "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors", // 16px, 12px 패딩
            active 
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" 
              : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs"
        case "lg":
          return "text-base"
        default:
          return "text-sm"
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          getVariantClasses(),
          getSizeClasses(),
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        disabled={disabled}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 w-4 h-4">
            {icon}
          </div>
        )}
        <span className="flex-1 text-left">{children}</span>
      </button>
    )
  }
)
MenuItem.displayName = "MenuItem"

export interface MenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "horizontal" | "vertical" | "compact"
}

const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" // 4px 여백
        case "vertical":
        case "compact":
        default:
          return "h-px bg-gray-200 dark:bg-gray-700 my-2" // 8px 여백
      }
    }

    return (
      <div
        ref={ref}
        className={cn(getVariantClasses(), className)}
        {...props}
      />
    )
  }
)
MenuSeparator.displayName = "MenuSeparator"

export interface MenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "horizontal" | "vertical" | "compact"
  size?: "sm" | "md" | "lg"
}

const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "horizontal":
          return "px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" // 12px, 4px 패딩
        case "vertical":
        case "compact":
        default:
          return "px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide" // 16px, 8px 패딩
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "text-xs"
        case "lg":
          return "text-sm"
        default:
          return "text-xs"
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenuLabel.displayName = "MenuLabel"

// 편의 컴포넌트들
export const MenuHorizontal = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="horizontal" className={className} {...props} />
  )
)
MenuHorizontal.displayName = "MenuHorizontal"

export const MenuVertical = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="vertical" className={className} {...props} />
  )
)
MenuVertical.displayName = "MenuVertical"

export const MenuCompact = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Menu ref={ref} variant="compact" className={className} {...props} />
  )
)
MenuCompact.displayName = "MenuCompact"

export { Menu, MenuItem, MenuSeparator, MenuLabel } 