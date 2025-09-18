import { useState, useEffect } from 'react'

type ScrollDirection = 'up' | 'down' | 'idle'

interface ScrollDirectionOptions {
  threshold?: number // 방향 변화를 감지할 최소 스크롤 거리
  idleDelay?: number // idle 상태로 전환되는 지연 시간 (ms)
  showOnMount?: boolean
}

export function useScrollDirection(options: ScrollDirectionOptions = {}) {
  const { 
    threshold = 10,
    idleDelay = 150,
    showOnMount = false 
  } = options
  
  const [direction, setDirection] = useState<ScrollDirection>(showOnMount ? 'idle' : 'idle')
  const [mounted, setMounted] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [idleTimeout, setIdleTimeout] = useState<NodeJS.Timeout | null>(null)

  // ... existing code ...

        // idle 상태로 전환하는 타이머 설정
        const timeout = setTimeout(() => {
          setDirection('idle')
        }, idleDelay)
        setIdleTimeout(timeout)

  // ... existing code ...
}
