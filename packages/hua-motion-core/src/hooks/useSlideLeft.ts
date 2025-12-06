import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

export interface SlideLeftOptions {
  distance?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export function useSlideLeft<T extends MotionElement = HTMLDivElement>(
  options: SlideLeftOptions = {}
): BaseMotionReturn<T> & {
  translateX: number
  opacity: number
} {
  const {
    distance = 100,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = options

  const ref = useRef<T>(null)
  const [translateX, setTranslateX] = useState(autoStart ? distance : 0)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)
  const [progress, setProgress] = useState(autoStart ? 0 : 1)

  const start = useCallback(() => {
    setIsAnimating(true)
    setTranslateX(distance)
    setOpacity(0)
    setProgress(0)

    setTimeout(() => {
      setProgress(1)
      setTranslateX(0)
      setOpacity(1)
      setIsVisible(true)
      setIsAnimating(false)
    }, delay)
  }, [distance, delay])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (모션 없이)
    setTranslateX(distance)
    setOpacity(0)
    setProgress(0)
    setIsVisible(false)
    setIsAnimating(false)
    
    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = `translateX(${distance}px)`
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [distance])

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
    transform: `translateX(${translateX}px)`,
    opacity,
    transition: `all ${duration}ms ${easing}`,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`,
    '--motion-easing': easing
  } as const), [translateX, opacity, duration, easing, delay])

  return {
    ref,
    translateX,
    opacity,
    isVisible,
    isAnimating,
    style,
    progress,
    start,
    reset,
    stop
  }
} 