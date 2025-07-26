"use client"

import * as React from "react"
import { merge } from "../lib/utils"

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
        className={merge(
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
          return "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
        case "underline":
          return "border-b border-gray-200 dark:border-gray-700"
        case "cards":
          return "bg-gray-50 dark:bg-gray-900 p-1 rounded-lg"
        default:
          return "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg"
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8"
        case "lg":
          return "h-12"
        default:
          return "h-10"
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
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
  onValueChange?: (value: string) => void
  orientation?: "horizontal" | "vertical"
  variant?: "default" | "pills" | "underline" | "cards"
  size?: "sm" | "md" | "lg"
  active?: boolean
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ 
    className, 
    value,
    onValueChange,
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
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
          )
        case "underline":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap border-b-2 px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          )
        case "cards":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
          )
        default:
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-8 px-2 py-1 text-xs"
        case "lg":
          return "h-12 px-4 py-2 text-base"
        default:
          return "h-10 px-3 py-1.5 text-sm"
      }
    }

    return (
      <button
        ref={ref}
        className={merge(
          getVariantClasses(),
          getSizeClasses(),
          className
        )}
        onClick={() => onValueChange?.(value)}
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
  ({ className, value, active = false, children, ...props }, ref) => {
    if (!active) return null

    return (
      <div
        ref={ref}
        className={merge(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
const TabsPills = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="pills" {...props} />
)
TabsPills.displayName = "TabsPills"

const TabsUnderline = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="underline" {...props} />
)
TabsUnderline.displayName = "TabsUnderline"

const TabsCards = React.forwardRef<HTMLDivElement, TabsProps>(
  (props, ref) => <Tabs ref={ref} variant="cards" {...props} />
)
TabsCards.displayName = "TabsCards"

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsPills, TabsUnderline, TabsCards } 