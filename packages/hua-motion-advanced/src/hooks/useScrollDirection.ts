import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down' | 'idle'

export interface ScrollDirectionConfig {
  threshold?: number // 방향 변화를 감지할 최소 스크롤 거리
  idleDelay?: number // idle 상태로 전환되는 지연 시간 (ms)
  showOnMount?: boolean
}

export function useScrollDirection(options: ScrollDirectionConfig = {}) {
  const { 
    threshold = 10,
    idleDelay = 150,
    showOnMount = false 
  } = options
  
  const [direction, setDirection] = useState<ScrollDirection>(showOnMount ? 'idle' : 'idle')
  const [mounted, setMounted] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [idleTimeout, setIdleTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.pageYOffset
        const scrollDifference = Math.abs(currentScrollY - lastScrollY)

        // 이전 idle 타이머 클리어
        if (idleTimeout !== null) {
          clearTimeout(idleTimeout)
        }

        // 임계값보다 큰 스크롤 변화가 있을 때만 방향 감지
        if (scrollDifference > threshold) {
          const newDirection: ScrollDirection = currentScrollY > lastScrollY ? 'down' : 'up'
          setDirection(newDirection)
          setLastScrollY(currentScrollY)

          // idle 상태로 전환하는 타이머 설정
          const timeout = setTimeout(() => {
            setDirection('idle')
          }, idleDelay)
          setIdleTimeout(timeout)
        }
      }
    }

    // 초기 상태 설정
    if (typeof window !== 'undefined') {
      setLastScrollY(window.pageYOffset)
    }

    // 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (idleTimeout !== null) {
        clearTimeout(idleTimeout)
      }
    }
  }, [threshold, idleDelay, mounted, lastScrollY, idleTimeout])

  return {
    direction,
    mounted
  }
}
