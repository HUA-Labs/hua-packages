"use client"

import React, { useState, useMemo } from "react"
import { mergeStyles, resolveDot } from '../../../hooks/useDotMap';

/**
 * EmotionButton 컴포넌트의 props / EmotionButton component props
 * @typedef {Object} EmotionButtonProps
 * @property {string} emotion - 감정 이모지 또는 텍스트 / Emotion emoji or text
 * @property {boolean} [isSelected=false] - 선택 상태 / Selected state
 * @property {"sm" | "md" | "lg"} [size="md"] - 버튼 크기 / Button size
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
export interface EmotionButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  emotion: string
  isSelected?: boolean
  size?: "sm" | "md" | "lg"
  dot?: string
  style?: React.CSSProperties
}

/**
 * EmotionButton 컴포넌트 / EmotionButton component
 *
 * 감정을 선택하는 버튼 컴포넌트입니다.
 * 이모지나 텍스트로 감정을 표시하며, 선택 상태를 지원합니다.
 *
 * Button component for selecting emotions.
 * Displays emotion as emoji or text and supports selected state.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <EmotionButton emotion="😊" />
 *
 * @example
 * // 선택 상태 / Selected state
 * <EmotionButton
 *   emotion="😊"
 *   isSelected
 *   size="lg"
 * />
 *
 * @param {EmotionButtonProps} props - EmotionButton 컴포넌트의 props / EmotionButton component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} EmotionButton 컴포넌트 / EmotionButton component
 */
const EmotionButton = React.forwardRef<HTMLButtonElement, EmotionButtonProps>(
  ({ dot: dotProp, style, emotion, isSelected = false, size = "md", onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { width: '2rem', height: '2rem', fontSize: '0.875rem' },
      md: { width: '3rem', height: '3rem', fontSize: '1.125rem' },
      lg: { width: '4rem', height: '4rem', fontSize: '1.25rem' },
    }

    const computedStyle = useMemo(() => {
      const base: React.CSSProperties = {
        borderRadius: '9999px',
        borderWidth: '2px',
        borderStyle: 'solid',
        transition: 'all 200ms ease',
        outline: 'none',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }

      const selectedStyles: React.CSSProperties = isSelected
        ? { borderColor: 'rgb(99 102 241)', backgroundColor: 'rgb(238 242 255)' }
        : { borderColor: 'var(--color-border, rgb(209 213 219))', backgroundColor: 'var(--color-background, rgb(255 255 255))' }

      const hoverStyle: React.CSSProperties = isHovered
        ? { transform: 'scale(1.05)' }
        : {}

      const focusStyle: React.CSSProperties = isFocused
        ? { boxShadow: '0 0 0 1px var(--color-ring, rgb(99 102 241))' }
        : {}

      return mergeStyles(base, sizeStyles[size], selectedStyles, hoverStyle, focusStyle, resolveDot(dotProp), style)
    }, [isSelected, isHovered, isFocused, size, dotProp, style])

    return (
      <button
        ref={ref}
        style={computedStyle}
        onMouseEnter={(e) => { setIsHovered(true); onMouseEnter?.(e) }}
        onMouseLeave={(e) => { setIsHovered(false); onMouseLeave?.(e) }}
        onFocus={(e) => { setIsFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setIsFocused(false); onBlur?.(e) }}
        {...props}
      >
        {emotion}
      </button>
    )
  }
)
EmotionButton.displayName = "EmotionButton"

export { EmotionButton }
