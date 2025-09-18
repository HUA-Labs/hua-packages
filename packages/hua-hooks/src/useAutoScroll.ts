import { useRef, useState, useEffect, useCallback } from 'react'

export interface UseAutoScrollOptions {
  threshold?: number
  smooth?: boolean
}

export interface UseAutoScrollReturn {
  containerRef: React.RefObject<HTMLDivElement>
  isAtBottom: boolean
  setIsAtBottom: (value: boolean) => void
  scrollToBottom: () => void
}

/**
 * 자동 스크롤을 관리하는 훅
 */
export function useAutoScroll(deps: any[] = [], options: UseAutoScrollOptions = {}): UseAutoScrollReturn {
  const { threshold = 10, smooth = true } = options
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const setIsAtBottomCallback = useCallback((value: boolean) => {
    setIsAtBottom(value)
  }, [])

  // 스크롤 위치 감지
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < threshold
      setIsAtBottom(isBottom)
    }
    
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      handleScroll()
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [threshold])

  // deps 변경 시 스크롤 위치 체크
  useEffect(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < threshold
      setIsAtBottom(isBottom)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  }, [smooth])

  return { 
    containerRef, 
    isAtBottom, 
    setIsAtBottom: setIsAtBottomCallback,
    scrollToBottom
  }
} 