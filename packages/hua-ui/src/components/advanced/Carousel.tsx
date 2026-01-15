"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { merge } from "../../lib/utils";

/**
 * Carousel 컴포넌트의 props / Carousel component props
 * @property {boolean} [autoPlay=false] - 자동 재생 / Auto play
 * @property {number} [interval=5000] - 자동 재생 간격 (ms) / Auto play interval
 * @property {boolean} [loop=true] - 무한 루프 / Infinite loop
 * @property {boolean} [pauseOnHover=true] - 호버시 일시정지 / Pause on hover
 * @property {"dots" | "bars" | "numbers" | "none"} [indicators="dots"] - 인디케이터 타입 / Indicator type
 * @property {"bottom" | "top" | "inside-bottom" | "inside-top"} [indicatorPosition="bottom"] - 인디케이터 위치 / Indicator position
 * @property {boolean} [showArrows=true] - 화살표 버튼 표시 / Show arrow buttons
 * @property {"inside" | "outside" | "hidden"} [arrowPosition="inside"] - 화살표 위치 / Arrow position
 * @property {"slide" | "fade" | "scale"} [transition="slide"] - 전환 효과 / Transition effect
 * @property {number} [transitionDuration=500] - 전환 시간 (ms) / Transition duration
 * @property {(index: number) => void} [onSlideChange] - 슬라이드 변경 콜백 / Slide change callback
 * @property {boolean} [showPlayPause=false] - 재생/일시정지 버튼 표시 / Show play/pause button
 * @property {"left" | "right" | "center"} [playPausePosition="right"] - 재생/일시정지 버튼 위치 / Play/pause button position
 */
export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  children: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  loop?: boolean;
  pauseOnHover?: boolean;
  indicators?: "dots" | "bars" | "numbers" | "none";
  indicatorPosition?: "bottom" | "top" | "inside-bottom" | "inside-top";
  showArrows?: boolean;
  arrowPosition?: "inside" | "outside" | "hidden";
  transition?: "slide" | "fade" | "scale";
  transitionDuration?: number;
  onSlideChange?: (index: number) => void;
  showPlayPause?: boolean;
  playPausePosition?: "left" | "right" | "center";
}

/**
 * Carousel 컴포넌트 / Carousel component
 *
 * 슬라이드 캐러셀 컴포넌트입니다.
 * 다양한 인디케이터, 화살표, 전환 효과를 지원합니다.
 *
 * Slide carousel component.
 * Supports various indicators, arrows, and transition effects.
 *
 * @component
 * @example
 * <Carousel autoPlay interval={3000} indicators="bars">
 *   <img src="/slide1.jpg" alt="Slide 1" />
 *   <img src="/slide2.jpg" alt="Slide 2" />
 *   <img src="/slide3.jpg" alt="Slide 3" />
 * </Carousel>
 */
