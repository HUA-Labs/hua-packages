"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { merge } from "../../lib/utils";

export interface HorizontalScrollProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onProgress'> {
  /** 가로 스크롤 컨텐츠 */
  children: React.ReactNode;
  /** 스크롤 높이 배율 (패널 수 × 이 값 = 총 스크롤 높이) @default 1 */
  heightMultiplier?: number;
  /** 스냅 여부 @default false */
  snap?: boolean;
  /** 진행률 콜백 */
  onProgress?: (progress: number) => void;
}

/**
 * HorizontalScroll - 세로 스크롤을 가로 스크롤로 변환
 *
 * sticky positioning + translateX로 구현.
 * 세로 스크롤 입력을 가로 이동으로 매핑합니다.
 */
const HorizontalScroll = React.forwardRef<HTMLDivElement, HorizontalScrollProps>(
  (
    {
      children,
      heightMultiplier = 1,
      snap = false,
      onProgress,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const outerRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [scrollWidth, setScrollWidth] = useState(0);
    const [progress, setProgress] = useState(0);

    // Measure content width
    useEffect(() => {
      if (!innerRef.current) return;
      const measure = () => {
        if (innerRef.current) {
          setScrollWidth(innerRef.current.scrollWidth - window.innerWidth);
        }
      };
      measure();

      const ro = new ResizeObserver(measure);
      ro.observe(innerRef.current);
      return () => ro.disconnect();
    }, [children]);

    // Track scroll and convert to horizontal
    const handleScroll = useCallback(() => {
      if (!outerRef.current || scrollWidth <= 0) return;

      const rect = outerRef.current.getBoundingClientRect();
      const outerHeight = outerRef.current.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;

      const p = Math.max(0, Math.min(1, scrolled / outerHeight));
      setProgress(p);
      onProgress?.(p);
    }, [scrollWidth, onProgress]);

    useEffect(() => {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const panelCount = React.Children.count(children);
    const totalHeight = `${panelCount * heightMultiplier * 100}vh`;

    return (
      <div
        ref={mergeRefs(ref, outerRef)}
        className={merge("relative", className)}
        style={{ height: totalHeight, ...style }}
        {...props}
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div
            ref={innerRef}
            className={merge(
              "flex h-full will-change-transform",
              snap && "scroll-snap-x"
            )}
            style={{
              transform: `translateX(${-progress * scrollWidth}px)`,
            }}
          >
            {React.Children.map(children, (child, i) => (
              <div
                key={i}
                className={merge(
                  "flex-shrink-0 w-screen h-full",
                  snap && "snap-start"
                )}
              >
                {child}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);

HorizontalScroll.displayName = "HorizontalScroll";

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

export { HorizontalScroll };
