"use client";

import React from "react";
import { mergeStyles, resolveDot } from "../hooks/useDotMap";

/**
 * SectionHeader 컴포넌트의 props / SectionHeader component props
 * @typedef {Object} SectionHeaderProps
 * @property {string} title - 섹션 제목 / Section title
 * @property {string} [description] - 섹션 설명 / Section description
 * @property {React.ReactNode} [action] - 액션 버튼 또는 요소 / Action button or element
 * @extends {Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>}
 */
export interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {
  title: string;
  description?: string;
  action?: React.ReactNode;
  dot?: string;
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
      dot: dotProp,
      style: styleProp,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        style={mergeStyles(
          resolveDot("flex items-center justify-between border-b border-border bg-transparent px-6 py-4 text-foreground"),
          resolveDot(dotProp),
          styleProp
        )}
        {...props}
      >
        <div style={resolveDot("flex-1")}>
          <h3 style={resolveDot("text-base font-semibold text-inherit")}>
            {title}
          </h3>
          {description && (
            <p style={resolveDot("mt-1 text-sm text-muted-foreground")}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <div style={resolveDot("flex-shrink-0 ml-4")}>
            {action}
          </div>
        )}
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";
