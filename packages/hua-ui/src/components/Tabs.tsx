"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    className, 
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    variant = "default",
    size = "md",
    children,
    ...props 
  }, ref) => {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue || "")
    const isControlled = value !== undefined
    const currentValue = isControlled ? value : activeTab

    const handleTabChange = (newValue: string) => {
      if (!isControlled) {
        setActiveTab(newValue)
      }
      onValueChange?.(newValue)
    }

    React.useEffect(() => {
      if (value !== undefined) {
        setActiveTab(value)
      }
    }, [value])

    return (
      <div
        ref={ref}
        className={cn(
          "w-full",
          orientation === "vertical" && "flex",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value: currentValue,
              onValueChange: handleTabChange,
              orientation,
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
Tabs.displayName = "Tabs"

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ 
    className, 
    orientation = "horizontal",
    variant = "default",
    size = "md",
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "pills":
          return "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg" // 4px 패딩
        case "underline":
          return "border-b border-gray-200 dark:border-gray-700"
        case "cards":
          return "bg-gray-50 dark:bg-gray-900 p-1 rounded-lg" // 4px 패딩
        default:
          return "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg" // 4px 패딩
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8" // 32px 높이
        case "lg":
          return "h-12" // 48px 높이
        default:
          return "h-10" // 40px 높이
      }
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          orientation === "vertical" && "flex-col",
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              orientation,
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
TabsList.displayName = "TabsList"

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
  active?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ 
    className, 
    value,
    orientation = "horizontal",
    variant = "default",
    size = "md",
    active = false,
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "pills":
          return cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )
        case "underline":
          return cn(
            "inline-flex items-center justify-center whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "border-blue-500 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600"
          )
        case "cards":
          return cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )
        default:
          return cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-6 px-2 py-1 text-xs" // 24px 높이, 8px 패딩
        case "lg":
          return "h-10 px-4 py-2 text-base" // 40px 높이, 16px 패딩
        default:
          return "h-8 px-3 py-1.5 text-sm" // 32px 높이, 12px 패딩
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  active?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ 
    className, 
    value,
    active = false,
    children,
    ...props 
  }, ref) => {
    if (!active) return null

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2", // 8px 여백
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = "TabsContent"

// 편의 컴포넌트들
export const TabsPills = React.forwardRef<HTMLDivElement, Omit<TabsProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Tabs ref={ref} variant="pills" className={className} {...props} />
  )
)
TabsPills.displayName = "TabsPills"

export const TabsUnderline = React.forwardRef<HTMLDivElement, Omit<TabsProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Tabs ref={ref} variant="underline" className={className} {...props} />
  )
)
TabsUnderline.displayName = "TabsUnderline"

export const TabsCards = React.forwardRef<HTMLDivElement, Omit<TabsProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Tabs ref={ref} variant="cards" className={className} {...props} />
  )
)
TabsCards.displayName = "TabsCards"

export { Tabs, TabsList, TabsTrigger, TabsContent } 