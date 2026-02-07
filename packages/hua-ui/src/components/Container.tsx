"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const containerVariants = cva(
  "w-full",
  {
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
        sm: "px-3 sm:px-4 py-6 sm:py-8",
        md: "px-4 sm:px-6 py-8 sm:py-12",
        lg: "px-4 sm:px-6 lg:px-8 py-10 sm:py-16",
        xl: "px-6 sm:px-8 lg:px-12 py-12 sm:py-20",
      },
    },
    defaultVariants: {
      size: "lg",
      padding: "md",
    },
  }
)

/**
 * Container 컴포넌트의 props
 */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  padding?: "none" | "sm" | "md" | "lg" | "xl"
  centered?: boolean
  fluid?: boolean
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
    className,
    size = "lg",
    padding = "md",
    centered = true,
    fluid = false,
    ...props
  }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          containerVariants({ size: fluid ? undefined : size, padding }),
          fluid && "max-w-full",
          centered && "mx-auto",
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container } 