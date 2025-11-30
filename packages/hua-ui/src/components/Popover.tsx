"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  offset?: number
  disabled?: boolean
}

const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ 
    className, 
    children,
    trigger,
    open: controlledOpen,
    onOpenChange,
    position = "bottom",
    align = "center",
    offset = 8,
    disabled = false,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const popoverRef = React.useRef<HTMLDivElement>(null)
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = (newOpen: boolean) => {
      if (disabled) return
      
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }

    const handleTriggerClick = () => {
      handleOpenChange(!isOpen)
    }

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current && 
          popoverRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          !popoverRef.current.contains(event.target as Node)
        ) {
          handleOpenChange(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          document.removeEventListener('mousedown', handleClickOutside)
        }
      }
    }, [isOpen])

    const getPositionClasses = () => {
      const baseClasses = "absolute z-50"
      
      switch (position) {
        case "top":
          return cn(baseClasses, "bottom-full left-0", `mb-${Math.max(1, Math.floor(offset / 4))}`)
        case "bottom":
          return cn(baseClasses, "top-full left-0", `mt-${Math.max(1, Math.floor(offset / 4))}`)
        case "left":
          return cn(baseClasses, "right-full top-0", `mr-${Math.max(1, Math.floor(offset / 4))}`)
        case "right":
          return cn(baseClasses, "left-full top-0", `ml-${Math.max(1, Math.floor(offset / 4))}`)
        default:
          return cn(baseClasses, "top-full left-0", `mt-${Math.max(1, Math.floor(offset / 4))}`)
      }
    }

    const getAlignmentClasses = () => {
      switch (align) {
        case "start":
          if (position === "top" || position === "bottom") {
            return "left-0"
          } else {
            return "top-0"
          }
        case "end":
          if (position === "top" || position === "bottom") {
            return "right-0"
          } else {
            return "bottom-0"
          }
        case "center":
        default:
          if (position === "top" || position === "bottom") {
            return "left-1/2 -translate-x-1/2"
          } else {
            return "top-1/2 -translate-y-1/2"
          }
      }
    }

    const getArrowClasses = () => {
      const baseClasses = "absolute w-0 h-0 border-4 border-transparent"
      
      switch (position) {
        case "top":
          return `${baseClasses} top-full left-1/2 -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700`
        case "bottom":
          return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700`
        case "left":
          return `${baseClasses} left-full top-1/2 -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700`
        case "right":
          return `${baseClasses} right-full top-1/2 -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700`
        default:
          return `${baseClasses} bottom-full left-1/2 -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700`
      }
    }

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* 트리거 */}
        <div
          ref={triggerRef}
          onClick={handleTriggerClick}
          className="inline-block cursor-pointer"
        >
          {trigger}
        </div>

        {/* 팝오버 */}
        {isOpen && (
          <div
            ref={popoverRef}
            className={cn(
              "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px]",
              getPositionClasses(),
              getAlignmentClasses()
            )}
          >
            {/* 화살표 */}
            <div className={getArrowClasses()} />
            
            {/* 내용 */}
            <div className="relative z-10">
              {children}
            </div>
          </div>
        )}
      </div>
    )
  }
)
Popover.displayName = "Popover"

// 편의 컴포넌트들
export const PopoverTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-block cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PopoverTrigger.displayName = "PopoverTrigger"

export const PopoverContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PopoverContent.displayName = "PopoverContent"

export { Popover } 