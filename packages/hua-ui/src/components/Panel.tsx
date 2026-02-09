"use client"

import React from "react"
import { cva } from "class-variance-authority"
import { merge } from "../lib/utils"
import { Card, CardProps } from "./Card"

export const panelStyleVariants = cva(
  "transition-all duration-300",
  {
    variants: {
      style: {
        default: "bg-card text-card-foreground border border-border",
        solid: "bg-card text-card-foreground border border-border",
        glass: "bg-white/60 dark:bg-white/10 backdrop-blur-md border border-border/50 dark:border-white/20",
        outline: "bg-transparent border border-border",
        elevated: "bg-card text-card-foreground shadow-lg border border-border",
        neon: "bg-muted/50 dark:bg-background border border-cyan-300/30 dark:border-cyan-400/30 shadow-lg shadow-cyan-200/20 dark:shadow-cyan-400/20",
        holographic: "bg-gradient-to-br from-white/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/30",
        cyberpunk: "bg-card dark:bg-background border-2 border-pink-400 dark:border-pink-500 shadow-lg shadow-pink-300/30 dark:shadow-pink-500/30",
        minimal: "bg-card dark:bg-background border border-border shadow-sm",
        luxury: "bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-950 border border-amber-200 dark:border-amber-800 shadow-xl",
      },
      effect: {
        none: "",
        glow: "shadow-2xl shadow-primary/20 dark:shadow-primary/20",
        shadow: "shadow-xl",
        gradient: "bg-gradient-to-r from-primary/10 via-purple-500/10 to-cyan-500/10",
        animated: "animate-pulse",
      },
      padding: {
        none: "p-0",
        small: "p-3",
        sm: "p-3",
        medium: "p-6",
        md: "p-6",
        large: "p-8",
        lg: "p-8",
        xl: "p-12",
        custom: "",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
        custom: "",
      },
    },
    defaultVariants: {
      style: "default",
      effect: "none",
      padding: "md",
      rounded: "lg",
    },
  }
)

/**
 * Panel 컴포넌트의 props / Panel component props
 */
export interface PanelProps extends Omit<CardProps, 'variant' | 'style' | 'padding'> {
  style?: "default" | "solid" | "glass" | "outline" | "elevated" | "neon" | "holographic" | "cyberpunk" | "minimal" | "luxury"
  effect?: "none" | "glow" | "shadow" | "gradient" | "animated"

  transparency?: number
  blurIntensity?: number
  borderOpacity?: number
  shadowOpacity?: number
  glowIntensity?: number
  glowColor?: string

  particleEffect?: boolean
  hoverEffect?: boolean
  animationEffect?: boolean

  padding?: "none" | "small" | "sm" | "medium" | "md" | "large" | "lg" | "xl" | "custom"
  customPadding?: string
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "custom"
  customRounded?: string

  background?: "solid" | "gradient" | "pattern" | "image" | "video"
  gradientColors?: string[]
  patternType?: "dots" | "lines" | "grid" | "waves" | "custom"
  backgroundImage?: string
  backgroundVideo?: string

  interactive?: boolean
  hoverScale?: number
  hoverRotate?: number
  hoverGlow?: boolean
}

/**
 * Panel 컴포넌트 / Panel component
 *
 * Card를 확장한 고급 스타일링 패널 컴포넌트입니다.
 *
 * @example
 * <Panel><div>내용</div></Panel>
 * <Panel style="glass" effect="glow"><div>Glass 패널</div></Panel>
 * <Panel style="neon" interactive hoverGlow><div>호버 효과</div></Panel>
 */
