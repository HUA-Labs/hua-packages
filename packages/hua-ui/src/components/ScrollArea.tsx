"use client"

import React from "react"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

/**
 * ScrollArea 컴포넌트의 props / ScrollArea component props
 * @typedef {Object} ScrollAreaProps
 * @property {React.ReactNode} children - 스크롤 영역 내용 / Scroll area content
 * @property {"vertical" | "horizontal" | "both"} [orientation="vertical"] - 스크롤 방향 / Scroll direction
 * @property {number} [scrollHideDelay=600] - 스크롤바 숨김 지연 시간 (ms) / Scrollbar hide delay (ms)
 * @property {"auto" | "always" | "scroll" | "hover"} [type="hover"] - 스크롤바 표시 타입 / Scrollbar display type
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
interface ScrollAreaProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  children: React.ReactNode
  orientation?: "vertical" | "horizontal" | "both"
  scrollHideDelay?: number
  type?: "auto" | "always" | "scroll" | "hover"
  /** dot 유틸리티 스트링 (인라인 스타일로 변환) / dot utility string (converted to inline style) */
  dot?: string
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
 * <ScrollArea style={{ height: '16rem' }}>
 *   <div>긴 내용...</div>
 * </ScrollArea>
 *
 * @example
 * // 가로 스크롤, 항상 표시 / Horizontal scroll, always visible
 * <ScrollArea orientation="horizontal" type="always">
 *   <div style={{ display: 'flex', gap: '1rem' }}>...</div>
 * </ScrollArea>
 *
 * @param {ScrollAreaProps} props - ScrollArea 컴포넌트의 props / ScrollArea component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollArea 컴포넌트 / ScrollArea component
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({
    children,
    dot: dotProp,
    style: styleProp,
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

    const orientationClasses = {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto",
    }

    const scrollbarClass = showScrollbar ? "scrollbar-visible" : "scrollbar-hidden"

    return (
      <div
        ref={ref}
        style={mergeStyles(
          resolveDot("relative overflow-auto scrollbar-thin"),
          resolveDot(orientationClasses[orientation]),
          resolveDot(scrollbarClass),
          resolveDot(dotProp),
          styleProp
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
 */
interface ScrollBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  orientation?: "vertical" | "horizontal"
  dot?: string
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
  ({ orientation = "vertical", dot: dotProp, style, ...props }, ref) => {
    const orientationClasses = {
      vertical: "h-full w-2.5 border-l border-l-transparent p-[1px]",
      horizontal: "h-2.5 flex-col border-t border-t-transparent p-[1px]",
    }

    return (
      <div
        ref={ref}
        style={mergeStyles(
          resolveDot("flex touch-none select-none transition-colors duration-150 ease-out"),
          resolveDot(orientationClasses[orientation]),
          resolveDot(dotProp),
          style
        )}
        {...props}
      />
    )
  }
)

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
