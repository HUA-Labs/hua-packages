import React, { useRef, useState, useEffect } from 'react'

export interface PerformanceMonitorConfig {
  threshold?: number
  onPerformanceIssue?: (fps: number) => void
}

export interface PerformanceMonitorState {
  fps: number
  isLowPerformance: boolean
  frameCount: number
}

export function usePerformanceMonitor(config: PerformanceMonitorConfig = {}) {
  const {
    threshold = 30,
    onPerformanceIssue
  } = config

  const ref = useRef<HTMLDivElement>(null)
  const [fps, setFps] = useState(60)
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const [frameCount, setFrameCount] = useState(0)
  const lastTime = useRef(performance.now())
  const frameCountRef = useRef(0)

  const measurePerformance = () => {
    const now = performance.now()
    frameCountRef.current++

    if (now - lastTime.current >= 1000) {
      const currentFps = Math.round((frameCountRef.current * 1000) / (now - lastTime.current))
      setFps(currentFps)
      setFrameCount(frameCountRef.current)
      
      const lowPerformance = currentFps < threshold
      setIsLowPerformance(lowPerformance)
      
      if (lowPerformance && onPerformanceIssue) {
        onPerformanceIssue(currentFps)
      }
      
      frameCountRef.current = 0
      lastTime.current = now
    }
    
    requestAnimationFrame(measurePerformance)
  }

  useEffect(() => {
    const motionId = requestAnimationFrame(measurePerformance)
    return () => cancelAnimationFrame(motionId)
  }, [])

  const setRef = (element: HTMLDivElement | null) => {
    if (ref.current !== element) {
      (ref as any).current = element
    }
  }

  return {
    ref: setRef,
    fps,
    isLowPerformance,
    frameCount
  }
} 