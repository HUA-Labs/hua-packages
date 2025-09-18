"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger: React.ReactNode
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  offset?: number
  disabled?: boolean
  showArrow?: boolean
}

const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ 
    className, 
    trigger,
    children,
    open: controlledOpen,
    onOpenChange,
    placement = "bottom",
    align = "start",
    offset = 8,
    disabled = false,
    showArrow = true,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [coords, setCoords] = React.useState({ x: 0, y: 0 })
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
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
      if (!triggerRef.current || !dropdownRef.current) return

      const triggerRect = triggerRef.current.getBoundingClientRect()
      const dropdownRect = dropdownRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = 0
      let y = 0

      // 기본 위치 계산
      switch (placement) {
        case "top":
          x = triggerRect.left
          y = triggerRect.top - offset
          break
        case "bottom":
          x = triggerRect.left
          y = triggerRect.bottom + offset
          break
        case "left":
          x = triggerRect.left - offset
          y = triggerRect.top
          break
        case "right":
          x = triggerRect.right + offset
          y = triggerRect.top
          break
      }

      // 정렬 조정
      switch (align) {
        case "center":
          if (placement === "top" || placement === "bottom") {
            x = triggerRect.left + triggerRect.width / 2 - dropdownRect.width / 2
          } else {
            y = triggerRect.top + triggerRect.height / 2 - dropdownRect.height / 2
          }
          break
        case "end":
          if (placement === "top" || placement === "bottom") {
            x = triggerRect.right - dropdownRect.width
          } else {
            y = triggerRect.bottom - dropdownRect.height
          }
          break
        case "start":
        default:
          // 기본값은 이미 start 정렬
          break
      }

      // 뷰포트 경계 확인 및 조정
      if (x < 8) x = 8 // 8px 여백
      if (x + dropdownRect.width > viewportWidth - 8) {
        x = viewportWidth - dropdownRect.width - 8 // 8px 여백
      }
      if (y < 8) y = 8 // 8px 여백
      if (y + dropdownRect.height > viewportHeight - 8) {
        y = viewportHeight - dropdownRect.height - 8 // 8px 여백
      }

      setCoords({ x, y })
    }, [placement, align, offset])

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
          dropdownRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          !dropdownRef.current.contains(event.target as Node)
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

    const getPlacementClasses = () => {
      switch (placement) {
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
      switch (placement) {
        case "top":
          return "top-full left-4 -translate-x-1/2 border-t-gray-100 dark:border-t-gray-800"
        case "bottom":
          return "bottom-full left-4 -translate-x-1/2 border-b-gray-100 dark:border-b-gray-800"
        case "left":
          return "left-full top-4 -translate-y-1/2 border-l-gray-100 dark:border-l-gray-800"
        case "right":
          return "right-full top-4 -translate-y-1/2 border-r-gray-100 dark:border-r-gray-800"
        default:
          return "bottom-full left-4 -translate-x-1/2 border-b-gray-100 dark:border-b-gray-800"
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

        {/* 드롭다운 */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl backdrop-blur-sm", // 보더 대신 섀도우 사용
              "min-w-[200px] py-2", // 16px 패딩
              getPlacementClasses()
            )}
            style={{
              transform: `translate(${coords.x}px, ${coords.y}px)`,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            {/* 화살표 */}
            {showArrow && (
              <div
                className={cn(
                  "absolute w-0 h-0 border-4 border-transparent",
                  getArrowClasses()
                )}
              />
            )}
            
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
Dropdown.displayName = "Dropdown"

// 드롭다운 아이템 컴포넌트들
export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "disabled"
}

const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ 
    className, 
    icon,
    variant = "default",
    children,
    disabled,
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "destructive":
          return "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        case "disabled":
          return "text-gray-400 dark:text-gray-500 cursor-not-allowed"
        default:
          return "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }
    }

    return (
      <button
        ref={ref}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700", // 16px, 12px 패딩
          getVariantClasses(),
          className
        )}
        disabled={disabled || variant === "disabled"}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 w-4 h-4">
            {icon}
          </div>
        )}
        <span className="flex-1 text-left">{children}</span>
      </button>
    )
  }
)
DropdownItem.displayName = "DropdownItem"

export interface DropdownSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownSeparator = React.forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px bg-gray-200 dark:bg-gray-700 my-2", className)} // 8px 여백
      {...props}
    />
  )
)
DropdownSeparator.displayName = "DropdownSeparator"

export interface DropdownLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownLabel = React.forwardRef<HTMLDivElement, DropdownLabelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide", className)} // 16px, 8px 패딩
      {...props}
    >
      {children}
    </div>
  )
)
DropdownLabel.displayName = "DropdownLabel"

// 편의 컴포넌트들
const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("py-1", className)} // 4px 패딩
      {...props}
    >
      {children}
    </div>
  )
)
DropdownMenu.displayName = "DropdownMenu"

const DropdownGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-1", className)} // 4px 간격
      {...props}
    >
      {children}
    </div>
  )
)
DropdownGroup.displayName = "DropdownGroup"

export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup } 