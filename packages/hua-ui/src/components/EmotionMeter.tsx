"use client"

import React from "react"
import { merge } from "../lib/utils"
import type { Color } from "../lib/types/common"

/**
 * EmotionMeter 컴포넌트의 props / EmotionMeter component props
 * @typedef {Object} EmotionMeterProps
 * @property {number} value - 감정 강도 값 (0-max) / Emotion intensity value (0-max)
 * @property {number} [max=100] - 최대값 / Maximum value
 * @property {"sm" | "md" | "lg"} [size="md"] - 미터 크기 / Meter size
 * @property {"blue" | "green" | "yellow" | "red"} [color="blue"] - 미터 색상 / Meter color
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface EmotionMeterProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "yellow" | "red" | Color
}

/**
 * EmotionMeter 컴포넌트 / EmotionMeter component
 * 
 * 감정 강도를 표시하는 미터 컴포넌트입니다.
 * Progress 컴포넌트와 유사하지만 감정 분석에 특화되어 있습니다.
 * 
 * Meter component that displays emotion intensity.
 * Similar to Progress component but specialized for emotion analysis.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <EmotionMeter value={75} />
 * 
 * @example
 * // 다양한 색상 / Various colors
 * <EmotionMeter 
 *   value={80}
 *   color="green"
 *   size="lg"
 * />
 * 
 * @param {EmotionMeterProps} props - EmotionMeter 컴포넌트의 props / EmotionMeter component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} EmotionMeter 컴포넌트 / EmotionMeter component
 */
const EmotionMeter = React.forwardRef<HTMLDivElement, EmotionMeterProps>(
  ({ className, value, max = 100, size = "md", color = "blue", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-2",
      md: "h-3", 
      lg: "h-4"
    }

    // EmotionMeter는 특정 색상만 사용 (감정 분석 특화)
    const emotionColors: Record<string, string> = {
      blue: "bg-indigo-500",
      green: "bg-green-500",
      yellow: "bg-yellow-500",
      red: "bg-red-500",
      // 추가 색상 지원
      purple: "bg-purple-500",
      orange: "bg-orange-500",
      indigo: "bg-indigo-500",
      pink: "bg-pink-500",
      gray: "bg-gray-500",
    }

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
      <div
        ref={ref}
        className={merge(
          "w-full bg-gray-200 rounded-full dark:bg-gray-700",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div
          className={merge(
            "h-full rounded-full transition-all duration-300",
            emotionColors[color] || emotionColors.blue
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
EmotionMeter.displayName = "EmotionMeter"

export { EmotionMeter } 