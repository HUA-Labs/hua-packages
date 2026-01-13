"use client";

import React, { useRef, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

/**
 * TiltCard 컴포넌트의 props / TiltCard component props
 * @property {number} [maxTilt=15] - 최대 기울기 각도 / Maximum tilt angle in degrees
 * @property {number} [perspective=1000] - 원근감 / Perspective value
 * @property {number} [scale=1.02] - 호버시 스케일 / Scale on hover
 * @property {number} [speed=400] - 전환 속도 (ms) / Transition speed in milliseconds
 * @property {boolean} [glare=true] - 글레어 효과 / Glare effect
 * @property {number} [maxGlare=0.3] - 최대 글레어 투명도 / Maximum glare opacity
 * @property {boolean} [reset=true] - 마우스 떠나면 리셋 / Reset on mouse leave
 */
export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  glare?: boolean;
  maxGlare?: number;
  reset?: boolean;
}

/**
 * TiltCard 컴포넌트 / TiltCard component
 *
 * 마우스 움직임에 따라 3D 틸트 효과를 제공하는 카드 컴포넌트입니다.
 * 제품 카드, 프로필 카드, 갤러리에 적합합니다.
 *
 * Card component that provides 3D tilt effect based on mouse movement.
 * Perfect for product cards, profile cards, and galleries.
 *
 * @component
 * @example
 * <TiltCard className="bg-white shadow-lg rounded-xl p-6">
 *   <img src="/product.jpg" alt="Product" />
 *   <h3>Premium Product</h3>
 * </TiltCard>
 */
const TiltCard = React.forwardRef<HTMLDivElement, TiltCardProps>(
  (
    {
      children,
      className,
      maxTilt = 15,
      perspective = 1000,
      scale = 1.02,
      speed = 400,
      glare = true,
      maxGlare = 0.3,
      reset = true,
      style,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
    });
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Calculate rotation based on mouse position
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;

        const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
        const rotateX = -(mouseY / (rect.height / 2)) * maxTilt;

        setTransform({
          rotateX,
          rotateY,
          scale,
        });

        // Calculate glare position (0-100%)
        const glareX = ((e.clientX - rect.left) / rect.width) * 100;
        const glareY = ((e.clientY - rect.top) / rect.height) * 100;
        setGlarePosition({ x: glareX, y: glareY });
      },
      [maxTilt, scale]
    );

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      if (reset) {
        setTransform({
          rotateX: 0,
          rotateY: 0,
          scale: 1,
        });
      }
    };

    const cardStyle: React.CSSProperties = {
      ...style,
      perspective: `${perspective}px`,
    };

    const innerStyle: React.CSSProperties = {
      transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${transform.scale})`,
      transition: isHovered ? "none" : `transform ${speed}ms ease-out`,
      transformStyle: "preserve-3d",
    };

    const glareStyle: React.CSSProperties = {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: "inherit",
      background: `linear-gradient(
        ${Math.atan2(glarePosition.y - 50, glarePosition.x - 50) * (180 / Math.PI) + 90}deg,
        rgba(255, 255, 255, ${isHovered ? maxGlare : 0}) 0%,
        transparent 80%
      )`,
      transition: isHovered ? "opacity 0.1s ease-out" : `opacity ${speed}ms ease-out`,
      pointerEvents: "none",
      opacity: isHovered ? 1 : 0,
    };

    return (
      <div
        ref={mergeRefs(ref, cardRef)}
        className={merge("relative", className)}
        style={cardStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <div style={innerStyle} className="relative">
          {children}

          {/* Glare effect */}
          {glare && <div style={glareStyle} aria-hidden="true" />}
        </div>
      </div>
    );
  }
);

TiltCard.displayName = "TiltCard";

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

export { TiltCard };
