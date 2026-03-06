"use client";

import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

export interface HorizontalScrollProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'onProgress'> {
  /** 가로 스크롤 컨텐츠 */
  children: React.ReactNode;
  /** 스크롤 높이 배율 (패널 수 × 이 값 = 총 스크롤 높이) @default 1 */
  heightMultiplier?: number;
  /** 스냅 여부 @default false */
  snap?: boolean;
  /** 진행률 콜백 */
  onProgress?: (progress: number) => void;
  /** dot 유틸리티 클래스 (outer wrapper에 적용) */
  dot?: string;
  style?: React.CSSProperties;
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
      dot: dotProp,
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

    const outerStyle = useMemo(
      () =>
        mergeStyles(
          { position: "relative", height: totalHeight } as React.CSSProperties,
          resolveDot(dotProp),
          style,
        ),
      [totalHeight, dotProp, style]
    );

    const stickyStyle: React.CSSProperties = {
      position: "sticky",
      top: 0,
      height: "100vh",
      overflow: "hidden",
    };

    const trackStyle: React.CSSProperties = {
      display: "flex",
      height: "100%",
      willChange: "transform",
      transform: `translateX(${-progress * scrollWidth}px)`,
      ...(snap
        ? { scrollSnapType: "x mandatory" }
        : {}),
    };

    const panelStyle: React.CSSProperties = {
      flexShrink: 0,
      width: "100vw",
      height: "100%",
      ...(snap ? { scrollSnapAlign: "start" } : {}),
    };

    return (
      <div
        ref={mergeRefs(ref, outerRef)}
        style={outerStyle}
        {...props}
      >
        <div style={stickyStyle}>
          <div ref={innerRef} style={trackStyle}>
            {React.Children.map(children, (child, i) => (
              <div key={i} style={panelStyle}>
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
