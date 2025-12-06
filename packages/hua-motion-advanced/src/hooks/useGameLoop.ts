import { useState, useEffect, useRef, useCallback } from 'react'

export interface GameLoopConfig {
  fps?: number // 목표 FPS (기본값: 60)
  autoStart?: boolean // 자동 시작 여부
  maxFPS?: number // 최대 FPS 제한
  minFPS?: number // 최소 FPS 경고
  showOnMount?: boolean
}

export interface GameState {
  isRunning: boolean
  fps: number
  deltaTime: number
  elapsedTime: number
  frameCount: number
  mounted: boolean
}

interface GameLoopReturn {
  isRunning: boolean
  fps: number // 현재 FPS
  deltaTime: number // 프레임 간 시간 차이 (ms)
  elapsedTime: number // 총 경과 시간 (ms)
  frameCount: number // 총 프레임 수
  mounted: boolean
  start: () => void
  stop: () => void
  pause: () => void
  resume: () => void
  reset: () => void
  onUpdate: (callback: (deltaTime: number, elapsedTime: number) => void) => void
  onRender: (callback: (deltaTime: number, elapsedTime: number) => void) => void
}

export function useGameLoop(options: GameLoopConfig = {}): GameLoopReturn {
  const {
    fps = 60,
    autoStart = false,
    maxFPS = 120,
    minFPS = 30,
    showOnMount = false
  } = options

  const [isRunning, setIsRunning] = useState(showOnMount ? autoStart : false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentFPS, setCurrentFPS] = useState(0)
  const [deltaTime, setDeltaTime] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  const motionRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)
  const frameTimeRef = useRef(1000 / fps) // 목표 프레임 시간
  const fpsUpdateTimeRef = useRef(0)
  const fpsFrameCountRef = useRef(0)
  
  const updateCallbacksRef = useRef<((deltaTime: number, elapsedTime: number) => void)[]>([])
  const renderCallbacksRef = useRef<((deltaTime: number, elapsedTime: number) => void)[]>([])

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 게임 루프 메인 함수
  const gameLoop = useCallback((currentTime: number) => {
    if (!isRunning || isPaused) return

    // 첫 프레임 처리
    if (lastTimeRef.current === null) {
      lastTimeRef.current = currentTime
      motionRef.current = requestAnimationFrame(gameLoop)
      return
    }

    // 델타 타임 계산
    const delta = currentTime - lastTimeRef.current
    const targetDelta = frameTimeRef.current

    // FPS 제한 적용
    if (delta >= targetDelta) {
      // 업데이트 로직 실행
      updateCallbacksRef.current.forEach(callback => {
        try {
          callback(delta, elapsedTime)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Game loop update error:', error)
          }
        }
      })

      // 렌더링 로직 실행
      renderCallbacksRef.current.forEach(callback => {
        try {
          callback(delta, elapsedTime)
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Game loop render error:', error)
          }
        }
      })

      // 상태 업데이트
      setDeltaTime(delta)
      setElapsedTime(prev => prev + delta)
      setFrameCount(prev => prev + 1)
      lastTimeRef.current = currentTime

      // FPS 계산 (1초마다 업데이트)
      fpsFrameCountRef.current++
      if (currentTime - fpsUpdateTimeRef.current >= 1000) {
        const newFPS = Math.round(fpsFrameCountRef.current * 1000 / (currentTime - fpsUpdateTimeRef.current))
        setCurrentFPS(newFPS)
        fpsFrameCountRef.current = 0
        fpsUpdateTimeRef.current = currentTime

        // FPS 경고 (개발 모드에서만)
        if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
          if (newFPS < minFPS) {
            console.warn(`Low FPS detected: ${newFPS} (min: ${minFPS})`)
          }
        }
      }
    }

    // 다음 프레임 요청
    motionRef.current = requestAnimationFrame(gameLoop)
  }, [isRunning, isPaused, elapsedTime, minFPS])

  // 게임 루프 시작
  const start = useCallback(() => {
    if (!mounted) return
    
    setIsRunning(true)
    setIsPaused(false)
    setElapsedTime(0)
    setFrameCount(0)
    setDeltaTime(0)
    setCurrentFPS(0)
    
    lastTimeRef.current = null
    fpsUpdateTimeRef.current = 0
    fpsFrameCountRef.current = 0

    if (!motionRef.current) {
      motionRef.current = requestAnimationFrame(gameLoop)
    }
  }, [mounted, gameLoop])

  // 게임 루프 정지
  const stop = useCallback(() => {
    setIsRunning(false)
    setIsPaused(false)
    
    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [])

  // 게임 루프 일시정지
  const pause = useCallback(() => {
    if (!isRunning) return
    setIsPaused(true)
  }, [isRunning])

  // 게임 루프 재개
  const resume = useCallback(() => {
    if (!isRunning) return
    setIsPaused(false)
    
    if (!motionRef.current) {
      motionRef.current = requestAnimationFrame(gameLoop)
    }
  }, [isRunning, gameLoop])

  // 게임 루프 리셋
  const reset = useCallback(() => {
    setElapsedTime(0)
    setFrameCount(0)
    setDeltaTime(0)
    setCurrentFPS(0)
    
    lastTimeRef.current = null
    fpsUpdateTimeRef.current = 0
    fpsFrameCountRef.current = 0
  }, [])

  // 업데이트 콜백 등록
  const onUpdate = useCallback((callback: (deltaTime: number, elapsedTime: number) => void) => {
    updateCallbacksRef.current.push(callback)
    
    // 클린업 함수 반환
    return () => {
      const index = updateCallbacksRef.current.indexOf(callback)
      if (index > -1) {
        updateCallbacksRef.current.splice(index, 1)
      }
    }
  }, [])

  // 렌더링 콜백 등록
  const onRender = useCallback((callback: (deltaTime: number, elapsedTime: number) => void) => {
    renderCallbacksRef.current.push(callback)
    
    // 클린업 함수 반환
    return () => {
      const index = renderCallbacksRef.current.indexOf(callback)
      if (index > -1) {
        renderCallbacksRef.current.splice(index, 1)
      }
    }
  }, [])

  // FPS 변경 시 프레임 시간 업데이트
  useEffect(() => {
    frameTimeRef.current = 1000 / Math.min(fps, maxFPS)
  }, [fps, maxFPS])

  // 자동 시작
  useEffect(() => {
    if (mounted && autoStart && !isRunning) {
      start()
    }
  }, [mounted, autoStart, isRunning, start])

  // 클린업
  useEffect(() => {
    return () => {
          if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
    }
    }
  }, [])

  return {
    isRunning,
    fps: currentFPS,
    deltaTime,
    elapsedTime,
    frameCount,
    mounted,
    start,
    stop,
    pause,
    resume,
    reset,
    onUpdate,
    onRender
  }
}
