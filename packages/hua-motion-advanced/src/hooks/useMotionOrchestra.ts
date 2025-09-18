import { useRef, useEffect, useState, useCallback } from 'react'

interface MotionStep {
  id: string
  motion: () => void
  delay?: number
  duration?: number
  onComplete?: () => void
}

interface MotionOrchestraOptions {
  mode?: 'sequential' | 'parallel' | 'stagger'
  staggerDelay?: number
  autoStart?: boolean
  loop?: boolean
  onComplete?: () => void
}

interface OrchestraState {
  isPlaying: boolean
  currentStep: number
  completedSteps: Set<string>
}

export function useMotionOrchestra(options: MotionOrchestraOptions = {}) {
  const {
    mode = 'sequential',
    staggerDelay = 100,
    autoStart = false,
    loop = false,
    onComplete
  } = options

  const [orchestraState, setOrchestraState] = useState<OrchestraState>({
    isPlaying: false,
    currentStep: 0,
    completedSteps: new Set()
  })

  const motionsRef = useRef<MotionStep[]>([])
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // 모션 추가
  const addMotion = useCallback((step: MotionStep) => {
    motionsRef.current.push(step)
  }, [])

  // 모션 제거
  const removeMotion = useCallback((id: string) => {
    motionsRef.current = motionsRef.current.filter(step => step.id !== id)
  }, [])

  // 모든 타임아웃 정리
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout))
    timeoutsRef.current = []
  }, [])

  // 순차 실행
  const playSequential = useCallback(() => {
    if (motionsRef.current.length === 0) return

          const playStep = (index: number) => {
        if (index >= motionsRef.current.length) {
        // 모든 모션 완료
        setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
        onComplete?.()
        
        if (loop) {
          // 루프 모드: 다시 시작
          setTimeout(() => {
            setOrchestraState(prev => ({ ...prev, isPlaying: true, completedSteps: new Set() }))
            playSequential()
          }, 1000)
        }
        return
      }

              const step = motionsRef.current[index]
      setOrchestraState(prev => ({ 
        ...prev, 
        currentStep: index,
        completedSteps: new Set([...prev.completedSteps, step.id])
      }))

              // 모션 실행
        step.motion()
      
      // 완료 콜백
      if (step.onComplete) {
        step.onComplete()
      }

      // 다음 단계로
      const timeout = setTimeout(() => {
        playStep(index + 1)
      }, step.delay || 0)
      
      timeoutsRef.current.push(timeout)
    }

    playStep(0)
  }, [loop, onComplete])

  // 병렬 실행
  const playParallel = useCallback(() => {
    if (motionsRef.current.length === 0) return

    const completedSteps = new Set<string>()
    
    motionsRef.current.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.motion()
        completedSteps.add(step.id)
        
        if (step.onComplete) {
          step.onComplete()
        }

        // 모든 모션 완료 확인
        if (completedSteps.size === motionsRef.current.length) {
          setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
          onComplete?.()
          
          if (loop) {
            setTimeout(() => {
              setOrchestraState(prev => ({ ...prev, isPlaying: true }))
              playParallel()
            }, 1000)
          }
        }
      }, step.delay || 0)
      
      timeoutsRef.current.push(timeout)
    })

    setOrchestraState(prev => ({ 
      ...prev, 
      completedSteps: new Set(completedSteps)
    }))
  }, [loop, onComplete])

  // 스태거 실행
  const playStagger = useCallback(() => {
    if (motionsRef.current.length === 0) return

    const completedSteps = new Set<string>()
    
    motionsRef.current.forEach((step, index) => {
      const timeout = setTimeout(() => {
        step.motion()
        completedSteps.add(step.id)
        
        if (step.onComplete) {
          step.onComplete()
        }

        setOrchestraState(prev => ({ 
          ...prev, 
          currentStep: index,
          completedSteps: new Set([...prev.completedSteps, step.id])
        }))

        // 모든 모션 완료 확인
        if (completedSteps.size === motionsRef.current.length) {
          setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
          onComplete?.()
          
          if (loop) {
            setTimeout(() => {
              setOrchestraState(prev => ({ ...prev, isPlaying: true, completedSteps: new Set() }))
              playStagger()
            }, 1000)
          }
        }
      }, (step.delay || 0) + (index * staggerDelay))
      
      timeoutsRef.current.push(timeout)
    })
  }, [staggerDelay, loop, onComplete])

  // 재생 시작
  const play = useCallback(() => {
    clearTimeouts()
    setOrchestraState(prev => ({ ...prev, isPlaying: true, currentStep: 0, completedSteps: new Set() }))

    switch (mode) {
      case 'sequential':
        playSequential()
        break
      case 'parallel':
        playParallel()
        break
      case 'stagger':
        playStagger()
        break
    }
  }, [mode, clearTimeouts, playSequential, playParallel, playStagger])

  // 정지
  const stop = useCallback(() => {
    clearTimeouts()
    setOrchestraState(prev => ({ ...prev, isPlaying: false, currentStep: 0 }))
  }, [clearTimeouts])

  // 일시정지
  const pause = useCallback(() => {
    setOrchestraState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  // 재개
  const resume = useCallback(() => {
    if (orchestraState.currentStep < motionsRef.current.length) {
      setOrchestraState(prev => ({ ...prev, isPlaying: true }))
      
      switch (mode) {
        case 'sequential':
          playSequential()
          break
        case 'parallel':
          playParallel()
          break
        case 'stagger':
          playStagger()
          break
      }
    }
  }, [mode, orchestraState.currentStep, playSequential, playParallel, playStagger])

  // 자동 시작
  useEffect(() => {
    if (autoStart && motionsRef.current.length > 0) {
      play()
    }
  }, [autoStart, play])

  // 정리
  useEffect(() => {
    return () => {
      clearTimeouts()
    }
  }, [clearTimeouts])

  return {
    addMotion,
    removeMotion,
    play,
    stop,
    pause,
    resume,
    isPlaying: orchestraState.isPlaying,
    currentStep: orchestraState.currentStep,
    completedSteps: orchestraState.completedSteps,
    totalSteps: motionsRef.current.length
  }
}
