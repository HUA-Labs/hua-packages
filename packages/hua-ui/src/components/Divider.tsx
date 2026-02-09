"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Divider 컴포넌트의 props / Divider component props
 */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted" | "gradient" | "glass"
  size?: "sm" | "md" | "lg"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  color?: "default" | "muted" | "primary" | "secondary"
}

// Divider는 orientation × variant × color 의 조합이 동적이라 CVA compound variants보다
// 런타임 조합이 더 명확함. 색상만 시맨틱 토큰으로 교체.

const ORIENTATION = {
  horizontal: "w-full",
  vertical: "h-full",
} as const

const SPACING = {
  horizontal: { none: "", sm: "my-4", md: "my-6", lg: "my-8", xl: "my-12" },
  vertical: { none: "", sm: "mx-4", md: "mx-6", lg: "mx-8", xl: "mx-12" },
} as const

function getSizeClass(orientation: "horizontal" | "vertical", variant: string, size: "sm" | "md" | "lg") {
  const useBorder = variant === "dashed" || variant === "dotted"
  if (useBorder) {
    const map = {
      horizontal: { sm: "border-t", md: "border-t-2", lg: "border-t-4" },
      vertical: { sm: "border-l", md: "border-l-2", lg: "border-l-4" },
    } as const
    return map[orientation][size]
  }
  const map = {
    horizontal: { sm: "h-px", md: "h-0.5", lg: "h-1" },
    vertical: { sm: "w-px", md: "w-0.5", lg: "w-1" },
  } as const
  return map[orientation][size]
}

function getVariantClass(orientation: "horizontal" | "vertical", variant: string) {
  switch (variant) {
    case "dashed": return "border-dashed"
    case "dotted": return "border-dotted"
    case "gradient":
      return orientation === "horizontal"
        ? "bg-gradient-to-r from-transparent via-border to-transparent"
        : "bg-gradient-to-b from-transparent via-border to-transparent"
    case "glass":
      return orientation === "horizontal"
        ? "bg-gradient-to-r from-transparent via-white/30 to-transparent"
        : "bg-gradient-to-b from-transparent via-white/30 to-transparent"
    default: return ""
  }
}

function getColorClass(variant: string, color: "default" | "muted" | "primary" | "secondary") {
  const useBorder = variant === "dashed" || variant === "dotted"
  if (useBorder) {
    return {
      default: "border-border",
      muted: "border-muted",
      primary: "border-primary/30",
      secondary: "border-secondary",
    }[color]
  }
  return {
    default: "bg-border",
    muted: "bg-muted",
    primary: "bg-primary/30",
    secondary: "bg-secondary",
  }[color]
}

/**
 * Divider 컴포넌트 / Divider component
 *
 * 콘텐츠를 구분하는 구분선 컴포넌트입니다.
 *
 * @example
 * <Divider />
 * <Divider orientation="vertical" />
 * <Divider variant="dashed" spacing="lg" />
 * <Divider variant="gradient" color="primary" />
 */
const DividerComponent = React.forwardRef<HTMLDivElement, DividerProps>(
  ({
    className,
    orientation = "horizontal",
    variant = "solid",
    size = "md",
    spacing = "md",
    color = "default",
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          "flex-shrink-0",
          ORIENTATION[orientation],
          getSizeClass(orientation, variant, size),
          variant === "gradient" ? getVariantClass(orientation, variant) : getColorClass(variant, color),
          variant !== "gradient" && getVariantClass(orientation, variant),
          SPACING[orientation][spacing],
          className
        )}
        {...props}
      />
    )
  }
)

DividerComponent.displayName = "Divider"

const Divider = React.memo(DividerComponent)

export { Divider } 