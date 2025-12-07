'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Icon, Panel, Action, Popover } from '@hua-labs/ui'

interface PerformanceMetrics {
  fps: number
  memory: number
  renderTime: number
}

interface PerformanceMonitorProps {
  className?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  showByDefault?: boolean
}

export default function PerformanceMonitor({ 
  className = '',
  position = 'top-right',
  showByDefault = true 
}: PerformanceMonitorProps) {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    renderTime: 0
  })
  const [showPanel, setShowPanel] = useState(showByDefault)

  // 성능 측정
  const measurePerformance = useCallback(() => {
    // 메모리 사용량 측정 (Chrome에서만 가능)
    if ('memory' in performance) {
      const memory = Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
      setPerformanceMetrics(prev => ({ ...prev, memory }))
    }
  }, [])

  // FPS 측정
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number
    
    const measureFPS = () => {
      frameCount++
      const currentTime = performance.now()
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
        setPerformanceMetrics(prev => ({ ...prev, fps }))
        frameCount = 0
        lastTime = currentTime
      }
      
      animationId = requestAnimationFrame(measureFPS)
    }
    
    animationId = requestAnimationFrame(measureFPS)
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  // 렌더 시간 측정
  useEffect(() => {
    const measureRenderTime = () => {
      const startTime = performance.now()
      
      requestAnimationFrame(() => {
        const renderTime = performance.now() - startTime
        setPerformanceMetrics(prev => ({ ...prev, renderTime }))
      })
    }
    
    measureRenderTime()
    const interval = setInterval(measureRenderTime, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // 성능 측정 시작
  useEffect(() => {
    measurePerformance()
    const interval = setInterval(measurePerformance, 1000)
    
    return () => clearInterval(interval)
  }, [measurePerformance])

  // 위치 클래스 계산
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-20 left-9'
      case 'bottom-left':
        return 'bottom-4 left-4'
      case 'bottom-right':
        return 'bottom-4 right-4'
      default:
        return 'top-20 right-9'
    }
  }

  // FPS 색상 계산
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return 'text-green-600 dark:text-green-400'
    if (fps >= 45) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-[9999] pointer-events-auto ${className}`}>
      {showPanel ? (
        // 펼쳐진 상태 - 성능 패널
        <Panel 
          style="glass" 
          padding="sm" 
          className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-white/30 dark:border-slate-700/30 shadow-xl pointer-events-auto transition-all duration-300"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  성능 모니터
                </div>
                <Popover
                  trigger={
                    <Icon 
                      name="info" 
                      size={12} 
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-help transition-colors" 
                    />
                  }
                  position="bottom"
                  align="start"
                >
                  <div className="space-y-2 text-xs w-40">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">FPS (프레임 레이트)</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        초당 프레임 수. 60fps가 이상적이며, 55fps 이상이면 양호합니다.
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">MB (메모리 사용량)</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        JavaScript 힙 메모리 사용량. 낮을수록 좋습니다.
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">ms (렌더 시간)</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        프레임 렌더링에 걸리는 시간. 16ms 이하가 이상적입니다.
                      </div>
                    </div>
                  </div>
                </Popover>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="text-center w-12">
                  <div className={`text-sm font-bold ${getFPSColor(performanceMetrics.fps)}`}>
                    {performanceMetrics.fps}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">FPS</div>
                </div>
                <div className="text-center w-12">
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {performanceMetrics.memory}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">MB</div>
                </div>
                <div className="text-center w-12">
                  <div className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {performanceMetrics.renderTime.toFixed(1)}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">ms</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded flex-shrink-0 pointer-events-auto"
            >
              <Icon name={"chevronRight" as any} size={14} />
            </button>
          </div>
        </Panel>
      ) : (
        // 접힌 상태 - 토글 버튼
        <Action
          onClick={() => setShowPanel(true)}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-white/30 dark:border-slate-700/30 shadow-lg pointer-events-auto transition-all duration-300"
        >
          <Icon name={"chart" as any} size={16} />
        </Action>
      )}
    </div>
  )
} 