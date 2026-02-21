import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { ScrollRevealOptions, BaseMotionReturn, MotionElement } from '../types'
import { useMotionProfile } from '../profiles/MotionProfileContext'
import { observeElement } from '../utils/sharedIntersectionObserver'

export function useScrollReveal<T extends MotionElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): BaseMotionReturn<T> {
  const profile = useMotionProfile()
  const {
    threshold = profile.base.threshold,
    rootMargin = '0px',
    triggerOnce = profile.base.triggerOnce,
    delay = 0,
    duration = profile.base.duration,
    easing = profile.base.easing,
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

    return observeElement(
      ref.current,
      (entry) => observerCallback([entry]),
      { threshold, rootMargin }
    )
  }, [observerCallback, threshold, rootMargin])

  // 프로필에서 거리/스케일 값 가져오기
  const slideDistance = profile.entrance.slide.distance
  const scaleFrom = profile.entrance.scale.from

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
            transform: `translateY(${slideDistance}px)`,
            transition: baseTransition
          }
        case 'slideLeft':
          return {
            opacity: 0,
            transform: `translateX(-${slideDistance}px)`,
            transition: baseTransition
          }
        case 'slideRight':
          return {
            opacity: 0,
            transform: `translateX(${slideDistance}px)`,
            transition: baseTransition
          }
        case 'scaleIn':
          return {
            opacity: 0,
            transform: `scale(${scaleFrom})`,
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
  }, [isVisible, motionType, duration, easing, slideDistance, scaleFrom])

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
