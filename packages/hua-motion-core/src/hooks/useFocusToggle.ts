import { useState, useEffect, useRef, useCallback } from 'react'

interface FocusToggleOptions {
  initialState?: boolean // 초기 상태
  toggleOnFocus?: boolean // 포커스 시 토글 여부
  toggleOnBlur?: boolean // 블러 시 토글 여부
  toggleOnFocusIn?: boolean // focusin 이벤트 시 토글 여부
  toggleOnFocusOut?: boolean // focusout 이벤트 시 토글 여부
  autoReset?: boolean // 자동 리셋 여부
  resetDelay?: number // 자동 리셋 지연 시간 (ms)
  preventDefault?: boolean // 기본 이벤트 방지 여부
  stopPropagation?: boolean // 이벤트 전파 중단 여부
  showOnMount?: boolean
}

interface FocusToggleReturn {
  isActive: boolean
  mounted: boolean
  toggle: () => void
  activate: () => void
  deactivate: () => void
  reset: () => void
  focusHandlers: {
    onFocus?: (event: React.FocusEvent) => void
    onBlur?: (event: React.FocusEvent) => void
    onFocusIn?: (event: React.FocusEvent) => void
    onFocusOut?: (event: React.FocusEvent) => void
  }
  ref: React.RefObject<HTMLElement | null>
}

export function useFocusToggle(options: FocusToggleOptions = {}): FocusToggleReturn {
  const {
    initialState = false,
    toggleOnFocus = true,
    toggleOnBlur = false,
    toggleOnFocusIn = false,
    toggleOnFocusOut = false,
    autoReset = false,
    resetDelay = 3000,
    preventDefault = false,
    stopPropagation = false,
    showOnMount = false
  } = options

  const [isActive, setIsActive] = useState(showOnMount ? initialState : false)
  const [mounted, setMounted] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement>(null)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  // 자동 리셋 타이머 관리
  const startResetTimer = useCallback(() => {
    if (!autoReset || resetDelay <= 0) return

    // 기존 타이머 클리어
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current)
    }

    // 새 타이머 설정
    resetTimeoutRef.current = window.setTimeout(() => {
      setIsActive(false)
      resetTimeoutRef.current = null
    }, resetDelay)
  }, [autoReset, resetDelay])

  // 토글 함수
  const toggle = useCallback(() => {
    if (!mounted) return
    
    setIsActive(prev => {
      const newState = !prev
      
      // 자동 리셋 타이머 시작
      if (newState && autoReset) {
        startResetTimer()
      } else if (!newState && resetTimeoutRef.current !== null) {
        // 비활성화 시 타이머 클리어
        clearTimeout(resetTimeoutRef.current)
        resetTimeoutRef.current = null
      }
      
      return newState
    })
  }, [mounted, autoReset, startResetTimer])

  // 활성화 함수
  const activate = useCallback(() => {
    if (!mounted || isActive) return
    
    setIsActive(true)
    if (autoReset) {
      startResetTimer()
    }
  }, [mounted, isActive, autoReset, startResetTimer])

  // 비활성화 함수
  const deactivate = useCallback(() => {
    if (!mounted || !isActive) return
    
    setIsActive(false)
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [mounted, isActive])

  // 리셋 함수
  const reset = useCallback(() => {
    setIsActive(initialState)
    if (resetTimeoutRef.current !== null) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
  }, [initialState])

  // 포커스 핸들러
  const handleFocus = useCallback((event: React.FocusEvent) => {
    if (!toggleOnFocus) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    activate()
  }, [toggleOnFocus, preventDefault, stopPropagation, activate])

  // 블러 핸들러
  const handleBlur = useCallback((event: React.FocusEvent) => {
    if (!toggleOnBlur) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    deactivate()
  }, [toggleOnBlur, preventDefault, stopPropagation, deactivate])

  // 포커스 인 핸들러
  const handleFocusIn = useCallback((event: React.FocusEvent) => {
    if (!toggleOnFocusIn) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    activate()
  }, [toggleOnFocusIn, preventDefault, stopPropagation, activate])

  // 포커스 아웃 핸들러
  const handleFocusOut = useCallback((event: React.FocusEvent) => {
    if (!toggleOnFocusOut) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    deactivate()
  }, [toggleOnFocusOut, preventDefault, stopPropagation, deactivate])

  // 클린업
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  // 포커스 핸들러 객체 생성
  const focusHandlers = {
    ...(toggleOnFocus && { onFocus: handleFocus }),
    ...(toggleOnBlur && { onBlur: handleBlur }),
    ...(toggleOnFocusIn && { onFocusIn: handleFocusIn }),
    ...(toggleOnFocusOut && { onFocusOut: handleFocusOut })
  }

  return {
    isActive,
    mounted,
    toggle,
    activate,
    deactivate,
    reset,
    focusHandlers,
    ref: elementRef
  }
}
