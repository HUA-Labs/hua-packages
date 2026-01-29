"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Card, CardProps } from "./Card"

/**
 * Panel 컴포넌트의 props / Panel component props
 * @typedef {Object} PanelProps
 * @property {"default" | "solid" | "glass" | "outline" | "elevated" | "neon" | "holographic" | "cyberpunk" | "minimal" | "luxury"} [style="default"] - Panel 스타일 / Panel style
 * @property {"none" | "glow" | "shadow" | "gradient" | "animated"} [effect="none"] - Panel 효과 / Panel effect
 * @property {number} [transparency=1] - 투명도 (0-1) / Transparency (0-1)
 * @property {number} [blurIntensity=0] - backdrop-blur 강도 (px) / Backdrop blur intensity (px)
 * @property {number} [borderOpacity=1] - 보더 투명도 (0-1) / Border opacity (0-1)
 * @property {number} [shadowOpacity=1] - 그림자 투명도 (0-1) / Shadow opacity (0-1)
 * @property {number} [glowIntensity=0] - 글로우 강도 (px) / Glow intensity (px)
 * @property {string} [glowColor="blue"] - 글로우 색상 / Glow color
 * @property {boolean} [particleEffect=false] - 파티클 효과 활성화 / Enable particle effect
 * @property {boolean} [hoverEffect=false] - 호버 효과 활성화 / Enable hover effect
 * @property {boolean} [animationEffect=false] - 애니메이션 효과 활성화 / Enable animation effect
 * @property {"none" | "small" | "sm" | "medium" | "md" | "large" | "lg" | "xl" | "custom"} [padding="md"] - 패딩 크기 / Padding size
 * @property {string} [customPadding] - 커스텀 패딩 / Custom padding
 * @property {"none" | "sm" | "md" | "lg" | "xl" | "full" | "custom"} [rounded="lg"] - 둥근 모서리 크기 / Rounded corner size
 * @property {string} [customRounded] - 커스텀 둥근 모서리 / Custom rounded corners
 * @property {"solid" | "gradient" | "pattern" | "image" | "video"} [background="solid"] - 배경 타입 / Background type
 * @property {string[]} [gradientColors] - 그라디언트 색상 배열 / Gradient color array
 * @property {"dots" | "lines" | "grid" | "waves" | "custom"} [patternType="dots"] - 패턴 타입 / Pattern type
 * @property {string} [backgroundImage] - 배경 이미지 URL / Background image URL
 * @property {string} [backgroundVideo] - 배경 비디오 URL / Background video URL
 * @property {boolean} [interactive=false] - 인터랙티브 모드 활성화 / Enable interactive mode
 * @property {number} [hoverScale=1.05] - 호버 시 스케일 / Scale on hover
 * @property {number} [hoverRotate=0] - 호버 시 회전 각도 / Rotation angle on hover
 * @property {boolean} [hoverGlow=false] - 호버 시 글로우 효과 / Glow effect on hover
 * @extends {Omit<CardProps, 'variant' | 'style'>}
 */
export interface PanelProps extends Omit<CardProps, 'variant' | 'style' | 'padding'> {
  // 🆕 Panel 전용 고급 속성들
  style?: "default" | "solid" | "glass" | "outline" | "elevated" | "neon" | "holographic" | "cyberpunk" | "minimal" | "luxury"
  effect?: "none" | "glow" | "shadow" | "gradient" | "animated"
  
  // 고급 스타일링
  transparency?: number        // 0-1 사이 투명도
  blurIntensity?: number       // backdrop-blur 강도
  borderOpacity?: number       // 보더 투명도
  shadowOpacity?: number       // 그림자 투명도
  glowIntensity?: number       // 글로우 강도
  glowColor?: string           // 글로우 색상
  
  // 고급 효과
  particleEffect?: boolean
  hoverEffect?: boolean
  animationEffect?: boolean
  
  // 레이아웃 옵션
  padding?: "none" | "small" | "sm" | "medium" | "md" | "large" | "lg" | "xl" | "custom"
  customPadding?: string
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "full" | "custom"
  customRounded?: string
  
  // 배경 옵션
  background?: "solid" | "gradient" | "pattern" | "image" | "video"
  gradientColors?: string[]
  patternType?: "dots" | "lines" | "grid" | "waves" | "custom"
  backgroundImage?: string
  backgroundVideo?: string
  
  // 인터랙션
  interactive?: boolean
  hoverScale?: number
  hoverRotate?: number
  hoverGlow?: boolean
}

