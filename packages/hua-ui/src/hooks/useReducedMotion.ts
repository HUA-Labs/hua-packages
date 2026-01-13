"use client";

import { useState, useEffect } from "react";

/**
 * useReducedMotion 훅 / useReducedMotion hook
 *
 * 사용자의 모션 감소 선호 설정을 감지하는 훅입니다.
 * 접근성을 위해 애니메이션을 조건부로 적용할 때 사용합니다.
 *
 * Hook that detects user's reduced motion preference.
 * Used for conditionally applying animations for accessibility.
 *
 * @returns {boolean} 모션 감소 선호 여부 / Whether reduced motion is preferred
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <div
 *     className={prefersReducedMotion ? "" : "animate-bounce"}
 *     style={{ transition: prefersReducedMotion ? "none" : "all 0.3s" }}
 *   >
 *     Content
 *   </div>
 * );
 *
 * @example
 * // 조건부 애니메이션 / Conditional animation
 * const prefersReducedMotion = useReducedMotion();
 *
 * const variants = {
 *   initial: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
 *   animate: { opacity: 1, y: 0 },
 * };
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
