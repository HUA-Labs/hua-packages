"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Tooltip 컴포넌트의 props / Tooltip component props
 * @typedef {Object} TooltipProps
 * @property {string} content - Tooltip 내용 / Tooltip content
 * @property {React.ReactNode} children - Tooltip이 연결될 요소 / Element to attach tooltip to
 * @property {"top" | "bottom" | "left" | "right"} [position="top"] - Tooltip 표시 위치 / Tooltip display position
 * @property {"default" | "light" | "dark"} [variant="default"] - Tooltip 스타일 변형 / Tooltip style variant
 * @property {number} [delay=300] - Tooltip 표시 지연 시간(ms) / Tooltip display delay (ms)
 * @property {boolean} [disabled=false] - Tooltip 비활성화 여부 / Disable tooltip
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: string
  children: React.ReactNode
  position?: "top" | "bottom" | "left" | "right"
  variant?: "default" | "light" | "dark"
  delay?: number
  disabled?: boolean
}

/**
 * Tooltip 컴포넌트 / Tooltip component
 * 
 * 호버 시 추가 정보를 표시하는 툴팁 컴포넌트입니다.
 * 마우스 호버 시 지연 시간 후 표시됩니다.
 * 
 * Tooltip component that displays additional information on hover.
 * Appears after a delay when the mouse hovers over the element.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Tooltip content="이것은 도움말입니다">
 *   <Button>호버하세요</Button>
 * </Tooltip>
 * 
 * @example
 * // 다양한 위치 / Different positions
 * <Tooltip content="위치 변경" position="bottom">
 *   <Icon name="info" />
 * </Tooltip>
 * 
 * @example
 * // 커스텀 스타일 / Custom styles
 * <Tooltip content="라이트 스타일" variant="light" delay={500}>
 *   <span>호버</span>
 * </Tooltip>
 * 
 * @param {TooltipProps} props - Tooltip 컴포넌트의 props / Tooltip component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Tooltip 컴포넌트 / Tooltip component
 * 
 * @todo 접근성 개선: role="tooltip" 추가 필요 / Accessibility: Add role="tooltip"
 * @todo 접근성 개선: aria-describedby 연결 필요 / Accessibility: Connect aria-describedby
 * @todo 접근성 개선: 키보드 포커스 시 Tooltip 표시 필요 / Accessibility: Show tooltip on keyboard focus
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ 
    className, 
    content,
    children,
    position = "top",
    variant = "default",
    delay = 300,
    disabled = false,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const [coords, setCoords] = React.useState({ x: 0, y: 0 })
    const timeoutRef = React.useRef<number | undefined>(undefined)
    const tooltipRef = React.useRef<HTMLDivElement>(null)

    const showTooltip = (e: React.MouseEvent) => {
      if (disabled) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      
      let x = 0
      let y = 0
      
      switch (position) {
        case "top":
          x = rect.left + rect.width / 2
          y = rect.top - 8 // 8px 간격
          break
        case "bottom":
          x = rect.left + rect.width / 2
          y = rect.bottom + 8 // 8px 간격
          break
        case "left":
          x = rect.left - 8 // 8px 간격
          y = rect.top + rect.height / 2
          break
        case "right":
          x = rect.right + 8 // 8px 간격
          y = rect.top + rect.height / 2
          break
      }
      
      setCoords({ x, y })
      
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
      }, delay)
    }

    const hideTooltip = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsVisible(false)
    }

    React.useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    }, [])

    const getVariantClasses = () => {
      switch (variant) {
        case "light":
          return "bg-white text-gray-900 border border-gray-200 shadow-lg"
        case "dark":
          return "bg-gray-900 text-white shadow-lg"
        default:
          return "bg-gray-800 text-white shadow-lg"
      }
    }

    const getPositionClasses = () => {
      switch (position) {
        case "top":
          return "bottom-full left-1/2 -translate-x-1/2 mb-2" // 8px 간격
        case "bottom":
          return "top-full left-1/2 -translate-x-1/2 mt-2" // 8px 간격
        case "left":
          return "right-full top-1/2 -translate-y-1/2 mr-2" // 8px 간격
        case "right":
          return "left-full top-1/2 -translate-y-1/2 ml-2" // 8px 간격
        default:
          return "bottom-full left-1/2 -translate-x-1/2 mb-2"
      }
    }

    const getArrowClasses = () => {
      switch (position) {
        case "top":
          return "top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-800"
        case "bottom":
          return "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800 dark:border-b-gray-800"
        case "left":
          return "left-full top-1/2 -translate-y-1/2 border-l-gray-800 dark:border-l-gray-800"
        case "right":
          return "right-full top-1/2 -translate-y-1/2 border-r-gray-800 dark:border-r-gray-800"
        default:
          return "top-full left-1/2 -translate-x-1/2 border-t-gray-800 dark:border-t-gray-800"
      }
    }

    return (
      <div
        ref={ref}
        className={merge("relative inline-block", className)}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        {...props}
      >
        {children}
        
        {isVisible && (
          <div
            ref={tooltipRef}
            className={merge(
              "fixed z-50 px-3 py-2 text-sm rounded-lg whitespace-nowrap pointer-events-none", // 12px, 8px 패딩
              getVariantClasses()
            )}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {content}
            {/* 화살표 */}
            <div
              className={merge(
                "absolute w-0 h-0 border-4 border-transparent",
                getArrowClasses()
              )}
            />
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

// 편의 컴포넌트들
export const TooltipLight = React.forwardRef<HTMLDivElement, Omit<TooltipProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Tooltip ref={ref} variant="light" className={className} {...props} />
  )
)
TooltipLight.displayName = "TooltipLight"

export const TooltipDark = React.forwardRef<HTMLDivElement, Omit<TooltipProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Tooltip ref={ref} variant="dark" className={className} {...props} />
  )
)
TooltipDark.displayName = "TooltipDark"

export { Tooltip } 