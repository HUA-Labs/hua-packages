import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

export interface ScaleInOptions {
  scale?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export function useScaleIn<T extends MotionElement = HTMLDivElement>(
  options: ScaleInOptions = {}
): BaseMotionReturn<T> & {
  scale: number
  opacity: number
} {
  const {
    scale: initialScale = 0,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(autoStart ? initialScale : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)

  const start = useCallback(() => {
    setIsAnimating(true)
    setScale(initialScale)
    setOpacity(0)

    setTimeout(() => {
      setScale(1)
      setOpacity(1)
      setIsVisible(true)
      setIsAnimating(false)
    }, delay)
  }, [delay, initialScale])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (모션 없이)
    setScale(initialScale)
    setOpacity(0)
    setIsVisible(false)
    setIsAnimating(false)
    
    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = `scale(${initialScale})`
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [initialScale])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 스타일 계산 - 메모이제이션으로 불필요한 리렌더링 방지
  const style = useMemo(() => ({
    transform: `scale(${scale})`,
    opacity,
    transition: `all ${duration}ms ${easing}`,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing
  } as const), [scale, opacity, duration, easing, delay])

  return {
    ref,
    scale,
    opacity,
    isVisible,
    isAnimating,
    style,
    start,
    reset,
    stop
  }
} 