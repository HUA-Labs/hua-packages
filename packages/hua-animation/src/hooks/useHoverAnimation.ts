import { useRef, useEffect, useCallback } from 'react'

export function useHoverAnimation(
  animationHook: () => any,
  options: {
    onHover?: 'start' | 'reverse'
    onLeave?: 'reverse' | 'reset'
  } = {}
) {
  const {
    onHover = 'start',
    onLeave = 'reverse'
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const animation = animationHook()

  const handleMouseEnter = useCallback(() => {
    if (onHover === 'start') {
      animation.start()
    } else if (onHover === 'reverse') {
      animation.reset()
    }
  }, [animation, onHover])

  const handleMouseLeave = useCallback(() => {
    if (onLeave === 'reverse') {
      animation.stop() // stop 사용으로 현재 상태 유지
    } else if (onLeave === 'reset') {
      animation.reset() // reset 사용으로 초기 상태로 복원
    }
  }, [animation, onLeave])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseEnter, handleMouseLeave])

  const setRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element
    if (animation.ref) {
      animation.ref(element)
    }
  }, [animation])

  return {
    ...animation,
    ref: setRef
  }
} 