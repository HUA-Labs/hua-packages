"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { useBreakpoint } from "../hooks/useBreakpoint"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const gridVariants = dotVariants({
  base: "grid",
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
})

/** Gap pixel values for gapX / gapY overrides */
const GAP_VALUES: Record<string, string> = {
  none: '0px',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
}

/**
 * Grid 컴포넌트의 props
 */
export interface GridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: "none" | "sm" | "md" | "lg" | "xl"
  gapX?: "none" | "sm" | "md" | "lg" | "xl"
  gapY?: "none" | "sm" | "md" | "lg" | "xl"
  responsive?: boolean
  dot?: string
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
    dot: dotProp,
    cols = 1,
    gap = "md",
    gapX,
    gapY,
    responsive = true,
    style,
    ...props
  }, ref) => {
    const bp = useBreakpoint()

    const computedStyle = useMemo(() => {
      const base = gridVariants({ gap: gapX ? undefined : gap }) as React.CSSProperties

      // Compute responsive columns
      let resolvedCols: number
      if (responsive && cols > 1) {
        // sm (< md): 1 col, md-lg: 2 cols, lg+: full cols
        if (!bp || bp === 'sm') {
          resolvedCols = 1
        } else if (bp === 'md') {
          resolvedCols = Math.min(cols, 2)
        } else {
          resolvedCols = cols
        }
      } else {
        resolvedCols = cols
      }

      const colStyle: React.CSSProperties = {
        gridTemplateColumns: `repeat(${resolvedCols}, minmax(0, 1fr))`,
      }

      // gapX / gapY overrides
      const gapOverrides: React.CSSProperties | undefined =
        (gapX || gapY) ? {
          ...(gapX ? { columnGap: GAP_VALUES[gapX] } : {}),
          ...(gapY ? { rowGap: GAP_VALUES[gapY] } : {}),
        } : undefined

      return mergeStyles(base, colStyle, gapOverrides, resolveDot(dotProp), style)
    }, [cols, gap, gapX, gapY, responsive, bp, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
Grid.displayName = "Grid"

export { Grid }
