"use client"

import React, { useState, useEffect, useCallback } from "react"
import { merge } from "../lib/utils"
import { Button } from "./Button"

/**
 * 슬라이드 아이템 인터페이스
 */
export interface HeroSlide {
  title: string
  subtitle?: string
  description: string
  primaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  background?: "none" | "gradient" | "particles" | "image"
  backgroundImage?: string
}

/**
 * HeroSection 컴포넌트의 props
 */
export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  // 단일 모드 props
  title?: string
  subtitle?: string
  description?: string
  primaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  // 슬라이드 모드 props
  slides?: HeroSlide[]
  autoPlay?: boolean
  interval?: number
  indicator?: "dots" | "line" | "numbers" | "none"
  showControls?: boolean
  pauseOnHover?: boolean
  // 공통 props
  background?: "none" | "gradient" | "particles" | "video" | "image"
  customBackground?: string
  /**
   * 히어로 섹션 크기
   * - sm: 400px, md: 500px, lg: 600px, xl: 700px
   * - full: 100vh (뷰포트 전체)
   */
  size?: "sm" | "md" | "lg" | "xl" | "full"
  /**
   * 헤더 뒤까지 확장 (fixed header가 있을 때)
   * true면 -mt-16 적용되어 헤더 뒤로 들어감
   */
  fullBleed?: boolean
}

/**
 * HeroSection 컴포넌트
 *
 * 단일 히어로 또는 슬라이드 히어로를 지원합니다.
 * slides prop이 있으면 슬라이드 모드로 동작합니다.
 */
