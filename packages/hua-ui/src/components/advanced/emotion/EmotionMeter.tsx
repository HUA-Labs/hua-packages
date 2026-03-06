"use client"

import React from "react"
import { mergeStyles, resolveDot } from "../../../hooks/useDotMap"
import type { Color } from '../../../lib/types/common';

/**
 * EmotionMeter 컴포넌트의 props / EmotionMeter component props
 * @typedef {Object} EmotionMeterProps
 * @property {number} value - 감정 강도 값 (0-max) / Emotion intensity value (0-max)
 * @property {number} [max=100] - 최대값 / Maximum value
 * @property {"sm" | "md" | "lg"} [size="md"] - 미터 크기 / Meter size
 * @property {"blue" | "green" | "yellow" | "red"} [color="blue"] - 미터 색상 / Meter color
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface EmotionMeterProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  value: number
  max?: number
  size?: "sm" | "md" | "lg"
  color?: "blue" | "green" | "yellow" | "red" | Color
  dot?: string
  style?: React.CSSProperties
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
  ({ dot: dotProp, style, value, max = 100, size = "md", color = "blue", ...props }, ref) => {
    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { height: '0.5rem' },
      md: { height: '0.75rem' },
      lg: { height: '1rem' },
    }

    // EmotionMeter는 특정 색상만 사용 (감정 분석 특화)
    const emotionColorStyles: Record<string, React.CSSProperties> = {
      blue: { backgroundColor: 'rgb(99 102 241)' },
      green: { backgroundColor: 'rgb(34 197 94)' },
      yellow: { backgroundColor: 'rgb(234 179 8)' },
      red: { backgroundColor: 'rgb(239 68 68)' },
      purple: { backgroundColor: 'rgb(168 85 247)' },
      orange: { backgroundColor: 'rgb(249 115 22)' },
      indigo: { backgroundColor: 'rgb(99 102 241)' },
      pink: { backgroundColor: 'rgb(236 72 153)' },
      gray: { backgroundColor: 'rgb(107 114 128)' },
    }

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const containerStyle = mergeStyles(
      resolveDot('w-full rounded-full'),
      sizeStyles[size],
      { backgroundColor: 'var(--color-muted, rgb(229 231 235))' },
      resolveDot(dotProp),
      style,
    )

    const fillStyle = mergeStyles(
      { height: '100%', borderRadius: '9999px', transition: 'all 300ms ease' },
      emotionColorStyles[color as string] ?? emotionColorStyles.blue,
      { width: `${percentage}%` },
    )

    return (
      <div
        ref={ref}
        style={containerStyle}
        {...props}
      >
        <div style={fillStyle} />
      </div>
    )
  }
)
EmotionMeter.displayName = "EmotionMeter"

export { EmotionMeter }
