import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface SlideUpConfig {
  distance?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export interface SlideUpState {
  translateY: number
  opacity: number
  isAnimating: boolean
}

export function useSlideUp(config: SlideUpConfig = {}) {
  const {
    distance = 50,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [translateY, setTranslateY] = useState(autoStart ? distance : 0)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasStartedRef = useRef(false)

  const start = useCallback(() => {
    setIsAnimating(true)
    setTranslateY(distance)
    setOpacity(0)
    hasStartedRef.current = true

    setTimeout(() => {
      setTranslateY(0)
      setOpacity(1)
      setIsAnimating(false)
    }, delay)
  }, [delay, distance])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (애니메이션 없이)
    setTranslateY(distance)
    setOpacity(0)
    setIsAnimating(false)
    hasStartedRef.current = false
    
    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = `translateY(${distance}px)`
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [distance])

  useEffect(() => {
    if (autoStart && !hasStartedRef.current) {
      start()
    }
  }, [autoStart, start])

  const setRef = useCallback((element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }, [])

  return {
    ref: setRef,
    translateY,
    opacity,
    isAnimating,
    start,
    reset
  }
} 