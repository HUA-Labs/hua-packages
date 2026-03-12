"use client"

import React, { useState, useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import type { CSSProperties } from "react"

const s = (input: string) => dotFn(input) as CSSProperties

export const inputVariantStyles = dotVariants({
  base: "flex h-10 w-full rounded-md border px-3 py-2 text-sm",
  variants: {
    variant: {
      default: "border-[var(--color-input)] bg-[var(--color-background)]",
      outline: "border-2 border-[var(--color-input)] bg-transparent",
      filled: "border-transparent bg-[var(--color-secondary)]/50",
      glass: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

/** Extra base styles per variant (can't be expressed as dot utilities) */
const VARIANT_EXTRAS: Record<string, CSSProperties> = {
  glass: {
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
  },
}

/** Focus styles per variant */
const VARIANT_FOCUS: Record<string, CSSProperties> = {
  default: {
    outline: 'none',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-ring) 50%, transparent)',
    borderColor: 'var(--color-ring)',
  },
  outline: {
    outline: 'none',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-ring) 50%, transparent)',
    borderColor: 'var(--color-ring)',
  },
  filled: {
    outline: 'none',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-ring) 50%, transparent)',
    borderColor: 'var(--color-ring)',
  },
  glass: {
    outline: 'none',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-ring) 50%, transparent)',
    borderColor: 'var(--color-ring)',
  },
}

/** Hover styles */
const HOVER_STYLE: CSSProperties = {
  borderColor: 'var(--color-accent-foreground)',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
}

/** Disabled styles */
const DISABLED_STYLE: CSSProperties = {
  cursor: 'not-allowed',
  opacity: 0.5,
}

/** Error state styles */
const ERROR_STYLE: CSSProperties = {
  borderColor: 'var(--color-destructive)',
}

const ERROR_FOCUS_STYLE: CSSProperties = {
  outline: 'none',
  boxShadow: '0 0 0 1px var(--color-destructive)',
  borderColor: 'var(--color-destructive)',
}

/** Success state styles */
const SUCCESS_STYLE: CSSProperties = {
  borderColor: '#22c55e',
}

const SUCCESS_FOCUS_STYLE: CSSProperties = {
  outline: 'none',
  boxShadow: '0 0 0 1px #22c55e',
  borderColor: '#22c55e',
}

/**
 * Input 컴포넌트의 props / Input component props
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'size'> {
  variant?: "default" | "outline" | "filled" | "glass"
  error?: boolean
  success?: boolean
  dot?: string
  style?: CSSProperties
  leftIcon?: React.ReactNode
}

/**
 * Input 컴포넌트 / Input component
 *
 * 표준 HTML input 요소를 래핑한 스타일링된 입력 필드 컴포넌트입니다.
 *
 * @example
 * <Input type="text" placeholder="이름을 입력하세요" />
 * <Input type="email" error placeholder="이메일" />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ dot: dotProp, type, variant = "default", error, success, style, leftIcon, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const ariaInvalid = props["aria-invalid" as keyof typeof props] as boolean | undefined
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false)
    const isDisabled = props.disabled ?? false

    const computedStyle = useMemo(() => {
      const base = mergeStyles(
        { transition: 'all 200ms' },
        inputVariantStyles({ variant }) as CSSProperties,
        VARIANT_EXTRAS[variant],
        leftIcon ? { paddingLeft: '40px' } : undefined,
      )

      if (isDisabled) {
        return mergeStyles(base, DISABLED_STYLE, resolveDot(dotProp), style)
      }

      let stateStyles: CSSProperties = {}

      if (isHovered && !isFocused) {
        stateStyles = HOVER_STYLE
      }

      if (isFocused) {
        if (isInvalid) {
          stateStyles = ERROR_FOCUS_STYLE
        } else if (success) {
          stateStyles = SUCCESS_FOCUS_STYLE
        } else {
          stateStyles = VARIANT_FOCUS[variant] ?? VARIANT_FOCUS.default
        }
      }

      // Error/success border (non-focus)
      if (!isFocused) {
        if (isInvalid) {
          stateStyles = mergeStyles(stateStyles, ERROR_STYLE)
        } else if (success) {
          stateStyles = mergeStyles(stateStyles, SUCCESS_STYLE)
        }
      }

      return mergeStyles(base, stateStyles, resolveDot(dotProp), style)
    }, [variant, isHovered, isFocused, isDisabled, isInvalid, success, dotProp, style, leftIcon])

    const inputElement = (
      <input
        type={type}
        style={computedStyle}
        ref={ref}
        aria-invalid={isInvalid || undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={(e) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      />
    )

    if (leftIcon) {
      return (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-muted-foreground)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {leftIcon}
          </div>
          {inputElement}
        </div>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

export { Input }
