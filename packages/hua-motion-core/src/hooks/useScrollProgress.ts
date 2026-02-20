import { useState, useEffect, useRef } from 'react'
import { subscribeScroll } from '../utils/sharedScroll'

interface ScrollProgressOptions {
  target?: number // 전체 스크롤 목표 (기본값: document 전체 높이)
  offset?: number // 시작 오프셋
  showOnMount?: boolean
}

const PROGRESS_THRESHOLD = 0.1

export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const {
    target,
    offset = 0,
    showOnMount = false
  } = options

  const [progress, setProgress] = useState(showOnMount ? 0 : 0)
  const [mounted, setMounted] = useState(false)
  const progressRef = useRef(progress)

  // 하이드레이션 이슈 해결을 위한 mounted 상태 관리
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const calculateProgress = () => {
      const scrollTop = window.pageYOffset
      const scrollHeight = target || document.documentElement.scrollHeight - window.innerHeight
      const adjustedScrollTop = Math.max(0, scrollTop - offset)

      const next = Math.min(100, Math.max(0, (adjustedScrollTop / scrollHeight) * 100))

      if (Math.abs(next - progressRef.current) > PROGRESS_THRESHOLD) {
        progressRef.current = next
        setProgress(next)
      }
    }

    // 초기 상태 확인
    calculateProgress()

    // 공유 스크롤 리스너 등록 (rAF 배칭 + scroll/resize 공유)
    return subscribeScroll(calculateProgress)
  }, [target, offset, mounted])

  return {
    progress,
    mounted
  }
}
