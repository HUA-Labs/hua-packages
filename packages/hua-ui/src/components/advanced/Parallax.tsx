"use client";

import React, { useRef, useEffect, useCallback } from "react";
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
 * @property {boolean} [disableOnMobile=false] - 모바일(768px 미만)에서 자동 비활성화
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
  disableOnMobile?: boolean;
}

/* ────────────────────────────────────────
   Shared scroll listener — 모든 Parallax가
   하나의 scroll/resize 리스너를 공유
   ──────────────────────────────────────── */
type ScrollCallback = () => void;
const subscribers = new Set<ScrollCallback>();
let listening = false;
let rafId = 0;

function tick() {
  subscribers.forEach((cb) => cb());
}

function onScroll() {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(tick);
}

function subscribe(cb: ScrollCallback) {
  subscribers.add(cb);
  if (!listening && subscribers.size > 0) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    listening = true;
  }
  return () => {
    subscribers.delete(cb);
    if (listening && subscribers.size === 0) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(rafId);
      listening = false;
    }
  };
}

/**
 * Parallax 컴포넌트 / Parallax component
 *
 * 스크롤에 반응하여 패럴렉스 효과를 제공하는 컴포넌트입니다.
 * 다양한 방향과 속도, 추가 효과(스케일, 투명도, 회전)를 지원합니다.
 *
 * 성능 최적화:
 * - 모든 인스턴스가 하나의 scroll/resize 리스너 공유
 * - IntersectionObserver로 뷰포트 밖 요소 업데이트 건너뛰기
 * - ref 기반 직접 DOM 조작 (React 리렌더 없음)
 *
 * @component
 * @example
 * <Parallax speed={0.3}>
 *   <img src="/background.jpg" alt="background" />
 * </Parallax>
 *
 * @example
 * // 모바일에서 비활성화
 * <Parallax speed={0.5} disableOnMobile>
 *   <div className="decorative-blob" />
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
      opacity: opacityEffect = false,
      rotate = false,
      rotateDirection = "cw",
      disableOnMobile = false,
      style,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const isVisibleRef = useRef(true);
    const isMobileRef = useRef(false);

    // Check for reduced motion preference
    const prefersReducedMotion = useReducedMotion();

    // Mobile detection
    useEffect(() => {
      if (!disableOnMobile) return;
      const mq = window.matchMedia("(max-width: 767px)");
      isMobileRef.current = mq.matches;

      const handleChange = (e: MediaQueryListEvent) => {
        isMobileRef.current = e.matches;
        // 모바일 전환 시 transform 초기화
        if (e.matches && innerRef.current) {
          innerRef.current.style.transform = "";
          innerRef.current.style.opacity = "";
        }
      };

      mq.addEventListener("change", handleChange);
      return () => mq.removeEventListener("change", handleChange);
    }, [disableOnMobile]);

    const updateTransform = useCallback(() => {
      if (disabled || prefersReducedMotion) return;
      if (disableOnMobile && isMobileRef.current) return;
      if (!isVisibleRef.current) return;

      const element = innerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const progress = (viewportCenter - elementCenter) / windowHeight;

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

      const scaleValue = scale ? 1 + Math.abs(progress) * 0.1 : 1;
      const opacityValue = opacityEffect ? Math.max(0.3, 1 - Math.abs(progress) * 0.5) : 1;
      const rotateValue = rotate
        ? progress * 10 * (rotateDirection === "cw" ? 1 : -1)
        : 0;

      // 직접 DOM 조작 — React 리렌더 없음
      element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scaleValue}) rotate(${rotateValue}deg)`;
      if (opacityEffect) {
        element.style.opacity = String(opacityValue);
      }
    }, [disabled, prefersReducedMotion, speed, direction, offset, scale, opacityEffect, rotate, rotateDirection, disableOnMobile]);

    // IntersectionObserver — 뷰포트 밖이면 업데이트 건너뛰기
    useEffect(() => {
      if (disabled || prefersReducedMotion) return;
      const element = innerRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          isVisibleRef.current = entry.isIntersecting;
        },
        { rootMargin: "100px" }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [disabled, prefersReducedMotion]);

    // 공유 scroll 리스너 구독
    useEffect(() => {
      if (disabled || prefersReducedMotion) return;

      // Initial calculation
      updateTransform();

      return subscribe(updateTransform);
    }, [updateTransform, disabled, prefersReducedMotion]);

    const isActive = !disabled && !prefersReducedMotion;

    const combinedStyle: React.CSSProperties = {
      ...style,
      willChange: isActive ? "transform, opacity" : undefined,
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
  const matchRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    matchRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      matchRef.current = e.matches;
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return matchRef.current;
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
