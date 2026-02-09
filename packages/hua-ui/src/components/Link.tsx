"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const linkVariants = cva(
  "transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "text-foreground hover:text-muted-foreground",
        primary: "text-primary hover:text-primary/80",
        secondary: "text-muted-foreground hover:text-foreground",
        ghost: "text-muted-foreground hover:text-foreground",
        underline: "text-primary hover:text-primary/80 underline hover:no-underline",
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
  }
)

/**
 * Link 컴포넌트의 props / Link component props
 */
export interface LinkProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "ghost" | "underline"
  size?: "sm" | "md" | "lg"
  external?: boolean
  className?: string
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
  className,
  variant = "default",
  size = "md",
  external = false,
  onClick
}: LinkProps) {
  return (
    <a
      href={href}
      className={merge(linkVariants({ variant, size }), className)}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  )
} 