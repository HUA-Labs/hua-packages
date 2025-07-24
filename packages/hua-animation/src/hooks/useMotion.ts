import React, { useRef, useState, useEffect } from 'react'

export interface MotionConfig {
  duration?: number
  delay?: number
  autoStart?: boolean
  easing?: string
  type?: 'fade' | 'slide' | 'scale' | 'rotate'
}

export interface MotionState {
  transform: string
  opacity: number
  isAnimating: boolean
}

export function useMotion(config: MotionConfig = {}) {
  const {
    duration = 1000,
    delay = 0,
    autoStart = true,
    easing = 'ease-out',
    type = 'fade'
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('')
  const [opacity, setOpacity] = useState(autoStart ? 0 : 1)
  const [isAnimating, setIsAnimating] = useState(false)

  const getInitialTransform = () => {
    switch (type) {
      case 'slide':
        return 'translateX(100px)'
      case 'scale':
        return 'scale(0)'
      case 'rotate':
        return 'rotate(180deg)'
      default:
        return ''
    }
  }

  const getFinalTransform = () => {
    switch (type) {
      case 'slide':
        return 'translateX(0)'
      case 'scale':
        return 'scale(1)'
      case 'rotate':
        return 'rotate(0deg)'
      default:
        return ''
    }
  }

  const start = () => {
    setIsAnimating(true)
    setTransform(getInitialTransform())
    setOpacity(0)

    setTimeout(() => {
      setTransform(getFinalTransform())
      setOpacity(1)
      setIsAnimating(false)
    }, delay)
  }

  const reset = () => {
    setTransform(getInitialTransform())
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
    transform,
    opacity,
    isAnimating,
    start,
    reset
  }
} 