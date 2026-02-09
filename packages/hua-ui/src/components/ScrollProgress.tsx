'use client'

import React, { useState, useEffect } from 'react'
import { merge } from '../lib/utils'

/**
 * ScrollProgress 컴포넌트의 props / ScrollProgress component props
 * @typedef {Object} ScrollProgressProps
 * @property {string} [className] - 추가 CSS 클래스 / Additional CSS class
 * @property {number} [height=2] - 진행률 바 높이 (px) / Progress bar height (px)
 * @property {'default' | 'primary' | 'secondary' | 'gradient'} [color='gradient'] - 진행률 바 색상 / Progress bar color
 * @property {'top' | 'bottom'} [position='top'] - 표시 위치 / Display position
 * @property {boolean} [animated=true] - 애니메이션 활성화 여부 / Enable animation
 * @property {boolean} [showPercentage=false] - 퍼센트 표시 여부 / Show percentage
 */
export interface ScrollProgressProps {
  className?: string
  height?: number
  color?: 'default' | 'primary' | 'secondary' | 'gradient'
  position?: 'top' | 'bottom'
  animated?: boolean
  showPercentage?: boolean
}

/**
 * ScrollProgress 컴포넌트 / ScrollProgress component
 * 
 * 페이지 스크롤 진행률을 표시하는 컴포넌트입니다.
 * 페이지 상단 또는 하단에 고정되어 표시됩니다.
 * 
 * Component that displays page scroll progress.
 * Fixed at top or bottom of the page.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ScrollProgress />
 * 
 * @example
 * // 하단에 표시, 퍼센트 포함 / Display at bottom with percentage
 * <ScrollProgress 
 *   position="bottom"
 *   color="primary"
 *   showPercentage
 *   height={4}
 * />
 * 
 * @param {ScrollProgressProps} props - ScrollProgress 컴포넌트의 props / ScrollProgress component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollProgress 컴포넌트 / ScrollProgress component
 */
const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(({
  className,
  height = 2,
  color = 'gradient',
  position = 'top',
  animated: _animated = true,
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

  // 색상 옵션 (Teal 브랜드 기반)
  const progressColors: Record<string, string> = {
    default: 'bg-foreground',
    primary: 'bg-primary',
    secondary: 'bg-muted-foreground',
    gradient: 'bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600'
  }

  const positionClasses = {
    top: 'top-0 left-0 right-0',
    bottom: 'bottom-0 left-0 right-0'
  }

  return (
    <div
      ref={ref}
      className={merge(
        'fixed z-50',
        positionClasses[position],
        className
      )}
      style={{ height: `${height}px` }}
      {...props}
    >
      {/* 배경 바 */}
      <div className="absolute inset-0 w-full h-full bg-border/30" />
      
      {/* 진행률 바 - absolute로 배경 위에 표시 */}
      <div
        className={merge(
          'absolute top-0 left-0 h-full origin-left transition-all duration-100 ease-out',
          progressColors[color] || progressColors.gradient
        )}
        style={{
          width: `${progress}%`,
          transformOrigin: 'left'
        }}
      />
      
      {/* 퍼센트 표시 (선택사항) */}
      {showPercentage && (
        <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-card px-2 py-1 rounded border border-border">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
})

ScrollProgress.displayName = 'ScrollProgress'

export { ScrollProgress } 