/**
 * Panel 컴포넌트 / Panel component
 * 
 * 고급 스타일링 옵션을 가진 패널 컴포넌트입니다.
 * 다양한 스타일, 효과, 배경 옵션을 지원합니다.
 * Card 컴포넌트를 기반으로 하며, 추가적인 고급 기능을 제공합니다.
 * 
 * Panel component with advanced styling options.
 * Supports various styles, effects, and background options.
 * Based on Card component with additional advanced features.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Panel>
 *   <div>내용</div>
 * </Panel>
 * 
 * @example
 * // Glass 스타일 / Glass style
 * <Panel style="glass" effect="glow">
 *   <div>Glass 패널</div>
 * </Panel>
 * 
 * @example
 * // 인터랙티브 패널 / Interactive panel
 * <Panel 
 *   style="neon"
 *   interactive
 *   hoverScale={1.1}
 *   hoverGlow
 * >
 *   <div>호버 효과</div>
 * </Panel>
 * 
 * @param {PanelProps} props - Panel 컴포넌트의 props / Panel component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} Panel 컴포넌트 / Panel component
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
    
    // 스타일별 클래스 생성 - useMemo로 메모이제이션
    const styleClasses = React.useMemo(() => {
      const baseClasses = "transition-all duration-300"
      
      switch (style) {
        case "solid":
          return merge(baseClasses, "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700")
        case "glass":
          return merge(baseClasses, "bg-white/10 backdrop-blur-md border border-white/20")
        case "outline":
          return merge(baseClasses, "bg-transparent border border-gray-300 dark:border-gray-600")
        case "elevated":
          return merge(baseClasses, "bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700")
        case "neon":
          return merge(baseClasses, "bg-gray-900 border border-cyan-400/30 shadow-lg shadow-cyan-400/20")
        case "holographic":
          return merge(baseClasses, "bg-gradient-to-br from-white/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/30")
        case "cyberpunk":
          return merge(baseClasses, "bg-gray-900 border-2 border-pink-500 shadow-lg shadow-pink-500/30")
        case "minimal":
          return merge(baseClasses, "bg-white border border-gray-200 shadow-sm")
        case "luxury":
          return merge(baseClasses, "bg-gradient-to-br from-amber-50 to-yellow-100 border border-amber-200 shadow-xl")
        default:
          return merge(baseClasses, "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700")
      }
    }, [style])
    
    // 효과별 클래스 생성 - useMemo로 메모이제이션
    const effectClasses = React.useMemo(() => {
      switch (effect) {
        case "glow":
          return "shadow-2xl shadow-indigo-500/20 dark:shadow-cyan-400/20"
        case "shadow":
          return "shadow-xl"
        case "gradient":
          return "bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10"
        case "animated":
          return "animate-pulse"
        default:
          return ""
      }
    }, [effect])
    
    // 패딩 클래스 생성 - useMemo로 메모이제이션
    const paddingClasses = React.useMemo(() => {
      if (customPadding) return customPadding
      
      switch (padding) {
        case "none": return "p-0"
        case "small":
        case "sm": return "p-3"
        case "medium":
        case "md": return "p-6"
        case "large":
        case "lg": return "p-8"
        case "xl": return "p-12"
        default: return "p-6"
      }
    }, [padding, customPadding])
    
    // 둥근 모서리 클래스 생성 - useMemo로 메모이제이션
    const roundedClasses = React.useMemo(() => {
      if (customRounded) return customRounded
      
      switch (rounded) {
        case "none": return "rounded-none"
        case "sm": return "rounded-sm"
        case "md": return "rounded-md"
        case "lg": return "rounded-lg"
        case "xl": return "rounded-xl"
        case "full": return "rounded-full"
        default: return "rounded-lg"
      }
    }, [rounded, customRounded])
    
    // 패턴 배경 생성 - useMemo로 메모이제이션
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
    
    // 배경 스타일 생성 - useMemo로 메모이제이션
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
          // 비디오 배경은 별도 요소로 처리
          break
      }
      
      return styles
    }, [transparency, blurIntensity, borderOpacity, shadowOpacity, glowIntensity, glowColor, background, gradientColors, patternBackground, backgroundImage])
    
    // 호버 효과 클래스 생성 - useMemo로 메모이제이션
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
    
    // Panel 전용 클래스들 - useMemo로 메모이제이션
    const panelClasses = React.useMemo(() => merge(
      "panel-component",
      `panel-${style}`,
      `panel-effect-${effect}`,
      styleClasses,
      effectClasses,
      paddingClasses,
      roundedClasses,
      hoverClasses,
      className
    ), [style, effect, styleClasses, effectClasses, paddingClasses, roundedClasses, hoverClasses, className])
    
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