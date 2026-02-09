"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import { IconName } from "../lib/icons"
import { useScrollToggle } from "../hooks/useScrollToggle"

/**
 * ScrollToTop 컴포넌트의 props / ScrollToTop component props
 * @typedef {Object} ScrollToTopProps
 * @property {number} [threshold=400] - 표시 임계값 (px, 이 값 이상 스크롤 시 표시) / Display threshold (px, shows when scrolled beyond this value)
 * @property {boolean} [smooth=true] - 부드러운 스크롤 여부 / Smooth scroll
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {IconName} [icon='arrowUp'] - 아이콘 이름 / Icon name
 * @property {"sm" | "md" | "lg"} [size="md"] - 버튼 크기 / Button size
 * @property {"default" | "primary" | "secondary" | "outline" | "ghost"} [variant="default"] - 버튼 스타일 변형 / Button style variant
 * @property {boolean} [showOnMount=false] - 마운트 시 즉시 표시 여부 / Show immediately on mount
 * @extends {React.HTMLAttributes<HTMLButtonElement>}
 */
export interface ScrollToTopProps extends React.HTMLAttributes<HTMLButtonElement> {
  threshold?: number
  smooth?: boolean
  className?: string
  icon?: IconName
  size?: "sm" | "md" | "lg"
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost"
  showOnMount?: boolean
}

/**
 * ScrollToTop 컴포넌트 / ScrollToTop component
 * 
 * 페이지 상단으로 스크롤하는 버튼 컴포넌트입니다.
 * 지정된 임계값 이상 스크롤 시 자동으로 표시됩니다.
 * 
 * Button component that scrolls to top of page.
 * Automatically appears when scrolled beyond specified threshold.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ScrollToTop />
 * 
 * @example
 * // 커스텀 설정 / Custom settings
 * <ScrollToTop 
 *   threshold={500}
 *   variant="primary"
 *   size="lg"
 *   icon="arrowUp"
 * />
 * 
 * @param {ScrollToTopProps} props - ScrollToTop 컴포넌트의 props / ScrollToTop component props
 * @returns {JSX.Element} ScrollToTop 컴포넌트 / ScrollToTop component
 */
const ScrollToTop = ({ 
  className, 
  threshold = 400, 
  smooth = true, 
  icon = "arrowUp",
  size = "md",
  variant = "default",
  showOnMount = false,
  ...props 
}: ScrollToTopProps) => {
    // HUA Motion의 useScrollToggle 훅 사용
    const { isVisible, scrollToTop, mounted: _mounted } = useScrollToggle({
      threshold,
      showOnMount,
      smooth
    })

    const sizeClasses = {
      sm: "w-8 h-8 sm:w-10 sm:h-10",
      md: "w-10 h-10 sm:w-12 sm:h-12", 
      lg: "w-12 h-12 sm:w-14 sm:h-14"
    }



    const variantClasses = {
      default: "bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 dark:bg-muted/20 dark:border-border/50 dark:text-foreground dark:hover:bg-muted/30",
      primary: "bg-primary/70 backdrop-blur-md border border-primary/40 text-white hover:bg-primary/80 transition-all duration-300 dark:bg-primary/70 dark:border-primary/40 dark:hover:bg-primary/80",
      secondary: "bg-muted/80 backdrop-blur-md border border-border text-foreground hover:bg-muted/90 dark:bg-muted/50 dark:border-border dark:text-foreground dark:hover:bg-muted/60",
      outline: "border border-white/40 bg-white/15 backdrop-blur-md text-white hover:bg-white/25 dark:border-border/50 dark:bg-muted/15 dark:text-foreground dark:hover:bg-muted/25",
      ghost: "bg-transparent hover:bg-white/15 backdrop-blur-md text-white dark:text-foreground dark:hover:bg-muted/25"
    }

    return (
      <button
        onClick={scrollToTop}
        className={merge(
          "fixed z-[9999] rounded-full transition-all duration-500 ease-in-out",
          "flex items-center justify-center",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-ring/50",
          "transform hover:scale-105 active:scale-95",
          // 페이드 애니메이션
          isVisible 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 translate-y-4 pointer-events-none",
          className,
          sizeClasses[size],
          variantClasses[variant]
        )}
        aria-label="Scroll to top"
        {...props}
      >
        <Icon name={icon} className="w-5 h-5" />
      </button>
    )
}

export { ScrollToTop } 