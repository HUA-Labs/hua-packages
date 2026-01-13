"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

/**
 * Parallax 컴포넌트의 props / Parallax component props
 * @property {number} [speed=0.5] - 패럴렉스 속도 (0-1, 1이 가장 빠름) / Parallax speed (0-1, 1 is fastest)
 * @property {"up" | "down" | "left" | "right"} [direction="up"] - 이동 방향 / Movement direction
 * @property {number} [offset=0] - 시작 오프셋 (px) / Starting offset in pixels
 * @property {boolean} [disabled=false] - 패럴렉스 비활성화 / Disable parallax
 * @property {boolean} [scale=false] - 스케일 효과 추가 / Add scale effect
 * @property {boolean} [opacity=false] - 투명도 효과 추가 / Add opacity effect
 * @property {boolean} [rotate=false] - 회전 효과 추가 / Add rotation effect
 */
export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  direction?: "up" | "down" | "left" | "right";
  offset?: number;
  disabled?: boolean;
  scale?: boolean;
  opacity?: boolean;
  rotate?: boolean;
  rotateDirection?: "cw" | "ccw";
}

/**
 * Parallax 컴포넌트 / Parallax component
 *
 * 스크롤에 반응하여 패럴렉스 효과를 제공하는 컴포넌트입니다.
 * 다양한 방향과 속도, 추가 효과(스케일, 투명도, 회전)를 지원합니다.
 *
 * Component that provides parallax effect in response to scrolling.
 * Supports various directions, speeds, and additional effects (scale, opacity, rotation).
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <Parallax speed={0.3}>
 *   <img src="/background.jpg" alt="background" />
 * </Parallax>
 *
 * @example
 * // 다양한 효과 / With effects
 * <Parallax speed={0.5} scale opacity direction="up">
 *   <div className="h-screen bg-gradient-to-b from-blue-500 to-purple-600" />
 * </Parallax>
 */
const Parallax = React.forwardRef<HTMLDivElement, ParallaxProps>(
  (
    {
      children,
      className,
      speed = 0.5,
      direction = "up",
      offset = 0,
      disabled = false,
      scale = false,
      opacity = false,
      rotate = false,
      rotateDirection = "cw",
      style,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      rotate: 0,
    });

    // Check for reduced motion preference
    const prefersReducedMotion = useReducedMotion();

    const updateTransform = useCallback(() => {
      if (disabled || prefersReducedMotion) return;

      const element = innerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      // Calculate how far through the viewport the element is
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const progress = (viewportCenter - elementCenter) / windowHeight;

      // Calculate movement based on direction
      const movement = progress * speed * 100 + offset;

      let x = 0;
      let y = 0;

      switch (direction) {
        case "up":
          y = -movement;
          break;
        case "down":
          y = movement;
          break;
        case "left":
          x = -movement;
          break;
        case "right":
          x = movement;
          break;
      }

      // Calculate additional effects
      const scaleValue = scale ? 1 + Math.abs(progress) * 0.1 : 1;
      const opacityValue = opacity ? Math.max(0.3, 1 - Math.abs(progress) * 0.5) : 1;
      const rotateValue = rotate
        ? progress * 10 * (rotateDirection === "cw" ? 1 : -1)
        : 0;

      setTransform({ x, y, scale: scaleValue, opacity: opacityValue, rotate: rotateValue });
    }, [disabled, prefersReducedMotion, speed, direction, offset, scale, opacity, rotate, rotateDirection]);

    useEffect(() => {
      if (disabled || prefersReducedMotion) return;

      // Initial calculation
      updateTransform();

      // Listen to scroll events
      const handleScroll = () => {
        requestAnimationFrame(updateTransform);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [updateTransform, disabled, prefersReducedMotion]);

    const combinedStyle: React.CSSProperties = {
      ...style,
      transform: disabled || prefersReducedMotion
        ? undefined
        : `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale}) rotate(${transform.rotate}deg)`,
      opacity: disabled || prefersReducedMotion ? 1 : transform.opacity,
      willChange: disabled || prefersReducedMotion ? undefined : "transform, opacity",
    };

    return (
      <div
        ref={mergeRefs(ref, innerRef)}
        className={merge("transition-none", className)}
        style={combinedStyle}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Parallax.displayName = "Parallax";

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

// Utility to merge refs
function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  };
}

export { Parallax };
