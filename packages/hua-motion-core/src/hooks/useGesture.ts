import { useState, useEffect, useRef, useCallback } from 'react'

interface GestureOptions {
  // 기본 설정
  enabled?: boolean // 제스처 활성화 여부
  threshold?: number // 제스처 인식 임계값
  timeout?: number // 제스처 타임아웃 (ms)
  
  // 스와이프 설정
  swipeThreshold?: number // 스와이프 최소 거리
  swipeVelocity?: number // 스와이프 최소 속도
  swipeDirections?: ('up' | 'down' | 'left' | 'right')[] // 허용할 스와이프 방향
  
  // 핀치 설정
  pinchThreshold?: number // 핀치 최소 거리 변화
  minScale?: number // 최소 스케일
  maxScale?: number // 최대 스케일
  
  // 로테이트 설정
  rotateThreshold?: number // 로테이트 최소 각도
  
  // 팬 설정
  panThreshold?: number // 팬 최소 거리
  
  // 콜백 함수들
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', distance: number, velocity: number) => void
  onPinch?: (scale: number, delta: number) => void
  onRotate?: (angle: number, delta: number) => void
  onPan?: (deltaX: number, deltaY: number, totalX: number, totalY: number) => void
  onTap?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
  onLongPress?: (x: number, y: number) => void
  onStart?: (x: number, y: number) => void
  onMove?: (x: number, y: number) => void
  onEnd?: (x: number, y: number) => void
}

interface GestureState {
  isActive: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
  distance: number
  velocity: number
  startTime: number
  currentTime: number
  scale: number
  rotation: number
  startDistance: number
  startAngle: number
  touchCount: number
}

interface GestureReturn {
  // 상태
  isActive: boolean
  gesture: string | null
  scale: number
  rotation: number
  deltaX: number
  deltaY: number
  distance: number
  velocity: number
  
  // 제어
  start: () => void
  stop: () => void
  reset: () => void
  
  // 이벤트 핸들러
  onTouchStart: (e: React.TouchEvent | TouchEvent) => void
  onTouchMove: (e: React.TouchEvent | TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent | TouchEvent) => void
  onMouseDown: (e: React.MouseEvent | MouseEvent) => void
  onMouseMove: (e: React.MouseEvent | MouseEvent) => void
  onMouseUp: (e: React.MouseEvent | MouseEvent) => void
}

