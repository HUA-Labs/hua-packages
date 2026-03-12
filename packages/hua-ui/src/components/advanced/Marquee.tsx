"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

/**
 * Marquee 컴포넌트의 props / Marquee component props
 * @property {"left" | "right" | "up" | "down"} [direction="left"] - 이동 방향 / Movement direction
 * @property {number} [speed=50] - 속도 (px/s) / Speed in pixels per second
 * @property {boolean} [pauseOnHover=true] - 호버시 일시정지 / Pause on hover
 * @property {boolean} [pauseOnClick=false] - 클릭시 일시정지 / Pause on click
 * @property {number} [gap=16] - 아이템 간격 (px) / Gap between items in pixels
 * @property {boolean} [gradient=true] - 양쪽 페이드 그라디언트 / Fade gradient on edges
 * @property {string} [gradientColor="var(--color-background)"] - 그라디언트 색상 / Gradient color
 * @property {number} [gradientWidth=100] - 그라디언트 너비 (px) / Gradient width in pixels
 */
export interface MarqueeProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
  pauseOnHover?: boolean;
  pauseOnClick?: boolean;
  gap?: number;
  gradient?: boolean;
  gradientColor?: string;
  gradientWidth?: number;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * Marquee 컴포넌트 / Marquee component
 *
 * 무한 스크롤 애니메이션을 제공하는 컴포넌트입니다.
 * 로고, 텍스트, 이미지 등을 자동으로 흐르게 표시합니다.
 *
 * Component that provides infinite scroll animation.
 * Displays logos, text, images, etc. with automatic scrolling.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Marquee>
 *   <span>Item 1</span>
 *   <span>Item 2</span>
 *   <span>Item 3</span>
 * </Marquee>
 *
 * @example
 * // 로고 캐러셀 / Logo carousel
 * <Marquee speed={30} pauseOnHover gradient>
 *   {logos.map(logo => <img key={logo.id} src={logo.src} />)}
 * </Marquee>
 */
const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      children,
      dot: dotProp,
      direction = "left",
      speed = 50,
      pauseOnHover = true,
      pauseOnClick = false,
      gap = 16,
      gradient = true,
      gradientColor = "var(--color-background)",
      gradientWidth = 100,
      style,
      onMouseEnter,
      onMouseLeave,
      onClick,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const isHorizontal = direction === "left" || direction === "right";
    const isReverse = direction === "right" || direction === "down";

    // Measure content size
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const firstChild = container.firstElementChild as HTMLElement;
      if (!firstChild) return;

      const updateSize = () => {
        if (isHorizontal) {
          setContentWidth(firstChild.offsetWidth);
        } else {
          setContentHeight(firstChild.offsetHeight);
        }
      };

      updateSize();

      const resizeObserver = new ResizeObserver(updateSize);
      resizeObserver.observe(firstChild);

      return () => resizeObserver.disconnect();
    }, [isHorizontal, children]);

    // Calculate animation duration
    const duration = isHorizontal
      ? contentWidth / speed
      : contentHeight / speed;

    // Pick animation name based on direction/pause state
    const animationName = isHorizontal
      ? isReverse
        ? "marquee-right"
        : "marquee-left"
      : isReverse
        ? "marquee-down"
        : "marquee-up";

    // Container outer style
    const outerStyle = useMemo<React.CSSProperties>(() => {
      const base: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
      };
      return mergeStyles(base, resolveDot(dotProp), style);
    }, [dotProp, style]);

    // Inner track style (flex row or col + animation inline)
    const trackStyle = useMemo<React.CSSProperties>(() => {
      return {
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        ["--marquee-duration" as string]: `${duration}s`,
        ["--marquee-gap" as string]: `${gap}px`,
        animation: isPaused
          ? undefined
          : `${animationName} ${duration}s linear infinite`,
        animationPlayState: isPaused ? "paused" : "running",
      } as React.CSSProperties;
    }, [isHorizontal, duration, gap, animationName, isPaused]);

    // Shared item strip style
    const stripStyle = useMemo<React.CSSProperties>(
      () => ({
        display: "flex",
        flexShrink: 0,
        flexDirection: isHorizontal ? "row" : "column",
        gap,
      }),
      [isHorizontal, gap],
    );

    // Second strip style (offset margin for seamless loop)
    const stripStyle2 = useMemo<React.CSSProperties>(
      () => ({
        ...stripStyle,
        ...(isHorizontal ? { marginLeft: gap } : { marginTop: gap }),
      }),
      [stripStyle, isHorizontal, gap],
    );

    return (
      <div
        ref={ref}
        style={outerStyle}
        onMouseEnter={(e) => {
          if (pauseOnHover) setIsPaused(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover) setIsPaused(false);
          onMouseLeave?.(e);
        }}
        onClick={(e) => {
          if (pauseOnClick) setIsPaused(!isPaused);
          onClick?.(e);
        }}
        {...props}
      >
        <div ref={containerRef} style={trackStyle}>
          {/* Original content */}
          <div style={stripStyle}>{children}</div>
          {/* Duplicated content for seamless loop */}
          <div style={stripStyle2} aria-hidden="true">
            {children}
          </div>
        </div>

        {/* Gradient overlays as DOM elements (replaces ::before/::after) */}
        {gradient && (
          <>
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                width: gradientWidth,
                zIndex: 10,
                pointerEvents: "none",
                background: `linear-gradient(to right, ${gradientColor}, transparent)`,
              }}
            />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                right: 0,
                width: gradientWidth,
                zIndex: 10,
                pointerEvents: "none",
                background: `linear-gradient(to left, ${gradientColor}, transparent)`,
              }}
            />
          </>
        )}

        {/* CSS keyframe definitions for marquee animations */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes marquee-left {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-50% - ${gap / 2}px)); }
          }
          @keyframes marquee-right {
            from { transform: translateX(calc(-50% - ${gap / 2}px)); }
            to { transform: translateX(0); }
          }
          @keyframes marquee-up {
            from { transform: translateY(0); }
            to { transform: translateY(calc(-50% - ${gap / 2}px)); }
          }
          @keyframes marquee-down {
            from { transform: translateY(calc(-50% - ${gap / 2}px)); }
            to { transform: translateY(0); }
          }
        `,
          }}
        />
      </div>
    );
  },
);

Marquee.displayName = "Marquee";

export { Marquee };
