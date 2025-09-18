import { useRef, useEffect, useCallback } from 'react'

export function useHoverMotion(
  motionHook: (() => any) | any,
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
  const motionRef = useRef<any>(null)
  
  // motion 객체를 ref로 안정화
  if (!motionRef.current) {
    motionRef.current = typeof motionHook === 'function' ? motionHook() : motionHook
  }

  const handleMouseEnter = useCallback(() => {
    if (onHover === 'start') {
      motionRef.current?.start()
    } else if (onHover === 'reverse') {
      motionRef.current?.reset()
    }
  }, [onHover])

  const handleMouseLeave = useCallback(() => {
    if (onLeave === 'reverse') {
      motionRef.current?.stop() // stop 사용으로 현재 상태 유지
    } else if (onLeave === 'reset') {
      motionRef.current?.reset() // reset 사용으로 초기 상태로 복원
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
    if (motionRef.current?.ref) {
      motionRef.current.ref(element)
    }
  }, [])

  return {
    ...motionRef.current,
    ref: setRef
  }
}
