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
        ? "bg-primary text-primary-foreground hover:bg-primary/80"
        : "bg-muted text-foreground hover:bg-muted/80",
      outline: pressed
        ? "border-2 border-primary bg-primary/10 text-primary hover:bg-primary/15"
        : "border-2 border-border bg-transparent text-foreground hover:bg-muted",
      filled: pressed
        ? "bg-primary text-primary-foreground hover:bg-primary/80"
        : "bg-muted/50 text-foreground hover:bg-muted",
      ghost: pressed
        ? "bg-primary/10 text-primary hover:bg-primary/15"
        : "bg-transparent text-foreground hover:bg-muted",
      glass: pressed
        ? "bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 dark:bg-primary/20 dark:border-primary/50 dark:hover:bg-primary/30"
        : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 dark:bg-muted/10 dark:border-border/50 dark:text-foreground dark:hover:bg-muted/20"
    }

    return (
      <div className="flex items-start space-x-3">
        <button
          type="button"
          ref={ref}
          className={merge(
            "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200",
            "focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-2",
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
            <p className="text-sm text-muted-foreground">
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

