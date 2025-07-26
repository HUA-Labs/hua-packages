"use client"

import React from "react"
import { merge } from "../lib/utils"

export interface NavigationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  style?: "pills" | "underline" | "cards"
  scale?: "small" | "medium" | "large"
}

const Navigation = React.forwardRef<HTMLDivElement, NavigationProps>(
  ({ 
    className, 
    value,
    defaultValue,
    onValueChange,
    style = "pills",
    scale = "medium",
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
                      className
                    )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              value: currentValue,
              onValueChange: handleTabChange,
              style,
              scale
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
Navigation.displayName = "Navigation"

export interface NavigationListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  value?: string
  onValueChange?: (value: string) => void
  style?: "pills" | "underline" | "cards"
  scale?: "small" | "medium" | "large"
}

const NavigationList = React.forwardRef<HTMLDivElement, NavigationListProps>(
  ({ 
    className, 
    style = "pills",
    scale = "medium",
    children,
    ...props 
  }, ref) => {
    const getStyleClasses = () => {
      switch (style) {
        case "pills":
          return "bg-slate-100 dark:bg-slate-800 p-1 rounded-xl"
        case "underline":
          return "border-b border-slate-200 dark:border-slate-700"
        case "cards":
          return "bg-slate-50 dark:bg-slate-900 p-1 rounded-xl"
        default:
          return "bg-slate-100 dark:bg-slate-800 p-1 rounded-xl"
      }
    }

    const getScaleClasses = () => {
      switch (scale) {
        case "small":
          return "gap-1"
        case "large":
          return "gap-3"
        default:
          return "gap-2"
      }
    }

    return (
      <div
        ref={ref}
        className={merge(
          "flex",
          getStyleClasses(),
          getScaleClasses(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
NavigationList.displayName = "NavigationList"

export interface NavigationItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  value: string
  onValueChange?: (value: string) => void
  style?: "pills" | "underline" | "cards"
  scale?: "small" | "medium" | "large"
  active?: boolean
}

const NavigationItem = React.forwardRef<HTMLButtonElement, NavigationItemProps>(
  ({ 
    className, 
    value,
    onValueChange,
    style = "pills",
    scale = "medium",
    active = false,
    children,
    ...props 
  }, ref) => {
    const getStyleClasses = () => {
      switch (style) {
        case "pills":
          return merge(
            "rounded-lg px-3 py-2 text-sm font-medium transition-all",
            active 
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )
        case "underline":
          return merge(
            "border-b-2 px-3 py-2 text-sm font-medium transition-all",
            active 
              ? "border-blue-500 text-blue-600 dark:text-blue-400" 
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )
        case "cards":
          return merge(
            "rounded-lg px-3 py-2 text-sm font-medium transition-all",
            active 
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )
        default:
          return merge(
            "rounded-lg px-3 py-2 text-sm font-medium transition-all",
            active 
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm" 
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          )
      }
    }

    const getScaleClasses = () => {
      switch (scale) {
        case "small":
          return "text-xs px-2 py-1"
        case "large":
          return "text-base px-4 py-3"
        default:
          return "text-sm px-3 py-2"
      }
    }

    const handleClick = () => {
      onValueChange?.(value)
    }

    return (
      <button
        ref={ref}
        className={merge(
          getStyleClasses(),
          getScaleClasses(),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
NavigationItem.displayName = "NavigationItem"

export interface NavigationContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  active?: boolean
}

const NavigationContent = React.forwardRef<HTMLDivElement, NavigationContentProps>(
  ({ className, active = false, ...props }, ref) => {
    if (!active) return null

    return (
      <div
        ref={ref}
        className={merge("mt-4", className)}
        {...props}
      />
    )
  }
)
NavigationContent.displayName = "NavigationContent"

// 서브컴포넌트 타입 정의
export interface NavigationComponent extends React.ForwardRefExoticComponent<NavigationProps & React.RefAttributes<HTMLDivElement>> {
  List: typeof NavigationList
  Item: typeof NavigationItem
  Content: typeof NavigationContent
}

const NavigationComponent = Navigation as NavigationComponent
NavigationComponent.List = NavigationList
NavigationComponent.Item = NavigationItem
NavigationComponent.Content = NavigationContent

export { NavigationComponent as Navigation, NavigationList, NavigationItem, NavigationContent } 