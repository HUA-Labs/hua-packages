import React, { useRef, useState, useEffect } from 'react'

export interface SlideRightConfig {
  distance?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
}

export interface SlideRightState {
  translateX: number
  opacity: number
  isAnimating: boolean
}

export function useSlideRight(config: SlideRightConfig = {}) {
  const {
    distance = 100,
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [translateX, setTranslateX] = useState(autoStart ? -distance : 0)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)

  const start = () => {
    setIsAnimating(true)
    setTranslateX(-distance)
    setOpacity(0)

    setTimeout(() => {
      setTranslateX(0)
      setOpacity(1)
      setIsAnimating(false)
    }, delay)
  }

  const reset = () => {
    setTranslateX(-distance)
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
    translateX,
    opacity,
    isAnimating,
    start,
    reset
  }
} 