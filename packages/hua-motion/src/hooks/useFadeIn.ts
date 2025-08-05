import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface FadeInConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export interface FadeInState {
  opacity: number
  translateY: number
  isAnimating: boolean
}

export function useFadeIn(config: FadeInConfig = {}) {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [translateY, setTranslateY] = useState(autoStart ? 20 : 0)
  const [isAnimating, setIsAnimating] = useState(false)
  const hasStartedRef = useRef(false)

  const start = useCallback(() => {
    setIsAnimating(true)
    setOpacity(0)
    setTranslateY(20)
    hasStartedRef.current = true

    setTimeout(() => {
      setOpacity(1)
      setTranslateY(0)
      setIsAnimating(false)
    }, delay)
  }, [delay])

  const reset = useCallback(() => {
    // 즉시 초기 상태로 복원 (애니메이션 없이)
    setOpacity(0)
    setTranslateY(20)
    setIsAnimating(false)
    hasStartedRef.current = false
    
    // DOM 요소가 있다면 즉시 스타일 적용
    if (ref.current) {
      const element = ref.current
      element.style.transition = 'none'
      element.style.opacity = '0'
      element.style.transform = 'translateY(20px)'
      
      // 다음 프레임에서 transition 복원
      requestAnimationFrame(() => {
        element.style.transition = ''
      })
    }
  }, [])

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
    opacity,
    translateY,
    isAnimating,
    start,
    reset
  }
} 