import { useState, useEffect, useCallback, useRef } from 'react'
import { MouseOptions, MouseReturn } from '../types'

/**
 * useMouse - 마우스 위치 추적 훅
 * Mouse position tracking hook
 *
 * @description
 * 마우스 위치를 실시간으로 추적. 커서 따라다니는 효과,
 * 마우스 기반 인터랙션 등에 활용.
 * Tracks mouse position in real-time. Useful for cursor-following effects
 * and mouse-based interactions.
 *
 * @example
 * ```tsx
 * const { x, y, elementX, elementY } = useMouse()
 *
 * return (
 *   <div style={{
 *     '--mouse-x': elementX,
 *     '--mouse-y': elementY
 *   }}>
 *     Mouse: {x}, {y}
 *   </div>
 * )
 * ```
 */
export function useMouse(options: MouseOptions = {}): MouseReturn {
  const { targetRef, throttle = 0 } = options

  const [state, setState] = useState<MouseReturn>({
    x: 0,
    y: 0,
    elementX: 0,
    elementY: 0,
    isOver: false
  })

  const lastUpdateRef = useRef(0)
  const rafIdRef = useRef<number | null>(null)

  const updateMousePosition = useCallback(
    (clientX: number, clientY: number, isOver: boolean) => {
      const now = Date.now()

      if (throttle > 0 && now - lastUpdateRef.current < throttle) {
        return
      }

      lastUpdateRef.current = now

      let elementX = 0
      let elementY = 0

      if (targetRef?.current) {
        const rect = targetRef.current.getBoundingClientRect()
        elementX = (clientX - rect.left) / rect.width
        elementY = (clientY - rect.top) / rect.height

        // 0-1 범위로 클램프
        elementX = Math.max(0, Math.min(1, elementX))
        elementY = Math.max(0, Math.min(1, elementY))
      }

      setState({
        x: clientX,
        y: clientY,
        elementX,
        elementY,
        isOver
      })
    },
    [targetRef, throttle]
  )

  useEffect(() => {
    const target = targetRef?.current

    const handleMouseMove = (e: MouseEvent) => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      rafIdRef.current = requestAnimationFrame(() => {
        const isOver = target
          ? target.contains(e.target as Node)
          : true

        updateMousePosition(e.clientX, e.clientY, isOver)
      })
    }

    const handleMouseEnter = () => {
      setState((prev: MouseReturn) => ({ ...prev, isOver: true }))
    }

    const handleMouseLeave = () => {
      setState((prev: MouseReturn) => ({ ...prev, isOver: false }))
    }

    if (target) {
      target.addEventListener('mousemove', handleMouseMove)
      target.addEventListener('mouseenter', handleMouseEnter)
      target.addEventListener('mouseleave', handleMouseLeave)
    } else {
      window.addEventListener('mousemove', handleMouseMove)
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }

      if (target) {
        target.removeEventListener('mousemove', handleMouseMove)
        target.removeEventListener('mouseenter', handleMouseEnter)
        target.removeEventListener('mouseleave', handleMouseLeave)
      } else {
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [targetRef, updateMousePosition])

  return state
}
