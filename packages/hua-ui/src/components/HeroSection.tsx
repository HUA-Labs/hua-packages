"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Button } from "./Button";

// ── Static style constants ────────────────────────────────────────────────────

const SECTION_BASE: React.CSSProperties = {
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  overflow: "hidden",
  ...resolveDot("pl-4 pr-4"),
};

const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { minHeight: "400px" },
  md: { minHeight: "500px" },
  lg: { minHeight: "600px" },
  xl: { minHeight: "700px" },
  full: { minHeight: "100vh" },
};

const FULL_BLEED_STYLE: React.CSSProperties = {
  marginTop: "-4rem", // -mt-16 (음수 margin 유지)
  ...resolveDot("pt-16"),
};

// Background decoration layer
const BG_LAYER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 0,
  pointerEvents: "none",
};

// Gradient blobs
const BLOB_TOP_LEFT: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "20rem",
  height: "20rem",
  transform: "translate(-33%, -33%)",
  borderRadius: "9999px",
  background: "linear-gradient(to bottom right, #4fd1c5, #06b6d4, #0d9488)",
  opacity: 0.4,
  filter: "blur(64px)",
};

const BLOB_BOTTOM_RIGHT: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  right: 0,
  width: "18rem",
  height: "18rem",
  transform: "translate(25%, 25%)",
  borderRadius: "9999px",
  background: "linear-gradient(to top right, #22d3ee, #14b8a6, #10b981)",
  opacity: 0.35,
  filter: "blur(64px)",
};

const BLOB_CENTER: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "12rem",
  height: "12rem",
  borderRadius: "9999px",
  background: "rgba(20, 184, 166, 0.2)",
  filter: "blur(40px)",
};

const PARTICLES_LAYER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to bottom right, color-mix(in srgb, var(--color-secondary) 50%, transparent), var(--color-background), color-mix(in srgb, var(--color-secondary) 30%, transparent))",
};

const VIDEO_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.2,
};

const IMAGE_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.3,
};

const IMAGE_OVERLAY: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(to top, var(--color-background), color-mix(in srgb, var(--color-background) 50%, transparent), transparent)",
};

// Content area
const CONTENT_AREA: React.CSSProperties = {
  position: "relative",
  zIndex: 10,
  maxWidth: "56rem", // max-w-4xl
  marginLeft: "auto",
  marginRight: "auto",
};

// Title size styles (base font size; responsive handled via JS state / media queries not available inline)
const TITLE_SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: "1.875rem", lineHeight: 1.25 }, // text-3xl
  md: { fontSize: "2.25rem", lineHeight: 1.25 }, // text-4xl
  lg: { fontSize: "2.25rem", lineHeight: 1.25 }, // text-4xl
  xl: { fontSize: "2.25rem", lineHeight: 1.25 },
  full: { fontSize: "2.5rem", lineHeight: 1.25 }, // text-4xl
};

const TITLE_BASE: React.CSSProperties = {
  fontWeight: 800,
  color: "var(--color-foreground)",
  ...resolveDot("mb-4"),
};

const SUBTITLE_SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: "1rem", lineHeight: 1.375 }, // text-base
  md: { fontSize: "1.125rem", lineHeight: 1.375 }, // text-lg
  lg: { fontSize: "1.125rem", lineHeight: 1.375 },
  xl: { fontSize: "1.25rem", lineHeight: 1.375 }, // text-xl
  full: { fontSize: "1.25rem", lineHeight: 1.375 },
};

const SUBTITLE_BASE: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  color: "var(--color-muted-foreground)",
  ...resolveDot("mt-2"),
};

const GRADIENT_TEXT_STYLE: React.CSSProperties = {
  display: "block",
  background: "linear-gradient(to right, #0d9488, #06b6d4, #10b981)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const DESC_SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: "0.875rem", lineHeight: 1.625 }, // text-sm
  md: { fontSize: "1rem", lineHeight: 1.625 }, // text-base
  lg: { fontSize: "1rem", lineHeight: 1.625 },
  xl: { fontSize: "1rem", lineHeight: 1.625 },
  full: { fontSize: "1.125rem", lineHeight: 1.625 }, // text-lg
};

const DESC_BASE: React.CSSProperties = {
  color: "var(--color-muted-foreground)",
  maxWidth: "42rem",
  marginLeft: "auto",
  marginRight: "auto",
  ...resolveDot("mb-6"),
};

const ACTIONS_ROW: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  ...resolveDot("gap-4"),
};

