'use client'

import React, { useState, useEffect } from 'react'
import { merge } from '../lib/utils'
import { LoadingSpinner } from './LoadingSpinner'

/**
 * PageTransition 컴포넌트의 props / PageTransition component props
 * @typedef {Object} PageTransitionProps
 * @property {React.ReactNode} children - 페이지 내용 / Page content
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {number} [duration=300] - 전환 지속 시간 (ms) / Transition duration (ms)
 * @property {'fade' | 'slide' | 'scale' | 'flip'} [variant='fade'] - 전환 애니메이션 타입 / Transition animation type
 * @property {'default' | 'dots' | 'bars' | 'ring' | 'ripple'} [loadingVariant='ripple'] - 로딩 스피너 타입 / Loading spinner type
 * @property {string} [loadingText='페이지 로딩 중...'] - 로딩 텍스트 / Loading text
 * @property {boolean} [showLoading=true] - 로딩 표시 여부 / Show loading
 * @property {() => void} [onTransitionStart] - 전환 시작 콜백 / Transition start callback
 * @property {() => void} [onTransitionEnd] - 전환 종료 콜백 / Transition end callback
 */
export interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  duration?: number
  variant?: 'fade' | 'slide' | 'scale' | 'flip'
  loadingVariant?: 'default' | 'dots' | 'bars' | 'ring' | 'ripple'
  loadingText?: string
  showLoading?: boolean
  onTransitionStart?: () => void
  onTransitionEnd?: () => void
}

/**
 * PageTransition 컴포넌트 / PageTransition component
 * 
 * 페이지 전환 애니메이션을 제공하는 컴포넌트입니다.
 * 다양한 전환 효과와 로딩 스피너를 지원합니다.
 * 
 * Component that provides page transition animations.
 * Supports various transition effects and loading spinners.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <PageTransition>
 *   <div>페이지 내용</div>
 * </PageTransition>
 * 
 * @example
 * // Slide 전환 / Slide transition
 * <PageTransition
 *   variant="slide"
 *   duration={500}
 *   loadingVariant="dots"
 * >
 *   <div>페이지 내용</div>
 * </PageTransition>
 * 
 * @param {PageTransitionProps} props - PageTransition 컴포넌트의 props / PageTransition component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} PageTransition 컴포넌트 / PageTransition component
 */
export const PageTransition = React.forwardRef<HTMLDivElement, PageTransitionProps>(({
  children,
  className,
  duration = 300,
  variant = 'fade',
  loadingVariant = 'ripple',
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
    fade: merge(
      'transition-opacity duration-300 ease-in-out',
      isVisible ? 'opacity-100' : 'opacity-0'
    ),
    slide: merge(
      'transition-transform duration-300 ease-in-out',
      isVisible ? 'translate-x-0' : 'translate-x-full'
    ),
    scale: merge(
      'transition-all duration-300 ease-in-out',
      isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
    ),
    flip: merge(
      'transition-all duration-500 ease-in-out',
      isVisible ? 'rotate-y-0 opacity-100' : 'rotate-y-90 opacity-0'
    )
  }

  if (isLoading && showLoading) {
    return (
      <div className={merge('flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800', className)}>
        <LoadingSpinner
          size="lg"
          variant={loadingVariant}
          text={loadingText}
        />
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={merge(
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