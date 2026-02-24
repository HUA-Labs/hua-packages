"use client"

import React from "react"
import {
  useFloating,
  autoUpdate,
  offset as offsetMiddleware,
  flip,
  shift,
  arrow as arrowMiddleware,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingArrow,
  type Placement,
} from "@floating-ui/react"
import { merge } from "../lib/utils"

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

function resolveFloatingPlacement(
  placement: "top" | "bottom" | "left" | "right",
  align: "start" | "center" | "end"
): Placement {
  if (align === "center") return placement
  return `${placement}-${align}`
}

const ARROW_SIZE = 8

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
    const arrowRef = React.useRef<SVGSVGElement>(null)

    const isControlled = controlledOpen !== undefined
    const isOpen = isControlled ? controlledOpen : internalOpen

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      if (disabled && newOpen) return
      if (!isControlled) {
        setInternalOpen(newOpen)
      }
      onOpenChange?.(newOpen)
    }, [disabled, isControlled, onOpenChange])

    const floatingPlacement = resolveFloatingPlacement(placement, align)

    const middleware = [
      offsetMiddleware(offset),
      flip(),
      shift({ padding: 8 }),
    ]
    if (showArrow) {
      middleware.push(arrowMiddleware({ element: arrowRef, padding: 8 }))
    }

    const { refs, floatingStyles, context } = useFloating({
      open: isOpen,
      onOpenChange: handleOpenChange,
      placement: floatingPlacement,
      middleware,
      whileElementsMounted: autoUpdate,
    })

    const click = useClick(context)
    const dismiss = useDismiss(context)
    const role = useRole(context, { role: "menu" })

    const { getReferenceProps, getFloatingProps } = useInteractions([
      click,
      dismiss,
      role,
    ])

    return (
      <div ref={ref} className={merge("relative inline-block", className)} {...props}>
        {/* Trigger */}
        <div
          ref={refs.setReference}
          className="inline-block cursor-pointer"
          {...getReferenceProps()}
        >
          {trigger}
        </div>

        {/* Dropdown via Portal */}
        {isOpen && (
          <FloatingPortal>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={merge(
                "z-50 bg-[var(--dropdown-bg,_#fff)] dark:bg-[var(--dropdown-bg,_rgb(31,41,55))] rounded-lg shadow-lg border border-border",
                "min-w-[var(--reference-width)] w-max py-1"
              )}
              {...getFloatingProps()}
            >
              {showArrow && (
                <FloatingArrow
                  ref={arrowRef}
                  context={context}
                  width={ARROW_SIZE * 2}
                  height={ARROW_SIZE}
                  className="fill-[var(--dropdown-bg,_#fff)] dark:fill-[var(--dropdown-bg,_rgb(31,41,55))] [&>path:first-of-type]:stroke-border"
                />
              )}
              {children}
            </div>
          </FloatingPortal>
        )}
      </div>
    )
  }
)
Dropdown.displayName = "Dropdown"

// Sub-components (unchanged)
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
      className={merge("h-px bg-border my-2", className)}
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
      className={merge("px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownLabel.displayName = "DropdownLabel"

const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("py-1", className)}
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
      className={merge("space-y-1", className)}
      {...props}
    >
      {children}
    </div>
  )
)
DropdownGroup.displayName = "DropdownGroup"

export { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel, DropdownMenu, DropdownGroup }
