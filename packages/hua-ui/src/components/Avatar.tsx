"use client"

import React, { useState, useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const avatarVariantStyles = dotVariants(
  {
    base: "relative flex shrink-0 overflow-hidden rounded-full",
    variants: {
      size: {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
      },
      variant: {
        default: "",
        glass: "backdrop-blur-sm",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

/** Glass variant ring effect — not expressible in dot utilities */
const GLASS_EXTRAS: React.CSSProperties = {
  boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)',
}

/**
 * Avatar 컴포넌트의 props / Avatar component props
 */
export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "glass"
  src?: string
  alt?: string
  fallbackText?: string
  dot?: string
  style?: React.CSSProperties
}

export interface AvatarImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'className'> {
  dot?: string
  style?: React.CSSProperties
}

export interface AvatarFallbackProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  dot?: string
  style?: React.CSSProperties
}

/**
 * Avatar 컴포넌트 / Avatar component
 *
 * 사용자 프로필 이미지를 표시하는 컴포넌트입니다.
 *
 * @example
 * <Avatar src="/user.jpg" alt="사용자" />
 * <Avatar alt="홍길동">홍</Avatar>
 * <Avatar variant="glass" size="lg" src="/user.jpg" alt="사용자" />
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ dot: dotProp, size = "md", variant = "default", src, alt, fallbackText, style, children, ...props }, ref) => {
    const [imgError, setImgError] = useState(false)

    const getFallbackContent = () => {
      if (fallbackText) return fallbackText
      if (children) return children
      if (alt) return alt.charAt(0).toUpperCase()
      return "U"
    }

    const showImage = src && !imgError

    const computedStyle = useMemo(() => {
      const base = avatarVariantStyles({ size, variant }) as React.CSSProperties
      return mergeStyles(
        base,
        variant === "glass" ? GLASS_EXTRAS : undefined,
        resolveDot(dotProp),
        style,
      )
    }, [size, variant, dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      >
        {showImage ? (
          <AvatarImage
            src={src}
            alt={alt || "avatar"}
            onError={() => setImgError(true)}
          />
        ) : (
          <AvatarFallback>
            {getFallbackContent()}
          </AvatarFallback>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(() => mergeStyles(
      s("h-full w-full"),
      { aspectRatio: '1', objectFit: 'cover', objectPosition: 'center' },
      resolveDot(dotProp),
      style,
    ), [dotProp, style])

    return (
      <img
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ dot: dotProp, style, ...props }, ref) => {
    const computedStyle = useMemo(() => mergeStyles(
      s("flex h-full w-full items-center justify-center rounded-full font-semibold"),
      {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-primary-foreground)',
      },
      resolveDot(dotProp),
      style,
    ), [dotProp, style])

    return (
      <div
        ref={ref}
        style={computedStyle}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
