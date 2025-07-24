"use client"

import * as React from "react"
import { cn } from "../lib/utils"
import { Icon } from "./Icon"

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  className?: string
  height?: "sm" | "md" | "lg" | "xl" | "full"
  showBackdrop?: boolean
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showDragHandle?: boolean
  snapPoints?: number[]
  defaultSnap?: number
}

const BottomSheet = React.forwardRef<HTMLDivElement, BottomSheetProps>(
  ({ 
    open, 
    onOpenChange, 
    children, 
    className,
    height = "md",
    showBackdrop = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    showDragHandle = true,
    snapPoints = [25, 50, 75, 100],
    defaultSnap = 50,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isAnimating, setIsAnimating] = React.useState(false)
    const [currentHeight, setCurrentHeight] = React.useState(defaultSnap)
    const [isDragging, setIsDragging] = React.useState(false)
    const [startY, setStartY] = React.useState(0)
    const [currentY, setCurrentY] = React.useState(0)

    const heightClasses = {
      sm: "h-64",
      md: "h-96",
      lg: "h-[32rem]",
      xl: "h-[40rem]",
      full: "h-full"
    }

    React.useEffect(() => {
      if (open) {
        setIsVisible(true)
        setIsAnimating(true)
        const timer = setTimeout(() => setIsAnimating(false), 50)
        return () => clearTimeout(timer)
      } else {
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setIsVisible(false)
          setIsAnimating(false)
        }, 300)
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

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true)
      setStartY(e.touches[0].clientY)
      setCurrentY(e.touches[0].clientY)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return
      setCurrentY(e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      if (!isDragging) return
      setIsDragging(false)

      const deltaY = currentY - startY
      const threshold = 100

      if (deltaY > threshold) {
        // 아래로 드래그 - 닫기
        onOpenChange(false)
      } else if (deltaY < -threshold) {
        // 위로 드래그 - 다음 스냅 포인트
        const currentIndex = snapPoints.indexOf(currentHeight)
        const nextIndex = Math.min(currentIndex + 1, snapPoints.length - 1)
        setCurrentHeight(snapPoints[nextIndex])
      }
    }

    if (!isVisible) return null

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

        {/* Bottom Sheet */}
        <div
          ref={ref}
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white/95 dark:!bg-gray-800/95 backdrop-blur-xl border-t border-gray-200/50 dark:!border-gray-600/50 shadow-2xl rounded-t-2xl transition-transform duration-300 ease-out",
            heightClasses[height],
            isAnimating ? (open ? "translate-y-0" : "translate-y-full") : "",
            className
          )}
          style={{
            height: `${currentHeight}%`,
            transform: isDragging ? `translateY(${currentY - startY}px)` : undefined
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          {...props}
        >
          {/* Drag Handle */}
          {showDragHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          )}

          {children}
        </div>
      </div>
    )
  }
)
BottomSheet.displayName = "BottomSheet"

interface BottomSheetHeaderProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

const BottomSheetHeader = React.forwardRef<HTMLDivElement, BottomSheetHeaderProps>(
  ({ children, className, showCloseButton = true, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between px-6 py-4", className)}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {showCloseButton && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        )}
      </div>
    )
  }
)
BottomSheetHeader.displayName = "BottomSheetHeader"

interface BottomSheetContentProps {
  children: React.ReactNode
  className?: string
}

const BottomSheetContent = React.forwardRef<HTMLDivElement, BottomSheetContentProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex-1 px-6 pb-6 overflow-y-auto", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
BottomSheetContent.displayName = "BottomSheetContent"

export { BottomSheet, BottomSheetHeader, BottomSheetContent } 