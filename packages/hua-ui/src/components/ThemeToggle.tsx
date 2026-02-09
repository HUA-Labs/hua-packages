"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import { useTheme } from "./ThemeProvider"

/**
 * ThemeToggle 컴포넌트의 props / ThemeToggle component props
 * @typedef {Object} ThemeToggleProps
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {"sm" | "md" | "lg"} [size="md"] - Toggle 크기 / Toggle size
 * @property {"button" | "icon" | "switch"} [variant="button"] - Toggle 스타일 변형 / Toggle style variant
 * @property {boolean} [showLabel=false] - 라벨 표시 여부 / Show label
 * @property {Object} [label] - 커스텀 라벨 텍스트 / Custom label text
 * @property {string} [label.light="라이트"] - 라이트 모드 라벨 / Light mode label
 * @property {string} [label.dark="다크"] - 다크 모드 라벨 / Dark mode label
 * @property {string} [label.system="시스템"] - 시스템 모드 라벨 / System mode label
 */
interface ThemeToggleProps {
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "button" | "icon" | "switch"
  showLabel?: boolean
  label?: {
    light?: string
    dark?: string
    system?: string
  }
}

/**
 * ThemeToggle 컴포넌트 / ThemeToggle component
 * 
 * 테마를 전환하는 토글 컴포넌트입니다.
 * ThemeProvider와 함께 사용하며, light/dark/system 테마를 지원합니다.
 * 
 * Toggle component for switching themes.
 * Used with ThemeProvider, supports light/dark/system themes.
 * 
 * @component
 * @example
 * // 기본 사용 (버튼 스타일) / Basic usage (button style)
 * <ThemeToggle />
 * 
 * @example
 * // 아이콘만 표시 / Icon only
 * <ThemeToggle variant="icon" size="lg" />
 * 
 * @example
 * // Switch 스타일 / Switch style
 * <ThemeToggle variant="switch" />
 * 
 * @example
 * // 라벨과 함께 / With label
 * <ThemeToggle 
 *   showLabel
 *   label={{ light: "밝게", dark: "어둡게" }}
 * />
 * 
 * @param {ThemeToggleProps} props - ThemeToggle 컴포넌트의 props / ThemeToggle component props
 * @returns {JSX.Element} ThemeToggle 컴포넌트 / ThemeToggle component
 */
export function ThemeToggle({
  className,
  size = "md",
  variant = "button",
  showLabel = false,
  label = {
    light: "라이트",
    dark: "다크",
    system: "시스템"
  },
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const sizeClasses = {
    sm: "h-10 w-10", // 40px - 더 넉넉한 크기
    md: "h-12 w-12", // 48px - 더 넉넉한 크기
    lg: "h-14 w-14" // 56px - 더 넉넉한 크기
  }

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }

  const renderIcon = () => {
    if (theme === "system") {
      return <Icon name="monitor" size={iconSizes[size]} />
    }
    return resolvedTheme === "dark" ? (
      <Icon name="moon" size={iconSizes[size]} />
    ) : (
      <Icon name="sun" size={iconSizes[size]} className="text-amber-600" />
    )
  }

  const handleClick = () => {
    if (theme === "system") {
      setTheme("light")
    } else if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")  // dark → light로 직접 전환
    }
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={merge(
          "inline-flex items-center justify-center rounded-lg transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          <div
            className={merge(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              resolvedTheme === "dark" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
            )}
          >
            <Icon name="moon" size={iconSizes[size]} className="text-indigo-500" />
          </div>
          <div
            className={merge(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              resolvedTheme === "dark" ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
            )}
          >
            <Icon name="sun" size={iconSizes[size]} className="text-amber-600 dark:text-yellow-500" />
          </div>
        </div>
      </button>
    )
  }

  if (variant === "switch") {
    return (
      <button
        onClick={handleClick}
        className={merge(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
          resolvedTheme === "dark" 
            ? "bg-primary"
            : "bg-muted",
          className
        )}
        {...props}
      >
        <span
          className={merge(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-lg",
            resolvedTheme === "dark" ? "translate-x-6" : "translate-x-1"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Icon name="sun" size={12} className="text-amber-600 dark:text-yellow-500 opacity-0" />
          <Icon name="moon" size={12} className="text-indigo-500 opacity-0" />
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={merge(
        "inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/50 focus-visible:ring-offset-2", // 12px 간격, 16px, 12px 패딩
        className
      )}
      {...props}
    >
      {renderIcon()}
      {showLabel && (
        <span className="text-foreground">
          {theme === "system" ? label.system : theme === "dark" ? label.dark : label.light}
        </span>
      )}
    </button>
  )
} 