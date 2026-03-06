"use client"

import React from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

/**
 * LoadingSpinner 컴포넌트의 props / LoadingSpinner component props
 * @typedef {Object} LoadingSpinnerProps
 * @property {"sm" | "md" | "lg" | "xl"} [size="md"] - Spinner 크기 / Spinner size
 * @property {"default" | "dots" | "bars" | "ring" | "ripple"} [variant="default"] - Spinner 애니메이션 타입 / Spinner animation type
 * @property {string} [text] - Spinner 아래 표시할 텍스트 / Text to display below spinner
 * @property {"default" | "primary" | "secondary" | "success" | "warning" | "error" | "glass"} [color="default"] - Spinner 색상 / Spinner color
 * @property {string} [dot] - dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style)
 * @property {React.CSSProperties} [style] - 추가 인라인 스타일 / Additional inline style
 */
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "dots" | "bars" | "ring" | "ripple"
  text?: string
  color?: "default" | "primary" | "secondary" | "success" | "warning" | "error" | "glass"
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string
  style?: React.CSSProperties
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
  size = "md",
  variant = "default",
  text,
  color = "default",
  dot: dotProp,
  style,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6", // 24px - 더 넉넉한 크기
    md: "w-8 h-8", // 32px - 더 넉넉한 크기
    lg: "w-12 h-12", // 48px - 더 넉넉한 크기
    xl: "w-16 h-16" // 64px - 더 넉넉한 크기
  }

  // LoadingSpinner는 border 색상을 사용하므로 특화 색상 시스템 사용
  // 다크모드: track(배경)은 밝게, spinner(회전부)는 더 밝게 → 대비 확보
  const spinnerColors: Record<string, string> = {
    default: "border-muted-foreground/30 border-t-muted-foreground dark:border-muted-foreground/20 dark:border-t-muted-foreground/80",
    primary: "border-primary/30 border-t-primary dark:border-primary/20 dark:border-t-primary/80",
    secondary: "border-muted-foreground/30 border-t-muted-foreground dark:border-muted-foreground/20 dark:border-t-muted-foreground/80",
    success: "border-green-300 border-t-green-600 dark:border-green-500/50 dark:border-t-green-300",
    warning: "border-yellow-300 border-t-yellow-600 dark:border-yellow-500/50 dark:border-t-yellow-300",
    error: "border-red-300 border-t-red-600 dark:border-red-500/50 dark:border-t-red-300",
    glass: "border-white/50 border-t-white/90 dark:border-slate-400/60 dark:border-t-slate-100"
  }

  const borderSizeClass = size === "xl" ? "border-[3px]" : size === "lg" ? "border-[2.5px]" : "border-2"

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        // 순차 점멸 애니메이션 (... 형태)
        return (
          <>
            <style>{`
              @keyframes dotPulse {
                0%, 80%, 100% { opacity: 0.3; }
                40% { opacity: 1; }
              }
            `}</style>
            <div style={resolveDot("flex space-x-1 items-center")}>
              <div style={{ ...resolveDot("w-2 h-2 bg-current rounded-full"), animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '0ms' }} />
              <div style={{ ...resolveDot("w-2 h-2 bg-current rounded-full"), animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '200ms' }} />
              <div style={{ ...resolveDot("w-2 h-2 bg-current rounded-full"), animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: '400ms' }} />
            </div>
          </>
        )
      case "bars":
        return (
          <>
            <style>{`
              @keyframes barWave {
                0%, 40%, 100% { transform: scaleY(0.4); }
                20% { transform: scaleY(1); }
              }
            `}</style>
            <div style={resolveDot("flex space-x-0.5 h-full items-center")}>
              <div style={{ ...resolveDot("w-1 h-full bg-current rounded-sm origin-bottom"), animation: 'barWave 1.2s ease-in-out infinite', animationDelay: '0ms' }} />
              <div style={{ ...resolveDot("w-1 h-full bg-current rounded-sm origin-bottom"), animation: 'barWave 1.2s ease-in-out infinite', animationDelay: '100ms' }} />
              <div style={{ ...resolveDot("w-1 h-full bg-current rounded-sm origin-bottom"), animation: 'barWave 1.2s ease-in-out infinite', animationDelay: '200ms' }} />
              <div style={{ ...resolveDot("w-1 h-full bg-current rounded-sm origin-bottom"), animation: 'barWave 1.2s ease-in-out infinite', animationDelay: '300ms' }} />
              <div style={{ ...resolveDot("w-1 h-full bg-current rounded-sm origin-bottom"), animation: 'barWave 1.2s ease-in-out infinite', animationDelay: '400ms' }} />
            </div>
          </>
        )
      case "ring":
        return (
          <div style={mergeStyles(
            resolveDot("w-full h-full animate-spin rounded-full"),
            resolveDot(borderSizeClass),
            resolveDot(spinnerColors[color] || spinnerColors.default)
          )} />
        )
      case "ripple":
        return (
          <div style={resolveDot("relative w-full h-full")}>
            <div style={mergeStyles(
              resolveDot("absolute inset-0 rounded-full border-2 animate-ping"),
              resolveDot(spinnerColors[color] || spinnerColors.default)
            )} />
            <div style={mergeStyles(
              resolveDot("w-full h-full rounded-full border-2"),
              resolveDot(spinnerColors[color] || spinnerColors.default)
            )} />
          </div>
        )
      default:
        return (
          <div style={mergeStyles(
            resolveDot("w-full h-full animate-spin rounded-full"),
            resolveDot(borderSizeClass),
            resolveDot(spinnerColors[color] || spinnerColors.default)
          )} />
        )
    }
  }

  return (
    <div style={mergeStyles(resolveDot("flex flex-col items-center justify-center"), resolveDot(dotProp), style)}>
      <div style={mergeStyles(resolveDot(sizeClasses[size]), resolveDot("text-muted-foreground"))}>
        {renderSpinner()}
      </div>
      {text && (
        <p style={resolveDot("mt-3 text-sm text-muted-foreground text-center")}>
          {text}
        </p>
      )}
    </div>
  )
}
