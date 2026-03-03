"use client"

import React, { useState, useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const linkVariants = dotVariants({
  base: "",
  variants: {
    variant: {
      default: "text-[var(--color-foreground)]",
      primary: "text-[var(--color-primary)]",
      secondary: "text-[var(--color-muted-foreground)]",
      ghost: "text-[var(--color-muted-foreground)]",
      underline: "text-[var(--color-primary)] underline",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

/** Hover color overrides per variant */
const VARIANT_HOVER: Record<string, React.CSSProperties> = {
  default: { color: 'var(--color-muted-foreground)' },
  primary: { opacity: 0.8 },
  secondary: { color: 'var(--color-foreground)' },
  ghost: { color: 'var(--color-foreground)' },
  underline: { opacity: 0.8, textDecoration: 'none' },
}

/**
 * Link 컴포넌트의 props / Link component props
 */
export interface LinkProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "ghost" | "underline"
  size?: "sm" | "md" | "lg"
  external?: boolean
  dot?: string
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Link 컴포넌트 / Link component
 *
 * 링크를 표시하는 컴포넌트입니다.
 * 외부 링크의 경우 자동으로 `target="_blank"`와 `rel="noopener noreferrer"`를 설정합니다.
 *
 * @example
 * <Link href="/about">소개</Link>
 * <Link href="https://example.com" external>외부 사이트</Link>
 * <Link href="/contact" variant="primary" size="lg">문의하기</Link>
 */
export function Link({
  href,
  children,
  dot: dotProp,
  variant = "default",
  size = "md",
  external = false,
  style,
  onClick,
}: LinkProps) {
  const [isHovered, setIsHovered] = useState(false)

  const computedStyle = useMemo(() => {
    const base = linkVariants({ variant, size }) as React.CSSProperties
    const transitionStyle: React.CSSProperties = {
      transition: 'color 200ms ease-out, opacity 200ms ease-out, text-decoration 200ms ease-out',
    }
    const hoverStyle = isHovered ? VARIANT_HOVER[variant] : undefined
    return mergeStyles(base, transitionStyle, hoverStyle, resolveDot(dotProp), style)
  }, [variant, size, isHovered, dotProp, style])

  return (
    <a
      href={href}
      style={computedStyle}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </a>
  )
}