// Indicator styles
const DOTS_ROW: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  ...resolveDot("gap-2 mt-8"),
};

const DOT_BASE: React.CSSProperties = {
  width: "0.625rem",
  height: "0.625rem",
  borderRadius: "9999px",
  border: "none",
  cursor: "pointer",
  transition: "all 300ms ease",
  padding: 0,
};

const DOT_ACTIVE: React.CSSProperties = {
  width: "2rem",
  background: "var(--color-primary)",
};

const DOT_INACTIVE: React.CSSProperties = {
  background:
    "color-mix(in srgb, var(--color-muted-foreground) 30%, transparent)",
};

const LINE_ROW: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  maxWidth: "20rem",
  marginLeft: "auto",
  marginRight: "auto",
  ...resolveDot("gap-1 mt-8"),
};

const LINE_TRACK: React.CSSProperties = {
  flex: 1,
  height: "0.25rem",
  borderRadius: "9999px",
  overflow: "hidden",
  background:
    "color-mix(in srgb, var(--color-muted-foreground) 20%, transparent)",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

const LINE_FILL_ACTIVE: React.CSSProperties = {
  height: "100%",
  width: "100%",
  background: "var(--color-primary)",
  transition: "all 300ms ease",
};

const LINE_FILL_INACTIVE: React.CSSProperties = {
  height: "100%",
  width: 0,
  background: "var(--color-primary)",
  transition: "all 300ms ease",
};

const NUMBERS_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  color: "var(--color-muted-foreground)",
  ...resolveDot("gap-2 mt-8"),
};

const NUMBER_CURRENT: React.CSSProperties = {
  color: "var(--color-foreground)",
  fontWeight: 600,
};

// Slide controls
const CTRL_BTN_BASE: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 20,
  borderRadius: "9999px",
  ...resolveDot("p-2"),
  background: "color-mix(in srgb, var(--color-card) 80%, transparent)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
  border: "1px solid var(--color-border)",
  color: "var(--color-foreground)",
  cursor: "pointer",
  transition: "background-color 200ms ease",
};

const CTRL_PREV: React.CSSProperties = { left: "1rem" };
const CTRL_NEXT: React.CSSProperties = { right: "1rem" };

const SVG_ICON: React.CSSProperties = { width: "1.25rem", height: "1.25rem" };

// ── Interfaces ────────────────────────────────────────────────────────────────

/**
 * 슬라이드 아이템 인터페이스
 */
export interface HeroSlide {
  title: string;
  subtitle?: string;
  description: string;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  background?: "none" | "gradient" | "particles" | "image";
  backgroundImage?: string;
}

/**
 * HeroSection 컴포넌트의 props
 */
