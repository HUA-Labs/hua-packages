import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { ScrollRevealOptions, BaseMotionReturn, MotionElement } from '../types'

export function useScrollReveal<T extends MotionElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): BaseMotionReturn<T> {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
    duration = 700,
    easing = 'ease-out',
    motionType = 'fadeIn',
    onComplete,
    onStart,
    onStop,
    onReset
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
        onStart?.()
        setTimeout(() => {
          setIsVisible(true)
          setHasTriggered(true)
          setProgress(1)
          setIsAnimating(false)
          onComplete?.()
        }, delay)
      }
    })
  }, [triggerOnce, hasTriggered, delay, onStart, onComplete])

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

  // 모션 스타일 생성 - duration/easing을 옵션에서 사용
  const style = useMemo(() => {
    const baseTransition = `all ${duration}ms ${easing}`

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
  }, [isVisible, motionType, duration, easing])

  const start = useCallback(() => {
    setIsAnimating(true)
    onStart?.()
    setTimeout(() => {
      setIsVisible(true)
      setProgress(1)
      setIsAnimating(false)
      onComplete?.()
    }, delay)
  }, [delay, onStart, onComplete])

  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
    setProgress(0)
    setHasTriggered(false)
    onReset?.()
  }, [onReset])

  const stop = useCallback(() => {
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

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