const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  (
    {
      children,
      autoPlay = false,
      interval = 5000,
      loop = true,
      pauseOnHover = true,
      indicators = "dots",
      indicatorPosition = "bottom",
      showArrows = true,
      arrowPosition = "inside",
      transition = "slide",
      transitionDuration = 500,
      onSlideChange,
      showPlayPause = false,
      playPausePosition = "right",
      className,
      style,
      ...props
    },
    ref
  ) => {
    // For slide transition with loop: start at 1 (account for cloned first slide)
    // For fade/scale: always start at 0 (no cloned slides)
    const getInitialIndex = () => {
      if (transition === "slide" && loop) return 1;
      return 0;
    };
    const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
    const [isPaused, setIsPaused] = useState(!autoPlay);
    const [isManuallyPaused, setIsManuallyPaused] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [noTransition, setNoTransition] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const slideCount = React.Children.count(children);

    // Check for reduced motion preference
    const prefersReducedMotion = useReducedMotion();

    // Get actual slide index for display (accounting for cloned slides in loop mode for slide transition)
    const getActualIndex = useCallback((index: number) => {
      // For fade/scale transitions, currentIndex is the actual index
      if (transition !== "slide") return index;
      // For slide transition without loop, index is actual
      if (!loop) return index;
      // For slide transition with loop, account for cloned slides
      if (index === 0) return slideCount - 1;
      if (index === slideCount + 1) return 0;
      return index - 1;
    }, [loop, slideCount, transition]);

    // Go to specific slide
    const goToSlide = useCallback(
      (index: number) => {
        if (isTransitioning) return;

        let newIndex = index;
        if (!loop) {
          newIndex = Math.max(0, Math.min(index, slideCount - 1));
        } else if (transition !== "slide") {
          // For fade/scale with loop, wrap around without cloned slides
          if (index < 0) {
            newIndex = slideCount - 1;
          } else if (index >= slideCount) {
            newIndex = 0;
          }
        }

        if (newIndex !== currentIndex) {
          setIsTransitioning(true);
          setCurrentIndex(newIndex);
          const actualIndex = loop && transition === "slide"
            ? (newIndex === 0 ? slideCount - 1 : newIndex === slideCount + 1 ? 0 : newIndex - 1)
            : newIndex;
          onSlideChange?.(actualIndex);
          setTimeout(() => setIsTransitioning(false), transitionDuration);
        }
      },
      [currentIndex, slideCount, loop, isTransitioning, transitionDuration, transition, onSlideChange]
    );

    // Handle infinite loop jump (when reaching cloned slides)
    useEffect(() => {
      if (!loop || isTransitioning || transition !== "slide") return;

      // Jump to real slide without animation when on cloned slides
      if (currentIndex === 0) {
        // At cloned last slide -> jump to real last slide
        setTimeout(() => {
          setNoTransition(true);
          setCurrentIndex(slideCount);
          setTimeout(() => setNoTransition(false), 50);
        }, transitionDuration);
      } else if (currentIndex === slideCount + 1) {
        // At cloned first slide -> jump to real first slide
        setTimeout(() => {
          setNoTransition(true);
          setCurrentIndex(1);
          setTimeout(() => setNoTransition(false), 50);
        }, transitionDuration);
      }
    }, [currentIndex, slideCount, loop, isTransitioning, transitionDuration, transition]);

    // Next slide
    const nextSlide = useCallback(() => {
      goToSlide(currentIndex + 1);
    }, [currentIndex, goToSlide]);

    // Previous slide
    const prevSlide = useCallback(() => {
      goToSlide(currentIndex - 1);
    }, [currentIndex, goToSlide]);

    // Toggle play/pause manually
    const togglePlayPause = useCallback(() => {
      setIsManuallyPaused(prev => !prev);
    }, []);

    // Play function
    const play = useCallback(() => {
      setIsManuallyPaused(false);
    }, []);

    // Pause function
    const pause = useCallback(() => {
      setIsManuallyPaused(true);
    }, []);

    // Auto play
    useEffect(() => {
      if (!autoPlay || isPaused || isManuallyPaused || prefersReducedMotion) return;

      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }, [autoPlay, interval, isPaused, isManuallyPaused, nextSlide, prefersReducedMotion]);

    // Touch handlers for swipe
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const minSwipeDistance = 50;

      if (Math.abs(distance) >= minSwipeDistance) {
        if (distance > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }

      setTouchStart(null);
      setTouchEnd(null);
    };

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          prevSlide();
        } else if (e.key === "ArrowRight") {
          nextSlide();
        }
      };

      const container = containerRef.current;
      container?.addEventListener("keydown", handleKeyDown);
      return () => container?.removeEventListener("keydown", handleKeyDown);
    }, [nextSlide, prevSlide]);

    // Render slides with transition
    const renderSlides = () => {
      const duration = prefersReducedMotion || noTransition ? 0 : transitionDuration;
      const actualIndex = getActualIndex(currentIndex);

      switch (transition) {
        case "fade":
          return React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={merge(
                "absolute inset-0 w-full h-full",
                index === actualIndex ? "z-10" : "z-0"
              )}
              style={{
                opacity: index === actualIndex ? 1 : 0,
                transition: `opacity ${duration}ms ease-in-out`,
              }}
            >
              {child}
            </div>
          ));

        case "scale":
          return React.Children.map(children, (child, index) => (
            <div
              key={index}
              className={merge(
                "absolute inset-0 w-full h-full",
                index === actualIndex ? "z-10" : "z-0"
              )}
              style={{
                opacity: index === actualIndex ? 1 : 0,
                transform: `scale(${index === actualIndex ? 1 : 0.9})`,
                transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
              }}
            >
              {child}
            </div>
          ));

        case "slide":
        default: {
          const childArray = React.Children.toArray(children);
          // For infinite loop: clone last slide at beginning and first slide at end
          const slides = loop
            ? [childArray[childArray.length - 1], ...childArray, childArray[0]]
            : childArray;

          // 각 슬라이드를 fade/scale처럼 absolute로 배치하고 translateX로 위치 조정
          return slides.map((child, index) => (
            <div
              key={index}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: `translateX(${(index - currentIndex) * 100}%)`,
                transition: noTransition ? 'none' : `transform ${duration}ms ease-in-out`,
              }}
            >
              {child}
            </div>
          ));
        }
      }
    };

    // Render indicators
    const renderIndicators = () => {
      if (indicators === "none") return null;

      const isInside = indicatorPosition.includes("inside");
      const isTop = indicatorPosition.includes("top");
      const actualIndex = getActualIndex(currentIndex);

      const indicatorContainerClass = merge(
        "flex items-center justify-center gap-2",
        isInside
          ? merge(
              "absolute left-1/2 -translate-x-1/2 z-20",
              isTop ? "top-4" : "bottom-4"
            )
          : merge(
              "mt-4",
              isTop && "order-first mb-4 mt-0"
            )
      );

      // Handle indicator click - go to the correct index accounting for loop mode
      const handleIndicatorClick = (index: number) => {
        if (loop && transition === "slide") {
          goToSlide(index + 1); // +1 because of cloned first slide (only for slide transition)
        } else {
          goToSlide(index);
        }
      };

      return (
        <div className={indicatorContainerClass} role="tablist">
          {Array.from({ length: slideCount }, (_, index) => {
            const isActive = index === actualIndex;

            switch (indicators) {
              case "bars":
                return (
                  <button
                    key={index}
                    onClick={() => handleIndicatorClick(index)}
                    className={merge(
                      "h-1 rounded-full transition-all duration-300",
                      isActive
                        ? "w-8 bg-white"
                        : "w-4 bg-white/50 hover:bg-white/70"
                    )}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`슬라이드 ${index + 1}`}
                  />
                );

              case "numbers":
                return (
                  <button
                    key={index}
                    onClick={() => handleIndicatorClick(index)}
                    className={merge(
                      "w-8 h-8 rounded-full text-sm font-medium transition-all duration-300",
                      isActive
                        ? "bg-white text-gray-900"
                        : "bg-white/30 text-white hover:bg-white/50"
                    )}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`슬라이드 ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                );

              case "dots":
              default:
                return (
                  <button
                    key={index}
                    onClick={() => handleIndicatorClick(index)}
                    className={merge(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      isActive
                        ? "bg-white scale-125"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`슬라이드 ${index + 1}`}
                  />
                );
            }
          })}
        </div>
      );
    };

    // Render play/pause button
    const renderPlayPause = () => {
      if (!showPlayPause || !autoPlay) return null;

      const isPlaying = !isManuallyPaused;
      const positionClasses = {
        left: "left-4",
        center: "left-1/2 -translate-x-1/2",
        right: "right-4"
      };

      return (
        <button
          onClick={togglePlayPause}
          className={merge(
            "absolute bottom-4 z-20",
            "w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/80 hover:bg-white text-gray-800",
            "transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
            positionClasses[playPausePosition]
          )}
          aria-label={isPlaying ? "일시정지" : "재생"}
        >
          {isPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
        </button>
      );
    };

    // Render arrows
    const renderArrows = () => {
      if (!showArrows || arrowPosition === "hidden") return null;

      const canGoPrev = loop || currentIndex > 0;
      const canGoNext = loop || currentIndex < slideCount - 1;

      const arrowBaseClass = merge(
        "absolute top-1/2 -translate-y-1/2 z-20",
        "w-10 h-10 rounded-full flex items-center justify-center",
        "bg-white/80 hover:bg-white text-gray-800",
        "transition-all duration-200",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      );

      const prevPosition = arrowPosition === "outside" ? "-left-14" : "left-4";
      const nextPosition = arrowPosition === "outside" ? "-right-14" : "right-4";

      return (
        <>
          <button
            onClick={prevSlide}
            disabled={!canGoPrev}
            className={merge(arrowBaseClass, prevPosition)}
            aria-label="이전 슬라이드"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={!canGoNext}
            className={merge(arrowBaseClass, nextPosition)}
            aria-label="다음 슬라이드"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      );
    };

    return (
      <div
        ref={ref}
        className={merge(
          "flex flex-col w-full h-full",
          arrowPosition === "outside" && "px-16",
          className
        )}
        style={style}
        {...props}
      >
        <div
          ref={containerRef}
          className="relative overflow-hidden w-full flex-1"
          onMouseEnter={() => pauseOnHover && setIsPaused(true)}
          onMouseLeave={() => pauseOnHover && setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="이미지 슬라이더"
        >
          {renderSlides()}
          {renderArrows()}
          {renderPlayPause()}
          {indicatorPosition.includes("inside") && renderIndicators()}
        </div>
        {!indicatorPosition.includes("inside") && renderIndicators()}
      </div>
    );
  }
);

Carousel.displayName = "Carousel";

// Hook to check for reduced motion preference
function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

// Simple icon components
function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
    </svg>
  );
}

export { Carousel };
