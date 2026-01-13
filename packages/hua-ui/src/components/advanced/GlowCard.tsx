"use client";

import React, { useRef, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

/**
 * GlowCard 컴포넌트의 props / GlowCard component props
 * @property {string} [glowColor="rgba(120, 119, 198, 0.3)"] - 글로우 색상 / Glow color
 * @property {number} [glowSize=400] - 글로우 크기 (px) / Glow size in pixels
 * @property {number} [glowOpacity=0.6] - 글로우 투명도 / Glow opacity
 * @property {boolean} [border=true] - 글로우 보더 표시 / Show glow border
 * @property {string} [borderColor] - 보더 색상 (기본: glowColor) / Border color (default: glowColor)
 */
export interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string;
  glowSize?: number;
  glowOpacity?: number;
  border?: boolean;
  borderColor?: string;
}

/**
 * GlowCard 컴포넌트 / GlowCard component
 *
 * 마우스를 따라다니는 글로우 효과가 있는 카드 컴포넌트입니다.
 * SaaS 랜딩 페이지, 프리미엄 UI에 적합합니다.
 *
 * Card component with mouse-following glow effect.
 * Perfect for SaaS landing pages and premium UI.
 *
 * @component
 * @example
 * <GlowCard glowColor="rgba(59, 130, 246, 0.4)">
 *   <h3>Premium Feature</h3>
 *   <p>This is a premium feature card</p>
 * </GlowCard>
 */
const GlowCard = React.forwardRef<HTMLDivElement, GlowCardProps>(
  (
    {
      children,
      className,
      glowColor = "rgba(120, 119, 198, 0.3)",
      glowSize = 400,
      glowOpacity = 0.6,
      border = true,
      borderColor,
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

    const glowStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      opacity: isHovered ? glowOpacity : 0,
      background: `radial-gradient(${glowSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 40%)`,
      transition: "opacity 0.3s ease",
      pointerEvents: "none",
    };

    const borderStyle: React.CSSProperties = border
      ? {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: "inherit",
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${glowSize / 2}px circle at ${mousePosition.x}px ${mousePosition.y}px, ${borderColor || glowColor}, transparent 40%)`,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px",
        }
      : {};

    return (
      <div
        ref={mergeRefs(ref, cardRef)}
        className={merge(
          "relative overflow-hidden rounded-xl bg-card border border-border p-6",
          "transition-all duration-300",
          isHovered && "border-transparent",
          className
        )}
        style={style}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {/* Glow effect */}
        <div style={glowStyle} aria-hidden="true" />

        {/* Border glow */}
        {border && <div style={borderStyle as React.CSSProperties} aria-hidden="true" />}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlowCard.displayName = "GlowCard";

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

export { GlowCard };
