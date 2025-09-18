'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '../lib/utils'

export interface ScrollProgressProps {
  className?: string
  height?: number
  color?: 'default' | 'primary' | 'secondary' | 'gradient'
  position?: 'top' | 'bottom'
  animated?: boolean
  showPercentage?: boolean
}

const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(({
  className,
  height = 2,
  color = 'gradient',
  position = 'top',
  animated = true,
  showPercentage = false,
  ...props
}, ref) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const currentProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(currentProgress)
    }

    // 초기 실행
    updateProgress()

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  const colorClasses = {
    default: 'bg-blue-600',
    primary: 'bg-purple-600',
    secondary: 'bg-gray-600',
    gradient: 'bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600'
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  }

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
      style={{ height: `${height}px` }}
      {...props}
    >
      {/* 배경 바 */}
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
      
      {/* 진행률 바 */}
      <div
        className={cn(
          'h-full origin-left transition-all duration-100 ease-out',
          colorClasses[color]
        )}
        style={{
          width: `${progress}%`,
          transformOrigin: 'left'
        }}
      />
      
      {/* 퍼센트 표시 (선택사항) */}
      {showPercentage && (
        <div className="absolute top-2 right-2 text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
})

ScrollProgress.displayName = 'ScrollProgress'

export { ScrollProgress } 