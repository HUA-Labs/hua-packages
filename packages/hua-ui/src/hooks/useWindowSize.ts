"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * useWindowSize 훅의 반환값 / useWindowSize hook return value
 */
export interface UseWindowSizeReturn {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

/**
 * useWindowSize 훅의 옵션 / useWindowSize hook options
 */
export interface UseWindowSizeOptions {
  throttle?: number;
  mobileBreakpoint?: number;
  tabletBreakpoint?: number;
}

/**
 * useWindowSize 훅 / useWindowSize hook
 *
 * 윈도우 크기를 추적하는 훅입니다.
 * 반응형 애니메이션, 조건부 렌더링 등에 사용합니다.
 *
 * Hook that tracks window size.
 * Used for responsive animations, conditional rendering, etc.
 *
 * @example
 * const { width, height, isMobile } = useWindowSize();
 *
 * return (
 *   <div style={{ fontSize: isMobile ? "14px" : "16px" }}>
 *     Window: {width} x {height}
 *   </div>
 * );
 */
export function useWindowSize(options: UseWindowSizeOptions = {}): UseWindowSizeReturn {
  const {
    throttle = 100,
    mobileBreakpoint = 768,
    tabletBreakpoint = 1024,
  } = options;

  const [size, setSize] = useState<UseWindowSizeReturn>({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  const updateSize = useCallback(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    setSize({
      width,
      height,
      isMobile: width < mobileBreakpoint,
      isTablet: width >= mobileBreakpoint && width < tabletBreakpoint,
      isDesktop: width >= tabletBreakpoint,
    });
  }, [mobileBreakpoint, tabletBreakpoint]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Initial update
    updateSize();

    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateSize, throttle);
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [updateSize, throttle]);

  return size;
}

export default useWindowSize;
