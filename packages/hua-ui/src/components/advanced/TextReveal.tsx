"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

/**
 * TextReveal 컴포넌트의 props / TextReveal component props
 * @property {string} text - 표시할 텍스트 / Text to display
 * @property {string} [revealColor="currentColor"] - 공개된 텍스트 색상 / Revealed text color
 * @property {string} [hiddenColor="rgba(128, 128, 128, 0.3)"] - 숨겨진 텍스트 색상 / Hidden text color
 * @property {number} [threshold=0.5] - 공개 시작 임계값 (0-1) / Reveal threshold (0-1)
 * @property {boolean} [byWord=false] - 단어별 공개 / Reveal by word
 * @property {boolean} [byChar=false] - 글자별 공개 / Reveal by character
 */
export interface TextRevealProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  text: string;
  revealColor?: string;
  hiddenColor?: string;
  threshold?: number;
  byWord?: boolean;
  byChar?: boolean;
}

/**
 * TextReveal 컴포넌트 / TextReveal component
 *
 * 스크롤에 따라 텍스트가 점진적으로 공개되는 효과를 제공합니다.
 * 히어로 섹션, 스토리텔링 페이지에 적합합니다.
 *
 * Provides a text reveal effect based on scroll position.
 * Perfect for hero sections and storytelling pages.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <TextReveal text="Welcome to the future of design" />
 *
 * @example
 * // 단어별 공개 / Word by word reveal
 * <TextReveal
 *   text="Build amazing products with our platform"
 *   byWord
 *   revealColor="#3b82f6"
 * />
 */
const TextReveal = React.forwardRef<HTMLDivElement, TextRevealProps>(
  (
    {
      text,
      className,
      revealColor = "currentColor",
      hiddenColor = "rgba(128, 128, 128, 0.3)",
      threshold = 0.5,
      byWord = false,
      byChar = false,
      style,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);

    // Check for reduced motion preference
    const prefersReducedMotion = useReducedMotion();

    const updateProgress = useCallback(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate progress based on element position
      const start = windowHeight * (1 - threshold);
      const end = windowHeight * threshold;
      const elementCenter = rect.top + rect.height / 2;

      let newProgress = 0;
      if (elementCenter <= start && elementCenter >= end) {
        newProgress = (start - elementCenter) / (start - end);
      } else if (elementCenter < end) {
        newProgress = 1;
      }

      setProgress(Math.max(0, Math.min(1, newProgress)));
    }, [threshold]);

    useEffect(() => {
      if (prefersReducedMotion) {
        setProgress(1);
        return;
      }

      updateProgress();

      const handleScroll = () => {
        requestAnimationFrame(updateProgress);
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }, [updateProgress, prefersReducedMotion]);

    // Split text based on mode
    const renderText = () => {
      if (byChar) {
        const chars = text.split("");
        return chars.map((char, index) => {
          const charProgress = progress * chars.length;
          const isRevealed = index < charProgress;
          return (
            <span
              key={index}
              style={{
                color: isRevealed ? revealColor : hiddenColor,
                transition: "color 0.1s ease-out",
              }}
            >
              {char}
            </span>
          );
        });
      }

      if (byWord) {
        const words = text.split(" ");
        return words.map((word, index) => {
          const wordProgress = progress * words.length;
          const isRevealed = index < wordProgress;
          return (
            <span key={index}>
              <span
                style={{
                  color: isRevealed ? revealColor : hiddenColor,
                  transition: "color 0.15s ease-out",
                }}
              >
                {word}
              </span>
              {index < words.length - 1 && " "}
            </span>
          );
        });
      }

      // Default: gradient mask reveal
      return (
        <span
          style={{
            background: `linear-gradient(90deg, ${revealColor} ${progress * 100}%, ${hiddenColor} ${progress * 100}%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            transition: "background 0.1s ease-out",
          }}
        >
          {text}
        </span>
      );
    };

    return (
      <div
        ref={mergeRefs(ref, containerRef)}
        className={merge("font-medium", className)}
        style={style}
        {...props}
      >
        {renderText()}
      </div>
    );
  }
);

TextReveal.displayName = "TextReveal";

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

export { TextReveal };
