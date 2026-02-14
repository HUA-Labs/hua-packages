import { useState, useEffect, useRef, useCallback, useMemo, type CSSProperties } from 'react'

export interface CustomCursorOptions {
  /** 활성화 여부 @default true */
  enabled?: boolean
  /** 커서 크기 (px) @default 32 */
  size?: number
  /** 스프링 스무딩 (0-1, 낮을수록 부드러움) @default 0.15 */
  smoothing?: number
  /** 호버 시 스케일 @default 1.5 */
  hoverScale?: number
  /** data-cursor 속성 요소 감지 @default true */
  detectLabels?: boolean
}

export interface CustomCursorReturn {
  /** 커서 x 좌표 (smoothed) */
  x: number
  /** 커서 y 좌표 (smoothed) */
  y: number
  /** 호버 중인 요소의 data-cursor 값 */
  label: string | null
  /** 호버 상태 여부 */
  isHovering: boolean
  /** 커서 스타일 (CSS variables 포함) */
  style: CSSProperties
  /** 커서 가시 여부 */
  isVisible: boolean
}

/**
 * useCustomCursor - 커스텀 커서 효과 훅
 *
 * 마우스를 따라다니는 커스텀 커서를 구현합니다.
 * 스프링 보간으로 부드러운 추적, data-cursor 라벨 감지.
 *
 * @example
 * ```tsx
 * const cursor = useCustomCursor()
 * return (
 *   <>
 *     <div style={cursor.style} className="custom-cursor" />
 *     <button data-cursor="Click me">Hover me</button>
 *   </>
 * )
 * ```
 */
export function useCustomCursor(options: CustomCursorOptions = {}): CustomCursorReturn {
  const {
    enabled = true,
    size = 32,
    smoothing = 0.15,
    hoverScale = 1.5,
    detectLabels = true,
  } = options

  const [isVisible, setIsVisible] = useState(false)
  const [label, setLabel] = useState<string | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)

  // Spring interpolation loop
  const animate = useCallback(() => {
    const dx = targetRef.current.x - currentRef.current.x
    const dy = targetRef.current.y - currentRef.current.y

    currentRef.current.x += dx * smoothing
    currentRef.current.y += dy * smoothing

    setPos({ x: currentRef.current.x, y: currentRef.current.y })

    if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [smoothing])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      setIsVisible(true)

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(animate)
      }

      // Detect data-cursor label
      if (detectLabels) {
        const target = e.target as HTMLElement
        const cursorEl = target.closest('[data-cursor]') as HTMLElement | null
        if (cursorEl) {
          setLabel(cursorEl.dataset.cursor || null)
          setIsHovering(true)
        } else {
          setLabel(null)
          setIsHovering(false)
        }
      }
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      setLabel(null)
      setIsHovering(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [enabled, detectLabels, animate])

  const scale = isHovering ? hoverScale : 1

  const style = useMemo<CSSProperties>(() => ({
    '--cursor-x': `${pos.x}px`,
    '--cursor-y': `${pos.y}px`,
    '--cursor-size': `${size}px`,
    '--cursor-scale': `${scale}`,
    position: 'fixed' as const,
    left: pos.x - (size * scale) / 2,
    top: pos.y - (size * scale) / 2,
    width: size * scale,
    height: size * scale,
    pointerEvents: 'none' as const,
    zIndex: 9999,
    transition: 'width 0.2s, height 0.2s, left 0.05s, top 0.05s',
  } as CSSProperties), [pos.x, pos.y, size, scale])

  return { x: pos.x, y: pos.y, label, isHovering, style, isVisible }
}
