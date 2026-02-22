"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Dropdown 컴포넌트의 props / Dropdown component props
 * @typedef {Object} DropdownProps
 * @property {React.ReactNode} trigger - Dropdown을 열기 위한 트리거 요소 / Trigger element to open dropdown
 * @property {React.ReactNode} children - Dropdown 내용 / Dropdown content
 * @property {boolean} [open] - 제어 모드에서 열림/닫힘 상태 / Open/close state in controlled mode
 * @property {(open: boolean) => void} [onOpenChange] - 상태 변경 콜백 / State change callback
 * @property {"top" | "bottom" | "left" | "right"} [placement="bottom"] - Dropdown 표시 위치 / Dropdown display position
 * @property {"start" | "center" | "end"} [align="start"] - Dropdown 정렬 / Dropdown alignment
 * @property {number} [offset=8] - 트리거와 Dropdown 사이 간격 (px) / Spacing between trigger and dropdown (px)
 * @property {boolean} [disabled=false] - Dropdown 비활성화 여부 / Disable dropdown
 * @property {boolean} [showArrow=false] - 화살표 표시 여부 / Show arrow
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
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

/**
 * Dropdown 컴포넌트 / Dropdown component
 * 
 * 트리거 요소를 클릭하면 표시되는 드롭다운 메뉴 컴포넌트입니다.
 * 외부 클릭 시 자동으로 닫히며, 뷰포트 경계를 자동으로 감지하여 위치를 조정합니다.
 * 
 * Dropdown menu component that appears when the trigger element is clicked.
 * Automatically closes on outside click and adjusts position by detecting viewport boundaries.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Dropdown trigger={<Button>메뉴</Button>}>
 *   <Menu>
 *     <MenuItem>항목 1</MenuItem>
 *     <MenuItem>항목 2</MenuItem>
 *   </Menu>
 * </Dropdown>
 * 
 * @example
 * // 제어 모드, 화살표 없음 / Controlled mode, no arrow
 * const [open, setOpen] = useState(false)
 * <Dropdown 
 *   open={open}
 *   onOpenChange={setOpen}
 *   trigger={<Button>제어 모드</Button>}
 *   placement="top"
 *   showArrow={false}
 * >
 *   <div className="p-4">내용</div>
 * </Dropdown>
 * 
 * @param {DropdownProps} props - Dropdown 컴포넌트의 props / Dropdown component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Dropdown 컴포넌트 / Dropdown component
 */
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
    showArrow = false,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const dropdownRef = React.useRef<HTMLDivElement>(null)
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
    }, [isOpen, handleOpenChange])

    const getPlacementClasses = () => {
      switch (placement) {
        case "top":
          return "bottom-full left-0 mb-1"
        case "bottom":
          return "top-full left-0 mt-1"
        case "left":
          return "right-full top-0 mr-1"
        case "right":
          return "left-full top-0 ml-1"
        default:
          return "top-full left-0 mt-1"
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

        {/* 드롭다운 */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={merge(
              "absolute z-50 bg-[var(--dropdown-bg)] rounded-lg shadow-lg border border-border",
              "min-w-full w-max py-1",
              getPlacementClasses()
            )}
          >
            {children}
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
          return "text-destructive hover:bg-destructive/10"
        case "disabled":
          return "text-muted-foreground cursor-not-allowed"
        default:
          return "text-foreground hover:bg-muted"
      }
    }

    return (
      <button
        ref={ref}
        className={merge(
          "w-full flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:bg-muted",
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
      className={merge("h-px bg-border my-2", className)} // 8px 여백
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
      className={merge("px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)} // 16px, 8px 패딩
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
      className={merge("py-1", className)} // 4px 패딩
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
      className={merge("space-y-1", className)} // 4px 간격
      {...props}
    >
      {children}
    </div>
  )
)
DropdownGroup.displayName = "DropdownGroup"

export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup } 