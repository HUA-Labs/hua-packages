"use client"

import React from "react"
import { cn } from "../lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded"
  width?: string | number
  height?: string | number
  animation?: "pulse" | "wave" | "shimmer"
  className?: string
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ 
    className, 
    variant = "text",
    width,
    height,
    animation = "pulse",
    ...props 
  }, ref) => {
    const getVariantClasses = () => {
      switch (variant) {
        case "circular":
          return "rounded-full"
        case "rounded":
          return "rounded-lg"
        case "rectangular":
          return "rounded-none"
        case "text":
        default:
          return "rounded"
      }
    }

    const getAnimationClasses = () => {
      switch (animation) {
        case "wave":
          return "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"
        case "shimmer":
          return "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"
        case "pulse":
        default:
          return "animate-pulse bg-gray-200 dark:bg-gray-700"
      }
    }

    const getDefaultDimensions = () => {
      switch (variant) {
        case "circular":
          return { width: "40px", height: "40px" }
        case "text":
          return { width: "100%", height: "1em" }
        case "rounded":
          return { width: "100%", height: "200px" }
        case "rectangular":
          return { width: "100%", height: "200px" }
        default:
          return { width: "100%", height: "1em" }
      }
    }

    const defaultDims = getDefaultDimensions()
    const finalWidth = width || defaultDims.width
    const finalHeight = height || defaultDims.height

    return (
      <div
        ref={ref}
        className={cn(
          "block",
          getVariantClasses(),
          getAnimationClasses(),
          className
        )}
        style={{
          width: typeof finalWidth === "number" ? `${finalWidth}px` : finalWidth,
          height: typeof finalHeight === "number" ? `${finalHeight}px` : finalHeight,
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// 편의 컴포넌트들
export const SkeletonText = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="text" className={className} {...props} />
  )
)
SkeletonText.displayName = "SkeletonText"

export const SkeletonCircle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="circular" className={className} {...props} />
  )
)
SkeletonCircle.displayName = "SkeletonCircle"

export const SkeletonRectangle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="rectangular" className={className} {...props} />
  )
)
SkeletonRectangle.displayName = "SkeletonRectangle"

export const SkeletonRounded = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Skeleton ref={ref} variant="rounded" className={className} {...props} />
  )
)
SkeletonRounded.displayName = "SkeletonRounded"

// 복합 스켈레톤 컴포넌트들
export const SkeletonCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4 p-6", className)} // 16px 간격, 24px 패딩
      {...props}
    >
      <div className="flex items-center space-x-4"> {/* 16px 간격 */}
        <SkeletonCircle className="w-12 h-12" /> {/* 48px 크기 */}
        <div className="space-y-2 flex-1"> {/* 8px 간격 */}
          <SkeletonText className="h-4 w-3/4" /> {/* 16px 높이, 75% 너비 */}
          <SkeletonText className="h-3 w-1/2" /> {/* 12px 높이, 50% 너비 */}
        </div>
      </div>
      <SkeletonRounded className="w-full h-32" /> {/* 128px 높이 */}
      <div className="space-y-2"> {/* 8px 간격 */}
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
        <SkeletonText className="h-4 w-4/6" />
      </div>
    </div>
  )
)
SkeletonCard.displayName = "SkeletonCard"

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center space-x-4", className)} // 16px 간격
      {...props}
    >
      <SkeletonCircle className="w-12 h-12" /> {/* 48px 크기 */}
      <div className="space-y-2 flex-1"> {/* 8px 간격 */}
        <SkeletonText className="h-4 w-3/4" />
        <SkeletonText className="h-3 w-1/2" />
      </div>
    </div>
  )
)
SkeletonAvatar.displayName = "SkeletonAvatar"

export const SkeletonImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)} // 8px 간격
      {...props}
    >
      <SkeletonRounded className="w-full h-48" /> {/* 192px 높이 */}
      <SkeletonText className="h-4 w-1/2" />
    </div>
  )
)
SkeletonImage.displayName = "SkeletonImage"

export const SkeletonUserProfile = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)} // 16px 간격
      {...props}
    >
      <div className="flex items-center space-x-4"> {/* 16px 간격 */}
        <SkeletonCircle className="w-16 h-16" /> {/* 64px 크기 */}
        <div className="space-y-2 flex-1"> {/* 8px 간격 */}
          <SkeletonText className="h-5 w-1/2" />
          <SkeletonText className="h-3 w-1/3" />
        </div>
      </div>
      <div className="space-y-2"> {/* 8px 간격 */}
        <SkeletonText className="h-4 w-full" />
        <SkeletonText className="h-4 w-5/6" />
      </div>
    </div>
  )
)
SkeletonUserProfile.displayName = "SkeletonUserProfile"

export const SkeletonList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)} // 16px 간격
      {...props}
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4"> {/* 16px 간격 */}
          <SkeletonCircle className="w-10 h-10" /> {/* 40px 크기 */}
          <div className="space-y-2 flex-1"> {/* 8px 간격 */}
            <SkeletonText className="h-4 w-3/4" />
            <SkeletonText className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
)
SkeletonList.displayName = "SkeletonList"

export const SkeletonTable = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)} // 16px 간격
      {...props}
    >
      {/* 헤더 */}
      <div className="flex space-x-4"> {/* 16px 간격 */}
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-4 w-1/4" />
        <SkeletonText className="h-4 w-1/4" />
      </div>
      {/* 행들 */}
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex space-x-4"> {/* 16px 간격 */}
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/4" />
          <SkeletonText className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  )
)
SkeletonTable.displayName = "SkeletonTable"

export { Skeleton } 