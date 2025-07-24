import React, { useRef, useState, useEffect } from 'react'

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

  const start = () => {
    setIsAnimating(true)
    setOpacity(0)
    setTranslateY(20)

    setTimeout(() => {
      setOpacity(1)
      setTranslateY(0)
      setIsAnimating(false)
    }, delay)
  }

  const reset = () => {
    setOpacity(0)
    setTranslateY(20)
    setIsAnimating(false)
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
    opacity,
    translateY,
    isAnimating,
    start,
    reset
  }
} 