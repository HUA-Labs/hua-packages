"use client";

import React, { useRef, useEffect, useState } from "react";
import { merge } from "../../lib/utils";

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
export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
  pauseOnHover?: boolean;
  pauseOnClick?: boolean;
  gap?: number;
  gradient?: boolean;
  gradientColor?: string;
  gradientWidth?: number;
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
      className,
      direction = "left",
      speed = 50,
      pauseOnHover = true,
      pauseOnClick = false,
      gap = 16,
      gradient = true,
      gradientColor = "hsl(var(--background))",
      gradientWidth = 100,
      style,
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

    const animationStyle: React.CSSProperties = {
      ["--marquee-duration" as string]: `${duration}s`,
      ["--marquee-gap" as string]: `${gap}px`,
    };

    // Gradient styles
    const gradientStyle = gradient
      ? {
          ["--gradient-color" as string]: gradientColor,
          ["--gradient-width" as string]: `${gradientWidth}px`,
        }
      : {};

    return (
      <div
        ref={ref}
        className={merge(
          "relative overflow-hidden",
          gradient && "marquee-gradient",
          className
        )}
        style={{ ...style, ...gradientStyle }}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
        onClick={() => pauseOnClick && setIsPaused(!isPaused)}
        {...props}
      >
        <div
          ref={containerRef}
          className={merge(
            "flex",
            isHorizontal ? "flex-row" : "flex-col",
            isPaused ? "animate-pause" : "",
            isHorizontal
              ? isReverse
                ? "animate-marquee-right"
                : "animate-marquee-left"
              : isReverse
              ? "animate-marquee-down"
              : "animate-marquee-up"
          )}
          style={animationStyle}
        >
          {/* Original content */}
          <div
            className={merge(
              "flex shrink-0",
              isHorizontal ? "flex-row" : "flex-col"
            )}
            style={{ gap }}
          >
            {children}
          </div>
          {/* Duplicated content for seamless loop */}
          <div
            className={merge(
              "flex shrink-0",
              isHorizontal ? "flex-row" : "flex-col"
            )}
            style={{ gap, [isHorizontal ? "marginLeft" : "marginTop"]: gap }}
            aria-hidden="true"
          >
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
