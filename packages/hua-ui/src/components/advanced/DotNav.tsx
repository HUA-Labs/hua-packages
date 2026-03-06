"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";

export interface DotNavItem {
  /** 섹션 ID (scroll target) */
  id: string;
  /** 라벨 (호버 시 표시) */
  label?: string;
}

export interface DotNavProps extends Omit<React.HTMLAttributes<HTMLElement>, "className"> {
  /** 섹션 목록 */
  items: DotNavItem[];
  /** 위치 @default 'right' */
  position?: "left" | "right";
  /** 활성 도트 스타일 오버라이드 */
  activeDotStyle?: React.CSSProperties;
  /** 비활성 도트 스타일 오버라이드 */
  inactiveDotStyle?: React.CSSProperties;
  /** dot 유틸리티 스트링 (컨테이너) */
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Static style constants ───────────────────────────────────────────────────

const NAV_BASE_STYLE: React.CSSProperties = {
  position: "fixed",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 40,
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const NAV_POSITION: Record<"left" | "right", React.CSSProperties> = {
  left: { left: "16px" },
  right: { right: "16px" },
};

const DOT_BASE_STYLE: React.CSSProperties = {
  position: "relative",
  width: "12px",
  height: "12px",
  borderRadius: "9999px",
  border: "none",
  cursor: "pointer",
  padding: 0,
  transition: "transform 300ms ease, background-color 300ms ease, opacity 300ms ease",
};

const DOT_ACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-primary, #06b6d4)",
  transform: "scale(1.25)",
};

const DOT_INACTIVE_STYLE: React.CSSProperties = {
  backgroundColor: "var(--color-muted-foreground, #94a3b8)",
  opacity: 0.3,
};

const DOT_INACTIVE_HOVER_STYLE: React.CSSProperties = {
  transform: "scale(1.1)",
  opacity: 0.6,
};

const LABEL_BASE_STYLE: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  whiteSpace: "nowrap",
  padding: "4px 8px",
  fontSize: "12px",
  borderRadius: "4px",
  backgroundColor: "var(--color-popover, #ffffff)",
  color: "var(--color-popover-foreground, #0f172a)",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
  pointerEvents: "none",
  transition: "opacity 200ms ease",
};

// ─── DotButton ────────────────────────────────────────────────────────────────

interface DotButtonProps {
  item: DotNavItem;
  isActive: boolean;
  position: "left" | "right";
  activeDotStyle?: React.CSSProperties;
  inactiveDotStyle?: React.CSSProperties;
  onClick: (id: string) => void;
}

const DotButton = React.memo<DotButtonProps>(
  ({ item, isActive, position, activeDotStyle, inactiveDotStyle, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    const dotStyle = useMemo<React.CSSProperties>(() => {
      if (isActive) {
        return mergeStyles(DOT_BASE_STYLE, DOT_ACTIVE_STYLE, activeDotStyle);
      }
      return mergeStyles(
        DOT_BASE_STYLE,
        DOT_INACTIVE_STYLE,
        isHovered ? DOT_INACTIVE_HOVER_STYLE : undefined,
        inactiveDotStyle,
      );
    }, [isActive, isHovered, activeDotStyle, inactiveDotStyle]);

    const labelStyle = useMemo<React.CSSProperties>(() => {
      const positionOffset: React.CSSProperties =
        position === "right"
          ? { right: "100%", marginRight: "8px" }
          : { left: "100%", marginLeft: "8px" };
      return mergeStyles(LABEL_BASE_STYLE, positionOffset, {
        opacity: isHovered ? 1 : 0,
      });
    }, [position, isHovered]);

    return (
      <button
        style={dotStyle}
        onClick={() => onClick(item.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={item.label || item.id}
        aria-current={isActive ? "true" : undefined}
      >
        {item.label && (
          <span style={labelStyle}>
            {item.label}
          </span>
        )}
      </button>
    );
  }
);
DotButton.displayName = "DotButton";

// ─── DotNav ───────────────────────────────────────────────────────────────────

/**
 * DotNav - 섹션 도트 네비게이터
 *
 * 포트폴리오/immersive 테마용 고정 위치 네비게이션.
 * 스크롤 위치에 따라 활성 섹션 자동 추적.
 *
 * @example
 * <DotNav items={[{ id: 'hero', label: 'Hero' }, { id: 'about', label: 'About' }]} />
 * <DotNav items={sections} position="left" />
 */
const DotNav = React.forwardRef<HTMLElement, DotNavProps>(
  (
    {
      items,
      position = "right",
      activeDotStyle,
      inactiveDotStyle,
      dot: dotProp,
      style,
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

    const handleClick = useCallback((id: string) => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, []);

    const navStyle = useMemo<React.CSSProperties>(
      () => mergeStyles(NAV_BASE_STYLE, NAV_POSITION[position], resolveDot(dotProp), style),
      [position, dotProp, style]
    );

    return (
      <nav
        ref={ref}
        style={navStyle}
        aria-label="Section navigation"
        {...props}
      >
        {items.map((item, i) => (
          <DotButton
            key={item.id}
            item={item}
            isActive={i === activeIndex}
            position={position}
            activeDotStyle={activeDotStyle}
            inactiveDotStyle={inactiveDotStyle}
            onClick={handleClick}
          />
        ))}
      </nav>
    );
  }
);

DotNav.displayName = "DotNav";

export { DotNav };
