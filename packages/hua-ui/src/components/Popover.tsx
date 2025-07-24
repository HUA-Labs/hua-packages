"use client"

import * as React from "react"
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
    const [coords, setCoords] = React.useState({ x: 0, y: 0 })
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

    const updatePosition = React.useCallback(() => {
      if (!triggerRef.current || !popoverRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const popoverRect = popoverRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = 0
      let y = 0

      // 기본 위치 계산
      switch (position) {
        case "top":
          x = triggerRect.left + triggerRect.width / 2
          y = triggerRect.top - offset
          break
        case "bottom":
          x = triggerRect.left + triggerRect.width / 2
          y = triggerRect.bottom + offset
          break
        case "left":
          x = triggerRect.left - offset
          y = triggerRect.top + triggerRect.height / 2
          break
        case "right":
          x = triggerRect.right + offset
          y = triggerRect.top + triggerRect.height / 2
          break
      }

      // 정렬 조정
      switch (align) {
        case "start":
          if (position === "top" || position === "bottom") {
            x = triggerRect.left
          } else {
            y = triggerRect.top
          }
          break
        case "end":
          if (position === "top" || position === "bottom") {
            x = triggerRect.right - popoverRect.width
          } else {
            y = triggerRect.bottom - popoverRect.height
          }
          break
        case "center":
        default:
          if (position === "top" || position === "bottom") {
            x = triggerRect.left + triggerRect.width / 2 - popoverRect.width / 2
          } else {
            y = triggerRect.top + triggerRect.height / 2 - popoverRect.height / 2
          }
          break
      }

      // 뷰포트 경계 확인 및 조정
      if (x < 0) x = 8 // 8px 여백
      if (x + popoverRect.width > viewportWidth) {
        x = viewportWidth - popoverRect.width - 8 // 8px 여백
      }
      if (y < 0) y = 8 // 8px 여백
      if (y + popoverRect.height > viewportHeight) {
        y = viewportHeight - popoverRect.height - 8 // 8px 여백
      }

      setCoords({ x, y })
    }, [position, align, offset])

    React.useEffect(() => {
      if (isOpen) {
        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition)
        
        return () => {
          window.removeEventListener('resize', updatePosition)
          window.removeEventListener('scroll', updatePosition)
        }
      }
    }, [isOpen, updatePosition])

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
      switch (position) {
        case "top":
          return "bottom-full left-0 mb-2" // 8px 간격
        case "bottom":
          return "top-full left-0 mt-2" // 8px 간격
        case "left":
          return "right-full top-0 mr-2" // 8px 간격
        case "right":
          return "left-full top-0 ml-2" // 8px 간격
        default:
          return "top-full left-0 mt-2"
      }
    }

    const getArrowClasses = () => {
      switch (position) {
        case "top":
          return "top-full left-1/2 -translate-x-1/2 border-t-gray-200 dark:border-t-gray-700"
        case "bottom":
          return "bottom-full left-1/2 -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700"
        case "left":
          return "left-full top-1/2 -translate-y-1/2 border-l-gray-200 dark:border-l-gray-700"
        case "right":
          return "right-full top-1/2 -translate-y-1/2 border-r-gray-200 dark:border-r-gray-700"
        default:
          return "bottom-full left-1/2 -translate-x-1/2 border-b-gray-200 dark:border-b-gray-700"
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
              "absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4", // 16px 패딩
              getPositionClasses()
            )}
            style={{
              transform: `translate(${coords.x}px, ${coords.y}px)`,
              minWidth: '200px'
            }}
          >
            {/* 화살표 */}
            <div
              className={cn(
                "absolute w-0 h-0 border-4 border-transparent",
                getArrowClasses()
              )}
            />
            
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