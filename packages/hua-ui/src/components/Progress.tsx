"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"

export const progressBarVariants = cva(
  "h-full rounded-full transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-foreground",
        success: "bg-[var(--progress-success)]",
        warning: "bg-[var(--progress-warning)]",
        error: "bg-[var(--progress-error)]",
        info: "bg-[var(--progress-info)]",
        glass: "bg-white/50 backdrop-blur-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export const progressTrackVariants = cva(
  "relative w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "bg-[var(--progress-track)] dark:bg-[var(--progress-track)]",
        success: "bg-[var(--progress-track)] dark:bg-[var(--progress-track)]",
        warning: "bg-[var(--progress-track)] dark:bg-[var(--progress-track)]",
        error: "bg-[var(--progress-track)] dark:bg-[var(--progress-track)]",
        info: "bg-[var(--progress-track)] dark:bg-[var(--progress-track)]",
        glass: "bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-slate-800/10 dark:border-slate-700/50",
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

/**
 * Progress 컴포넌트의 props
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

/**
 * Progress 컴포넌트 / Progress component
 *
 * 진행률을 표시하는 프로그레스 바 컴포넌트입니다.
 *
 * @example
 * <Progress value={50} />
 * <Progress value={75} variant="success" label="업로드" showValue />
 * <Progress value={90} variant="warning" striped animated />
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
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

    return (
      <div className={merge("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="flex items-center justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            )}
            {showValue && (
              <span className="text-sm text-muted-foreground">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        )}

        <div
          ref={ref}
          className={progressTrackVariants({ variant: resolvedVariant, size })}
        >
          <div
            className={merge(
              progressBarVariants({ variant: resolvedVariant }),
              striped && "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_100%] animate-pulse",
              animated && "animate-pulse"
            )}
            style={{
              width: `${percentage}%`,
              transition: animated ? "width 0.3s ease-out" : "none"
            }}
          />
        </div>

        {description && (
          <p className="mt-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

// 편의 컴포넌트들
export const ProgressSuccess = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="success" className={className} {...props} />
  )
)
ProgressSuccess.displayName = "ProgressSuccess"

export const ProgressWarning = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="warning" className={className} {...props} />
  )
)
ProgressWarning.displayName = "ProgressWarning"

export const ProgressError = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="error" className={className} {...props} />
  )
)
ProgressError.displayName = "ProgressError"

export const ProgressInfo = React.forwardRef<HTMLDivElement, Omit<ProgressProps, "variant">>(
  ({ className, ...props }, ref) => (
    <Progress ref={ref} variant="info" className={className} {...props} />
  )
)
ProgressInfo.displayName = "ProgressInfo"

// 복합 Progress 컴포넌트들
export const ProgressWrapper = React.forwardRef<HTMLDivElement, ProgressProps & { title?: string }>(
  ({ title, className, ...props }, ref) => (
    <div className={merge("p-4 bg-card rounded-lg border border-border", className)}>
      {title && (
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {title}
        </h3>
      )}
      <Progress ref={ref} {...props} />
    </div>
  )
)
ProgressWrapper.displayName = "ProgressWrapper"

export const ProgressGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={merge("space-y-4", className)}
      {...props}
    >
      {children}
    </div>
  )
)
ProgressGroup.displayName = "ProgressGroup"

export { Progress }
