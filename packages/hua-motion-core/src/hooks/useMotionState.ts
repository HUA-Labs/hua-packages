import { useState, useEffect, useRef, useCallback } from 'react'

type MotionState = 'idle' | 'playing' | 'paused' | 'completed' | 'error'
type MotionDirection = 'forward' | 'reverse' | 'alternate'

interface MotionStateOptions {
  initialState?: MotionState
  /** @deprecated Use autoStart instead */
  autoPlay?: boolean
  autoStart?: boolean
  loop?: boolean
  direction?: MotionDirection
  duration?: number
  delay?: number
  showOnMount?: boolean
}

interface MotionStateReturn {
  state: MotionState
  direction: MotionDirection
  progress: number // 0-100
  elapsed: number // 경과 시간 (ms)
  remaining: number // 남은 시간 (ms)
  mounted: boolean
  play: () => void
  pause: () => void
  stop: () => void
  reset: () => void
  reverse: () => void
  seek: (progress: number) => void
  setState: (newState: MotionState) => void
}

export function useMotionState(options: MotionStateOptions = {}): MotionStateReturn {
  const {
    initialState = 'idle',
    autoPlay,
    autoStart = autoPlay ?? false,
    loop = false,
    direction = 'forward',
    duration = 1000,
    delay = 0,
    showOnMount = false
  } = options

  const [state, setState] = useState<MotionState>(showOnMount ? initialState : 'idle')
  const [currentDirection, setCurrentDirection] = useState<MotionDirection>(direction)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [mounted, setMounted] = useState(false)
  
  const motionRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const pauseTimeRef = useRef<number | null>(null)
  const totalPausedTimeRef = useRef(0)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 모션 루프
  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp
    }

    const adjustedTimestamp = timestamp - totalPausedTimeRef.current
    const elapsedTime = adjustedTimestamp - startTimeRef.current
    const newElapsed = Math.max(0, elapsedTime - delay)
    
    setElapsed(newElapsed)

    // 진행률 계산
    let newProgress = 0
    if (newElapsed >= 0) {
      newProgress = Math.min(100, (newElapsed / duration) * 100)
    }

    // 방향에 따른 진행률 조정
    if (currentDirection === 'reverse') {
      newProgress = 100 - newProgress
    } else if (currentDirection === 'alternate') {
      const cycle = Math.floor(newElapsed / duration)
      const cycleProgress = (newElapsed % duration) / duration
      newProgress = cycle % 2 === 0 ? cycleProgress * 100 : (1 - cycleProgress) * 100
    }

    setProgress(newProgress)

    // 모션 완료 체크
    if (newElapsed >= duration) {
      if (loop) {
        // 루프: 처음부터 다시 시작
        startTimeRef.current = timestamp || performance.now()
        totalPausedTimeRef.current = 0
        setElapsed(0)
        setProgress(currentDirection === 'reverse' ? 100 : 0)
      } else {
        // 완료
        setState('completed')
        setProgress(currentDirection === 'reverse' ? 0 : 100)
        if (motionRef.current) {
          cancelAnimationFrame(motionRef.current)
          motionRef.current = null
        }
        return
      }
    }

    // 다음 프레임 요청
    if (state === 'playing') {
      motionRef.current = requestAnimationFrame(animate)
    }
  }, [state, duration, delay, loop, currentDirection])

  // 재생 시작
  const play = useCallback(() => {
    if (!mounted) return
    
    if (state === 'completed') {
      // 완료된 상태에서 재생 시 처음부터 시작
      reset()
    }

    setState('playing')
    
    if (pauseTimeRef.current) {
      // 일시정지에서 재개
      totalPausedTimeRef.current += performance.now() - pauseTimeRef.current
      pauseTimeRef.current = null
    } else {
      // 새로운 모션 시작
      startTimeRef.current = null
      totalPausedTimeRef.current = 0
    }

    if (!motionRef.current) {
      motionRef.current = requestAnimationFrame(animate)
    }
  }, [mounted, state, animate])

  // 일시정지
  const pause = useCallback(() => {
    if (state !== 'playing') return
    
    setState('paused')
    pauseTimeRef.current = performance.now()
    
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [state])

  // 정지
  const stop = useCallback(() => {
    setState('idle')
    setProgress(0)
    setElapsed(0)
    startTimeRef.current = null
    pauseTimeRef.current = null
    totalPausedTimeRef.current = 0
    
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [])

  // 리셋
  const reset = useCallback(() => {
    setState('idle')
    setProgress(0)
    setElapsed(0)
    setCurrentDirection(direction)
    startTimeRef.current = null
    pauseTimeRef.current = null
    totalPausedTimeRef.current = 0
    
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [direction])

  // 역방향 전환
  const reverse = useCallback(() => {
    const newDirection: MotionDirection = currentDirection === 'forward' ? 'reverse' : 'forward'
    setCurrentDirection(newDirection)
    
    // 현재 진행률을 역방향으로 조정
    if (state === 'playing') {
      const remainingTime = duration - elapsed
      startTimeRef.current = performance.now() - remainingTime
      totalPausedTimeRef.current = 0
    }
  }, [currentDirection, state, duration, elapsed])

  // 특정 진행률로 이동
  const seek = useCallback((targetProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, targetProgress))
    setProgress(clampedProgress)
    
    // 경과 시간 계산
    let targetElapsed = 0
    if (currentDirection === 'reverse') {
      targetElapsed = ((100 - clampedProgress) / 100) * duration
    } else if (currentDirection === 'alternate') {
      // alternate의 경우 복잡하므로 단순화
      targetElapsed = (clampedProgress / 100) * duration
    } else {
      targetElapsed = (clampedProgress / 100) * duration
    }
    
    setElapsed(targetElapsed)
    
    // 모션이 재생 중이면 시간 조정
    if (state === 'playing' && startTimeRef.current) {
      const currentTime = performance.now()
      startTimeRef.current = currentTime - targetElapsed - totalPausedTimeRef.current
    }
  }, [currentDirection, duration, state])

  // 상태 직접 설정
  const setMotionState = useCallback((newState: MotionState) => {
    setState(newState)
    
    if (newState === 'playing' && !motionRef.current) {
      motionRef.current = requestAnimationFrame(animate)
    } else if (newState !== 'playing' && motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [animate])

  // 자동 재생
  useEffect(() => {
    if (mounted && autoStart && state === 'idle') {
      play()
    }
  }, [mounted, autoStart, state, play])

  // 클린업
  useEffect(() => {
    return () => {
      if (motionRef.current) {
        cancelAnimationFrame(motionRef.current)
      }
    }
  }, [])

  return {
    state,
    direction: currentDirection,
    progress,
    elapsed,
    remaining: Math.max(0, duration - elapsed),
    mounted,
    play,
    pause,
    stop,
    reset,
    reverse,
    seek,
    setState: setMotionState
  }
}