export function useGesture(options: GestureOptions = {}): GestureReturn {
  const {
    enabled = true,
    threshold = 10,
    timeout = 300,
    swipeThreshold = 50,
    swipeVelocity = 0.3,
    swipeDirections = ['up', 'down', 'left', 'right'],
    pinchThreshold = 10,
    minScale = 0.1,
    maxScale = 10,
    rotateThreshold = 5,
    panThreshold = 10,
    onSwipe,
    onPinch,
    onRotate,
    onPan,
    onTap,
    onDoubleTap,
    onLongPress,
    onStart,
    onMove,
    onEnd
  } = options

  const [isActive, setIsActive] = useState(false)
  const [gesture, setGesture] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [deltaX, setDeltaX] = useState(0)
  const [deltaY, setDeltaY] = useState(0)
  const [distance, setDistance] = useState(0)
  const [velocity, setVelocity] = useState(0)

  const stateRef = useRef<GestureState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    velocity: 0,
    startTime: 0,
    currentTime: 0,
    scale: 1,
    rotation: 0,
    startDistance: 0,
    startAngle: 0,
    touchCount: 0
  })

  const timeoutRef = useRef<number | null>(null)
  const longPressRef = useRef<number | null>(null)
  const lastTapRef = useRef<number>(0)

  // 두 점 사이의 거리 계산
  const getDistance = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }, [])

  // 두 점 사이의 각도 계산
  const getAngle = useCallback((x1: number, y1: number, x2: number, y2: number): number => {
    return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI
  }, [])

  // 스와이프 방향 판단
  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): 'up' | 'down' | 'left' | 'right' | null => {
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left'
    } else {
      return deltaY > 0 ? 'down' : 'up'
    }
  }, [])

  // 제스처 시작
  const startGesture = useCallback((x: number, y: number, touchCount: number = 1) => {
    if (!enabled) return

    const now = Date.now()
    stateRef.current = {
      ...stateRef.current,
      isActive: true,
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      velocity: 0,
      startTime: now,
      currentTime: now,
      touchCount
    }

    setIsActive(true)
    setGesture(null)
    onStart?.(x, y)

    // 롱프레스 타이머
    if (onLongPress) {
      longPressRef.current = window.setTimeout(() => {
        onLongPress(x, y)
      }, 500)
    }
  }, [enabled, onStart, onLongPress])

  // 제스처 업데이트
  const updateGesture = useCallback((x: number, y: number, touches?: Touch[]) => {
    if (!enabled || !stateRef.current.isActive) return

    const now = Date.now()
    const state = stateRef.current
    const deltaX = x - state.startX
    const deltaY = y - state.startY
    const distance = getDistance(state.startX, state.startY, x, y)
    const velocity = distance / (now - state.startTime) * 1000

    state.currentX = x
    state.currentY = y
    state.deltaX = deltaX
    state.deltaY = deltaY
    state.distance = distance
    state.velocity = velocity
    state.currentTime = now

    setDeltaX(deltaX)
    setDeltaY(deltaY)
    setDistance(distance)
    setVelocity(velocity)

    // 멀티터치 제스처 (핀치/로테이트)
    if (touches && touches.length === 2) {
      const touch1 = touches[0]
      const touch2 = touches[1]
      
      const currentDistance = getDistance(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY)
      const currentAngle = getAngle(touch1.clientX, touch1.clientY, touch2.clientX, touch2.clientY)
      
      if (state.startDistance === 0) {
        state.startDistance = currentDistance
        state.startAngle = currentAngle
      } else {
        // 핀치
        const scaleDelta = currentDistance / state.startDistance
        const newScale = Math.max(minScale, Math.min(maxScale, scale * scaleDelta))
        
        if (Math.abs(scaleDelta - 1) * 100 > pinchThreshold) {
          setScale(newScale)
          setGesture('pinch')
          onPinch?.(newScale, scaleDelta - 1)
        }

        // 로테이트
        const angleDelta = currentAngle - state.startAngle
        if (Math.abs(angleDelta) > rotateThreshold) {
          const newRotation = rotation + angleDelta
          setRotation(newRotation)
          setGesture('rotate')
          onRotate?.(newRotation, angleDelta)
        }
      }
    }

    // 팬 제스처
    if (distance > panThreshold) {
      setGesture('pan')
      onPan?.(deltaX, deltaY, x - state.startX, y - state.startY)
    }

    onMove?.(x, y)
  }, [enabled, getDistance, getAngle, scale, rotation, minScale, maxScale, pinchThreshold, rotateThreshold, panThreshold, onPinch, onRotate, onPan, onMove])

  // 제스처 종료
  const endGesture = useCallback((x: number, y: number) => {
    if (!enabled || !stateRef.current.isActive) return

    const state = stateRef.current
    const now = Date.now()
    const deltaX = x - state.startX
    const deltaY = y - state.startY
    const distance = getDistance(state.startX, state.startY, x, y)
    const velocity = distance / (now - state.startTime) * 1000

    // 롱프레스 타이머 정리
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }

    // 스와이프 판단
    if (distance > swipeThreshold && velocity > swipeVelocity) {
      const direction = getSwipeDirection(deltaX, deltaY)
      if (direction && swipeDirections.includes(direction)) {
        setGesture(`swipe-${direction}`)
        onSwipe?.(direction, distance, velocity)
      }
    }

    // 탭 판단
    if (distance < threshold && (now - state.startTime) < timeout) {
      const timeSinceLastTap = now - lastTapRef.current
      if (timeSinceLastTap < 300) {
        // 더블 탭
        onDoubleTap?.(x, y)
        lastTapRef.current = 0
      } else {
        // 싱글 탭
        onTap?.(x, y)
        lastTapRef.current = now
      }
    }

    state.isActive = false
    setIsActive(false)
    onEnd?.(x, y)

    // 상태 리셋
    timeoutRef.current = window.setTimeout(() => {
      setGesture(null)
      setDeltaX(0)
      setDeltaY(0)
      setDistance(0)
      setVelocity(0)
    }, 100)
  }, [enabled, getDistance, getSwipeDirection, swipeThreshold, swipeVelocity, swipeDirections, threshold, timeout, onSwipe, onTap, onDoubleTap, onEnd])

  // 터치 이벤트 핸들러
  const onTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    startGesture(touch.clientX, touch.clientY, e.touches.length)
  }, [startGesture])

  const onTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    updateGesture(touch.clientX, touch.clientY, Array.from(e.touches) as Touch[])
  }, [updateGesture])

  const onTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    endGesture(touch.clientX, touch.clientY)
  }, [endGesture])

  // 마우스 이벤트 핸들러
  const onMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault()
    startGesture(e.clientX, e.clientY, 1)
  }, [startGesture])

  const onMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault()
    updateGesture(e.clientX, e.clientY)
  }, [updateGesture])

  const onMouseUp = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault()
    endGesture(e.clientX, e.clientY)
  }, [endGesture])

  // 제어 함수들
  const start = useCallback(() => {
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
    setGesture(null)
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setIsActive(false)
    setGesture(null)
    setScale(1)
    setRotation(0)
    setDeltaX(0)
    setDeltaY(0)
    setDistance(0)
    setVelocity(0)
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }, [])

  // 클린업
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (longPressRef.current) {
        clearTimeout(longPressRef.current)
      }
    }
  }, [])

  return {
    isActive,
    gesture,
    scale,
    rotation,
    deltaX,
    deltaY,
    distance,
    velocity,
    start,
    stop,
    reset,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp
  }
} 