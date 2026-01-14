"use client"

import React from "react"
import { merge } from "../lib/utils"

/**
 * Input 컴포넌트의 props / Input component props
 * HTML input 요소의 모든 표준 속성을 상속받습니다.
 * Inherits all standard attributes of HTML input element.
 * @typedef {Object} InputProps
 * @extends {React.InputHTMLAttributes<HTMLInputElement>}
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Visual style variant */
  variant?: "default" | "outline" | "filled" | "glass"
  /** Error state indicator */
  error?: boolean
  /** Success state indicator */
  success?: boolean
}

/**
 * Input 컴포넌트 / Input component
 * 
 * 표준 HTML input 요소를 래핑한 스타일링된 입력 필드 컴포넌트입니다.
 * 접근성 속성(aria-invalid)을 자동으로 처리합니다.
 * 
 * Styled input field component wrapping standard HTML input element.
 * Automatically handles accessibility attributes (aria-invalid).
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Input type="text" placeholder="이름을 입력하세요" />
 * 
 * @example
 * // 에러 상태 / Error state
 * <Input 
 *   type="email" 
 *   placeholder="이메일"
 *   aria-invalid={true}
 * />
 * 
 * @example
 * // ref 사용 / Using ref
 * const inputRef = useRef<HTMLInputElement>(null)
 * <Input ref={inputRef} type="text" />
 * 
 * @param {InputProps} props - Input 컴포넌트의 props / Input component props
 * @param {React.Ref<HTMLInputElement>} ref - input 요소 ref / input element ref
 * @returns {JSX.Element} Input 컴포넌트 / Input component
 */
const variantStyles = {
  default: "border-input bg-background",
  outline: "border-2 border-input bg-transparent",
  filled: "border-transparent bg-secondary/50",
  glass: "border-white/20 bg-white/10 text-white placeholder:text-white/50 backdrop-blur-sm",
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", error, success, ...props }, ref) => {
    // aria-invalid이 명시적으로 전달되지 않았고, error prop이 있으면 자동 설정
    const ariaInvalid = props["aria-invalid" as keyof typeof props] as boolean | undefined;
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false);

    return (
      <input
        type={type}
        className={merge(
          "flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-blue-400 hover:shadow-sm",
          variantStyles[variant],
          isInvalid && "border-red-500 focus-visible:ring-red-500",
          success && "border-green-500 focus-visible:ring-green-500",
          className
        )}
        ref={ref}
        aria-invalid={isInvalid || undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 