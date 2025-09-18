'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

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

export interface TransitionConfig {
  type: TransitionType
  duration: number
  easing: TransitionEasing
  delay?: number
  stagger?: number
  direction?: 'forward' | 'backward'
  onStart?: () => void
  onComplete?: () => void
  onReverse?: () => void
}

export interface PageTransitionState {
  isTransitioning: boolean
  isVisible: boolean
  currentStep: number
  progress: number
}

export interface PageTransitionControls {
  start: (config?: Partial<TransitionConfig>) => Promise<void>
  reverse: () => Promise<void>
  pause: () => void
  resume: () => void
  reset: () => void
}

export const usePageTransition = (
  initialConfig: Partial<TransitionConfig> = {}
): [PageTransitionState, PageTransitionControls] => {
  const [state, setState] = useState<PageTransitionState>({
    isTransitioning: false,
    isVisible: false,
    currentStep: 0,
    progress: 0
  })

  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const configRef = useRef<TransitionConfig>({
    type: 'fade',
    duration: 500,
    easing: 'smooth',
    delay: 0,
    stagger: 0,
    direction: 'forward',
    ...initialConfig
  })

  const getEasingFunction = useCallback((easing: TransitionEasing) => {
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
    return easingFunctions[easing]
  }, [])

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const elapsed = timestamp - startTimeRef.current
    const config = configRef.current
    const easing = getEasingFunction(config.easing)
    
    let progress = Math.min(elapsed / config.duration, 1)
    progress = easing(progress)

    setState(prev => ({
      ...prev,
      progress,
      isVisible: config.direction === 'forward' ? progress > 0.1 : progress < 0.9,
      currentStep: Math.floor(progress * 10)
    }))

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      setState(prev => ({
        ...prev,
        isTransitioning: false,
        progress: config.direction === 'forward' ? 1 : 0
      }))
      config.onComplete?.()
    }
  }, [getEasingFunction])

  const start = useCallback(async (config?: Partial<TransitionConfig>) => {
    return new Promise<void>((resolve) => {
      if (config) {
        configRef.current = { ...configRef.current, ...config }
      }

      const finalConfig = configRef.current
      finalConfig.onComplete = () => resolve()

      setState(prev => ({
        ...prev,
        isTransitioning: true,
        progress: finalConfig.direction === 'forward' ? 0 : 1
      }))

      startTimeRef.current = null
      finalConfig.onStart?.()
      
      if (finalConfig.delay) {
        setTimeout(() => {
          animationRef.current = requestAnimationFrame(animate)
        }, finalConfig.delay)
      } else {
        animationRef.current = requestAnimationFrame(animate)
      }
    })
  }, [animate])

  const reverse = useCallback(async () => {
    return new Promise<void>((resolve) => {
      const config = configRef.current
      config.direction = 'backward'
      config.onComplete = () => resolve()
      
      start()
    })
  }, [start])

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const resume = useCallback(() => {
    if (state.isTransitioning) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [state.isTransitioning, animate])

  const reset = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setState({
      isTransitioning: false,
      isVisible: false,
      currentStep: 0,
      progress: 0
    })
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return [state, { start, reverse, pause, resume, reset }]
}

// 특정 전환 타입을 위한 편의 훅들
export const useFadeTransition = (config?: Partial<TransitionConfig>) => {
  return usePageTransition({ type: 'fade', duration: 400, ...config })
}

export const useSlideTransition = (config?: Partial<TransitionConfig>) => {
  return usePageTransition({ type: 'slide', duration: 600, ...config })
}

export const useScaleTransition = (config?: Partial<TransitionConfig>) => {
  return usePageTransition({ type: 'scale', duration: 500, ...config })
}

export const useMorphTransition = (config?: Partial<TransitionConfig>) => {
  return usePageTransition({ type: 'morph', duration: 800, ...config })
}

export const useCubeTransition = (config?: Partial<TransitionConfig>) => {
  return usePageTransition({ type: 'cube', duration: 1000, ...config })
}
