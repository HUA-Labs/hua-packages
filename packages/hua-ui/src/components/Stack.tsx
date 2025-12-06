"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Stack 컴포넌트의 props
 * @typedef {Object} StackProps
 * @property {"vertical" | "horizontal"} [direction="vertical"] - 스택 방향
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [spacing="md"] - 아이템 간 간격
 * @property {"start" | "center" | "end" | "stretch"} [align="start"] - 교차축 정렬
 * @property {"start" | "center" | "end" | "between" | "around" | "evenly"} [justify="start"] - 주축 정렬
 * @property {boolean} [wrap=false] - 아이템 줄바꿈 허용
 * @extends {React.HTMLAttributes<HTMLDivElement>}
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
 * 수직 또는 수평 방향으로 아이템을 배치하고 정렬할 수 있습니다.
 * 
 * @component
 * @example
 * // 기본 수직 스택
 * <Stack spacing="md">
 *   <div>아이템 1</div>
 *   <div>아이템 2</div>
 * </Stack>
 * 
 * @example
 * // 수평 스택, 중앙 정렬
 * <Stack direction="horizontal" spacing="lg" align="center" justify="between">
 *   <Button>왼쪽</Button>
 *   <Button>오른쪽</Button>
 * </Stack>
 * 
 * @example
 * // 줄바꿈 허용
 * <Stack direction="horizontal" wrap spacing="sm">
 *   {tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
 * </Stack>
 * 
 * @param {StackProps} props - Stack 컴포넌트의 props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref
 * @returns {JSX.Element} Stack 컴포넌트
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
    const directionClasses = {
      vertical: "flex flex-col",
      horizontal: "flex flex-row"
    }

    const spacingClasses = {
      none: "",
      sm: direction === "vertical" ? "space-y-4" : "space-x-4", // 16px
      md: direction === "vertical" ? "space-y-6" : "space-x-6", // 24px
      lg: direction === "vertical" ? "space-y-8" : "space-x-8", // 32px
      xl: direction === "vertical" ? "space-y-12" : "space-x-12" // 48px
    }

    const alignClasses = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch"
    }

    const justifyClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly"
    }

    return (
      <div
        ref={ref}
        className={merge(
          directionClasses[direction],
          spacingClasses[spacing],
          alignClasses[align],
          justifyClasses[justify],
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