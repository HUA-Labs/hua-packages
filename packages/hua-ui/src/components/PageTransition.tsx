'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

export interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  duration?: number
  variant?: 'fade' | 'slide' | 'scale' | 'flip'
  loadingVariant?: 'default' | 'rhythm' | 'flower' | 'heart' | 'star' | 'butterfly' | 'dots' | 'bars' | 'ring' | 'ripple'
  loadingText?: string
  showLoading?: boolean
  onTransitionStart?: () => void
  onTransitionEnd?: () => void
}

export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(({
  children,
  className,
  duration = 300,
  variant = 'fade',
  loadingVariant = 'butterfly',
  loadingText = '페이지 로딩 중...',
  showLoading = true,
  onTransitionStart,
  onTransitionEnd
}, ref) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      setIsVisible(true)
      onTransitionEnd?.()
    }, duration)

    onTransitionStart?.()

    return () => clearTimeout(timer)
  }, [duration, onTransitionStart, onTransitionEnd])

  const transitionClasses = {
    fade: cn(
      'transition-opacity duration-300 ease-in-out',
      isVisible ? 'opacity-100' : 'opacity-0'
    ),
    slide: cn(
      'transition-transform duration-300 ease-in-out',
      isVisible ? 'translate-x-0' : 'translate-x-full'
    ),
    scale: cn(
      'transition-all duration-300 ease-in-out',
      isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
    ),
    flip: cn(
      'transition-all duration-500 ease-in-out',
      isVisible ? 'rotate-y-0 opacity-100' : 'rotate-y-90 opacity-0'
    )
  }

  if (isLoading && showLoading) {
    return (
      <div className={cn('flex items-center justify-center min-h-screen', className)}>
        <LoadingSpinner
          size="lg"
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        'w-full',
        transitionClasses[variant],
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
})

PageTransition.displayName = 'PageTransition'

// Convenience components for different transition types
export const FadeTransition = React.forwardRef<HTMLDivElement, Omit<PageTransitionProps, 'variant'>>((props, ref) => (
  <PageTransition ref={ref} variant="fade" {...props} />
))

export const SlideTransition = React.forwardRef<HTMLDivElement, Omit<PageTransitionProps, 'variant'>>((props, ref) => (
  <PageTransition ref={ref} variant="slide" {...props} />
))

export const ScaleTransition = React.forwardRef<HTMLDivElement, Omit<PageTransitionProps, 'variant'>>((props, ref) => (
  <PageTransition ref={ref} variant="scale" {...props} />
))

export const FlipTransition = React.forwardRef<HTMLDivElement, Omit<PageTransitionProps, 'variant'>>((props, ref) => (
  <PageTransition ref={ref} variant="flip" {...props} />
))

// Add displayName for convenience components
FadeTransition.displayName = 'FadeTransition'
SlideTransition.displayName = 'SlideTransition'
ScaleTransition.displayName = 'ScaleTransition'
FlipTransition.displayName = 'FlipTransition' 