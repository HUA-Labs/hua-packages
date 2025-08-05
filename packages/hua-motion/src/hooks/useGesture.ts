import { useRef, useState, useCallback, useEffect } from 'react'

export interface GestureConfig {
  onDrag?: (delta: { x: number; y: number }) => void
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down') => void
  onPinch?: (scale: number) => void
  onRotate?: (rotation: number) => void
  dragConstraints?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
  swipeThreshold?: number
  pinchThreshold?: number
  rotateThreshold?: number
  enabled?: boolean
}

export interface GestureState {
  isDragging: boolean
  isSwiping: boolean
  isPinching: boolean
  isRotating: boolean
  delta: { x: number; y: number }
  scale: number
  rotation: number
}

export function useGesture(config: GestureConfig = {}) {
  const {
    onDrag,
    onSwipe,
    onPinch,
    onRotate,
    dragConstraints,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
    rotateThreshold = 10,
    enabled = true
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<GestureState>({
    isDragging: false,
    isSwiping: false,
    isPinching: false,
    isRotating: false,
    delta: { x: 0, y: 0 },
    scale: 1,
    rotation: 0
  })

  const startPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const currentPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const startDistance = useRef<number>(0)
  const startAngle = useRef<number>(0)

  // 드래그 시작
  const handleDragStart = useCallback((e: TouchEvent | MouseEvent) => {
    if (!enabled) return

    const touch = 'touches' in e ? e.touches[0] : e
    startPos.current = { x: touch.clientX, y: touch.clientY }
    currentPos.current = { x: touch.clientX, y: touch.clientY }

    setState(prev => ({ ...prev, isDragging: true }))
  }, [enabled])

  // 드래그 중
  const handleDragMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!enabled || !state.isDragging) return

    const touch = 'touches' in e ? e.touches[0] : e
    const deltaX = touch.clientX - startPos.current.x
    const deltaY = touch.clientY - startPos.current.y

    // 제약 조건 적용
    let constrainedDeltaX = deltaX
    let constrainedDeltaY = deltaY

    if (dragConstraints) {
      if (dragConstraints.left !== undefined && deltaX < dragConstraints.left) {
        constrainedDeltaX = dragConstraints.left
      }
      if (dragConstraints.right !== undefined && deltaX > dragConstraints.right) {
        constrainedDeltaX = dragConstraints.right
      }
      if (dragConstraints.top !== undefined && deltaY < dragConstraints.top) {
        constrainedDeltaY = dragConstraints.top
      }
      if (dragConstraints.bottom !== undefined && deltaY > dragConstraints.bottom) {
        constrainedDeltaY = dragConstraints.bottom
      }
    }

    currentPos.current = { x: touch.clientX, y: touch.clientY }

    setState(prev => ({
      ...prev,
      delta: { x: constrainedDeltaX, y: constrainedDeltaY }
    }))

    onDrag?.({ x: constrainedDeltaX, y: constrainedDeltaY })
  }, [enabled, state.isDragging, dragConstraints, onDrag])

  // 드래그 종료
  const handleDragEnd = useCallback(() => {
    if (!enabled) return

    const deltaX = currentPos.current.x - startPos.current.x
    const deltaY = currentPos.current.y - startPos.current.y

    // 스와이프 감지
    if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
      const direction = Math.abs(deltaX) > Math.abs(deltaY)
        ? (deltaX > 0 ? 'right' : 'left')
        : (deltaY > 0 ? 'down' : 'up')
      
      onSwipe?.(direction)
    }

    setState(prev => ({
      ...prev,
      isDragging: false,
      delta: { x: 0, y: 0 }
    }))
  }, [enabled, swipeThreshold, onSwipe])

  // 핀치/회전 시작
  const handleMultiTouchStart = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]

    startDistance.current = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )

    startAngle.current = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * (180 / Math.PI)

    setState(prev => ({
      ...prev,
      isPinching: true,
      isRotating: true
    }))
  }, [enabled])

  // 핀치/회전 중
  const handleMultiTouchMove = useCallback((e: TouchEvent) => {
    if (!enabled || e.touches.length !== 2) return

    const touch1 = e.touches[0]
    const touch2 = e.touches[1]

    const currentDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    )

    const currentAngle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * (180 / Math.PI)

    const scale = currentDistance / startDistance.current
    const rotation = currentAngle - startAngle.current

    if (Math.abs(scale - 1) > pinchThreshold) {
      setState(prev => ({ ...prev, scale }))
      onPinch?.(scale)
    }

    if (Math.abs(rotation) > rotateThreshold) {
      setState(prev => ({ ...prev, rotation }))
      onRotate?.(rotation)
    }
  }, [enabled, pinchThreshold, rotateThreshold, onPinch, onRotate])

  // 핀치/회전 종료
  const handleMultiTouchEnd = useCallback(() => {
    if (!enabled) return

    setState(prev => ({
      ...prev,
      isPinching: false,
      isRotating: false,
      scale: 1,
      rotation: 0
    }))
  }, [enabled])

  // 이벤트 리스너 등록
  useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return

    // 마우스 이벤트
    element.addEventListener('mousedown', handleDragStart)
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)

    // 터치 이벤트
    element.addEventListener('touchstart', handleDragStart)
    element.addEventListener('touchstart', handleMultiTouchStart)
    document.addEventListener('touchmove', handleDragMove)
    document.addEventListener('touchmove', handleMultiTouchMove)
    document.addEventListener('touchend', handleDragEnd)
    document.addEventListener('touchend', handleMultiTouchEnd)

    return () => {
      element.removeEventListener('mousedown', handleDragStart)
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      element.removeEventListener('touchstart', handleDragStart)
      element.removeEventListener('touchstart', handleMultiTouchStart)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchmove', handleMultiTouchMove)
      document.removeEventListener('touchend', handleDragEnd)
      document.removeEventListener('touchend', handleMultiTouchEnd)
    }
  }, [enabled, handleDragStart, handleDragMove, handleDragEnd, handleMultiTouchStart, handleMultiTouchMove, handleMultiTouchEnd])

  // 리셋 함수
  const reset = useCallback(() => {
    setState({
      isDragging: false,
      isSwiping: false,
      isPinching: false,
      isRotating: false,
      delta: { x: 0, y: 0 },
      scale: 1,
      rotation: 0
    })
  }, [])

  return {
    ref,
    state,
    reset
  }
} 