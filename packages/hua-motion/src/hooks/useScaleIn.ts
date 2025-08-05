import React, { useRef, useState, useEffect } from 'react'

export interface ScaleInConfig {
  scale?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export interface ScaleInState {
  scale: number
  opacity: number
  isAnimating: boolean
}

export function useScaleIn(config: ScaleInConfig = {}) {
  const {
    scale: initialScale = 0,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(autoStart ? initialScale : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)

  const start = () => {
    setIsAnimating(true)
    setScale(initialScale)
    setOpacity(0)

    setTimeout(() => {
      setScale(1)
      setOpacity(1)
      setIsAnimating(false)
    }, delay)
  }

  const reset = () => {
    // 즉시 초기 상태로 복원 (애니메이션 없이)
    setScale(initialScale)
    setOpacity(0)
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
  }

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart])

  const setRef = (element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }

  return {
    ref: setRef,
    scale,
    opacity,
    isAnimating,
    start,
    reset
  }
} 