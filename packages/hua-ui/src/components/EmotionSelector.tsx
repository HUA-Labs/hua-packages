'use client'

import React from "react"
import { cn } from "../lib/utils"
import { EmotionButton } from "./EmotionButton"
import { EmotionMeter } from "./EmotionMeter"

interface EmotionSelectorProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedEmotion?: string
  onEmotionSelect?: (emotion: string) => void
  layout?: "grid" | "list" | "compact"
  showIntensity?: boolean
  intensity?: number
  onIntensityChange?: (intensity: number) => void
  emotions?: Array<{
    key: string
    label: string
    icon?: string
    color?: string
  }>
  size?: "sm" | "md" | "lg"
  variant?: "button" | "card" | "chip"
}

const defaultEmotions = [
  { key: "joy", label: "기쁨", icon: "smile", color: "yellow" },
  { key: "sadness", label: "슬픔", icon: "frown", color: "blue" },
  { key: "anger", label: "화남", icon: "angry", color: "red" },
  { key: "calm", label: "평온", icon: "heart", color: "green" },
  { key: "excitement", label: "설렘", icon: "star", color: "pink" },
  { key: "worry", label: "걱정", icon: "meh", color: "gray" },
  { key: "gratitude", label: "감사", icon: "heart", color: "purple" },
  { key: "loneliness", label: "외로움", icon: "user", color: "indigo" }
]

const EmotionSelector = React.forwardRef<HTMLDivElement, EmotionSelectorProps>(
  ({ 
    className, 
    selectedEmotion,
    onEmotionSelect,
    layout = "grid",
    showIntensity = false,
    intensity = 50,
    onIntensityChange,
    emotions = defaultEmotions,
    size = "md",
    variant = "button",
    ...props 
  }, ref) => {
    const handleEmotionClick = (emotionKey: string) => {
      onEmotionSelect?.(emotionKey)
    }

    const renderEmotionItem = (emotion: typeof emotions[0]) => {
      const isSelected = selectedEmotion === emotion.key
      
      if (variant === "button") {
        return (
          <EmotionButton
            key={emotion.key}
            emotion={emotion.key as any}
            isSelected={isSelected}
            size={size}
            onClick={() => handleEmotionClick(emotion.key)}
            className={cn(
              "transition-all duration-200",
              isSelected && "ring-2 ring-offset-2 ring-primary"
            )}
          >
            {emotion.label}
          </EmotionButton>
        )
      }

      if (variant === "card") {
        return (
          <div
            key={emotion.key}
            className={cn(
              "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
              isSelected 
                ? "border-primary bg-primary/5" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleEmotionClick(emotion.key)}
          >
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {emotion.icon && (
                  <span className="text-lg">
                    {emotion.icon === "smile" && "😊"}
                    {emotion.icon === "frown" && "😢"}
                    {emotion.icon === "angry" && "😠"}
                    {emotion.icon === "heart" && "❤️"}
                    {emotion.icon === "star" && "⭐"}
                    {emotion.icon === "meh" && "😐"}
                    {emotion.icon === "user" && "👤"}
                  </span>
                )}
              </div>
              <span className="font-medium truncate max-w-[120px]">{emotion.label}</span>
            </div>
          </div>
        )
      }

      if (variant === "chip") {
        return (
          <div
            key={emotion.key}
            className={cn(
              "px-3 py-1 rounded-full cursor-pointer transition-all duration-200 text-sm font-medium",
              isSelected 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => handleEmotionClick(emotion.key)}
          >
            <span className="truncate max-w-[100px]">{emotion.label}</span>
          </div>
        )
      }

      return null
    }

    const layoutClasses = {
      grid: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3",
      list: "space-y-2",
      compact: "flex flex-wrap gap-1"
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        <div className={layoutClasses[layout]}>
          {emotions.map(renderEmotionItem)}
        </div>

        {showIntensity && selectedEmotion && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">감정 강도</span>
              <span className="text-sm text-muted-foreground">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={intensity}
              onChange={(e) => onIntensityChange?.(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>약함</span>
              <span>보통</span>
              <span>강함</span>
            </div>
          </div>
        )}

        {selectedEmotion && showIntensity && (
          <div className="flex justify-center">
            <EmotionMeter
              value={intensity}
              size="md"
              color="blue"
            />
          </div>
        )}
      </div>
    )
  }
)

EmotionSelector.displayName = "EmotionSelector"

export { EmotionSelector } 