"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Toggle 컴포넌트의 props / Toggle component props
 * @typedef {Object} ToggleProps
 * @property {"default" | "outline" | "filled" | "ghost" | "glass"} [variant="default"] - Toggle 스타일 변형 / Toggle style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Toggle 크기 / Toggle size
 * @property {boolean} [pressed] - 제어 모드에서 눌림 상태 / Pressed state in controlled mode
 * @property {(pressed: boolean) => void} [onPressedChange] - 상태 변경 콜백 / State change callback
 * @property {string} [label] - Toggle 라벨 텍스트 / Toggle label text
 * @property {string} [description] - Toggle 설명 텍스트 / Toggle description text
 * @property {React.ReactNode} [icon] - 아이콘 / Icon
 * @property {"left" | "right"} [iconPosition="left"] - 아이콘 위치 / Icon position
 * @extends {Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'>}
 */
export interface ToggleProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  pressed?: boolean
  onPressedChange?: (pressed: boolean) => void
  label?: string
  description?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

/**
 * Toggle 컴포넌트 / Toggle component
 * 
 * 눌림 상태를 가지는 토글 버튼 컴포넌트입니다.
 * Switch와 달리 버튼 형태로 표시되며, 여러 개를 그룹으로 사용할 수 있습니다.
 * 
 * Toggle button component with pressed state.
 * Unlike Switch, displayed as a button and can be used in groups.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Toggle label="알림" />
 * 
 * @example
 * // 제어 모드 / Controlled mode
 * const [pressed, setPressed] = useState(false)
 * <Toggle 
 *   pressed={pressed}
 *   onPressedChange={setPressed}
 *   label="다크 모드"
 *   icon={<Icon name="moon" />}
 * />
 * 
 * @example
 * // 아이콘만 / Icon only
 * <Toggle 
 *   icon={<Icon name="heart" />}
 *   variant="ghost"
 * />
 * 
 * @param {ToggleProps} props - Toggle 컴포넌트의 props / Toggle component props
 * @param {React.Ref<HTMLButtonElement>} ref - button 요소 ref / button element ref
 * @returns {JSX.Element} Toggle 컴포넌트 / Toggle component
 */
const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ 
    className, 
    variant = "default",
    size = "md",
    pressed: controlledPressed,
    onPressedChange,
    label,
    description,
    icon,
    iconPosition = "left",
    onClick,
    ...props 
  }, ref) => {
    const [internalPressed, setInternalPressed] = React.useState(false)
    const isControlled = controlledPressed !== undefined
    const pressed = isControlled ? controlledPressed : internalPressed

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isControlled) {
        setInternalPressed(!pressed)
      }
      onPressedChange?.(!pressed)
      onClick?.(e)
    }

    const sizeClasses = {
      sm: "h-7 px-3 text-sm",
      md: "h-9 px-4 text-base",
      lg: "h-11 px-5 text-lg"
    }

    const variantClasses = {
      default: pressed
        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
      outline: pressed
        ? "border-2 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        : "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
      filled: pressed
        ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        : "bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
      ghost: pressed
        ? "bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
        : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
      glass: pressed
        ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 dark:bg-blue-400/20 dark:border-blue-300/50 dark:hover:bg-blue-400/30"
        : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 dark:bg-slate-800/10 dark:border-slate-600/50 dark:text-slate-200 dark:hover:bg-slate-700/20"
    }

    return (
      <div className="flex items-start space-x-3">
        <button
          type="button"
          ref={ref}
          className={merge(
            "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            sizeClasses[size],
            variantClasses[variant],
            className
          )}
          onClick={handleClick}
          aria-pressed={pressed}
          {...props}
        >
          {icon && iconPosition === "left" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
          {label && <span>{label}</span>}
          {icon && iconPosition === "right" && (
            <span className="flex-shrink-0">{icon}</span>
          )}
        </button>
        {description && (
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          </div>
        )}
      </div>
    )
  }
)
Toggle.displayName = "Toggle"

export { Toggle }

