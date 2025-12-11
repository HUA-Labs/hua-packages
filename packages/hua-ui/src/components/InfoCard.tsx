"use client"

import React from "react"
import { merge } from "../lib/utils"
import { Icon } from "./Icon"
import type { IconName } from "../lib/icons"

/**
 * InfoCard 컴포넌트의 props / InfoCard component props
 * @typedef {Object} InfoCardProps
 * @property {string} title - 카드 제목 / Card title
 * @property {IconName} icon - 카드 아이콘 / Card icon
 * @property {"blue" | "purple" | "green" | "orange"} [tone="blue"] - InfoCard 톤 색상 / InfoCard tone color
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface InfoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon: IconName
  tone?: "blue" | "purple" | "green" | "orange"
}

const toneClasses: Record<NonNullable<InfoCardProps["tone"]>, { container: string; icon: string; title: string; body: string }> = {
  blue: {
    container: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700",
    icon: "h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0",
    title: "text-sm font-medium text-blue-900 dark:text-blue-100 mb-2 block",
    body: "text-gray-800 dark:text-gray-200 text-sm leading-relaxed",
  },
  purple: {
    container: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700",
    icon: "h-5 w-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5 flex-shrink-0",
    title: "text-sm font-medium text-purple-900 dark:text-purple-100 mb-2 block",
    body: "text-gray-800 dark:text-gray-200 text-sm leading-relaxed",
  },
  green: {
    container: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700",
    icon: "h-5 w-5 text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0",
    title: "text-sm font-medium text-green-900 dark:text-green-100 mb-2 block",
    body: "text-gray-800 dark:text-gray-200 text-sm leading-relaxed",
  },
  orange: {
    container: "bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-700",
    icon: "h-5 w-5 text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0",
    title: "text-sm font-medium text-orange-900 dark:text-orange-100 mb-2 block",
    body: "text-gray-800 dark:text-gray-200 text-sm leading-relaxed",
  },
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
export const InfoCard = React.forwardRef<HTMLDivElement, InfoCardProps>(({ className, title, icon, tone = "blue", children, ...props }, ref) => {
  const t = toneClasses[tone]
  return (
    <div ref={ref} className={merge(t.container, className)} {...props}>
      <div className="flex items-start mb-2">
        <Icon name={icon} className={t.icon} />
        <div className="flex-1">
          <span className={t.title}>{title}</span>
          <div className={t.body}>{children}</div>
        </div>
      </div>
    </div>
  )
})

InfoCard.displayName = "InfoCard"

export default InfoCard


