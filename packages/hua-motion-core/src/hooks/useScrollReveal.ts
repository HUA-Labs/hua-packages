import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

type MotionType = 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'bounceIn'

interface ScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  delay?: number
  motionType?: MotionType
}

export function useScrollReveal<T extends MotionElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): BaseMotionReturn<T> & {
  progress: number
} {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    motionType = 'fadeIn'
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const [progress, setProgress] = useState(0)

  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && (!triggerOnce || !hasTriggered)) {
        setIsAnimating(true)
        setTimeout(() => {
          setIsVisible(true)
          setHasTriggered(true)
          setProgress(1)
          setIsAnimating(false)
        }, delay)
      }
    })
  }, [triggerOnce, hasTriggered, delay])

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin
    })

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [observerCallback, threshold, rootMargin])

  // 모션 스타일 생성 - 메모이제이션으로 불필요한 리렌더링 방지
  const style = useMemo(() => {
    const baseTransition = 'all 700ms ease-out'
    
    if (!isVisible) {
      switch (motionType) {
        case 'fadeIn':
          return {
            opacity: 0,
            transition: baseTransition
          }
        case 'slideUp':
          return {
            opacity: 0,
            transform: 'translateY(32px)',
            transition: baseTransition
          }
        case 'slideLeft':
          return {
            opacity: 0,
            transform: 'translateX(-32px)',
            transition: baseTransition
          }
        case 'slideRight':
          return {
            opacity: 0,
            transform: 'translateX(32px)',
            transition: baseTransition
          }
        case 'scaleIn':
          return {
            opacity: 0,
            transform: 'scale(0.95)',
            transition: baseTransition
          }
        case 'bounceIn':
          return {
            opacity: 0,
            transform: 'scale(0.75)',
            transition: baseTransition
          }
        default:
          return {
            opacity: 0,
            transition: baseTransition
          }
      }
    }
    
    // 보이는 상태일 때
    return {
      opacity: 1,
      transform: 'none',
      transition: baseTransition
    }
  }, [isVisible, motionType])

  const start = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(true)
      setProgress(1)
      setIsAnimating(false)
    }, delay)
  }, [delay])

  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setHasTriggered(false)
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  return {
    ref,
    isVisible,
    isAnimating,
    progress,
    style,
    start,
    reset,
    stop
  }
} 