const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  ({
    className,
    // 단일 모드
    title,
    subtitle,
    description,
    primaryAction,
    secondaryAction,
    // 슬라이드 모드
    slides,
    autoPlay = false,
    interval = 5000,
    indicator = "dots",
    showControls = true,
    pauseOnHover = true,
    // 공통
    background = "gradient",
    customBackground,
    size = "lg",
    fullBleed = false,
    ...props
  }, ref) => {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    // 슬라이드 모드 여부
    const isSlideMode = slides && slides.length > 0
    const slideCount = slides?.length || 0

    // 다음 슬라이드
    const nextSlide = useCallback(() => {
      if (!isSlideMode) return
      setCurrentSlide((prev) => (prev + 1) % slideCount)
    }, [isSlideMode, slideCount])

    // 이전 슬라이드
    const prevSlide = useCallback(() => {
      if (!isSlideMode) return
      setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
    }, [isSlideMode, slideCount])

    // 특정 슬라이드로 이동
    const goToSlide = useCallback((index: number) => {
      setCurrentSlide(index)
    }, [])

    // 자동 재생
    useEffect(() => {
      if (!autoPlay || !isSlideMode || isPaused) return

      const timer = setInterval(nextSlide, interval)
      return () => clearInterval(timer)
    }, [autoPlay, isSlideMode, isPaused, interval, nextSlide])

    // 현재 표시할 콘텐츠
    const currentContent = isSlideMode ? slides[currentSlide] : {
      title: title || "",
      subtitle,
      description: description || "",
      primaryAction,
      secondaryAction,
      background,
    }

    const sizeClasses = {
      sm: "min-h-[400px]",
      md: "min-h-[500px]",
      lg: "min-h-[600px]",
      xl: "min-h-[700px]",
      full: "min-h-screen"
    }

    const titleSizeClasses = {
      sm: "text-2xl sm:text-3xl md:text-4xl leading-tight",
      md: "text-3xl sm:text-4xl md:text-5xl leading-tight",
      lg: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight",
      xl: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight",
      full: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight"
    }

    const subtitleSizeClasses = {
      sm: "text-base sm:text-lg md:text-xl leading-snug",
      md: "text-lg sm:text-xl md:text-2xl leading-snug",
      lg: "text-lg sm:text-xl md:text-2xl lg:text-3xl leading-snug",
      xl: "text-xl sm:text-2xl md:text-3xl leading-snug",
      full: "text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug"
    }

    const descriptionSizeClasses = {
      sm: "text-sm sm:text-base md:text-lg leading-relaxed",
      md: "text-base sm:text-lg md:text-xl leading-relaxed",
      lg: "text-base sm:text-lg md:text-xl leading-relaxed",
      xl: "text-base sm:text-lg md:text-xl leading-relaxed",
      full: "text-lg sm:text-xl md:text-2xl leading-relaxed"
    }

    const currentBg = isSlideMode ? (currentContent.background || background) : background

    const backgroundContent: Record<string, React.ReactNode> = {
      none: null,
      gradient: (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* 왼쪽 위 - 메인 그라데이션 */}
          <div className="absolute top-0 left-0 w-80 h-80 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full bg-gradient-to-br from-teal-400 via-cyan-500 to-teal-600 opacity-40 blur-3xl" />
          {/* 오른쪽 아래 - 보조 그라데이션 */}
          <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-80 sm:h-80 md:w-[400px] md:h-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-500 to-emerald-500 opacity-35 blur-3xl" />
          {/* 중앙 액센트 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full bg-teal-500/20 blur-2xl" />
        </div>
      ),
      particles: (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/50 via-background to-secondary/30" />
        </div>
      ),
      video: customBackground ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          >
            <source src={customBackground} type="video/mp4" />
          </video>
        </div>
      ) : null,
      image: (customBackground || (isSlideMode && (currentContent as HeroSlide).backgroundImage)) ? (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src={(isSlideMode && (currentContent as HeroSlide).backgroundImage) || customBackground}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      ) : null,
    }

    // 인디케이터 렌더링
    const renderIndicator = () => {
      if (!isSlideMode || indicator === "none") return null

      switch (indicator) {
        case "dots":
          return (
            <div className="flex gap-2 justify-center mt-8">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={merge(
                    "w-2.5 h-2.5 rounded-full transition-all duration-300",
                    currentSlide === index
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )

        case "line":
          return (
            <div className="flex gap-1 justify-center mt-8 max-w-xs mx-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="flex-1 h-1 rounded-full overflow-hidden bg-muted-foreground/20"
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    className={merge(
                      "h-full bg-primary transition-all duration-300",
                      currentSlide === index ? "w-full" : "w-0"
                    )}
                  />
                </button>
              ))}
            </div>
          )

        case "numbers":
          return (
            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground">
              <span className="text-foreground font-semibold">{currentSlide + 1}</span>
              <span>/</span>
              <span>{slideCount}</span>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <section
        ref={ref}
        className={merge(
          "relative w-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 overflow-hidden",
          sizeClasses[size],
          fullBleed && "-mt-16 pt-16",
          className
        )}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        {...props}
      >
        {backgroundContent[currentBg]}

        {/* 슬라이드 콘텐츠 */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <div
            key={isSlideMode ? currentSlide : 0}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <h1 className={merge(
              "font-extrabold mb-4 sm:mb-6 text-foreground",
              titleSizeClasses[size]
            )}>
              <span className="block gradient-text">
                {currentContent.title}
              </span>
              {currentContent.subtitle && (
                <span className={merge(
                  "block font-semibold mt-2 sm:mt-4 text-muted-foreground",
                  subtitleSizeClasses[size]
                )}>
                  {currentContent.subtitle}
                </span>
              )}
            </h1>

            <div className={merge(
              "text-muted-foreground mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto",
              descriptionSizeClasses[size]
            )}>
              {currentContent.description.split('\n').map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>

            {(currentContent.primaryAction || currentContent.secondaryAction) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {currentContent.primaryAction && (
                  <Button
                    href={currentContent.primaryAction.href}
                    size={size === "xl" || size === "full" ? "lg" : "md"}
                    hover="scale"
                    className="inline-flex items-center gap-2"
                  >
                    {currentContent.primaryAction.icon}
                    {currentContent.primaryAction.label}
                  </Button>
                )}

                {currentContent.secondaryAction && (
                  <Button
                    href={currentContent.secondaryAction.href}
                    variant="outline"
                    size={size === "xl" || size === "full" ? "lg" : "md"}
                    hover="scale"
                    className="inline-flex items-center gap-2"
                  >
                    {currentContent.secondaryAction.icon}
                    {currentContent.secondaryAction.label}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 인디케이터 */}
          {renderIndicator()}
        </div>

        {/* 좌우 컨트롤 */}
        {isSlideMode && showControls && slideCount > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card transition-colors"
              aria-label="Previous slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border text-foreground hover:bg-card transition-colors"
              aria-label="Next slide"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </section>
    )
  }
)

HeroSection.displayName = "HeroSection"

export { HeroSection }
