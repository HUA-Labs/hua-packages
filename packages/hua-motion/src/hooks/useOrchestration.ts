import { useRef, useState, useCallback, useEffect } from 'react'

export interface AnimationStep {
  id: string
  animation: () => void
  delay?: number
  duration?: number
  onComplete?: () => void
}

export interface OrchestrationConfig {
  steps: AnimationStep[]
  autoStart?: boolean
  loop?: boolean
  onComplete?: () => void
  onStepComplete?: (stepId: string) => void
}

export interface OrchestrationState {
  isPlaying: boolean
  currentStep: number
  progress: number
  isComplete: boolean
}

export function useOrchestration(config: OrchestrationConfig) {
  const {
    steps,
    autoStart = false,
    loop = false,
    onComplete,
    onStepComplete
  } = config

  const [state, setState] = useState<OrchestrationState>({
    isPlaying: false,
    currentStep: 0,
    progress: 0,
    isComplete: false
  })

  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([])
  const startTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number>()

  // 모든 타임아웃 정리
  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }, [])

  // 애니메이션 프레임 정리
  const clearAnimationFrame = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  // 진행률 업데이트
  const updateProgress = useCallback(() => {
    if (!state.isPlaying) return

    const elapsed = Date.now() - startTimeRef.current
    const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 1000), 0)
    const progress = Math.min(elapsed / totalDuration, 1)

    setState(prev => ({ ...prev, progress }))

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(updateProgress)
    }
  }, [state.isPlaying, steps])

  // 시퀀스 실행
  const play = useCallback(() => {
    if (state.isPlaying) return

    setState(prev => ({
      ...prev,
      isPlaying: true,
      currentStep: 0,
      progress: 0,
      isComplete: false
    }))

    startTimeRef.current = Date.now()
    updateProgress()

    let currentDelay = 0

    steps.forEach((step, index) => {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, currentStep: index }))
        
        step.animation()
        onStepComplete?.(step.id)

        // 마지막 스텝인지 확인
        if (index === steps.length - 1) {
          setState(prev => ({ 
            ...prev, 
            isPlaying: false, 
            isComplete: true,
            progress: 1 
          }))
          
          onComplete?.()

          // 루프 설정이 있으면 다시 시작
          if (loop) {
            setTimeout(() => play(), 1000)
          }
        }
      }, currentDelay)

      timeoutRefs.current.push(timeout)
      currentDelay += (step.delay || 0) + (step.duration || 1000)
    })
  }, [steps, state.isPlaying, loop, onComplete, onStepComplete, updateProgress])

  // 정지
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isPlaying: false }))
    clearTimeouts()
    clearAnimationFrame()
  }, [clearTimeouts, clearAnimationFrame])

  // 재개
  const resume = useCallback(() => {
    if (state.isComplete) return
    
    setState(prev => ({ ...prev, isPlaying: true }))
    startTimeRef.current = Date.now() - (state.progress * steps.reduce((sum, step) => sum + (step.duration || 1000), 0))
    updateProgress()
  }, [state.isComplete, state.progress, steps, updateProgress])

  // 리셋
  const reset = useCallback(() => {
    setState({
      isPlaying: false,
      currentStep: 0,
      progress: 0,
      isComplete: false
    })
    clearTimeouts()
    clearAnimationFrame()
  }, [clearTimeouts, clearAnimationFrame])

  // 특정 스텝으로 점프
  const jumpTo = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return

    reset()
    setState(prev => ({ ...prev, currentStep: stepIndex }))
  }, [steps.length, reset])

  // 특정 스텝만 실행
  const playStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return

    const step = steps[stepIndex]
    setState(prev => ({ ...prev, currentStep: stepIndex }))
    step.animation()
    onStepComplete?.(step.id)
  }, [steps, onStepComplete])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      play()
    }

    return () => {
      clearTimeouts()
      clearAnimationFrame()
    }
  }, [autoStart, play, clearTimeouts, clearAnimationFrame])

  return {
    state,
    play,
    pause,
    resume,
    reset,
    jumpTo,
    playStep
  }
}

// 체이닝을 위한 헬퍼 함수
export function createAnimationChain() {
  const steps: AnimationStep[] = []
  let currentDelay = 0

  const chain = {
    add: (id: string, animation: () => void, options: { delay?: number; duration?: number; onComplete?: () => void } = {}) => {
      steps.push({
        id,
        animation,
        delay: currentDelay,
        duration: options.duration || 1000,
        onComplete: options.onComplete
      })
      currentDelay += (options.delay || 0) + (options.duration || 1000)
      return chain
    },
    build: () => steps
  }

  return chain
} 