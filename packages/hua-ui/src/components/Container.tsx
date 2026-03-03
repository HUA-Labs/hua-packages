"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const containerVariants = dotVariants({
  base: "w-full",
  variants: {
    size: {
      sm: "max-w-2xl",
      md: "max-w-4xl",
      lg: "max-w-6xl",
      xl: "max-w-7xl",
      full: "max-w-full",
    },
    padding: {
      none: "",
      sm: "px-4 py-8",
      md: "px-6 py-12",
      lg: "px-8 py-16",
      xl: "px-12 py-20",
    },
  },
  defaultVariants: {
    size: "lg",
    padding: "md",
  },
})

const CENTERED_STYLE: React.CSSProperties = {
  marginLeft: 'auto',
  marginRight: 'auto',
}

/**
 * Container 컴포넌트의 props
 */
export interface ContainerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  centered?: boolean
  fluid?: boolean
  dot?: string
}

/**
 * Container 컴포넌트
 *
 * 콘텐츠를 감싸는 컨테이너 컴포넌트입니다.
 * 반응형 최대 너비와 패딩을 제공하여 일관된 레이아웃을 구성합니다.
 *
 * @example
 * <Container><h1>제목</h1></Container>
 * <Container size="sm" padding="none"><div>콘텐츠</div></Container>
 * <Container fluid padding="xl"><div>전체 너비</div></Container>
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({
    dot: dotProp,
    size = "lg",
    padding = "md",
    centered = true,
    fluid = false,
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => {
      const base = containerVariants({
        size: fluid ? "full" : size,
        padding,
      }) as React.CSSProperties
      return mergeStyles(
        base,
        fluid ? s("max-w-full") : undefined,
        centered ? CENTERED_STYLE : undefined,
        resolveDot(dotProp),
        style,
      )
    }, [size, padding, centered, fluid, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container }
