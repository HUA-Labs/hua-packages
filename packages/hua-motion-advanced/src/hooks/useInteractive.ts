import { useRef, useState, useCallback } from 'react'

export interface InteractiveConfig {
  hoverScale?: number
  clickScale?: number
  duration?: number
}

export interface InteractiveState {
  scale: number
  isHovered: boolean
  isClicked: boolean
}

export function useInteractive(config: InteractiveConfig = {}) {
  const {
    hoverScale = 1.05,
    clickScale = 0.95,
    duration: _duration = 200
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [isClicked, setIsClicked] = useState(false)

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
    setScale(hoverScale)
  }, [hoverScale])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    setScale(1)
  }, [])

  const handleMouseDown = useCallback(() => {
    setIsClicked(true)
    setScale(clickScale)
  }, [clickScale])

  const handleMouseUp = useCallback(() => {
    setIsClicked(false)
    setScale(isHovered ? hoverScale : 1)
  }, [isHovered, hoverScale])

  const setRef = (element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }

  return {
    ref: setRef,
    scale,
    isHovered,
    isClicked,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseDown,
    handleMouseUp
  }
} 