import React, { useRef, useState, useEffect } from 'react'

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

  const start = () => {
    setIsAnimating(true)
    setTranslateY(distance)
    setOpacity(0)

    setTimeout(() => {
      setTranslateY(0)
      setOpacity(1)
      setIsAnimating(false)
    }, delay)
  }

  const reset = () => {
    setTranslateY(distance)
    setOpacity(0)
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
    translateY,
    opacity,
    isAnimating,
    start,
    reset
  }
} 