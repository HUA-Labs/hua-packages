"use client";

import React, { useEffect, useState } from "react";
import { merge } from "../../lib/utils";

/**
 * AnimatedGradient 컴포넌트의 props / AnimatedGradient component props
 * @property {string[]} [colors] - 그라디언트 색상 배열 / Array of gradient colors
 * @property {number} [speed=3] - 애니메이션 속도 (초) / Animation speed in seconds
 * @property {boolean} [blur=true] - 블러 효과 / Blur effect
 * @property {number} [blurAmount=100] - 블러 양 (px) / Blur amount in pixels
 * @property {"linear" | "radial" | "conic" | "mesh"} [type="mesh"] - 그라디언트 타입 / Gradient type
 * @property {boolean} [animate=true] - 애니메이션 활성화 / Enable animation
 */
export interface AnimatedGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[];
  speed?: number;
  blur?: boolean;
  blurAmount?: number;
  type?: "linear" | "radial" | "conic" | "mesh";
  animate?: boolean;
}

const defaultColors = [
  "#ff0080",
  "#7928ca",
  "#0070f3",
  "#00dfd8",
];

/**
 * AnimatedGradient 컴포넌트 / AnimatedGradient component
 *
 * 아름다운 애니메이션 그라디언트 배경을 제공합니다.
 * 히어로 섹션, 배경, 오버레이에 적합합니다.
 *
 * Provides beautiful animated gradient backgrounds.
 * Perfect for hero sections, backgrounds, and overlays.
 *
 * @component
 * @example
 * // 메쉬 그라디언트 / Mesh gradient
 * <AnimatedGradient type="mesh" className="absolute inset-0 -z-10" />
 *
 * @example
 * // 커스텀 색상 / Custom colors
 * <AnimatedGradient
 *   colors={["#667eea", "#764ba2", "#f093fb"]}
 *   speed={5}
 *   type="conic"
 * />
 */
const AnimatedGradient = React.forwardRef<HTMLDivElement, AnimatedGradientProps>(
  (
    {
      children,
      className,
      colors = defaultColors,
      speed = 3,
      blur = true,
      blurAmount = 100,
      type = "mesh",
      animate = true,
      style,
      ...props
    },
    ref
  ) => {
    const [mounted, setMounted] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const shouldAnimate = animate && !prefersReducedMotion;

    useEffect(() => {
      setMounted(true);
    }, []);

    const renderGradient = () => {
      switch (type) {
        case "linear":
          return (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  ${shouldAnimate ? "var(--gradient-angle, 0deg)" : "135deg"},
                  ${colors.join(", ")}
                )`,
                animation: shouldAnimate ? `gradient-rotate ${speed}s linear infinite` : undefined,
              }}
            />
          );

        case "radial":
          return (
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(
                  circle at ${shouldAnimate ? "var(--gradient-x, 50%) var(--gradient-y, 50%)" : "50% 50%"},
                  ${colors.join(", ")}
                )`,
                animation: shouldAnimate ? `gradient-move ${speed}s ease-in-out infinite` : undefined,
              }}
            />
          );

        case "conic":
          return (
            <div
              className="absolute inset-0"
              style={{
                background: `conic-gradient(
                  from ${shouldAnimate ? "var(--gradient-angle, 0deg)" : "0deg"} at 50% 50%,
                  ${colors.join(", ")},
                  ${colors[0]}
                )`,
                animation: shouldAnimate ? `gradient-spin ${speed}s linear infinite` : undefined,
              }}
            />
          );

        case "mesh":
        default:
          // Render blobs only after mount to prevent SSR hydration mismatch
          // (Math.sin/cos produce floating-point values that differ between server and client)
          if (!mounted) return null;
          return (
            <>
              {colors.map((color, index) => {
                const angle = (360 / colors.length) * index;
                const delay = (speed / colors.length) * index;
                return (
                  <div
                    key={index}
                    className="absolute rounded-full mix-blend-screen"
                    style={{
                      width: "60%",
                      height: "60%",
                      background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                      top: `${30 + Math.sin((angle * Math.PI) / 180) * 20}%`,
                      left: `${30 + Math.cos((angle * Math.PI) / 180) * 20}%`,
                      animation: shouldAnimate
                        ? `gradient-blob ${speed}s ease-in-out infinite`
                        : undefined,
                      animationDelay: shouldAnimate ? `${-delay}s` : undefined,
                    }}
                  />
                );
              })}
            </>
          );
      }
    };

    return (
      <div
        ref={ref}
        className={merge(
          "relative overflow-hidden",
          className
        )}
        style={style}
        {...props}
      >
        {/* Gradient layer */}
        <div
          className="absolute inset-0"
          style={{
            filter: blur ? `blur(${blurAmount}px)` : undefined,
          }}
        >
          {renderGradient()}
        </div>

        {/* Content */}
        {children && <div className="relative z-10">{children}</div>}

        {/* Animation keyframes - injected as style element */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes gradient-rotate {
            0% { --gradient-angle: 0deg; }
            100% { --gradient-angle: 360deg; }
          }
          @keyframes gradient-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes gradient-move {
            0%, 100% { --gradient-x: 0%; --gradient-y: 0%; }
            25% { --gradient-x: 100%; --gradient-y: 0%; }
            50% { --gradient-x: 100%; --gradient-y: 100%; }
            75% { --gradient-x: 0%; --gradient-y: 100%; }
          }
          @keyframes gradient-blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(20%, -20%) scale(1.1); }
            50% { transform: translate(0, 20%) scale(0.9); }
            75% { transform: translate(-20%, -10%) scale(1.05); }
          }
        `}} />
      </div>
    );
  }
);

AnimatedGradient.displayName = "AnimatedGradient";

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

export { AnimatedGradient };
