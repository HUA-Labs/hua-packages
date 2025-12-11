"use client";

import React from "react";
import { merge } from "../lib/utils";

/**
 * SectionHeader 컴포넌트의 props / SectionHeader component props
 * @typedef {Object} SectionHeaderProps
 * @property {string} title - 섹션 제목 / Section title
 * @property {string} [description] - 섹션 설명 / Section description
 * @property {React.ReactNode} [action] - 액션 버튼 또는 요소 / Action button or element
 * @extends {React.HTMLAttributes<HTMLDivElement>}
 */
export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * SectionHeader 컴포넌트 / SectionHeader component
 * 
 * 섹션의 헤더를 표시하는 컴포넌트입니다.
 * 제목, 설명, 액션 버튼을 포함할 수 있습니다.
 * 
 * Component that displays section header.
 * Can include title, description, and action button.
 * 
 * @component
 * @example
 * // 기본 사용 / Basic usage
 * <SectionHeader title="섹션 제목" />
 * 
 * @example
 * // 설명과 액션 포함 / With description and action
 * <SectionHeader
 *   title="알림"
 *   description="최근 알림 목록"
 *   action={<Button>모두 읽음</Button>}
 * />
 * 
 * @param {SectionHeaderProps} props - SectionHeader 컴포넌트의 props / SectionHeader component props
 * @param {React.Ref<HTMLDivElement>} ref - div 요소 ref / div element ref
 * @returns {JSX.Element} SectionHeader 컴포넌트 / SectionHeader component
 */
export const SectionHeader = React.forwardRef<HTMLDivElement, SectionHeaderProps>(
  (
    {
      title,
      description,
      action,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={merge(
          "flex items-center justify-between border-b border-gray-100 bg-transparent px-6 py-4 text-gray-900 dark:border-slate-800 dark:text-slate-50",
          className
        )}
        {...props}
      >
        <div className="flex-1">
          <h3 className="text-base font-semibold text-inherit">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-4">
            {action}
          </div>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

