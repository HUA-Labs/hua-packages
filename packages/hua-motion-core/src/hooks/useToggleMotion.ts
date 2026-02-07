import { useRef, useState, useCallback, useMemo } from 'react'
import { ToggleMotionOptions, InteractionReturn, MotionElement } from '../types'

export function useToggleMotion<T extends MotionElement = HTMLDivElement>(
  options: ToggleMotionOptions = {}
): InteractionReturn<T> {
  const { duration = 300, delay = 0, easing = 'ease-in-out' } = options

  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const show = useCallback(() => {
    setIsVisible(true)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), duration + delay)
  }, [duration, delay])

  const hide = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), duration + delay)
  }, [duration, delay])

  const toggle = useCallback(() => {
    if (isVisible) {
      hide()
    } else {
      show()
    }
  }, [isVisible, show, hide])

  const start = useCallback(() => show(), [show])
  const stop = useCallback(() => setIsAnimating(false), [])
  const reset = useCallback(() => {
    setIsVisible(false)
    setIsAnimating(false)
  }, [])

  const style = useMemo(() => ({
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translateY(0) scale(1)'
      : 'translateY(10px) scale(0.95)',
    transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`
  }), [isVisible, duration, easing, delay])

  return {
    ref,
    isVisible,
    isAnimating,
    style,
    progress: isVisible ? 1 : 0,
    start,
    stop,
    reset,
    toggle,
    show,
    hide
  }
}
