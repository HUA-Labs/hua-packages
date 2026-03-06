"use client";

import React, { useMemo, useState } from "react";
import { mergeStyles, resolveDot } from "../../hooks/useDotMap";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import type { Color } from "../../lib/types/common";

/**
 * SummaryCard 컴포넌트의 props
 * @typedef {Object} SummaryCardProps
 * @property {string} title - 카드 제목
 * @property {string | number} value - 요약 값
 * @property {string} [subtitle] - 부제목
 * @property {IconName | React.ReactNode} [icon] - 아이콘
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray" | "cyan"} [color] - 카드 색상
 * @property {"default" | "gradient" | "outline"} [variant="default"] - 카드 스타일 변형
 * @property {string} [href] - 링크 URL
 * @property {() => void} [onClick] - 클릭 핸들러
 * @property {boolean} [loading] - 로딩 상태
 * @property {string | React.ReactNode} [badge] - 배지
 * @property {React.ReactNode} [footer] - 푸터 콘텐츠
 * @property {boolean} [showAction] - 액션 버튼 표시 여부
 * @property {string} [actionLabel] - 액션 버튼 라벨
 * @property {string} [dot] - dot 스타일 유틸리티 문자열
 * @property {React.CSSProperties} [style] - 인라인 스타일
 */
export interface SummaryCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "className"> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: IconName | React.ReactNode;
  color?: Color;
  variant?: "default" | "gradient" | "outline";
  href?: string;
  onClick?: () => void;
  loading?: boolean;
  badge?: string | React.ReactNode;
  footer?: React.ReactNode;
  showAction?: boolean;
  actionLabel?: string;
  dot?: string;
  style?: React.CSSProperties;
}

// ─── Color token maps ──────────────────────────────────────────────────────────

/** Background gradient for default variant (light theme) */
const DEFAULT_BG_LIGHT: Record<Color, string> = {
  blue:   "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
  purple: "linear-gradient(135deg, #faf5ff 0%, #fce7f3 100%)",
  green:  "linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%)",
  orange: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)",
  red:    "linear-gradient(135deg, #fef2f2 0%, #ffe4e6 100%)",
  indigo: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
  pink:   "linear-gradient(135deg, #fdf2f8 0%, #ffe4e6 100%)",
  gray:   "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
  cyan:   "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
};

/** Background gradient for default variant (dark theme, as rgba overlay) */
const DEFAULT_BG_DARK: Record<Color, string> = {
  blue:   "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.2) 100%)",
  purple: "linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.2) 100%)",
  green:  "linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(16,185,129,0.2) 100%)",
  orange: "linear-gradient(135deg, rgba(249,115,22,0.2) 0%, rgba(245,158,11,0.2) 100%)",
  red:    "linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(244,63,94,0.2) 100%)",
  indigo: "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.2) 100%)",
  pink:   "linear-gradient(135deg, rgba(236,72,153,0.2) 0%, rgba(244,63,94,0.2) 100%)",
  gray:   "linear-gradient(135deg, rgba(107,114,128,0.2) 0%, rgba(31,41,55,0.2) 100%)",
  cyan:   "linear-gradient(135deg, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0.2) 100%)",
};

/** Background gradient for gradient variant */
const GRADIENT_BG: Record<Color, string> = {
  blue:   "linear-gradient(135deg, #06b6d4 0%, #4f46e5 100%)",
  purple: "linear-gradient(135deg, #9333ea 0%, #db2777 100%)",
  green:  "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
  orange: "linear-gradient(135deg, #ea580c 0%, #d97706 100%)",
  red:    "linear-gradient(135deg, #dc2626 0%, #e11d48 100%)",
  indigo: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
  pink:   "linear-gradient(135deg, #db2777 0%, #e11d48 100%)",
  gray:   "linear-gradient(135deg, #4b5563 0%, #374151 100%)",
  cyan:   "linear-gradient(135deg, #0891b2 0%, #0d9488 100%)",
};

