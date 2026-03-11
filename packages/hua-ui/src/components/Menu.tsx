"use client"

import React, { useState, useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

// ---------------------------------------------------------------------------
// CSS variable helpers
// ---------------------------------------------------------------------------

/** Resolves a CSS variable string to a value usable in CSSProperties */
const cssVar = (v: string) => `var(${v})`

// ---------------------------------------------------------------------------
// Static style constants
// ---------------------------------------------------------------------------

type MenuVariant = "default" | "horizontal" | "vertical" | "compact"
type MenuSize = "sm" | "md" | "lg"

/** Menu container base layout per variant */
const MENU_VARIANT_STYLE: Record<MenuVariant, React.CSSProperties> = {
  default: { display: "flex", flexDirection: "column", gap: "4px" },
  horizontal: { display: "flex", flexDirection: "row", alignItems: "center", gap: "4px" },
  vertical: { display: "flex", flexDirection: "column", gap: "4px" },
  compact: { display: "flex", flexDirection: "column", gap: "2px" },
}

/** Menu container font-size per size */
const MENU_SIZE_STYLE: Record<MenuSize, React.CSSProperties> = {
  sm: { fontSize: "0.875rem" },
  md: { fontSize: "0.875rem" },
  lg: { fontSize: "1rem" },
}

/** MenuItem base layout per variant */
const ITEM_VARIANT_BASE: Record<MenuVariant, React.CSSProperties> = {
  default: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    background: "none",
  },
  horizontal: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingLeft: "12px",
    paddingRight: "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
    border: "none",
    cursor: "pointer",
    width: "auto",
    textAlign: "left",
    background: "none",
  },
  vertical: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    paddingLeft: "16px",
    paddingRight: "16px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    background: "none",
  },
  compact: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    paddingLeft: "8px",
    paddingRight: "8px",
    paddingTop: "6px",
    paddingBottom: "6px",
    borderRadius: "4px",
    fontSize: "0.875rem",
    fontWeight: "500",
    transition: "background-color 150ms ease-in-out, color 150ms ease-in-out",
    border: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    background: "none",
  },
}

/** MenuItem font-size per size */
const ITEM_SIZE_STYLE: Record<MenuSize, React.CSSProperties> = {
  sm: { fontSize: "0.75rem" },
  md: { fontSize: "0.875rem" },
  lg: { fontSize: "1rem" },
}

/** MenuItem active state styles */
const ITEM_ACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: cssVar("--color-primary-10, color-mix(in srgb, var(--color-primary) 10%, transparent)"),
  color: cssVar("--color-primary"),
}

/** MenuItem inactive default styles */
const ITEM_INACTIVE_STYLE: React.CSSProperties = {
  color: cssVar("--color-foreground"),
}

/** MenuItem hover overlay (inactive) */
const ITEM_HOVER_STYLE: React.CSSProperties = {
  backgroundColor: cssVar("--color-muted"),
  color: cssVar("--color-foreground"),
}

/** MenuItem disabled styles */
const ITEM_DISABLED_STYLE: React.CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
}

/** Icon wrapper styles */
const ICON_WRAPPER_STYLE: React.CSSProperties = {
  flexShrink: 0,
  width: "16px",
  height: "16px",
}

/** Text span styles */
const TEXT_STYLE: React.CSSProperties = {
  flex: 1,
  textAlign: "left",
}

/** MenuSeparator horizontal variant */
const SEPARATOR_HORIZONTAL_STYLE: React.CSSProperties = {
  width: "1px",
  height: "16px",
  backgroundColor: cssVar("--color-border"),
  marginLeft: "4px",
  marginRight: "4px",
}

/** MenuSeparator vertical/default variant */
const SEPARATOR_VERTICAL_STYLE: React.CSSProperties = {
  height: "1px",
  backgroundColor: cssVar("--color-border"),
  marginTop: "8px",
  marginBottom: "8px",
}

