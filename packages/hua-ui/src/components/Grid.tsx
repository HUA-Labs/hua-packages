"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const gridVariants = cva(
  "grid",
  {
    variants: {
      gap: {
        none: "gap-0",
        sm: "gap-4",
        md: "gap-6",
        lg: "gap-8",
        xl: "gap-12",
      },
    },
    defaultVariants: {
      gap: "md",
    },
  }
)

// Responsive cols 맵 — CVA는 동적 값(1-12)에 부적합하므로 별도 맵
const RESPONSIVE_COLS: Record<number, string> = {
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
  12: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-12",
}

const GAP_X: Record<string, string> = { none: "gap-x-0", sm: "gap-x-4", md: "gap-x-6", lg: "gap-x-8", xl: "gap-x-12" }
const GAP_Y: Record<string, string> = { none: "gap-y-0", sm: "gap-y-4", md: "gap-y-6", lg: "gap-y-8", xl: "gap-y-12" }

/**
 * Grid 컴포넌트의 props
 */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  gapX?: "none" | "sm" | "md" | "lg" | "xl"
  gapY?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

/**
 * Grid 컴포넌트
 *
 * CSS Grid를 사용한 그리드 레이아웃 컴포넌트입니다.
 *
 * @example
 * <Grid cols={3} gap="md"><div>1</div><div>2</div><div>3</div></Grid>
 * <Grid cols={4} gapX="lg" gapY="sm">{items}</Grid>
 * <Grid cols={6} responsive={false} gap="lg"><div>고정 6열</div></Grid>
 */
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
    return (
      <div
        ref={ref}
        className={merge(
          gridVariants({ gap: gapX ? undefined : gap }),
          responsive ? RESPONSIVE_COLS[cols] : `grid-cols-${cols}`,
          gapX && GAP_X[gapX],
          gapY && GAP_Y[gapY],
          className
        )}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

export { Grid } 