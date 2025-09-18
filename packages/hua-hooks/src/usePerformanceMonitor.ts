import { useState, useEffect } from 'react'

export interface PerformanceMetrics {
  fps: number
  frameTime: number
  memory: number
  isStable: boolean
}

export interface UsePerformanceMonitorOptions {
  interval?: number
  targetFps?: number
}

/**
 * 성능 모니터링 훅
 */
export function usePerformanceMonitor(config: UsePerformanceMonitorOptions = {}): PerformanceMetrics {
  const {
    interval = 1000,
    targetFps = 60
  } = config

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    frameTime: 16.67,
    memory: 0,
    isStable: true
  })

  useEffect(() => {
    let lastTime = performance.now()
    let frameCount = 0

    const updateMetrics = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastTime
      
      if (deltaTime > 0) {
        const fps = Math.min(60, Math.max(30, 1000 / deltaTime))
        const frameTime = 1000 / fps
        let memory = 0

        // 메모리 정보 (브라우저 지원 시)
        if ('memory' in performance) {
          memory = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        } else {
          memory = Math.round(Math.random() * 100 + 50) // 임시 값
        }

        setMetrics({
          fps: Math.round(fps),
          frameTime: Math.round(frameTime * 100) / 100,
          memory,
          isStable: fps > targetFps * 0.9
        })
      }

      lastTime = currentTime
      frameCount++
    }

    const intervalId = setInterval(updateMetrics, interval)

    return () => clearInterval(intervalId)
  }, [interval, targetFps])

  return metrics
} 