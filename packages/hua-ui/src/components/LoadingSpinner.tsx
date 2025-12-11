"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * LoadingSpinner 컴포넌트의 props / LoadingSpinner component props
 * @typedef {Object} LoadingSpinnerProps
 * @property {"sm" | "md" | "lg" | "xl"} [size="md"] - Spinner 크기 / Spinner size
 * @property {"default" | "dots" | "bars" | "ring" | "ripple"} [variant="default"] - Spinner 애니메이션 타입 / Spinner animation type
 * @property {string} [text] - Spinner 아래 표시할 텍스트 / Text to display below spinner
 * @property {"default" | "primary" | "secondary" | "success" | "warning" | "error" | "glass"} [color="default"] - Spinner 색상 / Spinner color
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "bars" | "ring" | "ripple"
  text?: string
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "glass"
  className?: string
}

/**
 * LoadingSpinner 컴포넌트 / LoadingSpinner component
 * 
 * 로딩 상태를 표시하는 스피너 컴포넌트입니다.
 * 다양한 애니메이션 타입과 크기를 지원합니다.
 * 
 * Spinner component that displays loading state.
 * Supports various animation types and sizes.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <LoadingSpinner />
 * 
 * @example
 * // 텍스트와 함께 / With text
 * <LoadingSpinner 
 *   text="로딩 중..."
 *   size="lg"
 *   color="primary"
 * />
 * 
 * @example
 * // 다양한 애니메이션 / Various animations
 * <LoadingSpinner variant="dots" />
 * <LoadingSpinner variant="bars" color="success" />
 * <LoadingSpinner variant="ripple" size="xl" />
 * 
 * @param {LoadingSpinnerProps} props - LoadingSpinner 컴포넌트의 props / LoadingSpinner component props
 * @returns {JSX.Element} LoadingSpinner 컴포넌트 / LoadingSpinner component
 */
export function LoadingSpinner({ 
  className, 
  size = "md", 
  variant = "default", 
  text, 
  color = "default" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6", // 24px - 더 넉넉한 크기
    md: "w-8 h-8", // 32px - 더 넉넉한 크기
    lg: "w-12 h-12", // 48px - 더 넉넉한 크기
    xl: "w-16 h-16" // 64px - 더 넉넉한 크기
  }

  // LoadingSpinner는 border 색상을 사용하므로 특화 색상 시스템 사용
  const spinnerColors: Record<string, string> = {
    default: "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
    primary: "border-blue-300 border-t-blue-600 dark:border-blue-600 dark:border-t-blue-300",
    secondary: "border-gray-300 border-t-gray-600 dark:border-gray-600 dark:border-t-gray-300",
    success: "border-green-300 border-t-green-600 dark:border-green-600 dark:border-t-green-300",
    warning: "border-yellow-300 border-t-yellow-600 dark:border-yellow-600 dark:border-t-yellow-300",
    error: "border-red-300 border-t-red-600 dark:border-red-600 dark:border-t-red-300",
    glass: "border-white/30 border-t-white/50 dark:border-slate-600/50 dark:border-t-slate-400/50"
  }

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
          </div>
        )
      case "bars":
        return (
          <div className="flex space-x-1 h-full items-end">
            <div className="w-1 bg-current animate-pulse" style={{ height: '60%' }} />
            <div className="w-1 bg-current animate-pulse delay-100" style={{ height: '80%' }} />
            <div className="w-1 bg-current animate-pulse delay-200" style={{ height: '40%' }} />
            <div className="w-1 bg-current animate-pulse delay-300" style={{ height: '100%' }} />
            <div className="w-1 bg-current animate-pulse delay-500" style={{ height: '70%' }} />
          </div>
        )
      case "ring":
        return (
          <div className={merge(
            "animate-spin rounded-full border-2",
            spinnerColors[color] || spinnerColors.default
          )} />
        )
      case "ripple":
        return (
          <div className="relative">
            <div className={merge(
              "absolute inset-0 rounded-full border-2 animate-ping",
              spinnerColors[color] || spinnerColors.default
            )} />
            <div className={merge(
              "rounded-full border-2",
              spinnerColors[color] || spinnerColors.default
            )} />
          </div>
        )
      default:
        return (
          <div className={merge(
            "animate-spin rounded-full border-2",
            spinnerColors[color] || spinnerColors.default
          )} />
        )
    }
  }

  return (
    <div className={merge("flex flex-col items-center justify-center", className)}>
      <div className={merge(sizeClasses[size], "text-gray-600 dark:text-gray-400")}>
        {renderSpinner()}
      </div>
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
          {text}
        </p>
      )}
    </div>
  )
} 