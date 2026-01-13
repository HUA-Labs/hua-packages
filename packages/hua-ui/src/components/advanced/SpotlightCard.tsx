"use client";

import React, { useRef, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

/**
 * SpotlightCard 컴포넌트의 props / SpotlightCard component props
 * @property {string} [spotlightColor="rgba(255, 255, 255, 0.1)"] - 스포트라이트 색상 / Spotlight color
 * @property {number} [spotlightSize=300] - 스포트라이트 크기 (px) / Spotlight size in pixels
 * @property {boolean} [gradient=true] - 그라디언트 배경 효과 / Gradient background effect
 * @property {string} [gradientFrom="rgba(255, 255, 255, 0.05)"] - 그라디언트 시작 색상 / Gradient start color
 * @property {string} [gradientTo="transparent"] - 그라디언트 끝 색상 / Gradient end color
 */
export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  spotlightColor?: string;
  spotlightSize?: number;
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * SpotlightCard 컴포넌트 / SpotlightCard component
 *
 * 마우스 위치에 스포트라이트 효과를 표시하는 프리미엄 카드 컴포넌트입니다.
 * 다크 테마 랜딩 페이지, 프리미엄 UI에 적합합니다.
 *
 * Premium card component that displays a spotlight effect at mouse position.
 * Perfect for dark theme landing pages and premium UI.
 *
 * @component
 * @example
 * <SpotlightCard className="bg-gray-900 text-white p-8">
 *   <h3>Premium Feature</h3>
 *   <p>Discover our exclusive features</p>
 * </SpotlightCard>
 */
const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      children,
      className,
      spotlightColor = "rgba(255, 255, 255, 0.1)",
      spotlightSize = 300,
      gradient = true,
      gradientFrom = "rgba(255, 255, 255, 0.05)",
      gradientTo = "transparent",
      style,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      },
      []
    );

    const spotlightStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      opacity: isHovered ? 1 : 0,
      background: `radial-gradient(${spotlightSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 60%)`,
      transition: "opacity 0.4s ease",
      pointerEvents: "none",
    };

    const gradientOverlayStyle: React.CSSProperties = gradient
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
          pointerEvents: "none",
        }
      : {};

    return (
      <div
        ref={mergeRefs(ref, cardRef)}
        className={merge(
          "relative overflow-hidden rounded-xl",
          "bg-gray-900 border border-gray-800",
          "transition-all duration-300",
          isHovered && "border-gray-700 shadow-2xl shadow-black/20",
          className
        )}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Gradient overlay */}
        {gradient && <div style={gradientOverlayStyle} aria-hidden="true" />}

        {/* Spotlight effect */}
        <div style={spotlightStyle} aria-hidden="true" />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";

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

export { SpotlightCard };
