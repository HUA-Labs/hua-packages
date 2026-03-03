"use client"

import React, { useMemo } from "react"
import { dotVariants, dot as dotFn } from "@hua-labs/dot"
import { mergeStyles, resolveDot } from "../hooks/useDotMap"

const s = (input: string) => dotFn(input) as React.CSSProperties

export const progressBarVariantStyles = dotVariants(
  {
    base: "h-full rounded-full",
    variants: {
      variant: {
        default: "bg-[var(--color-foreground)]",
        success: "bg-[var(--progress-success)]",
        warning: "bg-[var(--progress-warning)]",
        error: "bg-[var(--progress-error)]",
        info: "bg-[var(--progress-info)]",
        glass: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/** Glass bar extras (can't be dot utilities) */
const GLASS_BAR_EXTRAS: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
}

export const progressTrackVariantStyles = dotVariants(
  {
    base: "relative w-full overflow-hidden rounded-full",
    variants: {
      variant: {
        default: "bg-[var(--progress-track)]",
        success: "bg-[var(--progress-track)]",
        warning: "bg-[var(--progress-track)]",
        error: "bg-[var(--progress-track)]",
        info: "bg-[var(--progress-track)]",
        glass: "",
      },
      size: {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

/** Glass track extras */
const GLASS_TRACK_EXTRAS: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}

/**
 * Progress component props
 */
export interface ProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  value?: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error" | "info" | "glass"
  showValue?: boolean
  animated?: boolean
  striped?: boolean
  label?: string
  description?: string
  autoVariant?: boolean
  dot?: string
  style?: React.CSSProperties
}

/**
 * Progress component
 *
 * A progress bar component for displaying progress.
 *
 * @example
 * <Progress value={50} />
 * <Progress value={75} variant="success" label="Upload" showValue />
 * <Progress value={90} variant="warning" striped animated />
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    dot: dotProp,
    style,
    value = 0,
    max = 100,
    size = "md",
    variant = "default",
    showValue = false,
    animated = true,
    striped = false,
    label,
    description,
    autoVariant = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const resolvedVariant = (() => {
      if (!autoVariant) return variant;
      const ratio = value / max;
      if (ratio > 0.5) return 'success';
      if (ratio > 0.25) return 'warning';
      return 'error';
    })();

    const containerStyle = useMemo(() =>
      mergeStyles(
        s("w-full"),
        resolveDot(dotProp),
        style,
      ),
      [dotProp, style]
    )

    const trackStyle = useMemo(() => {
      const base = progressTrackVariantStyles({ variant: resolvedVariant, size }) as React.CSSProperties
      return mergeStyles(
        base,
        resolvedVariant === "glass" ? GLASS_TRACK_EXTRAS : undefined,
      )
    }, [resolvedVariant, size])

    const barStyle = useMemo(() => {
      const base = progressBarVariantStyles({ variant: resolvedVariant }) as React.CSSProperties
      const stripedStyle: React.CSSProperties | undefined = striped ? {
        backgroundImage: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
        backgroundSize: '20px 100%',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      } : undefined
      return mergeStyles(
        base,
        { transition: animated ? 'width 0.3s ease-out' : 'none' },
        resolvedVariant === "glass" ? GLASS_BAR_EXTRAS : undefined,
        stripedStyle,
        { width: `${percentage}%` },
      )
    }, [resolvedVariant, animated, striped, percentage])

    const labelStyle = useMemo(() => s("text-sm font-medium text-[var(--color-foreground)]"), [])
    const valueStyle = useMemo(() => s("text-sm text-[var(--color-muted-foreground)]"), [])
    const descriptionStyle = useMemo(() => s("text-xs text-[var(--color-muted-foreground)]"), [])

    return (
      <div style={containerStyle} {...props}>
        {(label || showValue) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            {label && (
              <span style={labelStyle}>
                {label}
              </span>
            )}
            {showValue && (
              <span style={valueStyle}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        <div
          ref={ref}
          style={trackStyle}
        >
          <div style={barStyle} />
        </div>

        {description && (
          <p style={{ ...descriptionStyle, marginTop: '8px' }}>
            {description}
          </p>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Convenience components
export const ProgressSuccess = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Progress ref={ref} variant="success" dot={dotProp} {...props} />
  )
)
ProgressSuccess.displayName = "ProgressSuccess"

export const ProgressWarning = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Progress ref={ref} variant="warning" dot={dotProp} {...props} />
  )
)
ProgressWarning.displayName = "ProgressWarning"

export const ProgressError = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Progress ref={ref} variant="error" dot={dotProp} {...props} />
  )
)
ProgressError.displayName = "ProgressError"

export const ProgressInfo = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ dot: dotProp, ...props }, ref) => (
    <Progress ref={ref} variant="info" dot={dotProp} {...props} />
  )
)
ProgressInfo.displayName = "ProgressInfo"

// Composite Progress components
export const ProgressWrapper = React.forwardRef<HTMLDivElement, ProgressProps & { title?: string }>(
  ({ title, dot: dotProp, style: styleProp, ...props }, ref) => {
    const wrapperStyle = useMemo(() => mergeStyles(
      s("p-4 rounded-lg"),
      {
        backgroundColor: 'var(--color-card)',
        border: '1px solid var(--color-border)',
      },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    const titleStyle = useMemo(() => mergeStyles(
      s("text-sm font-semibold text-[var(--color-foreground)]"),
      { marginBottom: '12px' },
    ), [])

    return (
      <div style={wrapperStyle}>
        {title && (
          <h3 style={titleStyle}>
            {title}
          </h3>
        )}
        <Progress ref={ref} {...props} />
      </div>
    )
  }
)
ProgressWrapper.displayName = "ProgressWrapper"

export const ProgressGroup = React.forwardRef<HTMLDivElement, Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> & { dot?: string; style?: React.CSSProperties }>(
  ({ dot: dotProp, style: styleProp, children, ...props }, ref) => {
    const groupStyle = useMemo(() => mergeStyles(
      { display: 'flex', flexDirection: 'column' as const, gap: '16px' },
      resolveDot(dotProp),
      styleProp,
    ), [dotProp, styleProp])

    return (
      <div
        ref={ref}
        style={groupStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ProgressGroup.displayName = "ProgressGroup"

export { Progress }
