"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const labelVariantStyles = dotVariants(
  {
    base: "text-sm font-medium leading-none",
    variants: {
      variant: {
        default: "text-[var(--color-foreground)]",
        glass: "text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Disabled style per variant */
const DISABLED_STYLE: Record<string, React.CSSProperties> = {
  default: { color: 'var(--color-muted-foreground)', cursor: 'not-allowed' },
  glass: { color: 'rgba(255, 255, 255, 0.5)', cursor: 'not-allowed' },
}

/** Error style per variant */
const ERROR_STYLE: Record<string, React.CSSProperties> = {
  default: { color: 'var(--color-destructive)' },
  glass: { color: '#f87171' },
}

/**
 * Label component props
 */
export interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'className'> {
  required?: boolean
  error?: boolean
  disabled?: boolean
  variant?: "default" | "glass"
  dot?: string
  style?: React.CSSProperties
}

/**
 * Label component
 *
 * A component for displaying form field labels.
 *
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Label required htmlFor="name">Name</Label>
 * <Label error htmlFor="password">Password</Label>
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({
    children,
    required = false,
    error = false,
    disabled = false,
    variant = "default",
    dot: dotProp,
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => {
      const base = labelVariantStyles({ variant }) as React.CSSProperties
      return mergeStyles(
        base,
        error ? ERROR_STYLE[variant] : undefined,
        disabled ? DISABLED_STYLE[variant] : undefined,
        resolveDot(dotProp),
        style,
      )
    }, [variant, error, disabled, dotProp, style])

    const requiredStarStyle = useMemo(() =>
      s(variant === "glass" ? "text-red-400 ml-1" : "text-[var(--color-destructive)] ml-1"),
      [variant]
    )

    return (
      <label
        ref={ref}
        style={computedStyle}
        aria-required={required ? true : undefined}
        {...props}
      >
        {children}
        {required && (
          <span style={requiredStarStyle} aria-label="required field">*</span>
        )}
      </label>
    )
  }
)
Label.displayName = "Label"

export { Label }
