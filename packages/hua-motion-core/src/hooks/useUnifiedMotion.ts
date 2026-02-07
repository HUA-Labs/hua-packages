/**
 * @hua-labs/motion-core - useUnifiedMotion
 *
 * 통합 Motion Hook - 단일 타입으로 여러 모션 효과 중 하나를 선택
 * 내부에서 선택된 type에 맞는 로직만 실행 (6개 훅 동시 호출 제거)
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { BaseMotionReturn, MotionElement, EntranceType, BaseMotionOptions } from '../types'

export interface UseUnifiedMotionOptions extends Omit<BaseMotionOptions, 'autoStart'> {
  /** Motion type to use */
  type: EntranceType
  /** Auto start animation @default false */
  autoStart?: boolean
  /** Slide distance (px) for slide types @default 50 */
  distance?: number
}

// type별 초기 스타일 계산
function getInitialStyle(type: EntranceType, distance: number) {
  switch (type) {
    case 'slideUp':
      return { opacity: 0, transform: `translateY(${distance}px)` }
    case 'slideLeft':
      return { opacity: 0, transform: `translateX(${distance}px)` }
    case 'slideRight':
      return { opacity: 0, transform: `translateX(-${distance}px)` }
    case 'scaleIn':
      return { opacity: 0, transform: 'scale(0)' }
    case 'bounceIn':
      return { opacity: 0, transform: 'scale(0)' }
    case 'fadeIn':
    default:
      return { opacity: 0, transform: 'none' }
  }
}

function getVisibleStyle() {
  return { opacity: 1, transform: 'none' }
}

function getEasingForType(type: EntranceType, easing?: string): string {
  if (easing) return easing
  if (type === 'bounceIn') return 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  return 'ease-out'
}

export function useUnifiedMotion<T extends MotionElement = HTMLDivElement>(
  options: UseUnifiedMotionOptions
): BaseMotionReturn<T> {
  const {
    type,
    duration = 600,
    autoStart = false,
    delay = 0,
    easing,
    threshold = 0.1,
    triggerOnce = true,
    distance = 50,
    onComplete,
    onStart,
    onStop,
    onReset
  } = options

  const resolvedEasing = getEasingForType(type, easing)

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [progress, setProgress] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const startRef = useRef<() => void>(() => {})

  const start = useCallback(() => {
    if (isAnimating) return
    setIsAnimating(true)
    setProgress(0)
    onStart?.()

    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true)
      setProgress(1)
      setIsAnimating(false)
      onComplete?.()
    }, delay)
  }, [isAnimating, delay, onStart, onComplete])

  startRef.current = start

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsAnimating(false)
    onStop?.()
  }, [onStop])

  const reset = useCallback(() => {
    stop()
    setIsVisible(false)
    setProgress(0)
    onReset?.()
  }, [stop, onReset])

  // IntersectionObserver로 자동 시작
  useEffect(() => {
    if (!ref.current || !autoStart) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startRef.current()
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
      observerRef.current?.disconnect()
    }
  }, [autoStart, threshold, triggerOnce])

  useEffect(() => {
    return () => stop()
  }, [stop])

  // type에 맞는 스타일을 CSS transition으로 처리
  const style = useMemo(() => {
    const base = isVisible ? getVisibleStyle() : getInitialStyle(type, distance)
    return {
      ...base,
      transition: `all ${duration}ms ${resolvedEasing}`,
      '--motion-delay': `${delay}ms`,
      '--motion-duration': `${duration}ms`,
      '--motion-easing': resolvedEasing,
      '--motion-progress': `${progress}`
    } as const
  }, [isVisible, type, distance, duration, resolvedEasing, delay, progress])

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
