"use client";

import React, { useMemo } from "react";
import { merge, Icon, useColorStyles, createVariantStyles, type IconName, type Color } from '@hua-labs/ui';

/**
 * SummaryCard 컴포넌트의 props
 * @typedef {Object} SummaryCardProps
 * @property {string} title - 카드 제목
 * @property {string | number} value - 요약 값
 * @property {string} [subtitle] - 부제목
 * @property {IconName | React.ReactNode} [icon] - 아이콘
 * @property {"blue" | "purple" | "green" | "orange" | "red" | "indigo" | "pink" | "gray"} [color] - 카드 색상
 * @property {"default" | "gradient" | "outline"} [variant="default"] - 카드 스타일 변형
 * @property {string} [href] - 링크 URL
 * @property {() => void} [onClick] - 클릭 핸들러
 * @property {boolean} [loading] - 로딩 상태
 * @property {string | React.ReactNode} [badge] - 배지
 * @property {React.ReactNode} [footer] - 푸터 콘텐츠
 * @property {boolean} [showAction] - 액션 버튼 표시 여부
 * @property {string} [actionLabel] - 액션 버튼 라벨
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface SummaryCardProps extends React.HTMLAttributes<HTMLDivElement> {
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
}

// SummaryCard는 default variant가 특별한 그라데이션을 사용하므로 별도 처리
const defaultVariantGradients: Record<Color, string> = {
  blue: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20",
  purple: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
  green: "bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20",
  orange: "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20",
  red: "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20",
  indigo: "bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20",
  pink: "bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20",
  gray: "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20",
};

const buttonGradients: Record<Color, string> = {
  blue: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
  purple: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
  green: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
  orange: "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700",
  red: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700",
  indigo: "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
  pink: "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700",
  gray: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800",
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
      className,
      ...props
    },
    ref
  ) => {
    // 공통 색상 시스템 사용
    const colorStyles = useColorStyles(color);
    const isGradient = variant === "gradient";
    const isTextWhite = isGradient;

    // Variant 스타일 생성 (default는 특별한 그라데이션 사용)
    const variantClass = useMemo(() => {
      if (variant === "default") {
        return `rounded-xl shadow-lg ${defaultVariantGradients[color]}`;
      } else if (variant === "gradient") {
        return `rounded-xl shadow-xl text-white ${colorStyles.gradient}`;
      } else {
        return `rounded-xl ${colorStyles.outline}`;
      }
    }, [variant, colorStyles, color]);

    const formatValue = (val: string | number): string => {
      if (typeof val === "number") {
        return val.toLocaleString();
      }
      return val;
    };

    const content = (
      <div
        ref={ref}
        className={merge(
          "p-6 flex flex-col min-h-[220px] relative overflow-hidden group hover:shadow-xl transition-all duration-300",
          variantClass,
          className
        )}
        {...props}
      >
        {/* 배경 장식 */}
        {/* 배경 장식 - 정적 클래스 사용 */}
        <div className={merge(
          "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl to-transparent rounded-full -translate-y-16 translate-x-16",
          color === "blue" ? "from-blue-400/10" :
          color === "purple" ? "from-purple-400/10" :
          color === "green" ? "from-green-400/10" :
          color === "orange" ? "from-orange-400/10" :
          color === "red" ? "from-red-400/10" :
          color === "indigo" ? "from-indigo-400/10" :
          color === "pink" ? "from-pink-400/10" :
          "from-gray-400/10"
        )}></div>
        <div className={merge(
          "absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr to-transparent rounded-full translate-y-12 -translate-x-12",
          color === "blue" ? "from-blue-400/10" :
          color === "purple" ? "from-purple-400/10" :
          color === "green" ? "from-green-400/10" :
          color === "orange" ? "from-orange-400/10" :
          color === "red" ? "from-red-400/10" :
          color === "indigo" ? "from-indigo-400/10" :
          color === "pink" ? "from-pink-400/10" :
          "from-gray-400/10"
        )}></div>

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center">
            {icon && (
              <div className={merge(
                "p-2 rounded-lg",
                isGradient ? "bg-white/20" : colorStyles.icon
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
            <span className={merge(
              "text-lg font-semibold ml-3",
              isTextWhite ? "text-white" : "text-gray-900 dark:text-white"
            )}>
              {title}
            </span>
          </div>
          {badge && (
            <div className="text-xs font-medium">
              {typeof badge === "string" ? (
                <span className={merge(
                  "px-2 py-1 rounded-full",
                  isGradient ? "bg-white/20 text-white" : "bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                )}>
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}
        </div>

        {/* 값 */}
        <div className="flex-1 flex flex-col justify-center relative z-10">
          {loading ? (
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
          ) : (
            <>
              <div className={merge(
                "text-3xl font-bold mb-2",
                isTextWhite ? "text-white" : "text-gray-900 dark:text-white"
              )}>
                {formatValue(value)}
              </div>
              {subtitle && (
                <div className={merge(
                  "text-sm mb-4",
                  isTextWhite ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                )}>
                  {subtitle}
                </div>
              )}
            </>
          )}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="relative z-10 mb-4">
            {footer}
          </div>
        )}

        {/* 액션 버튼 */}
        {showAction && (href || onClick) && (
          <div className="relative z-10">
            {href ? (
              <a
                href={href}
                className={merge(
                  "block w-full text-center py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]",
                  buttonGradients[color]
                )}
              >
                {actionLabel}
              </a>
            ) : (
              <button
                onClick={onClick}
                className={merge(
                  "block w-full text-center py-3 rounded-lg font-semibold text-white hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]",
                  buttonGradients[color]
                )}
              >
                {actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    );

    return content;
  }
);

SummaryCard.displayName = "SummaryCard";

