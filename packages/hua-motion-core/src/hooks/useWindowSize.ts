import { useState, useEffect, useRef, useCallback } from 'react'
import { WindowSizeOptions, WindowSizeReturn } from '../types'

/**
 * useWindowSize - 윈도우 크기 추적 훅
 * Window size tracking hook
 *
 * @description
 * 브라우저 윈도우 크기 변경을 감지.
 * 반응형 레이아웃, 리사이즈 기반 애니메이션 등에 활용.
 * Detects browser window size changes.
 * Useful for responsive layouts and resize-based animations.
 *
 * @example
 * ```tsx
 * const { width, height, isMounted } = useWindowSize({ debounce: 100 })
 *
 * return (
 *   <div>
 *     {isMounted ? `${width} x ${height}` : 'Loading...'}
 *   </div>
 * )
 * ```
 */
export function useWindowSize(options: WindowSizeOptions = {}): WindowSizeReturn {
  const {
    debounce = 100,
    initialWidth = 0,
    initialHeight = 0
  } = options

  const [state, setState] = useState<WindowSizeReturn>({
    width: initialWidth,
    height: initialHeight,
    isMounted: false
  })

  const timeoutRef = useRef<number | null>(null)

  const updateSize = useCallback(() => {
    if (typeof window === 'undefined') return

    setState({
      width: window.innerWidth,
      height: window.innerHeight,
      isMounted: true
    })
  }, [])

  const handleResize = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (debounce > 0) {
      timeoutRef.current = window.setTimeout(updateSize, debounce)
    } else {
      updateSize()
    }
  }, [debounce, updateSize])

  useEffect(() => {
    // 초기값 설정
    updateSize()

    window.addEventListener('resize', handleResize)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize, updateSize])

  return state
}