const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({
    className,
    style = "default",
    effect = "none",
    transparency = 1,
    blurIntensity = 0,
    borderOpacity = 1,
    shadowOpacity = 1,
    glowIntensity = 0,
    glowColor = "blue",
    particleEffect = false,
    hoverEffect: _hoverEffect = false,
    animationEffect = false,
    padding = "md",
    customPadding,
    rounded = "lg",
    customRounded,
    background = "solid",
    gradientColors = ["#3B82F6", "#8B5CF6"],
    patternType = "dots",
    backgroundImage,
    backgroundVideo,
    interactive = false,
    hoverScale = 1.05,
    hoverRotate = 0,
    hoverGlow = false,
    children,
    ...cardProps
  }, ref): React.ReactElement => {

    // 패턴 배경 생성
    const patternBackground = React.useMemo(() => {
      switch (patternType) {
        case "dots":
          return "radial-gradient(circle, #000 1px, transparent 1px)"
        case "lines":
          return "linear-gradient(45deg, #000 1px, transparent 1px)"
        case "grid":
          return "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)"
        case "waves":
          return "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)"
        default:
          return ""
      }
    }, [patternType])

    // 배경 스타일 생성
    const backgroundStyles = React.useMemo((): React.CSSProperties => {
      const styles: React.CSSProperties = {
        opacity: transparency,
      }

      if (blurIntensity > 0) {
        styles.backdropFilter = `blur(${blurIntensity}px)`
      }

      if (borderOpacity < 1) {
        styles.borderColor = `rgba(0, 0, 0, ${borderOpacity})`
      }

      if (shadowOpacity < 1) {
        styles.boxShadow = `0 4px 6px -1px rgba(0, 0, 0, ${shadowOpacity * 0.1})`
      }

      if (glowIntensity > 0) {
        styles.boxShadow = `${styles.boxShadow || ''}, 0 0 ${glowIntensity * 10}px ${glowColor}`
      }

      switch (background) {
        case "gradient":
          styles.background = `linear-gradient(135deg, ${gradientColors.join(', ')})`
          break
        case "pattern":
          styles.backgroundImage = patternBackground
          break
        case "image":
          if (backgroundImage) {
            styles.backgroundImage = `url(${backgroundImage})`
            styles.backgroundSize = 'cover'
            styles.backgroundPosition = 'center'
          }
          break
        case "video":
          break
      }

      return styles
    }, [transparency, blurIntensity, borderOpacity, shadowOpacity, glowIntensity, glowColor, background, gradientColors, patternBackground, backgroundImage])

    // 호버 효과 클래스 생성
    const hoverClasses = React.useMemo(() => {
      if (!interactive) return ""

      const classes = []

      if (hoverScale !== 1) {
        classes.push(`hover:scale-${hoverScale}`)
      }

      if (hoverRotate !== 0) {
        classes.push(`hover:rotate-${hoverRotate}`)
      }

      if (hoverGlow) {
        classes.push("hover:shadow-2xl hover:shadow-cyan-500/30")
      }

      return classes.join(" ")
    }, [interactive, hoverScale, hoverRotate, hoverGlow])

    // Panel 전용 클래스들
    const panelClasses = React.useMemo(() => merge(
      "panel-component",
      `panel-${style}`,
      `panel-effect-${effect}`,
      panelStyleVariants({
        style,
        effect,
        padding: customPadding ? "custom" : padding,
        rounded: customRounded ? "custom" : rounded,
      }),
      customPadding,
      customRounded,
      hoverClasses,
      className
    ), [style, effect, padding, customPadding, rounded, customRounded, hoverClasses, className])
    
    return (
      <div className="relative">
        {/* 비디오 배경 */}
        {background === "video" && backgroundVideo && (
          <video
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        )}
        
        {/* 파티클 효과 */}
        {particleEffect && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 파티클 효과 렌더링 */}
          </div>
        )}
        
        {/* 메인 Panel */}
        <Card
          ref={ref}
          className={panelClasses}
          style={backgroundStyles}
          {...cardProps}
        >
          {children}
        </Card>
        
        {/* 애니메이션 효과 */}
        {animationEffect && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 애니메이션 효과 렌더링 */}
          </div>
        )}
      </div>
    )
  }
)

Panel.displayName = "Panel"

export { Panel } 