"use client"

import React, { useState, useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"
import type { CSSProperties } from "react"

const s = (input: string) => dotFn(input) as CSSProperties

export const textareaVariantStyles = dotVariants({
  base: "flex w-full rounded-md border",
  variants: {
    variant: {
      default: "border-[var(--color-input)] bg-[var(--color-background)] text-[var(--color-foreground)]",
      outline: "border-2 border-[var(--color-input)] bg-transparent text-[var(--color-foreground)]",
      filled: "border-transparent bg-[var(--color-secondary)]/50 text-[var(--color-foreground)]",
      ghost: "border-transparent bg-transparent text-[var(--color-foreground)]",
      glass: "",
    },
    size: {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-3 text-base",
      lg: "px-4 py-3 text-lg",
    },
    resize: {
      none: "",
      vertical: "",
      horizontal: "",
      both: "",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
    resize: "vertical",
  },
})

/** Resize → CSSProperties mapping (can't be dot utilities) */
const RESIZE_STYLE: Record<string, CSSProperties> = {
  none: { resize: 'none' },
  vertical: { resize: 'vertical' },
  horizontal: { resize: 'horizontal' },
  both: { resize: 'both' },
}

/** MinHeight per size */
const MIN_HEIGHT: Record<string, CSSProperties> = {
  sm: { minHeight: '80px' },
  md: { minHeight: '100px' },
  lg: { minHeight: '120px' },
}

/** Extra base styles per variant (can't be expressed as dot utilities) */
const VARIANT_EXTRAS: Record<string, CSSProperties> = {
  glass: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    color: 'white',
  },
}

/** Focus styles per variant */
const VARIANT_FOCUS: Record<string, CSSProperties> = {
  default: {
    outline: 'none',
    boxShadow: '0 0 0 1px var(--color-ring)',
    borderColor: 'var(--color-ring)',
  },
  outline: {
    outline: 'none',
    boxShadow: '0 0 0 1px var(--color-ring)',
    borderColor: 'var(--color-ring)',
  },
  filled: {
    outline: 'none',
    boxShadow: '0 0 0 1px var(--color-ring)',
    borderColor: 'var(--color-ring)',
    backgroundColor: 'var(--color-background)',
  },
  ghost: {
    outline: 'none',
    boxShadow: '0 0 0 1px var(--color-muted-foreground)',
    backgroundColor: 'var(--color-muted)',
    borderColor: 'var(--color-border)',
  },
  glass: {
    outline: 'none',
    boxShadow: '0 0 0 1px color-mix(in srgb, var(--color-ring) 20%, transparent)',
    borderColor: 'color-mix(in srgb, var(--color-ring) 50%, transparent)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
 * Textarea 컴포넌트의 props / Textarea component props
 */
export interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'size'> {
  variant?: "default" | "outline" | "filled" | "ghost" | "glass"
  size?: "sm" | "md" | "lg"
  error?: boolean
  success?: boolean
  resize?: "none" | "vertical" | "horizontal" | "both"
  dot?: string
  style?: CSSProperties
}

/**
 * Textarea 컴포넌트 / Textarea component
 *
 * 여러 줄 텍스트 입력을 위한 텍스트 영역 컴포넌트입니다.
 * 다양한 스타일 변형과 크기를 지원하며, 접근성 속성을 포함합니다.
 *
 * Text area component for multi-line text input.
 * Supports various style variants and sizes, includes accessibility attributes.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Textarea placeholder="내용을 입력하세요" />
 *
 * @example
 * // 에러 상태 / Error state
 * <Textarea
 *   error
 *   placeholder="에러가 발생했습니다"
 *   aria-label="설명 입력"
 * />
 *
 * @example
 * // 크기 조절 비활성화 / Disable resize
 * <Textarea
 *   resize="none"
 *   rows={5}
 *   placeholder="고정 크기 텍스트 영역"
 * />
 *
 * @param {TextareaProps} props - Textarea 컴포넌트의 props / Textarea component props
 * @param {React.Ref<HTMLTextAreaElement>} ref - textarea 요소 ref / textarea element ref
 * @returns {JSX.Element} Textarea 컴포넌트 / Textarea component
 *
 * @todo 접근성 개선: aria-invalid 속성 자동 추가 필요 / Accessibility improvement: auto-add aria-invalid attribute
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({
    dot: dotProp,
    style: styleProp,
    variant = "default",
    size = "md",
    error = false,
    success = false,
    resize = "vertical",
    ...props
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const ariaInvalid = props['aria-invalid' as keyof typeof props] as boolean | undefined
    const isInvalid = error || (ariaInvalid !== undefined ? ariaInvalid : false)
    const isDisabled = props.disabled ?? false

    const computedStyle = useMemo(() => {
      const base = mergeStyles(
        { transition: 'all 200ms' },
        textareaVariantStyles({ variant, size, resize }) as CSSProperties,
        VARIANT_EXTRAS[variant],
        RESIZE_STYLE[resize],
        MIN_HEIGHT[size],
      )

      if (isDisabled) {
        return mergeStyles(base, DISABLED_STYLE, resolveDot(dotProp), styleProp)
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

      return mergeStyles(base, stateStyles, resolveDot(dotProp), styleProp)
    }, [variant, size, resize, isHovered, isFocused, isDisabled, isInvalid, success, dotProp, styleProp])

    return (
      <textarea
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
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
