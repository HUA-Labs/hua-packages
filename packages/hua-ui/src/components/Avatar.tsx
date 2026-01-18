"use client"

import React, { useState } from "react"
import { merge } from "../lib/utils"

/**
 * Avatar 컴포넌트의 props / Avatar component props
 * @typedef {Object} AvatarProps
 * @property {"sm" | "md" | "lg"} [size="md"] - 아바타 크기 / Avatar size
 * @property {"default" | "glass"} [variant="default"] - 아바타 스타일 변형 / Avatar style variant
 * @property {string} [src] - 이미지 URL / Image URL
 * @property {string} [alt] - 이미지 대체 텍스트 / Image alt text
 * @property {string} [fallbackText] - Fallback 표시 텍스트 (기본: alt의 첫 글자) / Fallback display text (default: first char of alt)
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  variant?: "default" | "glass"
  src?: string
  alt?: string
  fallbackText?: string
}

/**
 * AvatarImage 컴포넌트의 props
 * @typedef {Object} AvatarImageProps
 * @extends {React.ImgHTMLAttributes<HTMLImageElement>}
 */
export interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}

/**
 * AvatarFallback 컴포넌트의 props
 * @typedef {Object} AvatarFallbackProps
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * Avatar 컴포넌트 / Avatar component
 * 
 * 사용자 프로필 이미지를 표시하는 컴포넌트입니다.
 * 이미지가 없을 경우 대체 텍스트나 초기 문자를 표시합니다.
 * 
 * Component for displaying user profile images.
 * Shows fallback text or initials when image is not available.
 * 
 * @component
 * @example
 * // 기본 사용 (이미지) / Basic usage (with image)
 * <Avatar src="/user.jpg" alt="사용자" />
 * 
 * @example
 * // 대체 텍스트 / Fallback text
 * <Avatar alt="홍길동">홍</Avatar>
 * 
 * @example
 * // Glass 스타일 / Glass style
 * <Avatar variant="glass" size="lg" src="/user.jpg" alt="사용자" />
 * 
 * @param {AvatarProps} props - Avatar 컴포넌트의 props / Avatar component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Avatar 컴포넌트 / Avatar component
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", variant = "default", src, alt, fallbackText, children, ...props }, ref) => {
    const [imgError, setImgError] = useState(false)

    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base"
    }

    const variantClasses = {
      default: "",
      glass: "ring-2 ring-white/30 backdrop-blur-sm"
    }

    // Fallback 텍스트 결정: fallbackText > children > alt 첫글자 > "U"
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
        className={merge(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
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

/**
 * AvatarImage 컴포넌트 / AvatarImage component
 * 
 * 아바타 이미지를 표시하는 컴포넌트입니다.
 * Displays the avatar image.
 * 
 * @component
 * @param {AvatarImageProps} props - AvatarImage 컴포넌트의 props / AvatarImage component props
 * @param {React.Ref<HTMLImageElement>} ref - img 요소 ref / img element ref
 * @returns {JSX.Element} AvatarImage 컴포넌트 / AvatarImage component
 */
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

/**
 * AvatarFallback 컴포넌트 / AvatarFallback component
 * 
 * 아바타 이미지가 없을 때 표시되는 대체 컴포넌트입니다.
 * Fallback component displayed when avatar image is not available.
 * 
 * @component
 * @param {AvatarFallbackProps} props - AvatarFallback 컴포넌트의 props / AvatarFallback component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} AvatarFallback 컴포넌트 / AvatarFallback component
 */
const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={merge(
        "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 text-white font-semibold",
        className
      )}
      {...props}
    />
  )
)
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback } 