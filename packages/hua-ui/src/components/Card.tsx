"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Card 컴포넌트의 props / Card component props
 * @typedef {Object} CardProps
 * @property {"default" | "outline" | "elevated"} [variant="default"] - 카드 스타일 변형 / Card style variant
 * @property {"none" | "sm" | "md" | "lg"} [shadow] - 그림자 크기 (none으로 끄기) / Shadow size (use none to disable)
 * @property {"none" | "sm" | "md" | "lg"} [padding="none"] - 패딩 크기 (기본: none) / Padding size (default: none)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "elevated"
  shadow?: "none" | "sm" | "md" | "lg"
  /** 패딩 크기 (기본: none - 슬림 기본값, 필요시 늘리기) */
  padding?: "none" | "sm" | "md" | "lg"
  /** 호버 시 효과 활성화 */
  hoverable?: boolean
}

/**
 * Card 컴포넌트 / Card component
 * 
 * 콘텐츠를 카드 형태로 표시하는 컴포넌트입니다.
 * CardHeader, CardTitle, CardDescription, CardContent, CardFooter와 함께 사용합니다.
 * 
 * Component that displays content in card format.
 * Used with CardHeader, CardTitle, CardDescription, CardContent, and CardFooter.
 * 
 * @component
 * @example
 * // 기본 카드 / Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>카드 제목</CardTitle>
 *     <CardDescription>카드 설명</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>카드 내용</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>액션</Button>
 *   </CardFooter>
 * </Card>
 * 
 * @example
 * // Elevated 스타일 / Elevated style
 * <Card variant="elevated">
 *   <CardContent>강조된 카드</CardContent>
 * </Card>
 * 
 * @param {CardProps} props - Card 컴포넌트의 props / Card component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Card 컴포넌트 / Card component
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", shadow, padding = "none", ...props }, ref) => {
    const variantClasses = {
      default: "bg-card text-card-foreground border border-border",
      outline: "bg-transparent border-2 border-border",
      elevated: "bg-card text-card-foreground shadow-lg border border-border"
    }

    const shadowClasses = {
      none: "shadow-none",
      sm: "shadow-sm",
      md: "shadow-md",
      lg: "shadow-lg"
    }

    // 슬림 기본값: none, 필요시 옵션으로 늘리기
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6"
    }

    return (
      <div
        ref={ref}
        className={merge(
          "rounded-lg",
          variantClasses[variant],
          shadow && shadowClasses[shadow],
          paddingClasses[padding],
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

/**
 * CardHeader 컴포넌트의 props / CardHeader component props
 * @typedef {Object} CardHeaderProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardHeader 컴포넌트 / CardHeader component
 * 카드의 헤더 영역을 표시합니다. CardTitle과 CardDescription을 포함합니다.
 * Displays the header area of a card. Contains CardTitle and CardDescription.
 * 
 * @component
 * @param {CardHeaderProps} props - CardHeader 컴포넌트의 props / CardHeader component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} CardHeader 컴포넌트 / CardHeader component
 */
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("flex flex-col space-y-1 p-3", className)}
      {...props}
    />
  )
)

CardHeader.displayName = "CardHeader"

/**
 * CardTitle 컴포넌트의 props / CardTitle component props
 * @typedef {Object} CardTitleProps
 * @extends {React.HTMLAttributes<HTMLHeadingElement>}
 */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/**
 * CardTitle 컴포넌트 / CardTitle component
 * 카드의 제목을 표시합니다. h3 태그로 렌더링됩니다.
 * Displays the card title. Renders as h3 tag.
 * 
 * @component
 * @param {CardTitleProps} props - CardTitle 컴포넌트의 props / CardTitle component props
 * @param {React.Ref<HTMLParagraphElement>} ref - h3 요소 ref / h3 element ref
 * @returns {JSX.Element} CardTitle 컴포넌트 / CardTitle component
 */
const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={merge(
        "text-base md:text-lg font-semibold leading-tight tracking-tight",
        className
      )}
      {...props}
    />
  )
)

CardTitle.displayName = "CardTitle"

/**
 * CardDescription 컴포넌트의 props / CardDescription component props
 * @typedef {Object} CardDescriptionProps
 * @extends {React.HTMLAttributes<HTMLParagraphElement>}
 */
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

/**
 * CardDescription 컴포넌트 / CardDescription component
 * 카드의 설명 텍스트를 표시합니다.
 * Displays the card description text.
 * 
 * @component
 * @param {CardDescriptionProps} props - CardDescription 컴포넌트의 props / CardDescription component props
 * @param {React.Ref<HTMLParagraphElement>} ref - p 요소 ref / p element ref
 * @returns {JSX.Element} CardDescription 컴포넌트 / CardDescription component
 */
const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={merge("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)

CardDescription.displayName = "CardDescription"

/**
 * CardContent 컴포넌트의 props / CardContent component props
 * @typedef {Object} CardContentProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardContent 컴포넌트 / CardContent component
 * 카드의 메인 콘텐츠 영역을 표시합니다.
 * Displays the main content area of a card.
 * 
 * @component
 * @param {CardContentProps} props - CardContent 컴포넌트의 props / CardContent component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} CardContent 컴포넌트 / CardContent component
 */
const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={merge("px-3 pb-3", className)} {...props} />
  )
)

CardContent.displayName = "CardContent"

/**
 * CardFooter 컴포넌트의 props / CardFooter component props
 * @typedef {Object} CardFooterProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * CardFooter 컴포넌트 / CardFooter component
 * 카드의 푸터 영역을 표시합니다. 주로 액션 버튼을 배치합니다.
 * Displays the footer area of a card. Typically used for action buttons.
 * 
 * @component
 * @param {CardFooterProps} props - CardFooter 컴포넌트의 props / CardFooter component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} CardFooter 컴포넌트 / CardFooter component
 */
const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("flex items-center px-3 pb-3", className)}
      {...props}
    />
  )
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } 