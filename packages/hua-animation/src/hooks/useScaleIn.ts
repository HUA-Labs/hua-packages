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
    setScale(initialScale)
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
    scale,
    opacity,
    isAnimating,
    start,
    reset
  }
} 