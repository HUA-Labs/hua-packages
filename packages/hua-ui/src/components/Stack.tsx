"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const stackVariants = cva(
  "",
  {
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
  }
)

// Spacing은 direction 의존적이라 CVA compound variant보다 맵이 더 명확
const SPACING = {
  vertical: { none: "", sm: "space-y-4", md: "space-y-6", lg: "space-y-8", xl: "space-y-12" },
  horizontal: { none: "", sm: "space-x-4", md: "space-x-6", lg: "space-x-8", xl: "space-x-12" },
} as const

/**
 * Stack 컴포넌트의 props
 */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  align?: "start" | "center" | "end" | "stretch"
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly"
  wrap?: boolean
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
    className,
    direction = "vertical",
    spacing = "md",
    align = "start",
    justify = "start",
    wrap = false,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          stackVariants({ direction, align, justify }),
          SPACING[direction][spacing],
          wrap && "flex-wrap",
          className
        )}
        {...props}
      />
    )
  }
)
Stack.displayName = "Stack"

export { Stack } 