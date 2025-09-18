import { useState, useEffect, useRef, useCallback } from 'react'

interface MotionStep {
  id: string
  duration: number
  delay?: number
  ease?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic'
  onStart?: () => void
  onUpdate?: (progress: number) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

interface OrchestrationOptions {
  // 기본 설정
  autoStart?: boolean // 자동 시작 여부
  loop?: boolean // 반복 여부
  loopCount?: number // 반복 횟수 (-1 = 무한)
  loopDelay?: number // 반복 간 지연 시간 (ms)
  
  // 타임라인 설정
  timeline?: MotionStep[] // 모션 시퀀스
  duration?: number // 전체 지속 시간 (ms)
  
  // 제어 설정
  speed?: number // 재생 속도 (1 = 정상, 2 = 2배 빠름)
  reverse?: boolean // 역방향 재생
  
  // 콜백 함수들
  onStart?: () => void
  onComplete?: () => void
  onLoop?: (count: number) => void
  onError?: (error: Error) => void
  onProgress?: (progress: number) => void
  onStepStart?: (stepId: string) => void
  onStepComplete?: (stepId: string) => void
}

interface OrchestrationState {
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  progress: number
  currentStep: string | null
  loopCount: number
  error: string | null
}

interface OrchestrationReturn {
  // 상태
  isPlaying: boolean
  isPaused: boolean
  currentTime: number
  progress: number
  currentStep: string | null
  loopCount: number
  error: string | null
  
  // 제어
  play: () => void
  pause: () => void
  stop: () => void
  reset: () => void
  seek: (time: number) => void
  setSpeed: (speed: number) => void
  reverse: () => void
  
  // 타임라인 관리
  addStep: (step: MotionStep) => void
  removeStep: (stepId: string) => void
  updateStep: (stepId: string, updates: Partial<MotionStep>) => void
  reorderSteps: (stepIds: string[]) => void
  
