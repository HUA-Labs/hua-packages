"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * ScrollArea 컴포넌트의 props / ScrollArea component props
 * @typedef {Object} ScrollAreaProps
 * @property {React.ReactNode} children - 스크롤 영역 내용 / Scroll area content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {"vertical" | "horizontal" | "both"} [orientation="vertical"] - 스크롤 방향 / Scroll direction
 * @property {number} [scrollHideDelay=600] - 스크롤바 숨김 지연 시간 (ms) / Scrollbar hide delay (ms)
 * @property {"auto" | "always" | "scroll" | "hover"} [type="hover"] - 스크롤바 표시 타입 / Scrollbar display type
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  orientation?: "vertical" | "horizontal" | "both"
  scrollHideDelay?: number
  type?: "auto" | "always" | "scroll" | "hover"
}

/**
 * ScrollArea 컴포넌트 / ScrollArea component
 * 
 * 커스텀 스크롤바를 가진 스크롤 영역 컴포넌트입니다.
 * 호버 시 스크롤바를 표시하거나 항상 표시할 수 있습니다.
 * 
 * Scroll area component with custom scrollbar.
 * Can display scrollbar on hover or always.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ScrollArea className="h-64">
 *   <div>긴 내용...</div>
 * </ScrollArea>
 * 
 * @example
 * // 가로 스크롤, 항상 표시 / Horizontal scroll, always visible
 * <ScrollArea orientation="horizontal" type="always">
 *   <div className="flex space-x-4">...</div>
 * </ScrollArea>
 * 
 * @param {ScrollAreaProps} props - ScrollArea 컴포넌트의 props / ScrollArea component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollArea 컴포넌트 / ScrollArea component
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ 
    children, 
    className, 
    orientation = "vertical",
    scrollHideDelay = 600,
    type = "hover",
    ...props 
  }, ref) => {
    const [showScrollbar, setShowScrollbar] = React.useState(false)
    const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const handleMouseEnter = () => {
      if (type === "hover" || type === "always") {
        setShowScrollbar(true)
      }
    }

    const handleMouseLeave = () => {
      if (type === "hover") {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          setShowScrollbar(false)
        }, scrollHideDelay)
      }
    }

    React.useEffect(() => {
      if (type === "always") {
        setShowScrollbar(true)
      }
    }, [type])

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    return (
      <div
        ref={ref}
        className={merge(
          "relative overflow-auto scrollbar-thin",
          orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
          orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
          orientation === "both" && "overflow-auto",
          showScrollbar ? "scrollbar-visible" : "scrollbar-hidden",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

/**
 * ScrollBar 컴포넌트의 props / ScrollBar component props
 * @typedef {Object} ScrollBarProps
 * @property {"vertical" | "horizontal"} [orientation="vertical"] - 스크롤바 방향 / Scrollbar direction
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 */
interface ScrollBarProps {
  orientation?: "vertical" | "horizontal"
  className?: string
}

/**
 * ScrollBar 컴포넌트 / ScrollBar component
 * 커스텀 스크롤바를 표시합니다.
 * Displays a custom scrollbar.
 * 
 * @component
 * @param {ScrollBarProps} props - ScrollBar 컴포넌트의 props / ScrollBar component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollBar 컴포넌트 / ScrollBar component
 */
const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({ orientation = "vertical", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={merge(
          "flex touch-none select-none transition-colors duration-150 ease-out",
          orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
          orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
          className
        )}
        {...props}
      />
    )
  }
)

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar } 