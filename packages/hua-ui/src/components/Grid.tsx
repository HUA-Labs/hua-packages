"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Grid 컴포넌트의 props
 * @typedef {Object} GridProps
 * @property {1|2|3|4|5|6|7|8|9|10|11|12} [cols=1] - 그리드 열 개수
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [gap="md"] - 그리드 아이템 간 간격
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [gapX] - 가로 간격 (gap보다 우선)
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [gapY] - 세로 간격
 * @property {boolean} [responsive=true] - 반응형 그리드 활성화 (모바일: 1열, 태블릿: 2열, 데스크톱: 지정 열)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
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
 * 반응형 그리드를 지원하여 모바일부터 데스크톱까지 최적화된 레이아웃을 제공합니다.
 * 
 * @component
 * @example
 * // 기본 3열 그리드
 * <Grid cols={3} gap="md">
 *   <div>아이템 1</div>
 *   <div>아이템 2</div>
 *   <div>아이템 3</div>
 * </Grid>
 * 
 * @example
 * // 가로/세로 간격 분리
 * <Grid cols={4} gapX="lg" gapY="sm">
 *   {items.map(item => <div key={item.id}>{item.content}</div>)}
 * </Grid>
 * 
 * @example
 * // 반응형 비활성화 (고정 그리드)
 * <Grid cols={6} responsive={false} gap="lg">
 *   <div>고정 6열</div>
 * </Grid>
 * 
 * @param {GridProps} props - Grid 컴포넌트의 props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref
 * @returns {JSX.Element} Grid 컴포넌트
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
        className={merge(
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