"use client"

import * as React from "react"
import { cn } from "../lib/utils"

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  variant?: "default" | "primary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  showLabel?: boolean
  label?: string
  min?: number
  max?: number
  step?: number
  value?: number | number[]
  onValueChange?: (value: number | number[]) => void
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ 
    className,
    variant = "default",
    size = "md",
    showValue = false,
    showLabel = false,
    label,
    min = 0,
    max = 100,
    step = 1,
    value = 0,
    onValueChange,
    orientation = "horizontal",
    disabled = false,
    ...props 
  }, ref) => {
    const isRange = Array.isArray(value)
    const currentValue = isRange ? value : [value]
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value)
      if (onValueChange) {
        if (isRange) {
          // 범위 슬라이더의 경우, 어떤 슬라이더가 변경되었는지 확인
          const index = parseInt(e.target.dataset.index || "0")
          const newRange = [...currentValue]
          newRange[index] = newValue
          onValueChange(newRange)
        } else {
          onValueChange(newValue)
        }
      }
    }

    const variantClasses = {
      default: "bg-gray-200 dark:bg-gray-700",
      primary: "bg-blue-200 dark:bg-blue-700",
      success: "bg-green-200 dark:bg-green-700",
      warning: "bg-yellow-200 dark:bg-yellow-700",
      danger: "bg-red-200 dark:bg-red-700"
    }

    const thumbVariantClasses = {
      default: "bg-gray-400 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-400",
      primary: "bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500",
      success: "bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500",
      warning: "bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500",
      danger: "bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500"
    }

    const sizeClasses = {
      sm: orientation === "horizontal" ? "h-1" : "w-1",
      md: orientation === "horizontal" ? "h-2" : "w-2",
      lg: orientation === "horizontal" ? "h-3" : "w-3"
    }

    const thumbSizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-6 h-6"
    }

    const orientationClasses = orientation === "vertical" 
      ? "flex-col h-full" 
      : "flex-row w-full"

    const renderSlider = (index: number = 0) => (
      <input
        key={index}
        ref={index === 0 ? ref : undefined}
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue[index]}
        onChange={handleChange}
        data-index={index}
        disabled={disabled}
        className={cn(
          "appearance-none cursor-pointer rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size],
          variantClasses[variant],
          orientation === "vertical" ? "writing-mode: bt-lr; -webkit-appearance: slider-vertical" : "",
          className
        )}
        style={{
          ...(orientation === "vertical" && {
            writingMode: "vertical-rl" as const,
            WebkitAppearance: "slider-vertical"
          })
        }}
        {...props}
      />
    )

    const renderValue = () => {
      if (!showValue) return null
      
      if (isRange) {
        return (
          <div className="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
            {currentValue.map((val, index) => (
              <span key={index} className="font-mono">
                {val}
              </span>
            ))}
          </div>
        )
      }
      
      return (
        <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {currentValue[0]}
        </span>
      )
    }

    return (
      <div className={cn("flex items-center gap-4", orientationClasses)}>
        {showLabel && label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
            {label}
          </label>
        )}
        
        <div className="flex-1 relative">
          <div className={cn("relative", orientation === "vertical" ? "h-full" : "w-full")}>
            {/* 배경 트랙 */}
            <div className={cn(
              "absolute rounded-full",
              sizeClasses[size],
              variantClasses[variant],
              orientation === "vertical" ? "w-full bottom-0" : "h-full left-0"
            )} />
            
            {/* 활성 트랙 (값에 따른 채워진 부분) */}
            {isRange ? (
              // 범위 슬라이더
              <div className={cn(
                "absolute rounded-full bg-blue-500 dark:bg-blue-400",
                sizeClasses[size],
                orientation === "vertical" 
                  ? "w-full bottom-0" 
                  : "h-full left-0"
              )} style={{
                ...(orientation === "vertical" 
                  ? {
                      bottom: `${(currentValue[0] - min) / (max - min) * 100}%`,
                      height: `${(currentValue[1] - currentValue[0]) / (max - min) * 100}%`
                    }
                  : {
                      left: `${(currentValue[0] - min) / (max - min) * 100}%`,
                      width: `${(currentValue[1] - currentValue[0]) / (max - min) * 100}%`
                    }
                )
              }} />
            ) : (
              // 단일 슬라이더
              <div className={cn(
                "absolute rounded-full bg-blue-500 dark:bg-blue-400",
                sizeClasses[size],
                orientation === "vertical" 
                  ? "w-full bottom-0" 
                  : "h-full left-0"
              )} style={{
                ...(orientation === "vertical"
                  ? { height: `${(currentValue[0] - min) / (max - min) * 100}%` }
                  : { width: `${(currentValue[0] - min) / (max - min) * 100}%` }
                )
              }} />
            )}
            
            {/* 슬라이더 핸들들 */}
            {isRange ? (
              // 범위 슬라이더 핸들
              currentValue.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "absolute rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110",
                    thumbSizeClasses[size],
                    thumbVariantClasses[variant],
                    orientation === "vertical" 
                      ? "left-1/2 transform -translate-x-1/2" 
                      : "top-1/2 transform -translate-y-1/2"
                  )}
                  style={{
                    ...(orientation === "vertical"
                      ? { bottom: `${(currentValue[index] - min) / (max - min) * 100}%` }
                      : { left: `${(currentValue[index] - min) / (max - min) * 100}%` }
                    )
                  }}
                />
              ))
            ) : (
              // 단일 슬라이더 핸들
              <div
                className={cn(
                  "absolute rounded-full border-2 border-white shadow-lg transition-all duration-200 hover:scale-110",
                  thumbSizeClasses[size],
                  thumbVariantClasses[variant],
                  orientation === "vertical" 
                    ? "left-1/2 transform -translate-x-1/2" 
                    : "top-1/2 transform -translate-y-1/2"
                )}
                style={{
                  ...(orientation === "vertical"
                    ? { bottom: `${(currentValue[0] - min) / (max - min) * 100}%` }
                    : { left: `${(currentValue[0] - min) / (max - min) * 100}%` }
                  )
                }}
              />
            )}
          </div>
          
          {/* 실제 input 요소들 (숨김) */}
          <div className="absolute inset-0 opacity-0">
            {isRange ? (
              currentValue.map((_, index) => renderSlider(index))
            ) : (
              renderSlider()
            )}
          </div>
        </div>
        
        {renderValue()}
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
