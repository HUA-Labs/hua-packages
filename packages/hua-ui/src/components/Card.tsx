"use client"

import React, { useState, useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import { composeRefs } from "../lib/Slot"
import { useAnimatedEntrance } from "../hooks/useAnimatedEntrance"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const cardVariants = dotVariants({
  base: "rounded-lg",
  variants: {
    variant: {
      default: "bg-[var(--color-card)] text-[var(--color-card-foreground)] border border-[var(--color-border)]",
      outline: "bg-transparent border-2 border-[var(--color-border)]",
      elevated: "bg-[var(--color-card)] text-[var(--color-card-foreground)] shadow-lg border border-[var(--color-border)]",
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
})

const HOVER_STYLE: React.CSSProperties = {
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
}

/**
 * Card 컴포넌트의 props / Card component props
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  variant?: "default" | "outline" | "elevated"
  shadow?: "none" | "sm" | "md" | "lg"
  padding?: "none" | "sm" | "md" | "lg"
  hoverable?: boolean
  /** Enable preset entrance animation (reads from MotionConfigContext) */
  animated?: boolean
  dot?: string
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
  ({ dot: dotProp, variant = "default", shadow, padding = "none", hoverable, animated, style, ...props }, ref) => {
    const entrance = useAnimatedEntrance<HTMLDivElement>({ role: "card", enabled: animated })
    const [isHovered, setIsHovered] = useState(false)

    const computedStyle = useMemo(() => {
      const base = cardVariants({ variant, shadow, padding }) as React.CSSProperties
      const entranceWillChange = entrance.className
        ? { willChange: 'opacity, transform' } as React.CSSProperties
        : undefined
      return mergeStyles(
        base,
        hoverable ? { transition: 'box-shadow 200ms ease-out' } : undefined,
        hoverable && isHovered ? HOVER_STYLE : undefined,
        entranceWillChange,
        entrance.style,
        resolveDot(dotProp),
        style,
      )
    }, [variant, shadow, padding, hoverable, isHovered, entrance.style, entrance.className, dotProp, style])

    return (
      <div
        ref={composeRefs(ref, entrance.ref)}
        style={computedStyle}
        onMouseEnter={hoverable ? () => setIsHovered(true) : undefined}
        onMouseLeave={hoverable ? () => setIsHovered(false) : undefined}
        {...props}
      />
    )
  }
)

Card.displayName = "Card"

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  dot?: string
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(s("flex flex-col gap-1 p-3"), resolveDot(dotProp), style),
      [dotProp, style],
    )
    return <div ref={ref} style={computedStyle} {...props} />
  }
)

CardHeader.displayName = "CardHeader"

export interface CardTitleProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'className'> {
  dot?: string
}

const CardTitle = React.forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(
        s("text-lg font-semibold leading-tight tracking-tight"),
        resolveDot(dotProp),
        style,
      ),
      [dotProp, style],
    )
    return <h3 ref={ref} style={computedStyle} {...props} />
  }
)

CardTitle.displayName = "CardTitle"

export interface CardDescriptionProps extends Omit<React.HTMLAttributes<HTMLParagraphElement>, 'className'> {
  dot?: string
}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(
        s("text-sm text-[var(--color-muted-foreground)]"),
        resolveDot(dotProp),
        style,
      ),
      [dotProp, style],
    )
    return <p ref={ref} style={computedStyle} {...props} />
  }
)

CardDescription.displayName = "CardDescription"

export interface CardContentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  dot?: string
}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(s("px-3 pb-3"), resolveDot(dotProp), style),
      [dotProp, style],
    )
    return <div ref={ref} style={computedStyle} {...props} />
  }
)

CardContent.displayName = "CardContent"

export interface CardFooterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  dot?: string
}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(
      () => mergeStyles(s("flex items-center px-3 pb-3"), resolveDot(dotProp), style),
      [dotProp, style],
    )
    return <div ref={ref} style={computedStyle} {...props} />
  }
)

CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
