import { useRef, useCallback, useMemo, type CSSProperties } from 'react'

export interface MagneticCursorOptions {
  /** 자석 끌림 강도 (0-1) @default 0.3 */
  strength?: number
  /** 자석 작동 반경 (px) @default 100 */
  radius?: number
  /** 활성화 여부 @default true */
  enabled?: boolean
}

export interface MagneticCursorReturn<T extends HTMLElement = HTMLElement> {
  /** 자석 대상 요소에 연결할 ref */
  ref: React.RefObject<T | null>
  /** 마우스 이벤트 핸들러 */
  handlers: {
    onMouseMove: (e: React.MouseEvent) => void
    onMouseLeave: () => void
  }
  /** 요소에 적용할 transform 스타일 */
  style: CSSProperties
}

/**
 * useMagneticCursor - 자석 커서 효과 훅
 *
 * 마우스가 요소 근처에 오면 요소가 마우스 쪽으로 끌려오는 효과.
 * 버튼, 아이콘 등에 적용하면 인터랙티브 느낌 향상.
 *
 * @example
 * ```tsx
 * const magnetic = useMagneticCursor<HTMLButtonElement>({ strength: 0.4 })
 * return <button ref={magnetic.ref} style={magnetic.style} {...magnetic.handlers}>Click</button>
 * ```
 */
export function useMagneticCursor<T extends HTMLElement = HTMLElement>(
  options: MagneticCursorOptions = {}
): MagneticCursorReturn<T> {
  const { strength = 0.3, radius = 100, enabled = true } = options

  const ref = useRef<T>(null)
  const transformRef = useRef({ x: 0, y: 0 })
  const styleRef = useRef<CSSProperties>({
    transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    transform: 'translate(0px, 0px)',
  })

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!enabled || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const dx = e.clientX - centerX
    const dy = e.clientY - centerY
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < radius) {
      const pull = (1 - dist / radius) * strength
      transformRef.current = { x: dx * pull, y: dy * pull }
    } else {
      transformRef.current = { x: 0, y: 0 }
    }

    ref.current.style.transform = `translate(${transformRef.current.x}px, ${transformRef.current.y}px)`
  }, [enabled, strength, radius])

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return
    transformRef.current = { x: 0, y: 0 }
    ref.current.style.transform = 'translate(0px, 0px)'
  }, [])

  const handlers = useMemo(() => ({ onMouseMove, onMouseLeave }), [onMouseMove, onMouseLeave])

  return { ref, handlers, style: styleRef.current }
}
