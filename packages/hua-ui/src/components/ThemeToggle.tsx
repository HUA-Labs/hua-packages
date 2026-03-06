"use client"

import React, { useState, useMemo } from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { Icon } from "./Icon"
import { useTheme } from "./ThemeProvider"

// ---- size tokens --------------------------------------------------------

const SIZE_STYLES: Record<"sm" | "md" | "lg", React.CSSProperties> = {
  sm: { height: 40, width: 40 },
  md: { height: 48, width: 48 },
  lg: { height: 56, width: 56 },
}

const ICON_SIZES: Record<"sm" | "md" | "lg", number> = {
  sm: 16,
  md: 20,
  lg: 24,
}

// ---- shared base styles -------------------------------------------------

const BASE_BUTTON: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "0.5rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  outline: "none",
}

const HOVER_BG: React.CSSProperties = {
  backgroundColor: "var(--color-muted)",
}

const FOCUS_RING: React.CSSProperties = {
  outline: "none",
  boxShadow: "0 0 0 1px var(--color-ring), 0 0 0 3px var(--color-ring)",
}

const SWITCH_BG_LIGHT: React.CSSProperties = {
  backgroundColor: "var(--color-muted)",
}

const SWITCH_BG_DARK: React.CSSProperties = {
  backgroundColor: "var(--color-primary)",
}

/**
 * ThemeToggle component props
 */
export interface ThemeToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  /** dot style utility string for the root element */
  dot?: string
  /** Additional inline style for the root element */
  style?: React.CSSProperties
  /** Toggle size */
  size?: "sm" | "md" | "lg"
  /** Toggle style variant */
  variant?: "button" | "icon" | "switch"
  /** Whether to show a text label */
  showLabel?: boolean
  /** Custom label text */
  label?: {
    light?: string
    dark?: string
    system?: string
  }
}

/**
 * ThemeToggle component
 *
 * Toggle component for switching between light/dark/system themes.
 * Used with ThemeProvider, supports light/dark/system themes.
 *
 * @example
 * // Basic usage (button style)
 * <ThemeToggle />
 *
 * @example
 * // Icon only
 * <ThemeToggle variant="icon" size="lg" />
 *
 * @example
 * // Switch style
 * <ThemeToggle variant="switch" />
 *
 * @example
 * // With label
 * <ThemeToggle
 *   showLabel
 *   label={{ light: "밝게", dark: "어둡게" }}
 * />
 */
export function ThemeToggle({
  dot: dotProp,
  style,
  size = "md",
  variant = "button",
  showLabel = false,
  label = {
    light: "라이트",
    dark: "다크",
    system: "시스템",
  },
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Compute all variant styles unconditionally (rules of hooks)
  const iconButtonStyle = useMemo(
    () =>
      mergeStyles(
        BASE_BUTTON,
        SIZE_STYLES[size],
        isHovered ? HOVER_BG : undefined,
        isFocused ? FOCUS_RING : undefined,
        resolveDot(dotProp),
        style,
      ),
    [size, isHovered, isFocused, dotProp, style],
  )

  const switchTrackStyle = useMemo(
    () =>
      mergeStyles(
        {
          position: "relative" as const,
          display: "inline-flex",
          height: 24,
          width: 44,
          alignItems: "center",
          borderRadius: 9999,
          border: "none",
          cursor: "pointer",
          transition: "background-color 300ms ease",
          outline: "none",
        },
        isDark ? SWITCH_BG_DARK : SWITCH_BG_LIGHT,
        isFocused ? FOCUS_RING : undefined,
        resolveDot(dotProp),
        style,
      ),
    [isDark, isFocused, dotProp, style],
  )

  const buttonStyle = useMemo(
    () =>
      mergeStyles(
        BASE_BUTTON,
        {
          gap: 12,
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 12,
          paddingBottom: 12,
          fontSize: "0.875rem",
          fontWeight: 500,
          justifyContent: "flex-start",
          transition: "background-color 300ms ease",
        },
        isHovered ? HOVER_BG : undefined,
        isFocused ? FOCUS_RING : undefined,
        resolveDot(dotProp),
        style,
      ),
    [isHovered, isFocused, dotProp, style],
  )

  const interactionHandlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  }

  const handleClick = () => {
    if (theme === "system") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else {
      // dark → light
      setTheme("light")
    }
  }

  // ---- icon variant -------------------------------------------------------

  if (variant === "icon") {
    const moonStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 300ms ease, opacity 300ms ease",
      transform: isDark ? "rotate(0deg)" : "rotate(90deg)",
      opacity: isDark ? 1 : 0,
    }

    const sunStyle: React.CSSProperties = {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "transform 300ms ease, opacity 300ms ease",
      transform: isDark ? "rotate(90deg)" : "rotate(0deg)",
      opacity: isDark ? 0 : 1,
    }

    return (
      <button
        onClick={handleClick}
        style={iconButtonStyle}
        {...interactionHandlers}
        {...props}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={moonStyle}>
            <Icon name="moon" size={ICON_SIZES[size]} dot="text-[rgb(99,102,241)]" />
          </div>
          <div style={sunStyle}>
            <Icon name="sun" size={ICON_SIZES[size]} dot={isDark ? "text-[rgb(234,179,8)]" : "text-[rgb(217,119,6)]"} />
          </div>
        </div>
      </button>
    )
  }

  // ---- switch variant -----------------------------------------------------

  if (variant === "switch") {
    const thumbStyle: React.CSSProperties = {
      display: "inline-block",
      height: 16,
      width: 16,
      borderRadius: "50%",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      transition: "transform 300ms ease",
      transform: isDark ? "translateX(24px)" : "translateX(4px)",
    }

    return (
      <button
        onClick={handleClick}
        style={switchTrackStyle}
        {...interactionHandlers}
        {...props}
      >
        <span style={thumbStyle} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: 6,
            paddingRight: 6,
          }}
        >
          <Icon name="sun" size={12} dot="text-[rgb(217,119,6)] opacity-0" />
          <Icon name="moon" size={12} dot="text-[rgb(99,102,241)] opacity-0" />
        </div>
      </button>
    )
  }

  // ---- default button variant --------------------------------------------

  const renderIcon = () => {
    if (theme === "system") {
      return <Icon name="monitor" size={ICON_SIZES[size]} />
    }
    return resolvedTheme === "dark" ? (
      <Icon name="moon" size={ICON_SIZES[size]} />
    ) : (
      <Icon name="sun" size={ICON_SIZES[size]} dot="text-[rgb(217,119,6)]" />
    )
  }

  return (
    <button
      onClick={handleClick}
      style={buttonStyle}
      {...interactionHandlers}
      {...props}
    >
      {renderIcon()}
      {showLabel && (
        <span style={{ color: "var(--color-foreground)" }}>
          {theme === "system"
            ? label.system
            : theme === "dark"
              ? label.dark
              : label.light}
        </span>
      )}
    </button>
  )
}