  // 유틸리티
  getStepProgress: (stepId: string) => number
  getStepTime: (stepId: string) => number
  getTotalDuration: () => number
}

export function useOrchestration(options: OrchestrationOptions = {}): OrchestrationReturn {
  const {
    autoStart = false,
    loop = false,
    loopCount = -1,
    loopDelay = 1000,
    timeline = [],
    duration: totalDuration,
    speed = 1,
    reverse = false,
    onStart,
    onComplete,
    onLoop,
    onError,
    onProgress,
    onStepStart,
    onStepComplete
  } = options

  const [state, setState] = useState<OrchestrationState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    progress: 0,
    currentStep: null,
    loopCount: 0,
    error: null
  })

  const [steps, setSteps] = useState<MotionStep[]>(timeline)
  const [currentSpeed, setCurrentSpeed] = useState(speed)
  const [isReversed, setIsReversed] = useState(reverse)

  const motionRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const pauseTimeRef = useRef<number>(0)
  const stepStartTimesRef = useRef<Map<string, number>>(new Map())
  const stepDurationsRef = useRef<Map<string, number>>(new Map())

  // 이징 함수
  const getEasing = useCallback((t: number, ease: string = 'linear'): number => {
    switch (ease) {
      case 'linear':
        return t
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
        }
      case 'elastic':
        if (t === 0) return 0
        if (t === 1) return 1
        return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1
      default:
        return t
    }
  }, [])

  // 전체 지속 시간 계산
  const getTotalDuration = useCallback((): number => {
    if (totalDuration) return totalDuration
    
    let maxEndTime = 0
    steps.forEach(step => {
      const stepEndTime = (step.delay || 0) + step.duration
      maxEndTime = Math.max(maxEndTime, stepEndTime)
    })
    return maxEndTime
  }, [steps, totalDuration])

  // 스텝 시작 시간 계산
  const calculateStepTimes = useCallback(() => {
    const stepTimes = new Map<string, number>()
    const stepDurations = new Map<string, number>()
    let currentTime = 0

    steps.forEach(step => {
      stepTimes.set(step.id, currentTime + (step.delay || 0))
      stepDurations.set(step.id, step.duration)
      currentTime += (step.delay || 0) + step.duration
    })

    stepStartTimesRef.current = stepTimes
    stepDurationsRef.current = stepDurations
  }, [steps])

  // 현재 스텝 찾기
  const getCurrentStep = useCallback((time: number): string | null => {
    for (const step of steps) {
      const startTime = stepStartTimesRef.current.get(step.id) || 0
      const endTime = startTime + (stepDurationsRef.current.get(step.id) || 0)
      
      if (time >= startTime && time <= endTime) {
        return step.id
      }
    }
    return null
  }, [steps])

  // 스텝 진행률 계산
  const getStepProgress = useCallback((stepId: string): number => {
    const startTime = stepStartTimesRef.current.get(stepId) || 0
    const duration = stepDurationsRef.current.get(stepId) || 0
    const currentTime = state.currentTime
    
    if (currentTime < startTime) return 0
    if (currentTime > startTime + duration) return 1
    
    const stepProgress = (currentTime - startTime) / duration
    return Math.max(0, Math.min(1, stepProgress))
  }, [state.currentTime])

  // 스텝 시간 계산
  const getStepTime = useCallback((stepId: string): number => {
    const startTime = stepStartTimesRef.current.get(stepId) || 0
    const duration = stepDurationsRef.current.get(stepId) || 0
    const currentTime = state.currentTime
    
    if (currentTime < startTime) return 0
    if (currentTime > startTime + duration) return duration
    
    return currentTime - startTime
  }, [state.currentTime])

  // 모션 업데이트
  const updateMotion = useCallback((currentTime: number) => {
    const totalDuration = getTotalDuration()
    const adjustedTime = isReversed ? totalDuration - currentTime : currentTime
    const progress = Math.min(adjustedTime / totalDuration, 1)
    
    const currentStep = getCurrentStep(adjustedTime)
    
    setState(prev => ({
      ...prev,
      currentTime: adjustedTime,
      progress,
      currentStep
    }))

    onProgress?.(progress)

    // 현재 스텝의 콜백 실행
    if (currentStep) {
      const step = steps.find(s => s.id === currentStep)
      if (step) {
        const stepProgress = getStepProgress(currentStep)
        const easedProgress = getEasing(stepProgress, step.ease)
        step.onUpdate?.(easedProgress)
      }
    }

    // 모션 완료 체크
    if (progress >= 1) {
      if (loop && (loopCount === -1 || state.loopCount < loopCount)) {
        // 루프
        setState(prev => ({
          ...prev,
          loopCount: prev.loopCount + 1
        }))
        onLoop?.(state.loopCount + 1)
        
        setTimeout(() => {
          reset()
          play()
        }, loopDelay)
      } else {
        // 완료
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentTime: isReversed ? 0 : totalDuration,
          progress: 1
        }))
        onComplete?.()
      }
    } else {
      // 계속 재생
      motionRef.current = requestAnimationFrame(() => {
        const elapsed = (performance.now() - startTimeRef.current) * currentSpeed / 1000
        updateMotion(elapsed)
      })
    }
  }, [getTotalDuration, isReversed, getCurrentStep, onProgress, steps, getStepProgress, getEasing, loop, loopCount, state.loopCount, loopDelay, onLoop, onComplete, currentSpeed])

  // 재생
  const play = useCallback(() => {
    if (state.isPlaying) return

    setState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      error: null
    }))

    onStart?.()
    
    const startTime = performance.now() - (state.currentTime * 1000 / currentSpeed)
    startTimeRef.current = startTime
    
    motionRef.current = requestAnimationFrame(() => {
      const elapsed = (performance.now() - startTimeRef.current) * currentSpeed / 1000
      updateMotion(elapsed)
    })
  }, [state.isPlaying, state.currentTime, currentSpeed, onStart, updateMotion])

  // 일시정지
  const pause = useCallback(() => {
    if (!state.isPlaying || state.isPaused) return

    setState(prev => ({
      ...prev,
      isPaused: true
    }))

    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }

    pauseTimeRef.current = state.currentTime
  }, [state.isPlaying, state.isPaused, state.currentTime])

  // 정지
  const stop = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      progress: 0,
      currentStep: null
    }))

    if (motionRef.current) {
      cancelAnimationFrame(motionRef.current)
      motionRef.current = null
    }
  }, [])

  // 리셋
  const reset = useCallback(() => {
    stop()
    setState(prev => ({
      ...prev,
      currentTime: 0,
      progress: 0,
      currentStep: null,
      loopCount: 0
    }))
  }, [stop])

  // 시크
  const seek = useCallback((time: number) => {
    const totalDuration = getTotalDuration()
    const clampedTime = Math.max(0, Math.min(time, totalDuration))
    
    setState(prev => ({
      ...prev,
      currentTime: clampedTime,
      progress: clampedTime / totalDuration,
      currentStep: getCurrentStep(clampedTime)
    }))
  }, [getTotalDuration, getCurrentStep])

  // 속도 설정
  const setSpeed = useCallback((speed: number) => {
    setCurrentSpeed(Math.max(0.1, speed))
  }, [])

  // 역방향 토글
  const reverseDirection = useCallback(() => {
    setIsReversed(prev => !prev)
  }, [])

  // 스텝 추가
  const addStep = useCallback((step: MotionStep) => {
    setSteps(prev => [...prev, step])
  }, [])

  // 스텝 제거
  const removeStep = useCallback((stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId))
  }, [])

  // 스텝 업데이트
  const updateStep = useCallback((stepId: string, updates: Partial<MotionStep>) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }, [])

  // 스텝 순서 변경
  const reorderSteps = useCallback((stepIds: string[]) => {
    setSteps(prev => {
      const stepMap = new Map(prev.map(step => [step.id, step]))
      return stepIds.map(id => stepMap.get(id)).filter(Boolean) as MotionStep[]
    })
  }, [])

  // 스텝 시작/완료 콜백 처리
  useEffect(() => {
    const currentStep = state.currentStep
    if (currentStep) {
      onStepStart?.(currentStep)
      
      const step = steps.find(s => s.id === currentStep)
      step?.onStart?.()
    }
  }, [state.currentStep, steps, onStepStart])

  // 스텝 완료 체크
  useEffect(() => {
    const currentStep = state.currentStep
    if (currentStep) {
      const stepProgress = getStepProgress(currentStep)
      if (stepProgress >= 1) {
        const step = steps.find(s => s.id === currentStep)
        step?.onComplete?.()
        onStepComplete?.(currentStep)
      }
    }
  }, [state.currentTime, state.currentStep, steps, getStepProgress, onStepComplete])

  // 스텝 시간 재계산
  useEffect(() => {
    calculateStepTimes()
  }, [calculateStepTimes])

  // 자동 시작
  useEffect(() => {
    if (autoStart && steps.length > 0) {
      play()
    }
  }, [autoStart, steps.length, play])

  // 클린업
  useEffect(() => {
    return () => {
      if (motionRef.current) {
        cancelAnimationFrame(motionRef.current)
      }
    }
  }, [])

  return {
    // 상태
    isPlaying: state.isPlaying,
    isPaused: state.isPaused,
    currentTime: state.currentTime,
    progress: state.progress,
    currentStep: state.currentStep,
    loopCount: state.loopCount,
    error: state.error,
    
    // 제어
    play,
    pause,
    stop,
    reset,
    seek,
    setSpeed,
    reverse: reverseDirection,
    
    // 타임라인 관리
    addStep,
    removeStep,
    updateStep,
    reorderSteps,
    
    // 유틸리티
    getStepProgress,
    getStepTime,
    getTotalDuration
  }
} 