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
    setScale(0)
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