export interface HeroSectionProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "className"
> {
  // 단일 모드 props
  title?: string;
  subtitle?: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  // 슬라이드 모드 props
  slides?: HeroSlide[];
  autoPlay?: boolean;
  interval?: number;
  indicator?: "dots" | "line" | "numbers" | "none";
  showControls?: boolean;
  pauseOnHover?: boolean;
  // 공통 props
  background?: "none" | "gradient" | "particles" | "video" | "image";
  customBackground?: string;
  /**
   * 히어로 섹션 크기
   * - sm: 400px, md: 500px, lg: 600px, xl: 700px
   * - full: 100vh (뷰포트 전체)
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * 헤더 뒤까지 확장 (fixed header가 있을 때)
   * true면 -mt-16 / pt-16 적용되어 헤더 뒤로 들어감
   */
  fullBleed?: boolean;
  /** dot utility string for additional styles */
  dot?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * HeroSection 컴포넌트
 *
 * 단일 히어로 또는 슬라이드 히어로를 지원합니다.
 * slides prop이 있으면 슬라이드 모드로 동작합니다.
 */
const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    {
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
      dot: dotProp,
      style,
      ...props
    },
    ref,
  ) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const isSlideMode = slides && slides.length > 0;
    const slideCount = slides?.length || 0;

    const nextSlide = useCallback(() => {
      if (!isSlideMode) return;
      setCurrentSlide((prev) => (prev + 1) % slideCount);
    }, [isSlideMode, slideCount]);

    const prevSlide = useCallback(() => {
      if (!isSlideMode) return;
      setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
    }, [isSlideMode, slideCount]);

    const goToSlide = useCallback((index: number) => {
      setCurrentSlide(index);
    }, []);

    useEffect(() => {
      if (!autoPlay || !isSlideMode || isPaused) return;
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }, [autoPlay, isSlideMode, isPaused, interval, nextSlide]);

    const currentContent = isSlideMode
      ? slides[currentSlide]
      : {
          title: title || "",
          subtitle,
          description: description || "",
          primaryAction,
          secondaryAction,
          background,
        };

    const currentBg = isSlideMode
      ? currentContent.background || background
      : background;

    // Compute section style
    const sectionStyle = useMemo(
      () =>
        mergeStyles(
          SECTION_BASE,
          SIZE_STYLES[size],
          fullBleed ? FULL_BLEED_STYLE : undefined,
          resolveDot(dotProp),
          style,
        ),
      [size, fullBleed, dotProp, style],
    );

    // Background elements
    const backgroundContent: Record<string, React.ReactNode> = {
      none: null,
      gradient: (
        <div style={BG_LAYER}>
          <div style={BLOB_TOP_LEFT} />
          <div style={BLOB_BOTTOM_RIGHT} />
          <div style={BLOB_CENTER} />
        </div>
      ),
      particles: (
        <div style={BG_LAYER}>
          <div style={PARTICLES_LAYER} />
        </div>
      ),
      video: customBackground ? (
        <div style={BG_LAYER}>
          <video autoPlay loop muted playsInline style={VIDEO_STYLE}>
            <source src={customBackground} type="video/mp4" />
          </video>
        </div>
      ) : null,
      image:
        customBackground ||
        (isSlideMode && (currentContent as HeroSlide).backgroundImage) ? (
          <div style={BG_LAYER}>
            <img
              src={
                (isSlideMode &&
                  (currentContent as HeroSlide).backgroundImage) ||
                customBackground
              }
              alt=""
              style={IMAGE_STYLE}
            />
            <div style={IMAGE_OVERLAY} />
          </div>
        ) : null,
    };

    // Indicator renderer
    const renderIndicator = () => {
      if (!isSlideMode || indicator === "none") return null;

      switch (indicator) {
        case "dots":
          return (
            <div style={DOTS_ROW}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={mergeStyles(
                    DOT_BASE,
                    currentSlide === index ? DOT_ACTIVE : DOT_INACTIVE,
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          );

        case "line":
          return (
            <div style={LINE_ROW}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  style={LINE_TRACK}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <div
                    style={
                      currentSlide === index
                        ? LINE_FILL_ACTIVE
                        : LINE_FILL_INACTIVE
                    }
                  />
                </button>
              ))}
            </div>
          );

        case "numbers":
          return (
            <div style={NUMBERS_ROW}>
              <span style={NUMBER_CURRENT}>{currentSlide + 1}</span>
              <span>/</span>
              <span>{slideCount}</span>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <section
        ref={ref}
        style={sectionStyle}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        {...props}
      >
        {backgroundContent[currentBg]}

        {/* 슬라이드 콘텐츠 */}
        <div style={CONTENT_AREA}>
          <div key={isSlideMode ? currentSlide : 0}>
            <h1 style={mergeStyles(TITLE_BASE, TITLE_SIZE_STYLES[size])}>
              <span style={GRADIENT_TEXT_STYLE}>{currentContent.title}</span>
              {currentContent.subtitle && (
                <span
                  style={mergeStyles(SUBTITLE_BASE, SUBTITLE_SIZE_STYLES[size])}
                >
                  {currentContent.subtitle}
                </span>
              )}
            </h1>

            <div style={mergeStyles(DESC_BASE, DESC_SIZE_STYLES[size])}>
              {currentContent.description.split("\n").map((line, i, arr) => (
                <React.Fragment key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>

            {(currentContent.primaryAction ||
              currentContent.secondaryAction) && (
              <div style={ACTIONS_ROW}>
                {currentContent.primaryAction && (
                  <Button
                    href={currentContent.primaryAction.href}
                    size={size === "xl" || size === "full" ? "lg" : "md"}
                    hover="scale"
                    dot="inline-flex items-center gap-2"
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
                    dot="inline-flex items-center gap-2"
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
              style={mergeStyles(CTRL_BTN_BASE, CTRL_PREV)}
              aria-label="Previous slide"
            >
              <svg
                style={SVG_ICON}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              style={mergeStyles(CTRL_BTN_BASE, CTRL_NEXT)}
              aria-label="Next slide"
            >
              <svg
                style={SVG_ICON}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </section>
    );
  },
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
