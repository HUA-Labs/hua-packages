"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Link 컴포넌트의 props / Link component props
 * @typedef {Object} LinkProps
 * @property {string} href - 링크 URL / Link URL
 * @property {React.ReactNode} children - 링크 텍스트 또는 내용 / Link text or content
 * @property {"default" | "primary" | "secondary" | "ghost" | "underline"} [variant="default"] - Link 스타일 변형 / Link style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Link 크기 / Link size
 * @property {boolean} [external=false] - 외부 링크 여부 (target="_blank" 자동 설정) / External link (auto sets target="_blank")
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {() => void} [onClick] - 클릭 이벤트 핸들러 / Click event handler
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
 * Link component for displaying links.
 * Automatically sets `target="_blank"` and `rel="noopener noreferrer"` for external links.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Link href="/about">소개</Link>
 * 
 * @example
 * // 외부 링크 / External link
 * <Link href="https://example.com" external>
 *   외부 사이트
 * </Link>
 * 
 * @example
 * // Primary 스타일 / Primary style
 * <Link href="/contact" variant="primary" size="lg">
 *   문의하기
 * </Link>
 * 
 * @param {LinkProps} props - Link 컴포넌트의 props / Link component props
 * @returns {JSX.Element} Link 컴포넌트 / Link component
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
  const variantClasses = {
    default: "text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300",
    primary: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300",
    secondary: "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200",
    ghost: "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:bg-gray-800",
    underline: "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline hover:no-underline"
  }

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  }

  return (
    <a
      href={href}
      className={merge(
        "transition-colors duration-200",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  )
} 