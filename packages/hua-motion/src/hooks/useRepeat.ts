import React, { useRef, useState, useEffect } from 'react'

export interface RepeatConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  type?: 'pulse' | 'bounce' | 'wave' | 'fade'
  intensity?: number
}

export interface RepeatState {
  scale: number
  opacity: number
  isAnimating: boolean
}

export function useRepeat(config: RepeatConfig = {}) {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    type = 'pulse',
    intensity = 0.1
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [opacity, setOpacity] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)

  const animate = () => {
    setIsAnimating(true)
    
    switch (type) {
      case 'pulse':
        setScale(1 + intensity)
        setTimeout(() => setScale(1), duration / 2)
        break
      case 'bounce':
        setScale(1 + intensity)
        setTimeout(() => setScale(1 - intensity), duration / 3)
        setTimeout(() => setScale(1), duration)
        break
      case 'wave':
        setScale(1 + intensity)
        setTimeout(() => setScale(1 - intensity), duration / 2)
        setTimeout(() => setScale(1), duration)
        break
      case 'fade':
        setOpacity(0.5)
        setTimeout(() => setOpacity(1), duration / 2)
        break
    }
    
    setTimeout(() => {
      setIsAnimating(false)
      if (autoStart) {
        animate()
      }
    }, duration)
  }

  const start = () => {
    setTimeout(() => animate(), delay)
  }

  const stop = () => {
    setIsAnimating(false)
    setScale(1)
    setOpacity(1)
  }

  useEffect(() => {
    if (autoStart) {
      start()
    }
    return () => stop()
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
    stop
  }
} 