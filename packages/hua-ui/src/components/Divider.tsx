"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Divider 컴포넌트의 props / Divider component props
 * @typedef {Object} DividerProps
 * @property {"horizontal" | "vertical"} [orientation="horizontal"] - Divider 방향 / Divider orientation
 * @property {"solid" | "dashed" | "dotted" | "gradient" | "glass"} [variant="solid"] - Divider 스타일 변형 / Divider style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Divider 크기 / Divider size
 * @property {"none" | "sm" | "md" | "lg" | "xl"} [spacing="md"] - Divider 주변 여백 / Divider spacing
 * @property {"default" | "muted" | "primary" | "secondary"} [color="default"] - Divider 색상 / Divider color
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  variant?: "solid" | "dashed" | "dotted" | "gradient" | "glass"
  size?: "sm" | "md" | "lg"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
  color?: "default" | "muted" | "primary" | "secondary"
}

/**
 * Divider 컴포넌트 / Divider component
 * 
 * 콘텐츠를 구분하는 구분선 컴포넌트입니다.
 * 가로/세로 방향, 다양한 스타일과 색상을 지원합니다.
 * 
 * Divider component for separating content.
 * Supports horizontal/vertical orientation, various styles and colors.
 * 
 * @component
 * @example
 * // 기본 사용 (가로) / Basic usage (horizontal)
 * <Divider />
 * 
 * @example
 * // 세로 구분선 / Vertical divider
 * <div className="flex">
 *   <div>왼쪽</div>
 *   <Divider orientation="vertical" />
 *   <div>오른쪽</div>
 * </div>
 * 
 * @example
 * // 다양한 스타일 / Various styles
 * <Divider variant="dashed" spacing="lg" />
 * <Divider variant="gradient" color="primary" />
 * 
 * @param {DividerProps} props - Divider 컴포넌트의 props / Divider component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Divider 컴포넌트 / Divider component
 */
const DividerComponent = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    className, 
    orientation = "horizontal",
    variant = "solid",
    size = "md",
    spacing = "md",
    color = "default",
    ...props 
  }, ref) => {
    const orientationClasses = React.useMemo(() => ({
      horizontal: "w-full",
      vertical: "h-full"
    }), [])

    // dashed/dotted는 border 스타일 사용, solid/gradient/glass는 height/width 사용
    const sizeClasses = React.useMemo(() => {
      const useBorder = variant === "dashed" || variant === "dotted"
      if (useBorder) {
        // border 스타일일 때는 border-width 사용
        return {
          sm: orientation === "horizontal" ? "border-t" : "border-l",
          md: orientation === "horizontal" ? "border-t-2" : "border-l-2",
          lg: orientation === "horizontal" ? "border-t-4" : "border-l-4"
        }
      }
      // 배경색 스타일일 때는 height/width 사용
      return {
        sm: orientation === "horizontal" ? "h-px" : "w-px",
        md: orientation === "horizontal" ? "h-0.5" : "w-0.5",
        lg: orientation === "horizontal" ? "h-1" : "w-1"
      }
    }, [orientation, variant])

    const variantClasses = React.useMemo(() => ({
      solid: "",
      dashed: "border-dashed",
      dotted: "border-dotted",
      gradient: orientation === "horizontal"
        ? "bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
        : "bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600",
      glass: orientation === "horizontal"
        ? "bg-gradient-to-r from-transparent via-white/30 to-transparent"
        : "bg-gradient-to-b from-transparent via-white/30 to-transparent"
    }), [orientation])

    // dashed/dotted는 border-color 사용, solid는 bg-color 사용
    const colorClasses = React.useMemo(() => {
      const useBorder = variant === "dashed" || variant === "dotted"
      if (useBorder) {
        return {
          default: "border-gray-200 dark:border-gray-700",
          muted: "border-gray-100 dark:border-gray-800",
          primary: "border-blue-200 dark:border-blue-700",
          secondary: "border-gray-300 dark:border-gray-600"
        }
      }
      return {
        default: "bg-gray-200 dark:bg-gray-700",
        muted: "bg-gray-100 dark:bg-gray-800",
        primary: "bg-blue-200 dark:bg-blue-700",
        secondary: "bg-gray-300 dark:bg-gray-600"
      }
    }, [variant])

    const spacingClasses = React.useMemo(() => ({
      none: "",
      sm: orientation === "horizontal" ? "my-4" : "mx-4", // 16px
      md: orientation === "horizontal" ? "my-6" : "mx-6", // 24px
      lg: orientation === "horizontal" ? "my-8" : "mx-8", // 32px
      xl: orientation === "horizontal" ? "my-12" : "mx-12" // 48px
    }), [orientation])

    return (
      <div
        ref={ref}
        className={merge(
          "flex-shrink-0",
          orientationClasses[orientation],
          sizeClasses[size],
          variant === "gradient" ? variantClasses[variant] : colorClasses[color],
          variant !== "gradient" && variantClasses[variant],
          spacingClasses[spacing],
          className
        )}
        {...props}
      />
    )
  }
)

DividerComponent.displayName = "Divider"

const Divider = React.memo(DividerComponent)

export { Divider } 