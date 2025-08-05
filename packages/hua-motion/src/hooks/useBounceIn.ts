import React, { useRef, useState, useEffect } from 'react'

export interface BounceInConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  intensity?: number
}

export interface BounceInState {
  scale: number
  opacity: number
  isAnimating: boolean
}

export function useBounceIn(config: BounceInConfig = {}) {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    intensity = 0.3
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(autoStart ? 0 : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)

  const start = () => {
    setIsAnimating(true)
    setScale(0)
    setOpacity(0)

    setTimeout(() => {
      setScale(1 + intensity)
      setOpacity(1)
      
      setTimeout(() => {
        setScale(1)
        setIsAnimating(false)
      }, 200)
    }, delay)
  }

  const reset = () => {
    // 즉시 초기 상태로 복원 (애니메이션 없이)
    setScale(0)
    setOpacity(0)
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
  }

  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [])

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