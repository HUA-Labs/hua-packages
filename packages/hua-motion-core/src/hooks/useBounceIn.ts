import { useRef, useState, useEffect, useCallback } from 'react'
import { BaseMotionReturn, MotionElement } from '../types'

export interface BounceInOptions {
  duration?: number
  delay?: number
  autoStart?: boolean
  intensity?: number
}

export function useBounceIn<T extends MotionElement = HTMLDivElement>(
  options: BounceInOptions = {}
): BaseMotionReturn<T> & {
  scale: number
  opacity: number
} {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    intensity = 0.3
  } = options

  const ref = useRef<T>(null)
  const [scale, setScale] = useState(autoStart ? 0 : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(autoStart ? false : true)

  const start = useCallback(() => {
    setIsAnimating(true)
    setScale(0)
    setOpacity(0)

    setTimeout(() => {
      setScale(1 + intensity)
      setOpacity(1)
      
      setTimeout(() => {
        setScale(1)
        setIsVisible(true)
        setIsAnimating(false)
      }, 200)
    }, delay)
  }, [delay, intensity])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (모션 없이)
    setScale(0)
    setOpacity(0)
    setIsVisible(false)
    setIsAnimating(false)
    
    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = 'scale(0)'
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 스타일 계산
  const style = {
    transform: `scale(${scale})`,
    opacity,
    transition: `all ${duration}ms ease-out`,
    '--motion-delay': `${delay}ms`,
    '--motion-duration': `${duration}ms`
  } as const

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