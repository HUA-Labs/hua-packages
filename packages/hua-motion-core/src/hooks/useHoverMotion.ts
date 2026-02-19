import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { HoverMotionOptions, BaseMotionReturn, MotionElement } from '../types'
import { useMotionProfile } from '../profiles/MotionProfileContext'

export function useHoverMotion<T extends MotionElement = HTMLDivElement>(
  options: HoverMotionOptions = {}
): BaseMotionReturn<T> & { isHovered: boolean } {
  const profile = useMotionProfile()
  const {
    duration = profile.interaction.hover.duration,
    easing = profile.interaction.hover.easing,
    hoverScale = profile.interaction.hover.scale,
    hoverY = profile.interaction.hover.y,
    hoverOpacity = 1
  } = options

  const ref = useRef<T>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseEnter = () => {
      setIsHovered(true)
      setIsAnimating(true)
    }

    const handleMouseLeave = () => {
      setIsHovered(false)
      setIsAnimating(true)
    }

    const handleTransitionEnd = () => {
      setIsAnimating(false)
    }

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)
    element.addEventListener('transitionend', handleTransitionEnd)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('transitionend', handleTransitionEnd)
    }
  }, [])

  const style = useMemo(() => ({
    transform: isHovered
      ? `scale(${hoverScale}) translateY(${hoverY}px)`
      : 'scale(1) translateY(0px)',
    opacity: isHovered ? hoverOpacity : 1,
    transition: `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`
  }), [isHovered, hoverScale, hoverY, hoverOpacity, duration, easing])

  const start = useCallback(() => {
    setIsHovered(true)
    setIsAnimating(true)
  }, [])

  const stop = useCallback(() => {
    setIsAnimating(false)
  }, [])

  const reset = useCallback(() => {
    setIsHovered(false)
    setIsAnimating(false)
  }, [])

  return {
    ref,
    isVisible: true,
    isAnimating,
    isHovered,
    style,
    progress: isHovered ? 1 : 0,
    start,
    stop,
    reset
  }
}
