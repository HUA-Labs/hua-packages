"use client"

import * as React from "react"
import { merge } from "../lib/utils"
import { Button, ButtonProps } from "./Button"

// ButtonProps에서 'type'만 제외하고 상속 (href 포함)
export interface ActionProps extends Omit<ButtonProps, 'type'> {
  // 🆕 Action 전용 고급 속성들
  actionType?: "primary" | "secondary" | "tertiary" | "magical" | "cyberpunk" | "ninja" | "wizard" | "sniper"
  feedback?: "ripple" | "particle" | "sound" | "haptic" | "glitch" | "sparkle" | "smoke"
  
  // 고급 효과
  particleEffect?: boolean
  rippleEffect?: boolean
  soundEffect?: boolean
  hapticFeedback?: boolean
  
  // 고급 스타일링
  transparency?: number        // 0-1 사이 투명도
  blurIntensity?: number       // backdrop-blur 강도
  glowIntensity?: number       // 글로우 강도
  glowColor?: string           // 글로우 색상
  
  // 명시적으로 href 추가 (ButtonProps에서 상속받지만 명시적으로 선언)
  href?: string
}

const Action = React.forwardRef<HTMLButtonElement, ActionProps>(
  ({ 
    className,
    actionType = "primary",
    feedback = "ripple",
    particleEffect = false,
    rippleEffect = false,
    soundEffect = false,
    hapticFeedback = false,
    transparency = 1,
    blurIntensity = 0,
    glowIntensity = 0,
    glowColor = "blue",
    children,
    onClick,
    href,
    ...buttonProps 
  }, ref): React.ReactElement => {
    
    // 고급 효과 처리 - useCallback으로 메모이제이션
    const handleAdvancedEffects = React.useCallback(() => {
      // 파티클 효과
      if (particleEffect) {
        console.log('Particle effect triggered')
      }
      
      // 리플 효과
      if (rippleEffect) {
        console.log('Ripple effect triggered')
      }
      
      // 사운드 효과
      if (soundEffect) {
        console.log('Sound effect triggered')
      }
      
      // 햅틱 피드백
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }, [particleEffect, rippleEffect, soundEffect, hapticFeedback])
    
    // 고급 스타일 계산 - useMemo로 메모이제이션
    const advancedStyles = React.useMemo((): React.CSSProperties => {
      const styles: React.CSSProperties = {
        opacity: transparency,
      }
      
      if (blurIntensity > 0) {
        styles.backdropFilter = `blur(${blurIntensity}px)`
      }
      
      if (glowIntensity > 0) {
        styles.boxShadow = `0 0 ${glowIntensity * 10}px ${glowColor}`
      }
      
      return styles
    }, [transparency, blurIntensity, glowIntensity, glowColor])
    
    // 이벤트 핸들러 - useCallback으로 메모이제이션
    const handleClick = React.useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      handleAdvancedEffects()
      
      // 원래 onClick 핸들러 호출
      if (onClick) {
        onClick(e)
      }
    }, [handleAdvancedEffects, onClick])
    
    // Action 전용 클래스들 - useMemo로 메모이제이션
    const actionClasses = React.useMemo(() => merge(
      "action-component",
      `action-${actionType}`,
      `action-feedback-${feedback}`,
      className
    ), [actionType, feedback, className])
    
    // href가 있으면 링크로, 없으면 버튼으로 렌더링
    const commonProps = {
      ref,
      className: actionClasses,
      style: advancedStyles,
      onClick: handleClick,
      href,
      ...buttonProps
    }
    
    // Button 컴포넌트의 모든 props를 직접 전달
    return (
      <Button 
        ref={ref}
        className={actionClasses}
        style={advancedStyles}
        onClick={handleClick}
        href={href}
        {...buttonProps}
      >
        {children}
      </Button>
    )
  }
)

Action.displayName = "Action"

export { Action } 