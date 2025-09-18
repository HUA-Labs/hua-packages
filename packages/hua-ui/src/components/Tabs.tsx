"use client"

import React from 'react'
import { merge } from '../lib/utils'

// TabsContent를 먼저 선언하여 타입 비교에 사용할 수 있도록 함
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  active?: boolean
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, active, children, ...props }, ref) => {
    // active prop이 명시적으로 false로 설정된 경우에만 숨김
    if (active === false) return null

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
            // TabsContent인 경우 active prop을 자동으로 설정
            if (child.type === TabsContent) {
              const childProps = child.props as { value: string }
              return React.cloneElement(child, {
                value: currentValue,
                onValueChange: handleTabChange,
                orientation,
                variant,
                size,
                active: childProps.value === currentValue
              } as any)
            }
            // 다른 컴포넌트들
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
    value,
    onValueChange,
    orientation = "horizontal",
    variant = "default",
    size = "md",
    children,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "pills":
          return "bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        case "underline":
          return "border-b border-gray-200 dark:border-gray-700"
        case "cards":
          return "bg-gray-50/80 dark:bg-gray-900/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
        default:
          return "bg-gray-50 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-200/50 dark:border-gray-700/50"
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-12"
        case "lg":
          return "h-16"
        default:
          return "h-14"
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
          "flex items-center justify-center",
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
              value,
              onValueChange,
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
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
        case "underline":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "border-blue-500 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          )
        case "cards":
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
        default:
          return merge(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            active 
              ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md" 
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
          )
      }
    }

    const getSizeClasses = () => {
      switch (size) {
        case "sm":
          return "h-10 px-4 py-2 text-xs"
        case "lg":
          return "h-14 px-6 py-3 text-base"
        default:
          return "h-12 px-5 py-2.5 text-sm"
      }
    }

    const handleClick = () => {
      console.log('TabsTrigger clicked:', value, 'onValueChange:', !!onValueChange)
      if (onValueChange) {
        onValueChange(value)
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
        onClick={handleClick}
        type="button"
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

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