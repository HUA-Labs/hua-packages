"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const stackVariants = dotVariants({
  base: "",
  variants: {
    direction: {
      vertical: "flex flex-col",
      horizontal: "flex flex-row",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
  },
  defaultVariants: {
    direction: "vertical",
    align: "start",
    justify: "start",
  },
})

/** Gap values for spacing — replaces space-y-* / space-x-* with flexbox gap */
const SPACING_GAP: Record<string, string> = {
  none: '0px',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
}

/**
 * Stack 컴포넌트의 props
 */
export interface StackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  direction?: "vertical" | "horizontal"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
  dot?: string
}

/**
 * Stack 컴포넌트
 *
 * Flexbox를 사용한 스택 레이아웃 컴포넌트입니다.
 *
 * @example
 * <Stack spacing="md"><div>1</div><div>2</div></Stack>
 * <Stack direction="horizontal" spacing="lg" align="center" justify="between">{...}</Stack>
 * <Stack direction="horizontal" wrap spacing="sm">{tags}</Stack>
 */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({
    dot: dotProp,
    direction = "vertical",
    spacing = "md",
    align = "start",
    justify = "start",
    wrap = false,
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => {
      const base = stackVariants({ direction, align, justify }) as React.CSSProperties
      const gapStyle: React.CSSProperties = { gap: SPACING_GAP[spacing] }
      const wrapStyle: React.CSSProperties | undefined = wrap ? { flexWrap: 'wrap' } : undefined
      return mergeStyles(base, gapStyle, wrapStyle, resolveDot(dotProp), style)
    }, [direction, spacing, align, justify, wrap, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

export { Stack }
