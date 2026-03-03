"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const skeletonVariantStyles = dotVariants(
  {
    base: "block",
    variants: {
      variant: {
        text: "rounded w-full h-4",
        circular: "rounded-full w-10 h-10",
        rounded: "rounded-lg w-full h-[200px]",
        rectangular: "rounded-none w-full h-[200px]",
      },
      animation: {
        pulse: "",
        wave: "",
        shimmer: "",
      },
    },
    defaultVariants: {
      variant: "text",
      animation: "pulse",
    },
  }
)

/** Pulse animation style (uses CSS animation) */
const PULSE_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--color-muted)',
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}

/** Wave/shimmer gradient animation style */
const SHIMMER_STYLE: React.CSSProperties = {
  background: "linear-gradient(90deg, hsl(var(--muted)) 0%, hsl(var(--muted-foreground) / 0.2) 50%, hsl(var(--muted)) 100%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
}

/**
 * Skeleton component props
 */
export interface SkeletonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  variant?: "text" | "circular" | "rectangular" | "rounded"
  width?: string | number
  height?: string | number
  animation?: "pulse" | "wave" | "shimmer"
  dot?: string
  style?: React.CSSProperties
}

/**
 * Skeleton component
 *
 * A skeleton component for displaying loading placeholders.
 *
 * @example
 * <Skeleton />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rounded" width="100%" height={200} animation="wave" />
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({
    variant = "text",
    width,
    height,
    animation = "pulse",
    dot: dotProp,
    style,
    ...props
  }, ref) => {
    const computedStyle = useMemo(() => {
      const base = skeletonVariantStyles({ variant, animation }) as React.CSSProperties
      const animStyle = animation === "pulse" ? PULSE_STYLE : SHIMMER_STYLE
      return mergeStyles(
        base,
        animStyle,
        width != null ? { width: typeof width === "number" ? `${width}px` : width } : undefined,
        height != null ? { height: typeof height === "number" ? `${height}px` : height } : undefined,
        resolveDot(dotProp),
        style,
      )
    }, [variant, animation, width, height, dotProp, style])

    return (
      <>
        {(animation === "wave" || animation === "shimmer") && (
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        )}
        <div
          ref={ref}
          style={computedStyle}
          {...props}
        />
      </>
    )
  }
)
Skeleton.displayName = "Skeleton"

// Convenience components
export const SkeletonText = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Skeleton ref={ref} variant="text" dot={dotProp} {...props} />
  )
)
SkeletonText.displayName = "SkeletonText"

export const SkeletonCircle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Skeleton ref={ref} variant="circular" dot={dotProp} {...props} />
  )
)
SkeletonCircle.displayName = "SkeletonCircle"

export const SkeletonRectangle = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Skeleton ref={ref} variant="rectangular" dot={dotProp} {...props} />
  )
)
SkeletonRectangle.displayName = "SkeletonRectangle"

export const SkeletonRounded = React.forwardRef<HTMLDivElement, Omit<SkeletonProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Skeleton ref={ref} variant="rounded" dot={dotProp} {...props} />
  )
)
SkeletonRounded.displayName = "SkeletonRounded"

// Composite skeleton components
export const SkeletonCard = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      s("p-6"),
      { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SkeletonCircle style={{ width: '48px', height: '48px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <SkeletonText style={{ height: '16px', width: '75%' }} />
            <SkeletonText style={{ height: '12px', width: '50%' }} />
          </div>
        </div>
        <SkeletonRounded style={{ width: '100%', height: '128px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText style={{ height: '16px', width: '100%' }} />
          <SkeletonText style={{ height: '16px', width: '83.333%' }} />
          <SkeletonText style={{ height: '16px', width: '66.667%' }} />
        </div>
      </div>
    )
  }
)
SkeletonCard.displayName = "SkeletonCard"

export const SkeletonAvatar = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      { display: 'flex', alignItems: 'center', gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <SkeletonCircle style={{ width: '48px', height: '48px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <SkeletonText style={{ height: '16px', width: '75%' }} />
          <SkeletonText style={{ height: '12px', width: '50%' }} />
        </div>
      </div>
    )
  }
)
SkeletonAvatar.displayName = "SkeletonAvatar"

export const SkeletonImage = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      { display: 'flex', flexDirection: 'column' as const, gap: '8px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <SkeletonRounded style={{ width: '100%', height: '192px' }} />
        <SkeletonText style={{ height: '16px', width: '50%' }} />
      </div>
    )
  }
)
SkeletonImage.displayName = "SkeletonImage"

export const SkeletonUserProfile = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SkeletonCircle style={{ width: '64px', height: '64px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            <SkeletonText style={{ height: '20px', width: '50%' }} />
            <SkeletonText style={{ height: '12px', width: '33.333%' }} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <SkeletonText style={{ height: '16px', width: '100%' }} />
          <SkeletonText style={{ height: '16px', width: '83.333%' }} />
        </div>
      </div>
    )
  }
)
SkeletonUserProfile.displayName = "SkeletonUserProfile"

export const SkeletonList = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SkeletonCircle style={{ width: '40px', height: '40px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              <SkeletonText style={{ height: '16px', width: '75%' }} />
              <SkeletonText style={{ height: '12px', width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }
)
SkeletonList.displayName = "SkeletonList"

export const SkeletonTable = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, ...props }, ref) => {
    const containerStyle = useMemo(() => mergeStyles(
      { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div ref={ref} style={containerStyle} {...props}>
        {/* Header */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <SkeletonText style={{ height: '16px', width: '25%' }} />
          <SkeletonText style={{ height: '16px', width: '25%' }} />
          <SkeletonText style={{ height: '16px', width: '25%' }} />
          <SkeletonText style={{ height: '16px', width: '25%' }} />
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} style={{ display: 'flex', gap: '16px' }}>
            <SkeletonText style={{ height: '16px', width: '25%' }} />
            <SkeletonText style={{ height: '16px', width: '25%' }} />
            <SkeletonText style={{ height: '16px', width: '25%' }} />
            <SkeletonText style={{ height: '16px', width: '25%' }} />
          </div>
        ))}
      </div>
    )
  }
)
SkeletonTable.displayName = "SkeletonTable"

export { Skeleton }