/** Border color for outline variant (light) */
const OUTLINE_BORDER_LIGHT: Record<Color, string> = {
  blue:   "#93c5fd",
  purple: "#d8b4fe",
  green:  "#86efac",
  orange: "#fdba74",
  red:    "#fca5a5",
  indigo: "#a5b4fc",
  pink:   "#f9a8d4",
  gray:   "#d1d5db",
  cyan:   "#67e8f9",
};

/** Border color for outline variant (dark) */
const OUTLINE_BORDER_DARK: Record<Color, string> = {
  blue:   "#2563eb",
  purple: "#9333ea",
  green:  "#16a34a",
  orange: "#ea580c",
  red:    "#dc2626",
  indigo: "#4f46e5",
  pink:   "#db2777",
  gray:   "#4b5563",
  cyan:   "#0891b2",
};

/** Icon container background for default/outline variants */
const ICON_BG_LIGHT: Record<Color, string> = {
  blue:   "#dbeafe",
  purple: "#f3e8ff",
  green:  "#dcfce7",
  orange: "#ffedd5",
  red:    "#fee2e2",
  indigo: "#e0e7ff",
  pink:   "#fce7f3",
  gray:   "#f3f4f6",
  cyan:   "#cffafe",
};

/** Button gradient background */
const BUTTON_BG: Record<Color, string> = {
  blue:   "linear-gradient(90deg, #0891b2 0%, #4f46e5 100%)",
  purple: "linear-gradient(90deg, #9333ea 0%, #db2777 100%)",
  green:  "linear-gradient(90deg, #16a34a 0%, #059669 100%)",
  orange: "linear-gradient(90deg, #ea580c 0%, #d97706 100%)",
  red:    "linear-gradient(90deg, #dc2626 0%, #e11d48 100%)",
  indigo: "linear-gradient(90deg, #4f46e5 0%, #0891b2 100%)",
  pink:   "linear-gradient(90deg, #db2777 0%, #e11d48 100%)",
  gray:   "linear-gradient(90deg, #4b5563 0%, #374151 100%)",
  cyan:   "linear-gradient(90deg, #0891b2 0%, #0d9488 100%)",
};

/** Decorative orb accent color (rgba) */
const ACCENT_COLOR: Record<Color, string> = {
  blue:   "rgba(34,211,238,0.1)",
  purple: "rgba(192,132,252,0.1)",
  green:  "rgba(74,222,128,0.1)",
  orange: "rgba(251,146,60,0.1)",
  red:    "rgba(248,113,113,0.1)",
  indigo: "rgba(129,140,248,0.1)",
  pink:   "rgba(244,114,182,0.1)",
  gray:   "rgba(156,163,175,0.1)",
  cyan:   "rgba(34,211,238,0.1)",
};

// ─── Static style objects ──────────────────────────────────────────────────────

const CARD_BASE: React.CSSProperties = {
  padding: "1.5rem",
  display: "flex",
  flexDirection: "column",
  minHeight: "220px",
  position: "relative",
  overflow: "hidden",
  borderRadius: "0.75rem",
  transition: "box-shadow 300ms ease, transform 300ms ease",
};

const HEADER_ROW: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "1rem",
  position: "relative",
  zIndex: 10,
};

const HEADER_LEFT: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const ICON_WRAP_GRADIENT: React.CSSProperties = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  backgroundColor: "rgba(255,255,255,0.2)",
};

const BADGE_WRAP: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
};

const VALUE_WRAP: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  position: "relative",
  zIndex: 10,
};

const FOOTER_WRAP: React.CSSProperties = {
  position: "relative",
  zIndex: 10,
  marginBottom: "1rem",
};

const ACTION_WRAP: React.CSSProperties = {
  position: "relative",
  zIndex: 10,
};

const ACTION_BUTTON_BASE: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "center",
  paddingTop: "0.75rem",
  paddingBottom: "0.75rem",
  borderRadius: "0.5rem",
  fontWeight: 600,
  color: "#ffffff",
  border: "none",
  cursor: "pointer",
  transition: "box-shadow 200ms ease, transform 200ms ease",
  textDecoration: "none",
};

