"use client"

import React, { useMemo } from "react"
import { useDotMap, mergeStyles } from "../hooks/useDotMap"
import { Slot } from "../lib/Slot"

export interface PressableProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  dot?: string
  asChild?: boolean
}

const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  ({ dot: dotProp, style, asChild = false, disabled, children, ...props }, ref) => {
    const { style: dotStyle, handlers } = useDotMap(dotProp ?? "", { disabled: !!disabled })

    const computedStyle = useMemo(
      () => mergeStyles(dotStyle, style),
      [dotStyle, style],
    )

    if (asChild) {
      return (
        <Slot
          ref={ref}
          style={computedStyle}
          aria-disabled={disabled || undefined}
          {...handlers}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        type="button"
        style={computedStyle}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        {...handlers}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Pressable.displayName = "Pressable"

export { Pressable }
