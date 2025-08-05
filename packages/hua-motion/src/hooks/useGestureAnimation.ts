import { useRef, useEffect, useState, useCallback } from 'react'

interface GestureAnimationOptions {
  gestureType: 'hover' | 'drag' | 'pinch' | 'swipe' | 'tilt'
  duration?: number
  easing?: string
  sensitivity?: number
  enabled?: boolean
  onGestureStart?: () => void
  onGestureEnd?: () => void
}

interface GestureState {
  isActive: boolean
  x: number
  y: number
  deltaX: number
  deltaY: number
  scale: number
  rotation: number
}

export function useGestureAnimation(options: GestureAnimationOptions) {
  const {
    gestureType,
    duration = 300,
    easing = 'ease-out',
    sensitivity = 1,
    enabled = true,
    onGestureStart,
    onGestureEnd
  } = options

  const elementRef = useRef<HTMLElement | null>(null)
  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    x: 0,
    y: 0,
    deltaX: 0,
    deltaY: 0,
    scale: 1,
    rotation: 0
  })
  const [animationStyle, setAnimationStyle] = useState<React.CSSProperties>({})

  // 제스처 시작점 저장
  const startPoint = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const isDragging = useRef(false)

  // 애니메이션 스타일 업데이트
  const updateAnimationStyle = useCallback(() => {
    if (!enabled) return

    const { isActive, deltaX, deltaY, scale, rotation } = gestureState
    
    let transform = ''
    
    switch (gestureType) {
      case 'hover':
        transform = isActive 
          ? `scale(${1 + sensitivity * 0.05}) translateY(-${sensitivity * 2}px)`
          : 'scale(1) translateY(0)'
        break
      
      case 'drag':
        transform = isActive
          ? `translate(${deltaX * sensitivity}px, ${deltaY * sensitivity}px)`
          : 'translate(0, 0)'
        break
      
      case 'pinch':
        transform = `scale(${scale})`
        break
      
      case 'swipe':
        transform = isActive
          ? `translateX(${deltaX * sensitivity}px) rotateY(${deltaX * 0.1}deg)`
          : 'translateX(0) rotateY(0)'
        break
      
      case 'tilt':
        transform = isActive
          ? `rotateX(${deltaY * 0.1}deg) rotateY(${deltaX * 0.1}deg)`
          : 'rotateX(0) rotateY(0)'
        break
    }

    setAnimationStyle({
      transform,
      transition: isActive ? 'none' : `all ${duration}ms ${easing}`,
      cursor: gestureType === 'drag' && isActive ? 'grabbing' : 'pointer'
    })
  }, [gestureState, gestureType, enabled, duration, easing, sensitivity])

  // 마우스 이벤트 핸들러
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!enabled || gestureType !== 'drag') return
    
    isDragging.current = true
    startPoint.current = { x: e.clientX, y: e.clientY }
    
    setGestureState(prev => ({ ...prev, isActive: true }))
    onGestureStart?.()
  }, [enabled, gestureType, onGestureStart])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || !isDragging.current) return

    const deltaX = e.clientX - startPoint.current.x
    const deltaY = e.clientY - startPoint.current.y

    setGestureState(prev => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
      deltaX,
      deltaY
    }))
  }, [enabled])

  const handleMouseUp = useCallback(() => {
    if (!enabled) return
    
    isDragging.current = false
    setGestureState(prev => ({ ...prev, isActive: false }))
    onGestureEnd?.()
  }, [enabled, onGestureEnd])

  // 호버 이벤트 핸들러
  const handleMouseEnter = useCallback(() => {
    if (!enabled || gestureType !== 'hover') return
    
    setGestureState(prev => ({ ...prev, isActive: true }))
    onGestureStart?.()
  }, [enabled, gestureType, onGestureStart])

  const handleMouseLeave = useCallback(() => {
    if (!enabled || gestureType !== 'hover') return
    
    setGestureState(prev => ({ ...prev, isActive: false }))
    onGestureEnd?.()
  }, [enabled, gestureType, onGestureEnd])

  // 터치 이벤트 핸들러 (모바일 지원)
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled) return
    
    const touch = e.touches[0]
    startPoint.current = { x: touch.clientX, y: touch.clientY }
    
    setGestureState(prev => ({ ...prev, isActive: true }))
    onGestureStart?.()
  }, [enabled, onGestureStart])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled) return

    const touch = e.touches[0]
    const deltaX = touch.clientX - startPoint.current.x
    const deltaY = touch.clientY - startPoint.current.y

    setGestureState(prev => ({
      ...prev,
      x: touch.clientX,
      y: touch.clientY,
      deltaX,
      deltaY
    }))
  }, [enabled])

  const handleTouchEnd = useCallback(() => {
    if (!enabled) return
    
    setGestureState(prev => ({ ...prev, isActive: false }))
    onGestureEnd?.()
  }, [enabled, onGestureEnd])

  // 이벤트 리스너 등록
  useEffect(() => {
    if (!elementRef.current) return

    const element = elementRef.current

    // 마우스 이벤트
    if (gestureType === 'hover') {
      element.addEventListener('mouseenter', handleMouseEnter)
      element.addEventListener('mouseleave', handleMouseLeave)
    } else if (gestureType === 'drag') {
      element.addEventListener('mousedown', handleMouseDown)
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    // 터치 이벤트
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchmove', handleTouchMove)
    element.addEventListener('touchend', handleTouchEnd)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
      element.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [gestureType, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseMove, handleMouseUp, handleTouchStart, handleTouchMove, handleTouchEnd])

  // 애니메이션 스타일 업데이트
  useEffect(() => {
    updateAnimationStyle()
  }, [updateAnimationStyle])

  return {
    ref: elementRef,
    gestureState,
    animationStyle,
    isActive: gestureState.isActive
  }
} 