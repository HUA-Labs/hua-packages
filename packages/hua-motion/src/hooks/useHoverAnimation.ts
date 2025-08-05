import { useRef, useEffect, useCallback } from 'react'

export function useHoverAnimation(
  animationHook: (() => any) | any,
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
  const animationRef = useRef<any>(null)
  
  // animation 객체를 ref로 안정화
  if (!animationRef.current) {
    animationRef.current = typeof animationHook === 'function' ? animationHook() : animationHook
  }

  const handleMouseEnter = useCallback(() => {
    if (onHover === 'start') {
      animationRef.current?.start()
    } else if (onHover === 'reverse') {
      animationRef.current?.reset()
    }
  }, [onHover])

  const handleMouseLeave = useCallback(() => {
    if (onLeave === 'reverse') {
      animationRef.current?.stop() // stop 사용으로 현재 상태 유지
    } else if (onLeave === 'reset') {
      animationRef.current?.reset() // reset 사용으로 초기 상태로 복원
    }
  }, [onLeave])

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
    if (animationRef.current?.ref) {
      animationRef.current.ref(element)
    }
  }, [])

  return {
    ...animationRef.current,
    ref: setRef
  }
} 