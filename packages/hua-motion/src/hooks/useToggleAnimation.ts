import React, { useRef, useState, useEffect, useCallback } from 'react'

interface ToggleAnimationOptions {
  duration?: number
  delay?: number
  easing?: string
}

export function useToggleAnimation(options: ToggleAnimationOptions = {}) {
  const { duration = 300, delay = 0, easing = 'ease-in-out' } = options
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const show = useCallback(() => {
    setIsVisible(true)
    setIsAnimating(true)
  }, [])

  const hide = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(true)
  }, [])

  const toggle = useCallback(() => {
    if (isVisible) {
      hide()
    } else {
      show()
    }
  }, [isVisible, show, hide])

  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`

    if (isVisible) {
      element.style.opacity = '1'
      element.style.transform = 'translateY(0) scale(1)'
    } else {
      element.style.opacity = '0'
      element.style.transform = 'translateY(10px) scale(0.95)'
    }

    const handleTransitionEnd = () => {
      setIsAnimating(false)
    }

    element.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      element.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [isVisible, duration, easing])

  return {
    ref: elementRef,
    isVisible,
    isAnimating,
    show,
    hide,
    toggle
  }
} 