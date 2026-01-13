"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useScrollProgress 훅의 옵션 / useScrollProgress hook options
 * @property {"page" | "element"} [target="page"] - 추적 대상 / Tracking target
 * @property {number} [throttle=16] - 쓰로틀 간격 (ms) / Throttle interval
 */
export interface UseScrollProgressOptions {
  target?: "page" | "element";
  throttle?: number;
}

/**
 * useScrollProgress 훅의 반환값 / useScrollProgress hook return value
 */
export interface UseScrollProgressReturn<T extends HTMLElement = HTMLElement> {
  ref: React.RefObject<T | null>;
  progress: number;
  scrollY: number;
  scrollX: number;
  isScrolling: boolean;
  direction: "up" | "down" | null;
}

/**
 * useScrollProgress 훅 / useScrollProgress hook
 *
 * 페이지 또는 요소의 스크롤 진행률을 추적하는 훅입니다.
 * 스크롤 기반 애니메이션, 진행률 표시 등에 사용합니다.
 *
 * Hook that tracks scroll progress of page or element.
 * Used for scroll-based animations, progress indicators, etc.
 *
 * @example
 * // 페이지 스크롤 / Page scroll
 * const { progress, direction } = useScrollProgress();
 *
 * return (
 *   <div style={{ width: `${progress * 100}%` }} className="progress-bar" />
 * );
 *
 * @example
 * // 요소 스크롤 / Element scroll
 * const { ref, progress } = useScrollProgress({ target: "element" });
 *
 * return (
 *   <div ref={ref} className="overflow-auto h-[400px]">
 *     <p>Progress: {Math.round(progress * 100)}%</p>
 *   </div>
 * );
 */
export function useScrollProgress<T extends HTMLElement = HTMLElement>(
  options: UseScrollProgressOptions = {}
): UseScrollProgressReturn<T> {
  const { target = "page", throttle = 16 } = options;

  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [scrollX, setScrollX] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [direction, setDirection] = useState<"up" | "down" | null>(null);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastUpdate = useRef(0);

  const calculateProgress = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < throttle) return;
    lastUpdate.current = now;

    if (target === "page") {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const newProgress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

      setProgress(newProgress);
      setScrollY(scrollTop);
      setScrollX(window.scrollX);
      setDirection(scrollTop > lastScrollY.current ? "down" : "up");
      lastScrollY.current = scrollTop;
    } else if (ref.current) {
      const element = ref.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const newProgress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0;

      setProgress(newProgress);
      setScrollY(scrollTop);
      setScrollX(element.scrollLeft);
      setDirection(scrollTop > lastScrollY.current ? "down" : "up");
      lastScrollY.current = scrollTop;
    }

    setIsScrolling(true);
    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, [target, throttle]);

  useEffect(() => {
    if (target === "page") {
      // Initial calculation
      calculateProgress();

      window.addEventListener("scroll", calculateProgress, { passive: true });
      window.addEventListener("resize", calculateProgress, { passive: true });

      return () => {
        window.removeEventListener("scroll", calculateProgress);
        window.removeEventListener("resize", calculateProgress);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    } else {
      const element = ref.current;
      if (!element) return;

      element.addEventListener("scroll", calculateProgress, { passive: true });

      return () => {
        element.removeEventListener("scroll", calculateProgress);
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    }
  }, [target, calculateProgress]);

  return { ref, progress, scrollY, scrollX, isScrolling, direction };
}

export default useScrollProgress;
