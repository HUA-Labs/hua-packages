import { useState, useEffect, useRef, useCallback } from 'react'

interface ClickToggleOptions {
  initialState?: boolean // 초기 상태
  toggleOnClick?: boolean // 클릭 시 토글 여부
  toggleOnDoubleClick?: boolean // 더블클릭 시 토글 여부
  toggleOnRightClick?: boolean // 우클릭 시 토글 여부
  toggleOnEnter?: boolean // Enter 키로 토글 여부
  toggleOnSpace?: boolean // Space 키로 토글 여부
  autoReset?: boolean // 자동 리셋 여부
  resetDelay?: number // 자동 리셋 지연 시간 (ms)
  preventDefault?: boolean // 기본 이벤트 방지 여부
  stopPropagation?: boolean // 이벤트 전파 중단 여부
  showOnMount?: boolean
}

interface ClickToggleReturn {
  isActive: boolean
  mounted: boolean
  toggle: () => void
  activate: () => void
  deactivate: () => void
  reset: () => void
  clickHandlers: {
    onClick?: (event: React.MouseEvent) => void
    onDoubleClick?: (event: React.MouseEvent) => void
    onContextMenu?: (event: React.MouseEvent) => void
    onKeyDown?: (event: React.KeyboardEvent) => void
  }
}

export function useClickToggle(options: ClickToggleOptions = {}): ClickToggleReturn {
  const {
    initialState = false,
    toggleOnClick = true,
    toggleOnDoubleClick = false,
    toggleOnRightClick = false,
    toggleOnEnter = true,
    toggleOnSpace = true,
    autoReset = false,
    resetDelay = 3000,
    preventDefault = false,
    stopPropagation = false,
    showOnMount = false
  } = options

  const [isActive, setIsActive] = useState(showOnMount ? initialState : false)
  const [mounted, setMounted] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)

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

  // 클릭 핸들러
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (!toggleOnClick) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    toggle()
  }, [toggleOnClick, preventDefault, stopPropagation, toggle])

  // 더블클릭 핸들러
  const handleDoubleClick = useCallback((event: React.MouseEvent) => {
    if (!toggleOnDoubleClick) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    toggle()
  }, [toggleOnDoubleClick, preventDefault, stopPropagation, toggle])

  // 우클릭 핸들러
  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    if (!toggleOnRightClick) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    toggle()
  }, [toggleOnRightClick, preventDefault, stopPropagation, toggle])

  // 키보드 핸들러
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const shouldToggle = 
      (event.key === 'Enter' && toggleOnEnter) ||
      (event.key === ' ' && toggleOnSpace)

    if (!shouldToggle) return
    
    if (preventDefault) event.preventDefault()
    if (stopPropagation) event.stopPropagation()
    
    toggle()
  }, [toggleOnEnter, toggleOnSpace, preventDefault, stopPropagation, toggle])

  // 클린업
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  // 클릭 핸들러 객체 생성
  const clickHandlers = {
    ...(toggleOnClick && { onClick: handleClick }),
    ...(toggleOnDoubleClick && { onDoubleClick: handleDoubleClick }),
    ...(toggleOnRightClick && { onContextMenu: handleContextMenu }),
    ...((toggleOnEnter || toggleOnSpace) && { onKeyDown: handleKeyDown })
  }

  return {
    isActive,
    mounted,
    toggle,
    activate,
    deactivate,
    reset,
    clickHandlers
  }
}
