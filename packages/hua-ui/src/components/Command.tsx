"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placeholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  disabled?: boolean
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ 
    className, 
    children,
    open: controlledOpen,
    onOpenChange,
    placeholder = "명령어를 검색하세요...",
    searchValue: controlledSearchValue,
    onSearchChange,
    disabled = false,
    ...props 
  }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false)
    const [internalSearchValue, setInternalSearchValue] = React.useState("")
    const [selectedIndex, setSelectedIndex] = React.useState(0)
    const commandRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const listRef = React.useRef<HTMLDivElement>(null)
    
    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen
    const searchValue = controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue

    const handleOpenChange = (newOpen: boolean) => {
      if (disabled) return
      
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }

    const handleSearchChange = (value: string) => {
      if (!isControlled) {
        setInternalSearchValue(value)
      }
      onSearchChange?.(value)
      setSelectedIndex(0)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return

      const items = listRef.current?.querySelectorAll('[data-command-item]')
      const itemCount = items?.length || 0

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setSelectedIndex((prev) => (prev + 1) % itemCount)
          break
        case 'ArrowUp':
          event.preventDefault()
          setSelectedIndex((prev) => (prev - 1 + itemCount) % itemCount)
          break
        case 'Enter':
          event.preventDefault()
          const selectedItem = items?.[selectedIndex] as HTMLElement
          selectedItem?.click()
          break
        case 'Escape':
          event.preventDefault()
          handleOpenChange(false)
          break
      }
    }

    React.useEffect(() => {
      if (isOpen) {
        inputRef.current?.focus()
        setSelectedIndex(0)
      }
    }, [isOpen])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          handleOpenChange(!isOpen)
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen])

    React.useEffect(() => {
      const selectedItem = listRef.current?.querySelector(`[data-command-item]:nth-child(${selectedIndex + 1})`) as HTMLElement
      selectedItem?.scrollIntoView({ block: 'nearest' })
    }, [selectedIndex])

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {isOpen && (
          <div
            ref={commandRef}
            className={cn(
              "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm", // 50% 투명도
              "flex items-start justify-center pt-16" // 64px 상단 여백
            )}
            onClick={() => handleOpenChange(false)}
          >
            <div
              className={cn(
                "w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl", // 보더 대신 섀도우
                "border-0 overflow-hidden" // 보더 제거
              )}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
              }}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700"> {/* 16px 패딩 */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={placeholder}
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "w-full bg-transparent text-lg font-medium outline-none", // 18px 텍스트
                    "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                    "text-gray-900 dark:text-gray-100"
                  )}
                />
              </div>
              
              <div
                ref={listRef}
                className="max-h-96 overflow-y-auto py-2" // 384px 최대 높이, 8px 패딩
              >
                {React.Children.map(children, (child, index) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      selected: index === selectedIndex,
                      onSelect: () => {
                        (child.props as any)?.onSelect?.()
                        handleOpenChange(false)
                      }
                    } as any)
                  }
                  return child
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
)
Command.displayName = "Command"

export interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none", // 40px 높이, 12px, 8px 패딩
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
CommandInput.displayName = "CommandInput"

export interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("max-h-96 overflow-y-auto py-2", className)} // 384px 최대 높이, 8px 패딩
      {...props}
    />
  )
)
CommandList.displayName = "CommandList"

export interface CommandItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  selected?: boolean
  onSelect?: () => void
}

const CommandItem = React.forwardRef<HTMLButtonElement, CommandItemProps>(
  ({ 
    className, 
    icon,
    selected = false,
    onSelect,
    children,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        data-command-item
        className={cn(
          "relative flex w-full items-center gap-3 rounded-sm px-4 py-3 text-sm", // 16px, 12px 패딩
          "text-gray-700 dark:text-gray-300",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          "focus:bg-gray-100 dark:focus:bg-gray-700",
          "focus:outline-none",
          selected && "bg-gray-100 dark:bg-gray-700",
          "transition-colors",
          className
        )}
        onClick={onSelect}
        {...props}
      >
        {icon && (
          <div className="flex-shrink-0 w-4 h-4 text-gray-500 dark:text-gray-400">
            {icon}
          </div>
        )}
        <span className="flex-1 text-left">{children}</span>
      </button>
    )
  }
)
CommandItem.displayName = "CommandItem"

export interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  heading?: React.ReactNode
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div ref={ref} className={cn("py-2", className)} {...props}> {/* 8px 패딩 */}
      {heading && (
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"> {/* 16px, 8px 패딩 */}
          {heading}
        </div>
      )}
      <div className="space-y-1"> {/* 4px 간격 */}
        {children}
      </div>
    </div>
  )
)
CommandGroup.displayName = "CommandGroup"

export interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("h-px bg-gray-200 dark:bg-gray-700 my-2", className)} // 8px 여백
      {...props}
    />
  )
)
CommandSeparator.displayName = "CommandSeparator"

export interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
  ({ className, children = "결과가 없습니다.", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "py-8 text-center text-sm text-gray-500 dark:text-gray-400", // 32px 패딩
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
CommandEmpty.displayName = "CommandEmpty"

// 편의 컴포넌트들
export const CommandDialog = React.forwardRef<HTMLDivElement, CommandProps>(
  ({ className, ...props }, ref) => (
    <Command ref={ref} className={className} {...props} />
  )
)
CommandDialog.displayName = "CommandDialog"

export { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator, CommandEmpty } 