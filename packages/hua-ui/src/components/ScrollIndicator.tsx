"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "./Button";
import { Icon } from "./Icon";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import type { IconName } from "../lib/icons";

/**
 * ScrollIndicator 컴포넌트의 props / ScrollIndicator component props
 * @typedef {Object} ScrollIndicatorProps
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 추가 인라인 스타일 (inherited) / Additional inline style (inherited)
 * @property {string} [targetId] - 스크롤 대상 요소 ID / Target element ID to scroll to
 * @property {string} [text='Scroll down'] - 표시 텍스트 / Display text
 * @property {IconName} [iconName='arrowDown'] - 아이콘 이름 / Icon name
 * @property {number} [iconSize=20] - 아이콘 크기 / Icon size
 * @property {'bottom-center' | 'bottom-left' | 'bottom-right'} [position='bottom-center'] - 표시 위치 / Display position
 * @property {'default' | 'primary' | 'secondary' | 'outline'} [variant='default'] - ScrollIndicator 스타일 변형 / ScrollIndicator style variant
 * @property {'sm' | 'md' | 'lg'} [size='md'] - ScrollIndicator 크기 / ScrollIndicator size
 * @property {boolean} [animated=true] - 애니메이션 활성화 여부 / Enable animation
 * @property {boolean} [autoHide=true] - 자동 숨김 여부 / Auto hide
 * @property {number} [hideThreshold=100] - 숨김 임계값 (px) / Hide threshold (px)
 */
export interface ScrollIndicatorProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  dot?: string;
  targetId?: string;
  text?: string;
  iconName?: IconName;
  iconSize?: number;
  position?: "bottom-center" | "bottom-left" | "bottom-right";
  variant?: "default" | "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  autoHide?: boolean;
  hideThreshold?: number;
}

/** Position → CSSProperties mapping */
const POSITION_STYLES: Record<string, React.CSSProperties> = {
  "bottom-center": {
    bottom: "32px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  "bottom-left": {
    bottom: "32px",
    left: "32px",
  },
  "bottom-right": {
    bottom: "32px",
    right: "32px",
  },
};

/** Size → fontSize mapping */
const SIZE_STYLES: Record<string, React.CSSProperties> = {
  sm: { fontSize: "0.875rem" },
  md: { fontSize: "1rem" },
  lg: { fontSize: "1.125rem" },
};

/** Variant → color token mapping */
const VARIANT_STYLES: Record<string, React.CSSProperties> = {
  default: { color: "var(--color-muted-foreground)" },
  primary: { color: "var(--color-primary)" },
  secondary: { color: "var(--color-secondary-foreground)" },
  outline: { color: "var(--color-foreground)" },
};

/** Fade-in + slide-up entry animation (replaces animate-in fade-in-0 slide-in-from-bottom-2) */
const ENTRY_ANIMATION: React.CSSProperties = {
  animation: "scrollIndicatorFadeIn 500ms ease both",
};

/**
 * ScrollIndicator 컴포넌트 / ScrollIndicator component
 *
 * 스크롤 가능함을 나타내는 인디케이터 컴포넌트입니다.
 * 클릭 시 지정된 요소로 스크롤하거나 다음 섹션으로 스크롤합니다.
 *
 * Indicator component that shows scrollability.
 * Scrolls to specified element or next section on click.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <ScrollIndicator />
 *
 * @example
 * // 특정 요소로 스크롤 / Scroll to specific element
 * <ScrollIndicator
 *   targetId="section-2"
 *   text="다음 섹션으로"
 *   position="bottom-right"
 * />
 *
 * @param {ScrollIndicatorProps} props - ScrollIndicator 컴포넌트의 props / ScrollIndicator component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} ScrollIndicator 컴포넌트 / ScrollIndicator component
 */
const ScrollIndicator = React.forwardRef<HTMLDivElement, ScrollIndicatorProps>(
  (
    {
      dot: dotProp,
      style,
      targetId,
      text = "Scroll down",
      iconName = "arrowDown",
      iconSize = 20,
      position = "bottom-center",
      variant = "default",
      size = "md",
      animated = true,
      autoHide = true,
      hideThreshold = 100,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (!autoHide) return;

      const handleScroll = () => {
        const scrollTop = window.scrollY;
        setIsVisible(scrollTop < hideThreshold);
      };

      // 초기 실행
      handleScroll();

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }, [autoHide, hideThreshold]);

    const scrollToTarget = () => {
      if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // 기본적으로 다음 섹션으로 스크롤
        const currentSection = ref as React.RefObject<HTMLDivElement>;
        if (currentSection?.current) {
          const nextSection = currentSection.current.nextElementSibling;
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
    };

    const wrapperStyle = useMemo<React.CSSProperties>(
      () =>
        mergeStyles(
          { position: "absolute", zIndex: 10 },
          POSITION_STYLES[position],
          resolveDot(dotProp),
          style,
        ),
      [position, dotProp, style],
    );

    const buttonDotStyle = useMemo<React.CSSProperties>(
      () =>
        mergeStyles(
          {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            ...resolveDot("gap-2"),
            transition: "all 300ms",
          },
          SIZE_STYLES[size],
          VARIANT_STYLES[variant],
          animated ? ENTRY_ANIMATION : undefined,
        ),
      [size, variant, animated],
    );

    if (!isVisible) return null;

    return (
      <>
        {animated && (
          <style>{`
          @keyframes scrollIndicatorFadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        )}
        <div ref={ref} style={wrapperStyle} {...props}>
          <Button
            onClick={scrollToTarget}
            variant="ghost"
            size="sm"
            style={buttonDotStyle}
            aria-label={text}
          >
            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>{text}</span>
            <Icon name={iconName} size={iconSize} bounce={animated} />
          </Button>
        </div>
      </>
    );
  },
);

ScrollIndicator.displayName = "ScrollIndicator";

export { ScrollIndicator };
