import React, { useRef, useState, useEffect } from 'react'

export interface SpringConfig {
  stiffness?: number
  damping?: number
  mass?: number
  duration?: number
  delay?: number
  autoStart?: boolean
  type?: 'gentle' | 'fast' | 'bounce'
}

export interface SpringState {
  scale: number
  opacity: number
  isAnimating: boolean
}

export function useSpring(config: SpringConfig = {}) {
  const {
    stiffness = 100,
    damping = 10,
    mass = 1,
    duration = 1000,
    delay = 0,
    autoStart = true,
    type = 'gentle'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(autoStart ? 0 : 1)
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)

  const getSpringConfig = () => {
    switch (type) {
      case 'gentle':
        return { stiffness: 50, damping: 15, mass: 1 }
      case 'fast':
        return { stiffness: 200, damping: 20, mass: 0.5 }
      case 'bounce':
        return { stiffness: 150, damping: 5, mass: 1 }
      default:
        return { stiffness, damping, mass }
    }
  }

  const spring = getSpringConfig()

  const start = () => {
    setIsAnimating(true)
    setScale(0)
    setOpacity(0)

    setTimeout(() => {
      setScale(1)
      setOpacity(1)
      setIsAnimating(false)
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
    reset,
    spring
  }
} 