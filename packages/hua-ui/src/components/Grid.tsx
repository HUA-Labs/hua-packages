"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  gapX?: "none" | "sm" | "md" | "lg" | "xl"
  gapY?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ 
    className, 
    cols = 1,
    gap = "md",
    gapX,
    gapY,
    responsive = true,
    ...props 
  }, ref) => {
    const colsClasses = {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5",
      6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-6",
      7: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-7",
      8: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-8",
      9: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-9",
      10: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-10",
      11: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-11",
      12: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-12"
    }

    const gapClasses = {
      none: "gap-0",
      sm: "gap-4", // 16px
      md: "gap-6", // 24px
      lg: "gap-8", // 32px
      xl: "gap-12" // 48px
    }

    const gapXClasses = {
      none: "gap-x-0",
      sm: "gap-x-4", // 16px
      md: "gap-x-6", // 24px
      lg: "gap-x-8", // 32px
      xl: "gap-x-12" // 48px
    }

    const gapYClasses = {
      none: "gap-y-0",
      sm: "gap-y-4", // 16px
      md: "gap-y-6", // 24px
      lg: "gap-y-8", // 32px
      xl: "gap-y-12" // 48px
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          responsive ? colsClasses[cols] : `grid-cols-${cols}`,
          gapX ? gapXClasses[gapX] : gapClasses[gap],
          gapY && gapYClasses[gapY],
          className
        )}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

export { Grid } 