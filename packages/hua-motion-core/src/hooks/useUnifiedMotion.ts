/**
 * @hua-labs/motion-core - useUnifiedMotion
 *
 * 통합 Motion Hook - 단일 타입으로 여러 모션 효과 중 하나를 선택
 * 내부에서 선택된 type에 맞는 로직만 실행 (6개 훅 동시 호출 제거)
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import type { BaseMotionReturn, MotionElement, EntranceType, BaseMotionOptions } from '../types'

export interface MotionEffects {
  fade?: boolean | { targetOpacity?: number }
  slide?: boolean | { direction?: 'up' | 'down' | 'left' | 'right'; distance?: number }
  scale?: boolean | { from?: number; to?: number }
  bounce?: boolean
}

export interface UseUnifiedMotionOptions extends Omit<BaseMotionOptions, 'autoStart'> {
  /** Motion type to use (single effect mode) */
  type?: EntranceType
  /** Multiple effects to combine (multi-effect mode) */
  effects?: MotionEffects
  /** Auto start animation @default true */
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

function getMultiEffectInitialStyle(effects: MotionEffects, defaultDistance: number): Record<string, string | number> {
  const style: Record<string, string | number> = {}
  const transforms: string[] = []

  if (effects.fade) {
    style.opacity = 0
  }

  if (effects.slide) {
    const config = typeof effects.slide === 'object' ? effects.slide : {}
    const direction = config.direction ?? 'up'
    const distance = config.distance ?? defaultDistance
    switch (direction) {
      case 'up': transforms.push(`translateY(${distance}px)`); break
      case 'down': transforms.push(`translateY(-${distance}px)`); break
      case 'left': transforms.push(`translateX(${distance}px)`); break
      case 'right': transforms.push(`translateX(-${distance}px)`); break
    }
    if (!effects.fade) style.opacity = 0
  }

  if (effects.scale) {
    const config = typeof effects.scale === 'object' ? effects.scale : {}
    const from = config.from ?? 0.95
    transforms.push(`scale(${from})`)
    if (!effects.fade && !effects.slide) style.opacity = 0
  }

  if (effects.bounce) {
    transforms.push('scale(0)')
    if (!effects.fade && !effects.slide && !effects.scale) style.opacity = 0
  }

  if (transforms.length > 0) {
    style.transform = transforms.join(' ')
  } else {
    style.transform = 'none'
  }

  // fade만 있을 때 transform 기본값
  if (effects.fade && transforms.length === 0) {
    style.transform = 'none'
  }

  return style
}

function getMultiEffectVisibleStyle(effects: MotionEffects): Record<string, string | number> {
  const style: Record<string, string | number> = {}

  if (effects.fade) {
    const config = typeof effects.fade === 'object' ? effects.fade : {}
    style.opacity = config.targetOpacity ?? 1
  } else {
    style.opacity = 1
  }

  if (effects.scale) {
    const config = typeof effects.scale === 'object' ? effects.scale : {}
    style.transform = `scale(${config.to ?? 1})`
  } else {
    style.transform = 'none'
  }

  return style
}

function getMultiEffectEasing(effects: MotionEffects, easing?: string): string {
  if (easing) return easing
  if (effects.bounce) return 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  return 'ease-out'
}

export function useUnifiedMotion<T extends MotionElement = HTMLDivElement>(
  options: UseUnifiedMotionOptions
): BaseMotionReturn<T> {
  const {
    type,
    effects,
    duration = 600,
    autoStart = true,
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

  const resolvedType = type ?? 'fadeIn'
  const resolvedEasing = getEasingForType(resolvedType, easing)

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
    if (effects) {
      const base = isVisible ? getMultiEffectVisibleStyle(effects) : getMultiEffectInitialStyle(effects, distance)
      const resolvedEasingMulti = getMultiEffectEasing(effects, easing)
      return {
        ...base,
        transition: `all ${duration}ms ${resolvedEasingMulti}`,
        '--motion-delay': `${delay}ms`,
        '--motion-duration': `${duration}ms`,
        '--motion-easing': resolvedEasingMulti,
        '--motion-progress': `${progress}`
      } as const
    }

    // 기존 단일 type 모드
    const base = isVisible ? getVisibleStyle() : getInitialStyle(resolvedType, distance)
    return {
      ...base,
      transition: `all ${duration}ms ${resolvedEasing}`,
      '--motion-delay': `${delay}ms`,
      '--motion-duration': `${duration}ms`,
      '--motion-easing': resolvedEasing,
      '--motion-progress': `${progress}`
    } as const
  }, [isVisible, type, effects, distance, duration, resolvedEasing, easing, delay, progress, resolvedType])

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
