"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const cardVariants = cva(
  "rounded-lg",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border border-border",
        outline: "bg-transparent border-2 border-border",
        elevated: "bg-card text-card-foreground shadow-lg border border-border",
      },
      shadow: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
      },
      padding: {
        none: "",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "none",
    },
  }
)

/**
 * Card 컴포넌트의 props / Card component props
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline" | "elevated"
  shadow?: "none" | "sm" | "md" | "lg"
  padding?: "none" | "sm" | "md" | "lg"
  hoverable?: boolean
}

/**
 * Card 컴포넌트 / Card component
 *
 * 콘텐츠를 카드 형태로 표시하는 컴포넌트입니다.
 *
 * @example
 * <Card>
 *   <CardHeader><CardTitle>제목</CardTitle></CardHeader>
 *   <CardContent><p>내용</p></CardContent>
 * </Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", shadow, padding = "none", hoverable, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          cardVariants({ variant, shadow, padding }),
          hoverable && "transition-shadow hover:shadow-lg cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

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

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

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

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

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

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={merge("px-3 pb-3", className)} {...props} />
  )
)

CardContent.displayName = "CardContent"

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

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
