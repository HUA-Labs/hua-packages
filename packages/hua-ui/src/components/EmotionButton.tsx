"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * EmotionButton 컴포넌트의 props / EmotionButton component props
 * @typedef {Object} EmotionButtonProps
 * @property {string} emotion - 감정 이모지 또는 텍스트 / Emotion emoji or text
 * @property {boolean} [isSelected=false] - 선택 상태 / Selected state
 * @property {"sm" | "md" | "lg"} [size="md"] - 버튼 크기 / Button size
 * @extends {React.ButtonHTMLAttributes<HTMLButtonElement>}
 */
export interface EmotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  emotion: string
  isSelected?: boolean
  size?: "sm" | "md" | "lg"
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
  ({ className, emotion, isSelected = false, size = "md", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-8 h-8 text-sm",
      md: "w-12 h-12 text-lg",
      lg: "w-16 h-16 text-xl"
    }

    return (
      <button
        ref={ref}
        className={merge(
          "rounded-full border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500",
          sizeClasses[size],
          isSelected 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800",
          className
        )}
        {...props}
      >
        {emotion}
      </button>
    )
  }
)
EmotionButton.displayName = "EmotionButton"

export { EmotionButton } 