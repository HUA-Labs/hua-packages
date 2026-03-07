"use client";

import React, { useRef, useState, useCallback, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useMotionConfig } from "../../context/MotionConfigContext";

/** Base card styles applied to every SpotlightCard */
const BASE_STYLE: React.CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: "0.75rem",
  backgroundColor: "rgb(17 24 39)",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "rgb(31 41 55)",
  transition: "border-color 300ms ease, box-shadow 300ms ease",
};

const HOVERED_STYLE: React.CSSProperties = {
  borderColor: "rgb(55 65 81)",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)",
};

/**
 * SpotlightCard component props
 * @property {string} [spotlightColor="rgba(255, 255, 255, 0.1)"] - Spotlight color
 * @property {number} [spotlightSize=300] - Spotlight size in pixels
 * @property {boolean} [gradient=true] - Gradient background effect
 * @property {string} [gradientFrom="rgba(255, 255, 255, 0.05)"] - Gradient start color
 * @property {string} [gradientTo="transparent"] - Gradient end color
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - Additional inline styles (merged last)
 */
export interface SpotlightCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  spotlightColor?: string;
  spotlightSize?: number;
  gradient?: boolean;
  gradientFrom?: string;
  gradientTo?: string;
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * SpotlightCard component
 *
 * Premium card component that displays a spotlight effect at mouse position.
 * Perfect for dark theme landing pages and premium UI.
 *
 * @component
 * @example
 * <SpotlightCard dot="p-8" style={{ background: 'rgb(17 24 39)' }}>
 *   <h3>Premium Feature</h3>
 *   <p>Discover our exclusive features</p>
 * </SpotlightCard>
 */
const SpotlightCard = React.forwardRef<HTMLDivElement, SpotlightCardProps>(
  (
    {
      children,
      dot: dotProp,
      spotlightColor = "rgba(255, 255, 255, 0.1)",
      spotlightSize = 300,
      gradient = true,
      gradientFrom = "rgba(255, 255, 255, 0.05)",
      gradientTo = "transparent",
      style,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const { enableAnimations } = useMotionConfig();
    const motionDisabled = prefersReducedMotion || !enableAnimations;

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseMove?.(e);
        if (motionDisabled) return;
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      },
      [motionDisabled, onMouseMove]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(e);
        setIsHovered(true);
      },
      [onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        onMouseLeave?.(e);
        setIsHovered(false);
      },
      [onMouseLeave]
    );

    const computedStyle = useMemo(
      () =>
        mergeStyles(
          BASE_STYLE,
          isHovered ? HOVERED_STYLE : undefined,
          resolveDot(dotProp),
          style
        ),
      [isHovered, dotProp, style]
    );

    const spotlightStyle = useMemo(
      (): React.CSSProperties => ({
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
      }),
      [isHovered, spotlightSize, mousePosition.x, mousePosition.y, spotlightColor]
    );

    const gradientOverlayStyle = useMemo(
      (): React.CSSProperties | undefined =>
        gradient
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
          : undefined,
      [gradient, gradientFrom, gradientTo]
    );

    return (
      <div
        ref={mergeRefs(ref, cardRef)}
        style={computedStyle}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Gradient overlay */}
        {gradient && gradientOverlayStyle && (
          <div style={gradientOverlayStyle} aria-hidden="true" />
        )}

        {/* Spotlight effect */}
        <div style={spotlightStyle} aria-hidden="true" />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10 }}>{children}</div>
      </div>
    );
  }
);

SpotlightCard.displayName = "SpotlightCard";

/** Utility to merge refs */
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
