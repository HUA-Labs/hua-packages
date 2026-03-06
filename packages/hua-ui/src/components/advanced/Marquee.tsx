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
 * @property {string} [gradientColor="hsl(var(--background))"] - 그라디언트 색상 / Gradient color
 * @property {number} [gradientWidth=100] - 그라디언트 너비 (px) / Gradient width in pixels
 */
export interface MarqueeProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
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
      gradientColor = "hsl(var(--background))",
      gradientWidth = 100,
      style,
      onMouseEnter,
      onMouseLeave,
      onClick,
      ...props
    },
    ref
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

    // Pick animation class name based on direction/pause state
    const animationClass = isPaused
      ? "animate-pause"
      : isHorizontal
      ? isReverse
        ? "animate-marquee-right"
        : "animate-marquee-left"
      : isReverse
      ? "animate-marquee-down"
      : "animate-marquee-up";

    // Container outer style
    const outerStyle = useMemo<React.CSSProperties>(() => {
      const base: React.CSSProperties = {
        position: "relative",
        overflow: "hidden",
      };
      const gradientVars = gradient
        ? ({
            ["--gradient-color" as string]: gradientColor,
            ["--gradient-width" as string]: `${gradientWidth}px`,
          } as React.CSSProperties)
        : {};
      return mergeStyles(base, gradientVars, resolveDot(dotProp), style);
    }, [gradient, gradientColor, gradientWidth, dotProp, style]);

    // Inner track style (flex row or col + animation vars)
    const trackStyle = useMemo<React.CSSProperties>(() => {
      return {
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        ["--marquee-duration" as string]: `${duration}s`,
        ["--marquee-gap" as string]: `${gap}px`,
      } as React.CSSProperties;
    }, [isHorizontal, duration, gap]);

    // Shared item strip style
    const stripStyle = useMemo<React.CSSProperties>(() => ({
      display: "flex",
      flexShrink: 0,
      flexDirection: isHorizontal ? "row" : "column",
      gap,
    }), [isHorizontal, gap]);

    // Second strip style (offset margin for seamless loop)
    const stripStyle2 = useMemo<React.CSSProperties>(() => ({
      ...stripStyle,
      ...(isHorizontal ? { marginLeft: gap } : { marginTop: gap }),
    }), [stripStyle, isHorizontal, gap]);

    return (
      <div
        ref={ref}
        className={gradient ? "marquee-gradient" : undefined}
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
        <div
          ref={containerRef}
          className={animationClass}
          style={trackStyle}
        >
          {/* Original content */}
          <div style={stripStyle}>
            {children}
          </div>
          {/* Duplicated content for seamless loop */}
          <div style={stripStyle2} aria-hidden="true">
            {children}
          </div>
        </div>

        {/* CSS for animations - injected as style element */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes marquee-left {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-50% - var(--marquee-gap) / 2)); }
          }
          @keyframes marquee-right {
            from { transform: translateX(calc(-50% - var(--marquee-gap) / 2)); }
            to { transform: translateX(0); }
          }
          @keyframes marquee-up {
            from { transform: translateY(0); }
            to { transform: translateY(calc(-50% - var(--marquee-gap) / 2)); }
          }
          @keyframes marquee-down {
            from { transform: translateY(calc(-50% - var(--marquee-gap) / 2)); }
            to { transform: translateY(0); }
          }
          .animate-marquee-left { animation: marquee-left var(--marquee-duration) linear infinite; }
          .animate-marquee-right { animation: marquee-right var(--marquee-duration) linear infinite; }
          .animate-marquee-up { animation: marquee-up var(--marquee-duration) linear infinite; }
          .animate-marquee-down { animation: marquee-down var(--marquee-duration) linear infinite; }
          .animate-pause { animation-play-state: paused !important; }
          .marquee-gradient::before, .marquee-gradient::after {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            width: var(--gradient-width);
            z-index: 10;
            pointer-events: none;
          }
          .marquee-gradient::before {
            left: 0;
            background: linear-gradient(to right, var(--gradient-color), transparent);
          }
          .marquee-gradient::after {
            right: 0;
            background: linear-gradient(to left, var(--gradient-color), transparent);
          }
        `}} />
      </div>
    );
  }
);

Marquee.displayName = "Marquee";

export { Marquee };