const LOADING_SKELETON: React.CSSProperties = {
  height: "2.5rem",
  backgroundColor: "#e5e7eb",
  borderRadius: "0.25rem",
  marginBottom: "0.5rem",
  // animation not expressible in CSSProperties; handled via className fallback below
};

/**
 * SummaryCard 컴포넌트 / SummaryCard component
 *
 * 요약 정보를 표시하는 카드 컴포넌트입니다.
 * 제목, 값, 부제목, 아이콘을 포함하며, 클릭 가능한 링크나 액션 버튼을 지원합니다.
 *
 * Card component that displays summary information.
 * Includes title, value, subtitle, icon, and supports clickable links or action buttons.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <SummaryCard
 *   title="총 매출"
 *   value="₩10,000,000"
 *   subtitle="이번 달"
 *   icon="dollarSign"
 * />
 *
 * @example
 * // 클릭 가능한 카드 / Clickable card
 * <SummaryCard
 *   title="주문"
 *   value="1,234"
 *   href="/orders"
 *   showAction
 *   actionLabel="자세히 보기"
 *   color="blue"
 *   variant="gradient"
 * />
 *
 * @param {SummaryCardProps} props - SummaryCard 컴포넌트의 props / SummaryCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} SummaryCard 컴포넌트 / SummaryCard component
 */
