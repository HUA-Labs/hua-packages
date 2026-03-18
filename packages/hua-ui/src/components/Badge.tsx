"use client";

import React, { useState, useMemo } from "react";
import { dotVariants } from "@hua-labs/dot";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { createGlassStyle } from "../lib/styles/glass";
import { FOCUS_RING_CONTROL } from "../lib/styles/focus";
import { TRANSITIONS } from "../lib/styles/transition";

export const badgeVariantStyles = dotVariants({
  base: "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold",
  variants: {
    variant: {
      default: "bg-[var(--badge-default-bg)] text-[var(--badge-default-text)]",
      secondary:
        "bg-[var(--badge-secondary-bg)] text-[var(--badge-secondary-text)]",
      destructive: "bg-[var(--badge-destructive-bg)] text-slate-50",
      error: "bg-[var(--badge-destructive-bg)] text-slate-50",
      outline:
        "bg-transparent text-[var(--badge-outline-text)] border border-[var(--badge-outline-border)]",
      glass:
        "bg-[var(--badge-glass-bg)] border border-[var(--badge-glass-border)] text-[var(--badge-glass-text)]",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "default",
    rounded: "full",
  },
});

/** Variant-specific hover overrides */
const VARIANT_HOVER: Record<string, React.CSSProperties> = {
  default: { opacity: 0.8 },
  secondary: { opacity: 0.8 },
  destructive: { opacity: 0.8 },
  error: { opacity: 0.8 },
  outline: { backgroundColor: "var(--badge-outline-hover-bg)" },
  glass: { opacity: 0.8 },
};

/** Glass variant extras (backdrop-blur) */
const GLASS_EXTRAS: React.CSSProperties = createGlassStyle("light");

/**
 * Badge component props
 */
export interface BadgeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "error"
    | "outline"
    | "glass";
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Badge component
 *
 * A small badge component for displaying status or category.
 *
 * @example
 * <Badge>New</Badge>
 * <Badge variant="destructive">Done</Badge>
 * <Badge variant="outline">Pending</Badge>
 */
const Badge = React.memo(
  React.forwardRef<HTMLDivElement, BadgeProps>(
    (
      { dot: dotProp, variant = "default", rounded = "full", style, ...props },
      ref,
    ) => {
      const [isHovered, setIsHovered] = useState(false);
      const [isFocused, setIsFocused] = useState(false);

      const computedStyle = useMemo(() => {
        const base = badgeVariantStyles({
          variant,
          rounded,
        }) as React.CSSProperties;
        return mergeStyles(
          base,
          { transition: TRANSITIONS.normal },
          variant === "glass" ? GLASS_EXTRAS : undefined,
          isHovered ? VARIANT_HOVER[variant] : undefined,
          isFocused ? FOCUS_RING_CONTROL : undefined,
          resolveDot(dotProp),
          style,
        );
      }, [variant, rounded, isHovered, isFocused, dotProp, style]);

      return (
        <div
          ref={ref}
          style={computedStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      );
    },
  ),
);
Badge.displayName = "Badge";

export { Badge };
