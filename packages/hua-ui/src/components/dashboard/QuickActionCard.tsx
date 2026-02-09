"use client";

import React, { useMemo } from "react";
import { merge } from "../../lib/utils";
import { Icon } from "../Icon";
import type { IconName } from "../../lib/icons";
import { useColorStyles } from "../../lib/styles/colors";
import type { Color } from "../../lib/types/common";

/**
 * QuickActionCard 컴포넌트의 props / QuickActionCard component props
 * @typedef {Object} QuickActionCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {string} [description] - 카드 설명 / Card description
 * @property {IconName | React.ReactNode} [icon] - 아이콘 / Icon
 * @property {string} [href] - 링크 URL / Link URL
 * @property {() => void} [onClick] - 클릭 핸들러 / Click handler
 * @property {"gradient" | "outline" | "solid"} [variant="gradient"] - 카드 스타일 변형 / Card style variant
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color="blue"] - 카드 색상 / Card color
 * @property {boolean} [loading] - 로딩 상태 / Loading state
 * @extends {React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement>}
 */
export interface QuickActionCardProps extends React.HTMLAttributes<HTMLAnchorElement | HTMLButtonElement> {
  title: string;
  description?: string;
  icon?: IconName | React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "gradient" | "outline" | "solid";
  color?: Color;
  loading?: boolean;
  /** 우측 상단 뱃지 텍스트 (예: "준비중", "Coming Soon") */
  badge?: string;
}


/**
 * QuickActionCard 컴포넌트 / QuickActionCard component
 * 
 * 빠른 액션을 수행하는 카드 컴포넌트입니다.
 * 링크나 버튼으로 동작하며, 클릭 가능한 액션 카드로 사용됩니다.
 * 
 * Card component for quick actions.
 * Works as a link or button, used as a clickable action card.
 * 
 * @component
 * @example
 * // 링크 카드 / Link card
 * <QuickActionCard
 *   title="새 주문 생성"
 *   description="주문을 빠르게 생성하세요"
 *   icon="plus"
 *   href="/orders/new"
 *   color="blue"
 * />
 * 
 * @example
 * // 버튼 카드 / Button card
 * <QuickActionCard
 *   title="리포트 다운로드"
 *   description="최신 리포트를 다운로드하세요"
 *   icon="download"
 *   onClick={handleDownload}
 *   variant="outline"
 *   color="green"
 * />
 * 
 * @param {QuickActionCardProps} props - QuickActionCard 컴포넌트의 props / QuickActionCard component props
 * @param {React.Ref<HTMLAnchorElement | HTMLButtonElement>} ref - anchor 또는 button 요소 ref / anchor or button element ref
 * @returns {JSX.Element} QuickActionCard 컴포넌트 / QuickActionCard component
 */
export const QuickActionCard = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement,
  QuickActionCardProps
>(
  (
    {
      title,
      description,
      icon,
      href,
      onClick,
      variant = "gradient",
      color = "blue",
      loading = false,
      badge,
      className,
      ...props
    },
    ref
  ) => {
    // 공통 색상 시스템 사용
    const colorStyles = useColorStyles(color);
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient || variant === "solid";

    // Variant 스타일 생성 (QuickActionCard는 gradient, outline, solid만 사용)
    const variantClass = useMemo(() => {
      if (variant === "gradient") {
        // gradient는 공통 시스템 사용
        return `text-white ${colorStyles.gradient}`;
      } else if (variant === "outline") {
        // outline은 공통 시스템 사용
        return colorStyles.outline;
      } else {
        // solid는 별도 처리 (정적 클래스 사용)
        const solidClasses: Record<Color, string> = {
          blue: "text-white bg-primary hover:bg-primary/90",
          purple: "text-white bg-purple-600 hover:bg-purple-700",
          green: "text-white bg-green-600 hover:bg-green-700",
          orange: "text-white bg-orange-600 hover:bg-orange-700",
          red: "text-white bg-red-600 hover:bg-red-700",
          indigo: "text-white bg-indigo-600 hover:bg-indigo-700",
          pink: "text-white bg-pink-600 hover:bg-pink-700",
          gray: "text-white bg-gray-600 hover:bg-gray-700",
          cyan: "text-white bg-cyan-600 hover:bg-cyan-700",
        };
        return solidClasses[color];
      }
    }, [variant, colorStyles, color]);

    const baseClasses = merge(
      "rounded-2xl p-6 transition-all shadow-lg hover:shadow-xl text-center",
      badge && "relative",
      variantClass,
      className
    );

    const content = (
      <>
        {/* 뱃지 */}
        {badge && (
          <span className="absolute top-2 right-2 text-[10px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}

        {/* 아이콘 */}
        {icon && (
          <div className={merge(
            "w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2",
            isGradient || variant === "solid"
              ? "bg-white/20"
              : variant === "outline"
              ? colorStyles.icon
              : ""
          )}>
            {typeof icon === "string" ? (
              <Icon
                name={icon as IconName}
                className={merge(
                  "w-6 h-6",
                  isTextWhite ? "text-white" : ""
                )}
              />
            ) : (
              icon
            )}
          </div>
        )}

        {/* 제목 */}
        <h3 className={merge(
          "text-xl font-semibold mb-1",
          isTextWhite ? "text-white" : ""
        )}>
          {title}
        </h3>

        {/* 설명 */}
        {description && (
          <p className={merge(
            "text-sm",
            isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-300"
          )}>
            {description}
          </p>
        )}

        {loading && (
          <div className="mt-2 h-4 bg-white/20 rounded animate-pulse" />
        )}
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={onClick}
        className={baseClasses}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

QuickActionCard.displayName = "QuickActionCard";

