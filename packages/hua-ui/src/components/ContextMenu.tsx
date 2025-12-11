"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * ContextMenu 컴포넌트의 props / ContextMenu component props
 * @typedef {Object} ContextMenuProps
 * @property {React.ReactNode} children - ContextMenu 내용 / ContextMenu content
 * @property {boolean} [open] - 제어 모드에서 열림/닫힘 상태 / Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - 상태 변경 콜백 / State change callback
 * @property {React.ReactNode} [trigger] - ContextMenu를 열기 위한 트리거 요소 (우클릭 이벤트) / Trigger element to open context menu (right-click event)
 * @property {"top" | "bottom" | "left" | "right"} [placement="bottom"] - ContextMenu 표시 위치 / ContextMenu display position
 * @property {"start" | "center" | "end"} [align="start"] - ContextMenu 정렬 / ContextMenu alignment
 * @property {number} [offset=8] - 트리거와 ContextMenu 사이 간격 (px) / Spacing between trigger and context menu (px)
 * @property {boolean} [disabled=false] - ContextMenu 비활성화 여부 / Disable context menu
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  placement?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  offset?: number
  disabled?: boolean
}

/**
 * ContextMenu 컴포넌트 / ContextMenu component
 * 
 * 우클릭 시 표시되는 컨텍스트 메뉴 컴포넌트입니다.
 * 트리거 요소에 우클릭 이벤트를 자동으로 연결합니다.
 * 
 * Context menu component that appears on right-click.
 * Automatically connects right-click events to the trigger element.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ContextMenu trigger={<div>우클릭하세요</div>}>
 *   <div className="p-2">
 *     <button>항목 1</button>
 *     <button>항목 2</button>
 *   </div>
 * </ContextMenu>
 * 
 * @example
 * // 제어 모드 / Controlled mode
 * const [open, setOpen] = useState(false)
 * <ContextMenu 
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={<div>우클릭</div>}
 * >
 *   <Menu>
 *     <MenuItem>복사</MenuItem>
 *     <MenuItem>삭제</MenuItem>
 *   </Menu>
 * </ContextMenu>
 * 
 * @param {ContextMenuProps} props - ContextMenu 컴포넌트의 props / ContextMenu component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ContextMenu 컴포넌트 / ContextMenu component
 */
const ContextMenu = React.forwardRef<HTMLDivElement, ContextMenuProps>(
  ({ 
    className, 
    children,
    open: controlledOpen,
    onOpenChange,
    trigger,
    placement = "bottom",
    align = "start",
    offset = 8,
    disabled = false,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [coords, setCoords] = React.useState({ x: 0, y: 0 })
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const menuRef = React.useRef<HTMLDivElement>(null)
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = (newOpen: boolean) => {
      if (disabled) return
      
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }

    const handleContextMenu = (event: React.MouseEvent) => {
      event.preventDefault()
      if (disabled) return

      const rect = event.currentTarget.getBoundingClientRect()
      const x = event.clientX
      const y = event.clientY

      setCoords({ x, y })
      handleOpenChange(true)
    }

    const updatePosition = React.useCallback(() => {
      if (!menuRef.current) return

      const menuRect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = coords.x
      let y = coords.y

      // 뷰포트 경계 확인 및 조정
      if (x + menuRect.width > viewportWidth - 8) {
        x = viewportWidth - menuRect.width - 8 // 8px 여백
      }
      if (y + menuRect.height > viewportHeight - 8) {
        y = viewportHeight - menuRect.height - 8 // 8px 여백
      }
      if (x < 8) x = 8 // 8px 여백
      if (y < 8) y = 8 // 8px 여백

      setCoords({ x, y })
    }, [coords.x, coords.y])

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
          menuRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          !menuRef.current.contains(event.target as Node)
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

    return (
      <div ref={ref} className={merge("relative", className)} {...props}>
        {/* 트리거 */}
        {trigger && (
          <div
            ref={triggerRef}
            onContextMenu={handleContextMenu}
            className="inline-block"
          >
            {trigger}
          </div>
        )}

        {/* 컨텍스트 메뉴 */}
        {isOpen && (
          <div
            ref={menuRef}
            className={merge(
              "fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl backdrop-blur-sm", // 보더 대신 섀도우 사용
              "min-w-[200px] py-2", // 16px 패딩
              "border-0" // 보더 제거
            )}
            style={{
              left: coords.x,
              top: coords.y,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}
          >
            {children}
          </div>
        )}
      </div>
    )
  }
)
ContextMenu.displayName = "ContextMenu"

export interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  variant?: "default" | "destructive" | "disabled"
}

const ContextMenuItem = React.forwardRef<HTMLButtonElement, ContextMenuItemProps>(
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
        className={merge(
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
ContextMenuItem.displayName = "ContextMenuItem"

export interface ContextMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuSeparator = React.forwardRef<HTMLDivElement, ContextMenuSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("h-px bg-gray-200 dark:bg-gray-700 my-2", className)} // 8px 여백
      {...props}
    />
  )
)
ContextMenuSeparator.displayName = "ContextMenuSeparator"

export interface ContextMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

const ContextMenuLabel = React.forwardRef<HTMLDivElement, ContextMenuLabelProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide", className)} // 16px, 8px 패딩
      {...props}
    >
      {children}
    </div>
  )
)
ContextMenuLabel.displayName = "ContextMenuLabel"

// 편의 컴포넌트들
const ContextMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("py-1", className)} // 4px 패딩
      {...props}
    >
      {children}
    </div>
  )
)
ContextMenuGroup.displayName = "ContextMenuGroup"

export { ContextMenu, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuGroup } 