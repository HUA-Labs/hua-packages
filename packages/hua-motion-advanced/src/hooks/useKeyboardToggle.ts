import { useState, useEffect, useRef, useCallback } from 'react'

interface KeyboardToggleOptions {
  initialState?: boolean // 초기 상태
  keys?: string[] // 토글할 키들 (기본값: [' '])
  keyCode?: number // 특정 키코드
  keyCombo?: string[] // 키 조합 (예: ['Control', 'K'])
  toggleOnKeyDown?: boolean // 키다운 시 토글 여부
  toggleOnKeyUp?: boolean // 키업 시 토글 여부
  toggleOnKeyPress?: boolean // 키프레스 시 토글 여부
  autoReset?: boolean // 자동 리셋 여부
  resetDelay?: number // 자동 리셋 지연 시간 (ms)
  preventDefault?: boolean // 기본 이벤트 방지 여부
  stopPropagation?: boolean // 이벤트 전파 중단 여부
  requireFocus?: boolean // 포커스된 요소에서만 동작 여부
  showOnMount?: boolean
}

interface KeyboardToggleReturn {
  isActive: boolean
  mounted: boolean
  toggle: () => void
  activate: () => void
  deactivate: () => void
  reset: () => void
  keyboardHandlers: {
    onKeyDown?: (event: React.KeyboardEvent) => void
    onKeyUp?: (event: React.KeyboardEvent) => void
    onKeyPress?: (event: React.KeyboardEvent) => void
  }
  ref: React.RefObject<HTMLElement | null>
}

export function useKeyboardToggle(options: KeyboardToggleOptions = {}): KeyboardToggleReturn {
  const {
    initialState = false,
    keys = [' '],
    keyCode,
    keyCombo,
    toggleOnKeyDown = true,
    toggleOnKeyUp = false,
    toggleOnKeyPress = false,
    autoReset = false,
    resetDelay = 3000,
    preventDefault = false,
    stopPropagation = false,
    requireFocus = false,
    showOnMount = false
  } = options

  const [isActive, setIsActive] = useState(showOnMount ? initialState : false)
  const [mounted, setMounted] = useState(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const elementRef = useRef<HTMLElement>(null)
  const pressedKeysRef = useRef<Set<string>>(new Set())

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

  // 키 매칭 함수
  const isKeyMatch = useCallback((event: React.KeyboardEvent) => {
    // 키코드 매칭
    if (keyCode !== undefined && event.keyCode === keyCode) {
      return true
    }

    // 키 이름 매칭
    if (keys.length > 0 && keys.includes(event.key)) {
      return true
    }

    // 키 조합 매칭
    if (keyCombo && keyCombo.length > 0) {
      const pressedKeys = Array.from(pressedKeysRef.current)
      const comboMatch = keyCombo.every(key => pressedKeys.includes(key))
      return comboMatch
    }

    return false
  }, [keys, keyCode, keyCombo])

  // 포커스 체크 함수
  const isFocused = useCallback(() => {
    if (!requireFocus) return true
    return document.activeElement === elementRef.current
  }, [requireFocus])

  // 키다운 핸들러
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!toggleOnKeyDown || !isFocused()) return

    // 눌린 키 추적
    pressedKeysRef.current.add(event.key)

    if (isKeyMatch(event)) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      
      toggle()
    }
  }, [toggleOnKeyDown, isFocused, isKeyMatch, preventDefault, stopPropagation, toggle])

  // 키업 핸들러
  const handleKeyUp = useCallback((event: React.KeyboardEvent) => {
    if (!toggleOnKeyUp || !isFocused()) return

    // 눌린 키 제거
    pressedKeysRef.current.delete(event.key)

    if (isKeyMatch(event)) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      
      toggle()
    }
  }, [toggleOnKeyUp, isFocused, isKeyMatch, preventDefault, stopPropagation, toggle])

  // 키프레스 핸들러
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (!toggleOnKeyPress || !isFocused()) return

    if (isKeyMatch(event)) {
      if (preventDefault) event.preventDefault()
      if (stopPropagation) event.stopPropagation()
      
      toggle()
    }
  }, [toggleOnKeyPress, isFocused, isKeyMatch, preventDefault, stopPropagation, toggle])

  // 전역 키보드 이벤트 리스너 (requireFocus가 false일 때)
  useEffect(() => {
    if (requireFocus || !mounted) return

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      pressedKeysRef.current.add(event.key)

      if (isKeyMatch(event as any)) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        
        toggle()
      }
    }

    const handleGlobalKeyUp = (event: KeyboardEvent) => {
      pressedKeysRef.current.delete(event.key)

      if (isKeyMatch(event as any)) {
        if (preventDefault) event.preventDefault()
        if (stopPropagation) event.stopPropagation()
        
        toggle()
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    document.addEventListener('keyup', handleGlobalKeyUp)

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown)
      document.removeEventListener('keyup', handleGlobalKeyUp)
    }
  }, [requireFocus, mounted, isKeyMatch, preventDefault, stopPropagation, toggle])

  // 클린업
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current !== null) {
        clearTimeout(resetTimeoutRef.current)
      }
    }
  }, [])

  // 키보드 핸들러 객체 생성
  const keyboardHandlers = {
    ...(toggleOnKeyDown && { onKeyDown: handleKeyDown }),
    ...(toggleOnKeyUp && { onKeyUp: handleKeyUp }),
    ...(toggleOnKeyPress && { onKeyPress: handleKeyPress })
  }

  return {
    isActive,
    mounted,
    toggle,
    activate,
    deactivate,
    reset,
    keyboardHandlers,
    ref: elementRef
  }
}
