"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { merge } from "../../lib/utils";

export interface DotNavItem {
  /** 섹션 ID (scroll target) */
  id: string;
  /** 라벨 (호버 시 표시) */
  label?: string;
}

export interface DotNavProps extends React.HTMLAttributes<HTMLElement> {
  /** 섹션 목록 */
  items: DotNavItem[];
  /** 위치 @default 'right' */
  position?: "left" | "right";
  /** 활성 색상 @default 'bg-primary' */
  activeColor?: string;
  /** 비활성 색상 @default 'bg-muted-foreground/30' */
  inactiveColor?: string;
}

/**
 * DotNav - 섹션 도트 네비게이터
 *
 * 포트폴리오/immersive 테마용 고정 위치 네비게이션.
 * 스크롤 위치에 따라 활성 섹션 자동 추적.
 */
const DotNav = React.forwardRef<HTMLElement, DotNavProps>(
  (
    {
      items,
      position = "right",
      activeColor = "bg-primary",
      inactiveColor = "bg-muted-foreground/30",
      className,
      ...props
    },
    ref
  ) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const updateActive = useCallback(() => {
      const vh = window.innerHeight;
      let closest = 0;
      let closestDist = Infinity;

      items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dist = Math.abs(rect.top - vh * 0.3);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });

      setActiveIndex(closest);
    }, [items]);

    useEffect(() => {
      updateActive();
      window.addEventListener("scroll", updateActive, { passive: true });
      return () => window.removeEventListener("scroll", updateActive);
    }, [updateActive]);

    const handleClick = useCallback(
      (id: string) => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      },
      []
    );

    const positionClass = useMemo(
      () => (position === "left" ? "left-4" : "right-4"),
      [position]
    );

    return (
      <nav
        ref={ref}
        className={merge(
          "fixed top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3",
          positionClass,
          className
        )}
        aria-label="Section navigation"
        {...props}
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={merge(
              "group relative w-3 h-3 rounded-full transition-all duration-300",
              i === activeIndex
                ? `${activeColor} scale-125`
                : `${inactiveColor} hover:scale-110`
            )}
            aria-label={item.label || item.id}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            {item.label && (
              <span
                className={merge(
                  "absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-1 text-xs rounded bg-popover text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none",
                  position === "right" ? "right-full mr-2" : "left-full ml-2"
                )}
              >
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>
    );
  }
);

DotNav.displayName = "DotNav";

export { DotNav };