/** MenuLabel horizontal variant */
const LABEL_HORIZONTAL_STYLE: React.CSSProperties = {
  paddingLeft: "12px",
  paddingRight: "12px",
  paddingTop: "4px",
  paddingBottom: "4px",
  fontSize: "0.75rem",
  fontWeight: "600",
  color: cssVar("--color-muted-foreground"),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

/** MenuLabel vertical/default variant */
const LABEL_DEFAULT_STYLE: React.CSSProperties = {
  paddingLeft: "16px",
  paddingRight: "16px",
  paddingTop: "8px",
  paddingBottom: "8px",
  fontSize: "0.75rem",
  fontWeight: "600",
  color: cssVar("--color-muted-foreground"),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

/** MenuLabel font-size per size */
const LABEL_SIZE_STYLE: Record<MenuSize, React.CSSProperties> = {
  sm: { fontSize: "0.75rem" },
  md: { fontSize: "0.75rem" },
  lg: { fontSize: "0.875rem" },
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------

/**
 * Menu component props
 * @typedef {Object} MenuProps
 * @property {React.ReactNode} children - MenuItem, MenuSeparator, MenuLabel components
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant="default"] - Menu direction and style
 * @property {"sm" | "md" | "lg"} [size="md"] - Menu item size
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Inline style overrides
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface MenuProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  children: React.ReactNode
  variant?: MenuVariant
  size?: MenuSize
  dot?: string
  style?: React.CSSProperties
}

/**
 * Menu component
 *
 * Component that provides menu lists.
 * Used with MenuItem, MenuSeparator, and MenuLabel.
 *
 * @component
 * @example
 * // Basic vertical menu
 * <Menu>
 *   <MenuItem icon={<Icon name="home" />}>Home</MenuItem>
 *   <MenuItem icon={<Icon name="settings" />}>Settings</MenuItem>
 *   <MenuSeparator />
 *   <MenuItem>Logout</MenuItem>
 * </Menu>
 *
 * @example
 * // Horizontal menu
 * <Menu variant="horizontal">
 *   <MenuItem>Menu 1</MenuItem>
 *   <MenuItem>Menu 2</MenuItem>
 * </Menu>
 */
const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({
    dot: dotProp,
    children,
    variant = "default",
    size = "md",
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => mergeStyles(
      MENU_VARIANT_STYLE[variant],
      MENU_SIZE_STYLE[size],
      resolveDot(dotProp),
      style,
    ), [variant, size, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              variant,
              size
            } as Partial<MenuItemProps | MenuSeparatorProps | MenuLabelProps>)
          }
          return child
        })}
      </div>
    )
  }
)
Menu.displayName = "Menu"

// ---------------------------------------------------------------------------
// MenuItem
// ---------------------------------------------------------------------------

/**
 * MenuItem component props
 * @typedef {Object} MenuItemProps
 * @property {React.ReactNode} [icon] - Menu item icon
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - Menu variant (auto-passed from Menu)
 * @property {"sm" | "md" | "lg"} [size] - Menu size (auto-passed from Menu)
 * @property {boolean} [active=false] - Active state
 * @property {boolean} [disabled=false] - Disabled state
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Inline style overrides
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'>}
 */
export interface MenuItemProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  icon?: React.ReactNode
  variant?: MenuVariant
  size?: MenuSize
  active?: boolean
  disabled?: boolean
  dot?: string
  style?: React.CSSProperties
}

/**
 * MenuItem component
 * Displays an individual menu item.
 *
 * @component
 */
