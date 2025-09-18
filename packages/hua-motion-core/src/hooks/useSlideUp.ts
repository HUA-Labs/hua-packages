import { useRef, useState, useEffect, useCallback } from 'react'
import { SlideOptions, BaseMotionReturn, MotionElement } from '../types'

export function useSlideUp<T extends MotionElement = HTMLDivElement>(
  options: SlideOptions = {}
): BaseMotionReturn<T> {
  const {
    delay = 0,
    duration = 700,
    threshold = 0.1,
    triggerOnce = true,
    easing = 'ease-out',
    autoStart = true,
    direction = 'up',
    distance = 50,
    onComplete,
    onStart,
    onStop,
    onReset
  } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<number | null>(null)

  // 방향에 따른 초기 위치 계산
  const getInitialTransform = useCallback(() => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`
      case 'down':
        return `translateY(-${distance}px)`
      case 'left':
        return `translateX(${distance}px)`
      case 'right':
        return `translateX(-${distance}px)`
      default:
        return `translateY(${distance}px)`
    }
  }, [direction, distance])

  // 모션 시작 함수
  const start = useCallback(() => {
    if (isAnimating) return

    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    // 지연 시간 적용
    if (delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        setIsVisible(true)
        setProgress(1)
        setIsAnimating(false)
        onComplete?.()
      }, delay)
    } else {
      setIsVisible(true)
      setProgress(1)
      setIsAnimating(false)
      onComplete?.()
    }
  }, [delay, isAnimating, onStart, onComplete])

  // 모션 중단 함수
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  // 모션 리셋 함수
  const reset = useCallback(() => {
    stop()
    setIsVisible(false)
    setProgress(0)
    onReset?.()
  }, [stop, onReset])

  // Intersection Observer 설정
  useEffect(() => {
    if (!ref.current || !autoStart) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            start()
            if (triggerOnce) {
              observerRef.current?.disconnect()
            }
          }
        })
      },
      { threshold }
    )

    observerRef.current.observe(ref.current)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [autoStart, threshold, triggerOnce, start])

  // 자동 시작이 비활성화된 경우 수동 시작
  useEffect(() => {
    if (!autoStart) {
      start()
    }
  }, [autoStart, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop])

  // 스타일 계산 (React 19 호환)
  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : getInitialTransform(),
    transition: `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`,
            '--motion-delay': `${delay}ms`,
        '--motion-duration': `${duration}ms`,
        '--motion-easing': easing,
        '--motion-progress': `${progress}`,
        '--motion-direction': direction,
        '--motion-distance': `${distance}px`
  } as const

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    stop,
    reset
  }
} 