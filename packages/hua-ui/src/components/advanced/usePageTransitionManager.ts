'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { TransitionType, TransitionEasing, TransitionConfig } from './usePageTransition'

export interface PageTransitionManagerConfig {
  defaultType?: TransitionType
  defaultDuration?: number
  defaultEasing?: TransitionEasing
  enableHistory?: boolean
  enableProgress?: boolean
  enableDebug?: boolean
}

export interface PageTransitionEvent {
  id: string
  type: TransitionType
  duration: number
  easing: TransitionEasing
  timestamp: number
  status: 'pending' | 'active' | 'completed' | 'failed'
}

export interface PageTransitionManagerState {
  isTransitioning: boolean
  currentTransition: PageTransitionEvent | null
  transitionHistory: PageTransitionEvent[]
  totalTransitions: number
  averageDuration: number
}

export interface PageTransitionManagerControls {
  startTransition: (config: Partial<TransitionConfig>) => Promise<string>
  cancelTransition: (id: string) => void
  pauseAll: () => void
  resumeAll: () => void
  clearHistory: () => void
  getTransitionStats: () => {
    total: number
    average: number
    byType: Record<TransitionType, number>
    byStatus: Record<string, number>
  }
}

export const usePageTransitionManager = (
  config: PageTransitionManagerConfig = {}
): [PageTransitionManagerState, PageTransitionManagerControls] => {
  const {
    defaultType = 'fade',
    defaultDuration = 500,
    defaultEasing = 'smooth',
    enableHistory = true,
    enableProgress = true,
    enableDebug = false
  } = config

  const [state, setState] = useState<PageTransitionManagerState>({
    isTransitioning: false,
    currentTransition: null,
    transitionHistory: [],
    totalTransitions: 0,
    averageDuration: 0
  })

  const activeTransitionsRef = useRef<Map<string, { timer: NodeJS.Timeout; config: TransitionConfig }>>(new Map())
  const transitionCounterRef = useRef(0)

  const logDebug = useCallback((message: string, data?: unknown) => {
    if (enableDebug) {
      console.log(`[PageTransitionManager] ${message}`, data)
    }
  }, [enableDebug])

  const updateStats = useCallback((newTransition: PageTransitionEvent) => {
    setState(prev => {
      const newHistory = enableHistory ? [...prev.transitionHistory, newTransition] : prev.transitionHistory
      const total = newHistory.length
      const average = newHistory.reduce((sum, t) => sum + t.duration, 0) / total

      return {
        ...prev,
        totalTransitions: total,
        averageDuration: average,
        transitionHistory: newHistory
      }
    })
  }, [enableHistory])

  const startTransition = useCallback(async (config: Partial<TransitionConfig>): Promise<string> => {
    const transitionId = `transition_${++transitionCounterRef.current}`
    const fullConfig: TransitionConfig = {
      type: defaultType,
      duration: defaultDuration,
      easing: defaultEasing,
      ...config
    }

    const transitionEvent: PageTransitionEvent = {
      id: transitionId,
      type: fullConfig.type,
      duration: fullConfig.duration,
      easing: fullConfig.easing,
      timestamp: Date.now(),
      status: 'pending'
    }

    logDebug('Starting transition', { id: transitionId, config: fullConfig })

    setState(prev => ({
      ...prev,
      isTransitioning: true,
      currentTransition: transitionEvent
    }))

    // 실제 전환 로직을 시뮬레이션 (실제로는 usePageTransition과 연동)
    const timer = setTimeout(() => {
      const completedEvent: PageTransitionEvent = {
        ...transitionEvent,
        status: 'completed'
      }

      setState(prev => ({
        ...prev,
        isTransitioning: false,
        currentTransition: null
      }))

      updateStats(completedEvent)
      activeTransitionsRef.current.delete(transitionId)
      logDebug('Transition completed', { id: transitionId })

      fullConfig.onComplete?.()
    }, fullConfig.duration)

    activeTransitionsRef.current.set(transitionId, { timer, config: fullConfig })

    // 진행 상태 업데이트
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentTransition: {
          ...prev.currentTransition!,
          status: 'active'
        }
      }))
    }, 50)

    return transitionId
  }, [defaultType, defaultDuration, defaultEasing, logDebug, updateStats])

  const cancelTransition = useCallback((id: string) => {
    const transition = activeTransitionsRef.current.get(id)
    if (transition) {
      clearTimeout(transition.timer)
      activeTransitionsRef.current.delete(id)

      setState(prev => ({
        ...prev,
        isTransitioning: activeTransitionsRef.current.size > 0,
        currentTransition: prev.currentTransition?.id === id ? null : prev.currentTransition
      }))

      logDebug('Transition cancelled', { id })
    }
  }, [logDebug])

  const pauseAll = useCallback(() => {
    activeTransitionsRef.current.forEach(({ timer }, id) => {
      clearTimeout(timer)
      logDebug('Transition paused', { id })
    })
  }, [logDebug])

  const resumeAll = useCallback(() => {
    activeTransitionsRef.current.forEach(({ config }, id) => {
      startTransition(config)
    })
  }, [startTransition])

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      transitionHistory: [],
      totalTransitions: 0,
      averageDuration: 0
    }))
    logDebug('History cleared')
  }, [logDebug])

  const getTransitionStats = useCallback(() => {
    const { transitionHistory } = state
    const byType = transitionHistory.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + 1
      return acc
    }, {} as Record<TransitionType, number>)

    const byStatus = transitionHistory.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: transitionHistory.length,
      average: state.averageDuration,
      byType,
      byStatus
    }
  }, [state])

  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 모든 타이머 정리
      activeTransitionsRef.current.forEach(({ timer }) => {
        clearTimeout(timer)
      })
      activeTransitionsRef.current.clear()
    }
  }, [])

  return [state, {
    startTransition,
    cancelTransition,
    pauseAll,
    resumeAll,
    clearHistory,
    getTransitionStats
  }]
}

// 특정 전환 타입을 위한 편의 훅들
export const useFadeTransitionManager = (config?: PageTransitionManagerConfig) => {
  return usePageTransitionManager({ ...config, defaultType: 'fade' })
}

export const useSlideTransitionManager = (config?: PageTransitionManagerConfig) => {
  return usePageTransitionManager({ ...config, defaultType: 'slide' })
}

export const useScaleTransitionManager = (config?: PageTransitionManagerConfig) => {
  return usePageTransitionManager({ ...config, defaultType: 'scale' })
}

export const useMorphTransitionManager = (config?: PageTransitionManagerConfig) => {
  return usePageTransitionManager({ ...config, defaultType: 'morph' })
}

export const useCubeTransitionManager = (config?: PageTransitionManagerConfig) => {
  return usePageTransitionManager({ ...config, defaultType: 'cube' })
}
