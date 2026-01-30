"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Popover 컴포넌트의 props / Popover component props
 * @typedef {Object} PopoverProps
 * @property {React.ReactNode} children - Popover 내용 / Popover content
 * @property {React.ReactNode} trigger - Popover를 열기 위한 트리거 요소 / Trigger element to open popover
 * @property {boolean} [open] - 제어 모드에서 열림/닫힘 상태 / Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - 상태 변경 콜백 / State change callback
 * @property {"top" | "bottom" | "left" | "right"} [position="bottom"] - Popover 표시 위치 / Popover display position
 * @property {"start" | "center" | "end"} [align="center"] - Popover 정렬 / Popover alignment
 * @property {number} [offset=8] - 트리거와 Popover 사이 간격 (px) / Spacing between trigger and popover (px)
 * @property {boolean} [disabled=false] - Popover 비활성화 여부 / Disable popover
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface PopoverProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  offset?: number
  disabled?: boolean
  /** Popover 콘텐츠 영역 추가 클래스 / Additional class for popover content area */
  contentClassName?: string
}

/**
 * Popover 컴포넌트 / Popover component
 * 
 * 트리거 요소를 클릭하면 표시되는 팝오버 컴포넌트입니다.
 * 외부 클릭 시 자동으로 닫힙니다.
 * 
 * Popover component that appears when the trigger element is clicked.
 * Automatically closes when clicking outside.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Popover trigger={<Button>열기</Button>}>
 *   <div className="p-4">Popover 내용</div>
 * </Popover>
 * 
 * @example
 * // 제어 모드 / Controlled mode
 * const [open, setOpen] = useState(false)
 * <Popover 
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={<Button>제어 모드</Button>}
 *   position="top"
 * >
 *   <div className="p-4">내용</div>
 * </Popover>
 * 
 * @param {PopoverProps} props - Popover 컴포넌트의 props / Popover component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Popover 컴포넌트 / Popover component
 */
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
    contentClassName,
    ...props
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const popoverRef = React.useRef<HTMLDivElement>(null)
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (disabled) return

      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [disabled, isControlled, onOpenChange])

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
    }, [isOpen, handleOpenChange])

    const getPositionClasses = () => {
      const baseClasses = "absolute z-50"

      switch (position) {
        case "top":
          return merge(baseClasses, "bottom-full", `mb-${Math.max(1, Math.floor(offset / 4))}`)
        case "bottom":
          return merge(baseClasses, "top-full", `mt-${Math.max(1, Math.floor(offset / 4))}`)
        case "left":
          return merge(baseClasses, "right-full", `mr-${Math.max(1, Math.floor(offset / 4))}`)
        case "right":
          return merge(baseClasses, "left-full", `ml-${Math.max(1, Math.floor(offset / 4))}`)
        default:
          return merge(baseClasses, "top-full", `mt-${Math.max(1, Math.floor(offset / 4))}`)
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
      <div ref={ref} className={merge("relative", className)} {...props}>
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
            className={merge(
              "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-[200px]",
              getPositionClasses(),
              getAlignmentClasses(),
              contentClassName
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
      className={merge("inline-block cursor-pointer", className)}
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
      className={merge("bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
)
PopoverContent.displayName = "PopoverContent"

export { Popover } 