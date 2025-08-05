import { useRef, useEffect, useState, useCallback } from 'react'

interface SpringConfig {
  mass?: number
  stiffness?: number
  damping?: number
  restDelta?: number
  restSpeed?: number
}

interface SpringAnimationOptions {
  from: number
  to: number
  config?: SpringConfig
  onComplete?: () => void
  enabled?: boolean
}

interface SpringState {
  value: number
  velocity: number
  isAnimating: boolean
}

export function useSpringAnimation(options: SpringAnimationOptions) {
  const {
    from,
    to,
    config = {
      mass: 1,
      stiffness: 100,
      damping: 10,
      restDelta: 0.01,
      restSpeed: 0.01
    },
    onComplete,
    enabled = true
  } = options

  const [springState, setSpringState] = useState<SpringState>({
    value: from,
    velocity: 0,
    isAnimating: false
  })

  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // 스프링 물리 계산
  const calculateSpring = useCallback((currentValue: number, currentVelocity: number, targetValue: number, deltaTime: number) => {
    const { mass = 1, stiffness = 100, damping = 10 } = config
    
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
  }, [config])

  // 애니메이션 루프
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

    // 정지 조건 확인
    const isAtRest = Math.abs(value - to) < (config.restDelta || 0.01) && Math.abs(velocity) < (config.restSpeed || 0.01)

    if (isAtRest) {
      setSpringState({
        value: to,
        velocity: 0,
        isAnimating: false
      })
      onComplete?.()
      return
    }

    setSpringState({
      value,
      velocity,
      isAnimating: true
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [enabled, springState.isAnimating, springState.value, springState.velocity, to, calculateSpring, config.restDelta, config.restSpeed, onComplete])

  // 애니메이션 시작
  const start = useCallback(() => {
    if (!enabled) return

    setSpringState(prev => ({ ...prev, isAnimating: true }))
    lastTimeRef.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)
  }, [enabled, animate])

  // 애니메이션 정지
  const stop = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setSpringState(prev => ({ ...prev, isAnimating: false }))
  }, [])

  // 초기값 설정
  useEffect(() => {
    setSpringState({
      value: from,
      velocity: 0,
      isAnimating: false
    })
  }, [from])

  // 타겟값 변경 시 애니메이션 시작
  useEffect(() => {
    if (enabled && Math.abs(springState.value - to) > (config.restDelta || 0.01)) {
      start()
    }
  }, [to, enabled, start, springState.value, config.restDelta])

  // 정리
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return {
    value: springState.value,
    velocity: springState.velocity,
    isAnimating: springState.isAnimating,
    start,
    stop
  }
} 