export const SummaryCard = React.forwardRef<HTMLDivElement, SummaryCardProps>(
  (
    {
      title,
      value,
      subtitle,
      icon,
      color = "blue",
      variant = "default",
      href,
      onClick,
      loading = false,
      badge,
      footer,
      showAction = true,
      actionLabel = "자세히 보기",
      dot: dotProp,
      style,
      ...props
    },
    ref
  ) => {
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [isActionHovered, setIsActionHovered] = useState(false);

    const isGradient = variant === "gradient";
    const isTextWhite = isGradient;

    // ── Card container style ─────────────────────────────────────────────────
    const cardStyle = useMemo((): React.CSSProperties => {
      let base: React.CSSProperties = { ...CARD_BASE };

      if (variant === "default") {
        // Using light gradient; dark mode handled via CSS variable fallback isn't
        // feasible without className — we pick the light token as default, acceptable
        // since the design system consumer can override via `style` prop.
        base = {
          ...base,
          background: DEFAULT_BG_LIGHT[color],
          boxShadow: isCardHovered
            ? "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"
            : "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        };
      } else if (variant === "gradient") {
        base = {
          ...base,
          background: GRADIENT_BG[color],
          boxShadow: isCardHovered
            ? "0 25px 50px -12px rgba(0,0,0,0.25)"
            : "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
        };
      } else {
        // outline
        base = {
          ...base,
          background: "transparent",
          border: `2px solid ${OUTLINE_BORDER_LIGHT[color]}`,
          boxShadow: isCardHovered
            ? "0 10px 15px -3px rgba(0,0,0,0.1)"
            : "none",
        };
      }

      return mergeStyles(base, resolveDot(dotProp), style);
    }, [variant, color, isCardHovered, dotProp, style]);

    // ── Icon container style ─────────────────────────────────────────────────
    const iconWrapStyle = useMemo((): React.CSSProperties => {
      if (isGradient) return ICON_WRAP_GRADIENT;
      return {
        padding: "0.5rem",
        borderRadius: "0.5rem",
        backgroundColor: ICON_BG_LIGHT[color],
      };
    }, [isGradient, color]);

    // ── Title style ──────────────────────────────────────────────────────────
    const titleStyle = useMemo((): React.CSSProperties => ({
      fontSize: "1.125rem",
      fontWeight: 600,
      marginLeft: "0.75rem",
      color: isTextWhite ? "#ffffff" : undefined,
    }), [isTextWhite]);

    // ── Badge pill style ─────────────────────────────────────────────────────
    const badgePillStyle = useMemo((): React.CSSProperties => {
      if (isGradient) {
        return {
          padding: "0.25rem 0.5rem",
          borderRadius: "9999px",
          backgroundColor: "rgba(255,255,255,0.2)",
          color: "#ffffff",
        };
      }
      return {
        padding: "0.25rem 0.5rem",
        borderRadius: "9999px",
        backgroundColor: "rgba(255,255,255,0.5)",
        color: "#374151",
      };
    }, [isGradient]);

    // ── Value style ──────────────────────────────────────────────────────────
    const valueStyle = useMemo((): React.CSSProperties => ({
      fontSize: "1.875rem",
      fontWeight: 700,
      marginBottom: "0.5rem",
      color: isTextWhite ? "#ffffff" : undefined,
    }), [isTextWhite]);

    // ── Subtitle style ───────────────────────────────────────────────────────
    const subtitleStyle = useMemo((): React.CSSProperties => ({
      fontSize: "0.875rem",
      marginBottom: "1rem",
      color: isTextWhite ? "rgba(255,255,255,0.9)" : "#4b5563",
    }), [isTextWhite]);

    // ── Action button style ──────────────────────────────────────────────────
    const actionStyle = useMemo((): React.CSSProperties => ({
      ...ACTION_BUTTON_BASE,
      background: BUTTON_BG[color],
      boxShadow: isActionHovered
        ? "0 10px 15px -3px rgba(0,0,0,0.2)"
        : "none",
      transform: isCardHovered && isActionHovered ? "scale(1.02)" : "scale(1)",
    }), [color, isActionHovered, isCardHovered]);

    // ── Decorative orb styles ────────────────────────────────────────────────
    const orbTopRight: React.CSSProperties = {
      position: "absolute",
      top: 0,
      right: 0,
      width: "8rem",
      height: "8rem",
      borderRadius: "9999px",
      background: `radial-gradient(circle, ${ACCENT_COLOR[color]} 0%, transparent 70%)`,
      transform: "translate(4rem, -4rem)",
      pointerEvents: "none",
    };

    const orbBottomLeft: React.CSSProperties = {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: "6rem",
      height: "6rem",
      borderRadius: "9999px",
      background: `radial-gradient(circle, ${ACCENT_COLOR[color]} 0%, transparent 70%)`,
      transform: "translate(-3rem, 3rem)",
      pointerEvents: "none",
    };

    const formatValue = (val: string | number): string =>
      typeof val === "number" ? val.toLocaleString() : val;

    return (
      <div
        ref={ref}
        style={cardStyle}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        {...props}
      >
        {/* Decorative orbs */}
        <div style={orbTopRight} />
        <div style={orbBottomLeft} />

        {/* Header */}
        <div style={HEADER_ROW}>
          <div style={HEADER_LEFT}>
            {icon && (
              <div style={iconWrapStyle}>
                {typeof icon === "string" ? (
                  <Icon
                    name={icon as IconName}
                    size={24}
                    dot={isTextWhite ? "text-white" : undefined}
                  />
                ) : (
                  icon
                )}
              </div>
            )}
            <span style={titleStyle}>{title}</span>
          </div>
          {badge && (
            <div style={BADGE_WRAP}>
              {typeof badge === "string" ? (
                <span style={badgePillStyle}>{badge}</span>
              ) : (
                badge
              )}
            </div>
          )}
        </div>

        {/* Value area */}
        <div style={VALUE_WRAP}>
          {loading ? (
            <div
              style={{
                ...LOADING_SKELETON,
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
          ) : (
            <>
              <div style={valueStyle}>{formatValue(value)}</div>
              {subtitle && (
                <div style={subtitleStyle}>{subtitle}</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {footer && <div style={FOOTER_WRAP}>{footer}</div>}

        {/* Action button */}
        {showAction && (href || onClick) && (
          <div style={ACTION_WRAP}>
            {href ? (
              <a
                href={href}
                style={actionStyle}
                onMouseEnter={() => setIsActionHovered(true)}
                onMouseLeave={() => setIsActionHovered(false)}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                type="button"
                onClick={onClick}
                style={actionStyle}
                onMouseEnter={() => setIsActionHovered(true)}
                onMouseLeave={() => setIsActionHovered(false)}
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

SummaryCard.displayName = "SummaryCard";
