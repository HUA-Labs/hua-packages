"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Container 컴포넌트의 props
 * @typedef {Object} ContainerProps
 * @property {"sm" | "md" | "lg" | "xl" | "full"} [size="lg"] - 컨테이너 최대 너비
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [padding="md"] - 내부 패딩 크기
 * @property {boolean} [centered=true] - 컨테이너를 중앙 정렬할지 여부
 * @property {boolean} [fluid=false] - 최대 너비 제한 없이 전체 너비 사용
 * @extends {React.HTMLAttributes<HTMLDivElement>}
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
 * @component
 * @example
 * // 기본 사용
 * <Container>
 *   <h1>제목</h1>
 *   <p>내용</p>
 * </Container>
 * 
 * @example
 * // 작은 크기, 패딩 없음
 * <Container size="sm" padding="none">
 *   <div>콘텐츠</div>
 * </Container>
 * 
 * @example
 * // 전체 너비 사용
 * <Container fluid padding="xl">
 *   <div>전체 너비 콘텐츠</div>
 * </Container>
 * 
 * @param {ContainerProps} props - Container 컴포넌트의 props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref
 * @returns {JSX.Element} Container 컴포넌트
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
    const sizeClasses = {
      sm: "max-w-2xl", // 672px
      md: "max-w-4xl", // 896px
      lg: "max-w-6xl", // 1152px
      xl: "max-w-7xl", // 1280px
      full: "max-w-full"
    }

    const paddingClasses = {
      none: "",
      sm: "px-4 py-8", // 16px 좌우, 32px 상하
      md: "px-6 py-12", // 24px 좌우, 48px 상하
      lg: "px-8 py-16", // 32px 좌우, 64px 상하
      xl: "px-12 py-20" // 48px 좌우, 80px 상하
    }

    return (
      <div
        ref={ref}
        className={merge(
          "w-full",
          !fluid && sizeClasses[size],
          paddingClasses[padding],
          centered && "mx-auto",
          "bg-white/5 backdrop-blur-sm rounded-xl shadow-xl",
          "dark:bg-slate-900/5",
          className
        )}
        {...props}
      />
    )
  }
)
Container.displayName = "Container"

export { Container } 