const MenuItem = React.forwardRef<HTMLButtonElement, MenuItemProps>(
  ({
    dot: dotProp,
    icon,
    variant = "default",
    size = "md",
    active = false,
    disabled = false,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const computedStyle = useMemo(() => mergeStyles(
      ITEM_VARIANT_BASE[variant],
      ITEM_SIZE_STYLE[size],
      active ? ITEM_ACTIVE_STYLE : ITEM_INACTIVE_STYLE,
      !active && isHovered ? ITEM_HOVER_STYLE : undefined,
      isFocused ? { outline: "none", boxShadow: `0 0 0 2px ${cssVar("--color-ring")}` } : undefined,
      disabled ? ITEM_DISABLED_STYLE : undefined,
      resolveDot(dotProp),
      style,
    ), [variant, size, active, isHovered, isFocused, disabled, dotProp, style])

    return (
      <button
        ref={ref}
        style={computedStyle}
        disabled={disabled}
        onMouseEnter={(e) => { setIsHovered(true); onMouseEnter?.(e) }}
        onMouseLeave={(e) => { setIsHovered(false); onMouseLeave?.(e) }}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); onBlur?.(e) }}
        {...props}
      >
        {icon && (
          <div style={ICON_WRAPPER_STYLE}>
            {icon}
          </div>
        )}
        <span style={TEXT_STYLE}>{children}</span>
      </button>
    )
  }
)
MenuItem.displayName = "MenuItem"

// ---------------------------------------------------------------------------
// MenuSeparator
// ---------------------------------------------------------------------------

/**
 * MenuSeparator component props
 * @typedef {Object} MenuSeparatorProps
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - Menu variant (auto-passed from Menu)
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Inline style overrides
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface MenuSeparatorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  variant?: MenuVariant
  dot?: string
  style?: React.CSSProperties
}

/**
 * MenuSeparator component
 * Displays a separator line between menu items.
 *
 * @component
 */
const MenuSeparator = React.forwardRef<HTMLDivElement, MenuSeparatorProps>(
  ({ dot: dotProp, variant = "default", style, ...props }, ref) => {
    const computedStyle = useMemo(() => mergeStyles(
      variant === "horizontal" ? SEPARATOR_HORIZONTAL_STYLE : SEPARATOR_VERTICAL_STYLE,
      resolveDot(dotProp),
      style,
    ), [variant, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
MenuSeparator.displayName = "MenuSeparator"

// ---------------------------------------------------------------------------
// MenuLabel
// ---------------------------------------------------------------------------

/**
 * MenuLabel component props
 * @typedef {Object} MenuLabelProps
 * @property {"default" | "horizontal" | "vertical" | "compact"} [variant] - Menu variant (auto-passed from Menu)
 * @property {"sm" | "md" | "lg"} [size] - Menu size (auto-passed from Menu)
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Inline style overrides
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface MenuLabelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  variant?: MenuVariant
  size?: MenuSize
  dot?: string
  style?: React.CSSProperties
}

/**
 * MenuLabel component
 * Displays a label for a menu section.
 *
 * @component
 */
const MenuLabel = React.forwardRef<HTMLDivElement, MenuLabelProps>(
  ({ dot: dotProp, variant = "default", size = "md", children, style, ...props }, ref) => {
    const computedStyle = useMemo(() => mergeStyles(
      variant === "horizontal" ? LABEL_HORIZONTAL_STYLE : LABEL_DEFAULT_STYLE,
      LABEL_SIZE_STYLE[size],
      resolveDot(dotProp),
      style,
    ), [variant, size, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
MenuLabel.displayName = "MenuLabel"

// ---------------------------------------------------------------------------
// Convenience components
// ---------------------------------------------------------------------------

export const MenuHorizontal = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ ...props }, ref) => (
    <Menu ref={ref} variant="horizontal" {...props} />
  )
)
MenuHorizontal.displayName = "MenuHorizontal"

export const MenuVertical = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ ...props }, ref) => (
    <Menu ref={ref} variant="vertical" {...props} />
  )
)
MenuVertical.displayName = "MenuVertical"

export const MenuCompact = React.forwardRef<HTMLDivElement, Omit<MenuProps, "variant">>(
  ({ ...props }, ref) => (
    <Menu ref={ref} variant="compact" {...props} />
  )
)
MenuCompact.displayName = "MenuCompact"

export { Menu, MenuItem, MenuSeparator, MenuLabel }
