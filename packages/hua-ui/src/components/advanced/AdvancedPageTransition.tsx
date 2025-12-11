'use client'

import React, { useState, useEffect, useRef } from 'react'
import { merge } from '../../lib/utils'

export type TransitionType = 
  | 'fade' 
  | 'slide' 
  | 'scale' 
  | 'flip' 
  | 'morph' 
  | 'cube' 
  | 'zoom' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right'

export type TransitionEasing = 
  | 'linear' 
  | 'ease-in' 
  | 'ease-out' 
  | 'ease-in-out' 
  | 'bounce' 
  | 'elastic' 
  | 'smooth'

export interface AdvancedPageTransitionProps {
  children: React.ReactNode
  className?: string
  type?: TransitionType
  duration?: number
  easing?: TransitionEasing
  delay?: number
  autoStart?: boolean
  onStart?: () => void
  onComplete?: () => void
  showProgress?: boolean
  progressClassName?: string
}

export const AdvancedPageTransition = React.forwardRef<HTMLDivElement, AdvancedPageTransitionProps>(({
  children,
  className,
  type = 'fade',
  duration = 500,
  easing = 'smooth',
  delay = 0,
  autoStart = true,
  onStart,
  onComplete,
  showProgress = false,
  progressClassName
}, ref) => {
  const [isVisible, setIsVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const getEasingFunction = (easingType: TransitionEasing) => {
    const easingFunctions = {
      linear: (t: number) => t,
      'ease-in': (t: number) => t * t,
      'ease-out': (t: number) => 1 - Math.pow(1 - t, 2),
      'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      bounce: (t: number) => {
        if (t < 1 / 2.75) return 7.5625 * t * t
        if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
      },
      elastic: (t: number) => {
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
      },
      smooth: (t: number) => {
        return t * t * (3 - 2 * t)
      }
    }
    return easingFunctions[easingType]
  }

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const easingFunction = getEasingFunction(easing)
    
    let currentProgress = Math.min(elapsed / duration, 1)
    currentProgress = easingFunction(currentProgress)

    setProgress(currentProgress)
    setIsVisible(currentProgress > 0.1)

    if (currentProgress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setIsTransitioning(false)
      setProgress(1)
      onComplete?.()
    }
  }

  const startTransition = () => {
    setIsTransitioning(true)
    setProgress(0)
    onStart?.()
    
    startTimeRef.current = null
    animationRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        startTransition()
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [autoStart, delay])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const getTransitionStyles = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: isVisible ? 1 : 0,
          transform: 'none'
        }
      
      case 'slide':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `translateX(${(1 - progress) * 100}%)`
        }
      
      case 'slide-up':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `translateY(${(1 - progress) * 100}%)`
        }
      
      case 'slide-down':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `translateY(-${(1 - progress) * 100}%)`
        }
      
      case 'slide-left':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `translateX(-${(1 - progress) * 100}%)`
        }
      
      case 'slide-right':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `translateX(${(1 - progress) * 100}%)`
        }
      
      case 'scale':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `scale(${0.8 + progress * 0.2})`
        }
      
      case 'flip':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `perspective(1000px) rotateY(${(1 - progress) * 90}deg)`
        }
      
      case 'morph':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `scale(${0.9 + progress * 0.1}) rotate(${(1 - progress) * 5}deg)`
        }
      
      case 'cube':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `perspective(1000px) rotateX(${(1 - progress) * 90}deg) rotateY(${(1 - progress) * 45}deg)`
        }
      
      case 'zoom':
        return {
          opacity: isVisible ? 1 : 0,
          transform: `scale(${0.5 + progress * 0.5})`
        }
      
      default:
        return {
          opacity: isVisible ? 1 : 0,
          transform: 'none'
        }
    }
  }

  const transitionStyles = getTransitionStyles()

  return (
    <div className="relative">
      {showProgress && (
        <div className={merge(
          'fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-lg border',
          progressClassName
        )}>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress: {Math.round(progress * 100)}%
          </div>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <div
        ref={ref}
        className={merge(
          'transition-all duration-500 ease-out',
          className
        )}
        style={{
          ...transitionStyles,
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: easing === 'smooth' 
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : easing === 'bounce'
            ? 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            : easing === 'elastic'
            ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            : easing
        }}
      >
        {children}
      </div>
    </div>
  )
})

AdvancedPageTransition.displayName = 'AdvancedPageTransition'

// 편의 컴포넌트들
export const FadePageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="fade" {...props} />
))

export const SlidePageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="slide" {...props} />
))

export const ScalePageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="scale" {...props} />
))

export const FlipPageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="flip" {...props} />
))

export const MorphPageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="morph" {...props} />
))

export const CubePageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="cube" {...props} />
))

export const ZoomPageTransition = React.forwardRef<HTMLDivElement, Omit<AdvancedPageTransitionProps, 'type'>>((props, ref) => (
  <AdvancedPageTransition ref={ref} type="zoom" {...props} />
))

// displayName 설정
FadePageTransition.displayName = 'FadePageTransition'
SlidePageTransition.displayName = 'SlidePageTransition'
ScalePageTransition.displayName = 'ScalePageTransition'
FlipPageTransition.displayName = 'FlipPageTransition'
MorphPageTransition.displayName = 'MorphPageTransition'
CubePageTransition.displayName = 'CubePageTransition'
ZoomPageTransition.displayName = 'ZoomPageTransition'
