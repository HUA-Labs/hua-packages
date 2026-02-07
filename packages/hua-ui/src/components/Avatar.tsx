"use client"

import React, { useState } from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
      },
      variant: {
        default: "",
        glass: "ring-1 ring-white/30 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  }
)

/**
 * Avatar 컴포넌트의 props / Avatar component props
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "glass"
  src?: string
  alt?: string
  fallbackText?: string
}

export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

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
  ({ className, size = "md", variant = "default", src, alt, fallbackText, children, ...props }, ref) => {
    const [imgError, setImgError] = useState(false)

    const getFallbackContent = () => {
      if (fallbackText) return fallbackText
      if (children) return children
      if (alt) return alt.charAt(0).toUpperCase()
      return "U"
    }

    const showImage = src && !imgError

    return (
      <div
        ref={ref}
        className={merge(avatarVariants({ size, variant }), className)}
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
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={merge("aspect-square h-full w-full object-cover object-center", className)}
      {...props}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={merge(
        "flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 