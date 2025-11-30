"use client"

import React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

interface AccordionProps {
  children: React.ReactNode
  className?: string
  type?: "single" | "multiple"
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    children, 
    className,
    type = "single",
    defaultValue,
    value,
    onValueChange,
    collapsible = false,
    ...props 
  }, ref) => {
    const [openItems, setOpenItems] = React.useState<string[]>(
      value ? (Array.isArray(value) ? value : [value]) : 
      defaultValue ? (Array.isArray(defaultValue) ? defaultValue : [defaultValue]) : []
    )

    React.useEffect(() => {
      if (value !== undefined) {
        setOpenItems(Array.isArray(value) ? value : [value])
      }
    }, [value])

    const handleItemToggle = (itemValue: string) => {
      let newOpenItems: string[]

      if (type === "single") {
        if (openItems.includes(itemValue)) {
          newOpenItems = collapsible ? [] : openItems
        } else {
          newOpenItems = [itemValue]
        }
      } else {
        if (openItems.includes(itemValue)) {
          newOpenItems = openItems.filter(item => item !== itemValue)
        } else {
          newOpenItems = [...openItems, itemValue]
        }
      }

      setOpenItems(newOpenItems)
      onValueChange?.(type === "single" ? newOpenItems[0] || "" : newOpenItems)
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              openItems,
              onToggle: handleItemToggle,
              ...(child.props as any)
            })
          }
          return child
        })}
      </div>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
  openItems?: string[]
  onToggle?: (value: string) => void
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ 
    value, 
    children, 
    className,
    disabled = false,
    openItems = [],
    onToggle,
    ...props 
  }, ref) => {
    const isOpen = openItems.includes(value)

    return (
      <div
        ref={ref}
        className={cn(
          "border border-gray-200/50 dark:border-gray-700/50 rounded-lg overflow-hidden",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              value,
              isOpen,
              disabled,
              onToggle: () => onToggle?.(value),
              ...(child.props as any)
            })
          }
          return child
        })}
      </div>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
  value?: string
  isOpen?: boolean
  disabled?: boolean
  onToggle?: () => void
}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ 
    children, 
    className,
    icon,
    iconPosition = "right",
    isOpen = false,
    disabled = false,
    onToggle,
    ...props 
  }, ref) => {
    const defaultIcon = (
      <Icon 
        name="chevronDown" 
        size={20} 
        className={cn(
          "transition-transform duration-300 ease-out text-gray-500 dark:text-gray-400",
          isOpen && "rotate-180"
        )} 
      />
    )

    return (
      <button
        ref={ref}
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          "flex w-full items-center justify-between px-6 py-4 text-left font-medium transition-all hover:bg-gray-50/80 dark:hover:bg-gray-800/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3 flex-1">
          {iconPosition === "left" && (icon || defaultIcon)}
          <span className="flex-1">{children}</span>
        </div>
        {iconPosition === "right" && (icon || defaultIcon)}
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
  isOpen?: boolean
}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, isOpen = false, ...props }, ref) => {
    const [height, setHeight] = React.useState(0)
    const contentRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      if (contentRef.current) {
        if (isOpen) {
          setHeight(contentRef.current.scrollHeight)
        } else {
          setHeight(0)
        }
      }
    }, [isOpen, children])

    return (
      <div
        ref={ref}
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ height: `${height}px` }}
        {...props}
      >
        <div
          ref={contentRef}
          className={cn("px-6 pt-2 pb-4", className)}
        >
          {children}
        </div>
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } 