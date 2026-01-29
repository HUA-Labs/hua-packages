"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Slider 컴포넌트의 props
 * @typedef {Object} SliderProps
 * @property {"default" | "primary" | "success" | "warning" | "danger"} [variant="default"] - Slider 스타일 변형
 * @property {"sm" | "md" | "lg"} [size="md"] - Slider 크기
 * @property {boolean} [showValue=false] - 현재 값 표시 여부
 * @property {boolean} [showLabel=false] - 라벨 표시 여부
 * @property {string} [label] - 라벨 텍스트
 * @property {number} [min=0] - 최소값
 * @property {number} [max=100] - 최대값
 * @property {number} [step=1] - 단계값
 * @property {number | number[]} [value=0] - 현재 값 (배열이면 범위 슬라이더)
 * @property {(value: number | number[]) => void} [onValueChange] - 값 변경 콜백
 * @property {"horizontal" | "vertical"} [orientation="horizontal"] - Slider 방향
 * @property {boolean} [disabled=false] - 비활성화 여부
 * @property {string} [className] - 추가 CSS 클래스
 * @extends {Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'>}
 */
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

/**
 * Slider 컴포넌트 / Slider component
 * 
 * 숫자 값을 선택하는 슬라이더 컴포넌트입니다.
 * 단일 값 또는 범위 값을 선택할 수 있습니다.
 * 
 * Slider component for selecting numeric values.
 * Supports single value or range value selection.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * const [value, setValue] = useState(50)
 * <Slider value={value} onValueChange={setValue} />
 * 
 * @example
 * // 범위 슬라이더 / Range slider
 * const [range, setRange] = useState([20, 80])
 * <Slider 
 *   value={range} 
 *   onValueChange={setRange}
 *   showValue
 *   label="가격 범위"
 * />
 * 
 * @example
 * // 세로 슬라이더 / Vertical slider
 * <Slider 
 *   orientation="vertical"
 *   variant="primary"
 *   size="lg"
 *   className="h-64"
 * />
 * 
 * @param {SliderProps} props - Slider 컴포넌트의 props / Slider component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Slider 컴포넌트 / Slider component
 */
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
      primary: "bg-indigo-200 dark:bg-indigo-700",
      success: "bg-green-200 dark:bg-green-700",
      warning: "bg-yellow-200 dark:bg-yellow-700",
      danger: "bg-red-200 dark:bg-red-700"
    }

    const thumbVariantClasses = {
      default: "bg-gray-400 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-400",
      primary: "bg-primary hover:bg-primary/90 dark:bg-indigo-400 dark:hover:bg-indigo-500",
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
        className={merge(
          "appearance-none cursor-pointer rounded-full transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
      <div className={merge("flex items-center gap-4", orientationClasses)}>
        {showLabel && label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
            {label}
          </label>
        )}
        
        <div className="flex-1 relative">
          <div className={merge("relative", orientation === "vertical" ? "h-full" : "w-full h-4 flex items-center")}>
            {/* 배경 트랙 */}
            <div className={merge(
              "absolute rounded-full",
              sizeClasses[size],
              variantClasses[variant],
              orientation === "vertical" ? "h-full left-1/2 -translate-x-1/2" : "w-full"
            )} />
            
            {/* 활성 트랙 (값에 따른 채워진 부분) */}
            {isRange ? (
              // 범위 슬라이더
              <div className={merge(
                "absolute rounded-full bg-primary dark:bg-indigo-400",
                sizeClasses[size],
                orientation === "vertical"
                  ? "left-1/2 -translate-x-1/2"
                  : ""
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
              <div className={merge(
                "absolute rounded-full bg-primary dark:bg-indigo-400",
                sizeClasses[size],
                orientation === "vertical"
                  ? "left-1/2 -translate-x-1/2 bottom-0"
                  : "left-0"
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
                  className={merge(
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
                className={merge(
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
