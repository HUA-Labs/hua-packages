"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { useReducedMotion } from "../../hooks/useReducedMotion";

/**
 * ImageReveal 컴포넌트의 props / ImageReveal component props
 * @property {string} src - 이미지 src / Image src
 * @property {string} alt - 이미지 alt / Image alt
 * @property {"left"|"right"|"up"|"down"} [direction="left"] - 공개 방향 / Reveal direction
 * @property {number} [threshold=0.3] - 공개 시작 임계값 (0-1) / Reveal threshold (0-1)
 * @property {string} [height="400px"] - 이미지 높이 / Image height
 * @property {string} [overlayColor] - 오버레이 색상 / Overlay color
 * @property {string} [dot] - dot utility string for additional styles
 * @property {React.CSSProperties} [style] - inline style overrides
 */
export interface ImageRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  /** 이미지 src */
  src: string;
  /** 이미지 alt */
  alt: string;
  /** 공개 방향 @default 'left' */
  direction?: "left" | "right" | "up" | "down";
  /** 공개 시작 임계값 (0-1) @default 0.3 */
  threshold?: number;
  /** 이미지 높이 @default '400px' */
  height?: string;
  /** 오버레이 색상 */
  overlayColor?: string;
  /** dot utility string for additional styles */
  dot?: string;
  /** inline style overrides */
  style?: React.CSSProperties;
}

/**
 * ImageReveal - 스크롤 기반 이미지 공개 컴포넌트
 *
 * TextReveal에서 영감 받은 이미지 공개 효과.
 * clip-path를 사용하여 스크롤에 따라 이미지가 점진적으로 드러남.
 *
 * @component
 * @example
 * <ImageReveal src="/photo.jpg" alt="Scenic view" direction="left" />
 *
 * @example
 * <ImageReveal src="/hero.jpg" alt="Hero image" direction="up" height="600px" overlayColor="rgba(0,0,0,0.4)" />
 */
const ImageReveal = React.forwardRef<HTMLDivElement, ImageRevealProps>(
  (
    {
      src,
      alt,
      direction = "left",
      threshold = 0.3,
      height = "400px",
      overlayColor,
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    const prefersReducedMotion = useReducedMotion();

    const updateProgress = useCallback(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const start = vh * (1 - threshold);
      const end = vh * threshold;
      const elementCenter = rect.top + rect.height / 2;

      let p = 0;
      if (elementCenter <= start && elementCenter >= end) {
        p = (start - elementCenter) / (start - end);
      } else if (elementCenter < end) {
        p = 1;
      }

      setProgress(Math.max(0, Math.min(1, p)));
    }, [threshold]);

    useEffect(() => {
      if (prefersReducedMotion) {
        setProgress(1);
        return;
      }

      updateProgress();
      const handleScroll = () => requestAnimationFrame(updateProgress);

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [updateProgress, prefersReducedMotion]);

    const clipPath = getClipPath(direction, progress);

    const containerStyle = useMemo(() => mergeStyles(
      {
        position: "relative",
        overflow: "hidden",
        height,
      },
      resolveDot(dotProp),
      style,
    ), [height, dotProp, style]);

    const imgStyle = useMemo<React.CSSProperties>(() => ({
      position: "absolute",
      inset: 0,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      clipPath,
      transition: "clip-path 0.1s ease-out",
    }), [clipPath]);

    const overlayStyle = useMemo<React.CSSProperties>(() => ({
      position: "absolute",
      inset: 0,
      pointerEvents: "none",
      background: overlayColor,
      opacity: 1 - progress,
      transition: "opacity 0.3s ease-out",
    }), [overlayColor, progress]);

    return (
      <div
        ref={mergeRefs(ref, containerRef)}
        style={containerStyle}
        {...props}
      >
        <img
          src={src}
          alt={alt}
          style={imgStyle}
        />
        {overlayColor && (
          <div
            style={overlayStyle}
            aria-hidden="true"
          />
        )}
      </div>
    );
  }
);

ImageReveal.displayName = "ImageReveal";

function getClipPath(direction: string, progress: number): string {
  switch (direction) {
    case "left":
      return `inset(0 ${100 - progress * 100}% 0 0)`;
    case "right":
      return `inset(0 0 0 ${100 - progress * 100}%)`;
    case "up":
      return `inset(0 0 ${100 - progress * 100}% 0)`;
    case "down":
      return `inset(${100 - progress * 100}% 0 0 0)`;
    default:
      return `inset(0 ${100 - progress * 100}% 0 0)`;
  }
}

function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((r) => {
      if (typeof r === "function") r(value);
      else if (r && typeof r === "object")
        (r as React.MutableRefObject<T | null>).current = value;
    });
  };
}

export { ImageReveal };
