"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

interface DrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  side?: "left" | "right" | "top" | "bottom"
  size?: "sm" | "md" | "lg" | "xl" | "full"
  showBackdrop?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    className,
    side = "right",
    size = "md",
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
        setIsAnimating(true)
        // 애니메이션 시작을 위한 지연
        const timer = setTimeout(() => setIsAnimating(false), 50)
        return () => clearTimeout(timer)
      } else {
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setIsVisible(false)
          setIsAnimating(false)
        }, 300) // 애니메이션 완료 후 숨김
        return () => clearTimeout(timer)
      }
    }, [open])

    React.useEffect(() => {
      if (!closeOnEscape) return

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open) {
          onOpenChange(false)
        }
      }

      if (open) {
        document.addEventListener("keydown", handleEscape)
        document.body.style.overflow = "hidden"
      }

      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = ""
      }
    }, [open, closeOnEscape, onOpenChange])

    if (!isVisible) return null

    const sizeClasses = {
      sm: side === "left" || side === "right" ? "w-80" : "h-64",
      md: side === "left" || side === "right" ? "w-96" : "h-96",
      lg: side === "left" || side === "right" ? "w-[28rem]" : "h-[32rem]",
      xl: side === "left" || side === "right" ? "w-[32rem]" : "h-[40rem]",
      full: side === "left" || side === "right" ? "w-full" : "h-full"
    }

    const sideClasses = {
      left: "left-0 top-0 h-full translate-x-0",
      right: "right-0 top-0 h-full translate-x-0",
      top: "top-0 left-0 w-full translate-y-0",
      bottom: "bottom-0 left-0 w-full translate-y-0"
    }

    const transformClasses = {
      left: isAnimating ? (open ? "translate-x-0" : "-translate-x-full") : "",
      right: isAnimating ? (open ? "translate-x-0" : "translate-x-full") : "",
      top: isAnimating ? (open ? "translate-y-0" : "-translate-y-full") : "",
      bottom: isAnimating ? (open ? "translate-y-0" : "translate-y-full") : ""
    }

    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        {showBackdrop && (
          <div
            className={cn(
              "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
              isAnimating ? (open ? "opacity-100" : "opacity-0") : ""
            )}
            onClick={closeOnBackdropClick ? () => onOpenChange(false) : undefined}
          />
        )}

        {/* Drawer Content */}
        <div
          ref={ref}
          className={cn(
            "absolute bg-white/95 dark:!bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:!border-gray-600/50 shadow-2xl transition-transform duration-300 ease-out",
            sizeClasses[size],
            sideClasses[side],
            transformClasses[side],
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Drawer.displayName = "Drawer"

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ children, className, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50", className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
    )
  }
)
DrawerHeader.displayName = "DrawerHeader"

interface DrawerContentProps {
  children: React.ReactNode
  className?: string
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 p-6 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerContent.displayName = "DrawerContent"

interface DrawerFooterProps {
  children: React.ReactNode
  className?: string
}

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-end gap-3 p-6 border-t border-gray-200/50 dark:border-gray-700/50", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
DrawerFooter.displayName = "DrawerFooter"

export { Drawer, DrawerHeader, DrawerContent, DrawerFooter } 