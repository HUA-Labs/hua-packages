import { useState, useEffect } from 'react'

interface ScrollProgressOptions {
  target?: number // 전체 스크롤 목표 (기본값: document 전체 높이)
  offset?: number // 시작 오프셋
  showOnMount?: boolean
}

export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const { 
    target,
    offset = 0,
    showOnMount = false 
  } = options
  
  const [progress, setProgress] = useState(showOnMount ? 0 : 0)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateProgress = () => {
      if (typeof window !== 'undefined') {
        const scrollTop = window.pageYOffset
        const scrollHeight = target || document.documentElement.scrollHeight - window.innerHeight
        const adjustedScrollTop = Math.max(0, scrollTop - offset)
        
        const progressPercent = Math.min(100, Math.max(0, (adjustedScrollTop / scrollHeight) * 100))
        setProgress(progressPercent)
      }
    }

    // 초기 상태 확인
    calculateProgress()

    // 이벤트 리스너 등록
    window.addEventListener("scroll", calculateProgress, { passive: true })
    window.addEventListener("resize", calculateProgress, { passive: true })

    return () => {
      window.removeEventListener("scroll", calculateProgress)
      window.removeEventListener("resize", calculateProgress)
    }
  }, [target, offset, mounted])

  return {
    progress,
    mounted
  }
}
