"use client";

import React, { useMemo } from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";
import { Icon } from "./Icon";
import type { IconName } from "../lib/icons";

/**
 * InfoCard tone CSS variables — injected once into <head>.
 * Light values are on :root, dark values on .dark (next-themes convention).
 */
const INFO_CARD_STYLE_ID = "hua-info-card-vars";

function ensureInfoCardVars() {
  if (typeof document === "undefined") return;
  if (document.getElementById(INFO_CARD_STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = INFO_CARD_STYLE_ID;
  style.textContent = `
:root {
  --ic-blue-bg: linear-gradient(to right, #eef2ff, #eef2ff);
  --ic-blue-border: #c7d2fe;
  --ic-blue-icon: #4f46e5;
  --ic-blue-title: #1e1b4b;
  --ic-purple-bg: linear-gradient(to right, #f5f3ff, #fdf2f8);
  --ic-purple-border: #d8b4fe;
  --ic-purple-icon: #9333ea;
  --ic-purple-title: #3b0764;
  --ic-green-bg: linear-gradient(to right, #f0fdf4, #ecfdf5);
  --ic-green-border: #bbf7d0;
  --ic-green-icon: #16a34a;
  --ic-green-title: #052e16;
  --ic-orange-bg: linear-gradient(to right, #fff7ed, #fff1f2);
  --ic-orange-border: #fed7aa;
  --ic-orange-icon: #ea580c;
  --ic-orange-title: #431407;
}
.dark {
  --ic-blue-bg: linear-gradient(to right, rgba(67,56,202,0.2), rgba(67,56,202,0.2));
  --ic-blue-border: #4338ca;
  --ic-blue-icon: #818cf8;
  --ic-blue-title: #e0e7ff;
  --ic-purple-bg: linear-gradient(to right, rgba(107,33,168,0.2), rgba(131,24,67,0.2));
  --ic-purple-border: #7e22ce;
  --ic-purple-icon: #c084fc;
  --ic-purple-title: #f3e8ff;
  --ic-green-bg: linear-gradient(to right, rgba(21,128,61,0.2), rgba(6,95,70,0.2));
  --ic-green-border: #15803d;
  --ic-green-icon: #86efac;
  --ic-green-title: #dcfce7;
  --ic-orange-bg: linear-gradient(to right, rgba(194,65,12,0.2), rgba(159,18,57,0.2));
  --ic-orange-border: #c2410c;
  --ic-orange-icon: #fdba74;
  --ic-orange-title: #ffedd5;
}
`;
  document.head.appendChild(style);
}

type Tone = "blue" | "purple" | "green" | "orange";

const TONE_VARS: Record<
  Tone,
  { bg: string; border: string; icon: string; title: string }
> = {
  blue: {
    bg: "var(--ic-blue-bg)",
    border: "var(--ic-blue-border)",
    icon: "var(--ic-blue-icon)",
    title: "var(--ic-blue-title)",
  },
  purple: {
    bg: "var(--ic-purple-bg)",
    border: "var(--ic-purple-border)",
    icon: "var(--ic-purple-icon)",
    title: "var(--ic-purple-title)",
  },
  green: {
    bg: "var(--ic-green-bg)",
    border: "var(--ic-green-border)",
    icon: "var(--ic-green-icon)",
    title: "var(--ic-green-title)",
  },
  orange: {
    bg: "var(--ic-orange-bg)",
    border: "var(--ic-orange-border)",
    icon: "var(--ic-orange-icon)",
    title: "var(--ic-orange-title)",
  },
};

/**
 * InfoCard 컴포넌트의 props / InfoCard component props
 * @typedef {Object} InfoCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {IconName} icon - 카드 아이콘 / Card icon
 * @property {"blue" | "purple" | "green" | "orange"} [tone="blue"] - InfoCard 톤 색상 / InfoCard tone color
 * @property {string} [dot] - dot 스타일 유틸리티 문자열 / Dot style utility string
 * @property {React.CSSProperties} [style] - 인라인 스타일 / Inline style
 */
export interface InfoCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "className"
> {
  title: string;
  icon: IconName;
  tone?: "blue" | "purple" | "green" | "orange";
  dot?: string;
  style?: React.CSSProperties;
}

/**
 * InfoCard 컴포넌트 / InfoCard component
 *
 * 정보를 표시하는 카드 컴포넌트입니다.
 * 아이콘, 제목, 내용을 포함하며, 다양한 톤 색상을 지원합니다.
 *
 * Card component that displays information.
 * Includes icon, title, and content, supports various tone colors.
 *
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <InfoCard
 *   icon="info"
 *   title="정보"
 *   tone="blue"
 * >
 *   이것은 정보 카드입니다.
 * </InfoCard>
 *
 * @example
 * // 다양한 톤 / Various tones
 * <InfoCard icon="check" title="성공" tone="green">
 *   작업이 완료되었습니다.
 * </InfoCard>
 *
 * @param {InfoCardProps} props - InfoCard 컴포넌트의 props / InfoCard component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} InfoCard 컴포넌트 / InfoCard component
 */
export const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(
  (
    { dot: dotProp, style, title, icon, tone = "blue", children, ...props },
    ref,
  ) => {
    const vars = TONE_VARS[tone];

    // Inject CSS variable definitions on first render (client-side only)
    React.useEffect(() => {
      ensureInfoCardVars();
    }, []);

    const containerStyle = useMemo<React.CSSProperties>(
      () =>
        mergeStyles(
          {
            background: vars.bg,
            border: `1px solid ${vars.border}`,
            ...resolveDot("rounded-lg p-4"),
          },
          resolveDot(dotProp),
          style,
        ),
      [vars, dotProp, style],
    );

    const iconStyle = useMemo<React.CSSProperties>(
      () => ({
        height: "1.25rem",
        width: "1.25rem",
        color: vars.icon,
        flexShrink: 0,
        ...resolveDot("mr-3 mt-0.5"),
      }),
      [vars.icon],
    );

    const titleStyle = useMemo<React.CSSProperties>(
      () => ({
        fontSize: "0.875rem",
        fontWeight: 500,
        color: vars.title,
        display: "block",
        ...resolveDot("mb-2"),
      }),
      [vars.title],
    );

    const bodyStyle: React.CSSProperties = {
      color: "var(--color-foreground, inherit)",
      fontSize: "0.875rem",
      lineHeight: "1.625",
    };

    return (
      <div ref={ref} style={containerStyle} {...props}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            ...resolveDot("mb-2"),
          }}
        >
          <span style={iconStyle}>
            <Icon name={icon} dot="h-full w-full" />
          </span>
          <div style={{ flex: 1 }}>
            <span style={titleStyle}>{title}</span>
            <div style={bodyStyle}>{children}</div>
          </div>
        </div>
      </div>
    );
  },
);

InfoCard.displayName = "InfoCard";

export default InfoCard;
