"use client"

import * as React from "react"
import { cn } from "../lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal" | "both"
  scrollHideDelay?: number
  type?: "auto" | "always" | "scroll" | "hover"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ 
    children, 
    className, 
    orientation = "vertical",
    scrollHideDelay = 600,
    type = "hover",
    ...props 
  }, ref) => {
    const [showScrollbar, setShowScrollbar] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const handleMouseEnter = () => {
      if (type === "hover" || type === "always") {
        setShowScrollbar(true)
      }
    }

    const handleMouseLeave = () => {
      if (type === "hover") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setShowScrollbar(false)
        }, scrollHideDelay)
      }
    }

    React.useEffect(() => {
      if (type === "always") {
        setShowScrollbar(true)
      }
    }, [type])

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-auto scrollbar-thin",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          showScrollbar ? "scrollbar-visible" : "scrollbar-hidden",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

interface ScrollBarProps {
  orientation?: "vertical" | "horizontal"
  className?: string
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ orientation = "vertical", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex touch-none select-none transition-colors duration-150 ease-out",
          orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
          orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar } 