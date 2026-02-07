import { useRef, useEffect, useState, useCallback, useMemo, type CSSProperties } from 'react'
import { SpringOptions, BaseMotionReturn, MotionElement } from '../types'

interface SpringMotionOptions extends SpringOptions {
  /** 시작 값 */
  from: number
  /** 목표 값 */
  to: number
  /** 활성화 여부 */
  enabled?: boolean
}

export function useSpringMotion<T extends MotionElement = HTMLDivElement>(
  options: SpringMotionOptions
): BaseMotionReturn<T> & {
  value: number
  velocity: number
} {
  const {
    from,
    to,
    mass = 1,
    stiffness = 100,
    damping = 10,
    restDelta = 0.01,
    restSpeed = 0.01,
    onComplete,
    enabled = true,
    autoStart = false
  } = options

  const ref = useRef<T>(null)
  const [springState, setSpringState] = useState({
    value: from,
    velocity: 0,
    isAnimating: false
  })
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  const motionRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  // 스프링 물리 계산
  const calculateSpring = useCallback((currentValue: number, currentVelocity: number, targetValue: number, deltaTime: number) => {
    // 스프링 힘 계산 (Hooke's Law)
    const displacement = currentValue - targetValue
    const springForce = -stiffness * displacement

    // 댐핑 힘 계산
    const dampingForce = -damping * currentVelocity

    // 총 힘
    const totalForce = springForce + dampingForce

    // 가속도 (F = ma)
    const acceleration = totalForce / mass

    // 새로운 속도
    const newVelocity = currentVelocity + acceleration * deltaTime

    // 새로운 위치
    const newValue = currentValue + newVelocity * deltaTime

    return { value: newValue, velocity: newVelocity }
  }, [mass, stiffness, damping])

  // 모션 루프
  const animate = useCallback((currentTime: number) => {
    if (!enabled || !springState.isAnimating) return

    const deltaTime = Math.min(currentTime - lastTimeRef.current, 16) / 1000 // 60fps 제한
    lastTimeRef.current = currentTime

    const { value, velocity } = calculateSpring(
      springState.value,
      springState.velocity,
      to,
      deltaTime
    )

    // 진행률 계산
    const range = Math.abs(to - from)
    const currentProgress = range > 0 ? Math.min(Math.abs(value - from) / range, 1) : 1
    setProgress(currentProgress)

    // 정지 조건 확인
    const isAtRest = Math.abs(value - to) < restDelta && Math.abs(velocity) < restSpeed

    if (isAtRest) {
      setSpringState({
        value: to,
        velocity: 0,
        isAnimating: false
      })
      setProgress(1)
      onComplete?.()
      return
    }

    setSpringState({
      value,
      velocity,
      isAnimating: true
    })

    motionRef.current = requestAnimationFrame(animate)
  }, [enabled, springState.isAnimating, to, from, restDelta, restSpeed, onComplete, calculateSpring])

  // 모션 시작
  const start = useCallback(() => {
    if (springState.isAnimating) return

    setSpringState(prev => ({
      ...prev,
      isAnimating: true
    }))
    lastTimeRef.current = performance.now()
    motionRef.current = requestAnimationFrame(animate)
  }, [springState.isAnimating, animate])

  // 모션 정지
  const stop = useCallback(() => {
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
    setSpringState(prev => ({
      ...prev,
      isAnimating: false
    }))
  }, [])

  // 모션 리셋
  const reset = useCallback(() => {
    stop()
    setSpringState({
      value: from,
      velocity: 0,
      isAnimating: false
    })
    setProgress(0)
    motionRef.current = null
  }, [from, stop])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      start()
    }
  }, [autoStart, start])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (motionRef.current) {
        cancelAnimationFrame(motionRef.current)
      }
    }
  }, [])

  // 스타일 계산
  const style = useMemo(() => ({
    '--motion-progress': `${progress}`,
    '--motion-value': `${springState.value}`
  } as CSSProperties), [progress, springState.value])

  return {
    ref,
    isVisible,
    isAnimating: springState.isAnimating,
    style,
    progress,
    value: springState.value,
    velocity: springState.velocity,
    start,
    stop,
    reset
  }
}
