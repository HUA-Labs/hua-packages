import { useRef, useState, useCallback, useEffect } from 'react'

export interface LayoutConfig {
  from: {
    width?: number | string
    height?: number | string
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    gap?: number | string
    gridTemplateColumns?: string
    gridTemplateRows?: string
    gridGap?: number | string
  }
  to: {
    width?: number | string
    height?: number | string
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
    gap?: number | string
    gridTemplateColumns?: string
    gridTemplateRows?: string
    gridGap?: number | string
  }
  duration?: number
  easing?: string
  autoStart?: boolean
  onComplete?: () => void
}

export interface LayoutState {
  isAnimating: boolean
  progress: number
  currentStyle: React.CSSProperties
}

export function useLayoutMotion(config: LayoutConfig) {
  const {
    from,
    to,
    duration = 500,
    easing = 'ease-in-out',
    autoStart = false,
    onComplete
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<LayoutState>({
    isAnimating: false,
    progress: 0,
    currentStyle: {}
  })

  const motionFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // CSS 값 파싱
  const parseValue = useCallback((value: number | string | undefined): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const match = value.match(/^(\d+(?:\.\d+)?)(px|%|em|rem|vh|vw)?$/)
      return match ? parseFloat(match[1]) : 0
    }
    return 0
  }, [])

  // 값 보간
  const interpolate = useCallback((from: number, to: number, progress: number): number => {
    return from + (to - from) * progress
  }, [])

  // 이징 적용
  const applyEasing = useCallback((t: number): number => {
    switch (easing) {
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      default:
        return t
    }
  }, [easing])

  // 스타일 계산
  const calculateStyle = useCallback((progress: number): React.CSSProperties => {
    const easedProgress = applyEasing(progress)
    const style: React.CSSProperties = {}

    // 크기 모션
    if (from.width !== undefined && to.width !== undefined) {
      const fromWidth = parseValue(from.width)
      const toWidth = parseValue(to.width)
      style.width = `${interpolate(fromWidth, toWidth, easedProgress)}px`
    }

    if (from.height !== undefined && to.height !== undefined) {
      const fromHeight = parseValue(from.height)
      const toHeight = parseValue(to.height)
      style.height = `${interpolate(fromHeight, toHeight, easedProgress)}px`
    }

    // Flexbox 모션
    if (from.flexDirection !== to.flexDirection) {
      style.flexDirection = progress < 0.5 ? from.flexDirection : to.flexDirection
    }

    if (from.justifyContent !== to.justifyContent) {
      style.justifyContent = progress < 0.5 ? from.justifyContent : to.justifyContent
    }

    if (from.alignItems !== to.alignItems) {
      style.alignItems = progress < 0.5 ? from.alignItems : to.alignItems
    }

    if (from.gap !== undefined && to.gap !== undefined) {
      const fromGap = parseValue(from.gap)
      const toGap = parseValue(to.gap)
      style.gap = `${interpolate(fromGap, toGap, easedProgress)}px`
    }

    // Grid 모션
    if (from.gridTemplateColumns !== to.gridTemplateColumns) {
      style.gridTemplateColumns = progress < 0.5 ? from.gridTemplateColumns : to.gridTemplateColumns
    }

    if (from.gridTemplateRows !== to.gridTemplateRows) {
      style.gridTemplateRows = progress < 0.5 ? from.gridTemplateRows : to.gridTemplateRows
    }

    if (from.gridGap !== undefined && to.gridGap !== undefined) {
      const fromGridGap = parseValue(from.gridGap)
      const toGridGap = parseValue(to.gridGap)
      style.gridGap = `${interpolate(fromGridGap, toGridGap, easedProgress)}px`
    }

    return style
  }, [from, to, applyEasing, parseValue, interpolate])

  // 모션 업데이트
  const updateMotion = useCallback(() => {
    if (!state.isAnimating) return

    const elapsed = Date.now() - startTimeRef.current
    const progress = Math.min(elapsed / duration, 1)

    setState(prev => ({
      ...prev,
      progress,
      currentStyle: calculateStyle(progress)
    }))

    if (progress < 1) {
      motionFrameRef.current = requestAnimationFrame(updateMotion)
    } else {
      setState(prev => ({ ...prev, isAnimating: false }))
      onComplete?.()
    }
  }, [state.isAnimating, duration, calculateStyle, onComplete])

  // 모션 시작
  const start = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: true, progress: 0 }))
    startTimeRef.current = Date.now()
    updateMotion()
  }, [updateMotion])

  // 모션 정지
  const stop = useCallback(() => {
    setState(prev => ({ ...prev, isAnimating: false }))
    if (motionFrameRef.current) {
      cancelAnimationFrame(motionFrameRef.current)
    }
  }, [])

  // 모션 리셋
  const reset = useCallback(() => {
    setState({
      isAnimating: false,
      progress: 0,
      currentStyle: calculateStyle(0)
    })
    if (motionFrameRef.current) {
      cancelAnimationFrame(motionFrameRef.current)
    }
  }, [calculateStyle])

  // 자동 시작
  useEffect(() => {
    if (autoStart) {
      start()
    }

    return () => {
      if (motionFrameRef.current) {
        cancelAnimationFrame(motionFrameRef.current)
      }
    }
  }, [autoStart, start])

  return {
    ref,
    state,
    start,
    stop,
    reset
  }
}

// 레이아웃 전환 헬퍼
export function createLayoutTransition(
  from: LayoutConfig['from'],
  to: LayoutConfig['to'],
  options: Partial<LayoutConfig> = {}
) {
  return {
    from,
    to,
    duration: options.duration || 500,
    easing: options.easing || 'ease-in-out',
    autoStart: options.autoStart || false,
    onComplete: options.onComplete
  }
}
